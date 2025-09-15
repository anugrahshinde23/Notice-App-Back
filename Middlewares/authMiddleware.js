const jwt = require('jsonwebtoken')


const authMiddleware = async(req,resizeBy,next) =>{
    try {
        const authHeader = req.headers["authorization"]
        if(!authHeader) {
            return res.status(404).json({message : "No token provided"})
        }

      // format Bearer <token> : 
      const token = authHeader.split(" ")[1]
      if(!token){
        return res.status(404).json({message : "Invalid token format"})
      }

      // verify token : 
      jwt.verify(token,process.env.JWT_SECRET,(err,decoded) =>{
        if(err) return res.status(403).json({message : "Invalid or expired token "})

            req.user = decoded;
            next();
      })

     

    } catch (err) {
        console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error" });
    }
}

module.exports = authMiddleware