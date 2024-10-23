import "./singleTransaction.scss";
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
import { TableSortLabel } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";

const SingleTransaction = () => {
  const { userId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openRow, setOpenRow] = useState({});
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("dateTime");

  useEffect(() => {
    if (userId) { 
      fetchUserTransactions();
    }
  }, [userId]);

  const fetchUserTransactions = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching user transactions:', error.response ? error.response.data : error.message);
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
    setOpenRow((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "asc" : "desc");
    setOrderBy(property);
  };

  const calculateUniqueItemCount = (items) => {
    const uniqueItems = new Set(items.map(item => item.itemName));
    return uniqueItems.size;
  };

  const sortedTransactions = transactions.slice().sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    if (order === "asc") {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }} className="table">
        <Table stickyHeader aria-label="user transactions table">
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
                  active={orderBy === "borrowedDuration"}
                  direction={orderBy === "borrowedDuration" ? order : "asc"}
                  onClick={() => handleSortRequest("borrowedDuration")}
                >
                  Borrowed Duration
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
            {sortedTransactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction) => (
                <React.Fragment key={transaction._id}>
                  <TableRow hover>
                    <TableCell className="tableCell">
                      {new Date(transaction.dateTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="tableCell">{transaction.borrowedDuration}</TableCell>
                    <TableCell className="tableCell">
                      <span className={`type ${transaction.transactionType}`}>
                        {transaction.transactionType}
                      </span>
                    </TableCell>
                    <TableCell className="tableCell">
                      <span className={`status ${transaction.returnStatus}`}>
                        {transaction.returnStatus}
                      </span>
                    </TableCell>
                    <TableCell className="tableCell">
                      {calculateUniqueItemCount(transaction.items)} Item/s
                      <IconButton
                        size="small"
                        onClick={() => handleToggleRow(transaction._id)}
                      >
                        {openRow[transaction._id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                      <Collapse in={openRow[transaction._id]} timeout="auto" unmountOnExit>
                        <Table size="small" aria-label="items">
                          <TableBody>
                            <TableRow>
                              <TableCell colSpan={7}><strong>Items:</strong></TableCell>
                            </TableRow>
                            {transaction.items.map((item, index) => (
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
                              <TableCell>Course: {transaction.courseSubject}</TableCell>
                              <TableCell>Professor: {transaction.professor}</TableCell>
                              <TableCell>Prof Present? {transaction.profAttendance}</TableCell>
                              <TableCell>Room: {transaction.roomNo}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell colSpan={7}><strong>Other Concerns:</strong></TableCell>
                            </TableRow>
                              <TableCell>Partial Return Reason: {transaction.partialReturnReason}</TableCell> 
                              <TableCell>Feedback: {transaction.feedbackEmoji}</TableCell>


                          </TableBody>
                        </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 100]}
        component="div"
        count={transactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default SingleTransaction;
