// app.js
const express = require('express');
const cors = require('cors');
// Only require what you need at the top level
const { sequelize, connectMongo } = require('./config/db'); 

// Create the app instance
const app = express();

// Apply global middleware
app.use(cors());
app.use(express.json());

// A simple health-check route
app.get('/', (req, res) => {
  res.send('Sutra Engine Core is online');
});


// --- THE CRITICAL FIX IS HERE ---
// Do NOT require your route files at the top.
// Instead, create a function to initialize everything,
// and require them *inside* that function.
// This ensures that the database is connected and models are loaded
// BEFORE the routes (which depend on the models) are ever touched.

async function initialize() {
  try {
    // 1. Connect to the databases and sync models
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('PostgreSQL connected and synced.');
    await connectMongo();

    // 2. NOW that the models are ready, load the routes
    console.log('Initializing routes...');
    const authRoutes = require('./routes/auth');
    const worldRoutes = require('./routes/world');
    app.use('/api/auth', authRoutes);
    app.use('/api/worlds', worldRoutes);
    console.log('Routes initialized.');

    // 3. Start the BullMQ worker
    // Note: In a large application, this worker would be its own separate process.
    console.log('Starting background worker...');
    require('./jobs/worldGeneration.job'); 
    console.log('Worker started.');

    // 4. Start the server
    const PORT = process.env.PORT || 5001;
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

// Call the function to start the entire process
initialize();