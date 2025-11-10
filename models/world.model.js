// models/world.model.js
module.exports = (sequelize, DataTypes) => {
  const World = sequelize.define(
    "world",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      theme: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "Queued" },
      engine_version: { type: DataTypes.STRING },
      pcg_seed: { type: DataTypes.INTEGER },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      // --- NEW FOREIGN KEY ---
      gameId: {
        type: DataTypes.UUID,
        allowNull: true, // Or false if every world MUST belong to a game
        references: { model: 'games', key: 'id' },
        onDelete: 'SET NULL',
      }
    },
    {
      tableName: "worlds",
      timestamps: true,
    }
  );

  World.associate = (models) => {
    World.belongsTo(models.user, { foreignKey: "userId" });
    // --- NEW RELATIONSHIPS ---
    World.belongsTo(models.game, { foreignKey: "gameId" });
    World.hasMany(models.diagnostic, { foreignKey: 'worldId' });
    World.belongsToMany(models.genre, { through: 'WorldGenres' });
  };

  return World;
};