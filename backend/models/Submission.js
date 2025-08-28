// models/Submission.js (overwrite your existing file)
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    answers: { type: mongoose.Schema.Types.Mixed, required: true },

    score: { type: Number, default: 0 },
    totalScore: { type: Number, default: null }, 
  grade: { type: String, default: null },
  assessmentReport: { type: String, default: null },
  status: {
    type: String,
    enum: ["pending", "evaluated", "rejected"],
    default: "pending",
  },  
  submittedAt: { type: Date, default: Date.now },

    // NEW: mark suspicious and keep cheat events
    suspicious: { type: Boolean, default: false },
    cheatEvents: [
      {
        type: { type: String },
        message: { type: String },
        time: { type: Date },
      },
    ],

    // optional: if upload submissions store uploaded file path / url
    uploadUrl: { type: String },
  },
   
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
