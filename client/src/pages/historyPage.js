import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HistoryPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Set default date to today
  const [usageData, setUsageData] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsageData();
    fetchTotalUsage();
  }, [date]);

  const fetchUsageData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/water-usage-history?date=${date}`);
      setUsageData(response.data.usage || []); // Handle empty response safely
      setError('');
    } catch (err) {
      console.error("Error fetching usage data:", err);
      setError("Failed to fetch water usage history.");
    }
  };
  

  // Fetch total water usage for selected date
  const fetchTotalUsage = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/calculate-total-usage?date=${date}`);
      setTotalUsage(response.data.totalUsage);
    } catch (err) {
      console.error("Error fetching total water usage:", err);
      setError("Failed to fetch total water usage.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold text-blue-500 mb-6">Water Usage History</h1>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="mr-2">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Water Usage Data Table */}
      <table className="w-full max-w-4xl bg-white rounded-lg shadow-md">
        <thead className="bg-blue-500 text-white">
          <tr>
            <th className="p-4">Activity</th>
            <th className="p-4">Minutes</th>
          </tr>
        </thead>
        <tbody>
          {usageData.map((activity, index) => (
            <tr key={index} className="border-t">
              <td className="p-4">{activity.activity}</td>
              <td className="p-4">{activity.minutes} min</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display Total Usage */}
      <div className="mt-6">
        <h2 className="text-xl font-bold">
          Total Water Usage for {new Date(date).toLocaleDateString()}: {totalUsage} L
        </h2>
      </div>
    </div>
  );
}

export default HistoryPage;
