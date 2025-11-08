const mongoose = require('mongoose');

const WorldContentSchema = new mongoose.Schema({
  worldId: { // This links back to the ID in the MySQL 'worlds' table
    type: String,
    required: true,
    unique: true,
  },
  generatedContent: { // This will hold the big, complex JSON from your "LLM"
    type: Object,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('WorldContent', WorldContentSchema);