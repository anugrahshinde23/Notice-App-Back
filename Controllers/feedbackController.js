const db = require('../db');

const feedBack = async (req, res) => {
  try {
    console.log("REQ BODY =>", req.body); // Debugging

    const { feedback } = req.body;

    const result = await db.query(
      `INSERT INTO feedback (feedback) VALUES ($1) RETURNING *`,
      [feedback]
    );

    console.log("INSERT RESULT =>", result.rows[0]); // Debugging

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
