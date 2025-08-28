const User = require("../models/User");
const Classroom = require("../models/Classroom"); // import Classroom

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    if (role) filter.role = role.toLowerCase();
    if (status === "active") filter.isBlocked = false;
    if (status === "blocked") filter.isBlocked = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const users = await User.find(filter).select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isBlocked = true;
    await user.save();
    res.json({ msg: "User blocked successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isBlocked = false;
    await user.save();
    res.json({ msg: "User unblocked successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getTutorsWithClassrooms = async (req, res) => {
  try {
    const tutors = await User.find({ role: "tutor" }).select("-password");

    const tutorsWithClassrooms = await Promise.all(
      tutors.map(async (tutor) => {
        const classrooms = await Classroom.find({ tutor: tutor._id }).select("title code");
        return { ...tutor.toObject(), classrooms };
      })
    );

    res.json(tutorsWithClassrooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getStudentsWithJoinedClassrooms = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");

    const studentsWithClassrooms = await Promise.all(
      students.map(async (student) => {
        const classrooms = await Classroom.find({ students: student._id }).select("title code");
        return { ...student.toObject(), classrooms };
      })
    );

    res.json(studentsWithClassrooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
