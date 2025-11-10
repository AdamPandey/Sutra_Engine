// raw_nuke.js
// This script uses the raw 'pg' driver to bypass Sequelize and
// directly execute DROP TABLE commands. This cannot fail silently.

const { Client } = require('pg');

const runNuke = async () => {
  console.log('--- [RAW NUKE SCRIPT] STARTING ---');

  if (!process.env.DATABASE_URL) {
    console.error('FATAL: DATABASE_URL environment variable not found!');
    process.exit(1);
  }

  // Render's databases require SSL. This configuration is critical.
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('--- [RAW NUKE SCRIPT] Connecting to database...');
    await client.connect();
    console.log('--- [RAW NUKE SCRIPT] Connection successful.');

    console.log('--- [RAW NUKE SCRIPT] Executing DROP TABLE commands...');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    await client.query('DROP TABLE IF EXISTS worlds CASCADE;');
    await client.query('DROP TABLE IF EXISTS game_sessions CASCADE;');
    await client.query('DROP TABLE IF EXISTS generation_metrics CASCADE;');
    await client.query('DROP TABLE IF EXISTS world_assets CASCADE;');
    console.log('--- [RAW NUKE SCRIPT] All tables dropped successfully.');

    console.log('--- [RAW NUKE SCRIPT] SUCCESS! Database is now a clean slate.');

  } catch (error) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!!    RAW NUKE SCRIPT FAILED            !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error(error);
    process.exit(1); // Exit with a failure code to make sure we see it.
  } finally {
    console.log('--- [RAW NUKE SCRIPT] Closing connection...');
    await client.end();
    console.log('--- [RAW NUKE SCRIPT] FINISHED.');
    process.exit(0); // Exit with a success code.
  }
};

runNuke();