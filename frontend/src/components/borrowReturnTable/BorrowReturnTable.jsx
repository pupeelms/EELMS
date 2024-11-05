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
import { TableSortLabel, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import axios from "axios";

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
      const updatedLog = {
        borrowedDuration: newDuration
      };
  
      const response = await axios.put(`/api/borrow-return/${selectedLog._id}/extend`, updatedLog);
  
      const updatedRows = rows.map(row => row._id === selectedLog._id ? { ...row, borrowedDuration: newDuration } : row);
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

  // Filter to get only today's transactions
  const todayRows = rows.filter(row => {
    const rowDate = new Date(row.dateTime).toISOString().split('T')[0];
    return rowDate === getTodayDate(); // Compare with today's date
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
                            className="button"
                            size="small"
                            onClick={() => handleExtendClick(row)}
                          >
                            <ExtensionOutlinedIcon />
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
                                <TableCell>Returned Date: {formatDate(row.returnDate)}</TableCell>
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

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DialogTitle>Extend Borrowed Duration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Duration"
            type="text"
            fullWidth
            variant="outlined"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            disabled={loading} // Disable input when loading
          />
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
