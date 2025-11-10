// models/genre.model.js
module.exports = (sequelize, Sequelize) => {
  const Genre = sequelize.define('genre', {
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
    tableName: 'genres',
    timestamps: false // Genres don't need timestamps
  });

  Genre.associate = (models) => {
    // A Genre can be applied to many Worlds, through a join table
    Genre.belongsToMany(models.world, { through: 'WorldGenres' });
  };

  return Genre;
};