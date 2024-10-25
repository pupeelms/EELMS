import "./reportForm.scss";
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/library'; // ZXing barcode scanner library
import axios from 'axios'; // Import axios

const ReportForm = () => {
  const [reportedByName, setReportedByName] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [itemId, setItemId] = useState(''); // Will be filled with the scanned barcode
  const [scanning, setScanning] = useState(false); // Toggles scanner visibility
  const [scanResult, setScanResult] = useState(''); // Stores scan result or error
  const [frameStatus, setFrameStatus] = useState('not-detected'); // Scanner frame color state
  const webcamRef = useRef(null); // Ref to access the webcam
  const codeReader = new BrowserMultiFormatReader();

  useEffect(() => {
    let interval;
    if (scanning) {
      interval = setInterval(() => {
        handleScan();
      }, 500); // Try scanning every 500ms
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [scanning]);

  // Function to capture an image from the webcam and scan the barcode
  const handleScan = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot(); // Capture the image from the webcam
      if (imageSrc) {
        try {
          const result = await codeReader.decodeFromImage(undefined, imageSrc); // Pass the screenshot directly
          if (result) {
            setItemId(result.text); // Set the scanned barcode text as itemId
            setScanResult(`Scanned item ID: ${result.text}`);
            setFrameStatus('detected'); // Change frame to green
            setScanning(false); // Close the scanner after a successful scan
          } else {
            setFrameStatus('not-detected'); // Change frame to red
          }
        } catch (err) {
          setFrameStatus('not-detected'); // Change frame to red if not detected
          setScanResult('No barcode detected. Please ensure the barcode is clearly visible.');
        }
      }
    }
  };

  // Submit function with logging
  const handleSubmit = async (e) => {
    e.preventDefault();

    const reportData = { itemId, issue, reportedByName, priority };

    // Log the data being sent to the backend
    console.log("Submitting Report Data:", reportData);

    try {
      const response = await axios.post('/api/reports/make-reports', reportData, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Log the response from the server
      console.log("Response from backend:", response);

      if (response.status === 201) {
        alert('Report submitted successfully');
      } else {
        alert('Failed to submit the report');
      }
    } catch (error) {
      // Log the error from Axios
      console.error("Error submitting report:", error.response || error);

      // Log the specific response details for the 400 error
      if (error.response && error.response.data) {
        console.log("Error response data:", error.response.data);
      }

      alert('An error occurred while submitting the report');
    }
  };

  const handleOpenScanner = () => {
    setScanning(true);
    setScanResult(''); // Clear previous scan result
    setFrameStatus('not-detected'); // Reset frame status
  };

  return (
    <div className="report-form-container">
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      <form onSubmit={handleSubmit} className="report-form">
        <h2>Submit a Report</h2>
        <div className="instructions">
        <h3>Guidelines:</h3>
      <ul>
        <li>Ensure you are a registered user of EELMS before submitting a report.</li>
        <li>The barcode you scan must be a valid EE laboratory barcode.</li>
        <li>Submit reports only when necessary to avoid penalties.</li>
        <li>Once submitted, your report will be reviewed by the laboratory admin.</li>
      </ul>
    </div>

        <label htmlFor="reportedByName">Your Name</label>
        <input
          type="text"
          id="reportedByName"
          value={reportedByName}
          onChange={(e) => setReportedByName(e.target.value)}
          required
          placeholder="Enter your name"
        />

        <label htmlFor="itemId">Item ID</label>
        <input
          type="text"
          id="itemId"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          required
          placeholder="Scan or enter the Item ID"
        />

        {/* Button to open the scanner */}
        <button type="button" className="scan-button" onClick={handleOpenScanner}>
          Scan Barcode
        </button>

        {/* Display the webcam when scanning is true */}
        {scanning && (
          <div className="scanner-container">
            <div className="webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'environment' }} // Use back camera if available
              />
              {/* Scanner Frame */}
              <div className={`scanner-frame ${frameStatus}`}></div>
            </div>

            <button type="button" className="capture-btn" onClick={handleScan}>
              Capture & Scan
            </button>
          </div>
        )}

        {/* Display scan result or error message */}
        {scanResult && <p>{scanResult}</p>}

        <label htmlFor="issue">Issue Description</label>
        <textarea
          id="issue"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          required
          placeholder="Describe the issue with the item"
        />

        <label htmlFor="priority">Priority Level</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportForm;
