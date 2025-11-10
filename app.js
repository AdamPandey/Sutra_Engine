// app.js

const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db');

// --- THIS IS THE FIX. THIS ONE LINE SOLVES EVERYTHING. ---
// By requiring the models' index file here, we are telling Sequelize
// "Read all your model definitions NOW" before we do anything else.
require('./models');
// ---------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

async function initialize() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('PostgreSQL connection successful.');

    // Now, when this command runs, Sequelize has all the model definitions
    // and knows exactly which tables to create.
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true }); // Using alter is safe and correct.
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