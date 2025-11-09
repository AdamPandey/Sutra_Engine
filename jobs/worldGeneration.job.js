// jobs/worldGeneration.job.js
const { Worker } = require('bullmq');
// --- FIX: Import the connection and queue from the config file ---
const { queue, redisConnection } = require('../config/db');
const db = require('../models'); // <-- Make sure this is also correct
const WorldContent = db.worldContent;

// --- FIX: Create the Worker using the centralized connection ---
new Worker('world generation', async (job) => {
  const { worldId } = job.data;
  const World = db.world;
  const WorldAsset = db.worldAsset;
  const GenerationMetric = db.generationMetric;

  try {
    // ... (rest of the worker code is unchanged)
    const world = await World.findByPk(worldId);
    if (!world) {
      console.error(`Worker error: World with ID ${worldId} not found.`);
      return;
    }
    await world.update({ status: 'Generating' });
    
    // (Your generation logic here...)

    await world.update({ status: 'Active' });
    console.log(`World ${worldId} generated!`);
  } catch (error) {
    console.error(`Generation failed for world ${worldId}:`, error);
    // Optionally update the world status to 'Failed'
    const world = await World.findByPk(worldId);
    if (world) {
      await world.update({ status: 'Failed' });
    }
    throw error;
  }
}, { connection: redisConnection }); // <-- Use the imported connection here

// Export just the queue for adding jobs elsewhere
module.exports = { worldGenerationQueue: queue };