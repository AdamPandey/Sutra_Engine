// seeders/seed.js
const { sequelize, connectMongo } = require('../config/db');
const db = require('../models');

const seedDatabase = async () => {
  console.log('--- [SEEDER] Starting database seed process... ---');
  try {
    // 1. CONNECT
    await sequelize.authenticate();
    await connectMongo();
    console.log('[SEEDER] Database connections established.');

    // 2. WIPE AND RECREATE TABLES
    console.log('[SEEDER] Forcing synchronization of all tables...');
    await sequelize.sync({ force: true });
    console.log('[SEEDER] All tables dropped and recreated successfully.');
    await db.worldContent.deleteMany({});
    console.log('[SEEDER] MongoDB collection cleared.');

    // 3. SEED LOOKUP TABLES
    console.log('[SEEDER] Seeding Genres and Platforms...');
    const genres = await db.genre.bulkCreate([
      { name: 'Escape Room' }, { name: 'Puzzle Adventure' }, { name: 'Cyberpunk' }, { name: 'Dark Fantasy' }
    ]);
    const platforms = await db.platform.bulkCreate([
      { name: 'Android' }, { name: 'iOS' }, { name: 'PC' }, { name: 'Unreal Engine' }
    ]);
    const puzzleGenre = genres.find(g => g.name === 'Puzzle Adventure');
    const cyberpunkGenre = genres.find(g => g.name === 'Cyberpunk');
    const androidPlatform = platforms.find(p => p.name === 'Android');
    const iOSPlatform = platforms.find(p => p.name === 'iOS');

    // 4. SEED CORE DATA
    console.log('[SEEDER] Seeding Users and Games...');
    const user1 = await db.user.create({
      email: 'adam.pandey@sutra.ai',
      password: 'hashed_password_placeholder', // NOTE: In a real app, hash this
      name: 'Adam Pandey',
    });

    const game1 = await db.game.create({
      title: 'Hustle Jack',
      description: "An escape-room puzzle adventure where players embody Jack, a resourceful inventor. A 'MacGyver meets Escape Room' adventure.",
      status: 'Live',
      imageUrl: 'https://example.com/hustle_jack_art.png',
      userId: user1.id,
    });
    // Create the many-to-many relationship
    await game1.addPlatform(androidPlatform);
    await game1.addPlatform(iOSPlatform);

    // 5. SEED WORLDS & WORLD CONTENT
    console.log('[SEEDER] Seeding Worlds and MongoDB content...');
    const world1 = await db.world.create({
      name: 'Neo-Kyoto Warehouse',
      theme: 'Cyberpunk',
      description: 'A sprawling, rain-slicked warehouse in the heart of the neon city.',
      status: 'Active',
      engine_version: 'Unreal Engine 5.4',
      pcg_seed: 123456789,
      userId: user1.id,
      gameId: game1.id,
    });
    // Create many-to-many relationship
    await world1.addGenre(puzzleGenre);
    await world1.addGenre(cyberpunkGenre);
    
    await db.worldContent.create({
      worldId: world1.id,
      generatedContent: {
        quests: [{ id: 'q1', name: 'Retrieve the Data Shard' }],
        characters: [{ id: 'char1', name: 'Kaito', dialogue: 'The neon calls to you...' }],
        puzzles: [{ id: 'puz1', type: 'Circuit Breaker' }],
      },
    });

    console.log('--- [SEEDER] Database has been successfully seeded! ---');

  } catch (error) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!!      SEEDER FAILED TO EXECUTE      !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
    await require('mongoose').connection.close();
    console.log('[SEEDER] Connections closed.');
  }
};

seedDatabase();