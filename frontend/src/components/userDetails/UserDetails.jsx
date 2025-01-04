import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './userDetails.scss';
import axios from 'axios';

const UserDetails = ({ onUserDetailsSubmit, userID, userName, transactionType }) => {
  const navigate = useNavigate();

  const [courseSubject, setCourseSubject] = useState('');
  const [professor, setProfessor] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [profAttendance, setProfAttendance] = useState('yes'); // default to 'yes'
  const [borrowedDurationNumber, setBorrowedDurationNumber] = useState(1); // default to 1
  const [borrowedDurationUnit, setBorrowedDurationUnit] = useState('minutes'); // default to 'minutes'
  const [errorMessage, setErrorMessage] = useState(''); // Error message state
  const [courseSubjectSuggestions, setCourseSubjectSuggestions] = useState([]);
  const [professorSuggestions, setProfessorSuggestions] = useState([]);
  const [roomNoSuggestions, setRoomNoSuggestions] = useState([]);
  const [borrowedDurationHours, setBorrowedDurationHours] = useState(0);
  const [borrowedDurationMinutes, setBorrowedDurationMinutes] = useState(0);

  // Function to fetch suggestions based on the field and query
  const fetchSuggestions = async (field, query) => {
    if (query.length < 2) return; // Prevent searching with less than 2 characters
  
    try {
      const response = await axios.get(`/api/borrow-return/suggestions`, {
        params: { field, query },
      });
  
      const data = response.data;
  
      if (Array.isArray(data)) {
        switch (field) {
          case 'courseSubject':
            setCourseSubjectSuggestions(data);
            break;
          case 'professor':
            setProfessorSuggestions(data);
            break;
          case 'roomNo':
            setRoomNoSuggestions(data);
            break;
          default:
            break;
        }
      } else {
        console.error('Invalid data format received:', data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };
  
  const handleCourseSubjectChange = (e) => {
    const value = e.target.value;
    setCourseSubject(value);
    if (value) fetchSuggestions('courseSubject', value);
  };

  const handleProfessorChange = (e) => {
    const value = e.target.value;
    setProfessor(value);
    if (value) fetchSuggestions('professor', value);
  };

  const handleRoomNoChange = (e) => {
    const value = e.target.value;
    setRoomNo(value);
    if (value) fetchSuggestions('roomNo', value);
  };

  useEffect(() => {
    return () => {
      setCourseSubjectSuggestions([]);
      setProfessorSuggestions([]);
      setRoomNoSuggestions([]);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure both hours and minutes are valid numbers
    if (borrowedDurationHours < 0 || borrowedDurationMinutes < 0 || borrowedDurationMinutes > 59) {
      setErrorMessage('Please enter valid hours (0 or more) and minutes (0-59).');
      return;
    }
  
    // Optional: Ensure duration is not zero
    if (borrowedDurationHours === 0 && borrowedDurationMinutes === 0) {
      setErrorMessage('Please enter a valid duration (at least 1 minute).');
      return;
    }
  
    if (!courseSubject || !professor || !roomNo) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
  
    // Calculate total duration in milliseconds
    const totalMilliseconds =
      borrowedDurationHours * 60 * 60 * 1000 + // Convert hours to milliseconds
      borrowedDurationMinutes * 60 * 1000; // Convert minutes to milliseconds
  
    // Format the borrowed duration string based on hours and minutes
  let borrowedDuration;
  if (borrowedDurationHours === 0) {
    // Display only minutes if hours is 0
    borrowedDuration = `${borrowedDurationMinutes} minute${borrowedDurationMinutes !== 1 ? 's' : ''}`;
  } else if (borrowedDurationMinutes === 0) {
    // Display only hours if minutes is 0
    borrowedDuration = `${borrowedDurationHours} hour${borrowedDurationHours !== 1 ? 's' : ''}`;
  } else {
    // Display both hours and minutes
    borrowedDuration = `${borrowedDurationHours} hour${borrowedDurationHours !== 1 ? 's' : ''} and ${borrowedDurationMinutes} minute${borrowedDurationMinutes !== 1 ? 's' : ''}`;
  }
  
    const userDetails = {
      userID,
      userName,
      transactionType,
      courseSubject,
      professor,
      profAttendance,
      roomNo,
      borrowedDuration, // formatted string for display
      borrowedDurationMillis: totalMilliseconds, // total duration in milliseconds
    };
  
    // Log userDetails to see if values are saved correctly
    console.log('User  Details Submitted:', userDetails);
  
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
            onChange={handleCourseSubjectChange}
            required
            list="courseSubject-suggestions"
          />
          <datalist id="courseSubject-suggestions">
            {courseSubjectSuggestions.map((suggestion) => (
              <option key={suggestion.value} value={suggestion.value} />
            ))}
          </datalist>
        </div>

        <div className="userDetailsItem">
          <label>Professor:</label>
          <input
            type="text"
            value={professor}
            onChange={handleProfessorChange}
            required
            list="professor-suggestions"
          />
          <datalist id="professor-suggestions">
            {professorSuggestions.map((suggestion) => (
              <option key={suggestion.value} value={suggestion.value} />
            ))}
          </datalist>
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
            onChange={handleRoomNoChange}
            required
            list="roomNo-suggestions"
          />
          <datalist id="roomNo-suggestions">
            {roomNoSuggestions.map((suggestion) => (
              <option key={suggestion.value} value={suggestion.value} />
            ))}
          </datalist>
        </div>

        <div className="userDetailsItem">
  <label>Borrow Duration:</label>
  <div className="borrowedDuration">
    <div className="durationInput">
      <select
        id="hours"
        value={borrowedDurationHours}
        onChange={(e) => setBorrowedDurationHours(Number(e.target.value))}
        required
      >
        {Array.from({ length: 25 }, (_, i) => (
          <option key={i} value={i}>
            {i} 
          </option>
        ))}
      </select>
      <label htmlFor="hours">hour/s</label>
    </div>
    <div className="durationInput">
      <select
        id="minutes"
        value={borrowedDurationMinutes}
        onChange={(e) => setBorrowedDurationMinutes(Number(e.target.value))}
        required
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {i} 
          </option>
        ))}
      </select>
      <label htmlFor="minutes">minute/s</label>
    </div>
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
