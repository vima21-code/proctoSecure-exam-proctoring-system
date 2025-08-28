import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";

const ExamsList = () => {
  const [exams, setExams] = useState([]);
  const [expandedExamId, setExpandedExamId] = useState(null);

  useEffect(() => {
    axios
      .get("/exams/tutor", {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
        },
      })
      .then((res) => setExams(res.data))
      .catch((err) => console.error("Failed to fetch exams", err));
  }, []);

  const toggleExpand = (id) => {
    setExpandedExamId(expandedExamId === id ? null : id);
  };

  const getPreviewUrl = (filePath) => {
    const filename = filePath.split("/").pop();
    return `http://localhost:5000/preview/${filename}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-4">My Exams</h2>
      {exams.length === 0 ? (
        <p>No exams found.</p>
      ) : (
        <ul className="space-y-4">
          {exams.map((exam) => (
            <li key={exam._id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {exam.title} <span className="text-sm text-gray-600">({exam.type})</span>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Classroom: {exam.classroom?.title || "N/A"}
                  </p>
                </div>
                <button
                  onClick={() => toggleExpand(exam._id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {expandedExamId === exam._id ? "Hide" : "View"}
                </button>
              </div>

              {expandedExamId === exam._id && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    Date: {exam.date ? new Date(exam.date).toLocaleString() : "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    Duration: {exam.duration} minutes
                  </p>

                  {exam.type === "MCQ" && exam.mcqs?.length > 0 ? (
                    <div>
                      <p className="font-semibold mb-2">MCQs:</p>
                      <ul className="list-decimal pl-5 space-y-2">
                        {exam.mcqs.map((mcq, idx) => (
                          <li key={idx}>
                            <p>
                              <strong>Q{idx + 1}:</strong> {mcq.question}
                            </p>
                            <ul className="list-disc pl-5 text-gray-700">
                              {mcq.options.map((opt, i) => (
                                <li key={i}>{opt}</li>
                              ))}
                            </ul>
                            <p className="text-green-600 font-semibold">
                              Correct: {mcq.correctAnswer}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : exam.type === "Upload" && exam.filePath ? (
                    <div>
                      <p className="font-semibold mb-2">Uploaded Paper Preview:</p>
                      {exam.filePath.endsWith(".pdf") ? (
                        <iframe
                          src={getPreviewUrl(exam.filePath)}
                          className="w-full h-96 border"
                          title="Uploaded Paper Preview"
                        />
                      ) : (
                        <img
                          src={getPreviewUrl(exam.filePath)}
                          alt="Uploaded Paper"
                          className="max-w-full max-h-96 border"
                        />
                      )}
                      <button
                        onClick={() => window.open(getPreviewUrl(exam.filePath), "_blank")}
                        className="text-blue-600 underline mt-2 inline-block"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  ) : (
                    <p>No preview available.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExamsList;
