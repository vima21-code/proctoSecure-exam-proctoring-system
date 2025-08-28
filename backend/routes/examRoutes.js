const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload"); 
const { createExam, getTutorExams,getStudentDashboardExams,getOngoingExams ,updateExam,deleteExam,getExamForStudent ,getExamById, getExamsByClassroom } = require("../controllers/examController");
const { protect } = require("../middleware/authMiddleware");
const cheatController = require("../controllers/cheatController");


router.post("/", protect, upload.single("paper"), createExam);
router.get("/tutor", protect, getTutorExams);
//for students to view exams by classrooms
router.get("/classroom/:id", protect, getExamsByClassroom);


//editing and delete
router.put("/:id", protect, upload.single("paper"), updateExam);
router.delete("/:id", protect, deleteExam);
router.get("/exams/:id", protect, getExamById); 
//studentside
router.get("/student/:id", protect, getExamForStudent);
router.get("/student/exams", protect, getStudentDashboardExams); // all exams

router.post("/:examId/cheat-event", protect, cheatController.logCheatEvent);

// GET cheat logs for an exam (tutor)
router.get("/:examId/cheat-logs", protect, cheatController.getCheatLogsForExam);

router.get("/tutor/ongoing",  protect, getOngoingExams);
module.exports = router;
