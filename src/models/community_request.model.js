const mongoose = require('mongoose');

const communityRequestSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Medical Assistance', 'Evacuation', 'Security Escort', 'Supplies', 'Other'], required: true },
    message: { type: String, trim: true },
    incident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    lat: { type: Number },
    lng: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open', index: true },
    helpers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommunityRequest', communityRequestSchema);
