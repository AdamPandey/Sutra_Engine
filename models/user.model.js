// models/user.model.js
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    id: {
      // FIX: The ID must be a UUID to match the other tables.
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4, // This tells the DB to auto-generate the UUID string
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
    tableName: 'users', // It's good practice to name the table
    timestamps: true
  });

  // It's also good practice to define both sides of the relationship
  User.associate = (models) => {
    User.hasMany(models.world, { foreignKey: 'userId' });
    User.hasMany(models.gameSession, { foreignKey: 'userId' });
  };

  return User;
};