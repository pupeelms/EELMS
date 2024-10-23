import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import './feedbackChart.scss';

const FeedbackChart = () => {
  const [feedbackData, setFeedbackData] = useState([]);

  // Fetch feedback emoji data from the database
  useEffect(() => {
    const fetchFeedbackEmojis = async () => {
      try {
        const response = await axios.get('/api/borrow-return/feedback/logs');

        setFeedbackData(response.data);
      } catch (error) {
        console.error("Error fetching feedback emojis:", error);
      }
    };

    fetchFeedbackEmojis();
  }, []);

  return (
    <div className="feedback-emoji-chart">
      <h2 className="feedback-title">User Feedback Emojis</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={feedbackData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="emoji">
            <Label value="Feedback Emoji" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#82ca9d" name="Feedback Count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FeedbackChart;
