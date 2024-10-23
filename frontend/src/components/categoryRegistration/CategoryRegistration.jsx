import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './categoryRegistration.scss';
import axios from 'axios'; // Import axios
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const CategoryRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state
  const [openDialog, setOpenDialog] = useState(false);
  const [errors, setErrors] = useState([]);

  // State to store form data
  const [formData, setFormData] = useState({
    categoryName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = [];

    // Ensure category name is not empty
    if (!formData.categoryName || formData.categoryName.trim() === '') {
      validationErrors.push('Please enter a category name.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Set loading to true when form submission starts
    setLoading(true);

    try {
      const response = await axios.post('/api/categories/create', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setOpenDialog(true);
      } else {
        setErrors([response.data.error || 'Error registering category. Please try again later.']);
      }
    } catch (error) {
      setErrors(['Error connecting to the server. Please check your network connection or try again later.']);
    } finally {
      setLoading(false); // Set loading to false after form submission completes
    }
  };

  // Handle closing the dialog and navigating
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    if (!openDialog) {
      navigate('/categories');  // Navigate only after dialog is fully closed
    }
  }, [openDialog, navigate]);

  return (
    <div className="categoryRegistration">
      <form className="newCategoryForm" onSubmit={handleSubmit}>
        <div className="newCategoryField">
          <label>Category Name: </label>
          <input
            type="text"
            name="categoryName"
            placeholder="Category Name"
            value={formData.categoryName}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className='submitButton' disabled={loading}>
          {loading ? 'Loading...' : 'Create Category'} {/* Show Loading when submitting */}
        </button>
        {errors.length > 0 && (
          <div className="errorMessages">
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </form>

      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Registration Successful</DialogTitle>
        <DialogContent>
          <p>New category registration successful!</p>
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

export default CategoryRegistration;
