const express = require('express')
const app = express();
const cors = require('cors')
const path = require('path')
const {Server} = require('socket.io')
const http = require('http');
const admin = require('./firebase')


require('dotenv').config();
app.use(cors())
app.use(express.json());

app.get('/health',(req,res) =>{
    res.send("i love you jesus")
})

const noticeRoutes = require('./Routes/noticeRoutes')
const authRoutes = require('./Routes/authRoutes')
const collegeRoutes = require('./Routes/collegesRoutes')
const commentRoutes = require('./Routes/commentRoute')
const attendanceRoutes = require('./Routes/attendanceRoutes')
const feedbackRoutes = require('./Routes/feedbackRoutes')


app.use('/api',authRoutes)
app.use('/notice',noticeRoutes)
app.use('/info',collegeRoutes)
app.use('/cmt',commentRoutes)
app.use('/attendance',attendanceRoutes)
app.use('/feedback',feedbackRoutes)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

const socket = require("./socket");
socket.init(server);

const port = process.env.PORT
server.listen(port,() =>{
    console.log(`backend is running on the port ${port}`)
})