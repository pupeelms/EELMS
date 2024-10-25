import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FeedbackForm.scss';
import Modal from '../modal/Modal';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    attachment: null
  });
  
  const [loading, setLoading] = useState(false); // State for loading
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    console.log('Submitting form data:', formData); // Log the form data before sending

    try {
      const response = await axios.post('/api/feedback/feedback', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Response from server:', response); // Log server response

      // Show modal for successful submission
      setShowModal(true);

      // Clear form data after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        attachment: null
      });

      // Clear file input field
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting feedback:', error.message); // Log error
      alert('Error submitting feedback.');
    } finally {
      setLoading(false); // Stop loading after action is complete
    }
  };

  return (
    <div className="feedbackForm">
      <div className="feedbackTitle">Feedback/Support Form</div>
      <form className="feedback-form" onSubmit={handleSubmit}>
        <label>
          <span className="form-label">Name:</span>
          <input
            className="form-input"
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Admin Name"
          />
        </label>
        <label>
          <span className="form-label">Email:</span>
          <input
            className="form-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Admin Email"
          />
        </label>
        <label>
          <span className="form-label">Subject:</span>
          <input
            className="form-input"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span className="form-label">Message/Description:</span>
          <textarea
            className="form-textarea"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <label>
          <span className="form-label">Attachment:</span>
          <input
            className="form-file"
            type="file"
            name="attachment"
            onChange={handleChange}
            ref={fileInputRef} // Attach ref to file input
          />
        </label>
        <button className="form-button" type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit'} {/* Change button text based on loading */}
        </button>
      </form>

      {showModal && (
        <Modal message="Feedback submitted successfully!" onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default FeedbackForm;
