const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'wzt123456',
  database: 'node_vue',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool 