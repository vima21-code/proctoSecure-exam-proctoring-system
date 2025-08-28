// src/pages/tutor/ClassroomDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const ClassroomDetails = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const classRes = await axiosInstance.get(`/classrooms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClassroom(classRes.data);

        const examRes = await axiosInstance.get(`/exams/classroom/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(examRes.data);
        setFilteredExams(examRes.data);

        const submissionRes = await axiosInstance.get(
          `/submissions/classroom/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSubmissions(submissionRes.data);
      } catch (err) {
        console.error("Error loading classroom details:", err);
      }
    };

    fetchData();
  }, [id, token]);

  useEffect(() => {
    let updated = [...exams];

    if (filterType !== "all") {
      updated = updated.filter((exam) => exam.type === filterType);
    }

    if (filterDate) {
      updated = updated.filter(
        (exam) =>
          new Date(exam.date).toDateString() ===
          new Date(filterDate).toDateString()
      );
    }

    updated.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    );

    setFilteredExams(updated);
  }, [filterType, filterDate, sortOrder, exams]);

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await axiosInstance.delete(`/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams((prev) => prev.filter((exam) => exam._id !== examId));
    } catch (err) {
      console.error("Failed to delete exam", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">
        Classroom: {classroom?.title || "Loading..."}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="all">All Types</option>
          <option value="MCQ">MCQ</option>
          <option value="Upload">Upload</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="asc">Sort by Date ↑</option>
          <option value="desc">Sort by Date ↓</option>
        </select>
      </div>

      {/* Exams */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Exams Created</h2>
        {filteredExams.length === 0 ? (
          <p>No exams found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredExams.map((exam) => (
              <li
                key={exam._id}
                className="border p-4 rounded shadow bg-white hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{exam.title}</h3>
                    <p className="text-sm text-gray-600">
                      Type: {exam.type} |{" "}
                      Date: {exam.date ? new Date(exam.date).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/tutor/edit-exam/${exam._id}`)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Submissions */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Student Submissions</h2>
        {submissions.length === 0 ? (
          <p>No submissions yet.</p>
        ) : (
          <ul className="space-y-2">
            {submissions.map((sub) => (
              <li
                key={sub._id}
                className="border p-3 rounded shadow bg-white hover:bg-gray-100"
              >
                <p className="font-semibold">Student: {sub.studentName}</p>
                <p className="text-sm text-gray-600">
                  Exam: {sub.examTitle} | Score: {sub.score}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ClassroomDetails;
