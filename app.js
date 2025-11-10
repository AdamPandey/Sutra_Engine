// app.js

const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db');
const swaggerUi = require('swagger-ui-express'); // <-- ADD THIS
const YAML = require('yamljs');                   // <-- ADD THIS

// Load the OpenAPI specification
const swaggerDocument = YAML.load('./swagger.yaml'); // <-- ADD THIS

// By requiring the models' index file here, we ensure Sequelize knows about them.
require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// --- THIS IS THE NEW PART ---
// Serve the interactive API documentation at the /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// ----------------------------

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

  } catch (err){
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