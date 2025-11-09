// controllers/auth.controller.js
const { db } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = db.user;

exports.register = async (req, res) => {
  try {
    await User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(404).send({ message: "User Not found." });

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ accessToken: null, message: "Invalid Password!" });

    // FIXED: Use process.env.JWT_SECRET
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};