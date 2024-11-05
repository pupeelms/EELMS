import React, { useState, useEffect } from "react";
import axios from "axios";
import "./preventiveMaintenance.scss"; // Link to external SCSS
import * as XLSX from "xlsx"; // For Excel export
import Swal from 'sweetalert2';

// Define possible statuses
const statusOptions = ["Pending", "Completed", "Skipped"];
const statusColors = {
  Pending: "#FFD580", // Orange for Pending
  Completed: "#A3D9A5", // Green for Completed
  Skipped: "#FFB3A7", // Red for Skipped
};

// Helper function to calculate weeks based on PM frequency
const getMaintenanceWeeks = (pmFrequency) => {
  const maintenanceWeeks = [];

  switch (pmFrequency) {
    case "Annually":
      maintenanceWeeks.push(5); // Only one maintenance for the entire year
      break;
    case "Quarterly":
      maintenanceWeeks.push(2, 15, 28, 41); // Maintenance at weeks 2, 15, 28, and 41
      break;
    case "Monthly":
        maintenanceWeeks.push(2, 7, 11, 15, 19, 24, 28, 33, 37, 41, 46, 50); // Every 4 weeks (roughly)
      break;
    case "Weekly":
      for (let i = 1; i <= 52; i++) {
        maintenanceWeeks.push(i); // Every week
      }
      break;
    case "Daily":
      for (let i = 1; i <= 52; i++) {
        maintenanceWeeks.push(i); // Every week
      }
      break;
    default:
      break;
  }

  return maintenanceWeeks;
};

const months = {
  JAN: { start: 1, end: 5 },
  FEB: { start: 6, end: 9 },
  MAR: { start: 10, end: 13 },
  APR: { start: 14, end: 17 },
  MAY: { start: 18, end: 22 },
  JUN: { start: 23, end: 26 },
  JUL: { start: 27, end: 31 },
  AUG: { start: 32, end: 35 },
  SEP: { start: 36, end: 39 },
  OCT: { start: 40, end: 44 },
  NOV: { start: 45, end: 48 },
  DEC: { start: 49, end: 52 },
};

