// models/game.model.js
module.exports = (sequelize, Sequelize) => {
  const Game = sequelize.define('game', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: Sequelize.TEXT
    },
    // Foreign Key for the User who owns this game project
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    }
  }, {
    tableName: 'games',
    timestamps: true
  });

  Game.associate = (models) => {
    Game.belongsTo(models.user, { foreignKey: 'userId' });
    Game.hasMany(models.world, { foreignKey: 'gameId' });
    // A Game can be on many Platforms, through a join table
    Game.belongsToMany(models.platform, { through: 'GamePlatforms' });
  };

  return Game;
};