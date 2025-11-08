const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');

let sequelize;

// This is the key: Check if a DATABASE_URL environment variable exists.
// Render provides this automatically for its PostgreSQL databases.
if (process.env.DATABASE_URL) {
  // We are in production on Render. Connect to PostgreSQL.
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Render's PostgreSQL
      }
    },
    logging: false,
  });
} else {
  // We are in local development. Connect to MySQL in Docker.
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
    }
  );
}

// MongoDB Connection (this code is fine and works everywhere)
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.world = require("../models/world.model.js")(sequelize, Sequelize);

module.exports = { db, connectMongo };