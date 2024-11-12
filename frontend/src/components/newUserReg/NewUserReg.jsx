import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import "./newUserReg.scss";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import axios from 'axios';

const NewUserReg = () => { 
  // State to store form data
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    address: "",
    studentNo: "",
    program: "",
    yearAndSection: "",
    email: "",
    contactNumber: "", 
    registrationCard: "",
    updatedClassSchedule: ""
  });
 
  // State for error messages
  const [errors, setErrors] = useState([]);

  // State to control success dialog visibility
  const [openDialog, setOpenDialog] = useState(false);

  // State to control loading
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Handle form input changes with numeric validation for contact number
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Restrict contactNumber to 10 numeric characters only
    if (name === "contactNumber") {
      // Only allow digits and restrict length to 10
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...formData,
        [name]: numericValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    // Ensure contactNumber is in international format
    const formattedContactNumber = formData.contactNumber.length === 10 
      ? `63${formData.contactNumber}` 
      : formData.contactNumber;

    try {
      const response = await axios.post('/api/users/create', {
        ...formData,
        contactNumber: formattedContactNumber, // Send the formatted contact number
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        const data = response.data;

        if (data.isAuthenticated) {
          navigate('/users/registrationSuccessful');
        } else {
          setOpenDialog(true); // Show success dialog
        }
      } else {
        if (response.data.errors) {
          setErrors(response.data.errors);
        } else {
          setErrors(['Error registering user']);
        }
      }
    } catch (error) {
      setErrors(['Please check your details and ensure they follow the required format.']);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };


  // Handle closing the dialog and navigating
  const handleCloseDialog = () => {
    setOpenDialog(false);
    navigate('/');
  };

  // Handle going back to the previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="newUserReg">
      <img src="/ceaa.png" alt="Background" className="bg-only" />
      <div className="newRegUserTitle">NEW USER REGISTRATION</div>

      <form className="newRegUserForm" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="newRegUserItem">
          <label>Full Name: </label>
          <input
            type="text"
            name="fullName"
            placeholder="FN MI LN"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Gender */}
        <div className="newRegUserItem">
          <label>Gender: </label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Prefer Not to Say</option>
          </select>
        </div>

        {/* Address */}
        <div className="newRegUserItem">
          <label>Address: </label>
          <input
            type="text"
            name="address"
            placeholder="City Address only"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        {/* Student Number */}
        <div className="newRegUserItem">
          <label>Student Number: </label>
          <input
            type="text"
            name="studentNo"
            placeholder="20**-*****-MN-*"
            value={formData.studentNo}
            onChange={handleChange}
          />
        </div>

        {/* Program */}
        <div className="newRegUserItem">
          <label>Program: </label>
          <input
            type="text"
            name="program"
            placeholder="BS**"
            value={formData.program}
            onChange={handleChange}
            required
          />
        </div>

        {/* Year & Section */}
        <div className="newRegUserItem">
          <label>Year & Section: </label>
          <input
            type="text"
            name="yearAndSection"
            placeholder="Year & Section"
            value={formData.yearAndSection}
            onChange={handleChange}
          />
        </div>

        {/* Email */}
        <div className="newRegUserItem">
          <label>Email: </label>
          <input
            type="email"
            name="email"
            placeholder="Active Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Contact Number */}
        <div className="newRegUserNumber">
          <label>Contact Number: </label>
          <div className="contactInputWrapper">
            <span className="prefix">+63</span>
            <input
              type="text"
              name="contactNumber"
              placeholder="XXXXXXXXXX"
              value={formData.contactNumber}
              onChange={handleChange}
              maxLength={10} // Limit input to 10 characters
              required
            />
            </div>
          </div>

        {/* Registration Card */}
        <div className="newRegUserItem">
          <label>Registration Card: </label>
          <input
            type="text"
            name="registrationCard"
            placeholder="Gdrive link to registration card"
            value={formData.registrationCard}
            onChange={handleChange}
          />
        </div>

        {/* Updated Class Schedule */}
        <div className="newRegUserItem">
          <label>Updated Class Schedule: </label>
          <input
            type="text"
            name="updatedClassSchedule"
            placeholder="Gdrive link to class schedule"
            value={formData.updatedClassSchedule}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="newRegSubmitButton"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? 'Loading...' : 'Register'} {/* Change button text based on loading state */}
        </button>

        {/* Back Button */}
        <button type="button" className="newRegBackButton" onClick={handleGoBack}>Back</button>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="newRegmessage">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}
      </form>

      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Registration Successful!</DialogTitle>
        <DialogContent>
          <p>Your registration was successful. Please await for admin approval via email. Thank you!</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div> 
  );
};

export default NewUserReg;
