const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

/**
 * Get exam details for a student (with classroomId)
 */
exports.getExamForStudent = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId)
      .populate("classroom", "_id title");

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    if (!exam.classroom) {
      return res.status(400).json({ error: "This exam has no linked classroom." });
    }

    const examObj = exam.toObject();
    examObj.classroomId = exam.classroom._id; // guaranteed now

    res.json(examObj);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Student submits an exam
 */
exports.submitExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const userId = req.user._id;

    const existingSubmission = await Submission.findOne({
      exam: examId,
      student: userId,
    });

    if (existingSubmission) {
      return res
        .status(409)
        .json({ error: "You have already submitted this exam." });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const examType = exam.type ? exam.type.toLowerCase() : null;
    const { classroomId, answers } = req.body;

    if (!classroomId) {
      return res
        .status(400)
        .json({ error: "Classroom ID is required for submission." });
    }

    let submissionData = {
      student: userId,
      exam: examId,
      classroom: classroomId,
      status: "pending",
    };

    if (examType === "upload") {
      if (req.file) {
        submissionData.answers = { answerFile: req.file.filename };
      } else if (answers && answers.text) {
        submissionData.answers = { textAnswer: answers.text };
      } else {
        return res
          .status(400)
          .json({ error: "Answer file or text is required." });
      }
    } else if (examType === "mcq") {
  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).json({ error: "Answers must be provided." });
  }

  let score = 0;
  if (exam.mcqs) {
    // Iterate over the submitted answers object
    for (const [index, studentAnswer] of Object.entries(answers)) {
      const mcq = exam.mcqs[parseInt(index, 10)];
      if (mcq && String(studentAnswer) === String(mcq.correctAnswer)) {
        score++;
      }
    }
  }

  submissionData.answers = answers; // Save the object directly
  submissionData.score = score;
} else {
      return res.status(400).json({ error: "Invalid exam type" });
    }

    const newSubmission = new Submission(submissionData);
    await newSubmission.save();

    if (examType === "mcq") {
      return res
        .status(200)
        .json({ message: "Submitted", score: submissionData.score });
    } else {
      return res.status(200).json({ message: "Answer submitted" });
    }
  } catch (error) {
    console.error("Error in submitExam:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Tutor fetches all submissions for their exams
 */
exports.getTutorSubmissions = async (req, res) => {
  try {
    const tutorExams = await Exam.find({ createdBy: req.user._id }).select("_id");
    if (tutorExams.length === 0) {
      return res.json([]);
    }
    const examIds = tutorExams.map((exam) => exam._id);
    const submissions = await Submission.find({ exam: { $in: examIds } })
      .populate("student", "name")
      .populate("exam", "title type");

    const submissionsWithUrls = submissions.map(sub => {
      const submissionObj = sub.toObject();
      if (submissionObj.exam.type?.toLowerCase() === 'upload' && submissionObj.answers?.answerFile) {
        submissionObj.uploadedFileUrl = `/uploads/${submissionObj.answers.answerFile}`;
      }
      return submissionObj;
    });

    res.json(submissionsWithUrls);
  } catch (error) {
    console.error("Error fetching tutor submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get detailed submission by ID for evaluation
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("student", "name email")
      .populate("exam");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const submissionObj = submission.toObject();

    // Convert exam type to lowercase for a consistent check
    const examType = submissionObj.exam?.type?.toLowerCase();

    // Fix 1: Ensure MCQ answers are an array for the frontend
    if (examType === "mcq") {
        if (submissionObj.answers && typeof submissionObj.answers === 'object' && !Array.isArray(submissionObj.answers)) {
            // Convert object to array, which is what the frontend expects
            submissionObj.answers = Object.values(submissionObj.answers);
        }
    }
    
    // Fix 2: Handle both 'textAnswer' and 'answerFile' for upload exams independently
    if (examType === "upload") {
        if (submissionObj.answers?.textAnswer) {
            submissionObj.textAnswer = submissionObj.answers.textAnswer;
        }
        if (submissionObj.answers?.answerFile) {
            submissionObj.uploadedFileUrl = `/uploads/${submissionObj.answers.answerFile}`;
        }
    }

    res.json(submissionObj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Register a cheat event for an active exam attempt.
 */
exports.registerCheatEvent = async (req, res) => {
  try {
    const examId = req.params.id;
    const studentId = req.user._id;
    const { type, message } = req.body;

    const submission = await Submission.findOne({ exam: examId, student: studentId });

    if (!submission) {
      return res.status(404).json({ error: "No active submission found for this exam." });
    }

    submission.suspicious = true;
    submission.cheatEvents.push({ type, message, time: new Date() });
    await submission.save();

    res.status(200).json({ message: "Cheat event registered successfully." });
  } catch (error) {
    console.error("Error registering cheat event:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.evaluateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { score, totalScore, grade, assessmentReport } = req.body; // Add totalScore here

        const submission = await Submission.findById(id);
        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        submission.score = score;
        submission.totalScore = totalScore; // Save the total score
        submission.grade = grade;
        submission.assessmentReport = assessmentReport;
        submission.status = "evaluated";

        await submission.save();

        res.status(200).json({ message: "Submission evaluated successfully" });
    } catch (err) {
        console.error("Error evaluating submission:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user._id;

    const submissions = await Submission.find({
      
      student: studentId,
      // Find submissions that have been evaluated
      $or: [
        { score: { $exists: true, $ne: null } },
        { grade: { $exists: true, $ne: null } },
        { assessmentReport: { $exists: true, $ne: null } }
      ]
    })
    .populate("exam", "title type")
    .populate("classroom", "title")
    .sort({ submittedAt: -1 });

    const results = submissions.map(sub => ({
         
      _id: sub._id,
      examTitle: sub.exam.title,
      classroomTitle: sub.classroom.title,
      score: sub.score,
      totalScore: sub.totalScore ,
      
      grade: sub.grade,
      assessmentReport: sub.assessmentReport,
      submittedAt: sub.submittedAt,
    }));

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching student results:", err);
    res.status(500).json({ message: "Server error" });
  }
};