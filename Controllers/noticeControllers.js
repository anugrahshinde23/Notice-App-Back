const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require('axios');

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

        console.log(createdBy);

    const classId =
      class_id === "null" || class_id === "" || class_id === undefined
        ? null
        : parseInt(class_id);

    
    const result = await db.query(
      `INSERT INTO notices(title, content, created_by, file_path, college_id, class_id) 
       VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, content, createdBy, filePath, college_id, classId]
    );

    const noticeId = result.rows[0].id;

    
    const targetResult = await db.query(
      `SELECT player_id, id as student_id FROM users 
       WHERE college_id = $1 
         AND class_id = $2 
        
         AND player_id IS NOT NULL`,
      [college_id, classId]
    );

    const playerIds = targetResult.rows.map(r => r.player_id);


    
    if (playerIds.length > 0) {
      await axios.post(
        "https://onesignal.com/api/v1/notifications",
        {
          app_id: "0c5ab1a4-cb63-4475-8897-01b7d9452b1a", 
          include_player_ids: playerIds,
          headings: { en: title },
          contents: { en: content },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": "os_v2_app_brnldjglmnchlcexag35srjldicq33gtvvse2u4gcbnh325ilyzlk75vvoaxdcfb6mgfznsfrpluncevnx5xjwk5flxq3qqhm3dybsy",
          },
        }
      );
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
  const { college_id, class_id } = req.params;
  const classId =
    class_id === "null" || class_id === "" || class_id === undefined
      ? null
      : parseInt(class_id);

  try {
    const result = await db.query(
      `SELECT n.*, u.name AS teacher_name
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.college_id = $1 AND (n.class_id IS NULL OR n.class_id = $2)
      ORDER BY n.created_at DESC`,
      [college_id, classId]
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

module.exports = {
  create,
  get,
  edit,
  remove,
  upload,
};
