//for profile
const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("profilePicture"), updateProfile);

module.exports = router;
