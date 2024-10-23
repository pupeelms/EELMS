import "./itemList.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import { ItemTable } from "../../components/itemTable/ItemTable";
import { Link } from "react-router-dom";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import ItemRegistration from '../../components/itemRegistration/ItemRegistration'; // Import your ItemRegistration component
import { useState } from "react";
import { Drawer, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon from Material-UI

const ItemList = () => {
  // State to control the drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to handle opening the drawer
  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
  };

  return (
    <div className="itemList">
      <Sidebar />
      <div className="itemListContainer">
        <Navbar />
        <div className="Content">
          <CustomBreadcrumbs />
          <div className="itemListTable">
            <div className="itemListTitle">
              <span className="title">List of Items</span>
              {/* Button to open drawer */}
              <Button variant="contained" className="addItem" onClick={toggleDrawer(true)}>
                Add New Item
              </Button>
            </div>
            <ItemTable />
          </div>
        </div>
      </div>

      {/* Drawer for the Add Item Form */}
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
          
          <h2>New Item Registration</h2>
          {/* Render the ItemRegistration form */}
          <ItemRegistration />
        </div>
      </Drawer>
    </div>
  );
};

export default ItemList;
