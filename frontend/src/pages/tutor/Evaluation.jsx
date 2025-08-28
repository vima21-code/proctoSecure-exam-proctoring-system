import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const Evaluation = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axiosInstance.get(`/submissions/exam/${examId}`);
        setSubmissions(res.data);
      } catch (error) {
        console.error("Error fetching submissions", error);
      }
    };
    fetchSubmissions();
  }, [examId]);

  return (
    <div className="p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Submissions for Exam</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Student</th>
            <th className="border p-2">Submitted At</th>
            <th className="border p-2">Score</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub) => (
            <tr key={sub._id}>
              <td className="border p-2">
                {sub.student?.firstName} {sub.student?.lastName}
              </td>
              <td className="border p-2">
                {new Date(sub.createdAt).toLocaleString()}
              </td>
              <td className="border p-2">
                {sub.score !== undefined && sub.score !== null
                  ? `${sub.score} / ${sub.totalMarks ?? "?"}`
                  : "Not graded"}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => navigate(`/submission/${sub._id}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Evaluate
                </button>
              </td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center p-4">
                No submissions yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Evaluation;
