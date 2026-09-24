const express = require('express');
const router = express.Router();

const incidentController = require('../controllers/incident.controller');
const { protect } = require('../middlewares/auth.middleware');

// All incident routes require authentication
router.use(protect);

router.post('/', incidentController.createIncident);
router.get('/', incidentController.getIncidents);
router.post('/:id/verify', incidentController.verifyIncident);
router.get('/hidden/mine', incidentController.getHidden);
router.post('/:id/hide', incidentController.hideIncident);

module.exports = router;
