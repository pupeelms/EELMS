import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import './ReturnSuccess.scss';

const ReturnSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { userID, pastTransactionID } = location.state || {}; 

  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  const fetchPendingTransactions = async () => {
    try {
      const response = await axios.get(`/api/users/${userID}/transactions`);
      const pendingTransactions = response.data.filter(transaction => {
        const hasPendingItems = transaction.items.some(
          item => item.quantityBorrowed !== item.quantityReturned
        );
        return transaction.transactionType === 'Borrowed' && hasPendingItems;
      });
      setTransactions(pendingTransactions);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
  };

  const handleDoneClick = async () => {
    try {
      if (!pastTransactionID || !selectedEmoji) {
        console.error('Transaction ID or feedback emoji is undefined.');
        return;
      }

      // Submit feedback to the backend
      await axios.put(`/api/borrow-return/feedback/${pastTransactionID}`, {
        feedbackEmoji: selectedEmoji,
      });

      // Check for pending transactions
      await fetchPendingTransactions();

      if (transactions.length > 0) {
        setShowModal(true); // Show modal if pending transactions exist
      } else {
        navigate('/'); // Redirect if no pending transactions
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleReturnOther = () => {
    navigate('/returning', { state: { userID } }); // Pass userID
  };
  

  const handleExit = () => {
    navigate('/'); // Navigate to home page
  };

  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
  };

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  return (
    <div className="return-container">
      <img src="/ceafinal.png" alt="Background" className="bg-only" />
      <h2>Return Transaction Completed!</h2>
      <p>Thank you for returning the items.</p>

      <div className="qr-code">
        <p>Please scan the QR code below using your phone to provide feedback on your experience with our system:</p>
        <QRCode value="https://forms.gle/ouxAmFz3ZyrsCEqy5" size={200} />
      </div>

      <div className="feedback-emoji">
        <p>How was your experience? Please select an emoji:</p>
        <div className="emoji-options">
          {['😡', '😕', '😐', '😊', '😍'].map((emoji) => (
            <button
              key={emoji}
              className={`emoji-button ${selectedEmoji === emoji ? 'selected' : ''}`}
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {selectedEmoji && (
        <button
          className="return-success-button"
          onClick={handleDoneClick}
        >
          Done
        </button>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Would you like to return other transaction(s)?</h3>
            <div className="modal-buttons">
              <button onClick={handleReturnOther} className="return-other">
                Return Other Items
              </button>
              <button onClick={handleExit} className="exit">
                Return to User Portal 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnSuccess;
