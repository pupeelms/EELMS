import "./itemTable.scss";
import React, { useState, useEffect } from "react";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import axios from 'axios';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel } from '@mui/material';
import { imageBaseURL } from '../../config/axiosConfig';

export const ItemTable = () => {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openModal, setOpenModal] = React.useState(false);
  const [selectedFields, setSelectedFields] = React.useState([]);  // Track selected field names (strings)
  const [selectedLocation, setSelectedLocation] = React.useState('');  // Track the selected location
  const [locations, setLocations] = React.useState([]);  // Store unique locations
  const [searchTerm, setSearchTerm] = React.useState("");

  const navigate = useNavigate();

  const fields = [
    { label: 'Name', field: 'itemName' },
    { label: 'Item Barcode', field: 'itemBarcode' },
    { label: 'Category', field: 'category' },
    { label: 'Quantity', field: 'quantity' },
    { label: 'Location', field: 'location' },
    { label: 'Status', field: 'condition' },
    { label: 'Brand', field: 'brand' },
    { label: 'Model', field: 'model' },
    { label: 'Manufacturer', field: 'manufacturer' },
    { label: 'Serial Number', field: 'serialNumber' },
    { label: 'PUP Property Number', field: 'pupPropertyNumber' },
    { label: 'Specification', field: 'specification' },
    { label: 'Barcode Image', field: 'barcodeImage' },
    { label: 'Notes/Comments', field: 'notesComments' }
  ];

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('/api/items');
        setRows(response.data);

        const uniqueLocations = [...new Set(response.data.map(item => item.location))];
        setLocations(uniqueLocations);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching items:", err);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const columns = [
    { field: 'itemName', headerName: 'Name', minWidth: 200 },
    {
      field: 'image',
      headerName: 'Image',
      minWidth: 150,
      renderCell: (params) => {
        // Use params.value directly since it already contains the full image URL
        const imageUrl = params.value 
          ? params.value 
          : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg";
    
        return (
          <div className="table-cell-image">
            <img src={imageUrl} alt="item" className="item-image"  style={{ width: 'auto', height: '100%', objectFit: 'cover' }}  /> {/* Adjust styles as needed */}
          </div>
        );
      },
    },    
    {
      field: 'barcodeImage',
      headerName: 'Barcode',
      minWidth: 170,
      renderCell: (params) => {
        return params.value ? (
          <div className="table-cell-barcode">
            <img src={`data:image/png;base64,${params.value}`} alt="Barcode" className="item-barcode" />
          </div>
        ) : <p>No Barcode</p>;
      },
    },
    { field: 'category', headerName: 'Category', minWidth: 200, renderCell: (params) => params.row?.category?.categoryName || 'N/A' },
    { field: 'quantity', headerName: 'Quantity Left', minWidth: 130 },
    { field: 'location', headerName: 'Location', minWidth: 150 },
    { field: 'condition', headerName: 'Status', minWidth: 130 },
    {
      field: 'action',
      headerName: 'Action',
      width: 200,
      renderCell: (params) => (
        <Button className="viewItem" variant="outlined" color="primary" onClick={() => navigate(`/items/${params.row._id}`)}>
          View Details
        </Button>
      ),
    },
  ];

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const filteredRows = rows.filter((row) => {
    // Apply location filter if selected
    const matchesLocation = selectedLocation
      ? row.location?.toLowerCase().trim() === selectedLocation.toLowerCase().trim()
      : true;
  
    // Apply search term filter
    const matchesSearchTerm = searchTerm
      ? row.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.category && row.category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (row.location && row.location.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;
  
    return matchesLocation && matchesSearchTerm;  // Combine both filters
  })
  .sort((a, b) => a.itemName.localeCompare(b.itemName)); 
  

  const handleExport = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);
  const handleFieldChange = (fieldName) => {
    setSelectedFields(prev => prev.includes(fieldName)
      ? prev.filter(f => f !== fieldName)
      : [...prev, fieldName]
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // If checked, select all fields
      const allFieldNames = fields.map(field => field.field);
      setSelectedFields(allFieldNames); // Update selectedFields with all field names
    } else {
      // If unchecked, clear all selections
      setSelectedFields([]); // Clear selected fields
    }
  };

  // Export to Excel based on selected fields and location
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Items');
  
    // Add headers
    const headers = selectedFields.map((field) => {
      const matchingField = fields.find(f => f.field === field);
      return matchingField ? matchingField.label : field;
    });
    worksheet.addRow(headers);
  
    // Add data rows and barcode images
    filteredRows.forEach((row, rowIndex) => {
      const rowData = [];
      selectedFields.forEach((field, fieldIndex) => {
        if (field === 'barcodeImage' && row.barcodeImage) {
          // Placeholder for the image cell
          rowData.push(''); // Leave the cell blank for the image
        } else if (field === 'category') {
          rowData.push(row.category ? row.category.categoryName : 'N/A');
        } else {
          rowData.push(row[field] || 'N/A');
        }
      });
      worksheet.addRow(rowData);
  
      // Add barcode image if selected
      if (selectedFields.includes('barcodeImage') && row.barcodeImage) {
        const imageId = workbook.addImage({
          base64: `data:image/png;base64,${row.barcodeImage}`,
          extension: 'png',
        });
  
        const barcodeImageIndex = selectedFields.indexOf('barcodeImage') + 1; // +1 to match Excel 1-based index
  
        worksheet.addImage(imageId, {
          tl: { col: barcodeImageIndex - 1, row: rowIndex + 1 }, // Adjust index (rowIndex + 1 for zero-based row and col index)
          ext: { width: 100, height: 30 }, // Customize the size of the barcode image
        });
      }
    });
  
    // Write to file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ItemTableExport.xlsx';
    link.click();
  };

  const paginationModel = { page: 0, pageSize: 5 };

  return (
    <Paper className="itemTable" sx={{ width: '100%', overflow: 'hidden', height: '100%' }}>
      <div style={{ height: 520, width: '100%', display: 'flex', flexDirection: 'column' }}>
         
        <div className="export-controls" style={{ marginTop: '5px', marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
          <div className="location-filter">
            <label style={{ marginRight: '5px' }}>Filter by Location:</label>
            <select onChange={handleLocationChange} value={selectedLocation} style={{ padding: '5px', fontSize: '16px' }}>
              <option value="">All Locations</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

           {/* Search Bar */}
          <div className="search-bar" style={{ marginLeft: '20px', marginRight: '20px' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '4px 8px', fontSize: '14px', width: '200px', height: '28px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <Button className="export-item-button" onClick={handleExport} >
            EXPORT
          </Button>
        </div>

        <DataGrid
          rows={filteredRows}  // Use combined filtered rows here
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          loading={loading}
          getRowId={(row) => row._id}  // Use _id as the unique identifier
          style={{ flex: 1 }}
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

      <Dialog open={openModal} onClose={handleModalClose}>
        <DialogTitle>Select Fields to Export</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedFields.length === fields.length} // Check if all fields are selected
                onChange={handleSelectAll} // Call handleSelectAll on change
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
