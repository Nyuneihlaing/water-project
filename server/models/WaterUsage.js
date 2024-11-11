// WaterUsage.js
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const WaterUsageSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  usage: [
    {
      entryId: { type: ObjectId, default: new mongoose.Types.ObjectId() }, // a unique id
      activity: { type: String, required: true },
      minutes: { type: Number, required: true }
    }
  ]
});

const WaterUsage = mongoose.model('WaterUsage', WaterUsageSchema);
module.exports = WaterUsage;
