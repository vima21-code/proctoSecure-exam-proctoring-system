const Exam = require("../models/Exam");
const User = require("../models/User");
const Classroom = require("../models/Classroom");
const Submission = require("../models/Submission");

exports.createExam = async (req, res) => {
  try {
    const { title, type, classroomId, date, startTime, duration } = req.body;
    let mcqs = req.body.mcqs;

    if (!title || !type || !classroomId || !date || !startTime || !duration) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (type === "MCQ" && mcqs) {
      try {
        mcqs = JSON.parse(mcqs);
      } catch (err) {
        return res.status(400).json({ error: "Invalid MCQ format" });
      }
    }

    const filePath = req.file ? req.file.path : null;

    const exam = await Exam.create({
      title,
      type,
      classroom: classroomId,
      filePath,
      mcqs,
      date,
      startTime,
      duration,
      createdBy: req.user.id,
    });

    res.status(201).json(exam);
  } catch (err) {
    console.error("Create exam error:", err);
    res.status(500).json({ error: "Failed to create exam" });
  }
};

// GET exams created by tutor
exports.getTutorExams = async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user.id }).populate("classroom", "title code");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

// GET exams by classroom for student view
exports.getExamsByClassroom = async (req, res) => {
  try {
    const exams = await Exam.find({ classroom: req.params.id }).populate("classroom");
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch classroom exams" });
  }
};
exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
   .populate("tutor", "firstName lastName email _id") 
      .populate("classroom");
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // Ensure only the creator can view/edit
    if (exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch exam" });
  }
};

// UPDATE exam
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    if (exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, type, date, classroomId, startTime, duration } = req.body;
    let mcqs = req.body.mcqs;

    if (type === "MCQ" && mcqs) {
      try {
        mcqs = JSON.parse(mcqs);
      } catch (err) {
        return res.status(400).json({ error: "Invalid MCQ format" });
      }
    }

    // Delete old file if new uploaded
    if (req.file && exam.filePath) {
      const fs = require("fs");
      fs.unlink(exam.filePath, (err) => {
        if (err) console.log("Old file deletion failed:", err.message);
      });
    }

    // Update exam fields
    exam.title = title || exam.title;
    exam.type = type || exam.type;
    exam.classroom = classroomId || exam.classroom;
    exam.date = date || exam.date;
    exam.startTime = startTime || exam.startTime;
    exam.duration = duration || exam.duration;
    exam.mcqs = type === "MCQ" ? mcqs : exam.mcqs;
    exam.filePath = req.file ? req.file.path : exam.filePath;

    await exam.save();
    res.json({ message: "Exam updated successfully", exam });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update exam" });
  }
};


// DELETE exam
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    // Ensure only creator can delete
    if (exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (exam.filePath) {
      fs.unlink(exam.filePath, (err) => {
        if (err) console.log("File deletion error:", err.message);
      });
    }

    await exam.deleteOne();
    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete exam" });
  }
};

//for studentside
exports.getExamForStudent = async (req, res) => {
  try {
    const examId = req.params.id;
    const userId = req.user.id;

    // Step 1: Find the exam and populate the classroom details
    const exam = await Exam.findById(examId).populate("classroom");
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    // Step 2: Check if the student is in the classroom associated with the exam
    const user = await User.findById(userId);
    const joinedClassroomIds = user.joinedClassrooms.map((c) => c.toString());

    if (!joinedClassroomIds.includes(exam.classroom._id.toString())) {
      return res.status(403).json({ error: "You have not joined this classroom." });
    }

    // Step 3: Check if a submission already exists for this student and exam
    const existingSubmission = await Submission.findOne({
      exam: examId,
      student: userId,
    });

    // Step 4: Add the submissionId to the response object if it exists
    const examWithSubmission = {
      ...exam._doc, // Use ._doc to get a plain JavaScript object
      submissionId: existingSubmission ? existingSubmission._id : null,
      submitted: !!existingSubmission,
    };

    res.json(examWithSubmission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exam" });
  }
};

//all exams in exams sidebar
exports.getStudentDashboardExams = async (req, res) => {
  try {
    const studentId = req.user.id; // Assuming user ID is available from authentication middleware

    // Step 1: Get a list of all submitted exam IDs for the student
    const submittedExams = await Submission.find({ student: studentId }).select('exam');
    const submittedExamIds = submittedExams.map(sub => sub.exam.toString());

    // Step 2: Get all classrooms the student has joined
    const user = await User.findById(studentId).populate('joinedClassrooms');
    const classroomIds = user.joinedClassrooms.map(c => c._id);

    // Step 3: Find all exams associated with these classrooms
    const allExams = await Exam.find({ classroom: { $in: classroomIds } }).populate('classroom');

    const now = new Date();

    // Step 4: Map through all exams and add a 'status' field
    const examsWithStatus = allExams.map(exam => {
      const start = new Date(`${exam.date}T${exam.startTime}:00`);
      const end = new Date(start.getTime() + exam.duration * 60000);
      let status;

      // Correctly prioritize 'submitted' over 'expired'
      if (submittedExamIds.includes(exam._id.toString())) {
        status = "submitted";
      } else if (now >= start && now <= end) {
        status = "ongoing";
      } else if (now < start) {
        status = "upcoming";
      } else {
        status = "expired";
      }

      return {
        ...exam._doc, // Use ._doc to get a plain JS object
        status,
        classroomName: exam.classroom.name
      };
    });

    res.json(examsWithStatus);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch student exams" });
  }
};

exports.getOngoingExams = async (req, res) => {
  try {
    const tutorId = req.user._id; 
    const now = new Date();

    const exams = await Exam.find({ createdBy: tutorId });

    const ongoingExams = exams.filter((exam) => {
      if (!exam.date || !exam.startTime) return false;

      // parse startTime "HH:mm" safely
      const [hours, minutes] = exam.startTime.split(":").map(Number);
      const examStart = new Date(exam.date);
      examStart.setHours(hours, minutes, 0, 0);

      const examEnd = new Date(examStart.getTime() + exam.duration * 60000);

      // console.log("Exam:", exam.title, "Start:", examStart, "End:", examEnd, "Now:", now);

      return now >= examStart && now <= examEnd;
    });

    res.json(ongoingExams);
  } catch (error) {
    console.error("Error fetching ongoing exams:", error);
    res.status(500).json({ message: "Server error" });
  }
};





