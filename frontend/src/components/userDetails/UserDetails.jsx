import React, { useState, useEffect } from 'react'; 
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
  const [courseSubjectSuggestions, setCourseSubjectSuggestions] = useState([]);
  const [professorSuggestions, setProfessorSuggestions] = useState([]);
  const [roomNoSuggestions, setRoomNoSuggestions] = useState([]);

  // Function to fetch suggestions based on the field and query
  const fetchSuggestions = async (field, query) => {
    if (query.length < 2) return; // Prevent searching with less than 2 characters
  
    try {
      const encodedQuery = encodeURIComponent(query); // URL encode the query string
      const response = await fetch(`/api/borrow-return/suggestions?field=${field}&query=${encodedQuery}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
  
      const data = await response.json();
  
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

    // Ensure borrowedDurationNumber is a valid number
    if (!borrowedDurationNumber || borrowedDurationNumber <= 0) {
      setErrorMessage('Please select a valid duration number.');
      return;
    }

    if (!courseSubject || !professor || !roomNo) {
      setErrorMessage('Please fill in all required fields.');
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
