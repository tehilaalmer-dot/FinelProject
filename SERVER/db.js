import mysql2 from 'mysql2';

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: '21612161',
    database: 'final_project_db',
    waitForConnections: true,
    connectionLimit: 10
});

export default pool.promise();