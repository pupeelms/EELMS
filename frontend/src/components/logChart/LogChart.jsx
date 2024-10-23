import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import './logChart.scss';

const LogChart = () => {
  const [transactionData, setTransactionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/borrow-return/br/aggregated-transactions'); // Fetch aggregated data from your endpoint

        // Process the fetched data
        const logs = response.data.map(entry => ({
          date: entry._id.date,
          totalBorrowed: entry.totalBorrowed || 0,
          totalReturned: entry.totalReturned || 0,
        }));

        setTransactionData(logs);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="log-chart-container">
      <h2 className="log-chart-title">Borrow vs Return Transactions Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={transactionData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }} // Increase bottom margin to push legend lower
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date">
            <Label value="Date" offset={-20} position="insideBottom" /> {/* Adjusted offset */}
          </XAxis>
          <YAxis>
            <Label value="Number of Transactions" angle={-90} position="insideLeft" offset={0} style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            wrapperStyle={{ paddingTop: 30 }} // Add padding to push the legend down below the Date label
          />
          <Line
            type="monotone"
            dataKey="totalBorrowed"
            stroke="#82ca9d"
            dot={false}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name="Total Borrowed"
          />
          <Line
            type="monotone"
            dataKey="totalReturned"
            stroke="#8884d8"
            dot={false}
            strokeWidth={2}
            activeDot={{ r: 8 }}
            name="Total Returned"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LogChart;
