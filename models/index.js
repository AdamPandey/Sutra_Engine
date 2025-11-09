const { Sequelize } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- FIX 1: Import all models with their correct names ---
db.user = require('./user.model.js')(sequelize, Sequelize);
db.world = require('./world.model.js')(sequelize, Sequelize);
db.gameSession = require('./gameSession.model.js')(sequelize, Sequelize);
db.generationMetric = require('./generationMetric.model.js')(sequelize, Sequelize);
db.worldAsset = require('./worldAsset.model.js')(sequelize, Sequelize);

// --- FIX 2: Import the Mongoose model correctly, without calling it as a function ---
db.worldContent = require('./worldContent.model.js');

// --- FIX 3: Add this loop to automatically run all the '.associate' functions ---
// This builds the relationships (e.g., a User has many Worlds)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;