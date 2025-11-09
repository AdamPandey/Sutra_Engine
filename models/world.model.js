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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      theme: { type: DataTypes.STRING },
      status: {
        type: DataTypes.STRING,
        defaultValue: "Queued",
      },
      engine_version: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pcg_seed: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,
      tableName: "worlds",
    }
  );

  World.associate = (models) => {
    World.belongsTo(models.user, { foreignKey: "userId", as: "owner" });
  };

  return World;
};