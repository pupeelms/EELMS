import "./userList.scss"
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import PageTitle from '../../components/pageTitle/PageTitle';
import UserTable from '../../components/userTable/UserTable';
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import UserRegistration from '../../components/userRegistration/UserRegistration'; // Import your UserRegistration component
import { useState } from "react";
import { Drawer, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon from Material-UI

const UserList = () => {
  // State to control the drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to handle opening the drawer
  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
  };

  return (
    <div className="userList">
      <Sidebar />
      <div className="userListContainer">
        <Navbar />
        <div className="Content">
          {/* <img src="/blurred-bg.png" alt="Background" className="userslist-bg" /> */}
          <CustomBreadcrumbs />
          <div className="userListTable">
            <div className="userListTitle">
              <span className="title">List of Users</span>
              {/* Button to open drawer */}
              <Button variant="contained" className="addUser" onClick={toggleDrawer(true)}>
                Add New User
              </Button>
            </div>
            <UserTable />
          </div>
        </div>
      </div>

      {/* Drawer for the Add User Form */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
      >
        {/* Content of the drawer */}
        <div style={{ width: 400, padding: 20, position: 'relative' }}>
          {/* Close Button */}
          <IconButton
            onClick={toggleDrawer(false)}
            style={{ position: 'absolute', right: 10, top: 15 }}
          >
            <CloseIcon />
          </IconButton>
          
          <h2>New User Registration</h2>
          {/* Render the UserRegistration form */}
          <UserRegistration />
        </div>
      </Drawer>
    </div>
  );
};

export default UserList;
