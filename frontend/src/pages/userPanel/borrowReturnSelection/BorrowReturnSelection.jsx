import "./borrowReturnSelection.scss";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BorrowReturnSelection = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Retrieve userID and userName from localStorage
  const userID = localStorage.getItem('userID');
  const userName = localStorage.getItem('userName'); // Retrieve userName from localStorage

  const handleBorrowClick = async () => {
    if (!userID || !userName) {
      setError('User data not found.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`/api/users/${userID}/transactions`);
      const borrowedTransactions = response.data.filter(transaction => {
        const hasPendingItems = transaction.items.some(item => item.quantityBorrowed !== item.quantityReturned);
        return transaction.transactionType === 'Borrowed' && hasPendingItems;
      });

      if (borrowedTransactions.length > 0) {
        // If there are pending borrowed transactions, navigate to borrowing-check
        navigate('/borrowing-check', { state: { userID, userName, transactionType: 'Borrowed' } });
      } else {
        // If no pending transactions, navigate to borrowing page
        navigate('/borrowing', { state: { userID, userName, transactionType: 'Borrowed' } });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Error checking past transactions.');
    } finally {
      setLoading(false);
    }
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

      {error && <p className="error">{error}</p>} {/* Display error message */}
      {loading ? (
        <p>Loading...</p> // Show loading state while fetching transactions
      ) : (
        <>
          <button onClick={handleBorrowClick}>Borrow Items</button>
          <button onClick={handleReturnClick}>Return Items</button>
        </>
      )}
    </div>
  );
};

export default BorrowReturnSelection;
