import express from "express";
import { getExamCheatLogs } from "../controllers/cheatController.js";
import { protect, tutorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tutor can view cheat logs for their exams
router.get("/:examId", protect, tutorOnly, getExamCheatLogs);

export default router;
