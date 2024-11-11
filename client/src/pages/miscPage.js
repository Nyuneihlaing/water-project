import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MiscPage() {
  const [newActivity, setNewActivity] = useState({name: '', rate: ''});
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');

  const [waterLimit, setWaterLimit] = useState(0);
  const [newLimit, setNewLimit] = useState('');
  const [waterLimitSuccessMessage, setWaterLimitSuccessMessage] = useState('');
  const [waterLimitError, setWaterLimitError] = useState('');
  
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('http://localhost:3000/activities');
        setActivities(response.data);
      } catch (error) {
        setError('Failed to load activities.');
      }
    };

    const fetchWaterLimit = async () => {
      try {
        const response = await axios.get('http://localhost:3000/water-limit');
        setWaterLimit(response.data.limit);
      } catch (error) {
        setWaterLimitError('Failed to fetch current water limit.');
      }
    };

    fetchActivities();
    fetchWaterLimit();
  }, []);

  const addNewActivity = async () => {
    if (!newActivity.name || !newActivity.rate || parseFloat(newActivity.rate) <= 0) {
      setError("Please provide a valid name and rate greater than 0 for the new activity.");
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/activities', {
        activity: newActivity.name,
        usageRatePerMinute: parseFloat(newActivity.rate),
      });
      //reset field to empty values
      setNewActivity({ name: '', rate: '' });
      setError('');
      setSuccessMessage("Activity successfully added!");
      // Clear success message after 3 secs
      setTimeout(() => setSuccessMessage(''), 3000);
  
    }catch (error) {
      setError("Failed to add new activity.");
    }
  };

  const deleteActivity = async () => {
    if (!selectedActivityId) {
      setError('Please select an activity to delete.');
      return;
    }

    try {
      const response = await axios.delete('http://localhost:3000/delete-activity-permanently', {
        data: { activityId: selectedActivityId },
      });
      setSuccessMessage('Activity successfully deleted!');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Refresh activities list
      setActivities((prevActivities) => prevActivities.filter(activity => activity._id !== selectedActivityId));
    } catch (error) {
      setError('Failed to delete activity.');
    }
  };

  // for setting a new water limit
  const setWaterLimitHandler = async () => {
    if (!newLimit || isNaN(newLimit) || parseFloat(newLimit) <= 0) {
      setWaterLimitError('Please input a valid water limit.');
      return;
    }
    try {
      await axios.post('http://localhost:3000/set-water-limit', {
        limit: parseFloat(newLimit),
      });

      setWaterLimit(newLimit); // Update state with new limit
      setNewLimit(''); // Clear input field
      setWaterLimitError('');
      setWaterLimitSuccessMessage('Water limit set successfully!');
      setTimeout(() => setWaterLimitSuccessMessage(''), 3000);

    } catch (error) {
      setWaterLimitError('Failed to set water limit.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
        {/* Add new activity form */}
        <div className="bg-white p-4 rounded-lg shadow-md mt-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Add New Activity</h2>

          {/* Error message */}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Success message */}
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

          <input
            type="text"
            placeholder="Activity Name"
            value={newActivity.name}
            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
            className="block w-full p-2 border border-gray-300 rounded mb-2"
          />

          <input
            type="number"
            placeholder="Usage Rate per Minute (L/min)"
            value={newActivity.rate}
            onChange={(e) => setNewActivity({ ...newActivity, rate: e.target.value })}
            className="block w-full p-2 border border-gray-300 rounded mb-2"
          />

          <button onClick={addNewActivity} className="bg-green-500 text-white p-2 rounded">Add Activity</button>

          <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Delete Activity</h2>
          <select
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded mb-2"
          >
            <option value="">Select an activity</option>
            {activities.map((activity) => (
              <option key={activity._id} value={activity._id}>
                {activity.activity} ({activity.usageRatePerMinute} L/min)
              </option>
            ))}
          </select>

          <button onClick={deleteActivity} 
            className="bg-red-500 text-white p-2 rounded"
            disabled={activities.length <= 1}   
          >
            Delete Activity
          </button>

      </div>
    </div>

    <div className="bg-white p-4 rounded-lg shadow-md mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Set Water Limit</h2>
        <p className="mb-4">Current Water Limit: {waterLimit} liters</p>

        {waterLimitError && <p className="text-red-500 mb-4">{waterLimitError}</p>}
        {waterLimitSuccessMessage && <p className="text-green-500 mb-4">{waterLimitSuccessMessage}</p>}

        <input
          type="number"
          value={newLimit}
          onChange={(e) => setNewLimit(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded mb-2"
          placeholder="New Water Limit (liters)"
        />
        <button onClick={setWaterLimitHandler} className="w-full p-2 bg-green-500 text-white rounded">Set Limit</button>
      </div>
  </div>
    
  );
}

export default MiscPage;
