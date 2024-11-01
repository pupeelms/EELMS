import "./archiveBorrowReturn.scss";
import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { IconButton, Collapse, TextField, TableSortLabel, Button, Tooltip } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import axios from "axios";

const ArchiveBorrowReturn = () => {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25); // Longer table by default
  const [searchTerm, setSearchTerm] = useState("");
  const [openRow, setOpenRow] = useState({});
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("dateTime");
  const [openModal, setOpenModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]); // Track selected fields

  // New state variables for date filtering
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

// List of fields available for selection
const fields = [
  { label: 'Date', field: 'dateTime' }, // Matches 'dateTime' in schema
  { label: 'Borrower Name', field: 'userName' }, // Matches 'userName'
  { label: 'Contact Number', field: 'contactNumber' }, // Matches 'contactNumber'
  { label: 'Course', field: 'courseSubject' }, // Matches 'courseSubject'
  { label: 'Professor', field: 'professor' }, // Matches 'professor'
  { label: 'Professor Attendance', field: 'profAttendance' }, // Matches 'profAttendance'
  { label: 'Room', field: 'roomNo' }, // Matches 'roomNo'
  { label: 'Borrowed Duration', field: 'borrowedDuration' }, // Matches 'borrowedDuration'
  { label: 'Extended Duration', field: 'extendedDuration' }, // Matches 'extendedDuration'
  { label: 'Due Date', field: 'dueDate' }, // Matches 'dueDate'
  { label: 'Transaction Type', field: 'transactionType' }, // Matches 'transactionType'
  { label: 'Return Status', field: 'returnStatus' }, // Matches 'returnStatus'
  { label: 'Return Date', field: 'returnDate' }, // Matches 'returnDate'
  { label: 'Feedback', field: 'feedbackEmoji' }, // Matches 'feedbackEmoji'
  { label: 'Partial Return Reason', field: 'partialReturnReason' }, // Matches 'partialReturnReason'
  { label: 'Notes/Comments', field: 'notesComments' }, // Matches 'notesComments'
  // { label: 'Reminder Sent', field: 'reminderSent' }, // Matches 'reminderSent'
  { label: 'Item Barcode', field: 'items.itemBarcode' }, // Inside 'items', matches 'itemBarcode' for each item
  { label: 'Item Name', field: 'items.itemName' }, // Inside 'items', matches 'itemName'
  { label: 'Quantity Borrowed', field: 'items.quantityBorrowed' }, // Inside 'items', matches 'quantityBorrowed'
  { label: 'Quantity Returned', field: 'items.quantityReturned' }, // Inside 'items', matches 'quantityReturned'
  { label: 'Condition', field: 'items.condition' }, // Inside 'items', matches 'condition' for each item
];



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/borrow-return");
        setRows(response.data);
      } catch (error) {
        console.error("Error fetching logs:", error);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // If checked, select all fields
      const allFieldNames = fields.map((field) => field.field); // Get all field names
      setSelectedFields(allFieldNames); // Update selectedFields with all field names
    } else {
      // If unchecked, clear all selections
      setSelectedFields([]); // Clear selected fields
    }
  };  

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleToggleRow = (id) => {
    setOpenRow((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);

  const handleFieldChange = (field) => {
    setSelectedFields(prev => prev.includes(field)
      ? prev.filter(f => f !== field)
      : [...prev, field]
    );
  };

  const filterAndGroupByDate = () => {
    const filteredRows = rows.filter((row) => {
      const searchTermLower = searchTerm.toLowerCase();
      const rowDate = new Date(row.dateTime);

      // Search by userName, transactionType, returnStatus, or date
      const matchesUserName = row.userName.toLowerCase().includes(searchTermLower);
      const matchesTransactionType = row.transactionType.toLowerCase().includes(searchTermLower);
      const matchesReturnStatus = row.returnStatus.toLowerCase().includes(searchTermLower);
      const matchesDate = rowDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).toLowerCase().includes(searchTermLower);

      // Filter by date range
      const matchesDateRange =
        (!startDate || rowDate >= new Date(startDate)) &&
        (!endDate || rowDate <= new Date(endDate));

      return (matchesUserName || matchesTransactionType || matchesReturnStatus || matchesDate) && matchesDateRange;
    });

    // Sort the filtered rows by the selected column and order
    const sortedFilteredRows = filteredRows.sort((a, b) => {
      if (orderBy === "dateTime") {
        return order === "asc"
          ? new Date(a.dateTime) - new Date(b.dateTime)
          : new Date(b.dateTime) - new Date(a.dateTime);
      } else if (orderBy === "userName") {
        return order === "desc"
          ? a.userName.localeCompare(b.userName)
          : b.userName.localeCompare(a.userName);
      } else if (orderBy === "transactionType") {
        return order === "desc"
          ? a.transactionType.localeCompare(b.transactionType)
          : b.transactionType.localeCompare(a.transactionType);
      } else if (orderBy === "returnStatus") {
        return order === "desc"
          ? a.returnStatus.localeCompare(b.returnStatus)
          : b.returnStatus.localeCompare(a.returnStatus);
      }
      return 0;
    });

    // Group the sorted rows by date
    const groupedRows = sortedFilteredRows.reduce((acc, row) => {
      const dateKey = new Date(row.dateTime).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(row);
      return acc;
    }, {});
    
    return groupedRows;
  };

  const sortedRows = filterAndGroupByDate();

  const calculateUniqueItemCount = (items) => {
    const itemsArray = items || [];
    return new Set(itemsArray.map((item) => item.itemName)).size;
  };

 // Utility function to format the date in 'MM/DD/YYYY HH:mm' format
const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // 24-hour format
  });
};

