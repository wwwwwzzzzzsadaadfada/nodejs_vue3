const express = require('express')
const router = express.Router()
const { login, getGradeLevels } = require('../controllers/admin')

// 登录路由
router.post('/login', login)

// 获取学段列表
router.get('/grade-levels', getGradeLevels)

module.exports = router 