// server.js (or index.js)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const setupSocket = require("./socket");
const fs = require("fs");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const http = require("http");
// const { Server } = require("socket.io");

const examRoutes = require("./routes/examRoutes");
// const Exam = require("./models/Exam");

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving
app.use("/profileuploads", express.static(path.join(__dirname, "profileuploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get(["/preview/:filename", "/preview/uploads/:filename"], (req, res) => {
  const file = path.join(__dirname, "uploads", req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).send("File not found");
  const ext = path.extname(file).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
  };
  res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
  res.setHeader("Content-Disposition", "inline");
  fs.createReadStream(file).pipe(res);
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/classrooms", require("./routes/classroomRoutes"));
app.use("/api/exams", examRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/api/admin/users", require("./routes/adminUserRoutes"));
app.use("/api/enquiries", require("./routes/enquiryRoutes"));
app.use("/api/admin/events", require("./routes/eventRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));


//---Socket IO------

// const { Server } = require("socket.io");

const io = setupSocket(server);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port", process.env.PORT || 5000);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });


 
