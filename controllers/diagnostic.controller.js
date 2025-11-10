// controllers/diagnostic.controller.js
const db = require("../models");
const Diagnostic = db.diagnostic;

exports.create = (req, res) => {
  Diagnostic.create({
    eventType: req.body.eventType,
    logMessage: req.body.logMessage,
    worldId: req.body.worldId || null
  })
    .then(data => res.status(201).send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  Diagnostic.findAll({ order: [['createdAt', 'DESC']] })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findOne = (req, res) => {
  Diagnostic.findByPk(req.params.id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Diagnostic not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  Diagnostic.destroy({ where: { id: req.params.id } })
    .then(num => {
      if (num == 1) res.status(204).send();
      else res.status(404).send({ message: "Diagnostic not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};