const mongoose = require('mongoose');

const waterLimitSchema = new mongoose.Schema({
  limit: { type: Number, required: true },
});

const WaterLimit = mongoose.model('WaterLimit', waterLimitSchema);

module.exports = WaterLimit;
