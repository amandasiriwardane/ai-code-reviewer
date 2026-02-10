import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import '../styles/signup.css'; 
import { API_BASE_URL } from '../api/config.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // From our context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Hits the login route we built in the authController
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      // login(userData, token) updates our context and localStorage
      login({ email: response.data.email, id: response.data._id }, response.data.token);
      
      // Send them to the dashboard now that they are authenticated!
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p>Log in to access your AI code review history.</p>
        
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="btn-primary">Sign In</button>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}