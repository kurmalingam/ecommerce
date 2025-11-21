import React, { useState, useEffect, useRef } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom';
import './Auth.css';


const RegisterForm = () => {
  const [form, setForm] = useState({
    regType: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
  });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const recaptchaWidgetId = useRef(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_KEY;

  useEffect(() => {
    const loadRecaptcha = () => {
      if (window.grecaptcha && recaptchaWidgetId.current === null) {
        recaptchaWidgetId.current = window.grecaptcha.render('recaptcha-container', {
          sitekey: siteKey,
        });
      }
    };

    if (window.grecaptcha) {
      loadRecaptcha();
    } else {
      window.onloadCallback = loadRecaptcha;
    }
  }, [siteKey]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.regType) newErrors.regType = 'Select a registration type.';
    if (!form.username.trim()) newErrors.username = 'Username is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!/^\d{10}$/.test(form.contact)) newErrors.contact = 'Contact must be 10 digits.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const recaptchaToken = window.grecaptcha.getResponse(recaptchaWidgetId.current);
    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA.');
      return;
    }
   // http://localhost:5000/api/register or /login
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful!');
        setForm({
          regType: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          contact: '',
        });
        setErrors({});
        window.grecaptcha.reset(recaptchaWidgetId.current);
        navigate('/auth'); 
      } else {
        alert(data.message || 'Registration failed.');
        window.grecaptcha.reset(recaptchaWidgetId.current);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong.');
      window.grecaptcha.reset(recaptchaWidgetId.current);
    }
  };
 


  return (
    <form id="register-form" onSubmit={handleRegister} className="form-container">
      <div className="form-group">
        <select name="regType" value={form.regType} onChange={handleChange}>
          <option value="">Select Registration Type</option>
          <option value="customer">Customer</option>
        </select>
        <small className="error">{errors.regType}</small>
      </div>

      <div className="form-group">
        <input type="text" name="username" placeholder="Fullname" value={form.username} onChange={handleChange} />
        <small className="error">{errors.username}</small>
      </div>

      <div className="form-group">
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <small className="error">{errors.email}</small>
      </div>

      <div className="form-group">
        <input 
        autoComplete="new-password"
        type="password" 
        name="password" 
        placeholder="Password" 
        value={form.password} 
        onChange={handleChange} />
        <small className="error">{errors.password}</small>
      </div>

      <div className="form-group">
        <input 
        autoComplete="new-password"
        type="password" 
        name="confirmPassword" 
        placeholder="Confirm Password" 
        value={form.confirmPassword} 
        onChange={handleChange} />
        <small className="error">{errors.confirmPassword}</small>
      </div>

      <div className="form-group">
        <input type="tel" name="contact" placeholder="Contact Number" value={form.contact} onChange={handleChange} pattern="[0-9]{10}" />
        <small className="error">{errors.contact}</small>
      </div>

      <div id="recaptcha-container" style={{ margin: '10px auto' }}></div>

      <button type="submit" className="register-btn">Register</button>
    </form>
  );
};

export default RegisterForm;
