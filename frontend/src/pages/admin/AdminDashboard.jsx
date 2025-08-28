import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [blockedUsers, setBlockedUsers] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        if (!token) return;

        const res = await axios.get(
          'http://localhost:5000/api/admin/users/blocked',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBlockedUsers(res.data);
      } catch (err) {
        console.error('Error fetching blocked users:', err);
      }
    };

    fetchBlockedUsers();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1581093588401-7c84ecf3ecf8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')`,
      }}
    >
      <div className="bg-white bg-opacity-80 min-h-screen">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Users */}
          <Link
            to="/admin/users"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition hover:bg-blue-100"
          >
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Manage Users</h2>
            <p className="text-gray-600 mb-4">Add, remove, or update user roles.</p>
            <span className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Users</span>
          </Link>

          {/* Manage Tutors */}
          <Link
            to="/admin/tutors"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition hover:bg-green-100"
          >
            <h2 className="text-xl font-semibold mb-2 text-green-700">Manage Tutors</h2>
            <p className="text-gray-600 mb-4">Assign subjects and track tutor performance.</p>
            <span className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">View Tutors</span>
          </Link>

          {/* Manage Students */}
          <Link
            to="/admin/students"
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition hover:bg-purple-100"
          >
            <h2 className="text-xl font-semibold mb-2 text-purple-700">Manage Students</h2>
            <p className="text-gray-600 mb-4">Monitor student activity and progress.</p>
            <span className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">View Students</span>
          </Link>
         {/* Block / Unblock Users */}
          <div className="bg-yellow-200 shadow rounded-lg p-6 hover:bg-yellow-300 transition">
            <h2 className="text-xl font-semibold text-yellow-800">Blocked Users</h2>
            {blockedUsers.length > 0 ? (
              <ul className="mt-2 text-sm text-yellow-900">
                {blockedUsers.map(user => (
                  <li key={user._id}>
                    {user.name} <span className="text-gray-700">({user._id})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-yellow-700 mt-2">No blocked users.</p>
            )}
            <Link
              to="/admin/block-users"
              className="mt-4 inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Manage Blocked Users
            </Link>
          </div>

          {/* Events */}
          <Link
            to="/admin/events"
            className="bg-green-200 shadow rounded-lg p-6 hover:bg-green-300 transition"
          >
            <h2 className="text-xl font-semibold text-green-800">Manage Events</h2>
            <p className="text-sm text-green-800">Webinars, certificate exams, etc.</p>
          </Link>
           {/* Check enquiries */}
          <Link
            to="/admin/enquiries"
            className="bg-blue-200 shadow rounded-lg p-6 hover:bg-blue-300 transition"
          >
            <h2 className="text-xl font-semibold text-blue-900">Check Enquiries</h2>
            <p className="text-sm text-blue-800">Check and revert to the enquiries</p>
          </Link>

          {/* Certificates */}
          <Link
            to="/admin/certificates"
            className="bg-indigo-200 shadow rounded-lg p-6 hover:bg-indigo-300 transition"
          >
            <h2 className="text-xl font-semibold text-indigo-800">Approve Certificates</h2>
            <p className="text-sm text-indigo-800">Confirm and issue certificates</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
