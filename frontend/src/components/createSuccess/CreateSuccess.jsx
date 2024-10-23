import "./createSuccess.scss";
import { Link } from "react-router-dom";

const CreateSuccess = () => {
  return (
    <div className="successMessage">
      Item Added Successfully!
      <div className="buttonsContainer">
        <Link to="/items/newItem" className="link">
          <button className="addItem">Add New Item</button>
        </Link>
        <Link to="/items" className="link">
          <button className="backItem">Back to Items</button>
        </Link>
      </div>
    </div>
  );
};

export default CreateSuccess;
