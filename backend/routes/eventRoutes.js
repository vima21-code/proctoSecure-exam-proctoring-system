// routes/eventRoutes.js
const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByAudience,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", protect, adminOnly, getEvents);
router.post("/", protect, adminOnly, createEvent);
router.put("/:id", protect, adminOnly, updateEvent);
router.delete("/:id", protect, adminOnly, deleteEvent);
router.get("/audience", protect, getEventsByAudience);

module.exports = router;
