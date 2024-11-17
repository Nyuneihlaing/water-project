import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HistoryPage() {
  const [date, setDate] = useState(getLocalDate()); // Set default date to today
  const [availableDates, setAvailableDates] = useState([]); // Dates with data
  const [usageData, setUsageData] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableDates(); // Fetch available dates on component mount
  }, []);

  useEffect(() => {
    fetchUsageData();
    fetchTotalUsage();
  }, [date]);

  function getLocalDate() {
    const today = new Date();
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
  }

  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get('http://localhost:3000/available-dates'); // Endpoint to fetch available dates
      setAvailableDates(response.data.dates || []);
    } catch (err) {
      console.error("Error fetching available dates:", err);
      setError("Failed to fetch available dates.");
    }
  };

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

  const fetchTotalUsage = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/calculate-total-usage?date=${date}`);
      setTotalUsage(response.data.totalUsage);
    } catch (err) {
      console.error("Error fetching total water usage:", err);
      setError("Failed to fetch total water usage or no history detected.");
      setUsageData([]);
      setTotalUsage(0);
    }
  };

  const handleUpdateActivity = async (entryId, currentMinutes) => {
    const newMinutes = prompt("Enter new minutes:", currentMinutes);
    if (newMinutes === null) return; // User canceled prompt

    if (newMinutes < 0) {
      setError("Updated minutes cannot be less than 0.");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/update-activity`, {
        entryId,
        newMinutes: parseInt(newMinutes, 10)
      });
      fetchUsageData(); // refresh data
      fetchTotalUsage();
    } catch (err) {
      console.error("Error updating activity:", err);
      setError("Failed to update activity.");
    }
  };

  const handleDeleteActivity = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    try {
      await axios.delete(`http://localhost:3000/delete-activity`, {
        data: { entryId }
      });
      fetchUsageData(); // refresh the data
      fetchTotalUsage();
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError("Failed to delete activity.");
    }
  };

  const isDateAvailable = (selectedDate) => {
    return availableDates.includes(selectedDate);
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
          onChange={(e) => {
            if (isDateAvailable(e.target.value)) {
              setDate(e.target.value);
            } else {
              alert("No data available for the selected date.");
            }
          }}
          className="p-2 border border-gray-300 rounded"
          min={availableDates.length > 0 ? availableDates[0] : undefined}
          max={availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined}
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Water Usage Data Table */}
      {usageData.length > 0 && (
        <table className="w-full max-w-4xl bg-white rounded-lg shadow-md">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-4">Activity</th>
              <th className="p-4">Minutes</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usageData.map((activity) => (
              <tr key={activity.entryId} className="border-t">
                <td className="p-4">{activity.activity}</td>
                <td className="p-4">{activity.minutes} min</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleUpdateActivity(activity.entryId, activity.minutes)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(activity.entryId)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Display Total Usage */}
      {usageData.length > 0 && !error && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">
            Total Water Usage for {new Date(date + 'T00:00').toLocaleDateString()}: {totalUsage} L
          </h2>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
