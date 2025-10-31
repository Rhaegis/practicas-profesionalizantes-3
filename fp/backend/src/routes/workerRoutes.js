const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');

router.get('/nearby', workerController.getNearbyWorkers);

module.exports = router;