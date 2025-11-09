// // server.js
// const express = require('express');
// const cors = require('cors');
// // const { db, connectMongo, connectMySQLWithRetry } = require('./config/db');

// const app = express();
// const PORT = process.env.PORT || 5001;   // matches .env

// app.use(cors());
// app.use(express.json());

// // ---------------------------------------------------
// // 1. Start MongoDB (fire‑and‑forget)
// // ---------------------------------------------------
// connectMongo();

// // ---------------------------------------------------
// // 2. Wait for MySQL, then sync tables
// // ---------------------------------------------------
// (async () => {
//   try {
//     await connectMySQLWithRetry();          // <-- retry loop
//     await db.sequelize.sync({ force: false, alter: true });
//     console.log('MySQL tables synced.');
//   } catch (err) {
//     console.error('Failed to start MySQL:', err);
//     process.exit(1);
//   }

//   // ---------------------------------------------------
//   // 3. Routes
//   // ---------------------------------------------------
//   app.get('/', (req, res) => res.json({ message: 'Sutra Engine Core is online.' }));
//   require('./routes/auth.routes')(app);
//   require('./routes/world.routes')(app);

//   // ---------------------------------------------------
//   // 4. Listen
//   // ---------------------------------------------------
//   app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// })();

// require('./jobs/worldGeneration.job'); // starts worker

// server.js — REPLACE THE OLD BLOCK WITH THIS
// app.js
const express = require('express');
const cors = require('cors');
const { sequelize, connectMongo } = require('./config/db'); // Removed queue, it's used in the job file

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sutra Engine Core is online');
});

// --- THIS IS THE FIX ---
// Instead of using app.use(), we call the functions from our route files
// and pass the 'app' object to them so they can set up the routes.
require('./routes/auth')(app);
require('./routes/world')(app);
// -----------------------

// Start server
async function startServer() {
  try {
    console.log('Authenticating database connection...');
    await sequelize.authenticate();
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true }); // Using alter is fine for dev, consider migrations for prod
    console.log('PostgreSQL connected and synced.');

    await connectMongo();

    // The worker setup can stay here if you want to run it in the same process
    // For bigger apps, this would be a separate service
    require('./jobs/worldGeneration.job');

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();