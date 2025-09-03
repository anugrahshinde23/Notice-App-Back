const express = require('express');
const { create, get, edit, remove, upload } = require('../Controllers/noticeControllers');
const router = express.Router();
const multer = require('multer');
const { uploadNotice } = require('../Controllers/authControllers');
const path = require('path');

// multer config : 

// const storage = multer.diskStorage({
//     destination : (req,file,cb) => cb(null,"uploads/"),
//     filename : (req, file, cb) => cb(null,Date.now() + path.extname(file.originalname)) 
// });

// const upload = multer({ 
//     storage : storage
// });


// router.post('/upload', upload.single("file"),uploadNotice);
router.post('/create',upload.single("file"),create);
router.get('/get',get);
router.put('/edit/:id',edit)
router.delete('/delete/:id',remove)

module.exports = router