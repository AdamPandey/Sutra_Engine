// config/db.js
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const Bull = require('bullmq');
require('dotenv').config();

let sequelize;
if (process.env.DATABASE_URL) {
  // Render Postgres
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
  });
} else {
  // Local MySQL
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

// MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Redis + BullMQ
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const queue = new Bull.Queue('world-generation', {
  connection: redisUrl,
});

module.exports = { sequelize, connectMongo, queue };