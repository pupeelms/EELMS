import React from 'react';
import { useNavigate } from 'react-router-dom';
import './userWelcome.scss'; // User-specific SCSS

const UserWelcome = () => {
  const navigate = useNavigate(); 

  const handleUserClick = () => {
    navigate('/user-selection'); // Redirect to user selection page
  };

  const handleReportClick = () => {
    navigate('/report'); // Redirect to report page
  };

  return (
    <div className="user-welcome-container">
      <img src="/ceafinal.png" alt="Background" className="bg-only" />

      <div className="user-welcome-content-container">
        <div className="user-welcome2-container">
          <h1>User Portal</h1>
          <h3>Electrical Engineering Laboratory Management System</h3>
        </div>
        <div className="user-welcome-form-container">
          <button className="user-welcome-button" onClick={handleUserClick}>
            User
          </button>
          <button className="user-welcome-button" onClick={handleReportClick}>
            Report an Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserWelcome;
