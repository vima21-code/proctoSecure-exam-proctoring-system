import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const StudentClassroomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [exams, setExams] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchClassroomDetails();
    fetchClassroomExams();
  }, [id]);

  const fetchClassroomDetails = async () => {
    try {
      const { data } = await axiosInstance.get(`/classrooms/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setClassroom(data.classroom || data); 
    } catch (err) {
      console.error("Failed to load classroom", err);
    }
  };

  const fetchClassroomExams = async () => {
    try {
      const { data } = await axiosInstance.get(`/exams/classroom/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setExams(data);
    } catch (err) {
      console.error("Failed to load exams", err);
    }
  };

  const now = new Date();

  const getStatus = (exam) => {
    const start = new Date(`${exam.date}T${exam.startTime}`);
    const end = new Date(start.getTime() + exam.duration * 60000);
    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Ongoing";
    return "Expired";
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {classroom?.title ?? "Classroom title not found"}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Code: {classroom?.code ?? "Not available"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map((exam) => {
          const status = getStatus(exam);
          return (
            <div
              key={exam._id}
              className="bg-white p-4 rounded shadow border border-purple-300 relative"
            >
              <h3 className="text-lg font-semibold text-purple-700 mb-1">
                {exam.title}
              </h3>
              <p className="text-sm text-gray-600">Date: {exam.date}</p>
              <p className="text-sm text-gray-600">Time: {exam.startTime}</p>
              <p className="text-sm text-gray-600">Duration: {exam.duration} min</p>
              <span
                className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full text-white ${
                  status === "Upcoming"
                    ? "bg-blue-500"
                    : status === "Ongoing"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }`}
              >
                {status}
              </span>
              {status === "Ongoing" && (
                <button
                  onClick={() => navigate(`/exams/${exam._id}/attempt`)}
                  className="mt-3 bg-purple-600 text-white px-3 py-1 rounded"
                >
                  Attempt
                </button>
              )}
              {status === "Expired" && (
                <button
                  onClick={() => navigate(`/results/${exam._id}`)}
                  className="mt-3 bg-gray-600 text-white px-3 py-1 rounded"
                >
                  View Result
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentClassroomDetails;
