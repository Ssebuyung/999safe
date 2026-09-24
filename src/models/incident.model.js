const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    description: { type: String, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    neighborhood: { type: String, index: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verified: { type: Boolean, default: false },
    reports: { type: Number, default: 1 },
    imageData: { type: String }, // base64 data URL
    verifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
