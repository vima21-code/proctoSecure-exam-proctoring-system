const { Server } = require("socket.io");
function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });
  // map socketId -> meta
  const clients = new Map();
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);
    const q = socket.handshake.query || {};
    const role = q.role || "unknown";
    const examId = q.examId || null;
    const studentId = q.studentId || null;
    const tutorId = q.tutorId || null;
    const name = q.name || null;
    clients.set(socket.id, { role, examId, studentId, tutorId, name });
    if (examId) socket.join(examId);
    // Tutor joined -> request students to re-offer
    socket.on("tutor-joined-or-refreshed", ({ examId: eId } = {}) => {
      console.log(`Tutor (${tutorId}) joined or refreshed exam ${eId}. Requesting student offers.`);
      socket.to(eId).emit("request-student-offer", { examId: eId });
    });
    socket.on("student-started", (payload) => {
      const p = payload || {};
      console.log(`👩‍🎓 Student started:`, p.studentId, "exam", p.examId);
      socket.to(p.examId).emit("student-started", { studentId: p.studentId, name: p.name, fromSocketId: socket.id });
    });
    // Student -> Tutor: offer
    socket.on("webrtc:offer", (payload = {}) => {
      const { examId, studentId, offer, name } = payload;
      console.log(`📡 Offer received from student ${studentId} (socket ${socket.id}) for exam ${examId}`);
      socket.to(examId).emit("webrtc:offer", { offer, studentId, name, fromSocketId: socket.id });
    });
    // Tutor -> Student: answer (target student's socket)
    socket.on("webrtc:answer", (payload = {}) => {
      const { toSocketId, answer } = payload;
      if (toSocketId) io.to(toSocketId).emit("webrtc:answer", { answer, fromSocketId: socket.id });
    });
    // ICE routing
    socket.on("webrtc:ice-candidate", (payload = {}) => {
      const { examId, candidate, targetRole, toSocketId, studentId } = payload;
      if (targetRole === "tutor") {
        socket.to(examId).emit("webrtc:ice-candidate", { candidate, fromSocketId: socket.id, studentId });
        return;
      }
      if (targetRole === "student" && toSocketId) {
        io.to(toSocketId).emit("webrtc:ice-candidate", { candidate, fromSocketId: socket.id });
        return;
      }
      console.log("⚠️ Unknown ICE routing payload:", payload);
    });
    
    // Handle cheat events from students
    socket.on("cheat-event", (payload = {}) => {
      const { examId, studentId, type, message, time, name } = payload;
      console.log(`🚨 Cheat event from student ${studentId} in exam ${examId}: ${type} - ${message}`);
      // Forward to the tutor in the same exam room
      socket.to(examId).emit("cheat-event", { studentId, type, message, time, name });
    });
    
    socket.on("disconnect", (reason) => {
      const meta = clients.get(socket.id) || {};
      console.log(`❌ Client disconnected: ${socket.id} reason=${reason} role=${meta.role}`);
      if (meta.examId) io.to(meta.examId).emit("student-disconnected", { studentId: meta.studentId, socketId: socket.id, name: meta.name });
      clients.delete(socket.id);
    });
  });
  return io;
}
module.exports = setupSocket;