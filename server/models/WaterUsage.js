const mongoose = require('mongoose');

const WaterUsageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  usage: [
    {
      activity: {type: String, required: true},
      minutes: {type: Number, required: true }
    }
  ]
});
const WaterUsage = mongoose.model('WaterUsage', WaterUsageSchema);

module.exports = WaterUsage;