const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // We use the Authorization header for professional REST APIs
  let authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).send({ message: "No token provided!" });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, "your-super-secret-key-change-this", (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken };