const express = require('express');
const router = express.Router();

const groupController = require('../controllers/group.controller');
const { protect } = require('../middlewares/auth.middleware');

// All group routes require authentication
router.use(protect);

router.post('/create', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/by-neighborhood', groupController.getByNeighborhood);
router.get('/mine', groupController.getMyGroups);

module.exports = router;
