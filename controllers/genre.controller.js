// controllers/genre.controller.js
const db = require("../models");
const Genre = db.genre;

// These are simple lookup tables, not user-specific
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