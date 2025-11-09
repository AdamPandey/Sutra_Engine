// models/gameSession.model.js
module.exports = (sequelize, DataTypes) => {
  const GameSession = sequelize.define(
    "gameSession",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      worldId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "worlds", key: "id" },
        onDelete: "CASCADE",
      },
      session_token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      play_time_ms: { type: DataTypes.INTEGER, defaultValue: 0 },
      score: { type: DataTypes.INTEGER, defaultValue: 0 },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
    },
    {
      timestamps: true,
      tableName: "game_sessions",
    }
  );

  GameSession.associate = (models) => {
    GameSession.belongsTo(models.world, { foreignKey: "worldId" });
    GameSession.belongsTo(models.user, { foreignKey: "userId" });
  };

  return GameSession;
};