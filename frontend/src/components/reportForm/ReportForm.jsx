import "./reportForm.scss";
import React, { useState, useRef } from 'react';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom

const ReportForm = () => {
  const [reportedByName, setReportedByName] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [itemId, setItemId] = useState(''); // Will be filled with the scanned barcode
  const inputRef = useRef(null); // Ref to focus on the input box
  const navigate = useNavigate(); // Initialize useNavigate

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
      console.log("Response from backend:", response.status);

      if (response.status === 201) {
        alert('Report submitted successfully');
        navigate('/'); // Navigate to home after alert is closed
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

  return (
    <div className="report-form-container">
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      <form onSubmit={handleSubmit} className="report-form">
        <h2>Submit a Report</h2>

        <label htmlFor="reportedByName">Your Name</label>
        <input
          type="text"
          id="reportedByName"
          value={reportedByName}
          onChange={(e) => setReportedByName(e.target.value)}
          required
          placeholder="Enter your name"
        />

        {/* Item barcode input field is always shown now */}
        <label htmlFor="itemId">Item Barcode</label>
        <input
          type="text"
          id="itemId"
          ref={inputRef} // This will allow us to focus on this input
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          required
          placeholder="BC******"
        />

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
