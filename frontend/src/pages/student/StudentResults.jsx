import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));


  useEffect(() => {
    const fetchResults = async () => {
      if (!user || !user.token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get("/submissions/results/student", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setResults(response.data);
      } catch (err) {
        console.error("Failed to fetch results:", err);
        setError("Failed to load your results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  if (loading) {
    return <p className="text-center mt-10 text-lg font-semibold">Loading results...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Exam Results</h2>

        {results.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">You have no evaluated exam results yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.map((result) => (
              <div key={result._id} className="bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-green-700">{result.examTitle}</h3>
                  {/* <span className="text-sm font-medium text-gray-500">
                    Classroom: {result.classroomTitle}
                  </span> */}
                </div>
                <p className="text-lg text-gray-700 mb-1">
  <span className="font-semibold">Score:</span>{" "}
{result.examType === "mcq"
  // ? `${result.score} / ${result.mcqTotalPoints} (${result.mcqCount} questions)`
  // : `${result.score} / ${result.totalScore}`

   ? `${result.score} `
  : `${result.score} `
}

</p>

                <p className="text-lg text-gray-700 mb-1">
                  <span className="font-semibold">Grade:</span> {result.grade || "N/A"}
                </p>
                <div className="mt-4 p-4 bg-white rounded-md border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">Tutor's Report:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {result.assessmentReport || "No assessment report provided."}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-right">
                  Evaluated on: {new Date(result.submittedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResults;