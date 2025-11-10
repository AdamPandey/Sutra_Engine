// models/world.model.js
module.exports = (sequelize, DataTypes) => {
  const World = sequelize.define("world", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    theme: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: "Queued" },
    // --- NEW FIELDS ---
    description: { type: DataTypes.TEXT, allowNull: true },
    thumbnailUrl: { type: DataTypes.STRING, allowNull: true },
    // --- END NEW FIELDS ---
    engine_version: { type: DataTypes.STRING },
    pcg_seed: { type: DataTypes.INTEGER },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    gameId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'games', key: 'id' },
      onDelete: 'SET NULL',
    }
  }, { tableName: "worlds", timestamps: true });

  World.associate = (models) => {
    World.belongsTo(models.user, { foreignKey: "userId" });
    World.belongsTo(models.game, { foreignKey: "gameId" });
    World.hasMany(models.diagnostic, { foreignKey: 'worldId' });
    World.belongsToMany(models.genre, { through: 'WorldGenres' });
  };

  return World;
};