const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require('axios');
const categorizeNotice = require("../functions/categorizeNotice");
const { measureMemory } = require("vm");
const admin = require('../firebase');
const { response } = require("express");

// Uploads folder ensure karna
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // files uploads folder mai save hongi
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

/**
 * Create Notice
 */
const create = async (req, res) => {
  try {
    const { title, content, college_id, class_id, created_by } = req.body;
    let filePath = null;

    if (req.file) {
      // Client ko access dene ke liye relative path store karna
      filePath = `/uploads/${req.file.filename}`;
    }

    const createdBy =
      created_by === "null" || created_by === "" || created_by === undefined
        ? null
        : parseInt(created_by);

        

    const classId =
      class_id === "null" || class_id === "" || class_id === undefined
        ? null
        : parseInt(class_id);
        
        const category = categorizeNotice(title,content);  


        const result = await db.query(
          `INSERT INTO notices(title, content, created_by, file_path, college_id, class_id, category) 
           VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [title, content, createdBy, filePath, college_id, classId, category]
        );

    const students = await db.query(`SELECT id, fcm_token FROM users WHERE college_id=$1 and class_id=$2 and role=$3`,[college_id,classId,'student']);

    const tokens = students.rows.map(s => s.fcm_token).filter(token => token) // only non null tokens.

    if(tokens.length > 0){
      const message = {
        notification : {
          title : 'New Notice',
          body : title,
        },
        tokens : tokens,
        data : {
          noticeId : result.rows[0].id.toString(),
        }
      };

      admin.messaging().sendEachForMulticast(message).then(response => {
        console.log("Successfully sent Message", response.successCount)
      })
      .catch(err => console.log("Error sending message", err));
    }

    
   
    

    

    res.status(200).json({ message: "Notice created successfully", notice: result.rows[0] });
  } catch (err) {
    console.error("Error creating notice:", err.message);
    res.status(500).json({ message: "Error creating notice" });
  }
};

/**
 * Get All Notices
 */
const get = async (req, res) => {
  const { college_id, class_id, student_id } = req.params;
  const classId =
    class_id === "null" || class_id === "" || class_id === undefined
      ? null
      : parseInt(class_id);

  try {
    const result = await db.query(
      `SELECT n.*, u.name AS teacher_name,
      COALESCE(r.is_read, false) as is_read
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      LEFT JOIN notice_reads r
      ON n.id = r.notice_id AND r.student_id = $3
      WHERE n.college_id = $1 AND (n.class_id IS NULL OR n.class_id = $2)
      ORDER BY n.created_at DESC`,
      [college_id, classId,student_id]
    );
    

    res.status(200).json({ message: "Fetched successfully", allnotice: result.rows });
  } catch (err) {
    console.error("Error fetching notices:", err.message);
    res.status(500).json({ message: "Error fetching notices" });
  }
};


/**
 * Edit Notice
 */
const edit = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content } = req.body;

    const result = await db.query(
      `UPDATE notices SET title=$1, content=$2 WHERE id=$3 RETURNING *`,
      [title, content, id]
    );

    res.status(200).json({ message: "Updated successfully", notice: result.rows[0] });
  } catch (err) {
    console.error("Error updating notice:", err.message);
    res.status(500).json({ message: "Error updating notice" });
  }
};

/**
 * Delete Notice
 */
const remove = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query(`DELETE FROM notices WHERE id=$1 RETURNING *`, [id]);

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting notice:", err.message);
    res.status(500).json({ message: "Error deleting notice" });
  }
};

const markAsRead = async(req,res) =>{
  try {
    const {noticeId,studentId} = req.body;

    if(!noticeId || !studentId) {
      return res.status(400).json({message : "Missing StudentId and NoticeId"});
    }

    // check record exists : 
    const check = await db.query(`SELECT * FROM notice_reads WHERE notice_id = $1 AND student_id = $2`,[noticeId,studentId]);

    if(check.rows.length > 0){
      await abort.query(`UPDATE notice_reads SET is_read=true , read_at=NOW(), WHERE notice_id = $1, student_id=$2`,[noticeId,studentId]);
    }
    else{
      await db.query(`INSERT INTO notice_reads (notice_id, student_id,is_read) VALUES($1,$2,true)`,[noticeId,studentId]);
    }

    res.status(200).json({message : "Notice Marked as Read"})
  } catch (error) {
    console.error("Error marking notice as read:", error.message);
    res.status(500).json({ message: "Error marking notice as read" });
  }
}

const searchNotice = async (req, res) => {
  try {
    const query = req.query.q || "";

    const result = await db.query(
      `SELECT id, title, content, created_at 
       FROM notices 
       WHERE title ILIKE $1 OR content ILIKE $1
       ORDER BY created_at DESC
       LIMIT 10`,   // limit lagana zaroori hai
      [`%${query}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = {
  create,
  get,
  edit,
  remove,
  upload,
  markAsRead,
  searchNotice
};
