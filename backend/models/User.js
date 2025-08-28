const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'tutor', 'student'],
    default: 'student',
  },
  name: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  institution: { type: String, default: '' },
  specialization: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  avatarColor: { type: String, default: '' }, // NEW FIELD
  joinedClassrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Classroom" }],
  isBlocked: { type: Boolean, default: false },
  hasProfile: { type: Boolean, default: false },
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
