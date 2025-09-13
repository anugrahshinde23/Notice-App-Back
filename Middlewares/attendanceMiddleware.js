require('dotenv').config();
const QRCode = require('qrcode');
const db = require("../db")
const crypto = require('crypto');
const jwt = require('jsonwebtoken');





function authenticateUser (req,res,next) {
    const auth = req.headers.authorization
    if(!auth) return res.status(401).json({message : "No auth header"});
    const token = auth.split(' ')[1];
    if(!token) return res.status(401).json({message : "Malformed auth header"});

    try {
        const payload =  jwt.verify(token,process.env.JWT_SECRET)
        req.user = payload
        next();

    } catch (err) {
        console.error(err)
        return res.status(401).json({ message: 'Invalid token' });
        
    }
}


function authenticateTeacher(req,res,next) {
    authenticateUser(req,res, () =>{
        if(!req.user || req.user.role !== 'teacher'){
            return res.status(403).json({message : "Teacher only"})
        }

        next();
    });
}

module.exports = {
    authenticateTeacher,
    authenticateUser
}