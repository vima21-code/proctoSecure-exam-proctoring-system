import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const SIGNAL_URL = process.env.REACT_APP_SIGNAL_URL || "http://localhost:5000";

// Memoized StudentVideo component without cheated status
const StudentVideo = React.memo(({
  studentId,
  stream,
  status,
  name
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-white p-3 rounded shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <strong className="mr-2">{name || studentId}</strong>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${
            status === "connected"
              ? "bg-green-500 text-white"
              : "bg-yellow-400 text-black"
          }`}
        >
          {status || "pending"}
        </span>
      </div>
      <div className="relative w-full aspect-video rounded overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          id={`video-${studentId}`}
        />
      </div>
    </div>
  );
});

const TutorProctoring = () => {
  const { examId: routeExamId } = useParams(); // optional route param
  const [exams, setExams] = useState([]); // tutor-created exams
  const [selectedExamId, setSelectedExamId] = useState(routeExamId || null);

  // Proctoring state
  const [students, setStudents] = useState({});
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);
  const pcRefs = useRef({});
  const socketIdToStudent = useRef({});
  const pendingIce = useRef({});
  const [tutor, setTutor] = useState(null);

  // get tutor id from token
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user")) || {};
      if (u.token) {
        const dec = jwtDecode(u.token);
        setTutor({ id: dec.id, name: u.name || u.email });
      }
    } catch (e) {
      console.warn("Failed to decode token", e);
    }
  }, []);

  // fetch exams created by tutor
  useEffect(() => {
    if (!tutor) return;
    const fetchExams = async () => {
      try {
        const res = await axiosInstance.get("/exams/tutor/ongoing");
        const filtered = res.data.filter((exam) => {
          const examStart = new Date(`${exam.date}T${exam.startTime}:00`);
          const examEnd = new Date(examStart.getTime() + exam.duration * 60000);
          const now = new Date();
          return now >= examStart && now <= examEnd;
        });
        setExams(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, [tutor]);

  // proctoring socket connection (only when an exam is selected)
  useEffect(() => {
    if (!selectedExamId || !tutor) return;

    console.log(`Setting up socket connection for exam ${selectedExamId} and tutor ${tutor.id}`);

    const s = io(SIGNAL_URL, {
      transports: ["websocket"],
      query: {
        role: "tutor",
        examId: selectedExamId,
        tutorId: tutor.id,
        name: tutor.name
      },
    });

    socketRef.current = s;

    s.on("connect", () => {
      console.log("Tutor signaling connected:", s.id);
      s.emit("tutor-joined-or-refreshed", { examId: selectedExamId, tutorId: tutor.id });
    });

    s.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    // student started
    s.on("student-started", ({ studentId, name, fromSocketId }) => {
      console.log(`Student started: ${name} (${studentId})`);
      if (studentId) {
        socketIdToStudent.current[fromSocketId] = studentId;
        setStudents((prev) => ({
          ...prev,
          [studentId]: {
            ...(prev[studentId] || {}),
            name,
            status: "pending",
            socketId: fromSocketId
          },
        }));
      }
    });

    // handle offers from students
    s.on("webrtc:offer", async ({ offer, studentId, name, fromSocketId }) => {
      try {
        if (fromSocketId && studentId) socketIdToStudent.current[fromSocketId] = studentId;
        if (pcRefs.current[studentId]) {
          try { pcRefs.current[studentId].close(); } catch {}
          delete pcRefs.current[studentId];
        }
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pcRefs.current[studentId] = pc;
        pc.ontrack = (ev) => {
          const stream = ev.streams[0];
          // save in state
          setStudents((prev) => ({
            ...prev,
            [studentId]: {
              ...(prev[studentId] || {}),
              name: name || prev?.[studentId]?.name,
              status: "connected",
              stream
            },
          }));
        };
        pc.onicecandidate = (e) => {
          if (e.candidate && fromSocketId) {
            socketRef.current.emit("webrtc:ice-candidate", {
              candidate: e.candidate,
              targetRole: "student",
              toSocketId: fromSocketId,
              studentId,
            });
          }
        };
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.emit("webrtc:answer", { toSocketId: fromSocketId, answer: pc.localDescription });
        const pend = pendingIce.current[fromSocketId] || [];
        if (pend.length > 0) {
          for (const cand of pend) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (err) {
              console.warn("Tutor: failed to add buffered candidate", err);
            }
          }
          delete pendingIce.current[fromSocketId];
        }
      } catch (err) {
        console.error("Tutor: error handling offer", err);
      }
    });

    // handle ICE
    s.on("webrtc:ice-candidate", ({ candidate, fromSocketId, studentId }) => {
      const sid = studentId || socketIdToStudent.current[fromSocketId];
      const pc = sid ? pcRefs.current[sid] : null;
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => {
          console.error("Tutor addIceCandidate failed:", e);
        });
      } else {
        if (!pendingIce.current[fromSocketId]) pendingIce.current[fromSocketId] = [];
        pendingIce.current[fromSocketId].push(candidate);
      }
    });

    // student disconnected
    s.on("student-disconnected", ({ studentId, socketId }) => {
      console.log(`Student disconnected: ${studentId}`);
      if (socketId) delete socketIdToStudent.current[socketId];
      if (pcRefs.current[studentId]) {
        try { pcRefs.current[studentId].close(); } catch {}
        delete pcRefs.current[studentId];
      }
      setStudents((prev) => {
        const n = { ...prev };
        delete n[studentId];
        return n;
      });
    });

    // Handle cheat events from students
    s.on("cheat-event", (payload) => {
      console.log("🚨 RECEIVED CHEAT EVENT:", payload);
      const { studentId, type, message, time, name } = payload;

      // Add to alerts without updating student's cheated status
      setAlerts(prev => {
        const newAlert = {
          studentId,
          studentName: name || prev.find(a => a.studentId === studentId)?.studentName || studentId,
          message,
          timestamp: new Date(time),
          type
        };
        console.log("Adding new alert:", newAlert);
        return [newAlert, ...prev];
      });

      // Show browser notification if permission is granted
      if (Notification.permission === "granted") {
        new Notification(`Proctoring Alert: ${name || studentId}`, {
          body: message,
          icon: "/favicon.ico"
        });
      }
    });

    // Also listen for proctoring-alert events (in case server sends events this way)
    s.on("proctoring-alert", (payload) => {
      console.log("🚨 RECEIVED PROCTORING ALERT:", payload);
      // Check if this looks like a cheat event
      if (payload.studentId && payload.message) {
        setAlerts(prev => {
          const newAlert = {
            studentId: payload.studentId,
            studentName: payload.name || payload.studentName || payload.studentId,
            message: payload.message,
            timestamp: new Date(payload.time || Date.now()),
            type: payload.type || "unknown"
          };
          console.log("Adding new alert from proctoring-alert:", newAlert);
          return [newAlert, ...prev];
        });
      } else {
        // Handle as a regular alert
        setAlerts((prev) => [{ ...payload, timestamp: new Date() }, ...prev]);
      }
    });

    return () => {
      console.log("Cleaning up socket connection");
      try { s.disconnect(); } catch {}
      Object.values(pcRefs.current).forEach((pc) => { try { pc.close(); } catch {} });
      pcRefs.current = {};
      pendingIce.current = {};
      setStudents({});
    };
  }, [selectedExamId, tutor]);

  // ================= UI =================
  if (!selectedExamId) {
    // show exam list
    return (
      <div 
        className="p-6 min-h-screen bg-cover bg-center"
        // style={{ backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgY1SnUK3L4zcPF79qu0Y-1-lmRiKi-QyUYg&s')` }}
      >
        <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-xl backdrop-blur-sm max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">My Exams</h1>
          {exams.length === 0 ? (
            <p className="text-gray-600">No exams created yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div key={exam._id} className="bg-white p-4 rounded shadow">
                  <h2 className="text-lg font-semibold">{exam.title}</h2>
                  <p className="text-sm text-gray-500">
                    Starts: {new Date(`${exam.date}T${exam.startTime}:00`).toLocaleString()}
                  </p>
                  <button
                    onClick={() => setSelectedExamId(exam._id)}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Open Proctoring
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // proctoring view
  return (
    <div className="p-6">
      <button
        onClick={() => setSelectedExamId(null)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Exams
      </button>
      <h1 className="text-2xl font-bold mb-4">Proctoring — Exam {selectedExamId}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-3">Live Student Feeds</h2>
          {Object.keys(students).length === 0 ? (
            <p className="text-gray-600">Waiting for students...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(students).map(([sid, s]) => (
                <StudentVideo
                  key={sid}
                  studentId={sid}
                  stream={s.stream}
                  status={s.status}
                  name={s.name}
                />
              ))}
            </div>
          )}
        </div>
        <aside className="bg-red-50 p-4 rounded shadow-inner">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Proctoring Alerts</h3>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
            </span>
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-600">No alerts yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alerts.map((a, i) => (
                <div key={i} className="bg-white p-3 rounded border-l-4 border-red-500 shadow-sm">
                  <div className="text-sm font-medium">
                    {a.studentName ? `${a.studentName}: ${a.message}` : a.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(a.timestamp).toLocaleString()}
                    {a.type && (
                      <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                        {a.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default TutorProctoring;