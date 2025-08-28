const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload");
const { protect, tutorOnly, studentOnly } = require("../middleware/authMiddleware");
const {
  submitExam,
  getExamForStudent,
  getTutorSubmissions,
  getSubmissionById,
  registerCheatEvent,
  evaluateSubmission,
  getStudentResults,
} = require("../controllers/submissionController");

// Student fetches a specific exam (fixed path)
router.get("/student/:id", protect, getExamForStudent);

// Student submits an exam
router.post("/:id/submit", protect, upload.single("answer"), submitExam);

// Register a cheat event
router.post("/:id/cheat-event", protect, registerCheatEvent);

// Tutor fetches all submissions for their exams
router.get("/tutor", protect, tutorOnly, getTutorSubmissions);

// Tutor gets a single submission for evaluation
router.get("/:id", protect, tutorOnly, getSubmissionById);

// Tutor evaluates a submission
router.put("/evaluate/:id", protect, tutorOnly, evaluateSubmission);

router.get(
  "/results/student",
  protect,
  studentOnly,
  getStudentResults
);


module.exports = router;
