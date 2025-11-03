import React from 'react';
import { useNavigate } from 'react-router-dom';

const AuthSelection = () => {
  const navigate = useNavigate();

  return (
    <div id="choice-buttons">
      <button className="customer-btn" onClick={() => navigate('/auth/customer')}>Login as Customer</button>
      <button className="operator-btn" onClick={() => navigate('/auth/operator')}>Login as Operator</button>
      <button className="admin-btn" onClick={() => navigate('/auth/admin')}>Login as Admin</button>
      <button className="register-btn" onClick={() => navigate('/auth/register')}>Register New Account</button>
    </div>
  );
};

export default AuthSelection;
