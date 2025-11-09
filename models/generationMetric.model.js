// models/generationMetric.model.js
module.exports = (sequelize, DataTypes) => {
  const GenerationMetric = sequelize.define(
    "generationMetric",
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
      gen_time_ms: { type: DataTypes.INTEGER },
      tokens_used: { type: DataTypes.INTEGER },
      cost_usd: { type: DataTypes.DECIMAL(10, 4) },
      model_used: { type: DataTypes.STRING },
      assets_generated: { type: DataTypes.INTEGER },
    },
    {
      timestamps: true,
      tableName: "generation_metrics",
    }
  );

  GenerationMetric.associate = (models) => {
    GenerationMetric.belongsTo(models.world, { foreignKey: "worldId" });
  };

  return GenerationMetric;
};