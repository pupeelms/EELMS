import React, { useEffect, useState } from 'react';
import { Drawer, Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import "./editTransactionDrawer.scss";
import axios from 'axios';

const EditTransactionDrawer = ({ open, onClose, transaction, onUpdate }) => {
  const [formValues, setFormValues] = React.useState({
    userName: '',
    courseSubject: '',
    professor: '',
    roomNo: '',
    borrowedDuration: '',
    transactionType: '',
    returnStatus: '',
    partialReturnReason: '',
    profAttendance: '', // Add the new profAttendance field
    notesComments: '',
    feedbackEmoji: '',
    items: [], // For storing item details
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [durationValue, setDurationValue] = React.useState(''); // Default to empty string
  const [durationUnit, setDurationUnit] = React.useState('');   // Default to empty string
  const [itemToRemove, setItemToRemove] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([]);  // Initialize with an empty array or fetch it from an API
  const [loading, setLoading] = useState(false);
  const [borrowedDurationHours, setBorrowedDurationHours] = useState(0);
  const [borrowedDurationMinutes, setBorrowedDurationMinutes] = useState(0);


 // Populate the form with the transaction data when the Drawer opens
useEffect(() => {
  if (transaction) {
    console.log("Transaction details received by drawer:", transaction);

     // Parse borrowedDuration into hours and minutes
     const durationString = transaction.borrowedDuration || "";
     const hoursMatch = durationString.match(/(\d+)\s*hour/);
     const minutesMatch = durationString.match(/(\d+)\s*minute/);
 
     const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
     const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
 
     setBorrowedDurationHours(hours);
     setBorrowedDurationMinutes(minutes);
 

    setFormValues((prev) => ({
      ...prev,
      userName: transaction.userName || "",
      yearAndSection: transaction.userID?.yearAndSection || "",
      courseSubject: transaction.courseSubject || "",
      professor: transaction.professor || "",
      roomNo: transaction.roomNo || "",
      borrowedDuration: transaction.borrowedDuration || "",
      transactionType: transaction.transactionType || "",
      returnStatus: transaction.returnStatus || "",
      partialReturnReason: transaction.partialReturnReason || "",
      profAttendance: transaction.profAttendance || "", // Add profAttendance here
      feedbackEmoji: transaction.feedbackEmoji || "",
      notesComments: transaction.notesComments || "",
      items: transaction.items || [], // Set items array from transaction
    }));
  }
}, [transaction]);


// Handle changes for specific item fields
const handleItemChange = (e, index) => {
  const { name, value } = e.target;
  console.log(`Changing ${name} to ${value} for item at index ${index}`);
  
  setFormValues((prev) => {
    const updatedItems = [...prev.items];
    
    // Directly update the condition (no need to check for 'others' anymore)
    if (name.startsWith('condition_')) {
      updatedItems[index].condition = value;
    } else {
      updatedItems[index][name.split('_')[0]] = value;
    }
    
    return { ...prev, items: updatedItems };
  });
};


const handleAddNewItem = () => {
  setFormValues((prev) => ({
    ...prev,
    items: [
      ...prev.items,
      { itemBarcode: '', quantityBorrowed: 0, isNew: true },
    ],
  }));
};

// Remove an item
const handleRemoveItem = (index) => {
  setItemToRemove(index);
  setDialogOpen(true);
};

const confirmRemoveItem = () => {
  if (itemToRemove !== null) {
    setFormValues((prevValues) => ({
      ...prevValues,
      items: prevValues.items.filter((_, i) => i !== itemToRemove),
    }));
    setItemToRemove(null);
  }
  setDialogOpen(false);
};

const cancelRemoveItem = () => {
  setItemToRemove(null);
  setDialogOpen(false);
};

const handleChange = (e) => {
  const { name, value } = e.target;

  if (
    name.startsWith("item_") ||
    name.startsWith("quantityBorrowed_") ||
    name.startsWith("quantityReturned_") ||
    name.startsWith("condition_") ||
    name.startsWith("itemBarcode_")
  ) {
    const [field, type, index] = name.split("_");
    const itemIndex = parseInt(index, 10); // Convert index to number
    const updatedItems = [...formValues.items];

    // Ensure the item exists before modifying it
    if (!updatedItems[itemIndex]) {
      updatedItems[itemIndex] = {};
    }

    updatedItems[itemIndex][type] = value; // Update specific field

    setFormValues((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    console.log("Updated items:", updatedItems); // Log updated items
  } else {
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (name === "borrowedDuration") {
      console.log("Updated borrowedDuration:", value); // Log borrowedDuration
    }
  }
};

const handleSubmit = async () => {
  // Prepare the updated values for submission
  let borrowedDuration;
  if (borrowedDurationHours === 0) {
    // Display only minutes if hours is 0
    borrowedDuration = `${borrowedDurationMinutes} minute${borrowedDurationMinutes !== 1 ? 's' : ''}`;
  } else if (borrowedDurationMinutes === 0) {
    // Display only hours if minutes is 0
    borrowedDuration = `${borrowedDurationHours} hour${borrowedDurationHours !== 1 ? 's' : ''}`;
  } else {
    // Display both hours and minutes
    borrowedDuration = `${borrowedDurationHours} hour${borrowedDurationHours !== 1 ? 's' : ''} and ${borrowedDurationMinutes} minute${borrowedDurationMinutes !== 1 ? 's' : ''}`;
  }

  const updatedValues = {
    ...formValues,
    borrowedDuration,
    borrowedDurationMillis: borrowedDurationHours * 60 * 60 * 1000 + borrowedDurationMinutes * 60 * 1000,
    items: await Promise.all(
      formValues.items.map(async (item) => {
        // Ensure quantityReturned is initialized to 0 for all items
        const baseItem = {
          ...item,
          quantityReturned: item.quantityReturned || 0, // Default to 0 if not already set
        };

        // If the item is new, fetch item name based on barcode and add quantityReturned
        if (item.isNew) {
          const itemName = await fetchItemByBarcode(item.itemBarcode);

          return {
            itemBarcode: item.itemBarcode,
            itemName: itemName.itemName || 'Unknown Item', // Add itemName dynamically
            quantityBorrowed: item.quantityBorrowed,
            quantityReturned: 0, // Explicitly set to 0 for new items
          };
        }

        // For existing items, return the full item details
        return baseItem;
      })
    ),
  };

  console.log("Updated formValues before submit:", updatedValues); // Debug log

  try {
    // Call the onUpdate function, passing the updated values
    const response = await onUpdate(transaction._id, updatedValues);

    if (response && response.success) {
      console.log("Transaction updated successfully:", response.transaction);
      onClose();
    } else {
      console.error("Failed to update transaction:", response.message);
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
  }
};


const handleIncrement = async (index, field) => {
  const updatedItems = [...formValues.items];
  const itemBarcode = updatedItems[index].itemBarcode;

  try {
    const itemDetails = await fetchItemByBarcode(itemBarcode);

    if (itemDetails) {
      let availableQuantity = updatedItems[index].availableQuantity ?? itemDetails.availableQuantity; // Available quantity from the database
      const currentQuantity = updatedItems[index][field] || 0; // Current quantity in the form

      console.log("Current quantityBorrowed:", currentQuantity);

      if (field === 'quantityBorrowed') {
        // Increment logic
        if (availableQuantity > 0) {
          // Increment by 1
          updatedItems[index][field] = currentQuantity + 1;
          // Decrease available quantity by 1
          availableQuantity -= 1;
          updatedItems[index].availableQuantity = availableQuantity;

          console.log(`Quantity incremented. New quantityBorrowed: ${updatedItems[index][field]}`);
          console.log(`Available quantity decreased. Remaining: ${availableQuantity}`);
        } else {
          alert("Cannot increment. Not enough available quantity.");
        }
 
    
      } else if (field === 'quantityReturned') {
        // For quantityReturned, increment based on quantityBorrowed
        const maxReturnable = updatedItems[index].quantityBorrowed - currentQuantity;
        if (maxReturnable > 0) {
          updatedItems[index][field] = currentQuantity + 1;
        } else {
          alert("Cannot increment. Quantity returned cannot exceed quantity borrowed.");
        }
      }

      // Update the form state with the new values
      setFormValues((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      console.error("Item details not found for barcode:", itemBarcode);
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
  }
};

// Function to fetch item data from the backend by barcode
const fetchItemByBarcode = async (barcode) => {
  try {
    const response = await axios.get(`/api/items/barcode/${barcode}`);
    const item = response.data;

    // Calculate available quantity
    const availableQuantity = item.quantity - (item.borrowedQuantity || 0);

    // Log the calculated available quantity
    console.log("Available quantity:", availableQuantity);

    return {
      ...item,
      availableQuantity, // Add availableQuantity to the response
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Item not found');
    } else {
      console.error('Error fetching item data:', error.message);
    }
    return null;
  }
};

const handleDecrement = async (index, field) => {
  const updatedItems = [...formValues.items];
  const itemBarcode = updatedItems[index].itemBarcode;

  try {
    const itemDetails = await fetchItemByBarcode(itemBarcode);

    if (itemDetails) {
      let availableQuantity = updatedItems[index].availableQuantity ?? itemDetails.availableQuantity; // Available quantity from the database
      const currentQuantity = updatedItems[index][field] || 0; // Current quantity in the form

      console.log(`Current ${field}:`, currentQuantity);

      if (field === 'quantityBorrowed') {
        // Decrement logic for quantityBorrowed
        if (currentQuantity > 0) {
          // Decrement quantityBorrowed by 1
          updatedItems[index][field] = currentQuantity - 1;
          // Increase available quantity by 1
          availableQuantity += 1;
          updatedItems[index].availableQuantity = availableQuantity;

          console.log(`Quantity decremented. New quantityBorrowed: ${updatedItems[index][field]}`);
          console.log(`Available quantity increased. Remaining: ${availableQuantity}`);
        } else {
          alert("Cannot decrement. Current quantityBorrowed is zero.");
        }
      } else if (field === 'quantityReturned') {
        // Decrement logic for quantityReturned
        const maxReturnable = updatedItems[index].quantityBorrowed; // Max returnable quantity
        if (currentQuantity > 0) {
          // Decrement quantityReturned by 1
          updatedItems[index][field] = currentQuantity - 1;

          console.log(`Quantity decremented. New quantityReturned: ${updatedItems[index][field]}`);
        } else {
          alert("Cannot decrement. Current quantityReturned is zero.");
        }
      }

      // Update the form state with the new values
      setFormValues((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      console.error("Item details not found for barcode:", itemBarcode);
    }
  } catch (error) {
    console.error("Error fetching item details:", error);
  }
};



  return (
    <Drawer anchor="right" className='editDrawer' open={open} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
        role="presentation"
      >
        <Typography variant="h6" className='drawer1' gutterBottom>
          Edit Transaction     
          <Button variant="outlined" className='xEdit' onClick={onClose}>✖</Button>
        </Typography>

        {/* User Info Section */}
        <Typography className='editTransLabel'>User Information</Typography>
        <TextField
          label="User Name"
          name="userName"
          value={formValues.userName}
          onChange={handleChange}
          fullWidth
          disabled
        />
        <TextField
          label="Year & Section"
          name="yearAndSection"
          value={formValues.yearAndSection}
          onChange={handleChange}
          fullWidth
          disabled
        />

        {/* Transaction Details */}
        <Typography className='editTransLabel'>Transaction Details</Typography>
        <TextField
          label="Course/Subject"
          name="courseSubject"
          value={formValues.courseSubject}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Professor"
          name="professor"
          value={formValues.professor}
          onChange={handleChange}
          fullWidth
        />
         {/* Dropdown for Prof Attendance */}
         <FormControl fullWidth>
          <InputLabel id="profAttendance">Prof. Present?</InputLabel>
          <Select
            label="profAttendance"
            name="profAttendance"
            value={formValues.profAttendance}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Room Number"
          name="roomNo"
          value={formValues.roomNo}
          onChange={handleChange}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="transactionType">Transaction Type</InputLabel>
          <Select
            label="Transaction Type"
            name="transactionType"
            value={formValues.transactionType}
            onChange={handleChange}
            fullWidth
            disabled
            //disabled={formValues.transactionType === "Returned"}
          >
            <MenuItem value="Borrowed">Borrowed</MenuItem>
            <MenuItem value="Returned">Returned</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Hours Dropdown */}
          <FormControl fullWidth>
            <InputLabel id="hours-label">Hours</InputLabel>
            <Select
              labelId="hours-label"
              id="hours"
              value={borrowedDurationHours}
              onChange={(e) => setBorrowedDurationHours(Number(e.target.value))}
              label="Hours"
              disabled={formValues.returnStatus === "Overdue"}
            >
              {Array.from({ length: 25 }, (_, i) => (
                <MenuItem key={i} value={i}>
                  {i} hour{i !== 1 ? 's' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Minutes Dropdown */}
          <FormControl fullWidth>
            <InputLabel id="minutes-label">Minutes</InputLabel>
            <Select
              labelId="minutes-label"
              id="minutes"
              value={borrowedDurationMinutes}
              onChange={(e) => setBorrowedDurationMinutes(Number(e.target.value))}
              label="Minutes"
              disabled={formValues.returnStatus === "Overdue"}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <MenuItem key={i} value={i}>
                  {i} minute{i !== 1 ? 's' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth>
          <InputLabel id="returnStatus">Return Status</InputLabel>
          <Select
            label="Return Status"
            name="returnStatus"
            value={formValues.returnStatus}
            onChange={handleChange}
            fullWidth
            disabled
            //disabled={formValues.returnStatus === "Completed"}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
            <MenuItem value="Partially Returned">Partially Returned</MenuItem>
            <MenuItem value="Extended">Extended</MenuItem>
            <MenuItem value="Transferred">Transferred</MenuItem>
          </Select>
        </FormControl>

          {/* Item Details Section */}
          <Typography className='editTransLabel'
          >Item Details</Typography>
          {formValues.items.map((item, index) => (
            <Box key={index} sx={{ marginBottom: 2 }}>
              <Typography className='editTransSubLabel'>
                Item {index + 1}
              </Typography>
              {item.isNew ? (
                // For new items, show only Barcode and Quantity Borrowed with Increment/Decrement buttons
                <>
                  <TextField
                    label="Item Barcode"
                    name={`itemBarcode_${index}`}
                    value={item.itemBarcode || ''}
                    onChange={(e) => handleItemChange(e, index)}
                    sx={{ marginBottom: 2 }}
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <TextField
                      label="Quantity to Borrow"
                      name={`quantityBorrowed_${index}`}
                      type="number"
                      value={item.quantityBorrowed || 0}
                      sx={{ marginRight: 1, flexGrow: 1 }}
                      onChange={(e) => handleItemChange(e, index)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={() => handleIncrement(index, 'quantityBorrowed')}
                      sx={{ marginRight: 1 }}
                    >
                      +
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleDecrement(index, 'quantityBorrowed')}
                      sx={{ marginRight: 1 }}
                    >
                      -
                    </Button>
                  </Box>
                </>
              ) : (
                // For existing items, show full details
                <>
                  <TextField
                    label="Item Name"
                    name={`itemName_${index}`}
                    value={item.itemName || ''}
                    sx={{ marginBottom: 2 }}
                    fullWidth
                    disabled
                  />
                  <TextField
                    label="Item Barcode"
                    name={`itemBarcode_${index}`}
                    value={item.itemBarcode || ''}
                    onChange={(e) => handleItemChange(e, index)}
                    sx={{ marginBottom: 2 }}
                    fullWidth
                    //disabled={item.quantityBorrowed === item.quantityReturned}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <TextField
                      label="Quantity Borrowed"
                      name={`quantityBorrowed_${index}`}
                      type="number"
                      value={item.quantityBorrowed || ''}
                      sx={{ marginRight: 1, flexGrow: 1 }}
                      onChange={(e) => handleItemChange(e, index)}
                      fullWidth
                      //disabled={item.quantityBorrowed === item.quantityReturned}
                    />
                    <Button
                      className='quantityTrans'
                      variant="outlined"
                      onClick={() => handleIncrement(index, 'quantityBorrowed')}
                      sx={{ marginRight: 1 }}
                      //disabled={item.quantityBorrowed >= item.quantity || item.quantityBorrowed === item.quantityReturned}

                    >
                      +
                    </Button>
                    <Button
                      className='quantityTrans'
                      variant="outlined"
                      onClick={() => handleDecrement(index, 'quantityBorrowed')}
                      sx={{ marginRight: 1 }}
                      //disabled={item.quantityBorrowed === item.quantityReturned}
                    >
                      -
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                    <TextField
                      label="Quantity Returned"
                      name={`quantityReturned_${index}`}
                      type="number"
                      value={item.quantityReturned || ''}
                      sx={{ marginRight: 1, flexGrow: 1 }}
                      onChange={(e) => handleItemChange(e, index)}
                      fullWidth
                      //disabled={item.quantityBorrowed === item.quantityReturned}
                    />
                    <Button
                      className='quantityTrans'
                      variant="outlined"
                      onClick={() => handleIncrement(index, 'quantityReturned')}
                      sx={{ marginRight: 1 }}
                      //disabled={item.quantityBorrowed === item.quantityReturned}
                    >
                      +
                    </Button>
                    <Button
                      className='quantityTrans'
                      variant="outlined"
                      onClick={() => handleDecrement(index, 'quantityReturned')}
                      sx={{ marginRight: 1 }}
                      //disabled={item.quantityBorrowed === item.quantityReturned}
                    >
                      -
                    </Button>
                  </Box>
                  
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="condition-label">Condition</InputLabel>
                    <Select
                      labelId="condition-label"
                      label="Condition"
                      name={`condition_${index}`}
                      value={item.condition || ''}  
                      onChange={(e) => handleItemChange(e, index)} // Handling changes on select
                    >
                      <MenuItem value="">None</MenuItem>  
                      <MenuItem value="Good">Good</MenuItem>
                      <MenuItem value="Damaged">Damaged</MenuItem>
                    </Select>
                  </FormControl>
  
                </>
              )}

               <Button
               className='removeItemTrans'
               variant="outlined"
               color="error"
               onClick={() => handleRemoveItem(index)}
             >
               Remove Item
             </Button>
            </Box>
          ))}

          {/* Add New Item Button */}
          <Button
            variant="outlined"
            className='addNewItemTrans'
            onClick={handleAddNewItem}
            sx={{ marginTop: 2 }}
          >
            Add New Item
          </Button>


        {/* Notes Section */}
        <Typography className='editTransLabel' >Other Concerns</Typography>
        <TextField
          label="Partial Return Reason"
          name="partialReturnReason"
          value={formValues.partialReturnReason || ''}
          onChange={handleChange}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="feedback-emoji-label">Feedback</InputLabel>
          <Select
            labelId="feedback-emoji-label"
            label="Feedback"
            id="feedback-emoji"
            name="feedbackEmoji"
            value={formValues.feedbackEmoji || ''}
            onChange={handleChange}
            
          >
            <MenuItem value="😍">😍 Loved it</MenuItem>
            <MenuItem value="😊">😊 Happy</MenuItem>
            <MenuItem value="😐">😐 Neutral</MenuItem>
            <MenuItem value="😕">😕 Confused</MenuItem>
            <MenuItem value="😡">😡 Angry</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Notes"
          name="notesComments"
          value={formValues.notesComments}
          onChange={handleChange}
          fullWidth
          multiline
          rows={2}
        />

        {/* Actions */}
        <Button variant="contained" className='saveEditTrans' onClick={() => setConfirmDialogOpen(true)}>
          Save Changes
        </Button>

        
      </Box>

       {/* Confirmation Dialog */}
       <Dialog open={dialogOpen} onClose={cancelRemoveItem}>
        <DialogTitle>Confirm Item Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelRemoveItem} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemoveItem} color="error">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save these changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSubmit(); // Proceed with the submit function
              setConfirmDialogOpen(false); // Close dialog after submission
            }}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </Drawer>  
  );
};

export default EditTransactionDrawer;
