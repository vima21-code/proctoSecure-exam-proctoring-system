import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const StudentClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axiosInstance.get("/classrooms/student/joined", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });

        setClassrooms(response.data);
      } catch (err) {
        console.error("Error loading student classrooms", err);
      }
    };

    if (user?.token) {
      fetchClassrooms();
    }
  }, [user]);

  // Filter classrooms based on search term
  const filteredClassrooms = classrooms.filter((cls) =>
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-purple-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/student-dashboard")}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          ← Back to Dashboard
        </button>
        <h2 className="text-2xl font-bold text-purple-700">My Classrooms</h2>
        <div className="w-1/3"></div> {/* Spacer for alignment */}
      </div>

      {/* Search Input Field */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or code..."
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClassrooms.length > 0 ? (
          filteredClassrooms.map((cls) => (
            <div
              key={cls._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl cursor-pointer border border-purple-300"
              onClick={() => navigate(`/student/classroom/${cls._id}`)}
            >
              <h3 className="text-lg font-semibold text-purple-700 mb-2">
                {cls?.title || "Untitled"}
              </h3>
              <p className="text-sm text-gray-500">
                Code: {cls?.code || "N/A"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">
            {classrooms.length > 0 ? "No classrooms match your search." : "You have not joined any classrooms yet."}
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentClassroomsPage;