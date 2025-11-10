// controllers/platform.controller.js
const db = require("../models");
const Platform = db.platform;

exports.create = (req, res) => {
  Platform.create({ name: req.body.name })
    .then(data => res.status(201).send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  Platform.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findOne = (req, res) => {
  Platform.findByPk(req.params.id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Platform not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.update = (req, res) => {
  Platform.update(req.body, { where: { id: req.params.id } })
    .then(num => {
      if (num == 1) res.send({ message: "Platform updated successfully." });
      else res.status(404).send({ message: "Platform not found or req.body is empty." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  Platform.destroy({ where: { id: req.params.id } })
    .then(num => {
      if (num == 1) res.status(204).send();
      else res.status(404).send({ message: "Platform not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};