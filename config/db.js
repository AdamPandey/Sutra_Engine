const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const { Queue } = require('bullmq');
require('dotenv').config();

let sequelize;

try {
  // Check if the variable exists first
  if (!process.env.DATABASE_URL) {
    throw new Error('FATAL: DATABASE_URL environment variable is not set!');
  }

  console.log('Attempting to connect to the database...');
  
  // Initialize Sequelize
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false // Keep this false for now to avoid too much noise
  });
  
  console.log('Sequelize instance created successfully.');

} catch (error) {
  // THIS IS THE CODE THAT WILL SAVE YOU
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('!!! DATABASE CONNECTION FAILED IN config/db.js !!!');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('The raw error object is:', error);
  // We must exit here, otherwise the app will continue in a broken state
  process.exit(1);
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