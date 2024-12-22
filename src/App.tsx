import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { MembershipForm } from './components/membership/MembershipForm';
import './App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return <MembershipForm />;
}

export default App;
