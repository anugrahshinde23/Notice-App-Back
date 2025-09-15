const express = require('express');
const { getColleges, getClasses, getClassesForAttendance } = require('../Controllers/collegesControllers');
const authMiddleware = require('../Middlewares/authMiddleware');
const router = express.Router();


router.get('/colleges',getColleges);
router.get('/classes/:college_id',getClasses);
router.get('/classes',authMiddleware,getClassesForAttendance)

module.exports = router;