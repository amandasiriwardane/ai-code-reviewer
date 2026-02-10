import React, { useState } from 'react';
import { _useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/signup.css'; 
import { API_BASE_URL } from '../api/config.js';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  //const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // Connects to the backend register route we built earlier
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        email,
        password,
      });

      setMessage(response.data.message); // "Success! Check your email..."
      // Optionally redirect to login after a delay
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Join AmazAI</h2>
        <p>Expert code reviews are one click away.</p>
        
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="btn-primary">Create Account</button>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
}