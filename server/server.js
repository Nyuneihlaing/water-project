const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const WaterActivity = require('./models/WaterActivity'); // Le Schema import
const WaterUsage = require('./models/WaterUsage');
const WaterLimit = require('./models/WaterLimit');

app.use(express.json());

const cors = require('cors');
app.use(cors());

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017/waterApp';

// Default water-using activities
const defaultActivities = [
  { activity: "Washing hands", usageRatePerMinute: 2 },
  { activity: "Showering", usageRatePerMinute: 9 },
  { activity: "Brushing teeth", usageRatePerMinute: 1.5 },
  { activity: "Washing dishes", usageRatePerMinute: 10 }
];

// Callable function to check if the default mapping exists
const initializeWaterActivities = async () => {
  try {
    const count = await WaterActivity.countDocuments();
    
    if (count === 0) { // If there are no existing docs, insert the default activities
      await WaterActivity.insertMany(defaultActivities);
      console.log('Default water activities inserted.');
    } else {
      console.log('Water activities already exist in the database.');
    }
  } catch (err) {
    console.error('Error checking or inserting water activities:', err);
  }
};
  
// Initialize water limit to 100 liters if not set
const initializeWaterLimit = async () => {
  try {
    const existingLimit = await WaterLimit.findOne();
    if (!existingLimit) {
      const newLimit = new WaterLimit({ limit: 100 });
      await newLimit.save();
      console.log('Default water limit of 100 liters set.');
    } else {
      console.log('Water limit already exists in the database.');
    }
  } catch (err) {
    console.error('Error checking or setting water limit:', err);
  }
};

// Connect to MongoDB and initialize data... if needed.
mongoose.connect(mongoURL)
.then(() => {
    console.log('MongoDB Connection Successful');
    initializeWaterActivities();
    initializeWaterLimit();
})
.catch(err => console.error('Error connecting to MongoDB:', err));

//get all activities
app.get('/activities', async(req, res) => {
  try {
    const activities = await WaterActivity.find();
    res.json(activities);
  } catch(err) {
    res.status(500).json({error: 'Failed to fetch activities.'})
  }
});

//add new activity
app.post('/activities', async(req, res) => {
  const { activity, usageRatePerMinute } = req.body;

  if (!activity || usageRatePerMinute == null) {
    return res.status(400).json({error: 'Activity and usage rate not entered.'})
  }

  try  {
    const newActivity = new WaterActivity({activity, usageRatePerMinute})
    await newActivity.save();
    res.json(newActivity);
  } catch(err) {
    res.status(500).json({error: "Failed to add new activity."})
  }
})

//calcuate water usage
app.post('/calculate-usage', async(req, res) => {
  const {activity, minutes} = req.body;

  if (!activity || minutes === null || minutes === undefined) {
    return res.status(400).json({error: "Usage and minutes not entered."})
  }
  if (minutes < 0) {
    return res.status(400).json({ error: "Minutes cannot be negative." });
  }
  try {
    const activityDoc = await WaterActivity.findOne({ activity });
    if (!activityDoc) {
      return res.status(400).json({ error: "Invalid activity." });
    }
    // Calculate total water usage
    const totalUsage = activityDoc.usageRatePerMinute * minutes;
    res.json({ totalUsage });
  } catch (err) {
    res.status(500).json({error: "Calculation failed."});
  }
});


// save the usage of a day into a document
app.post('/save-usage', async (req, res) => {
  const { usage } = req.body;

  if (!usage || !Array.isArray(usage) || usage.length === 0) {
    return res.status(400).json({ error: "Usage data must be provided." });
  }

  try {
    const formattedDate = getLocalDateWithoutTime(); // ISO format for consistency

    const updatedUsage = usage.map((entry) => ({
      entryId: new mongoose.Types.ObjectId(),
      activity: entry.activity,
      minutes: entry.minutes
    }));

    const existingUsage = await WaterUsage.findOne({ date: formattedDate });

    if (existingUsage) {
      existingUsage.usage.push(...updatedUsage);
      await existingUsage.save();
      res.json({ message: 'Water usage updated successfully!', waterUsage: existingUsage });
    } else {
      const newWaterUsage = new WaterUsage({
        date: formattedDate,
        usage: updatedUsage
      });
      await newWaterUsage.save();
      res.json({ message: 'Water usage saved successfully!', waterUsage: newWaterUsage });
    }
  } catch (err) {
    console.error('Error saving water usage:', err);
    res.status(500).json({ error: 'Failed to save water usage.' });
  }
});



