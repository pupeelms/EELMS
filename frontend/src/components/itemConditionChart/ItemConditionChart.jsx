import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import axios from 'axios';
import './itemConditionChart.scss';

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

// Customized label to avoid overlap and match pie slice color
const CustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, fill }) => {
    const RADIAN = Math.PI / 180;
    const labelRadius = outerRadius + (percent < 0.05 ? 30 : 20); // Increase distance for small percentages
    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text
        x={x}
        y={y}
        fill={fill} // Match label color with slice color
        textAnchor={x > cx ? 'start' : 'end'} // Adjust alignment dynamically
        dominantBaseline="central"
        fontSize={16} // Larger font size for better readability
      >
        {`${(percent * 100).toFixed(0)}%`} {/* Display percentage */}
      </text>
    );
  };
  
  

const ItemConditionChart = () => {
  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    const fetchConditions = async () => {
      try {
        const response = await axios.get('/api/items/item-conditions'); // Fetch data from your endpoint
        const total = response.data.reduce((sum, condition) => sum + condition.count, 0); // Calculate total count
        const hues = generateDistinctHues(response.data.length); // Generate colors based on the number of conditions
        const conditionsWithColor = response.data.map((condition, index) => ({
          ...condition,
          percentage: ((condition.count / total) * 100).toFixed(2), // Calculate percentage
          color: hues[index % hues.length], // Assign color based on index
        }));
        setConditions(conditionsWithColor);
      } catch (error) {
        console.error('Error fetching item conditions:', error);
      }
    };

    fetchConditions();
  }, []);

  // Prepare chart data
  const chartData = conditions.map((condition) => ({
    name: condition.condition,
    value: parseFloat(condition.percentage), // Use percentage for the chart value
    count: condition.count, // Include count for tooltip and legend
    color: condition.color,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p style={{ color: 'gray', fontSize: '18px' }}>{payload[0].name}</p>
          <p style={{ color: '#82ca9d', fontSize: '16px' }}>{`Count: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="item-cond-chart-container">
      <h2 className="item-cond-chart-title">Item Status Overview</h2>
      <div className="chart-wrapper">
        <div className="chart-pie">
          <PieChart width={295} height={268}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={75}
              innerRadius={0}
              isAnimationActive={true}
              label={(props) => (
                <CustomizedLabel
                  {...props}
                  fill={props.fill} // Pass the slice color to the label
                />
              )}
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
          {conditions.map((entry, index) => (
            <div key={`legend-${index}`} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: entry.color }}
              />
              <span className="legend-name">{entry.condition}</span>
              <span className="legend-value">({entry.count})</span> {/* Show count in the legend */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItemConditionChart;
