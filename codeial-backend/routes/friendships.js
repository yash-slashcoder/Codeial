const express = require('express');

const router = express.Router();
const friendshipsController = require('../controllers/friendships_controller');

router.get('/toggle', friendshipsController.toggleFriends);

module.exports = router;