const mongoose = require("mongoose");
const nanoid = require("nanoid");

const classroomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, default: () =>nanoid(6) , unique: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Classroom", classroomSchema);
