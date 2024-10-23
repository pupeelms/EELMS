import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';
import './ReturnSuccess.scss'; // Import SCSS 

const ReturnSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get userID and pastTransactionID from location state
  const { userID, selectedTransactionID, pastTransactionID } = location.state || {}; 

  // Log location state for debugging
  useEffect(() => {
    console.log('Location State:', location.state);
    console.log('Passed Transaction ID:', pastTransactionID); // Log the passed transaction ID
  }, [location.state, pastTransactionID]);

  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const emojis = ['😡', '😕', '😐', '😊', '😍'];
 
  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
    console.log(`Selected emoji: ${emoji}`);
  };

  // Handle done click
  const handleDoneClick = async () => {
    try {
      const transactionId = pastTransactionID;
      const feedbackEmoji = selectedEmoji;

      console.log('Submitting feedback for transaction:', transactionId);
      console.log('Selected Emoji:', feedbackEmoji);

      // Ensure transactionId and feedbackEmoji are defined
      if (!transactionId) {
        console.error('Transaction ID is undefined.');
        return;
      }

      if (!feedbackEmoji) {
        console.error('No emoji selected for feedback.');
        return;
      }

      // Make PUT request to submit feedback
      await axios.put(`/api/borrow-return/feedback/${transactionId}`, { feedbackEmoji });
      
      console.log('Feedback successfully submitted!');
      
      // Navigate back to the main page or another relevant page
      navigate('/');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };
  
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
          {emojis.map((emoji) => (
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

      <button
        className="return-success-button"
        onClick={handleDoneClick}
        disabled={!selectedEmoji} // Disable button if no emoji is selected
      >
        Done
      </button>
    </div>
  );
};

export default ReturnSuccess;
