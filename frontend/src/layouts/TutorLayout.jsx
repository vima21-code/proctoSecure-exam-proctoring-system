// src/layouts/TutorLayout.jsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserCircle,
  FaClipboardList,
  FaCertificate,
  FaSignOutAlt,
  FaShieldAlt,
  FaHome,
  FaEdit,
} from "react-icons/fa";

const SidebarLink = ({ icon, label, onClick, sidebarOpen }) => (
  <div
    onClick={onClick}
    className={`flex items-center ${
      sidebarOpen ? "justify-start space-x-3" : "justify-center"
    } hover:bg-blue-600 cursor-pointer px-3 py-2 rounded transition`}
    title={!sidebarOpen ? label : ""}
  >
    <span className="text-lg">{icon}</span>
    {sidebarOpen && <span>{label}</span>}
  </div>
);

const TutorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const fullName = `${user.name || "Your"}`;
  const profileImage = user.profilePicture
    ? `http://localhost:5000/profileuploads/${user.profilePicture}`
    : null;

    console.log("Profile image URL:", profileImage);
    
  const avatarColor = user.avatarColor || "#3B82F6";

  return (
    <div className="flex h-screen w-screen font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-blue-500 text-white shadow-xl flex flex-col justify-between transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-20"
        }`}
      >
        <div className="px-3 py-6 space-y-6">
          {/* Profile section */}
          <div className="flex items-center space-x-2 px-2">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                style={{ backgroundColor: avatarColor }}
              >
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            {sidebarOpen && (
              <span className="text-md font-semibold truncate max-w-[120px]">
                {fullName}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            <SidebarLink
              icon={<FaHome />}
              label="Dashboard"
              onClick={() => navigate("/tutor")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarLink
              icon={<FaChalkboardTeacher />}
              label="Classrooms"
              onClick={() => navigate("/tutor/classrooms")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarLink
              icon={<FaEdit />}
              label="Exams"
              onClick={() => navigate("/tutor/exams-list")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarLink
              icon={<FaShieldAlt />}
              label="Proctoring"
              sidebarOpen={sidebarOpen}
              onClick={() => navigate(`/tutor/proctoring`)}
            />
            <SidebarLink
              icon={<FaUserGraduate />}
              label="Students"
              onClick={() => navigate("/tutor/students")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarLink
              icon={<FaCertificate />}
              label="Request Certificate"
              onClick={() => navigate("/tutor/request-certificate")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarLink
              icon={<FaUserCircle />}
              label="Profile"
              onClick={() => navigate("/tutor/profile")}
              sidebarOpen={sidebarOpen}
            />
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.clear();
            navigate("/auth");
          }}
          className="bg-black text-white py-2 mx-3 mb-6 rounded hover:bg-gray-800"
        >
          {sidebarOpen ? "Logout" : <FaSignOutAlt className="text-xl mx-auto" />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Topbar */}
        <div className="flex items-center justify-between p-4 bg-gray-500 absolute top-0 left-0 right-0 z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-100 text-2xl">
            <FaBars />
          </button>
          <div className="flex-1 flex justify-end">
            <img src="/logo.png" alt="Logo" className="h-8 w-[150px] mr-[10px]" />
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition mr-[10px]"
          >
            Contact Us
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6 pt-20 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default TutorLayout;
