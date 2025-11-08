const express = require('express');
const cors = require('cors');
const { db, connectMongo } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- INITIALIZE DATABASES ---
db.sequelize.sync()
  .then(() => console.log("MySQL Synced."))
  .catch(err => console.log("MySQL Sync error:", err));
connectMongo();

// --- ROUTES ---
app.get('/', (req, res) => res.json({ message: 'Sutra Engine Core is online.' }));
require('./routes/auth.routes')(app);
require('./routes/world.routes')(app);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});