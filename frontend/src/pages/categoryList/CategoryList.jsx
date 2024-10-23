import "./categoryList.scss";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CategoryTable from "../../components/categoryTable/CategoryTable";
import CustomBreadcrumbs from "../../components/breadcrumbs/Breadcrumbs";
import { useState } from "react";
import { Drawer, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CategoryRegistration from "../../components/categoryRegistration/CategoryRegistration"; // Import your CategoryRegistration component

const CategoryList = () => {
  // State to control the drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to handle opening and closing the drawer
  const toggleDrawer = (open) => () => {
    setIsDrawerOpen(open);
  };

  return (
    <div className="categoryList">
      <Sidebar />
      <div className="categoryListContainer">
        <Navbar />
        <div className="Content">
          <CustomBreadcrumbs />
          <div className="categoryListTable">
            <div className="categoryListTitle">
              <span className="title">List of Categories</span>
              {/* Button to open the drawer */}
              <Button variant="contained" className="addCategory" onClick={toggleDrawer(true)}>
                Add New Category
              </Button>
            </div>
            <CategoryTable />
          </div>
        </div>
      </div>

      {/* Drawer for the Add Category Form */}
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

          <h2>New Category Registration</h2>
          {/* Render the CategoryRegistration form */}
          <CategoryRegistration />
        </div>
      </Drawer>
    </div>
  );
};

export default CategoryList;
