const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  submitEnquiry,
  getEnquiries,
  replyToEnquiry,
} = require('../controllers/enquiryController');

const router = express.Router();

// Public route to submit enquiry
router.post('/', submitEnquiry);

// Admin-only routes
router.get('/', protect, adminOnly, getEnquiries);
router.put('/:id/reply', protect, adminOnly, replyToEnquiry);

module.exports = router;
