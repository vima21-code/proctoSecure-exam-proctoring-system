import React, { useState } from "react";

const UploadExam = ({ exam, onSubmission, setUploadFile }) => {
  const [isPenAndPaper, setIsPenAndPaper] = useState(false);
  const [textFieldAnswer, setTextFieldAnswer] = useState("");
  const [fileAnswer, setFileAnswer] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isPenAndPaper) {
      if (!fileAnswer) {
        alert("Please upload your answer sheet.");
        return;
      }
      const formData = new FormData();
      formData.append("answer", fileAnswer);
      onSubmission(formData);
    } else {
      if (!textFieldAnswer) {
        alert("Please type your answer.");
        return;
      }
      onSubmission({ text: textFieldAnswer });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAnswer(file);
      const formData = new FormData();
      formData.append("answer", file);
      // Pass FormData back to parent to hold for finish/auto-submit
      setUploadFile(formData);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Question Paper</h3>
      <iframe
        src={`http://localhost:5000/${exam.filePath}`}
        className="w-full h-96 border rounded mb-3"
        title="Question Paper"
      />
      <p
        className="text-sm text-blue-600 underline cursor-pointer mb-4"
        onClick={() =>
          window.open(`http://localhost:5000/${exam.filePath}`, "_blank")
        }
      >
        Open in new tab
      </p>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Your Answer</h3>
        <button
          onClick={() => setIsPenAndPaper(!isPenAndPaper)}
          className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
        >
          {isPenAndPaper ? "Type my Answer" : "I will use Pen & Paper"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isPenAndPaper ? (
          <div>
            <label className="block text-gray-700">Upload Answer Sheet (PDF only)</label>
            <input
              type="file"
              accept=".pdf"
              required
              onChange={handleFileChange}
              className="block w-full mt-1"
            />
          </div>
        ) : (
          <div>
            <label className="block text-gray-700">Type your answer here</label>
            <textarea
              className="w-full h-48 p-2 border rounded-md"
              value={textFieldAnswer}
              onChange={(e) => setTextFieldAnswer(e.target.value)}
              placeholder="Start typing your answer..."
            />
          </div>
        )}
        {/* <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Submit Answer
        </button> */}
      </form>
    </div>
  );
};

export default UploadExam;
