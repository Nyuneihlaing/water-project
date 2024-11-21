import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function HistoryPage() {
  const [date, setDate] = useState(null); // set initial to null
  const [usageData, setUsageData] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableDates();
    if (date) {
      fetchUsageData();
      fetchTotalUsage();
    }
  }, [date]);

  function parseLocalDate(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  }

  const fetchAvailableDates = async () => {
    try {
      const response = await axios.get("http://localhost:3000/available-dates");
      const formattedDates = response.data.dates.map(dateString => {
        const utcDate = new Date(dateString);
        return new Date(utcDate.getTime() + utcDate.getTimezoneOffset() * 60000); //local time
      });
      setAvailableDates(formattedDates);
      setError("");
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
  

  // Fetch total water usage for selected date
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
      const response = await axios.delete(`http://localhost:3000/delete-activity`, {
        data: { entryId }
      });

      if (response.data.message.includes("document removed")) {
        setDate(null); // reset the date if the document was deleted
      }

      fetchUsageData(); // refresh the data
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
        <DatePicker
          selected={date ? parseLocalDate(date) : null} // Handle null date
          onChange={(selectedDate) => {
            if (selectedDate) {
              setDate(new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split("T")[0]);
            } else {
              setDate(null);
            }
          }}
          className="p-2 border border-gray-300 rounded"
          includeDates={availableDates}
          dateFormat="yyyy-MM-dd"
        />
      </div>

      {!date && <p className="text-gray-500 mt-4">Please select a date to view water usage history.</p>}
      
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
            Total Water Usage for {new Date(parseLocalDate(date)).toLocaleDateString()}: {totalUsage} L
          </h2>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
