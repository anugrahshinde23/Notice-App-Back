const db = require('../db');
const bcrypt = require('bcrypt')

const feedBack = async (req, res) => {
  try {
    

    const { feedback } = req.body;

    const result = await db.query(
      `INSERT INTO feedback (feedback) VALUES ($1) RETURNING *`,
      [feedback]
    );

    

    res.status(200).json({ 
      message: "Feedback saved successfully", 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("DB ERROR =>", err);
    res.status(400).json({ message: "Failed to save feedback", error: err.message });
  }
};

const resetPassword = async(req,res) => {
  
    const {username, newPassword} = req.body;
    if(!username || !newPassword){
      return res.status(400).json({message : "username and password required"})
    }

    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const result = await db.query(`UPDATE users SET password=$1 WHERE name=$2 RETURNING*`,[hashedNewPassword,username]);
      if(result.rowCount == 0){
        return res.status(400).json({message : "User Not Found"})
      }

      res.status(200).json({message : "Password Updated successfully"})
    } catch (error) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }

 
}

module.exports = { feedBack, resetPassword};
