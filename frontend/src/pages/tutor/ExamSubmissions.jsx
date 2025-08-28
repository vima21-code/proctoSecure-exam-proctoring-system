// src/components/tutor/ExamSubmissions.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FaExpand, FaCompress } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 

const ExamSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState(null);
  
  // New state for tab management. Default to 'all'.
  const [activeTab, setActiveTab] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await axiosInstance.get("/submissions/tutor");
        setSubmissions(data);
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleToggleExpand = (submissionId) => {
    setExpandedSubmissionId(expandedSubmissionId === submissionId ? null : submissionId);
  };

  const handleEvaluate = (submissionId) => {
    navigate(`/tutor/evaluate/${submissionId}`);
  };

  if (loading) {
    return <p className="text-center mt-10">Loading submissions...</p>;
  }

  // Filter submissions based on the active tab
  const filteredSubmissions = submissions.filter(submission => {
    const examType = submission.exam.type?.toLowerCase();
    if (activeTab === "all") {
      return true;
    }
    return examType === activeTab;
  });

  const getNoSubmissionMessage = () => {
    if (activeTab === "mcq") {
      return "No MCQ exam submissions to display.";
    }
    if (activeTab === "upload") {
      return "No upload exam submissions to display.";
    }
    return "No submissions to display.";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Exam Submissions</h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-semibold focus:outline-none ${
            activeTab === "all" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All Exams
        </button>
        <button
          className={`py-2 px-4 font-semibold focus:outline-none ${
            activeTab === "mcq" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("mcq")}
        >
          MCQ Exams
        </button>
        <button
          className={`py-2 px-4 font-semibold focus:outline-none ${
            activeTab === "upload" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("upload")}
        >
          Upload Exams
        </button>
      </div>

      {/* Submission List */}
      {filteredSubmissions.length === 0 ? (
        <p className="text-center text-gray-500">{getNoSubmissionMessage()}</p>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission._id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex justify-between items-center cursor-pointer" onClick={() => handleToggleExpand(submission._id)}>
                <div>
                  <h3 className="text-xl font-semibold">{submission.exam.title}</h3>
                  <p className="text-sm text-gray-600">Submitted by: {submission.student.name}</p>
                  <p className="text-sm text-gray-600">Submission Date: {new Date(submission.submittedAt).toLocaleString()}</p>
                </div>
                <button className="text-gray-500 hover:text-blue-600 transition-colors">
                  {expandedSubmissionId === submission._id ? <FaCompress size={20} /> : <FaExpand size={20} />}
                </button>
              </div>

              {expandedSubmissionId === submission._id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleEvaluate(submission._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Evaluate
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamSubmissions;