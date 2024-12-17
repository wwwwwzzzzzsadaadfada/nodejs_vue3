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

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log('数据库连接成功')
    
    // 测试查询
    const [rows] = await connection.execute('SHOW TABLES')
    console.log('当前数据库表:', rows)
    
    connection.release()
  } catch (err) {
    console.error('数据库连接错误:', err)
    process.exit(1)  // 如果数据库连接失败，终止程序
  }
}

testConnection()

module.exports = pool 