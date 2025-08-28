import React, { useState } from "react";

const MCQExam = ({ exam, onSubmission }) => {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    onSubmission(answers);
  };

  return (
    <div>
      {exam.mcqs.map((mcq, mcqIndex) => (
        <div key={mcqIndex} className="mb-6 border-b pb-4">
          <div className="text-lg font-medium text-gray-800">
            {mcqIndex + 1}. {mcq.question}
          </div>
          <div className="space-y-2 mt-2">
            {mcq.options.map((opt, i) => (
              <div key={i}>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name={`q-${mcqIndex}`}
                    value={opt}
                    checked={answers[mcqIndex] === opt}
                    onChange={(e) => handleAnswerChange(mcqIndex, e.target.value)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
};

export default MCQExam;