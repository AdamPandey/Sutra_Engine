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
db.gameSession = require('./generationMetric.model')(sequelize, Sequelize);
db.gameSession = require('./worldAsset.model.js')(sequelize, Sequelize);
db.gameSession = require('./worldContent.model.js')(sequelize, Sequelize);


module.exports = db;