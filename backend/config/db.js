const { Pool } = require('pg');

const pool = new Pool({
    user: 'csce331_44', 
    host: 'csce-315-db.engr.tamu.edu',
    database: 'csce331_44', 
    password: 'cowboys44',
    port: 5432,
});

pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL');
        client.release();
    })
    .catch(err => console.error('Connection error', err.stack));

module.exports = pool; 