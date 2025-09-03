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

module.exports = {
    getColleges,
    getClasses
}