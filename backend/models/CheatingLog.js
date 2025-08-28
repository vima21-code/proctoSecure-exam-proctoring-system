// models/CheatingLog.js
const mongoose = require("mongoose");

const cheatingLogSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: "Classroom", required: true },
  type: {
    type: String,
    enum: ["tab-switch", "copy-paste", "refresh", "back", "contextmenu", "cut"],
    required: true,
  },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("CheatingLog", cheatingLogSchema);
