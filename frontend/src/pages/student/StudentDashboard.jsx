import React, { useState, useEffect } from "react";
import {
  FaCreditCard,
  FaClipboardList,
  FaBook,
  FaTimesCircle,
  FaFileAlt,
  FaBell,
  FaCalendarAlt,
  FaBars,
  FaSignOutAlt,
  FaQrcode,
} from "react-icons/fa";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const StudentDashboard = () => {
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinedClassrooms, setJoinedClassrooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  // Retrieve user data from localStorage and parse it
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { firstName, lastName, profilePicture, avatarColor } = user;
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Student";
  const initials = (firstName?.[0] || "") + (lastName?.[0] || "");

  useEffect(() => {
    fetchJoinedClassrooms();
    fetchResults();
  }, []);

  const fetchJoinedClassrooms = async () => {
    try {
      const { data } = await axiosInstance.get("/classrooms/student/joined", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setJoinedClassrooms(data);

      const allExamsResponses = await Promise.all(
        data.map((classroom) =>
          axiosInstance.get(`/exams/classroom/${classroom._id}`)
        )
      );

      const now = new Date();

      const allExams = allExamsResponses.flatMap((res) =>
        res.data.map((exam) => {
          const start = new Date(`${exam.date}T${exam.startTime}:00`);
          const end = new Date(start.getTime() + exam.duration * 60000);

          let status = "expired";
          if (exam.submitted) status = "submitted";
          else if (now >= start && now <= end) status = "ongoing";
          else if (now < start) status = "upcoming";

          return { ...exam, status };
        })
      );

      const filteredExams = allExams.filter(
        (exam) => exam.status === "upcoming" || exam.status === "ongoing"
      );

      setExams(filteredExams);
    } catch (err) {
      console.error("Error loading joined classrooms and exams", err);
    }
  };

  const fetchResults = async () => {
    try {
      const { data } = await axiosInstance.get("/results/student", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResults(data);
    } catch (err) {
      console.error("Error loading results", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleJoin = async () => {
    try {
      await axiosInstance.post("/classrooms/join", { code: joinCode });
      setShowJoinModal(false);
      setJoinCode("");
      fetchJoinedClassrooms();
    } catch (err) {
      console.error("Join failed", err);
      alert("Failed to join classroom.");
    }
  };

  const handleExitClassroom = async (classroomId) => {
    if (!window.confirm("Are you sure you want to exit this classroom?")) return;
    try {
      await axiosInstance.post(
        `/classrooms/student/exit/${classroomId}`,
        null,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      fetchJoinedClassrooms();
    } catch (err) {
      console.error("Exit failed", err);
    }
  };

  const startQrScanner = () => {
    setShowQrScanner(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: 250,
      });
      scanner.render(
        (decodedText) => {
          setJoinCode(decodedText);
          setShowJoinModal(true);
          setShowQrScanner(false);
          scanner.clear();
        },
        (error) => console.warn("QR Scan error:", error)
      );
    }, 500);
  };

  const isWithin5Min = (exam) => {
    const now = new Date();
    const start = new Date(`${exam.date}T${exam.startTime}:00`);
    const diffInMin = (start - now) / (1000 * 60);
    return diffInMin <= 5 && diffInMin >= 0;
  };

  const groupedExams = {
    upcoming: exams.filter((e) => e.status === "upcoming"),
    ongoing: exams.filter((e) => e.status === "ongoing"),
  };

  const handleAttempt = (exam) => {
    navigate(`/exams/${exam._id}/instructions`);
  };

  return (
    <div className="min-h-screen h-[700px] bg-purple-100 flex flex-col m-0 p-0">
      <header className="h-16 m-0 bg-white shadow flex items-center px-6 relative z-10">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 ml-auto bg-blue-500 text-white rounded-md hover:bg-blue-600 transition mr-[10px]"
        >
          Contact Us
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`${
            isSidebarOpen ? "w-64" : "w-20"
          } bg-purple-600 text-white p-4 flex flex-col justify-between transition-all duration-300 rounded-r-3xl`}
        >
          <div>
            <button
              className="mb-6 text-xl hover:text-gray-200"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <FaBars />
            </button>
            <div className="flex flex-col items-center mb-6">
              {profilePicture ? (
                <img
                  src={`http://localhost:5000/profileuploads/${profilePicture}`}
                  alt="Profile"
                  className="rounded-full w-16 h-16 border-2 border-white mb-2 object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl border-2 border-white mb-2"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials.toUpperCase() || "U"}
                </div>
              )}

              {isSidebarOpen && (
                <>
                  <p className="text-sm">{fullName}</p>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-xs text-purple-200 hover:underline"
                  >
                    View Profile
                  </button>
                </>
              )}
            </div>
            <nav className="space-y-4">
              <NavItem
                icon={FaQrcode}
                label="Join Classroom"
                isOpen={isSidebarOpen}
                onClick={() => setShowJoinModal(true)}
              />
              <NavItem
                icon={FaClipboardList}
                label="Classrooms You're In"
                isOpen={isSidebarOpen}
                onClick={() => navigate("/student/classrooms")}
              />
              <NavItem
                icon={FaBook}
                label={
                  <>
                    Exams{" "}
                    {exams.length > 0 && (
                      <span className="ml-1 bg-white text-purple-600 rounded-full px-2 text-xs font-semibold">
                        {exams.length}
                      </span>
                    )}
                  </>
                }
                isOpen={isSidebarOpen}
                onClick={() => navigate("/student/exams")}
              />
              <NavItem
                icon={FaTimesCircle}
                label="Exit Classroom"
                isOpen={isSidebarOpen}
                onClick={() => navigate("/student/exitclassrooms")}
              />
              <NavItem
                icon={FaFileAlt}
                label="Results"
                isOpen={isSidebarOpen}
                onClick={() => navigate("/student/results")}
              />
              <NavItem
                icon={FaCalendarAlt}
                label="Events"
                isOpen={isSidebarOpen}
                onClick={() => navigate("/student/events")}
              />
            </nav>
          </div>
          <div>
            <button
              className="flex items-center mt-[50px] gap-2 text-white hover:text-purple-200 mb-[500px]"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> {isSidebarOpen && "Logout"}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search"
              className="px-4 py-2 rounded-full w-1/3 border mr-4"
            />
            <FaQrcode
              title="Scan QR to join classroom"
              className="text-xl text-purple-600 cursor-pointer mr-4"
              onClick={startQrScanner}
            />
            {/* <FaBell title="Notifications" className="text-xl text-purple-600 cursor-pointer" /> */}
          </div>
          <div
            className="rounded-2xl flex justify-between items-center px-8 py-6 mb-8"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(139, 92, 246, 0.9), rgba(139, 92, 246, 0.6)), url('https://c7.alamy.com/comp/2GN99F1/online-virtual-video-conference-training-on-laptop-computer-2GN99F1.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "white",
            }}
          >
            <div className="z-10">
              <p className="text-sm">{new Date().toLocaleDateString()}</p>
              <h2 className="text-2xl font-semibold">
                Welcome back, {user?.firstName || "Student"}!
              </h2>
              <p className="text-sm">Always stay updated in your dashboard</p>
            </div>
            <div className="w-40 h-32" />
          </div>

          {/* Exams Section */}
          {["upcoming", "ongoing"].map((status) => (
            <section key={status} className="mb-8">
              <h3 className="text-xl font-bold mb-4 capitalize">{status} Exams</h3>
              {groupedExams[status].length === 0 ? (
                <p>No {status} exams.</p>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {groupedExams[status].map((exam) => {
                    const canAttempt = status === "upcoming" ? isWithin5Min(exam) : true;
                    return (
                      <div
                        key={exam._id}
                        className="bg-white p-5 rounded-lg shadow border border-purple-300 flex flex-col justify-between"
                      >
                        <div>
                          <p className="text-purple-600 font-semibold mb-2">{exam.title}</p>
                          <p className="text-sm text-gray-600 mb-1">
                            Date: {new Date(exam.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            Starts at: {exam.startTime}
                          </p>
                          <p className="text-sm italic text-gray-500 mb-3">
                            Type: {exam.type}
                          </p>
                        </div>
                        {status === "ongoing" && (
                          <button
                            className="bg-purple-600 text-white py-1 px-3 rounded hover:bg-purple-700"
                            onClick={() => handleAttempt(exam)}
                          >
                            Attempt
                          </button>
                        )}
                        {status === "upcoming" && (
                          <button
                            className={`py-1 px-3 rounded text-white ${
                              canAttempt
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!canAttempt}
                            onClick={() => handleAttempt(exam)}
                          >
                            {canAttempt ? "Start Exam" : "Available in 5 minutes"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          {/* Exam Results Section */}
          {/* <section>
            <h3 className="text-xl font-bold mb-4">Exam Results</h3>
            {results.length === 0 ? (
              <p>No results available yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {results.map((result) => (
                  <div
                    key={result._id}
                    className="bg-white p-5 rounded-lg shadow border border-green-300 flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-green-600 font-semibold mb-2">
                        {result.exam.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        Submitted on:{" "}
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </p>
                      {result.score !== undefined && (
                        <p className="text-sm text-gray-800 font-bold mb-1">
                          Score: {result.score}{" "}
                          {result.totalScore !== undefined ? `/ ${result.totalScore}` : ""}
                        </p>
                      )}
                      {result.grade && (
                        <p className="text-sm text-gray-800 font-bold mb-1">
                          Grade: {result.grade}
                        </p>
                      )}
                      {result.assessmentReport && (
                        <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                          <p className="font-semibold">Assessment Report:</p>
                          <p className="whitespace-pre-wrap">{result.assessmentReport}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section> */}

          {/* Join Modal */}
          {showJoinModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Join Classroom</h3>
                <input
                  type="text"
                  placeholder="Enter Classroom Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full border px-4 py-2 rounded mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded"
                    onClick={handleJoin}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QR Scanner */}
          {showQrScanner && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                <button
                  className="mb-2 px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowQrScanner(false)}
                >
                  Close Scanner
                </button>
                <div id="qr-reader" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, isOpen, onClick }) => (
  <button
    className="flex items-center gap-4 w-full p-2 rounded hover:bg-purple-500"
    onClick={onClick}
  >
    <Icon />
    {isOpen && <span>{label}</span>}
  </button>
);

export default StudentDashboard;