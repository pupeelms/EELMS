import "./borrowReturnSelection.scss";
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BorrowReturnSelection = () => {
  const navigate = useNavigate();

  // Retrieve userID and userName from localStorage
  const userID = localStorage.getItem('userID');
  const userName = localStorage.getItem('userName'); // Retrieve userName from localStorage
  
  const handleBorrowClick = () => {
    // Navigate to borrowing page with userID, userName, and transactionType
    navigate('/borrowing', { state: { userID, userName, transactionType: 'Borrowed' } });
  };

  const handleReturnClick = () => {
    // Navigate to returning page with userID, userName, and transactionType
    navigate('/returning', { state: { userID, userName, transactionType: 'Returned' } });
  };

  return (
    <div className="borrow-return-selection">
            {/* Background image */}
            <img src="/ceaa.png" alt="Background" className="bg-only" />
            
      {userName && <h3>{userName}</h3>} {/* Display userName if available */}
      <h2>Choose Transaction:</h2>
      <button onClick={handleBorrowClick}>Borrow Items</button>
      <button onClick={handleReturnClick}>Return Items</button>
    </div>
  );
};

export default BorrowReturnSelection;
