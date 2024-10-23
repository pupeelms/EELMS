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
  } = location.state || {};

  const [scannedItems, setScannedItems] = useState([]);
  const [currentBarcode, setCurrentBarcode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [itemDetails, setItemDetails] = useState(null);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantityExceededMessage, setQuantityExceededMessage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus(); 
    }

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
  }, [userID]);

  const handleBarcodeScan = async (e) => {
    e.preventDefault();
    resetItemDetails();

    if (currentBarcode) {
      try {
        const response = await axios.get(`/api/items/barcode/${currentBarcode}`);
        if (response.status === 200) {
          setItemDetails(response.data);
          setAvailableQuantity(response.data.quantity);
        } else {
          setErrorMessage('Item not found. Please scan a valid barcode.');
        }
      } catch (error) {
        setErrorMessage('Error checking barcode. Please try again.');
      }
    }
  };

  const resetItemDetails = () => {
    setErrorMessage('');
    setItemDetails(null);
    setAvailableQuantity(0);
    setQuantityExceededMessage('');
  };

  const handleAddItem = () => {
    if (!currentBarcode || !quantity || !itemDetails) {
      setErrorMessage('Please scan an item and enter quantity.');
      return;
    }

    const requestedQuantity = Number(quantity);
    if (requestedQuantity > availableQuantity) {
      setQuantityExceededMessage(`Cannot add item. Total quantity exceeds available stock. Available quantity: ${availableQuantity}`);
      return;
    }

    const existingItemIndex = scannedItems.findIndex(item => item.itemBarcode === currentBarcode);
    if (existingItemIndex >= 0) {
      const totalQuantity = scannedItems[existingItemIndex].quantity + requestedQuantity;
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
        quantity: requestedQuantity,
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
    setIsLoading(true); // Set loading to true when submitting

    if (scannedItems.length === 0) {
        setErrorMessage('No items to submit. Please add items before submitting.');
        setIsLoading(false); // Set loading to false if no items
        return;
    }

    const itemsToSubmit = scannedItems.map(item => ({
        itemBarcode: item.itemBarcode,
        itemName: item.itemName,
        quantity: item.quantity,
    }));

    const transactionDetails = {
        userID,
        userName,
        contactNumber,
        items: itemsToSubmit,
        courseSubject,
        professor,
        profAttendance,
        roomNo,
        borrowedDuration,
        transactionType,
        dateTime: new Date().toISOString(),
    };

    try {
        const response = await axios.post('/api/borrow-return/log', transactionDetails);
        if (response.status === 201) {
            navigate('/borrow-success', { state: transactionDetails });
        } else {
            setErrorMessage('Error processing the transaction. Please try again.');
        }
    } catch (error) {
        setErrorMessage('Failed to log the transaction. Please check the console for details.');
        console.error('Failed to log the transaction:', error);
    }
    setIsLoading(false); // Set loading to false after submission
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
                src={itemDetails.image}  // Use the full image URL directly from Cloudinary
                alt={itemDetails.itemName}
                className="item-image"
                style={{ width: '30%', height: 'auto', objectFit: 'cover' }} // Cover style
                onError={(e) => {
                  e.target.src = '/path/to/placeholder.png';  // Set fallback image if the requested image fails to load
                  e.target.onError = null;  // Prevent infinite loop if the placeholder also fails
                }}
              />
            )}
          </div>
        )}


        {itemDetails && (
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
              <button type="button" onClick={handleAddItem} disabled={!itemDetails || !quantity}>Add Item</button>
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
              <span>x {item.quantity}</span>
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
