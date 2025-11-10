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
    description: 'The backend API for the Sutra Hub, a platform for managing AI-generated game worlds. This documentation provides a clear and interactive guide to all available endpoints and data models.',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'https://sutra-engine.onrender.com',
      description: 'Production Server',
    },
  ],
  // --- This is how we create the groups for the sidebar ---
  tags: [
    { name: 'Index', description: 'The root health-check endpoint.' },
    { name: 'Authentication', description: 'Endpoints for user registration and login.' },
    { name: 'Worlds', description: 'Core CRUD operations for managing World Seeds in the primary PostgreSQL database.' },
    { name: 'World Content', description: 'Endpoints for retrieving rich, AI-generated content from the secondary MongoDB database.' }
  ],
  // --- This defines our data models and security ---
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
      User: {
        type: 'object',
        description: 'Represents a developer account in the system (stored in PostgreSQL).',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Primary Key' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
        }
      },
      World: {
        type: 'object',
        description: "Represents a 'World Seed' in the PostgreSQL database. This is the core relational object.\n\n**Relationships:**\n- `belongsTo`: User\n- `hasOne`: WorldContent (in MongoDB)\n- `hasMany`: GameSessions, WorldAssets, GenerationMetrics (all handled via cascading deletes).",
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Primary Key' },
          name: { type: 'string', example: 'Neo-Kyoto' },
          theme: { type: 'string', example: 'Cyberpunk' },
          status: { type: 'string', enum: ['Queued', 'Generating', 'Active', 'Failed'], example: 'Active' },
          userId: { type: 'string', format: 'uuid', description: 'Foreign Key referencing the User owner.' },
        }
      },
      WorldContent: {
        type: 'object',
        description: 'Represents the large, unstructured AI-generated content for a world, stored in MongoDB.',
        properties: {
          quests: { type: 'array', items: { type: 'object' }, example: [{ "id": "q1", "name": "Retrieve the Data Shard" }] },
          characters: { type: 'array', items: { type: 'object' }, example: [{ "id": "char1", "name": "Kaito" }] },
          puzzles: { type: 'array', items: { type: 'object' }, example: [{ "id": "puz1", "type": "Circuit Breaker" }] },
        }
      }
    }
  },
  // --- This defines all the endpoints, now properly tagged and complete ---
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
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', properties: {
            email: { type: 'string', example: 'developer@sutra.ai' },
            password: { type: 'string', example: 'password123' },
            name: { type: 'string', example: 'Ada Lovelace' },
          }, required: ['email', 'password'],
        }}}},
        responses: { '201': { description: 'User created successfully.' } }
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in a user',
        tags: ['Authentication'],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', properties: {
            email: { type: 'string', example: 'developer@sutra.ai' },
            password: { type: 'string', example: 'password123' },
          }, required: ['email', 'password'],
        }}}},
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
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', properties: {
            name: { type: 'string', example: 'Ashen Kingdom' },
            theme: { type: 'string', example: 'Dark Fantasy' }
          }, required: ['name']
        }}}},
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
          type: 'object', properties: {
            name: { type: 'string' },
            theme: { type: 'string' }
          }
        }}}},
        responses: { '200': { description: 'World updated successfully.' } }
      },
      patch: {
        summary: 'Update a world (partial update)',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { content: { 'application/json': { schema: {
          type: 'object', properties: { status: { type: 'string', example: 'Active' } }
        }}}},
        responses: { '200': { description: 'World patched successfully.' } }
      },
      delete: {
        summary: 'Delete a world by ID',
        tags: ['Worlds'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { '204': { description: 'World deleted successfully.' } }
      }
    },
    '/api/worlds/{id}/content': {
      get: {
        summary: 'Get Generated Content for a World',
        tags: ['World Content'],
        description: 'Retrieves the rich, AI-generated content (quests, characters, etc.) for a single world from the MongoDB database.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, description: 'The UUID of the world.', schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'The generated content object.', content: { 'application/json': { schema: { $ref: '#/components/schemas/WorldContent' } } } },
          '403': { description: 'Forbidden/Invalid Token' },
          '404': { description: 'World or its content not found' }
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