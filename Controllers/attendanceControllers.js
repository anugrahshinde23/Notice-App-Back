const QRCode = require('qrcode')
const db = require("../db")
const crypto = require('crypto')

const qrGenerate = async(req,res) =>{
   try {
    const today = new Date().toISOString().split("T")[0];
    const token = crypto.randomBytes(12).toString('hex')
    const expiresAt = new Date(Date.now() + 15 *60 * 1000)


    // save token in db  :
    const result = await db.query(

        `INSERT INTO qr_tokens (date,token,expires_at) VALUES ($1,$2,$3) ON CONFLICT (date) DO UPDATE SET token=EXCLUDED.token, created_at=Now(), expires_at=EXCLUDED.expires_at`,[today,token,expiresAt]
    )

    const qrDataUrl = await QRCode.toDataURL(token);
    res.json({qrDataUrl,expiresAt})
   } catch (err) {
    console.error(err)
    res.status(500).json({message : "Server error"});
   }
    
}

const qrScan = async(req,res) =>{
    try {
        const {token} = req.body;
        if(!token) return res.status(400).json({message : "Token required"});

        const q = await db.query(`SELECT * FROM qr_tokens WHERE token = $1 AND expires_at > NOW() `, [token])

        if(q.rows.length === 0){
            return res.status(400).json({message : "Invalid or expired QR token"})

        }
        const tokenRow = q.rows[0];
        const date = tokenRow.date
        const UserId = req.user.id;

        const already = await db.query(`SELECT 1 FROM attendance WHERE user_id=$1 AND date=$2`,[UserId, date]);

        if(already.rows.length > 0){
            return res.status(400).json({message : "Attendance already marked for today"})
        }

        const result = await db.query(`INSERT INTO attendance (user_id,date,status,time_in) VALUES($1,$2,$3,$4) RETURNING* `,[UserId,date,'Present', new Date()]);

        res.json({message : "Attendance marked successfully"})
    } catch (err) {
        console.error(err)
        res.status(500).json({message : "Server Error"});
    }
}

module.exports = {
    qrGenerate,
    qrScan
}