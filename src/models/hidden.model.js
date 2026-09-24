const mongoose = require('mongoose');

const hiddenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    incident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true, index: true }
  },
  { timestamps: true }
);

hiddenSchema.index({ user: 1, incident: 1 }, { unique: true });

module.exports = mongoose.model('Hidden', hiddenSchema);
