// models/worldAsset.model.js
module.exports = (sequelize, DataTypes) => {
  const WorldAsset = sequelize.define(
    "worldAsset",
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
      asset_type: {
        type: DataTypes.STRING,
        allowNull: false,
        // model, texture, audio, blueprint
      },
      asset_url: { type: DataTypes.STRING },
      file_size_kb: { type: DataTypes.INTEGER },
      generated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      timestamps: true,
      tableName: "world_assets",
    }
  );

  WorldAsset.associate = (models) => {
    WorldAsset.belongsTo(models.world, { foreignKey: "worldId" });
  };

  return WorldAsset;
};