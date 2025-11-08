module.exports = (sequelize, DataTypes) => {
  const World = sequelize.define("world", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    theme: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Queued', // e.g., Queued, Generating, Active
    },
  });
  return World;
};