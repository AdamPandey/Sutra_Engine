// app.js
const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db');
const { apiReference } = require('@scalar/express-api-reference');

// --- THE FINAL, FEATURE-COMPLETE SWAGGER/OPENAPI DOCUMENT ---
// --- THIS IS THE FINAL, FULLY-DESCRIBED SWAGGER/OPENAPI DOCUMENT ---
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sutra Engine Core API',
    description: 'Comprehensive API for managing AI-generated game worlds, titles, and related assets for Krida Studios. This documentation provides a clear and interactive guide to all available endpoints, models, and their relationships.',
    version: '1.0.0',
  },
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
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Enter your JWT in the format: Bearer {token}' } },
    schemas: {
      Game: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Hustle Jack' },
          description: { type: 'string', example: 'An escape-room puzzle adventure.' },
          version: { type: 'string', example: '0.1.0' },
          status: { type: 'string', example: 'In Development' },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      World: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Neo-Kyoto' },
          theme: { type: 'string', example: 'Cyberpunk' },
          description: { type: 'string', nullable: true },
          thumbnailUrl: { type: 'string', format: 'uri', nullable: true },
          status: { type: 'string', enum: ['Queued', 'Generating', 'Active', 'Failed'] },
          gameId: { type: 'string', format: 'uuid', nullable: true },
          userId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      WorldContent: {
        type: 'object',
        properties: {
          quests: { type: 'array', items: { type: 'object' }, example: [{ "id": "q1", "name": "Retrieve the Data Shard" }] },
          characters: { type: 'array', items: { type: 'object' }, example: [{ "id": "char1", "name": "Kaito" }] },
          puzzles: { type: 'array', items: { type: 'object' }, example: [{ "id": "puz1", "type": "Circuit Breaker" }] },
        }
      },
      Genre: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Puzzle Adventure' }
        }
      },
      Platform: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Android' }
        }
      },
      Diagnostic: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          eventType: { type: 'string', example: 'GENERATION_SUCCESS' },
          logMessage: { type: 'string', example: 'World 51ca82b4 generated successfully.' },
          worldId: { type: 'string', format: 'uuid', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  },
  paths: {
    '/': { get: { summary: 'API Health Check', tags: ['Index'], responses: { '200': { description: 'API is online.' } } } },
    '/api/auth/register': { post: { summary: 'Register a new user', tags: ['Authentication'], responses: { '201': { description: 'User created.', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, userId: { type: 'string', format: 'uuid' } } } } } } } } },
    '/api/auth/login': { post: { summary: 'Log in a user', tags: ['Authentication'], responses: { '200': { description: 'Login successful.', content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } } } } } },
    '/api/games': {
      get: { summary: 'Get all games for a user', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'List of games.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Game' } } } } } } },
      post: { summary: 'Create a new game', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Game created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Game' } } } } } }
    },
    '/api/games/{id}': {
      get: { summary: 'Get a single game by ID', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Single game.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Game' } } } } } },
      patch: { summary: 'Update a game (partial)', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Game updated.', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' } } } } } } } },
      delete: { summary: 'Delete a game by ID', tags: ['Games'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Game deleted. No body returned.' } } }
    },
    '/api/worlds': {
      get: { summary: 'Get all worlds for a user', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'List of worlds.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/World' } } } } } } },
      post: { summary: 'Create a new world', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'World creation initiated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/World' } } } } } }
    },
    '/api/worlds/{id}': {
      get: { summary: 'Get a single world by ID', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Single world.', content: { 'application/json': { schema: { $ref: '#/components/schemas/World' } } } } } },
      patch: { summary: 'Update a world (partial)', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'World updated.' } } },
      delete: { summary: 'Delete a world by ID', tags: ['Worlds'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'World deleted. No body returned.' } } }
    },
    '/api/worlds/{id}/content': {
      get: { summary: 'Get Generated AI Content for a World (MongoDB)', tags: ['World Content'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Generated content.', content: { 'application/json': { schema: { $ref: '#/components/schemas/WorldContent' } } } } } }
    },
    '/api/genres': {
      get: { summary: 'Get all genres', tags: ['Genres'], responses: { '200': { description: 'List of genres.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Genre' } } } } } } },
      post: { summary: 'Create a new genre', tags: ['Genres'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Genre created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Genre' } } } } } }
    },
    '/api/genres/{id}': {
      get: { summary: 'Get a single genre by ID', tags: ['Genres'], responses: { '200': { description: 'Single genre.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Genre' } } } } } },
      patch: { summary: 'Update a genre', tags: ['Genres'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Genre updated.' } } },
      delete: { summary: 'Delete a genre', tags: ['Genres'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Genre deleted. No body returned.' } } }
    },
    '/api/platforms': {
      get: { summary: 'Get all platforms', tags: ['Platforms'], responses: { '200': { description: 'List of platforms.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Platform' } } } } } } },
      post: { summary: 'Create a new platform', tags: ['Platforms'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Platform created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Platform' } } } } } }
    },
    '/api/platforms/{id}': {
      get: { summary: 'Get a single platform by ID', tags: ['Platforms'], responses: { '200': { description: 'Single platform.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Platform' } } } } } },
      patch: { summary: 'Update a platform', tags: ['Platforms'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Platform updated.' } } },
      delete: { summary: 'Delete a platform', tags: ['Platforms'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Platform deleted. No body returned.' } } }
    },
    '/api/diagnostics': {
      get: { summary: 'Get all diagnostic logs', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'List of logs.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Diagnostic' } } } } } } },
      post: { summary: 'Create a new diagnostic log', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '201': { description: 'Log created.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Diagnostic' } } } } } }
    },
    '/api/diagnostics/{id}': {
      get: { summary: 'Get a single diagnostic by ID', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '200': { description: 'Single log.', content: { 'application/json': { schema: { $ref: '#/components/schemas/Diagnostic' } } } } } },
      delete: { summary: 'Delete a diagnostic', tags: ['Diagnostics'], security: [{ bearerAuth: [] }], responses: { '204': { description: 'Log deleted. No body returned.' } } }
    }
  }
};

require('./models');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// THIS IS THE FINAL CUSTOMIZATION FOR SCALAR
app.use('/api-docs', apiReference({
  spec: {
    content: swaggerDocument,
  },
  // Add these options to customize the branding
  customPageTitle: 'Sutra Engine API', // This will be the browser tab name
  customFavicon: '/images/krida-logo.png' // The path to your logo inside the 'public' folder
}));

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