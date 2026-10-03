# sutra_engine

Backend API for "Sutra Hub", a service for managing AI-generated game worlds (the package is named `sutra-engine-core`). A user registers, logs in, and creates a "world seed" (name, theme, engine version, PCG seed). Creating a world queues a background job that fills in the world's content and metadata.

The generation step is a stub. The worker sleeps for 20 seconds and writes hardcoded fake quests, characters, assets and metrics. No LLM is called anywhere in the code, even though the fake metrics row records a model name.

The repo was built over three days (2025-11-08 to 2025-11-10, 41 commits).

## Stack

- Node 22 (Dockerfile uses `node:22-alpine`), Express 5, CommonJS
- PostgreSQL through Sequelize: users, worlds, assets, sessions, metrics
- MongoDB through Mongoose: the generated content document per world
- Redis + BullMQ: the `world-generation` queue and its worker
- JWT (`jsonwebtoken`) with `bcryptjs` for password hashes
- Scalar (`@scalar/express-api-reference`) for the API docs page

## Getting started

### Environment variables

The app reads these (names only, set them yourself):

| Variable | Used for |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Required, the process exits without it. SSL is forced on with `rejectUnauthorized: false`. |
| `REDIS_URL` | Redis connection for BullMQ. Required. |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Signing and verifying tokens. |
| `PORT` | HTTP port. Falls back to `10000`. |

`config/db.js` calls `dotenv.config()`, so a `.env` file in the project root works.

The committed `.env` does not match what the code reads. It defines `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `MONGO_URI`, `JWT_SECRET` and `REDIS_URL`, but no `DATABASE_URL`. The `DB_*` variables are not read by any code (they are left over from an earlier MySQL setup).

### Running

The npm scripts all wrap `docker compose`:

```
npm start             # docker compose up --build
npm run start:detached
npm run stop
npm run logs          # docker compose logs -f api
npm run seed          # docker compose exec api node seeders/seed.js
```

There is no `docker-compose.yml` in the repo (it was removed in a "single-container deploy for Render" commit, and `.dockerignore` excludes `docker-compose*`), so these scripts do nothing useful as is. Without compose:

```
npm install
# set DATABASE_URL, REDIS_URL, MONGO_URI, JWT_SECRET
node app.js
```

Or build the image directly. The Dockerfile installs production dependencies and runs `node app.js`. It declares `EXPOSE 5001`, but the app listens on `PORT` or 10000, so set `PORT=5001` or map the port accordingly.

Note that `npm install` is mostly redundant here since `node_modules` is committed.

### Database setup

There are no migrations. On startup `app.js` runs `sequelize.sync({ alter: true })`, which creates and alters the Postgres tables to match the models. MongoDB needs nothing beyond a reachable URI.

`init.sql` is a MySQL script that creates a `root@%` user with a hardcoded password. It is a leftover from the MySQL setup and has no effect on the current Postgres-based code.

### Seeding

`seeders/seed.js` does not work in its current state. It imports `db` and `connectMySQLWithRetry` from `config/db.js`, which exports neither (only `sequelize`, `connectMongo`, `queue`, `redisConnection`), and it creates a user with a `username` field that the user model does not have. It also wipes users, worlds and world content before inserting. `worlds.json` is a static dump of three example worlds and is not read by any code.

## Project structure

```
app.js                    entry point: DB sync, Mongo connect, routes, worker, Scalar docs
config/db.js              Sequelize (Postgres), Mongoose connect, Redis connection, BullMQ queue
models/                   Sequelize models (user, world, gameSession, generationMetric, worldAsset)
                          and the Mongoose model worldContent; index.js wires associations
routes/auth.js            /api/auth
routes/world.js           /api/worlds
controllers/              auth.controller.js, world.controller.js
middleware/authJwt.js     verifyToken (Bearer JWT)
jobs/worldGeneration.job.js   BullMQ worker, also exports the queue
events/worldEvents.js     an eventemitter3 instance
seeders/seed.js           seed script (broken, see above)
raw_nuke.js               standalone table-dropping script
swagger.yaml              partial OpenAPI file (not served)
```

## API

The API docs page is served at `/api-docs` (Scalar). It is generated from an object defined inline in `app.js`, not from `swagger.yaml`. That YAML file only covers register and login and is not loaded anywhere; the old commented-out spec drafts are still in `app.js`. The spec lists `https://sutra-engine.onrender.com` as its server URL; whether that is live is not something the repo shows.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/` | no | Returns `Sutra Engine Core is online` |
| POST | `/api/auth/register` | no | `email`, `password`, optional `name`. Returns `201` with `userId`. |
| POST | `/api/auth/login` | no | Returns `{ accessToken }`, valid 24h. |
| POST | `/api/worlds` | yes | `name`, `theme`, optional `engine_version` (default `Unreal Engine 5.4`) and `pcg_seed` (default random). Creates the world with status `Queued` and enqueues generation. |
| GET | `/api/worlds` | yes | Worlds owned by the caller, newest first. |
| GET | `/api/worlds/:id` | yes | One owned world. |
| GET | `/api/worlds/:id/content` | yes | Generated content from MongoDB for an owned world. |
| PUT | `/api/worlds/:id` | yes | Updates name, theme, status, engine_version, pcg_seed. Fields not sent keep their current value. |
| PATCH | `/api/worlds/:id` | yes | Updates whatever is in the body. |
| DELETE | `/api/worlds/:id` | yes | Deletes the Mongo content, then the Postgres row. Returns `204`. |

