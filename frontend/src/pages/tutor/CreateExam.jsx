import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const CreateExam = () => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("MCQ");
  const [classroomId, setClassroomId] = useState("");
  const [file, setFile] = useState(null);
  const [mcqs, setMcqs] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [classrooms, setClassrooms] = useState([]);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  const token = JSON.parse(localStorage.getItem("user"))?.token;
  const role = JSON.parse(localStorage.getItem("user"))?.role;
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    axiosInstance
      .get("/classrooms", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setClassrooms(res.data))
      .catch((err) => {
        console.error("Error fetching classrooms", err);
        toast.error("Failed to load classrooms");
      });
  }, [token]);

  const handleMCQChange = (index, field, value) => {
    const updated = [...mcqs];
    if (field === "question" || field === "correctAnswer") {
      updated[index][field] = value;
    } else {
      updated[index].options[field] = value;
    }
    setMcqs(updated);
  };

  const addMCQ = () => {
    setMcqs([
      ...mcqs,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!classroomId) return toast.error("Please select a classroom.");
    if (!date || !startTime || !duration)
      return toast.error("Please provide date, time, and duration.");

    const form = new FormData();
    form.append("title", title);
    form.append("type", type);
    form.append("classroomId", classroomId);
    form.append("date", date);
    form.append("startTime", startTime);
    form.append("duration", duration);

    if (type === "Upload") {
      if (!file) return toast.error("Please upload a file.");
      form.append("paper", file);
    } else {
      form.append("mcqs", JSON.stringify(mcqs));
    }

    try {
      await axiosInstance.post("/exams", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Exam created successfully!");
      setTitle("");
      setType("MCQ");
      setClassroomId("");
      setDate("");
      setStartTime("");
      setDuration("");
      setFile(null);
      setMcqs([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
    } catch (err) {
      console.error("Exam creation failed:", err.response || err);
      toast.error(err?.response?.data?.error || "Failed to create exam.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Create Exam</h2>
        <button
          onClick={() =>
            navigate(
              role === "tutor"
                ? "/tutor-dashboard"
                : role === "admin"
                ? "/admin-dashboard"
                : "/student-dashboard"
            )
          }
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Go Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam Title"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="MCQ">MCQ</option>
          <option value="Upload">Upload Question Paper</option>
        </select>

        <select
          value={classroomId}
          onChange={(e) => setClassroomId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">Select Classroom</option>
          {classrooms.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.title}
            </option>
          ))}
        </select>

        {/* New: Date, Start Time, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Exam Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Duration (in minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              min="1"
              required
            />
          </div>
        </div>

        {type === "Upload" ? (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full"
            required
          />
        ) : (
          <div>
            {mcqs.map((mcq, idx) => (
              <div key={idx} className="border p-3 rounded mb-3 bg-gray-100">
                <input
                  type="text"
                  value={mcq.question}
                  onChange={(e) =>
                    handleMCQChange(idx, "question", e.target.value)
                  }
                  placeholder="Question"
                  className="w-full mb-2 px-2 py-1 border rounded"
                  required
                />
                {mcq.options.map((opt, oIdx) => (
                  <input
                    key={oIdx}
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleMCQChange(idx, oIdx, e.target.value)
                    }
                    placeholder={`Option ${oIdx + 1}`}
                    className="w-full mb-1 px-2 py-1 border rounded"
                    required
                  />
                ))}
                <input
                  type="text"
                  value={mcq.correctAnswer}
                  onChange={(e) =>
                    handleMCQChange(idx, "correctAnswer", e.target.value)
                  }
                  placeholder="Correct Answer"
                  className="w-full font-bold px-2 py-1 border rounded bg-green-300"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addMCQ}
              className="bg-gray-200 px-3 py-1 font-semibold rounded hover:bg-gray-300"
            >
              + Add Question
            </button>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Exam
        </button>
      </form>
    </div>
  );
};

export default CreateExam;
