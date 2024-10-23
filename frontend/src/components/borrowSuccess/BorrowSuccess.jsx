import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './borrowSuccess.scss';

const BorrowSuccess = () => {
  const location = useLocation();
  const {
    userID,
    userName,
    courseSubject,
    professor, 
    profAttendance,
    roomNo,
    borrowedDuration,
    dateTime,
    items
  } = location.state || {};

  useEffect(() => {
    console.log('Location state in BorrowSuccess:', location.state); // Log the whole state to check items
    console.log('Items array:', items); // Log the items array specifically
  }, [items]);
  

  return (
    <div className="borrow-success">
      {/* Background image */}
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
        <li><strong>Date & Time:</strong> {new Date(dateTime).toLocaleString()}</li>
      </ul>

      <h3>Scanned Items:</h3>
      <ul>
        {items && items.map((item, index) => (
          <li key={index}>
            <strong>Item Name:</strong> {item.itemName},  <strong>Quantity:</strong> {item.quantity}
          </li>
        ))}
      </ul>

      <button onClick={() => window.location.href = '/'}>Done</button>
    </div>
  );
};

export default BorrowSuccess;
