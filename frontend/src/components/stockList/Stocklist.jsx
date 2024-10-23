import "./stockList.scss";
import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

const Stocklist = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(true);
  const [loadingOutOfStock, setLoadingOutOfStock] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get("/api/items/items/low-stock");
        setLowStockItems(response.data);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
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
      } finally {
        setLoadingOutOfStock(false);
      }
    };

    fetchLowStockItems();
    fetchOutOfStockItems();
  }, []);

  // Define the columns for the DataGrid including the action column
  const lowStockColumns = [
    { field: 'itemName', headerName: 'Item Name', flex: 1 },  // flex for responsive width
    { field: 'quantity', headerName: 'Quantity', flex: 0.5 },  // smaller width
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.75,  // responsive action column
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
          {lowStockItems.length === 0 && !loadingLowStock ? (
            <p>No low stock items</p>
          ) : (
            <div className="table-wrapper">  {/* Add this wrapper */}
              <DataGrid
                rows={lowStockItems}
                columns={lowStockColumns}
                loading={loadingLowStock}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                getRowId={(row) => row._id}
                autoHeight
                disableExtendRowFullWidth
                disableColumnMenu
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    color: "#59000f", 
                    fontWeight: "bold",  
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
          {outOfStockItems.length === 0 && !loadingOutOfStock ? (
            <p>No out of stock items</p>
          ) : (
            <div className="table-wrapper">  {/* Add this wrapper */}
              <DataGrid
                rows={outOfStockItems}
                columns={outOfStockColumns}
                loading={loadingOutOfStock}
                pageSizeOptions={[5, 10, 20]}
                checkboxSelection
                getRowId={(row) => row._id}
                autoHeight
                
                disableColumnMenu
              />
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
};

export default Stocklist;
