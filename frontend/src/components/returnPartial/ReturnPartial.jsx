import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ReturnPartial.scss'; // Import the SCSS file

const ReturnPartial = ({ remainingItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { items } = location.state || {};
  
  // State to store the reason for partial return
  const [partialReturnReason, setPartialReturnReason] = useState('');

  useEffect(() => {
    console.log('Items array:', items); // Log the items array specifically
  }, [items]);

  // Handle the form submission for partial return reason and navigation
  const handleSubmitReason = async () => {
    try {
      const transactionId = location.state.pastTransactionID; // Assume this is passed in location.state
      const reason = partialReturnReason;

      if (!transactionId) {
        console.error('Transaction ID is undefined.');
        return;
      }
 
      if (!reason) {
        console.error('No reason provided for partial return.');
        return;
      }

      // Make PUT request to submit partial return reason
      await axios.put(`/api/borrow-return/partial-return/${transactionId}`, { reason });
      
      console.log('Partial return reason submitted successfully!');
      
      // Navigate to the desired path after submission
      navigate('/'); 
    } catch (error) {
      console.error('Error submitting partial return reason:', error);
    }
  };

  return (
    <div className="return-partial-container">
      {/* Background image */}
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      
      <h2 className="return-partial-title">Partial Return Completed!</h2>
      <p className="return-partial-description">Thank you for returning some of the items. However, your return is only partially completed.</p>
      <p className="return-partial-instruction">Please return the remaining items listed below:</p>
      
      <div className="return-partial-items">
        <ul className="items-list-return">
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <li key={index} className="item">
                <strong>{item.itemName}</strong>  ({item.itemBarcode}) 
              </li>
            ))
          ) : (
            <p className="all-returned-message">All items have been returned.</p>
          )}
        </ul>
      </div>

      {/* Input for partial return reason */}
      <div className="partial-return-reason">
        <label htmlFor="reason">Reason for partial return:</label>
        <textarea
          className='enter-reason'
          id="reason"
          value={partialReturnReason}
          onChange={(e) => setPartialReturnReason(e.target.value)}
          placeholder="Enter the reason for not returning all items..."
        />
      </div>

      {/* Submit reason button which also navigates to the desired path */}
      <button
        className="return-partial-submit-button"
        onClick={handleSubmitReason}
        disabled={!partialReturnReason} // Disable button if no reason is provided
      >
        Submit
      </button>
    </div>
  );
};

export default ReturnPartial;
