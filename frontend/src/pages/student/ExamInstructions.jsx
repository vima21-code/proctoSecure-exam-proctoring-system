import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const ExamInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState(null);
  const [examStartTime, setExamStartTime] = useState(null);
  const [examEndTime, setExamEndTime] = useState(null);
  const [redirected, setRedirected] = useState(false);
  const [examDetails, setExamDetails] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const { data } = await axiosInstance.get(`/exams/student/${id}`);
        setExamDetails(data);

        // If already submitted, skip all timing logic
        if (data.submission) {
          setHasSubmitted(true);
          return;
        }

        if (!data.date || !data.startTime) {
          console.error("Missing date or startTime in response");
          return;
        }

        const start = new Date(`${data.date}T${data.startTime}`);
        if (isNaN(start.getTime())) {
          console.error("Invalid Date format received");
          return;
        }

        const durationMinutes = Number(data.duration || 0);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        setExamStartTime(start);
        setExamEndTime(end);
      } catch (err) {
        console.error("Failed to fetch exam details:", err);
      }
    };

    fetchExam();
  }, [id]);

  useEffect(() => {
    if (!examStartTime || hasSubmitted) return;

    const now = new Date();

    // Before start → Countdown + Auto-redirect at start
    if (now < examStartTime) {
      const interval = setInterval(() => {
        const diff = Math.max(0, examStartTime - new Date());
        setTimeLeft(diff);

        if (diff <= 0 && !redirected) {
          clearInterval(interval);
          setRedirected(true);
          navigate(`/exams/${id}/attempt`, { state: { autoStart: true } });
        }
      }, 1000);
      return () => clearInterval(interval);
    }

    // During → Show time left until end
    if (now >= examStartTime && examEndTime && now <= examEndTime) {
      const interval = setInterval(() => {
        setTimeLeft(Math.max(0, examEndTime - new Date()));
      }, 1000);
      return () => clearInterval(interval);
    }

    // After → No timer, just closed message
    if (now > examEndTime) {
      setTimeLeft(0);
    }
  }, [examStartTime, examEndTime, hasSubmitted, redirected, navigate, id]);

  const formatTime = (ms) => {
    if (ms == null) return "--:--:--";
    const totalSeconds = Math.floor(ms / 1000);
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const isWithinExamWindow = () => {
    if (!examStartTime || !examEndTime) return false;
    const now = new Date();
    return now >= examStartTime && now <= examEndTime;
  };

  if (hasSubmitted) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-center mt-10 text-2xl font-bold text-green-600">
          You have already submitted this exam.
        </p>
      </div>
    );
  }

  if (!examDetails) {
    return <p className="text-center mt-10">Loading exam details...</p>;
  }

  const startDisabled = !isWithinExamWindow();
  const examClosed = examEndTime && new Date() > examEndTime;

  const handleStart = () => {
    navigate(`/exams/${id}/attempt`, { state: { fromInstructions: true } });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <img
        src="https://s3-ap-south-1.amazonaws.com/ricedigitals3bucket/AUPortalContent/2020/06/10075928/blogonline.jpg"
        className="w-full h-[200px] mb-4 rounded-md shadow-md"
        alt="Online exam illustration"
      />

      <div className="bg-red-500 text-white py-4 text-center rounded-md mb-4">
        <h2 className="text-xl font-bold">Instructions for attending proctored examination</h2>
      </div>

      <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
        <li>Ensure your face is clearly visible at all times.</li>
        <li>Do not leave the exam screen during the exam.</li>
        <li>Tutors will be notified in case of any malpractices.</li>
        <li>No other tabs or applications should be open.</li>
        <li>Copy-Pasting is not allowed.</li>
      </ul>

      {timeLeft !== null && timeLeft > 0 ? (
        <div className="text-center mb-4">
          <p className="text-md text-gray-700 mb-2">
            {new Date() < examStartTime ? "Exam will start in:" : "Time left to finish the exam:"}
          </p>
          <p className="text-3xl font-mono text-purple-700">{formatTime(timeLeft)}</p>
        </div>
      ) : (
        <p className="text-center text-gray-500 mb-4">
          {new Date() < examStartTime
            ? "Loading exam start time..."
            : examClosed
            ? "Exam window has closed."
            : "Exam is starting..."}
        </p>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleStart}
          disabled={startDisabled}
          className={`mt-4 px-6 py-2 rounded text-white ${
            startDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default ExamInstructions;
