# Express + PostgreSQL 学习项目

> 基于"递归式填补知识空白"学习法的最小项目骨架

## 📚 项目简介

这是一个使用 TypeScript 编写的 Express + PostgreSQL 最小项目骨架，专为学习设计。

**核心特点：**
- ✅ 完整的 CRUD 操作示例
- ✅ 详细的代码注释（支持递归式学习）
- ✅ RESTful API 设计
- ✅ 事务处理示例
- ✅ 连接池管理
- ✅ TypeScript 类型安全

## 🚀 快速开始

### 1️⃣ 启动 PostgreSQL 数据库

```bash
# 进入 docker 目录
cd docker

# 启动 PostgreSQL 容器
docker-compose up -d

# 查看容器状态
docker-compose ps
```

### 2️⃣ 安装依赖

```bash
# 返回项目根目录
cd ..

# 安装 npm 依赖
npm install
```

### 3️⃣ 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件（如果需要修改配置）
```

### 4️⃣ 初始化数据库

```bash
# 运行数据库初始化脚本
npm run db:init
```

**这个脚本会：**
- 创建 `users` 表
- 创建索引
- 插入示例数据

### 5️⃣ 启动开发服务器

```bash
# 启动开发服务器（支持热重载）
npm run dev
```

服务器启动后，访问：
- 健康检查：http://localhost:3000/health
- 用户API：http://localhost:3000/api/users

## 📁 项目结构

```
express-demo-project_2/
├── docker/                    # Docker 配置
│   ├── docker-compose.yml    # PostgreSQL 容器配置
│   └── .env                  # 数据库环境变量
├── src/                      # 源代码目录
│   ├── config/              # 配置文件
│   │   └── database.ts      # 数据库连接配置 ⭐
│   ├── controllers/         # 控制器（业务逻辑）
│   │   └── userController.ts # 用户控制器 ⭐
│   ├── routes/              # 路由配置
│   │   └── userRoutes.ts    # 用户路由 ⭐
│   ├── scripts/             # 工具脚本
│   │   └── initDb.ts        # 数据库初始化脚本
│   └── server.ts            # 服务器入口文件 ⭐
├── .env.example             # 环境变量模板
├── package.json             # 项目依赖
├── tsconfig.json            # TypeScript 配置
└── README.md                # 项目说明（本文件）
```

**⭐ 标记的文件包含详细的学习注释**

## 🔌 API 接口文档

### 基础信息
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json`

### 用户接口

#### 1. 获取所有用户
```http
GET /api/users
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "张三",
      "email": "zhangsan@example.com",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### 2. 获取单个用户
```http
GET /api/users/:id
```

#### 3. 创建用户
```http
POST /api/users
Content-Type: application/json

{
  "name": "赵六",
  "email": "zhaoliu@example.com"
}
```

#### 4. 更新用户
```http
PUT /api/users/:id
Content-Type: application/json

{
  "name": "赵六（更新）",
  "email": "zhaoliu_new@example.com"
}
```

#### 5. 删除用户
```http
DELETE /api/users/:id
```

#### 6. 批量创建用户（事务示例）
```http
POST /api/users/batch
Content-Type: application/json

{
  "users": [
    { "name": "用户1", "email": "user1@example.com" },
    { "name": "用户2", "email": "user2@example.com" }
  ]
}
```

## 🎯 递归式学习路径

### 第一层：运行项目（目标导向）
1. ✅ 按照"快速开始"步骤运行项目
2. ✅ 使用 Postman 或 curl 测试 API
3. ✅ 观察控制台输出的日志

### 第二层：理解核心概念（发现盲区）
当你运行项目后，可能会有这些疑问：

**关于数据库连接：**
- ❓ 什么是连接池？为什么需要它？
- ❓ `Pool` 和直接连接有什么区别？
- 👉 查看：`src/config/database.ts`

**关于 Express：**
- ❓ 什么是中间件（middleware）？
- ❓ `express.json()` 的作用是什么？
- 👉 查看：`src/server.ts`

**关于路由和控制器：**
- ❓ 为什么要分离路由和控制器？
- ❓ RESTful API 的设计原则是什么？
- 👉 查看：`src/routes/userRoutes.ts` 和 `src/controllers/userController.ts`

**关于参数化查询：**
- ❓ 什么是 SQL 注入？如何防止？
- ❓ `$1, $2` 占位符是如何工作的？
- 👉 查看：`src/controllers/userController.ts` 中的查询示例

**关于事务：**
- ❓ 什么是事务？为什么需要它？
- ❓ BEGIN/COMMIT/ROLLBACK 的作用是什么？
- 👉 查看：`src/controllers/userController.ts` 中的 `batchCreateUsers`

### 第三层：深入原理（递归追问）
针对每个盲区，继续向下挖掘：

**示例：理解连接池**
1. 什么是连接池？ → 复用连接的机制
2. 为什么需要复用？ → 创建连接的开销很大
3. 开销体现在哪里？ → TCP 握手、认证、资源分配
4. 如何配置连接池？ → max、idleTimeout 等参数
5. 参数如何影响性能？ → 根据并发量和资源调整

### 第四层：闭环验证（确认理解）
- 📝 尝试修改代码，观察效果
- 📝 向 AI 复述你的理解，让 AI 纠正
- 📝 尝试添加新功能（例如：添加分页功能）

## 🔍 对比 ASP.NET + SQL Server

如果你有 ASP.NET 背景，这些对比会帮助你快速理解：

| 概念 | ASP.NET + SQL Server | Express + PostgreSQL |
|------|---------------------|---------------------|
| **路由** | Controller + Action | Router + Handler |
| **中间件** | HTTP Module / OWIN | Express Middleware |
| **参数化查询** | `@param1, @param2` | `$1, $2, $3` |
| **自增主键** | `IDENTITY` | `SERIAL` |
| **返回插入数据** | `SCOPE_IDENTITY()` | `RETURNING *` |
| **连接池** | 内置连接池 | `pg.Pool` |
| **事务** | `TransactionScope` | `BEGIN/COMMIT/ROLLBACK` |
| **ORM** | Entity Framework | Prisma / TypeORM（本项目未使用）|

## 🛠️ 常用命令

```bash
# 开发模式（热重载）
npm run dev

# 编译 TypeScript
npm run build

# 生产模式运行
npm start

# 初始化数据库
npm run db:init
```

## 📖 下一步学习建议

1. **添加数据验证**：使用 `express-validator` 或 `joi`
2. **添加错误处理**：统一的错误处理中间件
3. **添加日志系统**：使用 `winston` 或 `pino`
4. **添加认证授权**：JWT 或 Session
5. **使用 ORM**：Prisma 或 TypeORM
6. **添加测试**：Jest + Supertest
7. **添加 API 文档**：Swagger / OpenAPI

## 💡 学习提示

**遇到不理解的概念时：**
1. 先运行代码，观察效果
2. 阅读代码注释中的"递归学习提示"
3. 向 AI 提问具体的概念
4. 尝试修改代码，验证理解
5. 向 AI 复述理解，获得反馈

**记住：从结果倒推原理，而不是从原理推导结果！**

## 🐛 常见问题

### 数据库连接失败
```bash
# 检查 PostgreSQL 容器是否运行
cd docker && docker-compose ps

# 查看容器日志
docker-compose logs postgres
```

### 端口被占用
```bash
# 修改 .env 文件中的 PORT 配置
PORT=3001
```

### TypeScript 编译错误
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📝 许可证

MIT License - 自由学习和使用
