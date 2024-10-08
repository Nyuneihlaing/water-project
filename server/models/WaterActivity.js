const mongoose = require('mongoose');

// Define a schema for water-using activities
const waterActivitySchema = new mongoose.Schema({
  activity: { type: String, required: true },
  usageRatePerMinute: { type: Number, required: true } // Liters per minute
});

// Create and export the WaterActivity model
const WaterActivity = mongoose.model('WaterActivity', waterActivitySchema);

module.exports = WaterActivity;
