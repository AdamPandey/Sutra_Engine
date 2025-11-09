// seeders/seed.js
require('dotenv').config();
const bcryptjs = require('bcryptjs');
const { db, connectMongo, connectMySQLWithRetry } = require('../config/db');
const WorldContent = db.worldContent;

const User = db.user;
const World = db.world;

const seedDatabase = async () => {
  try {
    // ---------------------------------------------------
    // 1. Connect to both DBs
    // ---------------------------------------------------
    await connectMySQLWithRetry();
    await connectMongo();
    console.log('Database connections established for seeding.');

    // ---------------------------------------------------
    // 2. Clear old data — CASCADE DELETE (not TRUNCATE)
    // ---------------------------------------------------
    console.log('Clearing existing data...');
    
    // Delete in correct order: child → parent
    await World.destroy({ where: {}, truncate: { cascade: true } });
    await User.destroy({ where: {}, truncate: { cascade: true } });
    
    // MongoDB: safe to deleteMany
    await WorldContent.deleteMany({});

    // ---------------------------------------------------
    // 3. Create users
    // ---------------------------------------------------
    const user1 = await User.create({
      id: '0718fe25-5b8b-4b3f-8091-c006dca9d265',  // ← FORCE THIS ID
      username: 'Adam',
      email: 'adam@sutra.ai',
      password: bcryptjs.hashSync('password123', 8),
    });

    // ---------------------------------------------------
    // 4. Create worlds
    // ---------------------------------------------------
    console.log('Creating World seeds...');
    const world1 = await World.create({
      name: 'Neo‑Kyoto',
      theme: 'Cyberpunk',
      status: 'Active',
      engine_version: 'Unreal Engine 5.4',
      pcg_seed: Math.floor(Math.random() * 999999999),
      userId: user1.id,
    });

    const world2 = await World.create({
      name: 'Ashen Kingdom',
      theme: 'Dark Fantasy',
      status: 'Active',
      engine_version: 'Unreal Engine 5.4',
      pcg_seed: Math.floor(Math.random() * 999999999),
      userId: user1.id,
    });

    // ---------------------------------------------------
    // 5. Create generated content (MongoDB)
    // ---------------------------------------------------
    console.log('Creating Generated Content...');
    await WorldContent.create({
      worldId: world1.id,
      generatedContent: {
        quests: [{ id: 'q1', name: 'Retrieve the Data Shard', steps: 3 }],
        characters: [{ id: 'char1', name: 'Kaito', dialogue: 'The neon calls to you...' }],
        puzzles: [{ id: 'puz1', type: 'Circuit Breaker', complexity: 8 }],
        pcg_metrics: { generation_time_ms: 28456, assets_used: 1245 },
      },
    });

    await WorldContent.create({
      worldId: world2.id,
      generatedContent: {
        quests: [{ id: 'q1-dk', name: 'Slay the Shadow Wyrm', steps: 5 }],
        characters: [{ id: 'char1-dk', name: 'Lord Malakor', dialogue: 'The embers fade...' }],
        puzzles: [{ id: 'puz1-dk', type: 'Runic Lock', complexity: 9 }],
        pcg_metrics: { generation_time_ms: 32109, assets_used: 2890 },
      },
    });

    console.log('Creating Game Sessions...');
await db.gameSession.create({
  worldId: world1.id,
  userId: user1.id,
  session_token: 'sess_' + Date.now(),
  play_time_ms: 125000,
  score: 8500,
});

console.log('Creating World Assets...');
await db.worldAsset.create({
  worldId: world1.id,
  asset_type: 'model',
  asset_url: 's3://sutra-assets/neo-kyoto/tower.glb',
  file_size_kb: 2840,
});

console.log('Creating Generation Metrics...');
await db.generationMetric.create({
  worldId: world1.id,
  gen_time_ms: 28456,
  tokens_used: 12450,
  cost_usd: 0.187,
  model_used: 'claude-3-opus',
  assets_generated: 42,
});

    console.log('Database has been successfully seeded!');

  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    await db.sequelize.close();
    await require('mongoose').connection.close();
    console.log('Connections closed.');
  }
};

seedDatabase();