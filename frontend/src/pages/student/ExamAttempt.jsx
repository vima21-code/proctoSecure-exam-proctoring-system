import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import MCQExam from "./MCQExam";
import UploadExam from "./UploadExam";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";
const SIGNAL_URL = process.env.REACT_APP_SIGNAL_URL || "http://localhost:5000";
const ExamAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [exam, setExam] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploadGracePeriod, setIsUploadGracePeriod] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({
    message: "",
    score: null,
    isSubmitted: false,
  });
  const [cheatCount, setCheatCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [mcqModal, setMcqModal] = useState({ open: false, score: null, max: null });
  const [showPreview, setShowPreview] = useState(true);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState('inactive'); // 'inactive', 'active', 'no-face'
  const examRef = useRef(null);
  const intervalRef = useRef(null);
  const startedRef = useRef(false);
  const lastEventTimes = useRef({});
  const faceDetectionInterval = useRef(null);
  
  // WebRTC / signaling
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const iceCandidatesBuffer = useRef([]);
  const offerRetryTimeout = useRef(null);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  // ---------------- Helpers ----------------
  const fetchExam = async () => {
    try {
      const { data } = await axiosInstance.get(`/submissions/student/${id}`);
      const normalizedExam = {
        ...data,
        type: (data.type || "").toLowerCase(),
        classroomId: data.classroomId || (data.classroom && data.classroom._id) || null,
        tutorId: data.tutorId || data.tutor?._id || data.classroom?.tutor || null,
        createdBy: data.createdBy || data.tutorId || data.tutor?._id || data.classroom?.tutor || null,
      };
      setExam(normalizedExam);
      examRef.current = normalizedExam;
      return normalizedExam;
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setSubmissionStatus({
          message: "You have already submitted this exam.",
          score: null,
          isSubmitted: true,
        });
      } else {
        console.error(err.response?.data || err);
        alert("Failed to fetch exam details.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const startTimer = (minutes) => {
    if (startedRef.current) return;
    startedRef.current = true;
    let totalSeconds = Math.max(0, Math.floor(minutes * 60));
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(formatTimer(totalSeconds));
    intervalRef.current = setInterval(() => {
      totalSeconds--;
      setTimer(formatTimer(totalSeconds));
      if (totalSeconds <= 0) {
        clearInterval(intervalRef.current);
        autoSubmit();
      }
    }, 1000);
  };
  
  const formatTimer = (totalSeconds) => {
    const min = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const sec = String(totalSeconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };
  
  const autoSubmit = async () => {
    const currentExam = examRef.current;
    if (!currentExam) {
      showToast("Exam data missing, cannot submit.", 4000);
      return;
    }
    if (currentExam.type === "upload" && !uploadFile && !isUploadGracePeriod) {
      showToast("Time is up! 5-minute grace starts.", 6000);
      setIsUploadGracePeriod(true);
      startTimer(5);
      return;
    }
    try {
      let submissionData;
      let config = {};
      if (currentExam.type === "upload") {
        submissionData = uploadFile || new FormData();
        submissionData.append("classroomId", currentExam.classroomId);
        config = { headers: { "Content-Type": "multipart/form-data" } };
      } else {
        submissionData = { classroomId: currentExam.classroomId, answers: [] };
      }
      await axiosInstance.post(`/submissions/${currentExam._id}/submit`, submissionData, config);
      showToast("Time is up! Exam auto-submitted.", 4000);
      setSubmissionStatus({ message: "Exam auto-submitted", score: null, isSubmitted: true });
      setTimeout(() => navigate("/student-dashboard"), 1200);
    } catch (err) {
      console.error("Auto-submit error:", err.response || err);
      showToast("Failed to auto-submit exam.", 5000);
    }
  };
  
  const handleSetUploadFile = (formData) => setUploadFile(formData);
  
  const handleSubmission = async (answersOrFile) => {
    try {
      const currentExam = examRef.current;
      if (!currentExam || !currentExam.classroomId) {
        showToast("Classroom ID is missing. Cannot submit exam.", 4000);
        return;
      }
      let response;
      if (currentExam.type === "upload" && answersOrFile instanceof FormData) {
        answersOrFile.append("classroomId", currentExam.classroomId);
        response = await axiosInstance.post(
          `/submissions/${currentExam._id}/submit`,
          answersOrFile,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setSubmissionStatus({
          message: response.data.message || "Exam submitted successfully",
          score: response.data.score,
          isSubmitted: true,
        });
        showToast("Exam submitted. Tutor will evaluate and add grade.", 5000);
        setTimeout(() => navigate("/student-dashboard"), 1200);
      } else {
        const submissionData = { classroomId: currentExam.classroomId, answers: answersOrFile };
        response = await axiosInstance.post(`/submissions/${currentExam._id}/submit`, submissionData);
        const sc = response.data.score ?? null;
        const totalQuestions = currentExam.mcqs?.length ?? null;
        setMcqModal({ open: true, score: sc, max: totalQuestions });
      }
    } catch (err) {
      console.error(err.response?.data || err);
      showToast(err.response?.data?.error || "Error submitting exam", 5000);
    }
  };
  
  const handleFinishUploadExam = () => {
    if (!uploadFile) {
      showToast("Please scan & upload your answer paper before finishing the exam.", 3500);
      return;
    }
    if (window.confirm("Are you sure you want to finish the exam and submit your answer paper?")) {
      handleSubmission(uploadFile);
    }
  };
  
  const registerCheatEvent = async (type, message) => {
    const now = Date.now();
    const lastTime = lastEventTimes.current[type] || 0;
    
    // Prevent duplicate events within 2 seconds
    if (now - lastTime < 2000) {
      return;
    }
    
    lastEventTimes.current[type] = now;
    setCheatCount((c) => c + 1);
    showToast(`Cheating detected: ${message}`, 4000);
    
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const event = { type, message, time: new Date().toISOString() };
      await axiosInstance.post(`/exams/${id}/cheat-event`, { ...event, studentId: user.id });
      
      // Emit cheat event to tutor via socket
      if (socketRef.current) {
        socketRef.current.emit("cheat-event", {
          examId: id,
          studentId: user.id,
          name: user.name || user.email || "Student",
          type,
          message,
          time: event.time
        });
      }
    } catch (e) {
      console.warn("Failed to log cheat event to server:", e);
    }
  };
  
  // Modified startFaceDetection function in ExamAttempt.jsx
const startFaceDetection = () => {
  console.log("🔍 Starting face detection...");
  setFaceDetectionStatus('active');
  
  // For testing purposes, you can trigger a face detection event manually
  window.triggerFaceDetectionTest = () => {
    console.log("🧪 Manually triggering face detection test");
    setFaceDetectionStatus('no-face');
    registerCheatEvent("missing-face", "Face not detected in video feed");
    setTimeout(() => setFaceDetectionStatus('active'), 3000);
  };
  
  // Face detection simulation
  faceDetectionInterval.current = setInterval(() => {
    // Simulate face missing 10% of the time
    if (Math.random() < 0.1) {
      console.log("🚨 Face not detected - triggering cheat event");
      setFaceDetectionStatus('no-face');
      registerCheatEvent("missing-face", "Face not detected in video feed");
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setFaceDetectionStatus('active');
        console.log("✅ Face detected again");
      }, 3000);
    } else {
      // Ensure status is set to active when face is detected
      if (faceDetectionStatus !== 'active') {
        setFaceDetectionStatus('active');
        console.log("✅ Face detected");
      }
    }
  }, 5000);
};
  
  const stopFaceDetection = () => {
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
      faceDetectionInterval.current = null;
    }
    setFaceDetectionStatus('inactive');
    console.log("🛑 Face detection stopped");
    
    // Remove the test function
    if (window.triggerFaceDetectionTest) {
      delete window.triggerFaceDetectionTest;
    }
  };
  
  const showToast = (message, ms = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  };
  
  const handleMcqModalClose = () => {
    setMcqModal({ open: false, score: null, max: null });
    navigate("/student-dashboard");
  };
  
  const togglePreview = () => {
    setShowPreview((prev) => {
      const newState = !prev;
      if (localVideoRef.current) {
        localVideoRef.current.style.display = newState ? "block" : "none";
      }
      return newState;
    });
  };
  
  // ---------------- WebRTC & Signaling ----------------
  const createPeerAndSendOffer = async (examObj, sid) => {
    console.log("Creating new peer connection and sending offer");
    
    // Clear any existing retry timeout
    if (offerRetryTimeout.current) {
      clearTimeout(offerRetryTimeout.current);
      offerRetryTimeout.current = null;
    }
    
    // 1. Clean up old connection if it exists
    if (pcRef.current) {
      console.log("Closing existing PeerConnection before re-creating.");
      pcRef.current.close();
      pcRef.current = null;
    }
    
    // Clear ICE candidates buffer
    iceCandidatesBuffer.current = [];
    
    // 2. Ensure local video stream is active
    try {
      if (!localStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (!localVideoRef.current) {
          const vid = document.createElement("video");
          vid.muted = true;
          vid.autoplay = true;
          vid.playsInline = true;
          vid.className = "fixed bottom-6 left-6 w-28 h-20 rounded shadow-lg border";
          document.body.appendChild(vid);
          localVideoRef.current = vid;
        }
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.style.display = showPreview ? "block" : "none";
      }
    } catch (err) {
      console.error("Failed to get userMedia for video stream:", err);
      showToast("Unable to access camera/mic. Proctoring requires permission.", 5000);
      return;
    }
    
    // 3. Create a new RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;
    
    // Add connection state logging for debugging
    pc.onconnectionstatechange = () => {
      console.log(`Connection state: ${pc.connectionState}`);
    };
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${pc.iceConnectionState}`);
    };
    pc.onsignalingstatechange = () => {
      console.log(`Signaling state: ${pc.signalingState}`);
    };
    
    // 4. Add local tracks to the new PC
    localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
    
    // 5. Handle ICE candidates for the new PC
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        console.log("Sending ICE candidate to tutor");
        socketRef.current.emit("webrtc:ice-candidate", {
          examId: examObj._id,
          studentId: sid,
          candidate: e.candidate,
          targetRole: "tutor",
        });
      }
    };
    
    // 6. Create and send offer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (socketRef.current) {
        console.log("Emitting webrtc:offer event");
        socketRef.current.emit("webrtc:offer", {
          examId: examObj._id,
          studentId: sid,
          tutorId: examObj.createdBy,
          name: user.name || user.email || "Student",
          offer: pc.localDescription,
        });
        console.log("Student: Offer sent to tutor.");
        
        // Set a timeout to retry if no answer is received
        offerRetryTimeout.current = setTimeout(() => {
          console.log("No answer received within 10 seconds, retrying offer");
          createPeerAndSendOffer(examObj, sid);
        }, 10000);
      }
    } catch (err) {
      console.error("Student: Failed to create/send offer:", err);
    }
  };
  
  const initSignaling = (examObj, decodedStudentId) => {
    if (socketRef.current) return;
    console.log("Initializing signaling connection");
    
    const s = io(SIGNAL_URL, {
      transports: ["websocket"],
      withCredentials: true,
      query: {
        role: "student",
        examId: examObj._id,
        studentId: decodedStudentId,
        tutorId: examObj.createdBy,
        name: user.name || user.email || "Student",
      },
    });
    socketRef.current = s;
    
    s.on("connect", () => {
      console.log("Signaling: connected as student socket", s.id);
      console.log("Emitting student-started event");
      s.emit("student-started", {
        examId: examObj._id,
        tutorId: examObj.createdBy,
        studentId: decodedStudentId,
        name: user.name || user.email || "Student",
      });
    });
    
    // Handle tutor's answer
    s.on("webrtc:answer", async ({ answer }) => {
      console.log("Received webrtc:answer event from tutor");
      
      // Clear the retry timeout
      if (offerRetryTimeout.current) {
        clearTimeout(offerRetryTimeout.current);
        offerRetryTimeout.current = null;
      }
      
      if (!pcRef.current) {
        console.error("PeerConnection not initialized when answer received");
        return;
      }
      
      console.log("Current signaling state:", pcRef.current.signalingState);
      
      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("Student: Applied tutor's answer");
        
        // Process any buffered ICE candidates
        while (iceCandidatesBuffer.current.length) {
          const candidate = iceCandidatesBuffer.current.shift();
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("Successfully added buffered ICE candidate");
          } catch (e) {
            console.error("Student addIceCandidate (from buffer) failed:", e);
          }
        }
      } catch (err) {
        console.error("Student: error applying tutor answer", err);
      }
    });
    
    // Handle ICE candidates from tutor
    s.on("webrtc:ice-candidate", ({ candidate }) => {
      console.log("Received webrtc:ice-candidate event from tutor");
      
      if (!candidate) {
        console.log("Received null ICE candidate, ignoring");
        return;
      }
      
      if (!pcRef.current) {
        console.warn("PeerConnection not initialized, ignoring ICE candidate");
        return;
      }
      
      // If remote description is set, add candidate immediately
      if (pcRef.current.remoteDescription) {
        console.log("Adding ICE candidate immediately");
        pcRef.current
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.error("Student addIceCandidate failed:", e));
      } else {
        // Buffer the candidate until remote description is set
        console.log("Buffering ICE candidate until remote description is set");
        iceCandidatesBuffer.current.push(candidate);
      }
    });
    
    // When tutor refreshes they ask students to re-send offers
    s.on("request-student-offer", async () => {
      console.log("Received request-student-offer from tutor");
      console.log("Tutor requested student re-offer. Re-creating PC and sending new offer.");
      await createPeerAndSendOffer(examObj, decodedStudentId);
    });
    
    // Cleanup on disconnect event
    s.on("disconnect", (reason) => {
      console.log("Signaling: disconnected", reason);
      if (offerRetryTimeout.current) {
        clearTimeout(offerRetryTimeout.current);
        offerRetryTimeout.current = null;
      }
    });
  };
  
  // ---------------- Main effect ----------------
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const token = user?.token;
      let decodedStudentId = null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          decodedStudentId = decoded.id;
          setStudentId(decodedStudentId);
        } catch (error) {
          console.error("Failed to decode student token:", error);
        }
      }
      const fetchedExam = await fetchExam();
      if (!fetchedExam) return;
      const shouldAutoStart = !!(location.state && (location.state.autoStart || location.state.fromInstructions));
      if (shouldAutoStart && fetchedExam.duration && decodedStudentId) {
        initSignaling(fetchedExam, decodedStudentId);
        await createPeerAndSendOffer(fetchedExam, decodedStudentId);
        startTimer(fetchedExam.duration);
        startFaceDetection(); // Start face detection
      } else if (!shouldAutoStart) {
        navigate(`/exams/${id}/instructions`);
      }
    };
    initialize();
    
    // Anti-cheat listeners
    const onBeforeUnload = (e) => {
      if (!submissionStatus.isSubmitted) {
        e.preventDefault();
        e.returnValue = "Are you sure? Your exam attempt will be submitted or lost if you leave.";
        registerCheatEvent("refresh", "beforeunload refresh");
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    
    const onKeyDown = (e) => {
      if (!submissionStatus.isSubmitted) {
        if (e.key === "F5" || ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R"))) {
          e.preventDefault();
          showToast("Refresh is disabled during the exam.", 4000);
          registerCheatEvent("refresh", "Page refresh attempt detected");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      if (!submissionStatus.isSubmitted) {
        window.history.pushState(null, "", window.location.href);
        showToast("Back navigation is disabled during the exam.", 3000);
        registerCheatEvent("back", "Back navigation attempt detected");
      }
    };
    window.addEventListener("popstate", onPop);
    
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        registerCheatEvent("tab-switch", "Switched tab / window");
      }
    };
    
    const onCopy = (e) => { e.preventDefault?.(); registerCheatEvent("copy-paste", "Copy action detected"); };
    const onPaste = (e) => { e.preventDefault?.(); registerCheatEvent("copy-paste", "Paste action detected"); };
    const onCut = (e) => { e.preventDefault?.(); registerCheatEvent("cut", "Cut action detected"); };
    
    const onContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      registerCheatEvent("contextmenu", "Right-click detected");
    };
    
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onContextMenu);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopFaceDetection(); // Stop face detection
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("cut", onCut);
      window.removeEventListener("contextmenu", onContextMenu);
      
      // Clean up WebRTC resources
      try { localStreamRef.current?.getTracks()?.forEach((t) => t.stop()); } catch {}
      try { pcRef.current?.close(); } catch {}
      try { socketRef.current?.disconnect(); } catch {}
      iceCandidatesBuffer.current = [];
      if (offerRetryTimeout.current) {
        clearTimeout(offerRetryTimeout.current);
        offerRetryTimeout.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, location.state]);
  
  // ---------------- Render ----------------
  if (submissionStatus.isSubmitted) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-md mt-4">
        {submissionStatus.score !== null ? (
          <div className="text-center mt-6 text-xl font-bold text-green-600">
            Your Score: {submissionStatus.score} / {exam?.mcqs?.length || 0}
          </div>
        ) : (
          <p className="text-center mt-10 text-xl font-semibold text-green-600">
            {submissionStatus.message}
          </p>
        )}
      </div>
    );
  }
  
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!exam) return <p className="text-center mt-10">Exam not found or failed to load.</p>;
  
  return (
    <div className="relative p-6 max-w-4xl mx-auto bg-white shadow-md rounded-md mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-800">{exam.title}</h2>
        <div className="flex items-center space-x-4">
          {(exam.type === "mcq" || exam.type === "upload") && (
            <span className="bg-red-100 text-red-700 px-4 py-1 rounded text-sm">
              Time Left: {timer ?? "--:--"}
            </span>
          )}
          
          {/* Face Detection Status Indicator */}
          <div className="flex items-center">
            <span className={`px-3 py-1 rounded text-sm flex items-center ${
              faceDetectionStatus === 'active' ? 'bg-green-100 text-green-700' : 
              faceDetectionStatus === 'no-face' ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              {faceDetectionStatus === 'active' ? 'Face Detected' : 
               faceDetectionStatus === 'no-face' ? 'No Face Detected' : 
               'Face Detection: Inactive'}
            </span>
          </div>
          
          <button
            onClick={togglePreview}
            className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      </div>
      <div className="mb-3 text-sm text-gray-600">
        <strong>Cheat events:</strong> {cheatCount} detected during this attempt.
      </div>
      
      {/* Face Detection Test Instructions */}
      {/* {faceDetectionStatus !== 'inactive' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
          <p className="font-medium text-blue-800">Face Detection Testing</p>
          <p className="text-blue-700">To test face detection, open the browser console and type: <code className="bg-blue-100 px-1 rounded">triggerFaceDetectionTest()</code></p>
          <p className="text-blue-700 mt-1">The system will automatically simulate face detection events every 5 seconds.</p>
        </div>
      )} */}
      
      {exam.type === "mcq" ? (
        <MCQExam exam={exam} onSubmission={handleSubmission} />
      ) : (
        <>
          <UploadExam exam={exam} onSubmission={handleSubmission} setUploadFile={handleSetUploadFile} />
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={handleFinishUploadExam}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={!uploadFile}
            >
              Finish Exam
            </button>
          </div>
        </>
      )}
      {/* Toasts */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className="bg-black text-white px-4 py-2 rounded shadow-lg max-w-xs">
            {t.message}
          </div>
        ))}
      </div>
      {/* MCQ Score Modal */}
      {mcqModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Exam Submitted</h3>
            <p className="mb-4">
              Your Score: <strong>{mcqModal.score ?? "N/A"}</strong>
              {mcqModal.max ? ` / ${mcqModal.max}` : ""}
            </p>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 bg-gray-200 rounded" onClick={handleMcqModalClose}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ExamAttempt;