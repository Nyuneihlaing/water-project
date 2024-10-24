const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const WaterActivity = require('./models/WaterActivity'); // Le Schema import

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
  
// Connect to MongoDB and initialize data... if needed.
mongoose.connect(mongoURL)
.then(() => {
    console.log('MongoDB Connection Successful');
    initializeWaterActivities();
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
  const { activity, minutes } = req.body;

  if (!activity || !minutes) {
    return res.status(400).json({error: 'Activity and minutes not entered.'})
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

// Start up the server!
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});
