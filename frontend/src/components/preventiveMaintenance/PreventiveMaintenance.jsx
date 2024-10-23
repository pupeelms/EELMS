import React, { useState, useEffect } from "react";
import axios from "axios";
import "./preventiveMaintenance.scss"; // Link to external SCSS
import * as XLSX from "xlsx"; // For Excel export

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
      maintenanceWeeks.push(1); // Only one maintenance for the entire year
      break;
    case "Quarterly":
      maintenanceWeeks.push(1, 14, 27, 40); // Maintenance at weeks 1, 14, 27, and 40
      break;
    case "Monthly":
      for (let i = 0; i < 52; i += 4) {
        maintenanceWeeks.push(i + 1); // Every 4 weeks (roughly)
      }
      break;
    case "Weekly":
      for (let i = 1; i <= 52; i++) {
        maintenanceWeeks.push(i); // Every week
      }
      break;
    case "Daily":
      for (let i = 1; i <= 52; i++) {
        maintenanceWeeks.push(i); // Every week (for simplicity in the 52-week layout)
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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/api/items");
        const filteredItems = response.data.filter((item) => item.pmNeeded === "Yes");
        setItems(filteredItems);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    fetchItems();
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
    setItems((prevItems) =>
      prevItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              maintenanceSchedule: item.maintenanceSchedule.map((week, index) =>
                index + 1 === weekNumber ? { ...week, status: newStatus } : week
              ),
            }
          : item
      )
    );
  
    try {
      await axios.put(`/api/items/${itemId}/schedule/update`, {
        weekNumber,
        status: newStatus,
      });
    } catch (err) {
      console.error("Error updating maintenance status:", err);
    }
  };

  const renderMonthForm = () => (
    <form className="month-form">
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
    </form>
  );

  const filteredItems = items
  .filter((item) => selectedLocation === "All" || item.location === selectedLocation)
  .filter((item) => {
    const itemNameMatch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = item.category?.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const pmFrequencyMatch = item.pmFrequency.toLowerCase().includes(searchTerm.toLowerCase());

    return itemNameMatch || categoryMatch || pmFrequencyMatch;
  })
  .sort((a, b) => a.itemName.localeCompare(b.itemName));
  const locations = [...new Set(items.map((item) => item.location))];

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
            <td>{item.specification}</td>
            <td>{item.location || "N/A"}</td>
            <td>{item.pmFrequency}</td>
            {Array.from({ length: 52 }, (_, i) => {
              const week = i + 1;
              const maintenanceWeeks = getMaintenanceWeeks(item.pmFrequency);
              const isMaintenanceWeek = maintenanceWeeks.includes(week);
  
              return (
                <td key={week}>
                  {isMaintenanceWeek ? (
                    <select
                      style={{ backgroundColor: statusColors[item.maintenanceSchedule[week - 1]?.status || "Pending"] }}
                      value={item.maintenanceSchedule[week - 1]?.status || "Pending"}
                      onChange={(e) => handleStatusChange(item._id, week, e.target.value)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    "-"
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        "Item Name",
        "Category",
        "Specification",
        "Location",
        "PM Frequency",
        ...Array.from({ length: 52 }, (_, i) => i + 1),
      ]
    ]);
  
    filteredItems.forEach(item => {
      const row = [
        item.itemName,
        item.category?.categoryName || "N/A",
        item.specification,
        item.location || "N/A",
        item.pmFrequency,
        ...Array.from({ length: 52 }, (_, i) => item.maintenanceSchedule[i]?.status || "-")
      ];
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
    });
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Preventive Maintenance");
    XLSX.writeFile(workbook, "PreventiveMaintenance.xlsx");
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
