// src/components/tutor/TutorDashboard.jsx
import React, { useState, useEffect } from "react";
import { FaClipboardList, FaEdit, FaChalkboardTeacher, FaUserGraduate, FaCertificate, FaBell, FaShieldAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { copyToClipboard } from "../../utils/copyToClipboard";

const TutorDashboard = () => {
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);
  const [classroomTitle, setClassroomTitle] = useState("");
  const [newClassroom, setNewClassroom] = useState(null);
  const [approvedCertificate, setApprovedCertificate] = useState(null);

  const { id: examId } = useParams();

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Instructor" };
  const token = user?.token;
  
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await axiosInstance.get("/certificates/certificate-request/my", { headers: { Authorization: `Bearer ${token}` } });
        if (res.data?.status === "approved") setApprovedCertificate(res.data);
      } catch (err) {
        console.error("Error fetching certificate", err);
      }
    };

    fetchCertificate();
  }, [token]);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/classrooms", { title: classroomTitle }, { headers: { Authorization: `Bearer ${token}` } });
      setNewClassroom(res.data.classroom);
      setClassroomTitle("");
      setShowCreateClassroom(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create classroom");
    }
  };

  const cardColors = ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-purple-100", "bg-pink-100", "bg-indigo-100"];
  const currentDate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      {/* Welcome Banner */}
      <div
        className="relative w-full h-48 mb-8 rounded-lg overflow-hidden flex items-end p-6 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYJLvyacLvpYSTSJPPSGAfkq5TidvvlfZTmQ&s)`,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          backgroundBlendMode: 'multiply'
        }}
      >
        <div className="text-white z-10">
          <p className="text-sm font-light">{currentDate}</p>
          <h1 className="text-3xl font-bold mt-2">Welcome back, {user.name}!</h1>
          <p className="text-md font-light mt-1">Always stay updated in your dashboard</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <ActionCard title="Create Classroom" icon={FaClipboardList} onClick={() => setShowCreateClassroom(true)} color={cardColors[0]} />
        <ActionCard title="Create Exam" icon={FaEdit} onClick={() => navigate("/tutor/create-exam")} color={cardColors[1]} />
        <ActionCard title="Classrooms" icon={FaChalkboardTeacher} onClick={() => navigate("/tutor/classrooms")} color={cardColors[2]} />
        <ActionCard title="Exam Submissions" icon={FaClipboardList} onClick={() => navigate("/tutor/submissions")} color={cardColors[3]} />
        <ActionCard title="Student Exam Card" icon={FaUserGraduate} color={cardColors[4]} />
        <ActionCard title="Live Proctoring" icon={FaShieldAlt} color={cardColors[3]} onClick={() => navigate("/tutor/proctoring")} />
        <ActionCard title="Events" icon={FaClipboardList} color={cardColors[5]} onClick={() => navigate("/tutor/events")} />
        <ActionCard
          title="Download Certificate"
          icon={FaCertificate}
          color={cardColors[5]}
          onClick={() => {
            if (!approvedCertificate) return toast.error("No approved certificate found!");
            navigate(`/tutor/download-certificate/${approvedCertificate._id}`);
          }}
        />
      </div>

      {/* Create Classroom Modal */}
      {showCreateClassroom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={() => setShowCreateClassroom(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold">
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Classroom</h2>
            <form onSubmit={handleCreateClassroom}>
              <label className="block mb-2 font-medium">Classroom Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={classroomTitle}
                onChange={(e) => setClassroomTitle(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded mb-4 focus:outline-none focus:ring focus:border-blue-400"
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateClassroom(false)}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code modal */}
      {newClassroom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center relative">
            <button onClick={() => setNewClassroom(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold">
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2">Classroom Created</h2>
            <p className="mb-3">Share this code with students:</p>
            <div className="flex justify-center items-center gap-2 mb-4">
              <span className="bg-gray-100 font-mono px-4 py-1 rounded border text-sm">{newClassroom.code}</span>
              <button
                onClick={() => copyToClipboard(newClassroom.code)}
                className="bg-blue-700 text-white px-3 py-1 rounded text-sm hover:bg-blue-800"
              >
                Copy
              </button>
            </div>
            <QRCodeCanvas value={newClassroom.code} size={128} className="mx-auto mb-4" />
          </div>
        </div>
      )}
    </div>
  );
};

const ActionCard = ({ title, icon: Icon, onClick, color }) => (
  <div onClick={onClick} className={`${color} p-6 rounded shadow hover:shadow-md cursor-pointer transition text-center`}>
    <Icon className="text-3xl text-blue-700 mx-auto mb-2" />
    <h3 className="text-md font-semibold">{title}</h3>
  </div>
);

export default TutorDashboard;