import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      let { token, role, name, hasProfile } = res.data;

      if (!role) return setError('No role returned from server.');

      // Normalize role
      role = role.toString().trim().toLowerCase();

      // Save user for ProtectedRoute
      localStorage.setItem('user', JSON.stringify({ token, role, name, hasProfile }));

      // Redirect
      if (!hasProfile && role !== "admin") {
        navigate(`/profile`);
      } else {
        navigate(`/${role}-dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm bg-red-100 p-2 rounded">{error}</p>}
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        className="w-full px-4 py-3 border rounded-md"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full px-4 py-3 border rounded-md"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <div className="text-right">
        <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
      </div>
      <button className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition">
        Login
      </button>
      <p className="text-center text-sm">
        Not a member? <span className="text-blue-600 font-semibold">Signup now</span>
      </p>
    </form>
  );
};

export default SignIn;