const exportToExcel = () => {
  if (selectedFields.length === 0) {
    alert("Please select at least one field to export.");
    return;
  }

// Helper function to format duration from milliseconds into a human-readable format
const formatDuration = (millis) => {
  const seconds = millis / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours)} hours`;
  } else {
    return `${Math.round(days)} days`;
  }
};

  const filteredRows = Object.values(sortedRows).flat(); // Flatten the grouped data
  const worksheet = XLSX.utils.json_to_sheet(
    filteredRows.map((row) => {
      const data = {};
      selectedFields.forEach((field) => {
        switch (field) {
          case 'items.itemBarcode':
            data['Item Barcode'] = row.items && row.items.map(item => item.itemBarcode).join(', ') || 'N/A';
            break;
          case 'items.itemName':
            data['Item Name'] = row.items && row.items.map(item => item.itemName).join(', ') || 'N/A';
            break;
          case 'items.quantityBorrowed':
            data['Quantity Borrowed'] = row.items && row.items.map(item => item.quantityBorrowed).join(', ') || 0;
            break;
          case 'items.quantityReturned':
            data['Quantity Returned'] = row.items && row.items.map(item => item.quantityReturned).join(', ') || 0;
            break;
          case 'items.condition':
            data['Condition'] = row.items && row.items.map(item => item.condition).join(', ') || 'N/A';
            break;
          case 'dateTime':
            data['Date Time'] = row.dateTime ? formatDateTime(row.dateTime) : 'N/A'; // Format date
            break;
          case 'dueDate':
            data['Due Date'] = row.dueDate ? formatDateTime(row.dueDate) : 'N/A'; // Format due date
            break;
          case 'returnDate':
            data['Return Date'] = row.returnDate ? formatDateTime(row.returnDate) : 'N/A'; // Format return date
            break;
          case 'extendedDuration':
            data['Extended Duration'] = row.extendedDuration ? formatDuration(row.extendedDuration) : 'N/A'; // Format extended duration
            break;
          default:
            data[field] = row[field] || 'N/A';
        }
      });
      return data;
    })
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "BorrowReturnRecords");
  XLSX.writeFile(workbook, "BorrowReturnRecords.xlsx");
};

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: "1rem"}}>
        {/* Date pickers for date range filtering */}
        <Tooltip>
        <label htmlFor="start-date">Start Date </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </Tooltip>
        <Tooltip>
        <label htmlFor="end-date">End Date </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </Tooltip>
        <Button 
          className="export-archive-button" 
          onClick={handleExport} 
          style={{ color: "black", backgroundColor: "#d9d9d9" }}>
          EXPORT
        </Button>
      </div>

      <TextField
        label="Search Transactions"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={handleSearch}
        value={searchTerm}
      />

      <TableContainer sx={{ maxHeight: 700 }} className="table">
        <Table stickyHeader aria-label="archive borrow-return logs table">
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
              <TableCell className="column">Return Status</TableCell>
              <TableCell className="column">Items Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sortedRows).map((date) => (
              <React.Fragment key={date}>
                <TableRow>
                  <TableCell colSpan={5} style={{ fontWeight: "bold" }}>
                    {date}
                  </TableCell>
                </TableRow>
                {sortedRows[date]
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <React.Fragment key={row._id}>
                      <TableRow hover>
                        <TableCell className="tableCell">
                          {new Date(row.dateTime).toLocaleString()}
                        </TableCell>
                        <TableCell className="tableCell">{row.userName}</TableCell>
                        <TableCell className="tableCell">{row.transactionType}</TableCell>
                        <TableCell className="tableCell">
                          <span className={`status ${row.returnStatus}`}>
                            {row.returnStatus}
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
                                <TableRow>
                                  <TableCell colSpan={7}><strong>Items:</strong></TableCell>
                                </TableRow>
                                {row.items && row.items.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>Item Name: {item.itemName}</TableCell>
                                    <TableCell>Barcode: {item.itemBarcode}</TableCell>
                                    <TableCell>Borrowed: {item.quantityBorrowed}</TableCell>
                                    <TableCell>Returned: {item.quantityReturned}</TableCell>
                                    <TableCell>Condition: {item.condition}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={7}><strong>Other Details:</strong></TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Course: {row.courseSubject}</TableCell>
                                  <TableCell>Professor: {row.professor}</TableCell>
                                  <TableCell>Prof Present? {row.profAttendance}</TableCell>
                                  <TableCell>Room: {row.roomNo}</TableCell> 
                                </TableRow>

                                <TableRow>
                                  <TableCell colSpan={7}><strong>Other Concerns:</strong></TableCell>
                                </TableRow>
                                  <TableCell>Partial Return Reason: {row.partialReturnReason}</TableCell> 
                                  <TableCell>Feedback: {row.feedbackEmoji}</TableCell>


                              </TableBody>
                            </Table>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

        <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Select Fields to Export</DialogTitle>
        <DialogContent>
          {/* Select All Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.length === fields.length} // Check if all fields are selected
                onChange={handleSelectAll} // Call handleSelectAll on change
              />
            }
            label="Select All"
          />

          {/* Individual Field Checkboxes */}
          {fields.map((field) => (
            <FormControlLabel
              key={field.field}
              control={
                <Checkbox
                  checked={selectedFields.includes(field.field)} // Check if this field is selected
                  onChange={() => handleFieldChange(field.field)} // Handle individual field changes
                />
              }
              label={field.label}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              exportToExcel(); // Export the selected fields to Excel
              handleModalClose(); // Close the modal
            }}
            color="primary"
          >
            Export to Excel
          </Button>
          <Button onClick={handleModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
  
    </Paper>
  );
};

export default ArchiveBorrowReturn;
