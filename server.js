// server.js
const express = require('express');
const cors = require('cors');
const { db, connectMongo, connectMySQLWithRetry } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;   // matches .env

app.use(cors());
app.use(express.json());

// ---------------------------------------------------
// 1. Start MongoDB (fire‑and‑forget)
// ---------------------------------------------------
connectMongo();

// ---------------------------------------------------
// 2. Wait for MySQL, then sync tables
// ---------------------------------------------------
(async () => {
  try {
    await connectMySQLWithRetry();          // <-- retry loop
    await db.sequelize.sync({ force: false, alter: true });
    console.log('MySQL tables synced.');
  } catch (err) {
    console.error('Failed to start MySQL:', err);
    process.exit(1);
  }

  // ---------------------------------------------------
  // 3. Routes
  // ---------------------------------------------------
  app.get('/', (req, res) => res.json({ message: 'Sutra Engine Core is online.' }));
  require('./routes/auth.routes')(app);
  require('./routes/world.routes')(app);

  // ---------------------------------------------------
  // 4. Listen
  // ---------------------------------------------------
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
})();

require('./jobs/worldGeneration.job'); // starts worker