import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const BlockedUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchBlockedUsers = async () => {
    try {
      // Correctly retrieve the token directly from localStorage
      const token = localStorage.getItem('token');
      const res = await axiosInstance.get(
        '/admin/users/blocked',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      // Correctly retrieve the token directly from localStorage
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        `/admin/users/${userId}/unblock`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error('Error unblocking user:', err);
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blocked Users</h1>
      {users.length > 0 ? (
        <ul className="space-y-3">
          {users.map((user) => (
            <li
              key={user._id}
              className="flex justify-between items-center bg-white shadow p-3 rounded"
            >
              <span>{user.name} ({user.email})</span>
              <button
                onClick={() => handleUnblock(user._id)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No blocked users.</p>
      )}
    </div>
  );
};

export default BlockedUsers;