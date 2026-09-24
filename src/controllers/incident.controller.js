const Incident = require('../models/incident.model');
const Group = require('../models/group.model');
const Notification = require('../models/notification.model');
const Hidden = require('../models/hidden.model');

// Create a new incident and notify group members (only) in reporter's groups
exports.createIncident = async (req, res, next) => {
  try {
    const { type, severity, description, lat, lng, neighborhood, imageData } = req.body;
    if (!type || !severity || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const incident = await Incident.create({
      type,
      severity,
      description,
      lat,
      lng,
      neighborhood,
      reportedBy: req.user.id,
      imageData
    });

    // Notify only members of groups the reporter belongs to
    try {
      const groups = await Group.find({ members: req.user.id });
      if (groups && groups.length > 0) {
        const memberIds = new Set();
        groups.forEach(g => (g.members || []).forEach(m => memberIds.add(m.toString())));
        memberIds.delete(req.user.id.toString());
        const targets = Array.from(memberIds);
        if (targets.length > 0) {
          const notifications = targets.map(userId => ({
            user: userId,
            type: 'incident',
            incident: incident._id,
            message: `New ${severity} ${type} reported nearby. Please verify if you can.`
          }));
          await Notification.insertMany(notifications);
        }
      }
    } catch (notifyErr) {
      // Non-fatal; continue
      console.error('Notification creation error:', notifyErr.message);
    }

    res.status(201).json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

// Get incidents, optionally filter by neighborhood, and exclude user's hidden
exports.getIncidents = async (req, res, next) => {
  try {
    const { neighborhood } = req.query;
    const filter = neighborhood ? { neighborhood } : {};
    let incidents = await Incident.find(filter).sort({ createdAt: -1 });
    // Exclude hidden incidents for this user
    try {
      const hidden = await Hidden.find({ user: req.user.id }).select('incident');
      const hiddenSet = new Set(hidden.map(h => String(h.incident)));
      incidents = incidents.filter(i => !hiddenSet.has(String(i._id)));
    } catch (_) {}
    res.status(200).json({ success: true, incidents });
  } catch (error) {
    next(error);
  }
};

// Verify an incident (cannot verify own report, needs 3 unique verifications)
exports.verifyIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = await Incident.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    if (String(incident.reportedBy) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot verify your own report' });
    }

    incident.verifications = Array.isArray(incident.verifications) ? incident.verifications : [];
    const already = incident.verifications.some(v => String(v) === String(req.user.id));
    if (already) {
      return res.status(400).json({ success: false, message: 'You have already verified this incident' });
    }

    incident.verifications.push(req.user.id);
    if (incident.verifications.length >= 3) {
      incident.verified = true;
    }
    await incident.save();
    res.status(200).json({ success: true, incident });
  } catch (error) {
    next(error);
  }
};

// Return list of hidden incidents for current user
exports.getHidden = async (req, res, next) => {
  try {
    const docs = await Hidden.find({ user: req.user.id }).select('incident');
    res.status(200).json({ success: true, hidden: docs.map(d => d.incident) });
  } catch (error) {
    next(error);
  }
};

// Hide an incident for current user
exports.hideIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Ensure incident exists
    const exists = await Incident.findById(id).select('_id');
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    await Hidden.updateOne(
      { user: req.user.id, incident: id },
      { $setOnInsert: { user: req.user.id, incident: id } },
      { upsert: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
