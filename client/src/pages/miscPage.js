import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MiscPage() {
  const [newActivity, setNewActivity] = useState({name: '', rate: ''});
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
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
        </div>
    </div>
  );
}

export default MiscPage;