const PreventiveMaintenance = () => {
  const [items, setItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [dynamicMonths, setDynamicMonths] = useState(months);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State to track search input
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/api/items");
        const filteredItems = response.data
          .filter((item) => item.pmNeeded === "Yes")
          .map(item => {
            // If maintenanceSchedule exists, use it; otherwise, create a default one
            if (!item.maintenanceSchedule) {
              item.maintenanceSchedule = Array.from({ length: 52 }, (_, index) => ({
                week: index + 1,
                status: index === 1 ? "Pending" : "Skipped" // Default statuses can be adjusted
              }));
            }
            return { ...item };
          });
        setItems(filteredItems);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    
  
    const fetchMonthlyRanges = async () => {
      try {
        const response = await axios.get("/api/pmTable"); // Make sure this endpoint returns the saved ranges
        setDynamicMonths(response.data.ranges); // Update state with fetched ranges
      } catch (error) {
        console.error("Error fetching monthly ranges:", error);
      }
    };
  
    fetchItems();
    fetchMonthlyRanges(); // Call the new function to fetch monthly ranges
  }, []);
  

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update the search term based on user input
  };

  const handleMonthRangeChange = (month, startOrEnd, value) => {
    setDynamicMonths((prevMonths) => ({
      ...prevMonths,
      [month]: {
        ...prevMonths[month],
        [startOrEnd]: parseInt(value, 10),
      },
    }));
  };

  const handleStatusChange = async (itemId, weekNumber, newStatus) => {
    console.log(`Updating status for item ${itemId} in week ${weekNumber} to ${newStatus}`);
    
    try {
        // Make API call to update status
        await axios.put(`/api/items/${itemId}/schedule/update`, {
            weekNumber,
            status: newStatus,
        });

        // Update local state without refetching all items
        setItems((prevItems) =>
            prevItems.map((item) => {
                if (item._id === itemId) {
                    return {
                        ...item,
                        maintenanceSchedule: item.maintenanceSchedule.map((week) => {
                            if (week.week === `Week ${weekNumber}`) {
                                return { ...week, status: newStatus }; // Update the status directly
                            }
                            return week;
                        }),
                    };
                }
                return item;
            })
        );
    } catch (err) {
        console.error("Error updating maintenance status:", err);
    }
};
  
  
   // New function to handle submitting the monthly ranges
   const handleSubmitRanges = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      await axios.post("/api/pmTable", {
        ranges: dynamicMonths,
      });
      
      setShowForm(false);
    } catch (error) {
      console.error("Error updating monthly ranges:", error);
      alert("Failed to update monthly ranges.");
    }
  };


  const renderMonthForm = () => (
    <form className="month-form" onSubmit={handleSubmitRanges}>
      {Object.keys(dynamicMonths).map((month) => (
        <div key={month} className="month-range-input">
          <label>{month}:</label>
          <input
            type="number"
            value={dynamicMonths[month].start}
            onChange={(e) => handleMonthRangeChange(month, 'start', e.target.value)}
          />
          <input
            type="number"
            value={dynamicMonths[month].end}
            onChange={(e) => handleMonthRangeChange(month, 'end', e.target.value)}
          />
        </div>
      ))}
       <button type="submit" className="monthRange">Update Ranges</button>
    </form>
  );

  const filteredItems = items
  .filter((item) => selectedLocation === "All" || item.location === selectedLocation)
  .filter((item) => {
    const itemNameMatch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const specificationMatch = item.specification.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = item.category?.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const pmFrequencyMatch = item.pmFrequency.toLowerCase().includes(searchTerm.toLowerCase());

    return itemNameMatch || specificationMatch || categoryMatch || pmFrequencyMatch;
  })
  .sort((a, b) => a.itemName.localeCompare(b.itemName));
  const locations = [...new Set(items.map((item) => item.location))];

  const showAlert = (specification) => {
    Swal.fire({
      title: 'Specification Details',
      text: specification,
      icon: null, // Remove the icon
      confirmButtonText: 'Close',
      width: '400px', // Set the width of the alert box (adjust as needed)
      customClass: {
        popup: 'custom-swal-popup', // You can add custom classes here
      },
      padding: '20px', // Optional: Add padding to the content
      showClass: {
        popup: '', // Disable show animation
      },
      hideClass: {
        popup: '', // Disable hide animation
      },
    });
  };

  const renderTable = () => (
    <table className="pm-table">
      <thead>
        <tr className="month-header">
          <th rowSpan={2}>Item Name</th>
          <th rowSpan={2}>Category</th>
          <th rowSpan={2}>Specification</th>
          <th rowSpan={2}>Location</th>
          <th rowSpan={2}>PM Frequency</th>
          {Object.keys(dynamicMonths).map((month) => (
            <th key={month} colSpan={dynamicMonths[month].end - dynamicMonths[month].start + 1}>
              {month}
            </th>
          ))}
        </tr>
        <tr className="week-header">
          {Array.from({ length: 52 }, (_, i) => (
            <th key={i + 1}>{i + 1}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredItems.map((item) => (
          <tr key={item._id}>
            <td>{item.itemName}</td>
            <td>{item.category?.categoryName || "N/A"}</td>
            <td 
              style={{ maxWidth: '150px', width: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
              onClick={() => showAlert(item.specification)} // Show custom alert on click
            >
              {item.specification}
            </td>
            <td>{item.location || "N/A"}</td>
            <td>{item.pmFrequency}</td>
            {Array.from({ length: 52 }, (_, weekIndex) => {
              const weekNumber = weekIndex + 1; // Week number (1-52)
              const weekData = item.maintenanceSchedule.find(week => week.week === `Week ${weekNumber}`);
              const currentStatus = weekData ? weekData.status : "N/A"; // Default to "N/A" if no data
  
              return (
                <td key={weekNumber}>
                  {currentStatus === "N/A" ? (
                    "-" // Display dash if current status is N/A
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <select
                        style={{ 
                          backgroundColor: statusColors[currentStatus], // Use current status for color
                          color: '#000', // Ensure text is readable
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px',
                          cursor: 'pointer'
                        }} 
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(item._id, weekNumber, e.target.value)}
                        title={`Current Status: ${currentStatus}`} // Tooltip for current status
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );


    // Function to export the maintenance schedule
    const exportToExcel = () => {
  const worksheetData = [];
  const headers = ['Item Name', 'Category', 'Specification', 'Location', 'PM Frequency'];

  // Calculate max weeks to determine how many columns to create
  const maxWeeks = 52; // Set to 52 weeks for weekly/monthly reporting

  // Add headers for each week
  for (let week = 1; week <= maxWeeks; week++) {
    headers.push(`Week ${week}`);
  }

  worksheetData.push(headers);

  items.forEach((item) => {
    const row = [
      item.itemName,
      item.category?.categoryName || "N/A",
      item.specification,
      item.location || "N/A",
      item.pmFrequency,
    ];

    // Create an array to hold the week statuses
    const weekStatuses = Array(maxWeeks).fill('-'); // Default all weeks to '-'

    // Get the maintenance schedule for the item
    const maintenanceSchedule = item.maintenanceSchedule || [];

    // Assign statuses based on the maintenance schedule
    maintenanceSchedule.forEach((weekData) => {
      const weekNumberString = weekData.week; // Get the week string (e.g., "Week 2")
      const weekNumber = parseInt(weekNumberString.replace("Week ", ""), 10); // Extract the week number

      const status = weekData.status; // Get the status
      if (weekNumber >= 1 && weekNumber <= maxWeeks) {
        weekStatuses[weekNumber - 1] = status; // Set the status for the corresponding week
      }
    });

    // Push statuses into the row
    row.push(...weekStatuses);
    worksheetData.push(row);
  });

  // Create a new workbook and add the data
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Schedule');

  // Export the workbook
  XLSX.writeFile(workbook, 'Maintenance_Schedule.xlsx');
};
  
  

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="preventiveMaintenance">
      <h3>Preventive Maintenance Schedule</h3>
      <div className="filter-export-container">
        <div className="location-filter">
          <label>Filter by Location: </label>
          <select onChange={handleLocationChange} value={selectedLocation}>
            <option value="All">All Locations</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="adjust-button">
          <button onClick={toggleForm}>
            {showForm ? "Hide Form" : "Adjust Month/Week Ranges"}
          </button>
        </div>

        <div className="export-button">
          <button onClick={exportToExcel}>EXPORT</button>
        </div>
      </div>

      {showForm && renderMonthForm()}

      <div className="pmtable-container">
        {renderTable()}
      </div>
    </div>
  );
};

export default PreventiveMaintenance;
