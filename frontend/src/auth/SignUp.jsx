// src/pages/auth/SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const { name, email, password, confirmPassword, role } = formData;

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      const { token, name: returnedName, role: rawRole, hasProfile } = res.data;

      // Normalize role for consistency
      const returnedRole = rawRole?.toString().trim().toLowerCase();

      localStorage.setItem(
        'user',
        JSON.stringify({ token, role: returnedRole, name: returnedName, hasProfile })
      );

      console.log("ROLE FROM SERVER:", rawRole);
      console.log("ROLE NORMALIZED:", returnedRole);

      if (!hasProfile) {
        navigate(`/profile`);
      } else {
        navigate(`/${returnedRole}-dashboard`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.msg || err.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
      {error && (
        <p className="text-red-600 text-sm bg-red-100 p-2 rounded">{error}</p>
      )}

      {/* Role selection */}
      <div className="flex justify-between space-x-2 mb-2">
        {['admin', 'tutor', 'student'].map(r => (
          <button
            type="button"
            key={r}
            className={`flex-1 py-2 rounded-md font-semibold ${
              formData.role === r
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-black'
            }`}
            onClick={() => setFormData({ ...formData, role: r })}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        className="w-full px-4 py-3 border rounded-md"
        value={formData.name}
        onChange={handleChange}
        required
        autoComplete="name"
      />
      <input
        type="email"
        name="email"
        placeholder="Email Address"
        className="w-full px-4 py-3 border rounded-md"
        value={formData.email}
        onChange={handleChange}
        required
        autoComplete="email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="w-full px-4 py-3 border rounded-md"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        className="w-full px-4 py-3 border rounded-md"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        autoComplete="new-password"
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
      >
        Signup
      </button>
    </form>
  );
};

export default SignUp;
