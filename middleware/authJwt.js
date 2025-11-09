// middleware/authJwt.js
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const User = db.user;

const verifyToken = (req, res, next) => {
  let authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).send({ message: "No token provided!" });
  }

  const token = authHeader.split(" ")[1];

  // FIXED: Use process.env.JWT_SECRET
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken };