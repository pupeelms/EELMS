import React from 'react';
import { useLocation } from 'react-router-dom';
import UserDetails from '../../../components/userDetails/UserDetails';
import ItemScan from '../../../components/itemScan/ItemScan';

const BorrowingProcess = () => {
  const location = useLocation();
  const { userID, userName, transactionType } = location.state || {}; // Retrieve userID, userName, and transactionType from navigation state

  // Log to verify values
  console.log('Navigation State:', { userID, userName, transactionType });

  // Manage states for course details and scanned items
  const [courseDetails, setCourseDetails] = React.useState(null);
  const [scannedItems, setScannedItems] = React.useState([]);

  const handleCourseDetailsSubmit = (details) => {
    setCourseDetails(details);
  };

  const handleItemScan = (item) => {
    setScannedItems([...scannedItems, item]);
  };

  return (
    <div>
      {!courseDetails ? (
        <UserDetails 
          onUserDetailsSubmit={handleCourseDetailsSubmit}
          userID={userID} // Pass userID correctly
          userName={userName} // Pass userName correctly
          transactionType={transactionType} // Pass transactionType correctly
        />
      ) : (
        <ItemScan 
          courseDetails={courseDetails} 
          userID={userID} // Pass userID to ItemScan
          userName={userName} // Pass userName to ItemScan
          transactionType={transactionType} // Pass transactionType to ItemScan
          onScan={handleItemScan} 
        />
      )}
    </div>
  );
};

export default BorrowingProcess;
