const db = require('../db');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();

const getColleges = async (req,res)=>{
    try {
        const result = await db.query(`SELECT * FROM colleges`);
        const colleges = result.rows
        res.status(200).json({message : "fetched successfully", colleges});
    } catch (err) {
        console.error(err);
        res.status(500).json({message : "Error fecthing colleges"});
    }
}

const getClasses = async(req,res) =>{
    const {college_id} = req.params;
    try {
        const result = await db.query(`SELECT * FROM classes WHERE college_id=$1`,[college_id]);
        const classes = result.rows
        res.status(200).json({message : "classes fetched successfully", classes}, );
    } catch (err) {
        console.error(err);
        res.status(500).json({message : "Error in fetching the classes"});
    }
}

const getClassesForAttendance = async(req,res) =>{
    try {
        const teacherId = req.user.id;

        const teacherRes = await db.query(`SELECT college_id FROM users WHERE id=$1`,[teacherId])

        if(teacherRes.rows.length == 0){
            return res.status(404).json({message : "Teacher not found"})
        }

        const collegeId = teacherRes.rows[0].college_id

        const collegeRes = await db.query(`SELECT * FROM classes WHERE college_id=$1 ORDER BY name ASC`,[collegeId]);

        res.status(200).json({message : "Classes fetched successfully", classes : collegeRes.rows})
    } catch (err) {
        console.error(err)
        res.status(500).json({message : "Failed to fetch classes"})
        
    }
}

module.exports = {
    getColleges,
    getClasses,
    getClassesForAttendance
}