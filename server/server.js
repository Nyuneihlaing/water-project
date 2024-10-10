const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const WaterActivity = require('./models/WaterActivity'); // Importing the model

const app = express();
const port = 3000;

app.use(express.json());
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

// Initialize default activities if the collection is empty
const initializeWaterActivities = async () => {
  try {
    const count = await WaterActivity.countDocuments();
    console.log(`Existing activity count: ${count}`); // Log current count
    if (count === 0) {
      await WaterActivity.insertMany(defaultActivities);
      console.log('Default water activities inserted.');
    } else {
      console.log('Water activities already exist in the database.');
    }
  } catch (err) {
    console.error('Error checking or inserting water activities:', err);
  }
};


// Connect to MongoDB and initialize default activities
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connection Successful');
    initializeWaterActivities();
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Get all activities
app.get('/activities', async (req, res) => {
  try {
    const activities = await WaterActivity.find();
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
});

// Add a new activity
app.post('/activities', async (req, res) => {
  const { activity, usageRatePerMinute } = req.body;

  if (!activity || !usageRatePerMinute) {
    return res.status(400).json({ error: 'Activity and usage rate per minute are required.' });
  }

  try {
    const newActivity = new WaterActivity({ activity, usageRatePerMinute });
    await newActivity.save();
    res.json(newActivity);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add new activity.' });
  }
});

// Calculate water usage
app.post('/calculate-usage', async (req, res) => {
  const { activity, minutes } = req.body;

  if (!activity || !minutes) {
    return res.status(400).json({ error: 'Activity and minutes are required.' });
  }

  try {
    const activityDoc = await WaterActivity.findOne({ activity });
    if (!activityDoc) {
      return res.status(400).json({ error: 'Invalid activity.' });
    }

    // Calculate total water usage
    const totalUsage = activityDoc.usageRatePerMinute * minutes;
    res.json({ totalUsage });
  } catch (err) {
    res.status(500).json({ error: 'Calculation failed.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
