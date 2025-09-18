const db = require('../db');

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

module.exports = { feedBack };
