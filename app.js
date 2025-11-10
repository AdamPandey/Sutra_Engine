// app.js

const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db');

// --- THIS IS THE FIX ---
// The 'apiReference' function is a NAMED EXPORT, so it MUST be in curly braces.
const { apiReference } = require('@scalar/express-api-reference');

// The complete Swagger/OpenAPI document object. This part is perfect.
// const swaggerDocument = {
//   openapi: '3.0.0',
//   info: {
//     title: 'Sutra Engine Core API',
//     description: 'The backend API for the Sutra Hub, a platform for managing AI-generated game worlds.',
//     version: '1.0.0',
//   },
//   servers: [
//     {
//       url: 'https://sutra-engine.onrender.com',
//       description: 'Production Server',
//     },
//   ],
//   paths: {
//     '/api/auth/register': {
//       post: {
//         summary: 'Register a new user',
//         description: 'Creates a new developer account.',
//         tags: ['Authentication'],
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   email: { type: 'string', example: 'developer@sutra.ai' },
//                   password: { type: 'string', example: 'password123' },
//                   name: { type: 'string', example: 'Ada Lovelace' },
//                 },
//                 required: ['email', 'password'],
//               },
//             },
//           },
//         },
//         responses: {
//           '201': {
//             description: 'User created successfully.',
//             content: {
//               'application/json': {
//                 schema: {
//                   type: 'object',
//                   properties: {
//                     message: { type: 'string', example: 'User created' },
//                     userId: { type: 'string', format: 'uuid' },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     '/api/auth/login': {
//       post: {
//         summary: 'Log in a user',
//         description: 'Authenticates a user and returns a JWT access token.',
//         tags: ['Authentication'],
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   email: { type: 'string', example: 'developer@sutra.ai' },
//                   password: { type: 'string', example: 'password123' },
//                 },
//                 required: ['email', 'password'],
//               },
//             },
//           },
//         },
//         responses: {
//           '200': {
//             description: 'Login successful.',
//             content: {
//               'application/json': {
//                 schema: {
//                   type: 'object',
//                   properties: {
//                     accessToken: { type: 'string', example: 'eyJhbGciOi...' },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   },
// };

