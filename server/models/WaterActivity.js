const mongoose = require('mongoose');

const WaterActivitySchema = new mongoose.Schema({
  activity: { type: String, required: true },
  usageRatePerMinute: { type: Number, required: true },
});

module.exports = mongoose.model('WaterActivity', WaterActivitySchema);
