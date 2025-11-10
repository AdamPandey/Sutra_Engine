// controllers/genre.controller.js
const db = require("../models");
const Genre = db.genre;

exports.create = (req, res) => {
  Genre.create({ name: req.body.name })
    .then(data => res.status(201).send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  Genre.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findOne = (req, res) => {
  Genre.findByPk(req.params.id)
    .then(data => {
      if (data) res.send(data);
      else res.status(404).send({ message: "Genre not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.update = (req, res) => {
  Genre.update(req.body, { where: { id: req.params.id } })
    .then(num => {
      if (num == 1) res.send({ message: "Genre updated successfully." });
      else res.status(404).send({ message: "Genre not found or req.body is empty." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.delete = (req, res) => {
  Genre.destroy({ where: { id: req.params.id } })
    .then(num => {
      if (num == 1) res.status(204).send();
      else res.status(404).send({ message: "Genre not found." });
    })
    .catch(err => res.status(500).send({ message: err.message }));
};