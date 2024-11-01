import "./categoryTable.scss";
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { Checkbox, FormControlLabel } from '@mui/material';

export const CategoryTable = () => {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [updatedCategory, setUpdatedCategory] = React.useState({});
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedFields, setSelectedFields] = React.useState([]);
  const navigate = useNavigate();

  const fields = [
    { label: 'ID', field: '_id' },
    { label: 'Category Name', field: 'categoryName' },
    { label: 'Item Count', field: 'itemCount' },
  ];

  // Fetch categories from the backend
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/categories`);
        setRows(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleEditClick = (id) => {
    const category = rows.find(row => row._id === id);
    setSelectedCategory(id);
    setUpdatedCategory(category);
    setIsEditing(true);
  };

  const handleCloseDrawer = () => {
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setUpdatedCategory({ ...updatedCategory, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/categories/${selectedCategory}`, updatedCategory);
      setRows(rows.map(row => (row._id === selectedCategory ? updatedCategory : row)));
      handleCloseDrawer();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const filteredRows = rows
  .filter(row => 
    row.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => a.categoryName.localeCompare(b.categoryName)); 
  

  const handleDelete = (id) => {
    setSelectedCategory(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/categories/${selectedCategory}`);
      setRows(rows.filter(row => row._id !== selectedCategory));
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  const handleExport = () => setOpenModal(true);

  const handleModalClose = () => setOpenModal(false);

  const handleFieldChange = (fieldName) => {
    setSelectedFields(prev => prev.includes(fieldName)
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, "CategoryTableExport.xlsx");
  };

  const columns = [
    { field: '_id', headerName: 'ID', minWidth: 250 },
    { field: 'categoryName', headerName: 'Category Name', minWidth: 250 },
    { field: 'itemCount', headerName: 'Item Count', minWidth: 150 },
    {
      field: 'action',
      headerName: 'Action',
      width: 350,
      renderCell: (params) => (
        <div>
          <Button 
            className="view-button"
            variant="outlined"
            color="primary"
            onClick={() => navigate(`/categories/${params.row._id}`)}
          >
            View Details
          </Button>
          <Button
            className="edit-button"
            variant="outlined"
            color="secondary"
            onClick={() => handleEditClick(params.row._id)}
          >
            Edit
          </Button>
          <Button
            className="delete-button"
            variant="outlined"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper className="categoryTable">
      <div style={{ height: '520px', width: '100%' }}>

        {/* Search Bar */}
    <div className="search-cat-bar" style={{ marginBottom: '0px', marginLeft: '10px', padding: '10px' }}>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '4px 8px', fontSize: '14px', width: '200px', height: '30px', borderRadius: '4px', border: '1px solid #ccc' }}
      />

          <Button className="export-cat-button" onClick={handleExport} style={{ marginLeft: '20px', marginBottom: '7px' }}>
            Export
          </Button>

    </div>

    {/* DataGrid with filtered rows */}
    <div style={{ height: '400px', width: '100%' }}>

    <DataGrid
       rows={filteredRows}
       columns={columns}
       initialState={{ pagination: { paginationModel } }}
       pageSizeOptions={[5, 10, 20]}
       checkboxSelection
       loading={loading}
       getRowId={(row) => row._id}
       style={{ flex: 1 }}
       autoHeight={false} 
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
  </div>

      {/* Edit Drawer */}
      <Drawer
        anchor="right"
        open={isEditing}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: { width: { xs: '100%', sm: '400px' } },
        }}
      >
        <div className="drawerContent">
          <div className="drawerHeader">
            <h2>Edit Category</h2>
            <Button className="closeButton" onClick={handleCloseDrawer}>✖</Button>
          </div>
          <form className="editForm">
            <TextField
              label="Category Name"
              name="categoryName"
              value={updatedCategory.categoryName || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            
            <Button type="button" onClick={handleSave} color="primary">Save</Button>
          </form>
        </div>
      </Drawer>

       {/* Modal for selecting export fields */}
       <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Select Fields to Export</DialogTitle>
        <DialogContent>
          {fields.map((field) => (
            <FormControlLabel
              key={field.field}
              control={< Checkbox checked={selectedFields.includes(field.field)} onChange={() => handleFieldChange(field.field)} />}
              label={field.label}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { exportToExcel(); handleModalClose(); }} color="primary">Export to Excel</Button>
          <Button onClick={handleModalClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this category?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CategoryTable;
