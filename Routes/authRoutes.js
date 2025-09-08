const express = require('express');
const { register, login, saveToken } = require('../Controllers/authControllers');
const router = express.Router();

router.post('/register',register);
router.post('/login',login)
router.post('/save-token',saveToken)

module.exports = router