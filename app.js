// app.js

// --- STEP 1: IMPORTS ---
// All required modules must be at the top. This is where `sequelize` is defined.
const express = require('express');
const cors = require('cors');
// THIS IS THE LINE THAT WAS MISSING AND CAUSED THE CRASH:
const { sequelize, connectMongo } = require('./config/db');

// --- STEP 2: APP INITIALIZATION ---
const app = express();
app.use(cors());
app.use(express.json());

// --- STEP 3: SERVER STARTUP LOGIC ---
// We define the function that will connect to databases and start the server.
async function initialize() {
  try {
    // 1. Connect to the databases
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('PostgreSQL connection successful.');

    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    await connectMongo();

    // 2. NOW that models are synced, load the routes
    console.log('Initializing routes...');
    const authRoutes = require('./routes/auth');
    const worldRoutes = require('./routes/world');
    app.use('/api/auth', authRoutes);
    app.use('/api/worlds', worldRoutes);
    console.log('Routes initialized.');

    // 3. Start the BullMQ worker
    console.log('Starting background worker...');
    require('./jobs/worldGeneration.job');
    console.log('Worker started.');

    // 4. Start the server
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

// --- STEP 4: A SIMPLE HEALTH-CHECK ROUTE ---
app.get('/', (req, res) => {
  res.send('Sutra Engine Core is online');
});

// --- STEP 5: RUN THE SERVER ---
// Call the function to start the entire process.
initialize();