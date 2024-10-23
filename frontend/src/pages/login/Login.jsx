import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import './Login.scss'; // Import the SCSS file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const response = await axios.get('/api/admin/check', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Authentication check response:', response);
        if (response.status === 200) {
          console.log('User is authenticated. Redirecting...');
          navigate('/');
        } else {
          console.log('User is not authenticated. Status:', response.status);
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login attempt with email:', email);
    setLoading(true);
    try {
      const response = await axios.post('api/admin/login', 
        { email, password }, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Login response:', response);
      setMessage(response.data.message);
      console.log('Redirecting to /select-profile...');
      navigate('/select-profile');
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
      console.log('Loading state set to false.');
    }
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Toggle the visibility state
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-wrapper">
      {/* Background image */}
      <img src="/ceafinal.png" alt="Background" className="bg-only" />

      <div className="form-box login">
        <h1>EELMS</h1>
        <h3>Electrical Engineering Laboratory Management System</h3>

        <form onSubmit={handleLogin}>
          <div className="input-box">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input
              type={passwordVisible ? 'text' : 'password'} // Toggle input type
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordVisible ? (
              <FaEyeSlash className="toggle-icon" onClick={togglePasswordVisibility} /> // Toggle eye/eye-slash icon
            ) : (
              <FaEye className="toggle-icon" onClick={togglePasswordVisibility} />
            )}
          </div>
          <button type="submit">Login</button>
          {message && <p>{message}</p>}

          <div className="loginback-link-container">
            <a className="loginback-link" onClick={handleBackClick}>Back</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
