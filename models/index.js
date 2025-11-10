// models/index.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db').sequelize;

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --- LOAD ALL MODELS ---
db.user = require('./user.model.js')(sequelize, Sequelize);
db.game = require('./game.model.js')(sequelize, Sequelize); // NEW
db.world = require('./world.model.js')(sequelize, Sequelize);
db.genre = require('./genre.model.js')(sequelize, Sequelize); // NEW
db.platform = require('./platform.model.js')(sequelize, Sequelize); // NEW
db.diagnostic = require('./diagnostic.model.js')(sequelize, Sequelize); // NEW

// These are still good
db.gameSession = require('./gameSession.model.js')(sequelize, Sequelize);
db.generationMetric = require('./generationMetric.model.js')(sequelize, Sequelize);
db.worldAsset = require('./worldAsset.model.js')(sequelize, Sequelize);
db.worldContent = require('./worldContent.model.js');

// --- RUN ASSOCIATIONS ---
// This loop automatically connects everything (hasMany, belongsTo, etc.)
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;