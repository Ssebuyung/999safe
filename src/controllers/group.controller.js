const Group = require('../models/group.model');
const Incident = require('../models/incident.model');
const Notification = require('../models/notification.model');

// Create a safety group for a neighborhood
exports.createGroup = async (req, res, next) => {
  try {
    const { name, neighborhood } = req.body;
    if (!name || !neighborhood) {
      return res.status(400).json({ success: false, message: 'Name and neighborhood are required' });
    }

    // Ensure one group per neighborhood
    const existing = await Group.findOne({ neighborhood });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Group already exists for this area', groupId: existing._id });
    }

    const group = await Group.create({
      name,
      neighborhood,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// Join an existing group by neighborhood
exports.joinGroup = async (req, res, next) => {
  try {
    const { neighborhood } = req.body;
    if (!neighborhood) {
      return res.status(400).json({ success: false, message: 'Neighborhood is required' });
    }
    const group = await Group.findOne({ neighborhood });
    if (!group) {
      return res.status(404).json({ success: false, message: 'No group exists for this area' });
    }

    const userId = req.user.id;
    if (!group.members.some(m => m.toString() === userId)) {
      group.members.push(userId);
      await group.save();
    }

    // Notify the newly joined user about existing pending incidents
    try {
      const pendingIncidents = await Incident.find({
        verified: false,
        reportedBy: { $in: group.members }
      }).select('_id type severity');

      if (pendingIncidents.length > 0) {
        // Avoid duplicate notifications for same incident-user
        const existing = await Notification.find({
          user: userId,
          incident: { $in: pendingIncidents.map(i => i._id) }
        }).select('incident');
        const existingSet = new Set(existing.map(n => String(n.incident)));

        const toInsert = pendingIncidents
          .filter(i => !existingSet.has(String(i._id)))
          .map(i => ({
            user: userId,
            type: 'incident',
            incident: i._id,
            message: `Pending ${i.severity} ${i.type} reported in your group. Please verify if you can.`
          }));

        if (toInsert.length > 0) {
          await Notification.insertMany(toInsert);
        }
      }
    } catch (notifyErr) {
      // Non-fatal
      console.error('Post-join notification error:', notifyErr.message);
    }

    res.status(200).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// Get group by neighborhood
exports.getByNeighborhood = async (req, res, next) => {
  try {
    const { neighborhood } = req.query;
    if (!neighborhood) {
      return res.status(400).json({ success: false, message: 'Neighborhood is required' });
    }
    const group = await Group.findOne({ neighborhood });
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    res.status(200).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// Get groups that the current user belongs to
exports.getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user.id });
    res.status(200).json({ success: true, groups });
  } catch (error) {
    next(error);
  }
};
