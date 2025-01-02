import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './feedbackChart.scss';

const FeedbackChart = () => {
  const [feedbackData, setFeedbackData] = useState([]);

  // Fetch feedback emoji data from the database
  useEffect(() => {
    const fetchFeedbackEmojis = async () => {
      try {
        const response = await axios.get('/api/borrow-return/feedback/logs');
        // Sort the data by count in descending order
        const sortedData = response.data.sort((a, b) => b.count - a.count);
        setFeedbackData(sortedData);
      } catch (error) {
        console.error("Error fetching feedback emojis:", error);
      }
    };

    fetchFeedbackEmojis();
  }, []);

  return (
    <div className="feedback-emoji-chart">
     <h2 className="feedback-message-title">User Feedback Chart</h2>
     <p className="feedback-description">
      The feedback data displayed here reflects user sentiment and engagement with EELMS.
      By analyzing this feedback, you can identify trends, address concerns, and implement improvements to enhance the overall user experience.
      Proactive analysis ensures the system continues to meet user needs effectively and efficiently.<br />
      <br />
      For future concerns or suggestions, please submit feedback using the form located on the right side.
      Your input helps researchers address issues and refine the system to better serve its users.
    </p>

      <ResponsiveContainer width="100%" height={310}>
        <BarChart
          data={feedbackData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="emoji" />
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
