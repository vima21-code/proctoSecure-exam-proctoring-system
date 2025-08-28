const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ["MCQ", "Upload"], required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required:true },
  filePath: String, // for uploaded papers
  mcqs: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    }
  ],
  date: {
  type: String,
  required: true,
},
startTime: {
  type: String,
  required: true,
},
duration: {
  type: Number,
  required: true,
},
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required:true, },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Exam", examSchema);
