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

    // 直接比较密码（临时测试用）
    if (password !== '123456') {
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

// 获取用户列表
const getUsers = async (req, res) => {
  const { pageNum = 1, pageSize = 10, username = '', roleType = '' } = req.query
  console.log('Query params:', { pageNum, pageSize, username, roleType })
  const offset = (parseInt(pageNum) - 1) * parseInt(pageSize)
  
  try {
    let sql = `
      SELECT 
        a.id, a.username, a.nickname, a.role_type as roleType, 
        a.status, DATE_FORMAT(a.create_time, '%Y-%m-%d %H:%i:%s') as createTime,
        GROUP_CONCAT(g.name) as gradeLevels
      FROM admin_info a
      LEFT JOIN admin_grade_relation ag ON a.id = ag.admin_id
      LEFT JOIN grade_level g ON ag.grade_id = g.id
      WHERE 1=1
    `
    let params = []
    let countParams = []

    if (username) {
      sql += ` AND a.username LIKE ?`
      params.push(`%${username}%`)
      countParams.push(`%${username}%`)
    }

    if (roleType) {
      sql += ` AND a.role_type = ?`
      params.push(parseInt(roleType))
      countParams.push(parseInt(roleType))
    }

    // 获取总数
    let countSql = `SELECT COUNT(DISTINCT a.id) as total FROM admin_info a WHERE 1=1`
    if (username) {
      countSql += ` AND a.username LIKE ?`
    }
    if (roleType) {
      countSql += ` AND a.role_type = ?`
    }
    
    console.log('Count SQL:', countSql)
    console.log('Count params:', countParams)
    
    const [countRows] = await pool.execute(countSql, countParams)
    console.log('Count result:', countRows)
    const total = countRows[0].total

    // 分组和分页
    sql += ` GROUP BY a.id ORDER BY a.id DESC`
    
    // 使用字符串拼接的方式处理分页参数
    sql += ` LIMIT ${parseInt(pageSize)} OFFSET ${offset}`
    
    console.log('执行的 SQL:', sql)
    console.log('SQL 参数:', params)

    const [rows] = await pool.execute(sql, params)
    console.log('Query result:', rows)
    
    // 处理数据格式
    const list = rows.map(row => ({
      ...row,
      gradeLevels: row.gradeLevels ? row.gradeLevels.split(',') : []
    }))

    res.json({
      code: 200,
      data: {
        list,
        total,
        pageNum: parseInt(pageNum),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (error) {
    console.error('查询失败:', error)
    console.error('错误堆栈:', error.stack)
    res.status(500).json({
      code: 500,
      message: '查询失败: ' + error.message
    })
  }
}

// 添加用户
const addUser = async (req, res) => {
  const { username, nickname, password, roleType, gradeLevels } = req.body

  try {
    // 检查用户名是否存在
    const [existUser] = await pool.execute(
      'SELECT id FROM admin_info WHERE username = ?',
      [username]
    )

    if (existUser.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 添加用户
    const [result] = await pool.execute(
      `INSERT INTO admin_info (username, nickname, password, role_type, status)
       VALUES (?, ?, ?, ?, 1)`,
      [username, nickname, hashedPassword, roleType]
    )

    const adminId = result.insertId

    // 添加学段关联
    if (gradeLevels && gradeLevels.length > 0) {
      // 为每个学段创建关联记录
      const insertValues = gradeLevels.map(() => '(?, ?)').join(',')
      const insertParams = gradeLevels.reduce((acc, grade) => {
        acc.push(adminId, grade)
        return acc
      }, [])

      await pool.execute(
        `INSERT INTO admin_grade_relation (admin_id, grade_id)
         SELECT ?, id FROM grade_level WHERE name = ?`,
        [adminId, gradeLevels[0]]  // 先插入第一个
      )

      // 如果有多个学段，继续插入其他的
      for(let i = 1; i < gradeLevels.length; i++) {
        await pool.execute(
          `INSERT INTO admin_grade_relation (admin_id, grade_id)
           SELECT ?, id FROM grade_level WHERE name = ?`,
          [adminId, gradeLevels[i]]
        )
      }
    }

    res.json({
      code: 200,
      message: '添加成功'
    })
  } catch (error) {
    console.error('Add user error:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 更新用户
const updateUser = async (req, res) => {
  const { id } = req.params
  const { nickname, roleType, gradeLevels } = req.body

  try {
    // 更新用户信息
    await pool.execute(
      `UPDATE admin_info 
       SET nickname = ?, role_type = ?
       WHERE id = ?`,
      [nickname, roleType, id]
    )

    // 更新学段关联
    // 先删除原有关联
    await pool.execute('DELETE FROM admin_grade_relation WHERE admin_id = ?', [id])
    
    // 添加新的关联
    if (gradeLevels && gradeLevels.length > 0) {
      // 逐个插入学段关联
      for(const grade of gradeLevels) {
        await pool.execute(
          `INSERT INTO admin_grade_relation (admin_id, grade_id)
           SELECT ?, id FROM grade_level WHERE name = ?`,
          [id, grade]
        )
      }
    }

    res.json({
      code: 200,
      message: '更新成功'
    })
  } catch (error) {
    console.error('Update user error:', error)
    console.error('Error details:', {
      id,
      nickname,
      roleType,
      gradeLevels,
      errorMessage: error.message,
      sqlMessage: error.sqlMessage
    })
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 删除用户
const deleteUser = async (req, res) => {
  const { id } = req.params

  try {
    // 删除学段关联
    await pool.execute('DELETE FROM admin_grade_relation WHERE admin_id = ?', [id])
    
    // 删除用户
    await pool.execute('DELETE FROM admin_info WHERE id = ?', [id])

    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

// 修改用户状态
const changeUserStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    await pool.execute(
      'UPDATE admin_info SET status = ? WHERE id = ?',
      [status, id]
    )

    res.json({
      code: 200,
      message: '状态修改成功'
    })
  } catch (error) {
    console.error('Change user status error:', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}

module.exports = {
  login,
  getGradeLevels,
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  changeUserStatus
} 