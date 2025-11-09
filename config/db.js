// config/db.js
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
const IORedis = require('ioredis'); // <-- Add this
require('dotenv').config();

let sequelize;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error('FATAL: DATABASE_URL environment variable is not set!');
  }
  console.log('Attempting to connect to the database...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false
  });
  console.log('Sequelize instance created successfully.');
} catch (error) {
  console.error('!!! DATABASE CONNECTION FAILED IN config/db.js !!!');
  console.error(error);
  process.exit(1);
}

// --- FIX: Centralize the Redis Connection ---
if (!process.env.REDIS_URL) {
  throw new Error('FATAL: REDIS_URL environment variable is not set!');
}
const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
console.log('Redis connection instance created.');
// ------------------------------------------

// MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Redis Queue - Now uses the centralized connection
const queue = new Queue('world-generation', { connection: redisConnection });

// Export everything
module.exports = { sequelize, connectMongo, queue, redisConnection };