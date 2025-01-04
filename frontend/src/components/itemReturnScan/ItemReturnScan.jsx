import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ItemReturnScan.scss'; // Import the SCSS file

const ItemReturnScan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null); // Create a ref for the input element

  const { selectedTransaction, userID, userName } = location.state || {};

  if (!selectedTransaction) {
    return (
      <div className="item-return-scan">
        <h2>Error</h2>
        <p>No transaction selected. Please go back and select a valid transaction.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const [scannedItems, setScannedItems] = useState([...selectedTransaction.items.map(item => ({
    ...item,
    condition: '', // Add condition field
    customCondition: '', // Add custom condition field for 'Others'
  }))]);
  const [barcode, setBarcode] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState(1); // State for bulk quantity input
  const [isBulkInput, setIsBulkInput] = useState(false); // Flag to show bulk input UI
  const [selectedItemIndex, setSelectedItemIndex] = useState(null); // Track the selected item for bulk input
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isReturnComplete, setIsReturnComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  useEffect(() => {
    inputRef.current.focus(); // Focus the input element on component mount
  }, []);

  const fetchItemName = async (barcode) => {
    try {
      const response = await axios.get(`/api/items/barcode/${barcode}`);
      return response.data.itemName;
    } catch (err) {
      console.error('Error fetching item name:', err);
      return null;
    }
  };

  const handleScan = async () => {
    if (!barcode) {
      setError('Please enter a valid barcode.');
      return;
    }

    const logItemIndex = scannedItems.findIndex(item => item.itemBarcode === barcode);

    if (logItemIndex === -1) {
      setError('Item not found in this transaction.');
      return;
    }

    const logItem = scannedItems[logItemIndex];

    if (logItem.quantityReturned >= logItem.quantityBorrowed) {
      setError('You have already returned all of this item.');
      setBarcode('');
      return;
    }

    try {
      const itemName = await fetchItemName(barcode);

      if (!itemName) {
        setError('Error retrieving item name.');
        return;
      }

      if (logItem.quantityBorrowed > 1) {
        // Trigger bulk input if quantityBorrowed is greater than 1
        setIsBulkInput(true);
        setSelectedItemIndex(logItemIndex);
      } else {
        // Increment quantityReturned for single quantity
        const updatedItems = [...scannedItems];
        updatedItems[logItemIndex].quantityReturned++;
        setScannedItems(updatedItems);
        setSuccess(`Successfully logged "${scannedItems[logItemIndex]?.itemName}"!`);
      }

      setError('');
    } catch (err) {
      setError('Error processing the return.');
      console.error(err);
    }

    setBarcode('');
    inputRef.current.focus(); // Refocus the input after scanning
  };

  const handleBulkInput = () => {
    if (bulkQuantity < 1 || bulkQuantity > (scannedItems[selectedItemIndex].quantityBorrowed - scannedItems[selectedItemIndex].quantityReturned)) {
      setError('Invalid quantity. Please enter a valid no. of quantity to be returned.');
      return;
    }

    const updatedItems = [...scannedItems];
    updatedItems[selectedItemIndex].quantityReturned += bulkQuantity;
    setScannedItems(updatedItems);
    setIsBulkInput(false);
    setBulkQuantity(1);
    setSelectedItemIndex(null);
    setSuccess(`Successfully logged "${scannedItems[selectedItemIndex]?.itemName}"!`);
    setError('');
  };

  const handleCompleteReturn = async () => {
    setIsLoading(true); // Set loading state to true
    try {
      const itemsReturned = scannedItems
        .filter(item => item.quantityReturned > 0 && item.quantityReturned <= item.quantityBorrowed)
        .map(item => ({
          itemBarcode: item.itemBarcode,
          itemName: item.itemName,
          quantity: item.quantityReturned,
          condition: item.condition === 'Others' ? item.customCondition : item.condition, // Include custom condition for 'Others'
        }));

      if (itemsReturned.length === 0) {
        setError('No items to return.');
        setIsLoading(false); // Set loading state to false
        return;
      }

      const response = await axios.post('/api/borrow-return/complete-return', {
        pastTransactionID: selectedTransaction._id,
        userID,
        itemsReturned,
      });

      if (response.data.success) {
        setSuccess('Return process completed successfully!');
        setError('');
        setIsReturnComplete(true);

        const returnStatus = response.data.returnStatus;

        setTimeout(() => {
          if (returnStatus === 'Completed') {
            navigate('/return-success', { state: { userID, userName, items: itemsReturned, pastTransactionID: selectedTransaction._id } });
          } else if (returnStatus === 'Partially Returned') {
            navigate('/return-partial', { state: { userID, userName, items: itemsReturned, pastTransactionID: selectedTransaction._id} });
          }
        }, 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Error completing the return process.');
      console.error(err);
    }
    setIsLoading(false); // Set loading state to false
  };

  return (
    <div className="item-return-scan">
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      <h2>Item Return Scan</h2>
      <p><strong>Transaction ID:</strong> {selectedTransaction._id}</p>
      <p><strong>User:</strong> {selectedTransaction.userName}</p>

      <p><strong>Items:</strong></p>
      <ul>
        {scannedItems.map((item, index) => (
          <li key={index}>
            <p><strong>Item Name:</strong> {item.itemName}</p>
            <p><strong>Item Barcode:</strong> {item.itemBarcode}</p>
            <p><strong>Quantity Borrowed:</strong> {item.quantityBorrowed}</p>
            <p><strong>Quantity Returned:</strong> {item.quantityReturned}/{item.quantityBorrowed}</p>
          
            <div>
      <label>Condition: </label>
      <select
      className='conditionReturnconditionReturn'
        value={item.condition}
        onChange={(e) => {
          const updatedItems = [...scannedItems];
          updatedItems[index].condition = e.target.value;
          setScannedItems(updatedItems);
        }}
      >
        <option value="">Select Condition</option>
        <option value="Good">Good</option>
        <option value="Damaged">Damaged</option>
        <option value="Others">Others</option>
      </select>
      {item.condition === 'Others' && (
        <input
        style={{
          marginTop: 5,
          width: '100%',
        }}
          type="text"
          placeholder="Specify the condition"
          value={item.customCondition}
          onChange={(e) => {
            const updatedItems = [...scannedItems];
            updatedItems[index].customCondition = e.target.value;
            setScannedItems(updatedItems);
          }}
        />
      )}
    </div>

          </li>
        ))}
      </ul>

      {isBulkInput && (
  <div className="bulk-input-container">
    <h4>Enter Quantity to Return: {scannedItems[selectedItemIndex]?.itemName}</h4>
    <div className="quantity-input">
      <button
        className="decrement-btn"
        onClick={() => {
          setBulkQuantity(prev => Math.max(1, prev - 1)); // Ensure quantity doesn't go below 1
        }}
      >
        -
      </button>
      <input
        className="input-quantity"
        type="number"
        value={bulkQuantity}
        onChange={(e) => setBulkQuantity(Number(e.target.value))}
        min="1"
        max={scannedItems[selectedItemIndex]?.quantityBorrowed - scannedItems[selectedItemIndex]?.quantityReturned}
      />
      <button
        className="increment-btn"
        onClick={() => {
          setBulkQuantity(prev => Math.min(
            prev + 1,
            scannedItems[selectedItemIndex]?.quantityBorrowed - scannedItems[selectedItemIndex]?.quantityReturned
          )); // Ensure quantity doesn't exceed max limit
        }}
      >
        +
      </button>
    </div>
    <button className="input-quantity-button" onClick={handleBulkInput}>Submit Quantity</button>
  </div>
)}


      {!isReturnComplete && (
        <div>
          <input
            type="text"
            placeholder="Scan Item Barcode"
            value={barcode}
            ref={inputRef} // Attach the ref to the input
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleScan();
              }
            }}
          />
          <button onClick={handleScan}>Scan</button>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {scannedItems.some(item => item.quantityReturned > 0 && item.condition) && !isReturnComplete && !isLoading && (
        <button className="complete-return-btn" onClick={handleCompleteReturn}>
          Submit Return
        </button>
      )}

      {isLoading && <p>Loading...</p>}

      {isReturnComplete && <p>Return process completed. Redirecting...</p>}

          <p type="button" className="returnScanBackButton" onClick={() => navigate(-1)}>
          Back
          </p>

    </div>
  );
};

export default ItemReturnScan;