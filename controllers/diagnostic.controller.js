// controllers/diagnostic.controller.js
const db = require("../models");
const Diagnostic = db.diagnostic;

exports.findAll = (req, res) => {
  Diagnostic.findAll({ order: [['createdAt', 'DESC']] })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};