const express = require('express');
const { authenticateTeacher, authenticateUser } = require('../Middlewares/attendanceMiddleware');
const { qrGenerate, qrScan, createLecture, getLectureReports } = require('../Controllers/attendanceControllers');
const authMiddleware = require('../Middlewares/authMiddleware');
const router = express.Router();


router.post('/generate-qr',authenticateTeacher,qrGenerate);
router.post('/marked',authenticateUser,qrScan);
// router.post('/create',createLecture)
router.get('/teacher-report/:lectureId',authMiddleware, getLectureReports)

module.exports  = router