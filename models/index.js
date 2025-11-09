// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require('./user.model')(sequelize, Sequelize);
db.world = require('./world.model')(sequelize, Sequelize);
db.gameSession = require('./gameSession.model')(sequelize, Sequelize);
db.generationMetric = require('./generationMetric.model')(sequelize, Sequelize); // <-- FIX
db.worldAsset = require('./worldAsset.model.js')(sequelize, Sequelize);       // <-- FIX
db.worldContent = require('./worldContent.model.js'); // <-- FIX (It's a Mongoose model, doesn't need sequelize passed in)


module.exports = db;