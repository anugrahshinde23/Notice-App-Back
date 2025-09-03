const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    const { title, content } = req.body;
    let filePath = null;

    if (req.file) {
      // Client ko access dene ke liye relative path store karna
      filePath = `/uploads/${req.file.filename}`;
    }

    const result = await db.query(
      `INSERT INTO notices(title, content, file_path) VALUES($1, $2, $3) RETURNING *`,
      [title, content, filePath]
    );

    res
      .status(200)
      .json({ message: "created successfully", notice: result.rows[0] });
  } catch (err) {
    console.error("Error creating notice:", err.message);
    res.status(500).json({ message: "Error creating notice" });
  }
};

/**
 * Get All Notices
 */
const get = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM notices ORDER BY created_at DESC`);
    res
      .status(200)
      .json({ message: "fetched successfully", allnotice: result.rows });
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

    res
      .status(200)
      .json({ message: "updated successfully", notice: result.rows[0] });
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

    res.status(200).json({ message: "deleted successfully" });
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
