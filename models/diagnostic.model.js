// models/diagnostic.model.js
module.exports = (sequelize, Sequelize) => {
  const Diagnostic = sequelize.define('diagnostic', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    eventType: {
      type: Sequelize.STRING, // e.g., 'GENERATION_START', 'GENERATION_SUCCESS', 'GENERATION_FAIL'
      allowNull: false
    },
    logMessage: {
      type: Sequelize.TEXT
    },
    // Foreign Key for the World this diagnostic is about
    worldId: {
      type: Sequelize.UUID,
      allowNull: true, // Allow for system-wide diagnostics
      references: { model: 'worlds', key: 'id' },
      onDelete: 'SET NULL',
    }
  }, {
    tableName: 'diagnostics',
    timestamps: true
  });

  Diagnostic.associate = (models) => {
    Diagnostic.belongsTo(models.world, { foreignKey: 'worldId' });
  };

  return Diagnostic;
};