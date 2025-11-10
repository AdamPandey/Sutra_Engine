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