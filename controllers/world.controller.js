// controllers/world.controller.js
const { db } = require("../models");
const World = db.world;
const WorldContent = require("../models/worldContent.model");
const { worldGenerationQueue } = require("../jobs/worldGeneration.job");
const eventBus = require("../events/worldEvents");

// CREATE
exports.createWorld = async (req, res) => {
  try {
    const world = await World.create({
      name: req.body.name,
      theme: req.body.theme,
      status: "Queued",
      engine_version: req.body.engine_version || "Unreal Engine 5.4",
      pcg_seed: req.body.pcg_seed || Math.floor(Math.random() * 999999999),
      userId: req.userId,
    });

    // Trigger AI generation job
    await worldGenerationQueue.add("generate-world", { worldId: world.id });

    // Optional: emit event
    eventBus.emit("WorldGenerationRequested", world);

    res.status(201).json(world);
  } catch (error) {
    console.error("Create world failed:", error);
    res.status(500).json({ message: error.message || "Failed to create world" });
  }
};

// READ ALL (owned by user)
exports.getAllWorlds = async (req, res) => {
  try {
    const worlds = await World.findAll({
      where: { userId: req.userId },
      attributes: [
        "id",
        "name",
        "theme",
        "status",
        "engine_version",
        "pcg_seed",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(worlds);
  } catch (error) {
    console.error("Get worlds failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// READ ONE
exports.getOneWorld = async (req, res) => {
  try {
    const world = await World.findOne({
      where: { id: req.params.id, userId: req.userId },
      attributes: [
        "id",
        "name",
        "theme",
        "status",
        "engine_version",
        "pcg_seed",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!world) {
      return res.status(404).json({ message: "World not found or unauthorized" });
    }

    res.json(world);
  } catch (error) {
    console.error("Get world failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE (PUT) — Full Replace
exports.updateWorld = async (req, res) => {
  try {
    const world = await World.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!world) {
      return res.status(404).json({ message: "World not found or unauthorized" });
    }

    await world.update({
      name: req.body.name ?? world.name,
      theme: req.body.theme ?? world.theme,
      status: req.body.status ?? world.status,
      engine_version: req.body.engine_version ?? world.engine_version,
      pcg_seed: req.body.pcg_seed ?? world.pcg_seed,
    });

    res.json(world);
  } catch (error) {
    console.error("Update world failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// PATCH — Partial Update
exports.patchWorld = async (req, res) => {
  try {
    const world = await World.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!world) {
      return res.status(404).json({ message: "World not found or unauthorized" });
    }

    await world.update(req.body); // Only updates provided fields
    res.json(world);
  } catch (error) {
    console.error("Patch world failed:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE — With MongoDB + MySQL cleanup
exports.deleteWorld = async (req, res) => {
  try {
    const world = await World.findOne({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!world) {
      return res.status(404).json({ message: "World not found or unauthorized" });
    }

    // 1. Delete from MongoDB
    await WorldContent.deleteOne({ worldId: req.params.id });

    // 2. Delete from MySQL (cascades to assets, sessions, metrics)
    await world.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Delete world failed:", error);
    res.status(500).json({ message: error.message });
  }
};