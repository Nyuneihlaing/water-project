import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CalculatePage() {
  const [activities, setActivities] = useState([]);
  const [activityFields, setActivityFields] = useState([{ selectedActivity: '', minutes: '' }]); 
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);

useEffect(() => {
    axios.get('http://localhost:3000/activities')
        .then(response => {
            console.log(response.data);
            setActivities(response.data);
            setActivityFields([{ selectedActivity: response.data[0]?.activity || '', minutes: '' }]);
        })
        .catch(error => {
            console.error("Error fetching activities", error);
            setError("Error fetching activities.");
        });
}, []);

// When called, it adds a NEW activity to the array
const addActivityField = () => {
  setActivityFields([...activityFields, { selectedActivity: '', minutes: '' }]);
  setResult(null);  // Reset result when new activity is added
  setShowSaveButton(false);
};

const removeActivityField = (index) => {
  if (activityFields.length > 1) {
    const newFields = activityFields.filter((_, i) => i !== index);
    setActivityFields(newFields);
    setResult(null);  // Reset result when an activity is removed
    setShowSaveButton(false);
  }
};

// Needed as we now have a dynamic list
const handleInputChange = (index, field, value) => {
  const newFields = [...activityFields];
  newFields[index][field] = value;
  setActivityFields(newFields);
  setResult(null);  // Reset result when an edit is made
  setShowSaveButton(false);
};

//function to set selected activity 
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For checking if all activities are filled and there are NO duplicates
    const selectedActivities = activityFields.map(field => field.selectedActivity);

    for (const field of activityFields) { // Checks that each is filled in.
      if (!field.selectedActivity || !field.minutes) {
        setError("Please select an activity and enter the time taken for all fields.");
        return;
      }
    }

    // Check for duplicates
    const uniqueActivities = new Set(selectedActivities);
    if (uniqueActivities.size !== selectedActivities.length) {
        setError("Each activity must be unique. Please remove or change any duplicate activities.");
        return;
    }

  
    try {
      // The collection of requests. Sent asynchronously, hence Promise
      const usagePromises = activityFields.map(field =>
        axios.post('http://localhost:3000/calculate-usage', {
          activity: field.selectedActivity,
          minutes: parseFloat(field.minutes),
        })
      );
    
      const responses = await Promise.all(usagePromises); // Sends the requests, and wait for all of them
      const totalUsage = responses.reduce((sum, response) => sum + response.data.totalUsage, 0); // Sum up results
    
      setResult(`Total water usage: ${totalUsage} liters`);
      setError('');
      setShowSaveButton(true);
    } catch (err) {
      console.error("Error calculating water usage:", err);
      setError(`Failed to calculate water usage: ${err.response?.data?.error || err.message || "Unknown error"}`);
    }
};

// save function that sends data to the backend
const handleSave = async () => {
  const dataToSave = {
    usage: activityFields.map(field => ({
      activity: field.selectedActivity,
      minutes: parseFloat(field.minutes),
      // No timestamp, so this will just save the current date in the backend
    })),
    date: new Date().toISOString() // Use current date as the overall entry date
  };

  try {
    await axios.post('http://localhost:3000/save-usage', dataToSave);
    alert('Usage data successfully saved!');
    setShowSaveButton(false);
  } catch (err) {
    setError("Failed to save usage data.");
  }
};



return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-6 text-blue-500">Water Usage Calculator</h1>

      <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Headers for Activity and Minutes */}
      <div className="flex mb-4">
        <div className="w-3/4">
          <label className="block text-sm font-medium text-gray-700">Activity:</label>
        </div>
        <div className="w-1/4">
          <label className="block text-sm font-medium text-gray-700">Minutes:</label>
        </div>
      </div>

      {/* Dynamic fields for multiple activities */}
      {activityFields.map((field, index) => (
        <div key={index} className="flex justify-between items-center mb-4">
          {/* Dropdown for activities */}
          <div className="w-2/3 mr-2">
            <select
              id={`activity-${index}`}
              className="block w-full p-2 border border-gray-300 rounded mt-1"
              value={field.selectedActivity}
              onChange={(e) => handleInputChange(index, 'selectedActivity', e.target.value)}
            >
              <option value="" disabled>Select an activity</option>
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <option key={i} value={activity.activity}>
                    {activity.activity} ({activity.usageRatePerMinute} L/min)
                  </option>
                ))
              ) : (
                <option value="" disabled>No activities available</option>
              )}
            </select>
          </div>

          {/* Input field for minutes */}
          <div className="w-1/3">
            <input
              type="number"
              id={`minutes-${index}`}
              className="block w-full p-2 border border-gray-300 rounded mt-1"
              value={field.minutes}
              onChange={(e) => handleInputChange(index, 'minutes', e.target.value)}
              placeholder="Enter minutes"
            />
          </div>

          {/* Remove button */}
          {activityFields.length > 1 && (
              <button
                type="button"
                className="ml-2 bg-red-500 text-white p-2 rounded hover:bg-red-600"
                onClick={() => removeActivityField(index)}
              >
                X
              </button>
            )}
        </div>
      ))}

        {/* Button to add a new activity field */}
        <button
          type="button"
          className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 mb-4"
          onClick={addActivityField}
        >
          Add Another Activity
        </button>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
        >
          Calculate
        </button>
      </form>

      {/* Display result */}
      {result && <div className="mt-6 text-lg">
        {result}
        
        {showSaveButton && (
          <button onClick={handleSave}
            className="w-full mt-4 bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600"
          >
            Save
          </button>
          )}
        </div>}
    </div>
  );
}

export default CalculatePage;
