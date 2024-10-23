import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios'; // Import Axios
import './topBorrowedChart.scss';

const TopBorrowedChart = () => {
  const [borrowedData, setBorrowedData] = useState([]);

  useEffect(() => {
    const fetchBorrowedItems = async () => {
      try {
        const response = await axios.get('/api/borrow-return/br/top-borrowed-items'); // Use the new API route

        // Process the fetched data
        const topItems = response.data.map(item => ({
          name: item._id, // Item name from aggregation
          borrowedCount: item.totalBorrowed || 0, // Total borrowed count from aggregation
        }));

        setBorrowedData(topItems);
      } catch (error) {
        console.error("Error fetching borrowed items:", error);
      }
    };

    fetchBorrowedItems();
  }, []);

  return (
    <div className="top-borrowed-chart-container">
      <h2 className="top-borrowed-chart-title">Top Borrowed Items</h2>
      <ResponsiveContainer width="100%" height={310}>
        <BarChart
          data={borrowedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }} // Increased bottom margin for space
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name">
            <Label value="Item Name" offset={-10} position="insideBottom" />
          </XAxis>
          <YAxis label={{ value: "Borrow Count", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 20 }} // Add padding to push the legend further down
          />
          <Bar dataKey="borrowedCount" fill="#82ca9d" barSize={40} name="Borrowed Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopBorrowedChart;
