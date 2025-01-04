import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './borrowSuccess.scss';

const BorrowSuccess = () => {
  // Access location state from react-router
  const location = useLocation();

  // Destructure values from location.state and set default empty array for items
  const {
    userID,
    userName,
    courseSubject,
    professor,
    profAttendance,
    roomNo,
    borrowedDuration,
    dateTime,
    items = [], // Default to empty array if items is undefined
    newTransactionDetails,
  } = location.state || {};  // Ensure location.state is safe to access

  // Log the items and location state to ensure data is being passed
  useEffect(() => {
    console.log('Location state in BorrowSuccess:', location.state); // Log the whole state to inspect it
    console.log('Items array in BorrowSuccess:', items);  // Log just the items
  }, [location.state, items]); // Re-run the effect if location or items change

  return (
    <div className="borrow-success">
      <img src="/ceafinal.png" alt="Background" className="bg-only" />
      <h2>Borrow Transaction Successful!</h2>
      <p>Your borrowing transaction has been completed successfully.</p>
      
      <h3>Transaction Details:</h3>
      <ul>
        <li><strong>User ID:</strong> {userID}</li>
        <li><strong>User Name:</strong> {userName}</li>
        <li><strong>Course Subject:</strong> {courseSubject}</li>
        <li><strong>Professor:</strong> {professor}</li>
        <li><strong>Room No:</strong> {roomNo}</li>
        <li><strong>Borrowed Duration:</strong> {borrowedDuration}</li>
        <li>
  <strong>Date & Time: </strong> 
  {newTransactionDetails?.dateTime 
    ? new Date(newTransactionDetails.dateTime).toLocaleString() 
    : (dateTime ? new Date(dateTime).toLocaleString() : 'Invalid Date')
  }
</li>


      </ul>

      <h3>Scanned Items:</h3>
      <ul>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <li key={index}>
              <strong>Item Name:</strong> {item.itemName},<br />  
              <strong>Quantity:</strong> {item.quantityBorrowed}
            </li>
          ))
        ) : (
          <li>No items were borrowed.</li>
        )}
      </ul>

      <button onClick={() => window.location.href = '/'}>Done</button>
    </div>
  );
};

export default BorrowSuccess;
