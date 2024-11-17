import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function HistoryPage() {
  const [date, setDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]); // Dates with data
  const [usageData, setUsageData] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableDates(); // Fetch available dates on mount
  }, []);

  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get('http://localhost:3000/available-dates'); // Endpoint to fetch available dates
      setAvailableDates(response.data.dates || []);
    } catch (err) {
      console.error("Error fetching available dates:", err);
      setError("Failed to fetch available dates.");
    }
  };

  const fetchUsageData = useCallback(async () => {
    setUsageData([]);
    setError('');
    try {
      const response = await axios.get(`http://localhost:3000/water-usage-history?date=${date}`);
      setUsageData(response.data.usage || []);
    } catch (err) {
      console.error("Error fetching usage data:", err);
      setError("Failed to fetch water usage history.");
    }
  }, [date]);

  const fetchTotalUsage = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:3000/calculate-total-usage?date=${date}`);
      setTotalUsage(response.data.totalUsage);
    } catch (err) {
      console.error("Error fetching total water usage:", err);
      setError("Failed to fetch total water usage or no history detected.");
      setUsageData([]);
      setTotalUsage(0);
    }
  }, [date]);

  useEffect(() => {
    if (date && availableDates.includes(date)) {
      fetchUsageData();
      fetchTotalUsage();
    } else if (date) {
      setError("Selected date has no data available.");
    }
  }, [date, fetchUsageData, fetchTotalUsage, availableDates]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (availableDates.includes(selectedDate)) {
      setDate(selectedDate);
      setError(''); // Clear any previous error
    } else {
      setDate(''); // Clear the date if invalid
      setError("Selected date has no data available.");
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
        newMinutes: parseInt(newMinutes, 10),
      });
      fetchUsageData(); // Refresh data
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
        data: { entryId },
      });
      fetchUsageData(); // Refresh the data
      fetchTotalUsage();
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError("Failed to delete activity.");
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
          onChange={handleDateChange}
          className="p-2 border border-gray-300 rounded"
          min={availableDates.length > 0 ? availableDates[0] : undefined}
          max={availableDates.length > 0 ? availableDates[availableDates.length - 1] : undefined}
        />
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Water Usage Data Table */}
      {usageData.length > 0 ? (
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
      ) : (
        <p className="text-gray-500 mt-4">No water usage data found for the selected date.</p>
      )}

      {/* Display Total Usage */}
      {usageData.length > 0 && !error && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">
            Total Water Usage for {date}: {totalUsage} L
          </h2>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
