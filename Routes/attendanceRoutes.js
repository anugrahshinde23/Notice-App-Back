const express = require('express');
const { authenticateTeacher, authenticateUser } = require('../Middlewares/attendanceMiddleware');
const { qrGenerate, qrScan, createLecture } = require('../Controllers/attendanceControllers');
const router = express.Router();


router.post('/generate-qr',authenticateTeacher,qrGenerate);
router.post('/marked',authenticateUser,qrScan);
router.post('/create',createLecture)

module.exports  = router