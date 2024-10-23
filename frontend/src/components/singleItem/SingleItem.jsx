import "./singleItem.scss";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { imageBaseURL } from '../../config/axiosConfig'; // Import the imageBaseURL
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText, 
  DialogActions,
} from "@mui/material";

const SingleItem = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedItem, setUpdatedItem] = useState({});
  const [categories, setCategories] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (itemId) {
      fetchItem();
    }
    fetchCategories();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const response = await axios.get(`/api/items/${itemId}`);
      setItem(response.data);
      setUpdatedItem(response.data);
    } catch (error) {
      console.error("Error fetching item:", error.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`/api/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  // Create categoryIdMap dynamically
  const categoryIdMap = categories.reduce((map, category) => {
    map[category._id] = category.categoryName;
    return map;
  }, {});

  const handleEditClick = () => {
    setIsEditing((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedItem((prev) => ({
      ...prev,
      [name]: typeof value === "string" ? value.trim() : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const categoryName = categoryIdMap[categoryId];

    setUpdatedItem((prev) => ({
      ...prev,
      category: { _id: categoryId, categoryName },
      categoryName, // Update categoryName property of updatedItem
    }));
  };

  const handleImageChange = (e) => {
    setUpdatedItem((prev) => ({
      ...prev,
      image: e.target.files[0], // Store the selected image file
    }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    
    // Append fields manually to ensure they are in the correct format
    Object.keys(updatedItem).forEach((key) => {
      if (key === 'image' && updatedItem.image instanceof File) {
        // Append the image file if it's a File instance
        formData.append('image', updatedItem.image);
      } else if (key === 'category' && updatedItem.category?._id) {
        // Serialize the category object (just use the ID or convert to string)
        formData.append('category', updatedItem.category._id);
      } else if (updatedItem[key] !== undefined && updatedItem[key] !== null) {
        // Add other fields, ensuring they're valid
        formData.append(key, updatedItem[key]);
      }
    });
  
    try {
      const response = await axios.put(`/api/items/${itemId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        setIsEditing(false);
        fetchItem();
      }
    } catch (error) {
      console.error("Error saving item:", error.message);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/items/${itemId}`);
      navigate("/items");
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="singleItem">
      <div className="singleItemContainer">
        <div className="itemShow">
          <div className="itemHeader">
            <h1 className="itemTitle">Item Details</h1>
            <div className="buttonGroup">
              <Button className="itemEditButton" onClick={handleEditClick}>
                {isEditing ? "Close" : "Edit"}
              </Button>
              <Button className="itemDeleteButton" onClick={handleDeleteClick}>
                Delete
              </Button>
            </div>
          </div>

          <div className="itemInfo">
            <img
              src={
                (() => {
                  const imageUrl = item.image
                    ? `${imageBaseURL.replace(/\/$/, '')}/${item.image.replace(/^\//, '')}`
                    : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg";
                  
                  return imageUrl;
                })()
              }
              alt={item.itemName}
              className="itemImage"
            />

            <div className="itemDetailsTop">
              <p>{item.itemName}</p>
              {/* <h4>Barcode:</h4> */}
              {/* Render the Barcode Image */}
              {item.barcodeImage && (
                <img
                  src={`data:image/png;base64,${item.barcodeImage}`} // Render base64 barcode image
                  alt="Barcode"
                  className="barcodeImage" // Add your CSS class for styling
                />
              )}
            </div>
          </div>

          <div className="itemDetailsBottom">
            <p><strong>Category:</strong> {updatedItem.category?.categoryName || "N/A"}</p>
            <p><strong>Brand:</strong> {item.brand || "N/A"}</p>
            <p><strong>Model:</strong> {item.model || "N/A"}</p>
            <p><strong>Manufacturer:</strong> {item.manufacturer || "N/A"}</p> {/* Added */}
            <p><strong>Serial Number:</strong> {item.serialNumber || "N/A"}</p> {/* Added */}
            <p><strong>PUP Property Number:</strong> {item.pupPropertyNumber || "N/A"}</p> {/* Added */}
            <p><strong>Number:</strong> {item.number || "N/A"}</p> {/* Added */}
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Status:</strong> {item.condition}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>Date Added:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Date Updated:</strong> {new Date(item.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bottom2">
          <div className="descrip">
            <p><strong>Specification:</strong> {item.specification || "N/A"}</p> {/* Added */}
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Notes/Comments:</strong> {item.notesComments || "N/A"}</p>
          </div>
        </div>
        

        {/* Drawer for editing item */}
        <Drawer
          anchor="right"
          open={isEditing}
          onClose={handleEditClick}
          PaperProps={{ sx: { width: { xs: "100%", sm: "400px" } } }}
        >
          <div className="drawerContent">
            <div className="drawerHeader">
              <h2>Edit Item</h2>
              <Button className="closeButton" onClick={handleEditClick}>
                ✖
              </Button>
            </div>
            <form className="editForm">
              <TextField
                label="Item Name"
                name="itemName"
                value={updatedItem.itemName || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />

              {/* Image Upload Field */}
              <FormControl fullWidth margin="normal">
                <InputLabel shrink htmlFor="file-upload">
                  Image
                </InputLabel>
                <input
                  id="file-upload"
                  type="file"
                  fullWidth
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    display: "block",
                    marginTop: "16px",
                    padding: "10px 14px",
                    border: "1px solid rgba(0, 0, 0, 0.23)",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
                {updatedItem.image && (
                 <img
                 src={
                   (() => {
                     let imageUrl;
                     if (typeof updatedItem.image === "object") {
                       imageUrl = URL.createObjectURL(updatedItem.image);
                     } else {
                       imageUrl = `${imageBaseURL.replace(/\/$/, '')}/${updatedItem.image.replace(/^\//, '')}`;
                     }
                     
                     return imageUrl;
                   })()
                 }
                 alt="Selected Image"
                 style={{ width: "100%", height: "auto", marginTop: "10px" }}
               />
                )}
              </FormControl>

              {/* Category Select JSX */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={updatedItem.category?._id || ""} // Use category ID for value
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.categoryName} {/* Display category name */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Location"
                name="location"
                value={updatedItem.location || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />

              <TextField
                label="Brand"
                name="brand"
                value={updatedItem.brand || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Model"
                name="model"
                value={updatedItem.model || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Manufacturer"
                name="manufacturer"
                value={updatedItem.manufacturer || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Serial Number"
                name="serialNumber"
                value={updatedItem.serialNumber || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="PUP Property Number"
                name="pupPropertyNumber"
                value={updatedItem.pupPropertyNumber || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Number"
                name="number"
                type="number"
                value={updatedItem.number || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={updatedItem.quantity || ""}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Description"
                name="description"
                value={updatedItem.description || ""}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Specification"
                name="specification"
                value={updatedItem.specification || ""}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="condition-label">Condition</InputLabel>
                <Select
                  labelId="condition-label"
                  name="condition"
                  value={updatedItem.condition || ""}
                  onChange={handleInputChange}
                  label="Condition"
                >
                  <MenuItem value="Functional">Functional</MenuItem>
                  <MenuItem value="Defective">Defective</MenuItem>
                  <MenuItem value="For Disposal">For Disposal</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="pmNeeded-label">PM Needed</InputLabel>
                <Select
                  labelId="pmNeeded-label"
                  name="pmNeeded"
                  value={updatedItem.pmNeeded || ""} // Add pmNeeded state
                  onChange={handleInputChange} // Use handleInputChange for simple Select input
                  label="PM Needed"
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="pmFrequency-label">PM Frequency</InputLabel>
                <Select
                  labelId="pmFrequency-label"
                  name="pmFrequency"
                  value={updatedItem.pmFrequency || ""} // Add pmFrequency state
                  onChange={handleInputChange} // Use handleInputChange for simple Select input
                  label="PM Frequency"
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Annually">Annually</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>


              <Button
                onClick={handleSave}
                fullWidth
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </form>
          </div>
        </Drawer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
        >
          <DialogTitle>{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowDeleteConfirmation(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default SingleItem;
