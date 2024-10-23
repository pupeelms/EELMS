//----------------------------
import React, { useState, useEffect } from "react";
import "./sidebar.scss";
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import HomeRepairServiceRoundedIcon from '@mui/icons-material/HomeRepairServiceRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import MenuIcon from '@mui/icons-material/Menu'; // For the toggle icon
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(
    localStorage.getItem("sidebarState") === "closed" ? false : true
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [openDialog, setOpenDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [awaitingApprovalCount, setAwaitingApprovalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0); // For reports

  const toggleSidebar = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    localStorage.setItem("sidebarState", newIsOpen ? "open" : "closed");
  };

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarState");
    if (savedState === "closed") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications/notif/unread');
        setUnreadCount(response.data.length);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadNotifications();
  }, []);

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const response = await axios.get('/api/reports/all-report');
        const reports = response.data;
        const pendingReports = reports.filter(report => report.status === 'pending');
        setPendingCount(pendingReports.length);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    fetchPendingReports();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/logout', {}, { withCredentials: true });
      // Clear any local state or storage if needed
      navigate('/lab/admin'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

   useEffect(() => {
    const fetchAwaitingApprovalCount = async () => {
      try {
        const response = await axios.get('/api/users/pending/awaiting-approval-count');
        setAwaitingApprovalCount(response.data.awaitingApprovalCount);
      } catch (error) {
        console.error('Error fetching awaiting approval count:', error);
      }
    };

    fetchAwaitingApprovalCount();
  }, []);



  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setOpenDialog(false);
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="top">
        <span className="logo" style={{ display: isOpen ? "block" : "none" }}>ADMIN</span>
        <div className="toggle-btn">
          <MenuIcon onClick={toggleSidebar} />
        </div>
      </div>
      <hr />

      <div className="center">
        <ul>
        <li>
          <Link to="/EELMS" className={`menu-link ${location.pathname === "/EELMS" ? "active" : ""}`}>
            <DashboardCustomizeRoundedIcon className="icon" />
            <span className="sidebar-name">Dashboard</span>
          </Link>
        </li>

          <li>
            <Link to="/users" className={`menu-link ${location.pathname === "/users" ? "active" : ""}`}>
              <PersonRoundedIcon className="icon" />
              <span className="sidebar-name">Users</span>
              {awaitingApprovalCount > 0 && (
                <span className="counter">{awaitingApprovalCount}</span>
              )}
            </Link>
          </li>
          <li>
            <Link to="/items" className={`menu-link ${location.pathname === "/items" ? "active" : ""}`}>
              <HomeRepairServiceRoundedIcon className="icon" />
              <span className="sidebar-name">Items</span>
            </Link>
          </li>
          <li>
            <Link to="/categories" className={`menu-link ${location.pathname === "/categories" ? "active" : ""}`}>
              <CategoryRoundedIcon className="icon" />
              <span className="sidebar-name">Categories</span>
            </Link>
          </li>
          <li>
            <Link to="/notifications" className={`menu-link ${location.pathname === "/notifications" ? "active" : ""}`}>
              <NotificationsActiveRoundedIcon className="icon" />
              <span className="sidebar-name">Notifications</span>
              {unreadCount > 0 && (
                <span className="counter">{unreadCount}</span>
              )}
            </Link>
          </li>
          <li>
        <Link to="/reports" className={`menu-link ${location.pathname === "/reports" ? "active" : ""}`}>
          <LeaderboardRoundedIcon className="icon" />
          <span className="sidebar-name">Reports</span>
          {pendingCount > 0 && (
            <span className="counter">{pendingCount}</span>
          )}
        </Link>
      </li>

          <li>
            <Link to="/archives" className={`menu-link ${location.pathname === "/archives" ? "active" : ""}`}>
              <ArchiveRoundedIcon className="icon" />
              <span className="sidebar-name">Archives</span>
            </Link>
          </li>
          <li>
            <Link to="/feedback" className={`menu-link ${location.pathname === "/feedback" ? "active" : ""}`}>
              <RateReviewRoundedIcon className="icon" />
              <span className="sidebar-name">Feedback/Support</span>
            </Link>
          </li>
          <li>
            <Link to="/about" className={`menu-link ${location.pathname === "/about" ? "active" : ""}`}>
              <InfoRoundedIcon className="icon" />
              <span className="sidebar-name">About</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="bottom">
        <ul>
          <li>
            <span onClick={handleDialogOpen} className="menu-link">
              <ExitToAppRoundedIcon className="icon" />
              <span className="sidebar-name">Logout</span>
            </span>
          </li>
        </ul>
      </div>

      <Dialog 
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Logout"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmLogout} autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Sidebar;