// check if usage data for today exists
app.get('/usage-exists', async (req, res) => {
  //const currentDate = new Date();
  const formattedDate = getLocalDateWithoutTime();

  try {
    const existingUsage = await WaterUsage.findOne({ date: formattedDate });
    if (existingUsage) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking usage existence:', err);
    res.status(500).json({ error: 'Failed to check usage existence.' });
  }
});

// delete usage data for today
app.delete('/delete-usage', async (req, res) => {
  //const currentDate = new Date();
  const formattedDate = getLocalDateWithoutTime();

  try {
    await WaterUsage.deleteOne({ date: formattedDate });
    res.json({ message: 'Usage data deleted successfully.' });
  } catch (err) {
    console.error('Error deleting usage data:', err);
    res.status(500).json({ error: 'Failed to delete usage data.' });
  }
});

app.get('/water-usage-history', async (req, res) => {
  const { date } = req.query;
  const formattedDate = new Date(date);

  try {
    const usageEntry = await WaterUsage.findOne({ date: formattedDate });
    
    if (!usageEntry) {
      return res.status(404).json({ error: "No usage data found for this date" });
    }

    res.json(usageEntry);
  } catch (err) {
    console.error("Error fetching water usage history:", err);
    res.status(500).json({ error: "Failed to fetch water usage history." });
  }
});


app.get('/calculate-total-usage', async (req, res) => {
  const { date } = req.query;
  const formattedDate = new Date(date).toISOString().split("T")[0];

  try {
    const usageEntry = await WaterUsage.findOne({ date: formattedDate });

    if (!usageEntry) {
      return res.status(404).json({ error: "No usage data found for this date" });
    }

    // Calculate total usage by looking up each activity's usage rate
    let totalUsage = 0;
    for (const activity of usageEntry.usage) {
      const activityDoc = await WaterActivity.findOne({ activity: activity.activity });
      const usageRate = activityDoc ? activityDoc.usageRatePerMinute : 0;
      totalUsage += activity.minutes * usageRate;
    }

    res.json({ totalUsage });
  } catch (err) {
    console.error("Error calculating total water usage:", err);
    res.status(500).json({ error: "Failed to calculate total water usage." });
  }
});


// update the activity's minutes in water usage for a given date
app.put('/update-activity', async (req, res) => {
  const { entryId, newMinutes } = req.body;

  if (!entryId || newMinutes === undefined) {
    return res.status(400).json({ error: "Entry ID and new minutes are required." });
  }

  try {
    const updatedUsage = await WaterUsage.findOneAndUpdate(
      { 'usage.entryId': entryId },
      { $set: { 'usage.$.minutes': newMinutes } }, // update only the specified entry's minutes
      { new: true }
    );

    if (!updatedUsage) {
      return res.status(404).json({ error: "Activity not found for the specified entryId." });
    }

    res.json({ message: "Activity updated successfully.", updatedUsage });
  } catch (err) {
    console.error("Error updating activity:", err);
    res.status(500).json({ error: "Failed to update activity." });
  }
});

// delete an activity
app.delete('/delete-activity', async (req, res) => {
  const { entryId } = req.body;

  if (!entryId) {
    return res.status(400).json({ error: "Entry ID is required." });
  }

  try {
    const updatedUsage = await WaterUsage.findOneAndUpdate(
      { 'usage.entryId': entryId },
      { $pull: { usage: { entryId } } }, // Remove the entry with the specific entryId
      { new: true }
    );

    if (!updatedUsage) {
      return res.status(404).json({ error: "Activity not found for the specified entryId." });
    }

    if (updatedUsage.usage.length === 0) {
      await WaterUsage.deleteOne({ _id: updatedUsage._id });
      return res.json({ message: "Activity deleted successfully and document removed since no activities remain.", updatedUsage });
    }

    res.json({ message: "Activity deleted successfully.", updatedUsage });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: "Failed to delete activity." });
  }
});

// delete an activity and remove it from all water usage records
app.delete('/delete-activity-permanently', async (req, res) => {
  const { activityId } = req.body;

  if (!activityId) {
    return res.status(400).json({ error: "Activity ID is required." });
  }

  try {
    const deletedActivity = await WaterActivity.findByIdAndDelete(activityId);

    if (!deletedActivity) {
      return res.status(404).json({ error: "Activity not found." });
    }

    // remove the deleted activity from all water usage records
    await WaterUsage.updateMany(
      { 'usage.activity': deletedActivity.activity },
      { $pull: { usage: { activity: deletedActivity.activity } } }
    );

    res.json({ message: "Activity and associated water usage data deleted successfully." });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ error: "Failed to delete activity." });
  }
});

