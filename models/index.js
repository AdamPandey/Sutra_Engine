// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model')(sequelize, Sequelize);
db.world = require('./world.model')(sequelize, Sequelize);

module.exports = db;