import React, {useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WaitingApproval = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Waiting for Approval";
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>Waiting for Approval</h1>
      <p>Your admission form has been submitted successfully and is waiting for admin approval.</p>
      <p>You will be able to access the dashboard once your application is approved.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default WaitingApproval;