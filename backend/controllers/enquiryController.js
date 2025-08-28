const Enquiry = require('../models/Enquiry');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Setup Nodemailer transporter (using Gmail, make sure env vars are set)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Submit a new enquiry
exports.submitEnquiry = async (req, res) => {
  const { name, phone, email, message } = req.body;
  try {
    const newEnquiry = new Enquiry({ name, phone, email, message });
    const enquiry = await newEnquiry.save();
    res.status(201).json(enquiry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Get all enquiries (admin only)
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reply to an enquiry (admin only)
exports.replyToEnquiry = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid enquiry ID' });
  }

  try {
    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ msg: 'Enquiry not found' });
    }

    // Send email reply
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: enquiry.email,
      subject: 'Reply to your enquiry from ProctoSecure',
      html: `<p>Dear ${enquiry.name},</p><p>${replyMessage}</p><p>Thank you for contacting us.</p><p>Best regards,<br/>The ProctoSecure Team</p>`,
    };

    await transporter.sendMail(mailOptions);

    // Update enquiry status and replyMessage
    enquiry.status = 'replied';
    enquiry.replyMessage = replyMessage;
    await enquiry.save();

    res.json({ msg: 'Reply sent and enquiry updated' });
  } catch (err) {
    console.error('Error sending email or updating enquiry:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
