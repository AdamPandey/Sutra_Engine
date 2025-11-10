const jwt = require("jsonwebtoken");
// --- THIS IS THE FIX ---
// It was importing from '../config/db', which does not have the models.
// It MUST import from '../models'.
const db = require("../models");
const User = db.user;

const verifyToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send({ message: "No token provided!" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken };