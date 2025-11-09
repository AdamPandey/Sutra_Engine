// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- Import all Sequelize models correctly ---
db.user = require('./user.model.js')(sequelize, Sequelize);
db.world = require('./world.model.js')(sequelize, Sequelize);
db.gameSession = require('./gameSession.model.js')(sequelize, Sequelize);
db.generationMetric = require('./generationMetric.model.js')(sequelize, Sequelize);
db.worldAsset = require('./worldAsset.model.js')(sequelize, Sequelize);

// --- Import the Mongoose model correctly ---
db.worldContent = require('./worldContent.model.js');

// --- Run the model associations to build relationships ---
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;