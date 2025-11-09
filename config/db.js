// config/db.js
const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");

let sequelize;

// ---------------------------------------------------
// 1. Production (Render) – PostgreSQL via DATABASE_URL
// ---------------------------------------------------
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
    logging: false,
  });
} else {
  // ---------------------------------------------------
  // 2. Local dev – MySQL in Docker (with retry config)
  // ---------------------------------------------------
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false,
      dialectOptions: { connectTimeout: 30000 },
      retry: {
        match: [
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /SequelizeConnectionRefusedError/,
        ],
        max: 12,
        backoffBase: 1000,
        backoffExponent: 1.5,
      },
    }
  );
}

// ---------------------------------------------------
// MongoDB connection
// ---------------------------------------------------
const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// ---------------------------------------------------
// Helper: wait for MySQL with manual retries
// ---------------------------------------------------
const connectMySQLWithRetry = async (maxAttempts = 12, delayMs = 3000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await sequelize.authenticate();
      console.log("MySQL connected successfully.");
      return;
    } catch (err) {
      console.log(`MySQL not ready (attempt ${i + 1}/${maxAttempts}), retrying in ${delayMs / 1000}s…`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error("Could not connect to MySQL after retries");
};

// ---------------------------------------------------
// Export models + associations
// ---------------------------------------------------
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.world = require("../models/world.model.js")(sequelize, Sequelize);
db.worldContent = require("../models/worldContent.model"); // Mongoose
db.gameSession = require("../models/gameSession.model.js")(sequelize, Sequelize);
db.worldAsset = require("../models/worldAsset.model.js")(sequelize, Sequelize);
db.generationMetric = require("../models/generationMetric.model.js")(sequelize, Sequelize);

// ---- Declare associations AFTER all models are loaded ----
db.user.hasMany(db.world, { foreignKey: "userId", as: "worlds" });
db.world.belongsTo(db.user, { foreignKey: "userId", as: "owner" });
db.user.hasMany(db.gameSession, { foreignKey: "userId" });
db.world.hasMany(db.gameSession, { foreignKey: "worldId" });
db.world.hasMany(db.worldAsset, { foreignKey: "worldId" });
db.world.hasMany(db.generationMetric, { foreignKey: "worldId" });

db.gameSession.belongsTo(db.user);
db.gameSession.belongsTo(db.world);
db.worldAsset.belongsTo(db.world);
db.generationMetric.belongsTo(db.world);

module.exports = { db, connectMongo, connectMySQLWithRetry };