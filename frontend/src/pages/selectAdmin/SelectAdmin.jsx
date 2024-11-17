import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AccountCircle } from '@mui/icons-material'; // MUI icon for profile placeholder
import './SelectAdmin.scss'; // Import the SCSS file
import { imageBaseURL } from '../../config/axiosConfig';

const SelectAdmin = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null); // State to track the selected profile
  const [showModal, setShowModal] = useState(false); // State for controlling modal visibility
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [passwordVisible, setPasswordVisible] = useState(false); // State to control password visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get('/api/adminProfile/profiles');
        const profilesWithImage = response.data.map((admin) => ({
          ...admin,
          profileImage: admin?.profileImage
        }));
        setProfiles(profilesWithImage);
      } catch (err) {
        setError('Error fetching admin profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile); // Set the selected profile
    setShowModal(true); // Show the login modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
  };

  const handleLogin = async () => {
    console.log('Selected Profile:', selectedProfile);  // Check selected profile details
    console.log('Entered Email:', email);
    console.log('Entered Password:', password);

    if (
      email === selectedProfile.contactInfo.email && 
      password === selectedProfile.contactInfo.password
    ) {
      try {
        // Send the selected profile to the backend to store in the session
        const response = await axios.post('/api/adminProfile/select-profile', { profileId: selectedProfile._id });
        if (response.status === 200) {
          console.log('Profile selected successfully:', response.data.profile);
          // Navigate to the dashboard or homepage
          navigate('/EELMS');
        } else {
          alert("Failed to select profile");
        }
      } catch (error) {
        console.error('Error selecting profile:', error);
        alert("Error selecting profile");
      }
    } else {
      alert("Incorrect email or password.");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Toggle password visibility
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="select-admin-container">
      <h1>Select Admin Profile</h1>
      <div className="profile-cards">
        {profiles.map((profile) => (
          <div
            className="profile-card"
            key={profile._id}
            onClick={() => handleSelectProfile(profile)}
          >
            <div className="profile-picture">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={`${profile.name}'s profile`}
                  className="profile-image"
                />
              ) : (
                <AccountCircle style={{ fontSize: 120 }} className="profile-placeholder-icon" /> // Use an icon as fallback
              )}
            </div>
            <strong className="profile-name">{profile.name}</strong>
            <p className="profile-role">{profile.role}</p>
          </div>
        ))}
      </div> 

      {showModal && selectedProfile && (
        <div className="modal-admin">
          <div className="modal-content-admin">
            <span className="close-button" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="profile-modal">
              <div className="profile-modal-picture">
                {selectedProfile.profileImage ? (
                  <img
                    src={selectedProfile.profileImage}
                    alt={`${selectedProfile.name}'s profile`}
                    className="profile-modal-image"
                  />
                ) : (
                  <AccountCircle style={{ fontSize: 200 }} className="profile-modal-placeholder" /> // Icon as fallback in modal
                )}
              </div>
              {/* Profile name and role display */}
              <h2 className="profile-name-display">{selectedProfile.name}</h2>
              <h3 className="profile-role-display">{selectedProfile.role}</h3>
              <div className="login-form">
                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="input-password-wrapper">
                  <input
                    type={passwordVisible ? 'text' : 'password'} // Toggle input type
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordVisible ? (
                    <FaEyeSlash className="toggle-password-icon" onClick={togglePasswordVisibility} />
                  ) : (
                    <FaEye className="toggle-password-icon" onClick={togglePasswordVisibility} />
                  )}
                </div>
                <button className="login-button" onClick={handleLogin}>
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectAdmin;
