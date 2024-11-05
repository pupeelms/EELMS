import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./widget.scss"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import HomeRepairServiceRoundedIcon from '@mui/icons-material/HomeRepairServiceRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const Widget = ({ type }) => {
  const [userCount, setUserCount] = useState(null); // Set initial value to null for loading state
  const [itemCount, setItemCount] = useState(null);
  const [lowStockCount, setLowStockCount] = useState(null);
  const [outOfStockCount, setOutOfStockCount] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        // Filter users to get only those with 'Approved' status
        const approvedUsers = response.data.filter(user => user.status === 'Approved');
        setUserCount(approvedUsers.length); // Set count to the number of approved users
      } catch (error) {
        console.error("Error fetching users:", error);
        setUserCount(0); // If there's an error, display 0
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setItemCount(response.data.length);
      } catch (error) {
        console.error("Error fetching items:", error);
        setItemCount(0);
      }
    };

    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get('/api/items/items/low-stock');
        setLowStockCount(response.data.length);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
        setLowStockCount(0);
      } 
    };

    const fetchOutOfStockItems = async () => {
      try {
        const response = await axios.get('/api/items/items/out-of-stock');
        setOutOfStockCount(response.data.length);
      } catch (error) {
        console.error("Error fetching out-of-stock items:", error);
        setOutOfStockCount(0);
      }
    };

    switch (type) {
      case "Total users":
        fetchUsers();
        break;

      case "Total items":
        fetchItems();
        break;

      case "Low stock":
        fetchLowStockItems();
        break;

      case "Out of stock":
        fetchOutOfStockItems();
        break;

      default:
        break;
    }
  }, [type]);

  let data;

  switch (type) {
    case "Total users":
      data = {
        title: "Total users",
        counter: userCount !== null ? userCount : "Loading...",
        link: <Link to="/users" className="link-style">See all users</Link>,
        icon: <PersonRoundedIcon
          className="icon"
          style={{
            color: "white",
            backgroundColor: "gray"
          }}
        />,
        className: "total-users-widget"
      };
      break;

    case "Total items":
      data = {
        title: "Total items",
        counter: itemCount !== null ? itemCount : "Loading...",
        link: <Link to="/items" className="link-style">See all items</Link>,
        icon: <HomeRepairServiceRoundedIcon
          className="icon"
          style={{
            color: "white",
            backgroundColor: "#736f4e"
          }}
        />,
        className: "total-items-widget"
      };
      break;

    case "Low stock":
      data = {
        title: "Low stock",
        counter: lowStockCount !== null ? lowStockCount : "Loading...", // Display 0 if no items, or Loading...
        link: <Link to="/items/stocks" className="link-style">See details</Link>,
        icon: <TrendingDownRoundedIcon
          className="icon"
          style={{
            color: "white",
            backgroundColor: "#e89005"
          }}
        />,
        className: "low-stock-widget"
      };
      break;

    case "Out of stock":
      data = {
        title: "Out of stock",
        counter: outOfStockCount !== null ? outOfStockCount : "Loading...", // Display 0 if no items, or Loading...
        link: <Link to="/items/stocks" className="link-style">See details</Link>,
        icon: <WarningAmberRoundedIcon
          className="icon"
          style={{
            color: "white",
            backgroundColor: "#bf211e"
          }}
        />,
        className: "out-of-stock-widget"
      };
      break;

    default:
      break;
  }

  return (
    <div className={`widget ${data.className}`}>
      <div className="left">
        <span className="title">{data.title}</span>
        <span className="counter">{data.counter}</span>
        <span className="link">{data.link}</span>
      </div>
      <div className="right">
        {data.icon}
      </div>
    </div>
  );
};


export default Widget;
