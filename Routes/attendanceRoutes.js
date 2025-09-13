const express = require('express');
const { authenticateTeacher, authenticateUser } = require('../Middlewares/attendanceMiddleware');
const { qrGenerate, qrScan, createLecture, getLectureAttendance } = require('../Controllers/attendanceControllers');
const router = express.Router();


router.post('/generate-qr',authenticateTeacher,qrGenerate);
router.post('/marked',authenticateUser,qrScan);
router.post('/create',createLecture)
router.get('/getLectures',getLectureAttendance)

module.exports  = router