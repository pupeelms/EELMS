import "./categoryItems.scss";
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';

// Function to display a message row
const MessageRow = () => (
  <div className="no-data-message">
    <Typography>No items found for this category.</Typography>
  </div>
);

const CategoryItems = () => {
  const { categoryId } = useParams();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Define table columns
  const columns = [
    { field: 'itemBarcode', headerName: 'Barcode', minWidth: 170},
    { field: 'itemName', headerName: 'Item Name', minWidth: 245 },
    { field: 'brand', headerName: 'Brand', minWidth: 180 },
    { field: 'model', headerName: 'Model', minWidth: 180 },
    { field: 'quantity', headerName: 'Quantity', minWidth: 115 },
    { field: 'condition', headerName: 'Condition', minWidth: 120 },
    { field: 'location', headerName: 'Location', minWidth: 185 },
  ];

  // Fetch item data from API
  const fetchData = async () => {
    try {
      console.log('Making API request to:', `/api/items/category/${categoryId}`);
      const response = await axios.get(`/api/items/category/${categoryId}`);

      if (response.data.length === 0) {
        setRows([]); // Set rows to empty array to trigger no data message
      } else {
        setRows(response.data);
      }
    } catch (error) {
      console.error("Error fetching items in this category:", error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || "Error fetching items in this category");
      setRows([]); // Ensure rows are empty on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or categoryId changes
  React.useEffect(() => {
    console.log('categoryId:', categoryId); // Debugging
    if (categoryId) {
      fetchData();
    } else {
      console.error('Category ID is not defined');
      setError('Category ID is missing.');
      setLoading(false);
    }
  }, [categoryId]);

  // Pagination settings
  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', height: '100%' }}>
      <div style={{ height: "auto", width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          paginationModel={paginationModel}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          loading={loading}
          getRowId={(row) => row._id}
          components={{
            NoRowsOverlay: () => (
              rows.length === 0 ? <MessageRow /> : <></> // Display the message row if no data
            )
          }}
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#d9d9d9', // Change the background color of the header
              color: 'maroon', // Change the text color
              fontSize: '16px', // Change the font size
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
