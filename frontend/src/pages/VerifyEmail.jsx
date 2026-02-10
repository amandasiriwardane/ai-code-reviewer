import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/auth/verify/${token}`);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-form">
        {status === 'verifying' && <h2>Verifying your email...</h2>}
        {status === 'success' && (
          <>
            <h2>Email Verified!</h2>
            <p>Your account is now secure. You can sign in.</p>
            <Link to="/login" className="btn-primary" style={{textAlign: 'center', display: 'block', textDecoration: 'none'}}>Sign In</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{color: '#f85149'}}>Verification Failed</h2>
            <p>The link might be expired or invalid.</p>
            <Link to="/signup" className="btn-primary" style={{textAlign: 'center', display: 'block', textDecoration: 'none', backgroundColor: '#30363d'}}>Try Signing Up Again</Link>
          </>
        )}
      </div>
    </div>
  );
}