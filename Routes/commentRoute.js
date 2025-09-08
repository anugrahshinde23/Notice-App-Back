const express = require('express');
const { postComments, getComments } = require('../Controllers/commentControllers');
const router = express.Router();


router.post('/comments',postComments)
router.get('/comments/:noticeId',getComments)

module.exports = router