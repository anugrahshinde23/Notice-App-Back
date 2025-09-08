const db = require("../db");
const socket = require("../socket");

const postComments = async (req, res) => {
  try {
    const { notice_id, user_id, user_type, comment, parent_comment_id } =
      req.body;

    const result = await db.query(
      `INSERT INTO comments (notice_id, user_id, user_type, comment, parent_comment_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [notice_id, user_id, user_type, comment, parent_comment_id || null]
    );

    const newComment = result.rows[0];

    // Real-time broadcast
    socket.getIO().to(`notice_${notice_id}`).emit("newComment", newComment);

    res.status(200).json(newComment);
  } catch (error) {
    console.error("❌ postComments error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getComments = async (req, res) => {
  try {
    const noticeId = req.params.noticeId;

    const result = await db.query(
      `SELECT * FROM comments WHERE notice_id=$1 ORDER BY created_at ASC`,
      [noticeId]
    );
    
    const comment = result.rows;

    const map = {};
    comment.forEach(c => {
      c.replies = [],
      map[c.id] = c;
    });

    const rootComments = [];
    comment.forEach(c => {
      if(c.parent_comment_id){
        map[c.parent_comment_id].replies.push(c);
      }else{
        rootComments.push(c);
      }
    })

    res.status(200).json(rootComments);
  } catch (error) {
    console.error("❌ getComments error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  postComments,
  getComments,
};
