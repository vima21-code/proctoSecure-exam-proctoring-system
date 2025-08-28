const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createClassroom,
  getTutorClassrooms,
  updateClassroom,
  deleteClassroom,
  getClassroomById,
  joinClassroom,
  getJoinedClassrooms,
  exitClassroom,
  getTutorClassroomsWithStudents,
} = require("../controllers/classroomController");

router.post("/", protect, createClassroom);
router.get("/", protect, getTutorClassrooms);
router.put("/:id", protect, updateClassroom);
router.delete("/:id", protect, deleteClassroom);


router.get("/classes-with-students", protect, getTutorClassroomsWithStudents);
router.get("/:id", protect, getClassroomById);

// Student routes
router.post("/join", protect, joinClassroom);
router.get("/student/joined", protect, getJoinedClassrooms);
router.delete("/student/exit/:classroomId", protect, exitClassroom);


module.exports = router;