// const swaggerDocument = {
//   openapi: '3.0.0',
//   info: {
//     title: 'Sutra Engine Core API',
//     description: 'The backend API for the Sutra Hub, a platform for managing AI-generated game worlds.',
//     version: '1.0.0',
//   },
//   servers: [
//     {
//       url: 'https://sutra-engine.onrender.com',
//       description: 'Production Server',
//     },
//   ],
//   // --- NEW: Define tags for better organization ---
//   tags: [
//     { name: 'Authentication', description: 'Endpoints for user registration and login.' },
//     { name: 'Worlds', description: 'CRUD operations for managing World Seeds.' }
//   ],
//   // --- NEW: Define the security scheme for JWT ---
//   components: {
//     securitySchemes: {
//       bearerAuth: {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//       },
//     },
//     schemas: {
//       World: {
//         type: 'object',
//         properties: {
//           id: { type: 'string', format: 'uuid' },
//           name: { type: 'string' },
//           theme: { type: 'string' },
//           status: { type: 'string', enum: ['Queued', 'Generating', 'Active', 'Failed'] },
//           engine_version: { type: 'string' },
//           pcg_seed: { type: 'integer' },
//           userId: { type: 'string', format: 'uuid' },
//           createdAt: { type: 'string', format: 'date-time' },
//           updatedAt: { type: 'string', format: 'date-time' },
//         }
//       }
//     }
//   },
//   // --- NEW: All paths are now documented ---
//   paths: {
//     // --- Authentication Endpoints ---
//     '/api/auth/register': {
//       post: { /* ... your existing, perfect register docs ... */ }
//     },
//     '/api/auth/login': {
//       post: { /* ... your existing, perfect login docs ... */ }
//     },
//     // --- Worlds Endpoints (Collection) ---
//     '/api/worlds': {
//       get: {
//         summary: 'Get all worlds for a user',
//         tags: ['Worlds'],
//         security: [{ bearerAuth: [] }],
//         responses: {
//           '200': {
//             description: 'A list of worlds.',
//             content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/World' } } } }
//           },
//           '403': { description: 'Forbidden/Invalid Token' }
//         }
//       },
//       post: {
//         summary: 'Create a new world',
//         tags: ['Worlds'],
//         security: [{ bearerAuth: [] }],
//         requestBody: {
//           required: true,
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   name: { type: 'string', example: 'Neo-Kyoto' },
//                   theme: { type: 'string', example: 'Cyberpunk' }
//                 },
//                 required: ['name']
//               }
//             }
//           }
//         },
//         responses: {
//           '201': {
//             description: 'World creation initiated.',
//             content: { 'application/json': { schema: { $ref: '#/components/schemas/World' } } }
//           },
//           '403': { description: 'Forbidden/Invalid Token' }
//         }
//       }
//     },
//     // --- Worlds Endpoints (Individual) ---
//     '/api/worlds/{id}': {
//       get: {
//         summary: 'Get a single world by ID',
//         tags: ['Worlds'],
//         security: [{ bearerAuth: [] }],
//         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
//         responses: {
//           '200': {
//             description: 'A single world object.',
//             content: { 'application/json': { schema: { $ref: '#/components/schemas/World' } } }
//           },
//           '403': { description: 'Forbidden/Invalid Token' },
//           '404': { description: 'World not found' }
//         }
//       },
//       put: { /* For brevity, we'll focus on the main ones. PUT is similar to POST. */ },
//       patch: { /* And PATCH is similar to PUT but for partial updates. */ },
//       delete: {
//         summary: 'Delete a world by ID',
//         tags: ['Worlds'],
//         security: [{ bearerAuth: [] }],
//         parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
//         responses: {
//           '204': { description: 'World deleted successfully.' },
//           '403': { description: 'Forbidden/Invalid Token' },
//           '404': { description: 'World not found' }
//         }
//       }
//     }
//   }
// };

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Sutra Engine Core API',
    description: 'The backend API for the Sutra Hub, a platform for managing AI-generated game worlds. This documentation provides a clear and interactive guide to all available endpoints.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://sutra-engine.onrender.com',
      description: 'Production Server',
    },
  ],
  // --- This is how we create the groups ---
  tags: [
    { name: 'Index', description: 'The root health-check endpoint.' },
    { name: 'Authentication', description: 'Endpoints for user registration and login.' },
    { name: 'Worlds', description: 'CRUD operations for managing World Seeds.' }
  ],
  // --- This defines the "Bearer Token" security for protected routes ---
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer {token}'
      },
    },
    schemas: {
      World: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '51ca82b4-5975-47a6-ace2-556733dd672c' },
          name: { type: 'string', example: 'Neo-Kyoto' },
          theme: { type: 'string', example: 'Cyberpunk' },
          status: { type: 'string', enum: ['Queued', 'Generating', 'Active', 'Failed'], example: 'Active' },
          engine_version: { type: 'string', example: 'Unreal Engine 5.4' },
          pcg_seed: { type: 'integer', example: 520101032 },
          userId: { type: 'string', format: 'uuid', example: '0cc7e7c6-1200-47b2-8d83-56b88a9874a6' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        }
      }
    }
  },
  // --- This defines all the endpoints, now properly tagged ---
  paths: {
    '/': {
      get: {
        summary: 'API Health Check',
        tags: ['Index'],
        responses: { '200': { description: 'Returns a success message confirming the API is online.' } }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'developer@sutra.ai' },
              password: { type: 'string', example: 'password123' },
              name: { type: 'string', example: 'Ada Lovelace' },
            },
            required: ['email', 'password'],
          }}}
        },
        responses: { '201': { description: 'User created successfully.' } }
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in a user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'developer@sutra.ai' },
              password: { type: 'string', example: 'password123' },
            },
            required: ['email', 'password'],
          }}}
        },
        responses: { '200': { description: 'Login successful, returns an access token.' } }
      },
    },
    '/api/worlds': {
      get: {
        summary: 'Get all worlds for a user',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'A list of worlds.', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/World' } } } } },
          '403': { description: 'Forbidden/Invalid Token' }
        }
      },
      post: {
        summary: 'Create a new world',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Ashen Kingdom' },
              theme: { type: 'string', example: 'Dark Fantasy' }
            },
            required: ['name']
          }}}
        },
        responses: {
          '201': { description: 'World creation initiated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/World' } } } },
          '403': { description: 'Forbidden/Invalid Token' }
        }
      }
    },
    '/api/worlds/{id}': {
      get: {
        summary: 'Get a single world by ID',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'The UUID of the world.', schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'A single world object.', content: { 'application/json': { schema: { $ref: '#/components/schemas/World' } } } },
          '403': { description: 'Forbidden/Invalid Token' },
          '404': { description: 'World not found' }
        }
      },
      put: {
        summary: 'Update a world (full update)',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            theme: { type: 'string' }
          }
        }}}},
        responses: {
          '200': { description: 'World updated successfully.' },
          '403': { description: 'Forbidden/Invalid Token' },
          '404': { description: 'World not found' }
        }
      },
      patch: {
        summary: 'Update a world (partial update)',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'Active' }
          }
        }}}},
        responses: {
          '200': { description: 'World patched successfully.' },
          '403': { description: 'Forbidden/Invalid Token' },
          '404': { description: 'World not found' }
        }
      },
      delete: {
        summary: 'Delete a world by ID',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '204': { description: 'World deleted successfully.' },
          '403': { description: 'Forbidden/Invalid Token' },
          '404': { description: 'World not found' }
        }
      }
    }
  }
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