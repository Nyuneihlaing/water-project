import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CalculatePage() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [minutes, setMinutes] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

useEffect(() => {
    axios.get('http://localhost:3000/activities')
        .then(response => {
            console.log(response.data);
            setActivities(response.data);
            setSelectedActivity(response.data[0].activity);
        })
        .catch(error => {
            console.error("Error fetching activities", error);
            setError("Error fetching activities.");
        });
}, []);

//function to set selected activity 
const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log("Selected Activity:", selectedActivity);
    console.log("Minutes:", minutes);
  
    if (!selectedActivity || !minutes){
        setError("Please select an activity and enter the time taken");
        return;
    }
  
    try {
        const response = await axios.post('http://localhost:3000/calculate-usage', {
            activity: selectedActivity,
            minutes: parseFloat(minutes),
        });
        console.log("Response data:", response.data);  
        setResult(`Total water usage: ${response.data.totalUsage} liters`);
        setError(''); 
    } catch (err) {
        console.error("Error calculating water usage:", err);
        setError("Failed to calculate water usage.");
    }
};

return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6 text-blue-500">Water Usage Calculator</h1>

      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Dropdown for activities */}
        <div className="mb-4">
          <label htmlFor="activity" className="block text-sm font-medium text-gray-700">Select Activity:</label>
          <select
            id="activity"
            className="block w-full p-2 border border-gray-300 rounded mt-1"
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
          >
            <option value="" disabled>Select an activity</option>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <option key={index} value={activity.activity}>
                  {activity.activity} ({activity.usageRatePerMinute} L/min)
                </option>
              ))
            ) : (
              <option value="" disabled>No activities available</option>
            )}
          </select>
        </div>

        {/* Input field for minutes */}
        <div className="mb-4">
          <label htmlFor="minutes" className="block text-sm font-medium text-gray-700">Enter minutes:</label>
          <input
            type="number"
            id="minutes"
            className="block w-full p-2 border border-gray-300 rounded mt-1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Enter minutes spent on activity"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
        >
          Calculate
        </button>
      </form>

      {/* Display result */}
      {result && <div className="mt-6 text-lg">{result}</div>}
    </div>
  );
}

export default CalculatePage;
