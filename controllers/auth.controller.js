const db = require('../models');
const User = db.user;
// FIX: Changed from 'bcrypt' (which was causing the error) to 'bcryptjs'
const bcryptjs = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Using the correct variable 'bcryptjs'
    const hashed = await bcryptjs.hash(password, 10); 
    const user = await User.create({ email, password: hashed, name });
    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Using the correct variable 'bcryptjs'
    const match = await bcryptjs.compare(password, user.password); 
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};