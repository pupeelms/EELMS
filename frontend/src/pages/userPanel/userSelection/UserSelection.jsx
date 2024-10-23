import React from 'react';
import { useNavigate } from 'react-router-dom';
import './userSelection.scss'; // Importing the SCSS file for styling

const UserSelection = () => {
  const navigate = useNavigate();

  const handleNewUserClick = () => {
    navigate('/registration'); // Redirect to registration page
  };

  const handleRegisteredUserClick = () => {
    navigate('/scan-qr-id'); // Redirect to QR scanning page
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };
 
  return (
    <div className="user-selection-container">
      {/* Background image */}
      <img src="/ceafinal.png" alt="Background" className="bg-only" />

      <div className="user-selection-content-container">
        <h1>Select User Type</h1>
        <div className="user-selection-form-container">
          <button className="user-selection-button" onClick={handleNewUserClick}>New User</button>
          <button className="user-selection-button" onClick={handleRegisteredUserClick}>Registered User</button>
        </div>
        <div className="back-link-container">
          <a className="back-link" onClick={handleBackClick}>Back</a>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;
