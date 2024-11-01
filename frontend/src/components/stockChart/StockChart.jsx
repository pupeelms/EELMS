import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import axios from 'axios'; // Import Axios
import './stockChart.scss';

// Function to generate distinct hues
const generateDistinctHues = (numHues) => {
  const hues = [];
  const hueInterval = 360 / numHues; // Calculate the interval between hues

  for (let i = 0; i < numHues; i++) {
    const hue = Math.round(i * hueInterval); // Generate hues with distinct intervals
    hues.push(`hsl(${hue}, 55%, 50%)`); // Create HSL color
  }

  return hues;
};

const StockChart = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories'); // Fetch data from your endpoint
        // Assign colors to each category
        const hues = generateDistinctHues(response.data.length); // Generate colors based on the number of categories
        const categoriesWithColor = response.data.map((category, index) => ({
          ...category,
          color: hues[index % hues.length] // Assign color based on index
        }));
        setCategories(categoriesWithColor);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }; 

    fetchCategories();
  }, []);

  // Filter out categories with itemCount of 0 for the pie chart
  const chartData = categories
    .filter(category => category.itemCount > 0)
    .map(category => ({
      name: category.categoryName, // Name for the label
      value: category.itemCount, // Value for the pie slice
      color: category.color // Use the assigned color
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p style={{ color: 'gray', fontSize: '18px' }}>{payload[0].name}</p>
          <p style={{ color: '#82ca9d', fontSize: '16px' }}>{`Stock Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cat-chart-container">
      <h2 className="cat-chart-title">Category Stock Levels</h2>
      <div className="chart-wrapper">
        <div className="chart-pie">
          <PieChart width={300} height={214}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={75}
              innerRadius={45}
              isAnimationActive={true}
              label={({ value }) => (value > 0 ? `${((value / categories.reduce((acc, category) => acc + category.itemCount, 0)) * 100).toFixed(0)}%` : '')} // Show percentage only if value is greater than 0
              labelLine={false} // Remove label lines
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} /> // Use assigned color
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>
        <div className="custom-legend">
          {categories.map((entry, index) => ( // Use all categories for the legend
            <div key={`legend-${index}`} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: entry.itemCount > 0 ? entry.color : '#ddd' }} // Use assigned color or gray out for 0 count
              />
              <span className="legend-name">{entry.categoryName}</span>
              <span className="legend-value">({entry.itemCount})</span> {/* Show item count in the legend */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockChart;
