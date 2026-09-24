const CommunityRequest = require('../models/community_request.model');
const Incident = require('../models/incident.model');
const Group = require('../models/group.model');
const Notification = require('../models/notification.model');

// Create a community request
exports.create = async (req, res, next) => {
  try {
    const { type, message, incident, lat, lng } = req.body;
    if (!type) return res.status(400).json({ success: false, message: 'type is required' });
    const doc = await CommunityRequest.create({
      type,
      message,
      incident: incident || undefined,
      lat,
      lng,
      user: req.user.id
    });

    // Notify group members if linked to an incident: members of groups that include the incident reporter
    try {
      if (incident) {
        const inc = await Incident.findById(incident).select('reportedBy severity type');
        if (inc && inc.reportedBy) {
          const groups = await Group.find({ members: inc.reportedBy });
          if (groups && groups.length > 0) {
            const memberIds = new Set();
            groups.forEach(g => (g.members || []).forEach(m => memberIds.add(m.toString())));
            memberIds.delete(req.user.id.toString());
            const targets = Array.from(memberIds);
            if (targets.length > 0) {
              const notifications = targets.map(userId => ({
                user: userId,
                type: 'community',
                incident: inc._id,
                message: `Community request: ${type}${inc ? ` near ${inc.type}` : ''}.`
              }));
              await Notification.insertMany(notifications);
            }
          }
        }
      }
    } catch (_) {}

    const populated = await CommunityRequest.findById(doc._id)
      .populate('incident')
      .populate('helpers', 'name')
      .populate('user', 'name');
    res.status(201).json({ success: true, request: populated });
  } catch (err) {
    next(err);
  }
};

// List open community requests (optionally near an incident or coordinates later)
exports.list = async (req, res, next) => {
  try {
    const requests = await CommunityRequest.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('incident')
      .populate('helpers', 'name')
      .populate('user', 'name');
    res.status(200).json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};

// User volunteers to help on a request
exports.respond = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await CommunityRequest.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found' });
    doc.helpers = Array.isArray(doc.helpers) ? doc.helpers : [];
    const already = doc.helpers.some(h => String(h) === String(req.user.id));
    if (!already) doc.helpers.push(req.user.id);
    await doc.save();
    const populated = await CommunityRequest.findById(doc._id)
      .populate('incident')
      .populate('helpers', 'name')
      .populate('user', 'name');
    res.status(200).json({ success: true, request: populated });
  } catch (err) {
    next(err);
  }
};

// Resolve a request (request owner or admin could resolve; for now allow requester)
exports.resolve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await CommunityRequest.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Request not found' });
    if (String(doc.user) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Only the requester can resolve this for now' });
    }
    doc.status = 'resolved';
    await doc.save();
    const populated = await CommunityRequest.findById(doc._id)
      .populate('incident')
      .populate('helpers', 'name')
      .populate('user', 'name');
    res.status(200).json({ success: true, request: populated });
  } catch (err) {
    next(err);
  }
};
