// models/Enquiry.js
const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
  replyMessage: { type: String, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Enquiry', EnquirySchema);