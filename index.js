const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path')


require('dotenv').config();
app.use(cors())
app.use(express.json());

const noticeRoutes = require('./Routes/noticeRoutes')
const authRoutes = require('./Routes/authRoutes')
const collegeRoutes = require('./Routes/collegesRoutes')

app.use('/api',authRoutes)
app.use('/notice',noticeRoutes)
app.use('/info',collegeRoutes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const port = 1000;
app.listen(port,() =>{
    console.log(`backend is running on the port ${port}`)
})