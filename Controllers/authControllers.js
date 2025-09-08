const db = require('../db');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
require('dotenv').config();



const register = async(req,res) =>{
    const {name,password,role, college_id, class_id} = req.body

    
try{
    const checkName = await db.query(`SELECT * FROM users WHERE name=$1`,[name]);

    if(checkName.rows.length > 0){
        res.status(400).json({message:"username already exists"})

        
    }
    const hashedPassword = await bcrypt.hash(password,10);

    const result = await db.query(`INSERT INTO users(name,role,password,college_id,class_id) VALUES($1,$2,$3,$4,$5) RETURNING*`,[name,role,hashedPassword,college_id,class_id]);

    res.status(200).json({message : "user registered", user : result.rows[0]});
} catch(err){
    console.error(err);
    res.status(500).json({message : "Error signing in "})
}

}

const login = async(req,res) =>{
    const {name,password} = req.body

    const result = await db.query(`SELECT * FROM users WHERE name=$1`,[name])
    if(result.rows.length === 0){
        return res.status(200).json({message :"user not found"});
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res.status(200).json({message:"password is incorrect"});
    }

    const token =  jwt.sign({id : user.id, name : user.name}, process.env.JWT_SECRET, {expiresIn : '1d'});
    res.json({message : "login sucessfully", token,user})

}

// for the file upload : 
// const uploadNotice = async(req,res) =>{
//     try {
//         const {title, description} = req.body;
//         const filepath = req.fle ? req.file.filename : null;

//         const result = await db.query(
//             `INSERT INTO notices(title, content, file_path) VALUES($1,$2,$3) RETURNING*`[title,description,filepath]
//         );

//         res.status(200).json({message : "uploaded successfully", data : result.rows[0]});
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({message : "failed to upload"});
//     }
// }

const saveToken = async(req,res) =>{
    try {
        const {student_id,fcm_token} = req.body;

        await db.query(`UPDATE users SET fcm_token=$1 WHERE id=$2`,[fcm_token,student_id])
        res.status(200).json({message : "Token saved successfully"});
    } catch (error) {
        console.error("Error saving token:", error.message);
        res.status(500).json({ message: "Error saving token" });
    }
}

module.exports =  {
    register,
    login,
    saveToken
    
}