// retrieve water limit
app.get('/water-limit', async (req, res) => {
  try {
    const waterLimit = await WaterLimit.findOne();
    res.json({ limit: waterLimit ? waterLimit.limit : 0 });
  } catch (err) {
    res.status(500).send('Error retrieving water limit');
  }
});

// set the limit
app.post('/set-water-limit', async (req, res) => {
  const { limit } = req.body;

  try {
    // if a water limit exists already, update it. otherwise, create a new one
    const existingLimit = await WaterLimit.findOne();
    if (existingLimit) {
      existingLimit.limit = limit;
      await existingLimit.save();
    } else {
      const newLimit = new WaterLimit({ limit });
      await newLimit.save();
    }

    res.status(200).send('Water limit saved');
  } catch (err) {
    res.status(500).send('Error setting water limit');
  }
});

// get all past usages and format it for table
app.get('/past-usage', async (req, res) => {
  try {
    const usageRecords = await WaterUsage.find();

    // combine usage by activity
    const aggregatedUsage = {};

    // fetch activity details for usage rate
    const allActivities = await WaterActivity.find();
    const activityRates = allActivities.reduce((acc, activity) => {
      acc[activity.activity] = activity.usageRatePerMinute;
      return acc;
    }, {});

    usageRecords.forEach(record => {
      record.usage.forEach(entry => {
        if (!aggregatedUsage[entry.activity]) {
          aggregatedUsage[entry.activity] = { totalMinutes: 0, totalUsage: 0 };
        }
        // get total minutes and usage for the activity
        aggregatedUsage[entry.activity].totalMinutes += entry.minutes;
        aggregatedUsage[entry.activity].totalUsage += entry.minutes * activityRates[entry.activity];
      });
    });

    // convert combined data into an array for easy frontend use
    const aggregatedArray = Object.keys(aggregatedUsage).map(activity => {
      const totalMinutes = aggregatedUsage[activity].totalMinutes;
      const totalUsage = aggregatedUsage[activity].totalUsage;
      const totalUsageInLiters = totalUsage;

      return {
        activity,
        totalMinutes,
        totalUsageInLiters,
      };
    });

    res.json(aggregatedArray);
  } catch (err) {
    res.status(500).send("Error fetching usage records");
  }
});

//get available dates
app.get('/available-dates', async (req, res) => {
  try {
    const dates = await WaterUsage.distinct('date');
    const formattedDates = dates.map((date) => date.toISOString().split('T')[0]);
    res.json({ dates: formattedDates });
    
  } catch (err) {
    console.error('Error fetching available dates:', err);
    res.status(500).json({ error: 'Failed to fetch available dates.' });
  }
});

// Update activity and rename in history
app.put('/activities/:id', async (req, res) => {
  const { id } = req.params;
  const { activity, usageRatePerMinute } = req.body;

  if (!activity || usageRatePerMinute == null) {
    return res.status(400).json({ error: 'Activity and usage rate are required.' });
  }

  try {
    // Check for duplicate activity name
    const duplicateActivity = await WaterActivity.findOne({ activity });
    if (duplicateActivity && duplicateActivity._id.toString() !== id) {
      return res.status(400).json({ error: 'An activity with this name already exists.' });
    }

    // Get the old activity name
    const oldActivity = await WaterActivity.findById(id);
    if (!oldActivity) {
      return res.status(404).json({ error: 'Activity not found.' });
    }
    const oldActivityName = oldActivity.activity;

    // Update the activity
    const updatedActivity = await WaterActivity.findByIdAndUpdate(
      id,
      { activity, usageRatePerMinute },
      { new: true }
    );

    // Update historical records in WaterUsage
    await WaterUsage.updateMany(
      { 'usage.activity': oldActivityName },
      { $set: { 'usage.$[elem].activity': activity } },
      { arrayFilters: [{ 'elem.activity': oldActivityName }] }
    );

    res.json(updatedActivity);
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ error: 'Failed to update activity.' });
  }
});




// Helper function
function getLocalDateWithoutTime() {
  const today = new Date();
  const localDateOnlyString = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split("T")[0];
  return new Date(localDateOnlyString);
}

// Start up the server!
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});

