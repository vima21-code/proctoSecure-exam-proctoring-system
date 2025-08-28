// src/pages/student/StudentClassrooms.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const StudentClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    fetchJoinedClassrooms();
  }, []);

  const fetchJoinedClassrooms = async () => {
    try {
      const { data } = await axiosInstance.get("/classrooms/student/joined", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setClassrooms(data);
    } catch (err) {
      console.error("Error fetching classrooms", err);
    }
  };

  const handleExitClassroom = async (classroomId) => {
    if (!window.confirm("Are you sure you want to exit this classroom?")) return;
    try {
      await axiosInstance.delete(
        `/classrooms/student/exit/${classroomId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setClassrooms((prev) => prev.filter((c) => c._id !== classroomId));
    } catch (err) {
      console.error("Error exiting classroom", err);
    }
  };

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/student-dashboard")}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl text-center font-semibold mb-4">Exit From Your Classrooms</h2>
      <p className="italic mb-6 text-center">
        You can now leave your classes by clicking{" "}
        <span className="text-red-500 font-bold">✕</span>
      </p>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by name or code..."
          className="w-full max-w-lg px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {classrooms.length === 0 ? (
        <p className="text-center text-gray-600">You haven’t joined any classrooms yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassrooms.length === 0 ? (
            <p className="text-center text-gray-600 col-span-full">No classrooms match your search.</p>
          ) : (
            filteredClassrooms.map((classroom) => (
              <div
                key={classroom._id}
                className="bg-white p-5 rounded-lg shadow border border-purple-300 relative"
              >
                <button
                  onClick={() => handleExitClassroom(classroom._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Exit Classroom"
                >
                  ✕
                </button>
                <h3 className="text-lg font-semibold text-purple-600 mb-2">
                  {classroom.title}
                </h3>
                <p className="text-sm text-gray-600">Code: {classroom.code}</p>
                <p className="text-sm text-gray-500">
                  Tutor: {classroom.tutor?.firstName || "Unknown"}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentClassrooms;