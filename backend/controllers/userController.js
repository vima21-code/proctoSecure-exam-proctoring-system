const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {
      firstName: req.body.firstName || '',
      lastName: req.body.lastName || '',
      phone: req.body.phone || '',
      address: req.body.address || '',
      institution: req.body.institution || '',
      specialization: req.body.specialization || '',
      avatarColor: req.body.avatarColor || '',
      hasProfile: true,
    };

    // ✅ Add this only if a file is uploaded
    if (req.file) {
      updates.profilePicture = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

