// controllers/cheatController.js
const CheatingLog = require("../models/CheatingLog");
const Exam = require("../models/Exam");
const Submission = require("../models/Submission");


// Called by client to log event (also emits to tutor via Socket.IO)
exports.logCheatEvent = async (req, res) => {
  try {
    const { examId } = req.params;
    const { type, message, time, studentId } = req.body;
    const userId = studentId || (req.user && req.user._id);

    const exam = await Exam.findById(examId).populate("classroom createdBy");
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const classroomId = exam.classroom ? exam.classroom._id : null;

    // create cheating log
    const log = await CheatingLog.create({
      student: userId,
      exam: examId,
      classroom: classroomId,
      type,
      message,
      timestamp: time || Date.now(),
    });

    // Attach to submission if exists (mark suspicious)
    const submission = await Submission.findOne({ student: userId, exam: examId });
    if (submission) {
      submission.suspicious = true;
      submission.cheatEvents = submission.cheatEvents || [];
      submission.cheatEvents.push({ type, message, time: time || new Date() });
      await submission.save();
    }

    // Emit to tutor's socket if available
    // app-level socket mapping stored at req.app.locals.tutorSockets and io at req.app.get('io')
    // const io = req.app.get("io");
    // const tutorSockets = req.app.locals.tutorSockets || {};
    // const tutorId = exam.createdBy ? exam.createdBy.toString() : null;
    // const tutorSocketId = tutorSockets[tutorId];

    // const payload = {
    //   studentId: userId,
    //   studentName: req.user ? `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim() : "Student",
    //   examId,
    //   examTitle: exam.title,
    //   message: message || type,
    //   type,
    //   time: log.timestamp,
    // };

    // if (io && tutorSocketId) {
    //   io.to(tutorSocketId).emit("violation_notification", payload);
    // }

    res.status(201).json({ log });
  } catch (err) {
    console.error("logCheatEvent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/exams/:examId/cheat-logs
// Tutor can fetch cheat logs for the exam
exports.getCheatLogsForExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const logs = await CheatingLog.find({ exam: examId }).populate("student", "firstName lastName email").sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
