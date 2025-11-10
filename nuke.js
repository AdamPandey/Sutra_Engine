// nuke.js
const { sequelize } = require('./config/db');

const nukeDatabase = async () => {
  console.log('--- [NUKE SCRIPT] STARTING DATABASE WIPE ---');
  try {
    console.log('--- [NUKE SCRIPT] Connecting to the database...');
    await sequelize.authenticate();
    console.log('--- [NUKE SCRIPT] Connection successful.');

    console.log('--- [NUKE SCRIPT] Executing DROP TABLE commands...');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS worlds CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS game_sessions CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS generation_metrics CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS world_assets CASCADE;');
    console.log('--- [NUKE SCRIPT] All tables dropped successfully.');

  } catch (error) {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!!    NUKE SCRIPT FAILED TO EXECUTE    !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error(error);
    process.exit(1);
  } finally {
    console.log('--- [NUKE SCRIPT] Closing database connection.');
    await sequelize.close();
    console.log('--- [NUKE SCRIPT] SCRIPT FINISHED ---');
    process.exit(0);
  }
};

nukeDatabase();