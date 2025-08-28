import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const EditExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const [title, setTitle] = useState("");
  const [type, setType] = useState("MCQ");
  const [mcqs, setMcqs] = useState([]);
  const [file, setFile] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const [duration, setDuration] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    // Fetch exam data
    axiosInstance
      .get(`/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const exam = res.data;
        setTitle(exam.title);
        setType(exam.type);
        setClassroomId(exam.classroom);
        setDate(exam.date?.split("T")[0] || "");
        setDuration(exam.duration || "");
        if (exam.type === "MCQ") setMcqs(exam.mcqs || []);
      });

    // Fetch classrooms
    axiosInstance
      .get("/classrooms", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setClassrooms(res.data));
  }, [id, token]);

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
    setMcqs([...mcqs, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", title);
    form.append("type", type);
    form.append("classroomId", classroomId);
    form.append("date", date);
    form.append("startTime", startTime);
    form.append("duration", duration);
    if (type === "MCQ") {
      form.append("mcqs", JSON.stringify(mcqs));
    } else if (file) {
      form.append("paper", file);
    }

    try {
      await axiosInstance.put(`/exams/${id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Exam updated successfully");
      navigate("/tutor/exams-list");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to update exam");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Edit Exam</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam Title"
          className="w-full border px-3 py-2 rounded"
          required
        />

        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border px-3 py-2 rounded">
          <option value="MCQ">MCQ</option>
          <option value="Upload">Upload</option>
        </select>

        <select
          value={classroomId}
          onChange={(e) => setClassroomId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Classroom</option>
          {classrooms.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.title}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
  type="time"
  value={startTime}
  onChange={(e) => setStartTime(e.target.value)}
  className="w-full border px-3 py-2 rounded"
  required
/>


        <input
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (in minutes)"
          className="w-full border px-3 py-2 rounded"
        />
        

        {type === "Upload" ? (
          <input
            type="file"
            title="If you want to change the uploaded file, please upload a new one!"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full cursor-pointer"
          />
        ) : (
          <div>
            {mcqs.map((mcq, idx) => (
              <div key={idx} className="border p-3 rounded mb-3">
                <input
                  type="text"
                  value={mcq.question}
                  onChange={(e) => handleMCQChange(idx, "question", e.target.value)}
                  placeholder="Question"
                  className="w-full mb-2 px-2 py-1 border rounded"
                  required
                />
                {mcq.options.map((opt, oIdx) => (
                  <input
                    key={oIdx}
                    type="text"
                    value={opt}
                    onChange={(e) => handleMCQChange(idx, oIdx, e.target.value)}
                    placeholder={`Option ${oIdx + 1}`}
                    className="w-full mb-1 px-2 py-1 border rounded"
                    required
                  />
                ))}
                <input
                  type="text"
                  value={mcq.correctAnswer}
                  onChange={(e) => handleMCQChange(idx, "correctAnswer", e.target.value)}
                  placeholder="Correct Answer"
                  className="w-full font-bold px-2 py-1 border rounded bg-green-100"
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
          Update Exam
        </button>
      </form>
    </div>
  );
};

export default EditExam;
