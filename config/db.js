// config/db.js
const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
require('dotenv').config();

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
  });
} else {
  throw new Error('DATABASE_URL is required');
}

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

// Redis Queue
const queue = new Queue('world-generation', {
  connection: process.env.REDIS_URL,
});

module.exports = { sequelize, connectMongo, queue };