const express = require('express');
const { feedBack } = require('../Controllers/feedbackController');
const router = express.Router();

router.post('/save-feedback',feedBack)

module.exports = router