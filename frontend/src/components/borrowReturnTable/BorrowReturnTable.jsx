import "./borrowReturnTable.scss";
import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { TableSortLabel, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Drawer, Box, FormControl, Select, MenuItem } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
import EditTransactionDrawer from './EditTransactionDrawer';

const BorrowReturnTable = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRow, setOpenRow] = useState({});
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("dateTime");
  const [selectedLog, setSelectedLog] = useState(null);
  const [newDuration, setNewDuration] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedItems, setSelectedItems] = useState([]);
  const [transferMode, setTransferMode] = useState(false); 
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [newDurationValue, setNewDurationValue] = useState('');
  const [newDurationUnit, setNewDurationUnit] = useState('minute/s'); 


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/borrow-return"); // Your API endpoint for fetching logs
        setRows(response.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (transaction) => {
    console.log('Transaction details:', transaction); 
    setEditingTransaction(transaction);
  };
  const handleUpdate = async (id, updatedData) => {
    try {
      console.log('Updating transaction with ID:', id);
      console.log('Updated data:', updatedData);
  
      const response = await axios.put(`/api/borrow-return/update/${id}`, updatedData);
  
      if (response.status === 200) {
        console.log('Transaction updated successfully.');
  
        // Show an alert when the update is successful
        alert('Transaction updated successfully.');
  
        // Close the editing drawer after user clicks "OK" on the alert
        setEditingTransaction(null);
  
      } else {
        alert(`Error: Could not update transaction. ${response.data.message || ''}`);
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
  
      if (error.response && error.response.data.message) {
        // Show an error message but do not close the drawer
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('An unexpected error occurred while updating the transaction.');
      }
    }
  };
  
  

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Only the date part in YYYY-MM-DD format
  };

  // Function to format the date
  const formatDate = (dateString) => {
    // Check if the dateString is provided and valid
    if (!dateString || isNaN(Date.parse(dateString))) {
        return ''; // Return an empty string if no date or invalid date
    }
    
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    };
    return new Date(dateString).toLocaleString('en-US', options);
};


  const handleExtendClick = (log) => {
    setSelectedLog(log);
    setNewDuration(log.borrowedDuration);
    setIsModalOpen(true);
  };

  const handleSaveDuration = async () => {
    setLoading(true); // Start loading
    try {
      // Log the current values of newDurationValue and newDurationUnit
      console.log("New Duration Value:", newDurationValue);
      console.log("New Duration Unit:", newDurationUnit);
      
      // Combine the value and unit into a single string
      const combinedDuration = `${newDurationValue} ${newDurationUnit}`;
      console.log("Combined Duration:", combinedDuration); // Log the combined duration
  
      const updatedLog = {
        borrowedDuration: combinedDuration // Use the combined duration
      };
  
      const response = await axios.put(`/api/borrow-return/${selectedLog._id}/extend`, updatedLog);
      console.log("API Response:", response.data); // Log the response
  
      // Update the rows with the new combined duration
    const updatedRows = rows.map(row => {
      // Log the current row before updating
      if (row._id === selectedLog._id) {
        console.log("Current Row Before Update:", row);
      }
      return row._id === selectedLog._id ? { ...row, borrowedDuration: combinedDuration } : row;
    });

      setRows(updatedRows);
  
      setIsModalOpen(false);
      setSelectedLog(null);
    } catch (error) {
      console.error("Error updating duration:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleToggleRow = (id) => {
    setOpenRow(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Helper function to get today's date in Philippine Time (UTC+8)
  function getTodayDatePH() {
    const today = new Date();
    // Offset the date to UTC+8 by adding 8 hours in milliseconds
    const offsetToday = new Date(today.getTime() + 8 * 60 * 60 * 1000);
    return offsetToday.toISOString().split('T')[0];
  }

  // Filter to get only today's transactions in Philippine Time
  const todayRows = rows.filter(row => {
    const rowDate = new Date(new Date(row.dateTime).getTime() + 8 * 60 * 60 * 1000)
                          .toISOString()
                          .split('T')[0];
    return rowDate === getTodayDatePH(); // Compare with today's date in PH Time
  });


  // Filter rows based on the search term
  const filteredRows = todayRows.filter(row => {
    return (
      row.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(row.dateTime).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.borrowedDuration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.returnStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.roomNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.courseSubject.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (row.items && row.items.some(item => item.itemName.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (row.items && row.items.some(item => item.itemBarcode.toLowerCase().includes(searchTerm.toLowerCase()))) 
    );
  });

  const sortedRows = todayRows.slice().sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    return order === "asc" ? (aValue < bValue ? -1 : 1) : (aValue > bValue ? -1 : 1);
  });
 
  const calculateUniqueItemCount = (items) => {
    const itemsArray = items || [];
    return new Set(itemsArray.map(item => item.itemName)).size;
  }

  const handleCheckboxChange = (item, transactionId) => {
    const itemData = { 
      itemBarcode: item.itemBarcode,
      itemName: item.itemName, 
      transactionId: transactionId, 
      quantityBorrowed: item.quantityBorrowed // Add quantityBorrowed
    };
  
    // Log itemData to verify its contents
    console.log("Item Data:", itemData);
  
    setSelectedItems((prevSelected) => {
      if (prevSelected.some((selectedItem) => selectedItem.itemBarcode === item.itemBarcode)) {
        return prevSelected.filter((selectedItem) => selectedItem.itemBarcode !== item.itemBarcode);
      } else {
        return [...prevSelected, itemData];
      }
    });
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog without submitting
  };

  const handleConfirmTransfer = async () => {
    setIsLoading(true); 
  
    // Prepare the data to be sent to the backend
    const transferData = {
      items: selectedItems,
      transactionId: selectedItems[0].transactionId, // Assuming all selected items share the same transactionId
    };
  
    // Log the entire transferData object and its fields
    console.log("Sending the following to the backend:", transferData);
    console.log("Items:", selectedItems);
    console.log("Transaction ID:", selectedItems[0].transactionId);
  
    try {
      // Use Axios to send a PUT request
      const response = await axios.put(
        `/api/borrow-return/transfer/${transferData.transactionId}`,
        transferData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        console.log('Transfer successful:', response.data);
        alert('The item has been successfully transferred and is now available for borrowing.'); 
  
        setOpenDialog(false); // Close dialog on success
        setSelectedItems([]); // Clear selected items after submission
      } else {
        console.error('Error submitting transfer:', response.data);
      }
    } catch (error) {
      if (error.response) {
        console.error('Error submitting transfer:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    } finally {
      setIsLoading(false); // Reset loading state after the request completes
    }
  };
  

  const handleTransferClickInternal = () => {
    // Toggle the transfer mode
    setTransferMode((prevTransferMode) => {
      const newTransferMode = !prevTransferMode;
      
      // If cancelling transfer, reset selected items
      if (!newTransferMode) {
        setSelectedItems([]); // Clear the selected checkboxes
      }
      
      return newTransferMode;
    });
  };
  

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
       <TextField
        variant="outlined"
        placeholder="Search..."
        fullWidth
        margin="normal"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer sx={{ maxHeight: 450 }} className="table">
        <Table stickyHeader aria-label="borrow-return logs table">
          <TableHead>
            <TableRow>
              <TableCell className="column">
                <TableSortLabel
                  active={orderBy === "dateTime"}
                  direction={orderBy === "dateTime" ? order : "asc"}
                  onClick={() => handleSortRequest("dateTime")}
                >
                  Date & Time
                </TableSortLabel>
              </TableCell>
              <TableCell className="column">
                <TableSortLabel
                  active={orderBy === "userName"}
                  direction={orderBy === "userName" ? order : "asc"}
                  onClick={() => handleSortRequest("userName")}
                >
                  User Name
                </TableSortLabel>
              </TableCell>
              <TableCell className="column">
                <TableSortLabel
                  active={orderBy === "transactionType"}
                  direction={orderBy === "transactionType" ? order : "asc"}
                  onClick={() => handleSortRequest("transactionType")}
                >
                  Transaction Type
                </TableSortLabel>
              </TableCell>
              <TableCell className="column">
                <TableSortLabel
                  active={orderBy === "borrowedDuration"}
                  direction={orderBy === "borrowedDuration" ? order : "asc"}
                  onClick={() => handleSortRequest("borrowedDuration")}
                >
                  Borrowed Duration
                </TableSortLabel>
              </TableCell>
              <TableCell className="column">
                <TableSortLabel
                  active={orderBy === "returnStatus"}
                  direction={orderBy === "returnStatus" ? order : "asc"}
                  onClick={() => handleSortRequest("returnStatus")}
                >
                  Return Status
                </TableSortLabel>
              </TableCell>
              <TableCell className="column">Items Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length > 0 ? (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <React.Fragment key={row._id}>
                    <TableRow hover>
                      <TableCell className="tableCell">
                        {new Date(row.dateTime).toLocaleString()}
                      </TableCell>
                      <TableCell className="tableCell">{row.userName}</TableCell>

                      <TableCell className="tableCell">
                        <span className={`type ${row.transactionType}`}>
                          {row.transactionType}
                        </span>
                      </TableCell>
                      
                      <TableCell className="tableCell">
                        {row.borrowedDuration}
                        {row.dueDate && !isNaN(new Date(row.dueDate).getTime()) && (
                          ` | Due: ${new Date(row.dueDate).toLocaleTimeString()}`
                        )}
                      </TableCell>

                      <TableCell className="tableCell">
                        <span
                          className={`status ${row.returnStatus}`}
                          style={{ cursor: 'pointer' }}
                        >
                          {row.returnStatus}
                          {row.returnStatus === 'Overdue' && (
                            <IconButton
                            className="extendButton"
                            size="small"
                            onClick={() => handleExtendClick(row)}
                          >
                            <AddIcon />
                          </IconButton>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="tableCell">
                        {calculateUniqueItemCount(row.items || [])} Item/s
                        <IconButton
                          size="small"
                          onClick={() => handleToggleRow(row._id)}
                        >
                          {openRow[row._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                        <Collapse in={openRow[row._id]} timeout="auto" unmountOnExit>
                          <Table size="small" aria-label="items">
                            <TableBody>
                              {/* Items header row */}
                              <TableRow>
                                <TableCell colSpan={7}>
                                  <strong>Items:</strong>
                                </TableCell>
                            <TableCell colSpa={7} className="buttonTransactions">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    className="editTransaction"
                                    onClick={() => handleEdit(row)}
                                    //style={{ marginLeft: '5px' }}
                                  >
                                    Edit
                                  </Button>

                                  {row.transactionType === 'Borrowed' && ( // Check if transactionType is 'Borrowed'
                                    <div>
                                      <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleTransferClickInternal} // Use the function to handle both toggle and reset
                                        className="transferButton"
                                        style={{ marginRight: '8px' }}
                                      >
                                        {transferMode ? 'Cancel' : 'Transfer'}
                                      </Button>
                                      {selectedItems.length > 0 && (
                                        <Button
                                          variant="outlined"
                                          color="success"
                                          onClick={() => setOpenDialog(true)} // Open dialog on click
                                          className="submitTransferButton"
                                        >
                                          Submit Transfer
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>

                              {/* Loop through items in the row */}
                              {row.items && row.items.map((item, index) => (
                                <TableRow key={index}>
                                  {transferMode && (
                                    <TableCell>
                                      {row.transactionType === 'Borrowed' && (
                                        <input
                                          type="checkbox"
                                          className="checkboxTransfer"
                                          onChange={() => {
                                            console.log('Row (Transaction Details):', row);
                                            handleCheckboxChange(item, row._id); // Pass the full item object and transactionId
                                          }}
                                          checked={selectedItems.some((selectedItem) => selectedItem.itemBarcode === item.itemBarcode)} // Check against itemBarcode
                                        />
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell>Item Name: {item.itemName}</TableCell>
                                  <TableCell>Barcode: {item.itemBarcode}</TableCell>
                                  <TableCell>Borrowed: {item.quantityBorrowed}</TableCell>
                                  <TableCell>Returned: {item.quantityReturned}</TableCell>
                                  <TableCell colSpan={10}>Condition: {item.condition}</TableCell> 
                                </TableRow>
                              ))}

                              {/* Other details row */}
                              <TableRow>
                                <TableCell colSpan={10}><strong>Other Details:</strong></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Returned Date: {formatDate(row.returnDate)}</TableCell>
                                <TableCell>Course: {row.courseSubject}</TableCell>
                                <TableCell>Professor: {row.professor}</TableCell>
                                <TableCell>Prof Present? {row.profAttendance}</TableCell>
                                <TableCell colSpan={10}>Room: {row.roomNo}</TableCell>                  
                              </TableRow>

                              {/* Other concerns row */}
                              <TableRow>
                                <TableCell colSpan={10}><strong>Other Concerns:</strong></TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Notes: {row.notesComments}</TableCell>
                                <TableCell>Partial Return Reason: {row.partialReturnReason}</TableCell> 
                                <TableCell>Feedback: {row.feedbackEmoji}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>

                  </React.Fragment>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No transactions for today.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <EditTransactionDrawer
        open={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onUpdate={handleUpdate}
      />

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Transfer</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to submit the transfer with the following item/s?</p><br />

          <ul>
            {selectedItems.map((item, index) => (
              <li key={index}>
                {item.itemName} - {item.quantityBorrowed} pc/s
              </li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmTransfer} 
            color="primary" 
            disabled={isLoading}  // Disable the button while loading
          >
            {isLoading ? 'Loading...' : 'Confirm'}  {/* Display Loading... if isLoading is true */}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Extend Borrowed Duration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="New Duration"
              type="number"
              value={newDurationValue} // Use a separate state for the value
              onChange={(e) => setNewDurationValue(e.target.value)} // Update the state for the value
              disabled={loading} // Disable input when loading
            />
            <FormControl fullWidth sx={{ marginTop: 1 }}>
              <Select
                value={newDurationUnit} // Use a separate state for the unit
                onChange={(e) => setNewDurationUnit(e.target.value)} // Update the state for the unit
                disabled={loading} // Disable select when loading
              >
                <MenuItem value="minute/s">minute/s</MenuItem>
                <MenuItem value="hour/s">hour/s</MenuItem>
              </Select>
            </FormControl>
          </Box>
  {loading && <Typography variant="body2" color="textSecondary">Loading...</Typography>} {/* Show Loading */}
</DialogContent>
        <DialogActions>
        <Button onClick={() => setIsModalOpen(false)} disabled={loading}>Cancel</Button>
        <Button onClick={handleSaveDuration} disabled={loading}>
            {loading ? "Processing..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default BorrowReturnTable;
