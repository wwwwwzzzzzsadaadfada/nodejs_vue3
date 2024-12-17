# Vue3 后台管理系统

基于 Vue3 + Element Plus 的现代化后台管理系统。

## 技术栈

- 💪 Vue 3 + Vite
- 🎨 Element Plus
- 📦 Vuex 4
- 🚦 Vue Router 4
- 🔑 JWT 认证
- 📝 JavaScript
- 🎯 Axios 请求
- 💾 MySQL

## 功能特性

- ✨ 用户登录/注销
- 📋 用户信息管理
- 🔒 密码修改
- 📊 数据统计
- 🔍 数据检索
- 📁 文件管理
- ⚙️ 系统配置
- 👥 权限管理

## 开始使用

1. 克隆项目
```bash
git clone https://github.com/你的用户名/仓库名.git
```

2. 安装依赖
```bash
# 前端依赖
cd 项目目录
npm install

# 后端依赖
cd vue-login-server
npm install
```

3. 配置数据库
- 创建 MySQL 数据库
- 导入数据库文件
- 配置数据库连接

4. 启动服务
```bash
# 启动前端
npm run dev

# 启动后端
cd vue-login-server
npm run dev
```

5. 访问系统
- 前端地址：http://localhost:5173
- 后端地址：http://localhost:3000

## 项目结构

```
├── public/                 # 静态资源
├── src/                    # 源代码
│   ├── api/               # API 请求
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── layout/            # 布局组件
│   ├── router/            # 路由配置
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── vue-login-server/      # 后端服务
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── routes/            # 路由
│   └── app.js            # 服务入口
└── package.json           # 项目配置
```

## 开发计划

- [ ] 完善用户管理
- [ ] 添加角色管理
- [ ] 实现权限控制
- [ ] 优化界面交互
- [ ] 添加数据导出
- [ ] 完善系统监控

## 贡献指南

1. Fork 本仓库
2. 创建新分支 `git checkout -b feature/xxx`
3. 提交代码 `git commit -m 'add: xxx'`
4. 推送到分支 `git push origin feature/xxx`
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE)
