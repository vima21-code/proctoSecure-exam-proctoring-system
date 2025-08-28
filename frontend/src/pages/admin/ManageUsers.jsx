import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("tutor"); 
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(
          `/admin/users?role=${activeTab}&status=${statusFilter}&search=${searchTerm}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [activeTab, searchTerm, statusFilter]);

  // Block user only (no unblock)
  const blockUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.put(
        `/admin/users/${userId}/block`,
        { isBlocked: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBlocked: res.data.user.isBlocked } : u
        )
      );
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const filteredUsers = users
    .filter((u) => u.role?.toLowerCase() === activeTab)
    .filter((u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    .filter((u) => {
      if (statusFilter === "active") return !u.isBlocked;
      if (statusFilter === "blocked") return u.isBlocked;
      return true;
    });

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "tutor" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("tutor")}
        >
          Tutors
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "student" ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("student")}
        >
          Students
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="blocked">Blocked Users</option>
        </select>
      </div>

      {/* User Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id} className="border-b">
              <td className="p-2">{user.name || "N/A"}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2 capitalize">{user.role}</td>
              <td className="p-2">
                {user.isBlocked ? (
                  <span className="text-red-500 font-semibold">Blocked</span>
                ) : (
                  <span className="text-green-500 font-semibold">Active</span>
                )}
              </td>
              <td className="p-2 text-center">
                <button
                  onClick={() => blockUser(user._id)}
                  disabled={user.isBlocked} // disable if already blocked
                  title={
                    user.isBlocked
                      ? "User is already blocked"
                      : "Click to block user"
                  }
                  className={`px-4 py-1 rounded text-white transition ${
                    user.isBlocked
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  Block
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredUsers.length === 0 && (
        <p className="text-gray-500 mt-4">No users found.</p>
      )}
    </div>
  );
};

export default ManageUsers;
