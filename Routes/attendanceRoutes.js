const express = require('express');
const { authenticateTeacher, authenticateUser } = require('../Middlewares/attendanceMiddleware');
const { qrGenerate, qrScan } = require('../Controllers/attendanceControllers');
const router = express.Router();


router.post('/generate-qr',authenticateTeacher,qrGenerate);
router.post('/marked',authenticateUser,qrScan);

module.exports  = router