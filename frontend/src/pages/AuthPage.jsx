import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthSelection from '../components/Login-Register/AuthSelection';
import LoginForm from '../components/Login-Register/LoginForm';
import RegisterForm from '../components/Login-Register/RegisterForm';
import '../components/Login-Register/Auth.css';
import './AuthPage.css';

const AuthPage = ({ setIsLoggedIn }) => {
  return (
    <>
    <div className='main-auth'>
    <div className="main-login">
      <h1 id="title">Welcome to Dry Panda</h1>

      <Routes>
        <Route index element={<AuthSelection />} />
        <Route path="customer" element={<LoginForm role="customer" setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="operator" element={<LoginForm role="operator" setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="admin" element={<LoginForm role="admin" setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="register" element={<RegisterForm />} />
      </Routes>
    </div>
    </div>
    </>
  );
};

export default AuthPage;
