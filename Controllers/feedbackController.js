const db = require('../db');

const feedBack = async (req,res) =>{
    try {
        const {feedback} = req.body
    const result = await db.query(`INSERT INTO feedback (feedback) VALUES ($1) `,[feedback])
    res.status(200).json({message : "get feedback successfully"});
    } catch (err) {
        console.error(err)
        res.status(400).json({message : "failed to get feedback"} )
    }
}

module.exports = {
    feedBack
}