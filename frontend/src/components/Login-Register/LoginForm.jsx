import React, { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Login successful!');
        localStorage.setItem('token', data.token);
        localStorage.setItem("userRole", "customer");
        setIsLoggedIn(true);       // ✅ Set login state
        navigate('/');   // Customer goes to e-cart

      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <form id="login-form" onSubmit={handleLogin} style={{ display: 'flex' }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" className="operator-btn">Login</button>
    </form>
  );
};

export default LoginForm;
