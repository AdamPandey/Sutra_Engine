// controllers/game.controller.js
const db = require("../models");
const Game = db.game;

// All operations are scoped to the authenticated user
exports.create = (req, res) => {
  Game.create({
    title: req.body.title,
    description: req.body.description,
    userId: req.userId // Comes from the JWT middleware
  })
    .then(data => res.status(201).send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  Game.findAll({ where: { userId: req.userId } })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findOne = (req, res) => {
  Game.findOne({ where: { id: req.params.id, userId: req.userId } })
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Game not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.update = (req, res) => {
  Game.update(req.body, { where: { id: req.params.id, userId: req.userId } })
    .then(num => {
      if (num == 1) res.send({ message: "Game updated successfully." });
      else res.status(404).send({ message: "Game not found or req.body is empty." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  Game.destroy({ where: { id: req.params.id, userId: req.userId } })
    .then(num => {
      if (num == 1) res.status(204).send();
      else res.status(404).send({ message: "Game not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};