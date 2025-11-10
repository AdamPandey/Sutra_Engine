// app.js
const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db');
const { apiReference } = require('@scalar/express-api-reference');

// --- THE FINAL, FEATURE-COMPLETE SWAGGER/OPENAPI DOCUMENT ---
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'Sutra Engine Core API', description: 'Comprehensive API for managing AI-generated game worlds, titles, and related assets for Krida Studios.', version: '1.0.0' },
  servers: [{ url: 'https://sutra-engine.onrender.com', description: 'Production Server' }],
  tags: [
    { name: 'Index', description: 'The root health-check endpoint.' },
    { name: 'Authentication', description: 'User registration and login.' },
    { name: 'Games', description: 'Manage your game titles (e.g., "Hustle Jack").' },
    { name: 'Worlds', description: 'Manage the generative "World Seeds" for each game.' },
    { name: 'World Content', description: 'Retrieve AI-generated content from MongoDB.' },
    { name: 'Genres', description: 'Manage the available game genres.' },
    { name: 'Platforms', description: 'Manage the supported game platforms.' },
    { name: 'Diagnostics', description: 'Manage system logs and events.' }
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/': { get: { summary: 'API Health Check', tags: ['Index'], responses: { '200': { description: 'API is online.' } } } },
    '/api/auth/register': { post: { summary: 'Register a new user', tags: ['Authentication'], responses: { '201': { description: 'User created.' } } } },
    '/api/auth/login': { post: { summary: 'Log in a user', tags: ['Authentication'], responses: { '200': { description: 'Login successful.' } } } },
    '/api/games': {
      get: { summary: 'Get all games for a user', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'List of games.' } } },
      post: { summary: 'Create a new game', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Game created.' } } }
    },
    '/api/games/{id}': {
      get: { summary: 'Get a single game by ID', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Single game.' } } },
      patch: { summary: 'Update a game (partial)', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Game updated.' } } },
      delete: { summary: 'Delete a game by ID', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Game deleted.' } } }
    },
    '/api/worlds': {
      get: { summary: 'Get all worlds for a user', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'List of worlds.' } } },
      post: { summary: 'Create a new world', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'World creation initiated.' } } }
    },
    '/api/worlds/{id}': {
      get: { summary: 'Get a single world by ID', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Single world.' } } },
      patch: { summary: 'Update a world (partial)', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'World updated.' } } },
      delete: { summary: 'Delete a world by ID', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'World deleted.' } } }
    },
    '/api/worlds/{id}/content': {
      get: { summary: 'Get Generated AI Content for a World (MongoDB)', tags: ['World Content'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Generated content.' } } }
    },
    '/api/genres': {
      get: { summary: 'Get all genres', tags: ['Genres'], responses: { '200': { description: 'List of genres.' } } },
      post: { summary: 'Create a new genre', tags: ['Genres'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Genre created.' } } }
    },
    '/api/genres/{id}': {
      get: { summary: 'Get a single genre by ID', tags: ['Genres'], responses: { '200': { description: 'Single genre.' } } },
      patch: { summary: 'Update a genre', tags: ['Genres'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Genre updated.' } } },
      delete: { summary: 'Delete a genre', tags: ['Genres'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Genre deleted.' } } }
    },
    '/api/platforms': {
      get: { summary: 'Get all platforms', tags: ['Platforms'], responses: { '200': { description: 'List of platforms.' } } },
      post: { summary: 'Create a new platform', tags: ['Platforms'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Platform created.' } } }
    },
    '/api/platforms/{id}': {
      get: { summary: 'Get a single platform by ID', tags: ['Platforms'], responses: { '200': { description: 'Single platform.' } } },
      patch: { summary: 'Update a platform', tags: ['Platforms'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Platform updated.' } } },
      delete: { summary: 'Delete a platform', tags: ['Platforms'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Platform deleted.' } } }
    },
    '/api/diagnostics': {
      get: { summary: 'Get all diagnostic logs', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'List of logs.' } } },
      post: { summary: 'Create a new diagnostic log', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Log created.' } } }
    },
    '/api/diagnostics/{id}': {
      get: { summary: 'Get a single diagnostic by ID', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Single log.' } } },
      delete: { summary: 'Delete a diagnostic', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Log deleted.' } } }
    }
  }
};

require('./models');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api-docs', apiReference({ spec: { content: swaggerDocument } }));

async function initialize() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('PostgreSQL connection successful.');

    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    await connectMongo();

    console.log('Initializing routes...');
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/worlds', require('./routes/world'));
    app.use('/api/games', require('./routes/game.routes.js'));
    app.use('/api/genres', require('./routes/genre.routes.js'));
    app.use('/api/platforms', require('./routes/platform.routes.js'));
    app.use('/api/diagnostics', require('./routes/diagnostic.routes.js'));
    console.log('Routes initialized.');

    console.log('Starting background worker...');
    require('./jobs/worldGeneration.job');
    console.log('Worker started.');

    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}. Application is ready.`);
    });
  } catch (err) {
    console.error('APPLICATION FAILED TO START:', err);
    process.exit(1);
  }
}
app.get('/', (req, res) => {
  res.send('Sutra Engine Core is online');
});
initialize();