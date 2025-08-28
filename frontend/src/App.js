import React from 'react';
import { Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route } from 'react-router-dom'; 
// import Header from './layouts/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import CommonProfile from './components/CommonProfile';
import HomePage from './pages/HomePage';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentClassroomsPage from './pages/student/StudentClassroomsPage';
import StudentClassroomDetails from './pages/student/StudentClassroomDetails';
import ExamInstructions from './pages/student/ExamInstructions';
import ExamAttempt from './pages/student/ExamAttempt';
import StudentExams from './pages/student/StudentExams';
import StudentResults from './pages/student/StudentResults';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentClassrooms from './pages/student/StudentClassrooms';
import CreateExam from './pages/tutor/CreateExam';
import ClassroomList from './pages/tutor/ClassroomList';
import ExamsList from './pages/tutor/ExamsList';
import ClassroomDetails from './pages/tutor/ClassroomDetails';
import EditExam from './pages/tutor/EditExam';
import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorEventsPage from './pages/tutor/TutorEventsPage';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTutors from './pages/admin/ManageTutors';
import ManageStudents from './pages/admin/ManageStudents';
import BlockedUsers from './pages/admin/BlockedUsers';
import CheckEnquiries from './pages/admin/CheckEnquiries';
// import Announcements from './pages/admin/Announcements';
import ManageEvents from './pages/admin/ManageEvents';
import CertificatePreview from './pages/admin/CertificatePreview';
import ApproveCertificates from './pages/admin/ApproveCertificates';
import StudentEventsPage from './pages/student/StudentEventsPage';
import TutorLayout from './layouts/TutorLayout'; 
import TutorRequestCertificate from './pages/tutor/TutorRequestCertificate';
import TutorDownloadCertificate from './pages/tutor/TutorDownloadCertificate';
import TutorProctoring from './pages/tutor/TutorProctoring';
import TutorStudents from './pages/tutor/TutorStudents';
import ExamSubmissions from './pages/tutor/ExamSubmissions';
import EvaluateSubmission from './pages/tutor/EvaluateSubmission';


import './index.css';


function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-300 to-purple-300">
      <ToastContainer position="top-right" autoClose={2000} />
        
      <Routes>

      <Route path="/" element={<HomePage />} />
        {/* Auth & profile */}
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student', 'tutor']}>
              <CommonProfile />
            </ProtectedRoute>
          }
        />
        

        {/* Admin dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student dashboard */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/student/classrooms" element={<StudentClassroomsPage />} />
        <Route path="/student/classroom/:id" element={<StudentClassroomDetails />} />
        <Route path="/exams/:id/instructions" element={<ExamInstructions />} />
<Route path="/exams/:id/attempt" element={<ExamAttempt />} />
<Route path="/student/events" element={<StudentEventsPage />} />
<Route path="/student/results" element={<StudentResults />} />
<Route path='/student/exams' element={<StudentExams />} />
<Route path="/student/exitclassrooms" element={<StudentClassrooms />} />
        {/* Admin management pages */}
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/tutors" element={<ManageTutors />} />
        <Route path="/admin/students" element={<ManageStudents />} />
        <Route path="/admin/block-users" element={<BlockedUsers />} />
          <Route path="/certificates/approve/:id" element={<CertificatePreview />} />
         <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CheckEnquiries />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/admin/announcements" element={<Announcements />} /> */}
        <Route path="/admin/events" element={<ManageEvents />} />
        <Route path="/admin/certificates" element={<ApproveCertificates />} />

        {/* Tutor routes under layout */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute allowedRoles={['tutor']}>
              <TutorLayout />
            </ProtectedRoute>
          }
        >
          
          <Route index element={<TutorDashboard />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="classrooms" element={<ClassroomList />} />
          <Route path="exams-list" element={<ExamsList />} />
          <Route path="classrooms/:id" element={<ClassroomDetails />} />
          <Route path="edit-exam/:id" element={<EditExam />} />
          <Route path="profile" element={<CommonProfile />} />
          <Route path="/tutor/events" element={<TutorEventsPage />} />
          <Route path="download-certificate/:id" element={<TutorDownloadCertificate />} />
          <Route path="students" element={<TutorStudents />} />
          
          <Route path="submissions" element={<ExamSubmissions />} />
        <Route path="/tutor/evaluate/:submissionId" element={<EvaluateSubmission />} />

          {/* <Route path="submissions" element={<ViewSubmissions />} /> */}
          <Route path="request-certificate" element={<TutorRequestCertificate />} />
        </Route>
          <Route path="/tutor/proctoring" element={<TutorProctoring />} />
<Route path="/tutor/proctoring/:examId" element={<TutorProctoring />} />
        <Route path="/tutor-dashboard" element={<Navigate to="/tutor" replace />} />

      </Routes>
    </div>
  );
}

export default App;
