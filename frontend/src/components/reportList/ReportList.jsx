import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { CircularProgress, TextField, MenuItem, Select, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox } from '@mui/material';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import './reportList.scss';

const ReportsList = ({ itemId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State to manage delete confirmation dialog
  const [reportToDelete, setReportToDelete] = useState(null); // State to track the report ID to delete
  const [selectedIssue, setSelectedIssue] = useState(null); // State for selected issue text
  const [issueModalOpen, setIssueModalOpen] = useState(false); // State for controlling the modal visibility
  

  const fields = [
    { label: 'Item Name', field: 'itemName' },
    { label: 'Item Barcode', field: 'itemBarcode' },
    { label: 'Issue', field: 'issue' },
    { label: 'Reported By', field: 'reportedBy' },
    { label: 'Priority', field: 'priority' },
    { label: 'Status', field: 'status' },
    { label: 'Date Reported', field: 'date' }
  ];

  // Fetch reports for a specific item
  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log('Fetching reports...');
        const response = await axios.get(`/api/reports/all-report`);
        console.log('Reports fetched:', response.data);
        setReports(response.data);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Handle 404 error by setting reports to an empty array instead of setting an error message
          console.log('No reports found.');
          setReports([]);
        } else {
          console.error('Error fetching reports:', error.message);
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchReports();
  }, [itemId]);
  

  // Function to handle status change
  const handleStatusChange = async (event, reportId) => {
    const newStatus = event.target.value;
    try {
      await axios.put(`/api/reports/${reportId}/status`, { status: newStatus });
      const response = await axios.get(`/api/reports/all-report`);
      setReports(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openIssueModal = (issueText) => {
    setSelectedIssue(issueText); // Set the selected issue text
    setIssueModalOpen(true); // Open the modal
  };
  

// Open delete confirmation dialog
const handleDeleteReport = (reportId) => {
  setReportToDelete(reportId);
  setDeleteDialogOpen(true);
};

// Confirm deletion
const confirmDelete = async () => {
  try {
    if (reportToDelete) {
      await axios.delete(`/api/reports/reports/${reportToDelete}`);
      // Remove the deleted report from the reports state
      setReports((prevReports) => prevReports.filter(report => report._id !== reportToDelete));
    }
  } catch (error) {
    console.error('Error deleting report:', error);
  } finally {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  }
};


// Cancel deletion
const cancelDelete = () => {
  setDeleteDialogOpen(false);
  setReportToDelete(null);
};
    
  // Define columns for the DataGrid (including dropdown for status)
  const columns = [
    { field: 'date', headerName: 'Date Reported', width: 200 },
    { field: 'itemName', headerName: 'Item Name', width: 200 },
    { field: 'itemBarcode', headerName: 'Item Barcode', width: 200 },
    {
      field: 'issue',
      headerName: 'Issue',
      width: 300,
      renderCell: (params) => (
        <span
          onClick={() => openIssueModal(params.row.issue)} // Open modal with full issue text
          style={{ cursor: 'pointer', textDecoration: 'none' }} // Styling for clickable text
        >
          {params.row.issue.length > 50 ? `${params.row.issue.slice(0, 50)}...` : params.row.issue} {/* Display truncated text */}
        </span>
      ),
    },    
    { field: 'reportedBy', headerName: 'Reported By', width: 200 },
    { field: 'priority', headerName: 'Priority', width: 120 },
    { 
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => {
            const statusColor = {
                pending: 'orange',
                reviewed: 'blue',
                resolved: 'green',
            }[params.row.status] || 'black'; // Default color if status not found
            
            return (
                <Select
                    value={params.row.status}
                    onChange={(e) => handleStatusChange(e, params.row.id)}
                    className="statusSelect"
                    style={{ color: statusColor, fontSize: '0.95rem' }}  // Change text color based on status
                >
                    <MenuItem className='report-pending' value="pending" style={{ color: 'orange' }}>Pending</MenuItem>
                    <MenuItem className='report-reviewed' value="reviewed" style={{ color: 'blue' }}>Reviewed</MenuItem>
                    <MenuItem className='report-resolved' value="resolved" style={{ color: 'green' }}>Resolved</MenuItem>
                </Select>
            );
        },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          className='report-del-button'
          onClick={() => handleDeleteReport(params.row.id)}
        >
          Delete
        </Button>
      ),
    }, 
];


  // Transform the reports data to match the DataGrid structure
  const rows = reports
  .map((report) => ({
    id: report._id,
    itemName: report.itemId ? report.itemId.itemName : 'Item Deleted ', // Check for null
    itemBarcode: report.itemId ? report.itemId.itemBarcode : 'N/A', // Check for null
    issue: report.issue,
    reportedBy: report.reportedBy,
    priority: report.priority,
    status: report.status,
    rawDate: new Date(report.date), // Raw date used for sorting
    date: new Date(report.date).toLocaleString(), // Formatted date for display
  }))
  .sort((a, b) => b.rawDate - a.rawDate); // Sort by raw date, newest first


  // Filter the rows based on the search query
  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Render loading spinner or error message
  if (loading) return <CircularProgress className="circularProgress" />;
  if (error) return <p className="errorMessage">Error fetching reports: {error}</p>;

  // Export Functions
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRows.map((row) => {
        const data = {};
        selectedFields.forEach((field) => {
          data[field] = row[field] || 'N/A';
        });
        return data;
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");
    XLSX.writeFile(workbook, "ReportsExport.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("Reports Export", 14, 10);

    const data = filteredRows.map((row) => {
      return selectedFields.map((field) => row[field] || 'N/A');
    });

    doc.autoTable({
      head: [selectedFields],
      body: data,
      startY: 20,
    });

    doc.save("ReportsExport.pdf");
  };

  const handleExport = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);
  const handleFieldChange = (fieldName) => {
    setSelectedFields(prev => prev.includes(fieldName)
      ? prev.filter(f => f !== fieldName)
      : [...prev, fieldName]
    );
  };

  return (
    <div className="reportsTableContainer">
      {/* Title */}
      <h3 className="reportTitlee">Submitted Report</h3>
  
      {/* Search and Export Bar */}
      <div className="searchExportContainer">
        <TextField
          label="Search Reports"
          variant="outlined"
          margin="normal"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query as user types
          className="searchBar"
        />
  
        {/* Export Button */}
        <Button color="primary" onClick={handleExport} className="export-report-button">
          EXPORT
        </Button>
      </div>
  
      {/* DataGrid or No Reports Message */}
      {filteredRows.length > 0 ? (
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          getRowId={(row) => row.id} // Ensure each row has a unique id
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#d9d9d9', // Change the background color of the header
              color: '#59000f', // Change the text color
              fontSize: '16px', // Change the font size
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
          }}
        />
      ) : (
        <p className="noReportsMessage">No reports available</p>
      )}
  
      {/* Modal for selecting export fields */}
      <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Select Fields to Export</DialogTitle>
        <DialogContent>
          {fields.map((field) => (
            <FormControlLabel
              key={field.field}
              control={<Checkbox checked={selectedFields.includes(field.field)} onChange={() => handleFieldChange(field.field)} />}
              label={field.label}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { exportToExcel(); handleModalClose(); }} color="primary">Export to Excel</Button>
          <Button onClick={() => { exportToPDF(); handleModalClose(); }} color="secondary">Export to PDF</Button>
          <Button onClick={handleModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this report?</DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={issueModalOpen} onClose={() => setIssueModalOpen(false)}>
        <DialogTitle>Issue Details</DialogTitle>
        <DialogContent>
          <p>{selectedIssue}</p> {/* Display the selected issue text */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueModalOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
  
};

export default ReportsList;
