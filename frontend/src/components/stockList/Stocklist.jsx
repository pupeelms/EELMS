import "./stockList.scss";
import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField'; // Import TextField for search input
import CircularProgress from '@mui/material/CircularProgress'; // Import CircularProgress for loading state
import { useNavigate } from 'react-router-dom';

const Stocklist = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [loadingOutOfStock, setLoadingOutOfStock] = useState(true);
  const [errorLowStock, setErrorLowStock] = useState("");
  const [errorOutOfStock, setErrorOutOfStock] = useState("");
  const [searchLowStock, setSearchLowStock] = useState(""); // State for low stock search
  const [searchOutOfStock, setSearchOutOfStock] = useState(""); // State for out of stock search
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get("/api/items/items/low-stock");
        setLowStockItems(response.data);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
        setErrorLowStock("Failed to fetch low stock items.");
      } finally {
        setLoadingLowStock(false);
      }
    };

    const fetchOutOfStockItems = async () => {
      try {
        const response = await axios.get("/api/items/items/out-of-stock");
        setOutOfStockItems(response.data);
      } catch (error) {
        console.error("Error fetching out of stock items:", error);
        setErrorOutOfStock("Failed to fetch out of stock items.");
      } finally {
        setLoadingOutOfStock(false);
      }
    };

    fetchLowStockItems();
    fetchOutOfStockItems();
  }, []);

  // Filter the low stock items based on search input
  const filteredLowStockItems = lowStockItems.filter(item =>
    item.itemName.toLowerCase().includes(searchLowStock.toLowerCase()) ||
    item.quantity.toString().includes(searchLowStock) // Filter by quantity
  );

  // Filter the out of stock items based on search input
  const filteredOutOfStockItems = outOfStockItems.filter(item =>
    item.itemName.toLowerCase().includes(searchOutOfStock.toLowerCase()) ||
    item.quantity.toString().includes(searchOutOfStock) // Filter by quantity
  );

  const lowStockColumns = [
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 0.5 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.75,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          className="view-stock"
          onClick={() => navigate(`/items/${params.row._id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const outOfStockColumns = [
    { field: 'itemName', headerName: 'Item Name', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.75,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          className="view-stock"
          onClick={() => navigate(`/items/${params.row._id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="stocklist-container">
      <div className="lowstocklist-column">
        <Paper elevation={3} className="paper">
          <h2>Low Stock Items</h2>
          <p className="stock-desc">Items that have a quantity of 2 or below.</p>
          <TextField 
            label="Search..." 
            variant="outlined" 
            size="small" 
            value={searchLowStock} 
            onChange={(e) => setSearchLowStock(e.target.value)} 
            style={{ marginBottom: '16px' }} // Spacing for the search bar
          />
          {loadingLowStock ? (
            <CircularProgress /> // Show loading spinner
          ) : errorLowStock ? (
            <p>{errorLowStock}</p> // Display error message
          ) : filteredLowStockItems.length === 0 ? (
            <p>No low stock items</p>
          ) : (
            <div className="table-wrapper">
              <DataGrid
                rows={filteredLowStockItems}
                columns={lowStockColumns}
                loading={loadingLowStock}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                checkboxSelection
                getRowId={(row) => row._id}
                autoHeight={false}
                style={{ flex: 1 }}
                disableExtendRowFullWidth
                disableColumnMenu
                sx={{
                  height: '600px',
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
          )}
        </Paper>
      </div>

      <div className="outstocklist-column">
        <Paper elevation={3} className="paper">
          <h2>Out of Stock Items</h2>
          <p className="stock-desc">Items that have a quantity of 0.</p>
          <TextField 
            label="Search..." 
            variant="outlined" 
            size="small" 
            value={searchOutOfStock} 
            onChange={(e) => setSearchOutOfStock(e.target.value)} 
            style={{ marginBottom: '16px' }} // Spacing for the search bar
          />
          {loadingOutOfStock ? (
            <CircularProgress /> // Show loading spinner
          ) : errorOutOfStock ? (
            <p>{errorOutOfStock}</p> // Display error message
          ) : filteredOutOfStockItems.length === 0 ? (
            <p>No out of stock items</p>
          ) : (
            <div className="table-wrapper">
              <DataGrid
                rows={filteredOutOfStockItems}
                columns={outOfStockColumns}
                loading={loadingOutOfStock}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } }
                }}
                checkboxSelection
                autoHeight={false}
                getRowId={(row) => row._id}
                disableColumnMenu
                sx={{
                  height: '600px',
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
          )}
        </Paper>
      </div>
    </div>
  );
};

export default Stocklist;
