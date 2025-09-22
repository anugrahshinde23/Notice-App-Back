const express = require('express');
const { feedBack, resetPassword } = require('../Controllers/feedbackController');
const router = express.Router();

router.post('/save-feedback',feedBack)
router.post('/reset-password', resetPassword)

module.exports = router