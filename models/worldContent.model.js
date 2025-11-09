// models/worldContent.model.js
const mongoose = require("mongoose");

const WorldContentSchema = new mongoose.Schema(
  {
    worldId: {
      type: String,
      required: true,
      unique: true,
      index: true,                     // fast lookup + FK-like
    },
    generatedContent: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }                // createdAt + updatedAt
);

module.exports = mongoose.model("WorldContent", WorldContentSchema);