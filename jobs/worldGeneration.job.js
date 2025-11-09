// jobs/worldGeneration.job.js

const { Worker } = require('bullmq');
// FIX: Import the centralized queue and Redis connection from your config file.
const { queue, redisConnection } = require('../config/db');
// FIX: Import the database models correctly.
const db = require('../models');

// Deconstruct models for easier use within the worker
const World = db.world;
const WorldContent = db.worldContent;
const WorldAsset = db.worldAsset;
const GenerationMetric = db.generationMetric;

// --- The Worker Definition ---
// This is the background process that does the heavy lifting.

// FIX: The worker name 'world-generation' MUST EXACTLY match the queue name in config/db.js
new Worker('world-generation', async (job) => {
  const { worldId } = job.data;
  console.log(`[Worker] Starting generation for world: ${worldId}`);

  try {
    // 1. Find the world in the database.
    const world = await World.findByPk(worldId);
    if (!world) {
      // This is a critical check to prevent crashes if the world was deleted.
      throw new Error(`[Worker] CRITICAL: World with ID ${worldId} not found in database.`);
    }

    // 2. Set status to 'Generating' so the user knows work has started.
    await world.update({ status: 'Generating' });

    // 3. Simulate the long-running AI/LLM generation process.
    console.log(`[Worker] Simulating AI generation for 20 seconds for world: ${worldId}`);
    await new Promise(resolve => setTimeout(resolve, 20000));

    // 4. Create the fake content for MongoDB.
    const fakeContent = {
      quests: Array.from({ length: 5 }, (_, i) => ({
        id: `q${i + 1}`, name: `Quest ${i + 1}`, steps: 3 + i
      })),
      characters: Array.from({ length: 8 }, (_, i) => ({
        id: `npc${i + 1}`, name: `Character ${i + 1}`
      })),
    };
    await WorldContent.create({ worldId, generatedContent: fakeContent });

    // 5. Create associated assets in PostgreSQL.
    await WorldAsset.bulkCreate([
      { worldId, asset_type: 'model', asset_url: `s3://sutra-assets/${world.name}/tower.glb`, file_size_kb: 2800 },
      { worldId, asset_type: 'texture', asset_url: `s3://sutra-assets/${world.name}/neon.png`, file_size_kb: 120 }
    ]);

    // 6. Create generation metrics.
    await GenerationMetric.create({
      worldId,
      gen_time_ms: 28456,
      tokens_used: 12450,
      cost_usd: 0.187,
      model_used: 'claude-3-opus',
      assets_generated: 42
    });

    // 7. Set the final status to 'Active'. The job is complete.
    await world.update({ status: 'Active' });

    console.log(`[Worker] Successfully generated world: ${worldId}`);

  } catch (error) {
    console.error(`[Worker] Generation FAILED for world ${worldId}:`, error);
    
    // Attempt to find the world again to update its status to 'Failed'.
    const world = await World.findByPk(worldId);
    if (world) {
      await world.update({ status: 'Failed' });
    }
    
    // Re-throw the error so BullMQ knows the job has officially failed.
    throw error;
  }
}, { 
  // FIX: Explicitly use the centralized, correctly configured Redis connection.
  connection: redisConnection 
});

// --- Export the Queue ---
// This allows your controllers to add new jobs to the queue.
module.exports = { worldGenerationQueue: queue };