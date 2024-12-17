const express = require('express')
const cors = require('cors')
const adminRoutes = require('./routes/admin')

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/admin', adminRoutes)

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: '服务器错误'
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 