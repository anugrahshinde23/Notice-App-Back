const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    
    connectionString : process.env.DB_URL,

    ssl : {rejectUnauthorized : false} // sometimes required on hosted pg
});

module.exports = pool