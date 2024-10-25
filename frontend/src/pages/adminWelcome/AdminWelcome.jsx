import React from 'react';
import { useNavigate } from 'react-router-dom';
import './adminWelcome.scss'; // Admin-specific SCSS

const AdminWelcome = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/login'); // Redirect to admin login page
  };

  return (
    <div className="admin-welcome-container">
      <img src="/ceafinal.png" alt="Background" className="bg-only" />

      <div className="admin-welcome-content-container">
        <div className="admin-welcome2-container">
          <h1>Admin Portal</h1>
          <h3>Electrical Engineering Laboratory Management System</h3>
        </div>
        <div className="admin-welcome-form-container">
          <button className="admin-welcome-button" onClick={handleAdminLogin}>
            Admin Login
          </button>
        <div className="user-welcome-guide-container">
        <a
          href="https://drive.google.com/drive/folders/1hbp5ooHATv_wyFEDZ74u4qL-FjmpJAds?usp=sharing"
          className="user-welcome-guide-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          An Admin's Guide Manual on How to Use EELMS (PDF)
        </a>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcome;
