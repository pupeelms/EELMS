import "./categoryItems.scss";
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'; // Import Button for the View action
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Checkbox, FormControlLabel } from '@mui/material';
import * as XLSX from 'xlsx';

const MessageRow = () => (
  <div className="no-data-message">
    <Typography>No items found for this category.</Typography>
  </div>
);

const CategoryItems = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredRows, setFilteredRows] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState(""); // State for category name
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedFields, setSelectedFields] = React.useState([]);

  // Define table columns
  const columns = [
    { field: 'itemBarcode', headerName: 'Barcode', minWidth: 170 },
    { field: 'itemName', headerName: 'Item Name', minWidth: 245 },
    { field: 'brand', headerName: 'Brand', minWidth: 180 },
    { field: 'model', headerName: 'Model', minWidth: 160 },
    { field: 'quantity', headerName: 'Quantity', minWidth: 115 },
    { field: 'condition', headerName: 'Condition', minWidth: 120 },
    { field: 'location', headerName: 'Location', minWidth: 130 },
    {
      field: 'action',
      headerName: 'Action',
      width: 180,
      renderCell: (params) => (
        <Button
          className="viewItem"
          variant="outlined"
          color="primary"
          onClick={() => navigate(`/items/${params.row._id}`)} // Navigate to item details
        >
          View Details
        </Button>
      ),
    },
  ];

  // Available fields for export
  const fields = [
    { label: 'Barcode', field: 'itemBarcode' },
    { label: 'Item Name', field: 'itemName' },
    { label: 'Brand', field: 'brand' },
    { label: 'Model', field: 'model' },
    { label: 'Quantity', field: 'quantity' },
    { label: 'Condition', field: 'condition' },
    { label: 'Location', field: 'location' },
  ];

  // Fetch item data from API
  const fetchItemsData = async () => {
    try {
      const response = await axios.get(`/api/items/category/${categoryId}`);
      setRows(response.data.length > 0 ? response.data : []); 
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching items in this category");
      setRows([]); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch category name from API
  const fetchCategoryName = async () => {
    try {
      const response = await axios.get(`/api/categories/${categoryId}`);
      setCategoryName(response.data.categoryName || "Unnamed Category");
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching category name");
    }
  };

  // Fetch data when component mounts or categoryId changes
  React.useEffect(() => {
    if (categoryId) {
      fetchCategoryName(); // Fetch category name
      fetchItemsData(); // Fetch items data
    } else {
      setError('Category ID is missing.');
      setLoading(false);
    }
  }, [categoryId]);

  // Filter rows based on the search query
  React.useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    setFilteredRows(
      rows.filter(row =>
        row.itemBarcode.toLowerCase().includes(lowerCaseQuery) ||
        row.itemName.toLowerCase().includes(lowerCaseQuery) ||
        row.brand.toLowerCase().includes(lowerCaseQuery) ||
        row.model.toLowerCase().includes(lowerCaseQuery) ||
        row.location.toLowerCase().includes(lowerCaseQuery) ||
        row.condition.toLowerCase().includes(lowerCaseQuery)
      )
    );
  }, [searchQuery, rows]);

  const handleExport = () => setOpenModal(true);

  const handleModalClose = () => setOpenModal(false);

  const handleFieldChange = (fieldName) => {
    setSelectedFields(prev =>
      prev.includes(fieldName)
        ? prev.filter(f => f !== fieldName)
        : [...prev, fieldName]
    );
  };

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "CategoryItems");
    XLSX.writeFile(workbook, "CategoryItemsExport.xlsx");
  };


  const paginationModel = { page: 0, pageSize: 10 };

  return (
    
    <Paper sx={{ width: '100%', height: '600px', overflow: 'hidden' }}>
      {categoryName && ( // Display category name if available
        <Typography component="h2" sx={{ marginBottom: 'none', color: 'black', fontWeight: 'bold' }}>
          {categoryName}
        </Typography>
      )}

      <div className="cat-item-container">
      <TextField
        variant="outlined"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        margin="normal"
        className="search-category"
      />

      <Button
        className="export-cat-Item-button"
        onClick={handleExport}
        style={{ marginBottom: '10px', color:'black', backgroundColor: '#b4b3b3' }}
      >
        Export
      </Button>
      </div>

      <div style={{ height: 'calc(100% - 115px)', width: '100%' }}> {/* Adjust the height */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 25, 50, 100]}
          checkboxSelection
          loading={loading}
          getRowId={(row) => row._id}
          autoHeight={false}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#d9d9d9',
              color: 'maroon',
              fontSize: '16px',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold',
            },
          }}
        />
      </div>
      {error && <div className="error-message">{error}</div>}

         <Dialog open={openModal} onClose={handleModalClose}>
  <DialogTitle>Select Fields to Export</DialogTitle>
  <DialogContent>
    <FormControlLabel
      control={
        <Checkbox
          checked={selectedFields.length === fields.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedFields(fields.map((field) => field.field)); // Select all fields
            } else {
              setSelectedFields([]); // Deselect all fields
            }
          }}
        />
      }
      label="Select All"
    />
    {fields.map((field) => (
      <FormControlLabel
        key={field.field}
        control={
          <Checkbox
            checked={selectedFields.includes(field.field)}
            onChange={() => handleFieldChange(field.field)}
          />
        }
        label={field.label}
      />
    ))}
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => {
        exportToExcel();
        handleModalClose();
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

export default CategoryItems;
