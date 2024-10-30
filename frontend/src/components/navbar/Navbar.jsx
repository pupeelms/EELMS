import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './navbar.scss';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';
import ProfileDropdown from '../profileDropdown/ProfileDropdown';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { imageBaseURL } from '../../config/axiosConfig';

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [admin, setAdmin] = useState(null); // Admin data from session
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [profileImageError, setProfileImageError] = useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const calendarRef = useRef(null);

  // Fetch Notifications and Admin data
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/notif/unread');
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };
    fetchUnreadNotifications(); // Fetch immediately after mounting to keep count accurate
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/api/adminProfile/profiles/me', { withCredentials: true });
        setAdmin(response.data); // Set the admin data from session
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response) {
          console.error('Response data:', error.response.data); // Log response error details
        }
      }
    };

    fetchAdminData(); // Fetch the logged-in admin profile on component mount
  }, []); 

  // Update Time Every Second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle dropdown states
  const toggleNotificationsDropdown = () => {
    setShowNotifications(prev => !prev);
    setShowProfile(false);
    setShowCalendar(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfile(prev => !prev);
    setShowNotifications(false);
    setShowCalendar(false);
  };

  const toggleCalendarDropdown = () => {
    setShowCalendar(prev => !prev);
    setShowProfile(false);
    setShowNotifications(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !profileRef.current?.contains(event.target) &&
        !notificationsRef.current?.contains(event.target) &&
        !calendarRef.current?.contains(event.target)
      ) {
        setShowProfile(false);
        setShowNotifications(false);
        setShowCalendar(false);
      }
    };
 
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate link for each notification
  const generateNotificationLink = (notification) => {
    const type = notification.type.toLowerCase();
    if (type.includes('new item')) {
      return `/items`;
    } else if (type.includes('user')) {
      return `/users`;
    } else if (type.includes('overdue') || type.includes('extended') || type.includes('returned') || type.includes('borrow')) {
      return `/EELMS`;
    } else if (type.includes('stock')) {
      return `/items/stocks`;
    } else if (type.includes('report') || type.includes('maintenance')) {
      return `/reports`;
    } else {
      return `/notifications`;
    }
  };

  // Handle profile image load error
  const handleImageError = () => {
    setProfileImageError(true);
  };

  const updateAdminProfile = (updatedProfile) => {
    setAdmin(updatedProfile);
    setProfileImageError(false); // Reset error state when profile updates
  };

  return (
    <div className="navbar">
      <div className="logo">
        <img src="/final-logohuhu.png" alt="Logo" className="logo-navbar" />
      </div>

      <div className="wrapper">
        <div className="items">
          <Tooltip title="Current Date" disableInteractive>
            <div className="nav-item" onClick={toggleCalendarDropdown}>
              <span>{currentDateTime.toLocaleDateString()}</span>
              <span>{currentDateTime.toLocaleTimeString()}</span>
              {showCalendar && (
                <div
                  className="calendar-dropdown"
                  ref={calendarRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Calendar
                    onChange={setDate}
                    value={date}
                    className="custom-calendar"
                  />
                </div>
              )}
            </div>
          </Tooltip>

          <Tooltip title="Notifications" disableInteractive>
            <div
              className="nav-item"
              ref={notificationsRef}
              onClick={toggleNotificationsDropdown}
            >
              <NotificationsActiveRoundedIcon className="icon" />
              {unreadCount > 0 && <div className="counter">{unreadCount}</div>}
              {showNotifications && (
                <div className="notif-dropdown">
                  {notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <Link
                        to={generateNotificationLink(notification)}
                        key={notification._id}
                        className="notif-item"
                        onClick={() => {
                          axios.patch(`/api/notifications/${notification._id}/read`);
                          setUnreadCount(prevCount => prevCount - 1);
                          setShowNotifications(false);
                        }}
                      >
                        <p>{notification.message}</p>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </Tooltip>

          <Tooltip title="Profile" disableInteractive>
            <div ref={profileRef} onClick={toggleProfileDropdown} className="nav-item">
              {admin && admin.profileImage && !profileImageError ? (
                <img
                  src={admin.profileImage} // Use the full Cloudinary URL directly from admin object
                  alt="Profile"
                  className="profile-icon"
                  onError={handleImageError} // Handle any loading error
                />
              ) : (
                <AccountCircleRoundedIcon className="icon" />
              )}
              {showProfile && (
                <ProfileDropdown
                  admin={admin}
                  isOpen={showProfile}
                  toggleDropdown={toggleProfileDropdown}
                  updateAdminProfile={updateAdminProfile}
                />
              )}
            </div>
          </Tooltip>

        </div>
      </div>
    </div>
  );
};

export default Navbar;
