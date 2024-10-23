import "./categorySuccess.scss";
import { Link } from "react-router-dom";
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import CustomBreadcrumbs from "../breadcrumbs/Breadcrumbs";

const CategorySuccess = () => {
  return (
    <div className="success">
      <Sidebar/>
      <div className="successContainer">
        <Navbar/>
        <CustomBreadcrumbs/>
    <div className="successMessage">
      Category created successfully!
      <div className="buttonsContainer">
        <Link to="/categories/newCategory" className="link">
          <button className="addCategory">Add New Category</button>
        </Link>
        <Link to="/categories" className="link">
          <button className="backCategories">Back to Categories</button>
        </Link>
      </div>
    </div>
      </div>
    </div>
  );
};

export default CategorySuccess;
