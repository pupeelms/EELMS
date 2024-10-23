import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './userDetails.scss';

const UserDetails = ({ onUserDetailsSubmit, userID, userName, transactionType }) => {
  const navigate = useNavigate();

  const [courseSubject, setCourseSubject] = useState('');
  const [professor, setProfessor] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [profAttendance, setProfAttendance] = useState('yes'); // default to 'yes'
  const [borrowedDurationNumber, setBorrowedDurationNumber] = useState(1); // default to 1
  const [borrowedDurationUnit, setBorrowedDurationUnit] = useState('minutes'); // default to 'minutes'
  const [errorMessage, setErrorMessage] = useState(''); // Error message state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure borrowedDurationNumber is a valid number
    if (!borrowedDurationNumber || borrowedDurationNumber <= 0) {
      setErrorMessage('Please select a valid duration number.');
      return;
    }

    const borrowedDuration = `${borrowedDurationNumber} ${borrowedDurationUnit}`;

    const userDetails = {
      userID,
      userName,
      transactionType,
      courseSubject,
      professor,
      profAttendance,
      roomNo,
      borrowedDuration, // combine the two dropdown values
    };

    // Log userDetails to see if values are saved correctly
    console.log('User Details Submitted:', userDetails);

    // Pass user details to the parent component 
    onUserDetailsSubmit(userDetails);

    navigate('/item-scan', { state: userDetails });
  };

  return (
    <div className="userDetails">
      {/* Background image */}
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      
      <div className="userDetailsTitle">BORROWER'S DETAILS</div>

      <form className="userDetailsForm" onSubmit={handleSubmit}>
        <div className="userDetailsItem">
          <label>Course Subject:</label>
          <input
            type="text"
            value={courseSubject}
            onChange={(e) => setCourseSubject(e.target.value)}
            required
          />
        </div>
        
        <div className="userDetailsItem">
          <label>Professor:</label>
          <input
            type="text"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            required
          />
        </div>

        <div className="userDetailsItem">
          <label>Is the Professor Present?</label>
          <select
            value={profAttendance}
            onChange={(e) => setProfAttendance(e.target.value)}
            required
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div className="userDetailsItem">
          <label>Room No:</label>
          <input
            type="text"
            value={roomNo}
            onChange={(e) => setRoomNo(e.target.value)}
            required
          />
        </div>

        <div className="userDetailsItem">
          <label>Borrow Duration:</label>
          <div className="borrowedDuration">
            <select
              value={borrowedDurationNumber}
              onChange={(e) => setBorrowedDurationNumber(Number(e.target.value))} // Ensure it's a number
              required
            >
              {/* Number options */}
              {Array.from({ length: 60 }, (_, i) => i + 1).map((number) => (
                <option key={number} value={number}>{number}</option>
              ))}
            </select>

            <select
              value={borrowedDurationUnit}
              onChange={(e) => setBorrowedDurationUnit(e.target.value)}
              required
            >
              <option value="minute/s">minute/s</option>
              <option value="hour/s">hour/s</option>
              <option value="day/s">day/s</option>
            </select>
          </div>
        </div>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <button type="submit" className="userDetailSubmitButton">Continue</button>

        <button type="button" className="userDetailsBackButton" onClick={() => navigate(-1)}>
          Back
        </button>
      </form>
    </div>
  );
};

export default UserDetails;
