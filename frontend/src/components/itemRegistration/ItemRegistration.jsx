import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import './itemRegistration.scss';
import axios from 'axios';

const ItemRegistration = () => {
  const navigate = useNavigate();

  // State to store form data
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    newCategory: "",
    brand: "",
    model: "",
    manufacturer: "",  // Added Manufacturer field
    quantity: "",
    serialNumber: "",  // Added Serial Number field
    pupPropertyNumber: "",  // Added PUP Property Number field
    number: "",  // Added Number field
    description: "",
    condition: "",
    location: "",
    pmFrequency: "",  // Added PM Frequency field
    specification: "",  // Added Specification field
    pmNeeded: "No",
    pmDueDate: "",
    pmStatus: "",
    notesComments: "",
  }); 

  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        setErrors(['Error fetching categories.']);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      setImageFile(file);
      setFormData(prevFormData => ({ ...prevFormData, [name]: file }));
    } else {
      setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading state to true when submission starts
    let validationErrors = [];

    // Ensure either category or newCategory is selected/filled
    const categorySelected = formData.category && formData.category.trim() !== '';
    const newCategoryFilled = formData.newCategory && formData.newCategory.trim() !== '';

    if (!categorySelected && !newCategoryFilled) {
      validationErrors.push('Please select a category or add a new one.');
    }

    // Add more validation checks if needed...

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false); 
      return;
    }

    // Prepare data for submission
    const submissionData = new FormData();
    for (const key in formData) {
      if (formData.pmNeeded === "No" && key.startsWith('pm') && key !== 'pmNeeded') {
        continue;
      }
      submissionData.append(key, formData[key]);
    }

    try {
      const response = await axios.post('/api/items/create', submissionData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
 
      if (response.status === 201) {
        setOpenDialog(true);
      } else {
        setErrors(response.data.errors || [response.data.error || 'Error registering item. Please try again later.']);
      }
    } catch (error) {
      setErrors([error.response?.data?.error || 'An unexpected error occurred. Please try again.']);
    } finally {
      setLoading(false); // Set loading state to false when submission is complete
    }
  };

  useEffect(() => {
    return () => {
      if (imageFile) URL.revokeObjectURL(imageFile);
    };
  }, [imageFile]);

  // Handle closing the dialog and navigating
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    if (!openDialog) {
      navigate('/items');  // Navigate only after dialog is fully closed
    }
  }, [openDialog, navigate]);


  return (
    <div className="itemRegistration">
      <form className="newItemForm" onSubmit={handleSubmit}>
        <div className="newItemField">
          <label>Item Name: </label>
          <input
            type="text"
            name="itemName" 
            placeholder="Item Name"
            value={formData.itemName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="newItemField">
          <label>Image: </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>
        <div className="imagePreview">
          <img
            src={imageFile ? URL.createObjectURL(imageFile) : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
            alt="Preview"
            style={{ width: "200px", height: "200px", objectFit: "cover" }}
          />
        </div>
        <div className="newItemField">
          <label>Category: </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="newItemField">
          <label>Or Add New Category: </label>
          <input
            type="text"
            name="newCategory"
            placeholder="New Category"
            value={formData.newCategory}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Brand: </label>
          <input
            type="text"
            name="brand"
            placeholder="Brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Model: </label>
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={formData.model}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Manufacturer: </label>
          <input
            type="text"
            name="manufacturer"
            placeholder="Manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Serial Number: </label>
          <input
            type="text"
            name="serialNumber"
            placeholder="Serial Number"
            value={formData.serialNumber}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>PUP Property Number: </label>
          <input
            type="text"
            name="pupPropertyNumber"
            placeholder="PUP Property Number"
            value={formData.pupPropertyNumber}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Number: </label>
          <input
            type="text"
            name="number"
            placeholder="Number"
            value={formData.number}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Quantity: </label>
          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Description: </label>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Specification: </label>
          <textarea
            name="specification"
            placeholder="Specification"
            value={formData.specification}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>Status: </label>
          <select name="condition" value={formData.condition} onChange={handleChange}>
            <option value="">Select Status</option>
            <option value="Functional">Functional</option>
            <option value="Defective">Defective</option>
            <option value="For Disposal">For Disposal</option>
            <option value="No Status">No Status</option>
          </select>
        </div>
        <div className="newItemField">
          <label>Location: </label>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className="newItemField">
          <label>PM Needed? </label>
          <select name="pmNeeded" value={formData.pmNeeded} onChange={handleChange}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        {formData.pmNeeded === "Yes" && (
          <>
            <div className="newItemField">
              <label>PM Frequency: </label>
              <select name="pmFrequency" value={formData.pmFrequency} onChange={handleChange}>
                <option value="">Select Frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </>
        )}
        <div className="newItemField">
          <label>Notes/Comments: </label>
          <textarea
            name="notesComments"
            placeholder="Notes/Comments"
            value={formData.notesComments}
            onChange={handleChange}
          />
        </div>
        <button type="submit" className='submitButton' disabled={loading}>
          {loading ? 'Loading...' : 'Create Item'} {/* Display "Loading..." when submitting */}
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
          <p>New item registration successful!</p>
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

export default ItemRegistration;
