const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ msg: 'All fields required' });

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashed,
      role,
      hasProfile: false, // force first-time profile
    });

    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      token,
      role: user.role,
      name: user.name,
      hasProfile: false, // force redirect to /profile
      msg: 'Registered successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    //  Prevent blocked users from logging in
    if (user.isBlocked) {
      return res.status(403).json({ msg: 'Your account has been blocked. Please contact support.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      hasProfile: user.hasProfile ?? true,
      msg: 'Logged in successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

