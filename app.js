// app.js

const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db');

// --- THIS IS THE FIX ---
// The 'apiReference' function is a NAMED EXPORT, so it MUST be in curly braces.
const { apiReference } = require('@scalar/express-api-reference');

// The complete Swagger/OpenAPI document object. This part is perfect.
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sutra Engine Core API',
    description: 'The backend API for the Sutra Hub, a platform for managing AI-generated game worlds.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://sutra-engine.onrender.com',
      description: 'Production Server',
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        description: 'Creates a new developer account.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'developer@sutra.ai' },
                  password: { type: 'string', example: 'password123' },
                  name: { type: 'string', example: 'Ada Lovelace' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'User created' },
                    userId: { type: 'string', format: 'uuid' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in a user',
        description: 'Authenticates a user and returns a JWT access token.',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'developer@sutra.ai' },
                  password: { type: 'string', example: 'password123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string', example: 'eyJhbGciOi...' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// Load model definitions
require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Use the Scalar middleware to serve the beautiful documentation.
app.use('/api-docs', apiReference({
  spec: {
    content: swaggerDocument,
  },
}));

// The rest of your application startup logic remains unchanged. It is perfect.
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
    const authRoutes = require('./routes/auth');
    const worldRoutes = require('./routes/world');
    app.use('/api/auth', authRoutes);
    app.use('/api/worlds', worldRoutes);
    console.log('Routes initialized.');

    console.log('Starting background worker...');
    require('./jobs/worldGeneration.job');
    console.log('Worker started.');

    const PORT = process.env.PORT || 10000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}. Application is ready.`);
    });

  } catch (err) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!!    APPLICATION FAILED TO START   !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error(err);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('Sutra Engine Core is online');
});

initialize();