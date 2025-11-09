// models/user.model.js
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING
    }
  }, {
    // --- THIS IS THE CRITICAL FIX ---
    // Explicitly tell Sequelize the name of the table.
    // This removes any ambiguity that could cause sync to fail.
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    User.hasMany(models.world, { foreignKey: 'userId' });
    User.hasMany(models.gameSession, { foreignKey: 'userId' });
  };

  return User;
};