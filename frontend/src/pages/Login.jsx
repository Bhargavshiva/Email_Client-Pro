
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(true); // Dark mode toggle
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center vh-100"
      style={{
        backgroundColor: darkMode ? '#1e1e2f' : '#eaeaff',
        transition: '0.4s ease-in-out',
        position: 'relative',
      }}
    >
      {/* Toggle Theme Button */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button
          className={`btn btn-sm ${darkMode ? 'btn-light' : 'btn-dark'}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
        </button>
      </div>

      <div
        className="card shadow-lg p-4 border-0"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '1rem',
          backgroundColor: darkMode ? '#2e2e3e' : '#ffffff',
          color: darkMode ? '#f8fafc' : '#0f172a',
          transition: '0.4s ease-in-out',
        }}
      >
        <div className="text-center mb-4">
          <img
            src="https://img.icons8.com/color/96/secured-letter.png"
            alt="Mail Logo"
            className="img-fluid mb-2"
            style={{ width: '60px' }}
          />
          <h2
            className="mt-2"
            style={{ color: darkMode ? '#38bdf8' : '#10b981' }}
          >
            Welcome Back
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              className="form-control border-start-0"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-lock"></i>
            </span>
            <input
              className="form-control border-start-0"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="btn w-100 mb-3"
            style={{
              backgroundColor: darkMode ? '#38bdf8' : '#10b981',
              color: '#ffffff',
              fontWeight: '500',
            }}
          >
            Login
          </button>
          <p className="text-center mb-0">
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className="fw-bold"
              style={{ color: darkMode ? '#38bdf8' : '#10b981' }}
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
