import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './notificationList.scss';
import axios from 'axios';
import Checkbox from '@mui/material/Checkbox';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { format, isToday, isYesterday } from 'date-fns';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText'; 
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Date');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // For dialog box

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data);
        setFilteredNotifications(response.data);

        const unreadResponse = await axios.get('/api/notifications/notif/unread');
        setUnreadCount(unreadResponse.data.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const applyFilterAndSort = () => {
      let updatedList = [...notifications];

      if (filter === 'Unread') {
        updatedList = updatedList.filter(notification => !notification.isRead);
      }

      if (searchTerm) {
        updatedList = updatedList.filter(notification =>
          notification.message.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (sort === 'Date') {
        updatedList.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (sort === 'Type') {
        updatedList.sort((a, b) => a.type.localeCompare(b.type));
      }

      setFilteredNotifications(updatedList);
    };

    applyFilterAndSort();
  }, [notifications, filter, searchTerm, sort]);

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

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axios.patch(`/api/notifications/${notification._id}/read`);
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prevUnreadCount => prevUnreadCount - 1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filterType) => {
    setFilter(filterType);
  };

  const handleSortChange = (sortType) => {
    setSort(sortType);
  };

  const handleMarkAllAsReadClick = () => {
    // Open the confirmation dialog before marking all as read
    setConfirmDialogOpen(true);
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notification => !notification.isRead);
      await Promise.all(unreadNotifications.map(notification =>
        axios.patch(`/api/notifications/${notification._id}/read`)
      ));
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setConfirmDialogOpen(false); // Close the dialog after marking as read
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialogOpen(false); // Close the dialog without marking as read
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(notification => notification._id));
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter(notificationId => notificationId !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(notification => notification._id !== id));
      setFilteredNotifications(filteredNotifications.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedNotifications.map(id =>
        axios.delete(`/api/notifications/${id}`)
      ));
      setNotifications(notifications.filter(notification => !selectedNotifications.includes(notification._id)));
      setFilteredNotifications(filteredNotifications.filter(notification => !selectedNotifications.includes(notification._id)));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const groupByDate = (notifications) => {
    const grouped = {};
    notifications.forEach(notification => {
      const date = new Date(notification.date);
      const key = date.toDateString();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(notification);
    });
    return grouped;
  };

  const groupedNotifications = groupByDate(filteredNotifications);

  const getGroupDateLabel = (date) => {
    const notificationDate = new Date(date);
    if (isToday(notificationDate)) {
      return 'Today';
    } else if (isYesterday(notificationDate)) {
      return 'Yesterday';
    } else {
      return format(notificationDate, 'EEE MMM dd yyyy');
    }
  };

  return (
    <div className="notification-list">
      <div className="notification-list__header">
        <div className="notification-list__actions">
          <button onClick={() => handleFilterChange('Unread')}>Unread ({unreadCount})</button>
          <button onClick={() => handleFilterChange('All')}>All</button>
          <button onClick={handleMarkAllAsReadClick}>Mark all as read</button>
          <button onClick={() => setIsSelecting(!isSelecting)}>
            {isSelecting ? 'Cancel' : 'Select'}
          </button>
          {isSelecting && (
            <>
              <button onClick={handleSelectAll}>
                {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedNotifications.length > 0 && (
                <button onClick={handleDeleteSelected}>Delete Selected</button>
              )}
            </>
          )}
        </div>
        <div className="notification-list__search-sort">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <select onChange={(e) => handleSortChange(e.target.value)} value={sort}>
            <option value="Date">Sort by: Date</option>
            <option value="Type">Sort by: Type</option>
          </select>
        </div>
      </div>

      <div className="notification-list__body">
        {Object.entries(groupedNotifications).map(([date, notifications]) => (
          <div key={date} className="notification-list__group">
            <div className="notification-list__date">
              {getGroupDateLabel(date)}
            </div>
            {notifications.map(notification => (
              <div key={notification._id} className={`notification-list__item ${notification.isRead ? '' : 'unread'}`}>
                {isSelecting && (
                  <Checkbox
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => handleCheckboxChange(notification._id)}
                  />
                )}
                <Link
                  to={generateNotificationLink(notification)}
                  className="notification-list__message"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.message}
                </Link>
                <button onClick={() => handleDelete(notification._id)} className="notification-list__delete-button">
                  <DeleteOutlineRoundedIcon fontSize="small" className="deleteButton" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Mark All as Read</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to mark all notifications as read? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={markAllAsRead} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotificationList;
