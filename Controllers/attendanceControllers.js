const QRCode = require('qrcode')
const db = require("../db")
const crypto = require('crypto')

const qrGenerate = async (req, res) => {
    try {
      const { duration, subject_name, classId, collegeId } = req.body;
      const teacherId = req.user.id; // JWT se aa raha hoga
  
      if (!duration || !subject_name) {
        return res.status(400).json({ message: "Duration & subject required" });
      }
  
      const startTime = new Date();
      const expiresAt = new Date(startTime.getTime() + duration * 60 * 1000);
  
      // 1. Lecture create karo
      const lectureRes = await db.query(
        `INSERT INTO lectures (subject_name, teacher_id, start_time, end_time,class_id,college_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [subject_name, teacherId, startTime, expiresAt, classId,collegeId]
      );
      const lectureId = lectureRes.rows[0].id;
  
      // 2. Token generate & save
      const token = crypto.randomBytes(12).toString("hex");
      await db.query(
        `INSERT INTO qr_tokens (lecture_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [lectureId, token, expiresAt]
      );
  
      // 3. Auto delete token after expiry
      setTimeout(async () => {
        await db.query(`DELETE FROM qr_tokens WHERE token = $1`, [token]);
        console.log(`QR for lecture ${lectureId} expired`);
      }, duration * 60 * 1000);
  
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ lectureId, token }));
      res.json({ qrDataUrl, expiresAt, lectureId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
  const qrScan = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Token required" });
  
      // Token check
      const q = await db.query(
        `SELECT * FROM qr_tokens WHERE token = $1 AND expires_at > NOW()`,
        [token]
      );
  
      if (q.rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired QR token" });
      }
  
      const { lecture_id } = q.rows[0];
      const userId = req.user.id;
  
      // Duplicate attendance check
      const already = await db.query(
        `SELECT 1 FROM attendance WHERE user_id=$1 AND lecture_id=$2`,
        [userId, lecture_id]
      );
      if (already.rows.length > 0) {
        return res.status(400).json({ message: "Attendance already marked for this lecture" });
      }
  
      // Mark attendance
      await db.query(
        `INSERT INTO attendance (user_id, lecture_id, status, time_in)
         VALUES($1, $2, $3, $4)`,
        [userId, lecture_id, "Present", new Date()]
      );
  
      res.json({ message: "Attendance marked successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  };

  

const createLecture = async(req,res) =>{
    try {
        const {subject_name,duration,teacherId} = req.body;

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const result = await pool.query(
            `INSERT INTO lectures (subject_name, teacher_id, start_time, end_time)
             VALUES ($1, $2, $3, $4,$5,$6) RETURNING *`,
            [subject_name, teacherId, startTime, endTime]
          );
      
          res.json(result.rows[0]);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to create lecture" });
    }
}


const getLectureReports = async(req,res) =>{
 try {
  const lectureId = req.params.lectureId;
  const teacherId = req.user.id;
  
  // Lecture Details : 
  const lectureRes = await db.query(
    `SELECT id, subject_name, start_time, end_time FROM lectures WHERE id=$1 AND teacher_id=$2`,[lectureId,teacherId]
  )

  if(lectureRes.rows.length == 0){
    return res.status(404).json({message : "Lecture not found"})
  }

  const lecture = lectureRes.rows[0];

  // Attendance with student details : 
 const attendanceRes = await db.query(
  `SELECT u.name AS student_name,
  l.subject_name,
  COALESCE(a.status, 'ABSENT') AS status,
  a.time_in
  FROM users u
  LEFT JOIN attendance a ON u.id = a.user_id AND a.lecture_id = $1
  INNER JOIN lectures l ON l.id = $1
  WHERE u.role='student'
  AND u.class_id = l.class_id
  AND u.college_id = l.college_id
  ORDER BY u.name ASC
  `,[lectureId]
 )

 const studentAttendance = attendanceRes.rows;

 res.json({
  lecture : {
    subject : lecture.subject_name,
    date : new Date(lecture.start_time).toLocaleDateString("en-IN"),
    start_time : new Date(lecture.start_time).toLocaleTimeString("en-IN", {hour : "2-digit", minute : "2-digit", hour12 : true}),
    end_time : new Date(lecture.end_time).toLocaleTimeString("en-IN", {hour : "2-digit", minute : "2-digit", hour12 : true})
  },

  students : studentAttendance.map(s => ({
    student_name : s.student_name,
    subject : s.subject_name,
    status : s.status,
    time_in : s.time_in ? new Date(s.time_in).toLocaleTimeString("en-IN",{hour : "2-digit", minute : "2-digit" , hour12 : true}) : "-"
  }))
 })
 } catch (err) {
  console.error(err)
  res.json({message : "Server Error"})
  
 }
}
  

module.exports = {
    qrGenerate,
    qrScan,
    createLecture,
    getLectureReports
}