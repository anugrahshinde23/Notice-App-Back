const {Pool} = require('pg');
require('dotenv').config();

const pool = new Pool({
    
    connectionString : process.env.DB_URL,

    ssl : {rejectUnauthorized : false} // sometimes required on hosted pg
});

pool.query('SELECT NOW()', (err, res) => {
    if(err){
        console.error('DB Connection Error:', err);
    } else {
        console.log('DB Connected:', res.rows[0]);
    }
    
});

module.exports = pool