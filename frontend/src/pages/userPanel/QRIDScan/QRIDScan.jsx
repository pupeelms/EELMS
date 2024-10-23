import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './qrIDScan.scss'; // Assuming you have this SCSS file for styling

const QRIDScanPage = () => {
  const [qrID, setQrID] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  let debounceTimeout = null;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle barcode scanning input
  const handleBarcodeScan = (e) => {
    const scannedID = e.target.value;
    setQrID(scannedID);

    // Clear the previous debounce timeout
    if (debounceTimeout) clearTimeout(debounceTimeout);

    // Only verify if the scanned input reaches 24 characters
    if (scannedID.length === 24) {
      debounceTimeout = setTimeout(() => {
        verifyUser(scannedID);
      }, 500);  // Shortened debounce to 200ms to improve responsiveness
    }
  };

  // Verify the scanned ID by making an API call
  const verifyUser = async (scannedID) => {
    try {
      console.log('Full Scanned ID:', scannedID);
      const response = await axios.get(`/api/users/${scannedID}`);
      if (response.status === 200) {
        setUserName(response.data.fullName);
        setError('');

        localStorage.setItem('userID', scannedID);
        localStorage.setItem('userName', response.data.fullName);
      } else {
        setError('User not found');
      }
    } catch (error) {
      setError('An error occurred while verifying the user.');
    }
  };

  // Navigate to the next page
  const handleContinue = () => {
    navigate('/borrow-return-selection');
  };

  return (
    <div className="qr-id-scan-page">
      {/* Background image */}
      <img src="/ceaa.png" alt="Background" className="bg-only" />

      <div className="qr-id-content-container">
        <h2>Please scan your QR ID to log in your transaction.</h2>

        {/* Visible input box to view scanned QR code */}
        <input
          ref={inputRef}
          type="text"
          value={qrID}
          onChange={handleBarcodeScan}
          className="visible-input"  // Add custom styling class for the input
        />
        
        {/* Showing the user's name if verified */}
        {userName && <h3>Welcome, {userName}!</h3>}
        
        {/* Display any errors that occur */}
        {error && <p className="error">{error}</p>}
        
        {/* Continue button */}
        {userName && <button onClick={handleContinue}>Continue</button>}
      </div>
    </div>
  );
};

export default QRIDScanPage;
