const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  const { username, password } = req.body
  
  try {
    // 查询用户信息和关联的学段
    const [rows] = await pool.execute(`
      SELECT a.*, GROUP_CONCAT(g.name) as grade_levels 
      FROM admin_info a
      LEFT JOIN admin_grade_relation ag ON a.id = ag.admin_id
      LEFT JOIN grade_level g ON ag.grade_id = g.id
      WHERE a.username = ?
      GROUP BY a.id
    `, [username])

    if (rows.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    const admin = rows[0]

    // 验证密码
    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      })
    }

    // 检查状态
    if (admin.status === 0) {
      return res.status(403).json({
        code: 403,
        message: '账号已被禁用'
      })
    }

    // 生成 token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      'your_jwt_secret',
      { expiresIn: '24h' }
    )

    // 处理学段数据
    const gradeLevels = admin.grade_levels ? admin.grade_levels.split(',') : []

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          roleType: admin.role_type,
          gradeLevels: gradeLevels
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 获取所有学段
const getGradeLevels = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM grade_level')
    res.json({
      code: 200,
      data: rows
    })
  } catch (error) {
    console.error('Get grade levels error:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

module.exports = {
  login,
  getGradeLevels
} 