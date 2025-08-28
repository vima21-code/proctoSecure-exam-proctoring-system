// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    
    if (!req.user) {
      return res.status(401).json({ msg: "User not found" });
    }

    // Blocked users can't access anything
    if (req.user.isBlocked) {
      return res.status(403).json({ msg: "Your account has been blocked. Please contact support." });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role?.toLowerCase() !== "admin") {
    return res.status(403).json({ msg: "Access denied: Admins only" });
  }
  next();
};

exports.tutorOnly = (req, res, next) => {
  if (!req.user || req.user.role?.toLowerCase() !== "tutor") {
    return res.status(403).json({ msg: "Access denied: Tutors only" });
  }
  next();
};
exports.studentOnly = (req, res, next) => {
  if (!req.user || req.user.role?.toLowerCase() !== "student") {
    return res.status(403).json({ msg: "Access denied: Students only" });
  }
  next();
};