Protected routes expect `Authorization: Bearer <token>`.

## How it works

Auth: registration hashes the password with bcryptjs (10 rounds) and stores the user. Login looks the user up by email, compares the hash and signs `{ id }` with `JWT_SECRET`. `verifyToken` checks the header and signature and sets `req.userId`. Every world query filters on `userId`, so users only see their own worlds. A missing header returns `403`, a bad token returns `401`.

Data model, Postgres (all primary keys are UUIDs, all tables have timestamps):

- `users`: email (unique), password, name
- `worlds`: name, theme, status (string, default `Queued`), engine_version, pcg_seed, userId
- `world_assets`: worldId, asset_type, asset_url, file_size_kb, generated_at
- `generation_metrics`: worldId, gen_time_ms, tokens_used, cost_usd, model_used, assets_generated
- `game_sessions`: worldId, userId, session_token (unique), play_time_ms, score

Foreign keys to `worlds` cascade on delete. `game_sessions` is defined but no route or job writes to it besides the seeder.

MongoDB holds one `WorldContent` document per world: `worldId` (string, unique) and a free-form `generatedContent` object.

Generation flow: `POST /api/worlds` creates the row, adds a `generate-world` job to the `world-generation` queue and emits a `WorldGenerationRequested` event. The worker (started inside the same process as the API, via `require` in `app.js`) sets the status to `Generating`, waits 20 seconds, then writes the fake content to Mongo, two fake asset rows and one metrics row to Postgres, and sets the status to `Active`. On error it sets `Failed` and rethrows. Nothing listens to the `WorldGenerationRequested` event, so the event bus is currently unused.

### raw_nuke.js

A standalone script, not referenced from `package.json` or the app. It connects to the Postgres database in `DATABASE_URL` (SSL on, certificate verification off) and runs `DROP TABLE IF EXISTS ... CASCADE` on `users`, `worlds`, `game_sessions`, `generation_metrics` and `world_assets`. It was added in the commits around the "clean DB sync" fixes while the schema was being reset on Render. Running it against a database deletes all of that data. Because of the `process.exit(0)` in its `finally` block, it exits with code 0 even when the drop fails.

## Known gaps

Security and hygiene:

- `.env` is committed, even though `.gitignore` lists it. The secrets in it are `DB_PASSWORD` and `JWT_SECRET`. `MONGO_URI` and `REDIS_URL` point at docker-compose hostnames without credentials. The credentials and the JWT secret should be treated as exposed and rotated, and the file removed from the repository and its history.
- `init.sql` contains a hardcoded database root password and is committed.
- `node_modules` is committed (about 7,870 of the ~7,900 tracked files). The first line of `.gitignore` is `node_modules .env` on a single line, which matches nothing, so `node_modules` is not actually ignored. It should be split into two lines.
- `scalar.exe` is a 9-byte text file containing the words `Not Found`, not an executable. It looks like a failed download that was saved with an `.exe` name. It can be deleted.
- CORS is open to all origins, and there is no rate limiting or input validation anywhere.
- `PATCH /api/worlds/:id` passes `req.body` straight to `world.update`, so a caller can change fields such as `userId`, and PUT/PATCH can set `status` to any string.
- Register does not validate email or password and returns a `500` with the raw error message on duplicates or missing fields. Login returns different errors for unknown user (`404`) and wrong password (`401`). Other controllers also return raw `error.message` to clients.
- Tokens are not checked against the users table, so a deleted user's token stays valid until it expires.
- TLS certificate verification is disabled for Postgres.

Code and docs:

- `package.json` scripts depend on a missing `docker-compose.yml`.
- Seeder is broken (see above). `raw_nuke.js` and `config/db.js` read `DATABASE_URL`, which is not in `.env`.
- Unused dependencies: `mysql2`, `yamljs`, `swagger-ui-express`, `uuid`, and the `nodemo` dev dependency. No `dev` script uses nodemon.
- `app.js` is mostly an inline OpenAPI object plus about 200 lines of commented-out earlier drafts of it. The `swagger.yaml` file is out of sync with the served spec.
- The world controller's delete comment mentions MySQL, but the database is Postgres.
- No tests.
- No license file (`package.json` says ISC).
