const Classroom = require("../models/Classroom");
const User = require("../models/User");

// For tutor

exports.createClassroom = async (req, res) => {
  const { title } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const classroom = await Classroom.create({
      title,
      code: Math.random().toString(36).substr(2, 6), // random 6-letter code
      tutor: req.user.id,
    });
    res.status(201).json({ classroom });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTutorClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ tutor: req.user.id });
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching classrooms" });
  }
};

exports.updateClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom || classroom.tutor.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    classroom.title = req.body.title || classroom.title;
    await classroom.save();
    res.json({ classroom });
  } catch (err) {
    res.status(500).json({ error: "Error updating classroom" });
  }
};

exports.deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom || classroom.tutor.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await classroom.remove();
    res.json({ msg: "Classroom deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting classroom" });
  }
};

exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    if (classroom.tutor.toString() === req.user.id) {
      return res.status(200).json(classroom);
    }

    if (classroom.students.includes(req.user.id)) {
      return res.status(200).json(classroom);
    }

    return res.status(403).json({ error: "Unauthorized access" });
  } catch (err) {
    console.error("Error fetching classroom:", err);
    res.status(500).json({ error: "Error fetching classroom" });
  }
};

// Studentside
// Student joins classroom using code
exports.joinClassroom = async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  try {
    const classroom = await Classroom.findOne({ code });
    if (!classroom) return res.status(404).json({ error: "Invalid classroom code" });

    // Add student to classroom if not already added
    if (!classroom.students.includes(userId)) {
      classroom.students.push(userId);
      await classroom.save();
    }
    const student = await User.findById(userId);
    if (!student.joinedClassrooms.includes(classroom._id)) {
      student.joinedClassrooms.push(classroom._id);
      await student.save();
    }

    res.status(200).json({ msg: "Joined classroom successfully", classroom });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
// Student gets all joined classrooms
exports.getJoinedClassrooms = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).populate({
      path: "joinedClassrooms",
      populate: { path: "tutor", select: "firstName lastName email" },
    });

    res.status(200).json(student.joinedClassrooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch joined classrooms" });
  }
};

exports.exitClassroom = async (req, res) => {
  const { classroomId } = req.params;
  const userId = req.user.id;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedClassrooms: classroomId },
    });

    await Classroom.findByIdAndUpdate(classroomId, {
      $pull: { students: userId },
    });

    res.status(200).json({ msg: "Exited classroom successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to exit classroom" });
  }
};




// Get all classrooms created by the tutor, with students populated (name only)
exports.getTutorClassroomsWithStudents = async (req, res) => {
  try {
    // Find classrooms where tutor is logged-in user
    const classrooms = await Classroom.find({ tutor: req.user.id })
      .populate("students", "firstName lastName email").select("title students");

    res.status(200).json(classrooms);
  } catch (err) {
    console.error("Error fetching tutor classrooms with students:", err);
    res.status(500).json({ error: "Failed to load classes." });
  }
};
