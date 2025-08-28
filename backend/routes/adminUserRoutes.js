const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  blockUser,
  unblockUser,
  getStudentsWithJoinedClassrooms,
  getTutorsWithClassrooms,
} = require("../controllers/adminUserController");
const User = require("../models/User");

const router = express.Router();

router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id/block", protect, adminOnly, blockUser); 

// GET all blocked users
router.get("/blocked", protect, adminOnly, async (req, res) => {
  try {
    const blockedUsers = await User.find({ isBlocked: true }).select("name _id email");
    res.json(blockedUsers);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id/unblock", protect, adminOnly, unblockUser); 
router.get("/tutors", protect, adminOnly, getTutorsWithClassrooms);
router.get("/students", protect, adminOnly, getStudentsWithJoinedClassrooms);
module.exports = router;