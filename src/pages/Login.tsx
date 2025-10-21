import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);

  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {isLogin ? (
        <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

export default Login;










