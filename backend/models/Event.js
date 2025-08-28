// models/Event.js
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  imageUrl: String, 
  eventUrl: String, 
  date: { type: Date, required: true },
  targetAudience: { type: String, enum: ["tutors", "students", "both"], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);