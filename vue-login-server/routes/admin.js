const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')

// 登录接口
router.post('/login', adminController.login)

// 用户管理接口
router.get('/users', adminController.getUsers)
router.post('/users', adminController.addUser)
router.put('/users/:id', adminController.updateUser)
router.delete('/users/:id', adminController.deleteUser)
router.put('/users/:id/status', adminController.changeUserStatus)

module.exports = router 