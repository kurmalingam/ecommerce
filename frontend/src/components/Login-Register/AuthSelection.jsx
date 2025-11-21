import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSelection = () => {
  const navigate = useNavigate();

  return (
    <div id="choice-buttons">
      <button className="customer-btn" onClick={() => navigate('/auth/login')}>Login</button>
      <button className="register-btn" onClick={() => navigate('/auth/register')}>Register New Account</button>
    </div>
  );
};

export default AuthSelection;
