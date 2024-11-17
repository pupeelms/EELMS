import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './itemScan.scss';
import { imageBaseURL } from '../../config/axiosConfig';

const ItemScan = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const {
    userID = '', 
    userName = '',
    transactionType = '',
    courseSubject = '',
    professor = '',
    profAttendance = '',
    roomNo = '',
    borrowedDuration = '',
    items = [], 
    transactionID = null, 
  } = location.state || {};

  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [itemDetails, setItemDetails] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantityExceededMessage, setQuantityExceededMessage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus(); 
    }
    console.log('Location States:', location.state);
    console.log('Items Arrays:', items);

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/api/users/${userID}`);
        if (response.status === 200) {
          setContactNumber(response.data.contactNumber);
        } else {
          console.error('Error fetching user details.');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userID, location.state, items]);

  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    resetItemDetails(); // Clear any prior item details and messages
  
    if (currentBarcode) {
      // Check if the item is already in the scanned items list
      const existingItem = scannedItems.find(item => item.itemBarcode === currentBarcode);
  
      try {
        const response = await axios.get(`/api/items/barcode/${currentBarcode}`);
        if (response.status === 200) {
          const itemData = response.data;

         // Check if the item quantity is available
         if (itemData.quantity === 0) {
          // If quantity is 0, show error and do not display item details
          setErrorMessage(`"${itemData.itemName}" is out of stock. Please scan another item.`);
          setTimeout(() => {
            setErrorMessage(''); // Clear error message after 3 seconds
            resetFields();
          }, 3000);
          return; // Exit and don't show item details
        }
  
          // If the item quantity is exactly 1 and not previously added, add it immediately
          if (itemData.quantity === 1 && !existingItem) {
            const newItem = {
              itemBarcode: currentBarcode,
              itemName: itemData.itemName,
              quantity: 1,
              image: itemData.image,
            };
            setScannedItems(prevItems => [...prevItems, newItem]);
            resetFields();
            return; // Exit after adding the item
          }
  
          if (existingItem) {
            // Calculate the total quantity already scanned for this item
            const totalScannedQuantity = scannedItems
              .filter(item => item.itemBarcode === currentBarcode)
              .reduce((total, item) => total + item.quantity, 0);
  
            // Calculate remaining quantity that can still be scanned
            const remainingQuantity = itemData.quantity - totalScannedQuantity;
  
            // If there's no remaining quantity, show an error message and do not display item details
            if (remainingQuantity <= 0) {
              setErrorMessage(`"${existingItem.itemName}" is fully scanned. Please scan another item.`);
              setTimeout(() => {
                setErrorMessage('');
                resetFields();
              }, 3000);
              return; // Exit after showing the error
            }
  
            // Display item details again since there is still available quantity
            setItemDetails(itemData);
            setAvailableQuantity(itemData.quantity);
          } else {
            // If the item is not scanned yet, display its details
            setItemDetails(itemData);
            setAvailableQuantity(itemData.quantity);
          }
        } else {
          setErrorMessage('Item not found. Please scan a valid barcode.');
          setTimeout(() => {
            setErrorMessage('');
            resetFields();
          }, 2000); // Reset fields after showing this error
        }
      } catch (error) {
        setErrorMessage('Error checking barcode. Please try again.');
        setTimeout(() => {
          setErrorMessage('');
          resetFields();
        }, 2000); // Reset fields after showing this error
      }
    }
     // Log the current state of scanned items at the end of the function
  console.log('Current Scanned Items:', scannedItems);
  };
  
  

  const resetItemDetails = () => {
    setErrorMessage('');
    setItemDetails(null);
    setAvailableQuantity(0);
    setQuantityExceededMessage('');
  };

  const handleAddItem = (autoQuantity = null) => {
    const itemQuantity = autoQuantity ?? Number(quantity);

    if (!currentBarcode || !itemQuantity || !itemDetails) {
      setErrorMessage('Please scan an item and enter quantity.');
      return;
    }

    if (itemQuantity > availableQuantity) {
      setQuantityExceededMessage(`Cannot add item. Total quantity exceeds available stock. Available quantity: ${availableQuantity}`);
      return;
    }

    const existingItemIndex = scannedItems.findIndex(item => item.itemBarcode === currentBarcode);
    if (existingItemIndex >= 0) {
      const totalQuantity = scannedItems[existingItemIndex].quantity + itemQuantity;
      if (totalQuantity > availableQuantity) {
        setQuantityExceededMessage(`Cannot add item. Total quantity exceeds available stock. Available quantity: ${availableQuantity}`);
        return;
      }

      const updatedItems = [...scannedItems];
      updatedItems[existingItemIndex].quantity = totalQuantity;
      setScannedItems(updatedItems);
    } else {
      const newItem = {
        itemBarcode: currentBarcode,
        itemName: itemDetails.itemName,
        quantity: itemQuantity,
        image: itemDetails.image,
      };
      setScannedItems(prevItems => [...prevItems, newItem]);
    }

    resetFields();
  };

  const resetFields = () => {
    setCurrentBarcode('');
    setQuantity('');
    setItemDetails(null);
    setAvailableQuantity(0);
    setErrorMessage('');
    setQuantityExceededMessage('');

    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };

  const handleDeleteItem = (itemBarcode) => {
    const updatedScannedItems = scannedItems.filter(item => item.itemBarcode !== itemBarcode);
    setScannedItems(updatedScannedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    console.log('Scanned items before submission:', scannedItems); // Log the scanned items array
  
    if (scannedItems.length === 0) {
      console.error('Error: No items to submit.'); // Log an error message for debugging
      setErrorMessage('No items to submit. Please add items before submitting.');
      setIsLoading(false);
      return;
    }
  
    const itemsToSubmit = scannedItems.map(item => ({
      itemBarcode: item.itemBarcode,
      itemName: item.itemName,
      quantity: item.quantity,
    }));
  
    console.log('Items to submit:', itemsToSubmit); // Log the processed items array
  
    const transactionDetails = {
      items: itemsToSubmit,
      userID,
    };
  
    console.log('Transaction details to submit:', transactionDetails); // Log the final transaction object
  
    try {
      if (transactionID) {
        // Update existing transaction
        console.log('Updating transaction with ID:', transactionID); // Log the transaction ID
        const response = await axios.put(`/api/borrow-return/${transactionID}`, transactionDetails);
  
        console.log('Server response for update:', response.data); // Log the server response
  
        if (response.status === 200) {
          console.log('Transaction updated successfully:', response.data);
          console.log('Items returned from backend:', response.data.log.items); // Debugging line
          navigate('/borrow-success', { state: { ...location.state, items: response.data.log.items } });
        } else {
          console.error('Error updating transaction:', response.status); // Log the error status
          setErrorMessage('Error updating the transaction. Please try again.');
        }
      } else {
        // Create new transaction
        const newTransactionDetails = {
          ...transactionDetails,
          userID,
          userName,
          contactNumber,
          courseSubject,
          professor,
          profAttendance,
          roomNo,
          borrowedDuration,
          transactionType,
          dateTime: new Date().toISOString(),
        };
  
        console.log('Creating new transaction:', newTransactionDetails); // Log the new transaction details
        const response = await axios.post('/api/borrow-return/log', newTransactionDetails);
  
        console.log('Server response for create:', response.data); // Log the server response
  
        if (response.status === 201) {
          console.log('Transaction created successfully:', response.data);
          console.log('Items created from backend:', response.data.items); // Debugging line
          navigate('/borrow-success', { 
            state: { 
              ...location.state, // If you want to keep previous state data
              newTransactionDetails, 
              items: response.data.borrowReturnLog.items
            } 
          });
        } else {
          console.error('Error creating transaction:', response.status); // Log the error status
          setErrorMessage('Error processing the transaction. Please try again.');
        }
      }
    } catch (error) {
      console.error('Transaction error:', error); // Log the error
      setErrorMessage('Failed to log the transaction. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  return (
    <div className="item-scan">
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      <h2>Scan Items to Borrow</h2>

      <form onSubmit={handleBarcodeScan}>
        <div className="input-group">
          <label>Barcode:</label>
          <input
            type="text"
            ref={barcodeInputRef}
            value={currentBarcode}
            onChange={(e) => setCurrentBarcode(e.target.value)}
            placeholder="Scan or enter barcode"
            required
          />
          <button className='barcode-scann' type="submit" disabled={!currentBarcode}>Scan</button>
        </div>

        {itemDetails && (
          <div className="item-details">
            <p>Item: {itemDetails.itemName}</p>
            {itemDetails.image && (
              <img
                src={itemDetails.image}
                alt={itemDetails.itemName}
                className="item-image"
                style={{ width: '30%', height: 'auto', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/path/to/placeholder.png';
                  e.target.onError = null;
                }}
              />
            )}
          </div>
        )}

        {itemDetails && availableQuantity > 1 && (
          <>
            <div className="input-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>

            <div className="actions">
              <button type="button" onClick={() => handleAddItem()} disabled={!itemDetails || !quantity}>Add Item</button>
              <button type="button" onClick={resetFields}>Cancel</button>
            </div>
          </>
        )}

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {quantityExceededMessage && <p className="error-message">{quantityExceededMessage}</p>}
      </form>

      <div className='scanned'>
        <h3>Scanned Items</h3>
        <ul className="scanned-items-list">
          {scannedItems.map((item, index) => (
            <li key={index} className="scanned-item">
              <span>{item.itemName}</span>
              <span> x {item.quantity}</span>
              <button onClick={() => handleDeleteItem(item.itemBarcode)}>Remove</button>
            </li>
          ))}
        </ul>

        {scannedItems.length > 0 && (
          <div className="submit-section">
            <button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Loading..." : "Submit Transaction"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemScan;