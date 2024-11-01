import React from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code'; // Ensure the package is installed
import './NewUserInstruction.scss'; // Import the updated SCSS file

const NewUserInstruction = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const localNetworkLink = `https://eelms.onrender.com/new-user-registration`; // Get the local network URL from Vite env

  // Handle the 'Register New User' button click
  const handleRegisterClick = () => {
    navigate('/new-user-registration'); // Redirect to new user registration page
  };

  // Handle the 'Back' button click 
  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="new-user-instructions-container">
      {/* Background image */}
      <img src="/ceaa.png" alt="Background" className="bg-only" />

      <h2>New User Instructions</h2>
      <strong>Welcome! Please follow these instructions to register:</strong>
      <ol>
        <li>Scan the QR code below to register or click the "Register New User" button to access the registration form.</li>
        <li>Fill out the required information.</li>
        <li>Submit the form and await confirmation via email.</li>
      </ol>

      {/* QR Code for accessing the form */}
      <div className="qr-code">
        <QRCode value={localNetworkLink} size={256} /> {/* Adjust size as needed */}
      </div>

      {/* Button Section */}
      <div className="button-container">
        <button onClick={handleRegisterClick} className="register-button">
          Register New User
        </button>
      </div>

      {/* Back link below the Done button */}
      <a className="back-link" onClick={handleBackClick}>
        Back
      </a>
    </div>
  );
};

export default NewUserInstruction;
