import "./regiSuccess.scss";
import { Link } from "react-router-dom";

const RegiSuccess = () => {
  return (
    <div className="successMessage">
      Registration successful! Await admin approval.
      <div className="buttonsContainer">
        <Link to="/users/newUser" className="link">
          <button className="addUser">Add New User</button>
        </Link>
        <Link to="/users" className="link">
          <button className="backUser">Back to Users</button>
        </Link>
      </div>
    </div>
  );
};

export default RegiSuccess;
