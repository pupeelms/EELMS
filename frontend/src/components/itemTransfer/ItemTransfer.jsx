import React, { useState } from 'react';
// import { useHistory } from 'react-router-dom'; // For redirection
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';

const ItemTransfer = ({ items, logID, userID }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle checkbox change for multiple item transfers
  const handleCheckboxChange = (itemBarcode) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemBarcode)
        ? prevSelectedItems.filter((barcode) => barcode !== itemBarcode)
        : [...prevSelectedItems, itemBarcode]
    );
  };

  // Handle transfer submission for multiple items
  const handleTransferSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Filter the items based on the selected barcodes
      const itemsToTransfer = items.filter(item => selectedItems.includes(item.itemBarcode));
      
      // Send the request to transfer the selected items
      const response = await axios.put(`/api/borrow-return/transfer/${logID}`, {
        userID,
        items: itemsToTransfer
      });

      // On successful transfer, close the dialog and reset selections
      alert(response.data.message); // Show success message
      setOpenDialog(false);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error transferring items:', error);
      alert('Error transferring items');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there is only one item, proceed with transfer automatically
  const handleSingleItemTransfer = () => {
    const item = items[0]; // There's only one item, transfer it automatically
    openConfirmationDialog(item);
  };

  // Open confirmation dialog for item transfer
  const openConfirmationDialog = (item) => {
    setOpenDialog(true);
    setSelectedItems([item.itemBarcode]); // Select the item automatically for the dialog
  };

  // Close the confirmation dialog
  const closeConfirmationDialog = () => {
    setOpenDialog(false);
  };

  return (
    <div>
      {/* If only one item, automatically transfer */}
      {items.length === 1 ? (
        <button onClick={handleSingleItemTransfer}>Transfer Item</button>
      ) : (
        // If there are multiple items, show checkboxes for selection
        <div>
          <button onClick={() => openConfirmationDialog()}>Transfer</button>
          {items.map(item => (
            <FormControlLabel
              key={item.itemBarcode}
              control={<Checkbox checked={selectedItems.includes(item.itemBarcode)} onChange={() => handleCheckboxChange(item.itemBarcode)} />}
              label={item.itemName}
            />
          ))}
        </div>
      )}

      {/* Transfer Confirmation Dialog */}
      <Dialog open={openDialog} onClose={closeConfirmationDialog}>
        <DialogTitle>Confirm Transfer</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to transfer the selected items?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmationDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleTransferSubmit}
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ItemTransfer;
