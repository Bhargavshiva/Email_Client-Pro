
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/signup', { username, email, password });
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const backgroundColor = darkMode ? '#0f172a' : '#ecfdf5';
  const cardBgColor = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#ffffff' : '#0f172a';
  const accentColor = '#10b981';

  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center vh-100"
      style={{ backgroundColor: backgroundColor, transition: '0.3s' }}
    >
      <div
        className="position-absolute top-0 end-0 m-3"
        style={{ zIndex: 10 }}
      >
        <button className="btn btn-outline-light btn-sm" onClick={toggleTheme}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div
        className="card shadow-lg p-4 border-0"
        style={{
          maxWidth: '420px',
          width: '100%',
          borderRadius: '1rem',
          backgroundColor: cardBgColor,
          color: textColor,
          transition: '0.3s'
        }}
      >
        <div className="text-center mb-4">
          <img
            src="https://img.icons8.com/color/96/secured-letter.png"
            alt="Mail Logo"
            className="img-fluid mb-2"
            style={{ width: '60px' }}
          />
          <h2 className="mt-2" style={{ color: accentColor }}>Create Account</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-person"></i></span>
            <input
              className="form-control border-start-0"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-envelope"></i></span>
            <input
              className="form-control border-start-0"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
          </div>
          <div className="mb-4 input-group">
            <span className="input-group-text bg-white border-end-0"><i className="bi bi-lock"></i></span>
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
            style={{ backgroundColor: accentColor, color: '#ffffff', fontWeight: '500' }}
          >
            Sign Up
          </button>
          <p className="text-center mb-0">
            Already have an account?{' '}
            <Link to="/login" className="fw-bold" style={{ color: accentColor }}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
