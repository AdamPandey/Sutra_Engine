// models/game.model.js
module.exports = (sequelize, Sequelize) => {
  const Game = sequelize.define('game', {
    id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
    title: { type: Sequelize.STRING, allowNull: false, unique: true },
    description: { type: Sequelize.TEXT },
    // --- NEW FIELDS ---
    version: { type: Sequelize.STRING, defaultValue: '0.1.0' },
    status: { type: Sequelize.STRING, defaultValue: 'In Development' }, // e.g., 'In Development', 'Live', 'Archived'
    imageUrl: { type: Sequelize.STRING, allowNull: true },
    // --- END NEW FIELDS ---
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    }
  }, { tableName: 'games', timestamps: true });

  Game.associate = (models) => {
    Game.belongsTo(models.user, { foreignKey: 'userId' });
    Game.hasMany(models.world, { foreignKey: 'gameId' });
    Game.belongsToMany(models.platform, { through: 'GamePlatforms' });
  };

  return Game;
};