const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

const waterActivitySchema = new mongoose.Schema({   // Schema
    activity: String,
    usageRatePerMinute: Number // Liters per minute
  });
  
// Model for water activities
const WaterActivity = mongoose.model('WaterActivity', waterActivitySchema);

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
      
      if (count === 0) { // If there are no docs, insert the default activities
        await WaterActivity.insertMany(defaultActivities);
        console.log('Default water activities inserted.');
      } else {
        console.log('Water activities already exist in the database.');
      }
    } catch (err) {
      console.error('Error checking or inserting water activities:', err);
    }
  };
  
// Connect to MongoDB and initialize data upon successful connection
mongoose.connect(mongoURL)
.then(() => {
    console.log('MongoDB Connection Successful');
    initializeWaterActivities();
})
.catch(err => console.error('Error connecting to MongoDB:', err));

// Start the server
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});


// - - - API End points from here. - - -

// Multiplies 2 numbers, given 2 parameters
app.get('/multiply', (req, res) => {            // Sample call, should give 20: http://localhost:3000/multiply?a=4&b=5
  const { a, b } = req.query;
  const result = Number(a) * Number(b);
  res.json({ result });
});