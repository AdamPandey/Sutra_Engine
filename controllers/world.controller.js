const { db } = require("../config/db");
const World = db.world;
const WorldContent = require("../models/worldContent.model");

// CREATE
exports.createWorld = async (req, res) => {
  try {
    const world = await World.create({
      name: req.body.name,
      theme: req.body.theme,
    });
    // In Assignment #2, you would fire your `WorldGenerationRequested` event here.
    res.status(201).json(world);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// READ ALL
exports.getAllWorlds = async (req, res) => {
  const worlds = await World.findAll();
  res.json(worlds);
};

// READ ONE
exports.getOneWorld = async (req, res) => {
  const world = await World.findByPk(req.params.id);
  if (!world) return res.status(404).json({ message: 'World not found' });
  res.json(world);
};

// UPDATE
exports.updateWorld = async (req, res) => {
  const world = await World.findByPk(req.params.id);
  if (!world) return res.status(404).json({ message: 'World not found' });
  
  await world.update({
    name: req.body.name,
    theme: req.body.theme,
    status: req.body.status,
  });
  res.json(world);
};

// DELETE
exports.deleteWorld = async (req, res) => {
  const world = await World.findByPk(req.params.id);
  if (!world) return res.status(404).json({ message: 'World not found' });

  await world.destroy();
  // Here is your complex deletion logic: also delete from MongoDB
  await WorldContent.deleteOne({ worldId: req.params.id });
  
  res.status(204).send(); // 204 No Content is the standard for a successful delete
};

exports.patchWorld = async (req, res) => {
  const world = await World.findByPk(req.params.id);
  if (!world) return res.status(404).json({ message: 'World not found' });
  
  // This will update only the fields that are in the request body
  await world.update(req.body);
  
  res.json(world);
};