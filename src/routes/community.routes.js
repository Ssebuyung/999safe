const express = require('express');
const router = express.Router();

const communityController = require('../controllers/community.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', communityController.list);
router.post('/', communityController.create);
router.post('/:id/respond', communityController.respond);
router.post('/:id/resolve', communityController.resolve);

module.exports = router;
