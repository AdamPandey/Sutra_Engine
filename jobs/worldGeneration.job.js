// jobs/worldGeneration.job.js
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { db } = require('../config/db');
const WorldContent = require('../models/worldContent.model');

const connection = new IORedis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: null,  // ← THIS LINE
  enableReadyCheck: false,
});

const worldGenerationQueue = new Queue('world generation', { connection });

// Worker
new Worker('world generation', async (job) => {
  const { worldId } = job.data;
  const World = db.world;
  const WorldAsset = db.worldAsset;
  const GenerationMetric = db.generationMetric;

  try {
    // 1. Set status to Generating
    const world = await World.findByPk(worldId);
    await world.update({ status: 'Generating' });

    // 2. Simulate LLM (20 seconds)
    await new Promise(resolve => setTimeout(resolve, 20000));

    // 3. Generate fake content
    const fakeContent = {
      quests: Array.from({ length: 5 }, (_, i) => ({
        id: `q${i + 1}`,
        name: `Quest ${i + 1}: ${['Retrieve', 'Defend', 'Explore'][i % 3]} the ${['Shard', 'Temple', 'Portal'][i % 3]}`,
        steps: 3 + i,
        reward: `+${(i + 1) * 500} XP`
      })),
      characters: Array.from({ length: 8 }, (_, i) => ({
        id: `npc${i + 1}`,
        name: ['Kira', 'Jax', 'Lena', 'Rook', 'Mara', 'Tao', 'Vex', 'Zara'][i],
        role: ['Hacker', 'Merc', 'Oracle', 'Thief'][i % 4],
        dialogue: 'The city never sleeps...',
        alignment: Math.random() > 0.5 ? 'ally' : 'neutral'
      })),
      environment: {
        weather: ['Rain', 'Neon Fog', 'Acid Storm'][Math.floor(Math.random() * 3)],
        timeOfDay: 'Night'
      }
    };

    // 4. Save to MongoDB
    await WorldContent.create({
      worldId,
      generatedContent: fakeContent
    });

    // 5. Save assets
    await WorldAsset.bulkCreate([
      { worldId, asset_type: 'model', asset_url: `s3://sutra-assets/${world.name}/tower.glb`, file_size_kb: 2800 },
      { worldId, asset_type: 'texture', asset_url: `s3://sutra-assets/${world.name}/neon.png`, file_size_kb: 120 }
    ]);

    // 6. Save metrics
    await GenerationMetric.create({
      worldId,
      gen_time_ms: 28456,
      tokens_used: 12450,
      cost_usd: 0.187,
      model_used: 'claude-3-opus',
      assets_generated: 42
    });

    // 7. Set status to Active
    await world.update({ status: 'Active' });

    console.log(`World ${worldId} generated!`);
  } catch (error) {
    console.error('Generation failed:', error);
    throw error;
  }
}, { connection });

// Export queue for adding jobs
module.exports = { worldGenerationQueue };