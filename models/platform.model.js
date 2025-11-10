// models/platform.model.js
module.exports = (sequelize, Sequelize) => {
  const Platform = sequelize.define('platform', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'platforms',
    timestamps: false
  });

  Platform.associate = (models) => {
    // A Platform can have many Games, through a join table
    Platform.belongsToMany(models.game, { through: 'GamePlatforms' });
  };

  return Platform;
};