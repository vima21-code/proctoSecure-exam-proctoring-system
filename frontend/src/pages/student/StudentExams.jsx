

import React, { useState, useEffect } from "react";
import { FaBook, FaCalendarTimes, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data: classrooms } = await axiosInstance.get("/classrooms/student/joined", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const allExamsResponses = await Promise.all(
          classrooms.map((classroom) => axiosInstance.get(`/exams/classroom/${classroom._id}`))
        );

        const now = new Date();
        const allExams = allExamsResponses.flatMap((res) =>
          res.data.map((exam) => {
            const start = new Date(`${exam.date}T${exam.startTime}:00`);
            const end = new Date(start.getTime() + exam.duration * 60000);

            let status = "expired";
            
            if (exam.submittedExam) {
              status = "submitted";
            } else if (now >= start && now <= end) {
              status = "ongoing";
            } else if (now < start) {
              status = "upcoming";
            }

            return { ...exam, status, classroomName: classrooms.find(c => c._id === exam.classroom)?.name };
          })
        );
        setExams(allExams);
      } catch (err) {
        console.error("Error loading exams", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user.token]);

  const groupedExams = exams.reduce((acc, exam) => {
    acc[exam.status] = acc[exam.status] || [];
    acc[exam.status].push(exam);
    return acc;
  }, {});

  const renderExams = (examList) => {
    if (loading) {
      return <div className="text-center py-8"><FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto" /></div>;
    }
    if (!examList || examList.length === 0) {
      return <p className="text-gray-500 text-center py-8">No exams found for this category.</p>;
    }
    return (
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {examList.map((exam) => (
          <div key={exam._id} className="bg-white p-5 rounded-lg shadow-md border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-700">{exam.title}</h4>
            <p className="text-sm text-gray-500 mb-2">Class: {exam.classroomName || "N/A"}</p>
            <p className="text-sm text-gray-600">Date: {new Date(exam.date).toLocaleDateString()}</p>
            <p className="text-sm text-gray-600">Time: {exam.startTime}</p>
            <p className="text-sm italic text-gray-500 mt-2">Type: {exam.type}</p>
            {exam.status === "ongoing" && (
              <button
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
                onClick={() => navigate(`/exams/${exam._id}/instructions`)}
              >
                Attempt Now
              </button>
            )}
            {exam.status === "upcoming" && (
              <button
                className="mt-4 w-full bg-gray-400 text-white py-2 rounded-md cursor-not-allowed"
                disabled
              >
                Upcoming
              </button>
            )}
            {/* {exam.status === "submitted" && (
              <div className="mt-4 flex items-center text-green-600">
                <FaCheckCircle className="mr-2" />
                <span>Submitted</span>
              </div>
            )} */}
            {exam.status === "expired" && (
              <div className="mt-4 flex items-center text-red-600">
                <FaCalendarTimes className="mr-2" />
                <span>Expired</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: groupedExams.upcoming?.length || 0 },
    { id: "ongoing", label: "Ongoing", count: groupedExams.ongoing?.length || 0 },
    // { id: "submitted", label: "Submitted", count: groupedExams.submitted?.length || 0 },
    { id: "expired", label: "Expired", count: groupedExams.expired?.length || 0 },
  ];

  return (
      

    // <div className="min-h-screen bg-gray-200 p-8 ">
       <div className="min-h-screen h-[700px] bg-purple-100 flex flex-col m-0 p-0 ">
      <header className="h-16 m-0 bg-white shadow flex items-center px-6 relative z-10 ">
        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 ml-auto bg-blue-500 text-white rounded-md hover:bg-blue-600 transition mr-[10px]"
        >
          Contact Us
        </button>
      </header>
      <h2 className="text-3xl font-bold text-purple-800 mb-6 ml-[5px] mt-6">Your Exams</h2>
      
      <div className="border-b border-gray-200 mb-6 ml-[20px]">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-purple-600 text-purple-900"
                  : "border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {renderExams(groupedExams[activeTab])}
      </div>
    </div>
  );
};

export default StudentExams;