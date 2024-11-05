import "./categoryItems.scss";
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'; // Import Button for the View action

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

  const paginationModel = { page: 0, pageSize: 10 };

  return (
    <Paper sx={{ width: '100%', height: '600px', overflow: 'hidden' }}>
      {categoryName && ( // Display category name if available
        <Typography component="h2" sx={{ marginBottom: 'none', color: 'black', fontWeight: 'bold' }}>
          {categoryName}
        </Typography>
      )}
      <TextField
        variant="outlined"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
      />
      <div style={{ height: 'calc(100% - 100px)', width: '100%' }}> {/* Adjust the height */}
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
    </Paper>
  );
};

export default CategoryItems;
