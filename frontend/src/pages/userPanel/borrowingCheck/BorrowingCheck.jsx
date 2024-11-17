import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './borrowingCheck.scss';

const BorrowingCheck = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userID, userName, transactionType } = location.state || {};

  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPastTransactions = async () => {
      try {
        const response = await axios.get(`/api/users/${userID}/transactions`);
        const borrowedTransactions = response.data.filter(transaction => {
          const hasPendingItems = transaction.items.some(item => item.quantityBorrowed !== item.quantityReturned);
          return transaction.transactionType === 'Borrowed' && hasPendingItems;
        });

        if (borrowedTransactions.length > 0) {
          setTransactions(borrowedTransactions);
        } else {
          setError("No past 'Borrowed' transactions with pending returns found.");
        }
      } catch (error) {
        console.error('Error fetching past transactions:', error);
        setError('Error fetching past transactions.');
      }
    };

    fetchPastTransactions();
  }, [userID]);

  const handleSelectTransaction = (transaction) => {
    setSelectedTransaction(transaction); // Set the selected transaction
    setShowModal(true); // Show modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close modal
  };

  const handleAddItems = (transaction) => {
    setSelectedTransaction(transaction); // Set the selected transaction in the state
    console.log('Selected Transaction:', transaction); // Log the transaction to verify it's the correct one
    
    // Navigate to /item-scan with the necessary state for scanning additional items
navigate('/item-scan', {
    state: {
      transactionID: transaction._id,
      userID,
      userName,
      transactionType: transaction.transactionType,
      borrowedDuration: transaction.borrowedDuration,
      courseSubject: transaction.courseSubject,
      professor: transaction.professor,
      profAttendance: transaction.profAttendance,
      roomNo: transaction.roomNo,
      contactNumber: transaction.contactNumber,
      dueDate: transaction.dueDate,
      dateTime: transaction.dateTime,
      returnStatus: transaction.returnStatus,
      items: transaction.items,  // Array of items being borrowed or returned
      overdueEmailSent: transaction.overdueEmailSent,
      reminderSent: transaction.reminderSent
    }
  });
  
  
    // Log to verify the navigation state being passed
    console.log('Navigating to /item-scan with the following state:', {
        transactionID: transaction._id,
        userID,
        userName,
        transactionType: transaction.transactionType,
        borrowedDuration: transaction.borrowedDuration,
        courseSubject: transaction.courseSubject,
        professor: transaction.professor,
        profAttendance: transaction.profAttendance,
        roomNo: transaction.roomNo,
        contactNumber: transaction.contactNumber,
        dueDate: transaction.dueDate,
        dateTime: transaction.dateTime,
        returnStatus: transaction.returnStatus,
        items: transaction.items,  // Array of items being borrowed or returned
        overdueEmailSent: transaction.overdueEmailSent,
        reminderSent: transaction.reminderSent
    });
  };

  const handleNewBorrow = () => {
    // Navigate to the /borrowing page to create a new transaction for a different course/subject
    navigate('/borrowing', { state: { userID, userName, transactionType: 'Borrowed' } });
  };

  const handleBackClick = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="returning-process">
      <img src="/ceaa.png" alt="Background" className="bg-only" />

      <h2 className="transaction-title">USER'S TRANSACTION</h2>

      {error && <p className="error">{error}</p>}

      {transactions.length > 0 ? (
        <div className="transaction-list">
          <h3>Select a transaction to add items or submit a new one:</h3>
          <ul>
            {transactions.map((transaction) => (
              <li
                key={transaction._id}
                onClick={() => handleSelectTransaction(transaction)}
                className="transaction-item"
              >
                <p><strong>Transaction ID:</strong> {transaction._id}</p>
                <p><strong>User:</strong> {transaction.userName}</p>
                <p><strong>Course/Subject:</strong> {transaction.courseSubject}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading your past transactions...</p>
      )}

      <div>
       <button onClick={handleNewBorrow} className="new-item-button">Borrow Item(s) for Other Course/Subject</button>
      </div>
      <div>
        <button onClick={handleBackClick} className="new-back-button">Back</button> {/* Back button */}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="return-modal-overlay">
          <div className="return-modal-content">
            <h3>Transaction Details</h3>
            {selectedTransaction && (
              <div>
                <p><strong>Transaction ID:</strong> {selectedTransaction._id}</p>
                <p><strong>User:</strong> {selectedTransaction.userName}</p>
                <p><strong>Contact Number:</strong> {selectedTransaction.contactNumber}</p>
                <p><strong>Course/Subject:</strong> {selectedTransaction.courseSubject}</p>
                <p><strong>Room:</strong> {selectedTransaction.roomNo}</p>
                <p><strong>Professor:</strong> {selectedTransaction.professor}</p>
                <p><strong>Status:</strong> {selectedTransaction.returnStatus}</p>
                <p><strong className='return-modal-item'>Item/s:</strong></p>
                <ul>
                  {selectedTransaction.items.map((item, index) => (
                    <li key={index}>
                      <p><strong>Item Name:</strong> {item.itemName}</p>
                      <p><strong>Quantity Borrowed:</strong> {item.quantityBorrowed}</p>
                      <p><strong>Quantity Returned:</strong> {item.quantityReturned}</p>
                    </li>
                  ))}
                </ul>

                <p><strong>Borrowed Duration:</strong> {selectedTransaction.borrowedDuration}</p>
                <p><strong>Date and Time:</strong> {new Date(selectedTransaction.dateTime).toLocaleString()}</p>

                {/* New Buttons */}
                <button onClick={() => handleAddItems(selectedTransaction)} className="add-items-button">Add Other Item(s)</button>

                <p onClick={handleCloseModal} className="return-close-button">Close</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowingCheck;
