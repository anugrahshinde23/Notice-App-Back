const express = require('express');
const { getColleges, getClasses } = require('../Controllers/collegesControllers');
const router = express.Router();


router.get('/colleges',getColleges);
router.get('/classes/:college_id',getClasses);

module.exports = router;