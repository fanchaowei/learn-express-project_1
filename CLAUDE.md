# 项目上下文说明

> 本文档为 Claude 提供项目完整上下文，确保任何新对话都能快速理解项目状态。

> 在每次回答我时，都在开头部分叫我的名字，我的名字是：FanChaoWei 。

## 1. 项目目标

**核心目标**：学习使用 Express + PostgreSQL 进行 Web 开发

**项目定位**：这是一个**学习型项目**，不是生产项目。重点是理解概念，而非完整功能。

## 2. 用户背景

- **开发经验**：5年前做过 ASP.NET 开发，使用 SQL Server
- **技术习惯**：习惯写存储过程处理业务逻辑
- **当前状态**：很多知识点已经忘记，需要重新学习
- **学习方法**：采用"递归式填补知识空白"学习法（详见 [learning-methods.md](learning-methods.md)）

## 3. 学习方法论

**递归式填补知识空白**（核心原则）：
1. **从结果倒推原理**：先运行代码看效果，再理解原理
2. **目标导向**：直接从最终目标开始，而非从基础学起
3. **发现盲区**：运行后找出不理解的地方
4. **递归追问**：针对盲区逐层深入，像剥洋葱一样
5. **闭环验证**：复述理解，让 AI 纠正偏差

**对 Claude 的要求**：
- 代码中必须包含详细注释，标注"递归学习提示"
- 提供对比说明（Express vs ASP.NET，PostgreSQL vs SQL Server）
- 鼓励用户提问，而非一次性讲解所有概念

## 4. 技术栈

| 技术 | 版本/说明 | 用途 |
|------|----------|------|
| **Node.js** | - | 运行时环境 |
| **TypeScript** | ^5.3.3 | 类型安全 |
| **Express** | ^4.18.2 | Web 框架 |
| **PostgreSQL** | 17 (Docker) | 数据库 |
| **pg** | ^8.11.3 | PostgreSQL 客户端 |
| **ts-node-dev** | ^2.0.0 | 开发热重载 |

## 5. 项目结构

### 当前架构：3层架构（企业级标准）

```
express-demo-project_2/
├── docker/                    # PostgreSQL Docker 配置
│   ├── docker-compose.yml    # 容器编排
│   └── .env                  # 数据库环境变量
├── src/                      # 源代码
│   ├── config/
│   │   └── database.ts       # 数据库连接池配置 ⭐
│   ├── dao/                  # 数据访问层（新增）
│   │   └── userDAO.ts        # 用户数据访问对象 ⭐
│   ├── services/             # 业务逻辑层（新增）
│   │   └── userService.ts    # 用户业务逻辑 ⭐
│   ├── controllers/          # 控制器层（重构）
│   │   └── userController.ts # HTTP 请求处理 ⭐
│   ├── routes/
│   │   └── userRoutes.ts     # RESTful 路由配置 ⭐
│   ├── scripts/
│   │   └── initDb.ts         # 数据库初始化脚本
│   └── server.ts             # Express 服务器入口 ⭐
├── .env                      # 应用环境变量
├── package.json              # 项目依赖
├── tsconfig.json             # TypeScript 配置
├── README.md                 # 使用说明
├── learning-methods.md       # 学习方法论
└── CLAUDE.md                 # 本文件
```

**⭐ 标记的文件包含详细的学习注释**

### 架构演进历程

**阶段1：2层架构（已完成）**
- ✅ 适合学习初期，快速理解基础概念
- ✅ Controller 包含业务逻辑 + 数据操作
- ✅ 代码流程直观，易于追踪

**阶段2：3层架构（当前）**
- ✅ 符合企业级标准，职责分离清晰
- ✅ Controller（HTTP处理）→ Service（业务逻辑）→ DAO（数据操作）
- ✅ 代码可测试性强，易于维护和扩展

### 3层架构详解

**数据流向**：
```
HTTP 请求
  ↓
路由层 (routes)
  ↓
控制器层 (controllers) - 提取参数、返回响应
  ↓
服务层 (services) - 业务逻辑、数据验证、业务规则
  ↓
数据访问层 (dao) - SQL 操作、事务管理
  ↓
数据库 (PostgreSQL)
```

**各层职责**：

| 层级 | 文件夹 | 职责 | 示例 |
|------|--------|------|------|
| **路由层** | routes/ | URL 路径映射 | `GET /api/users/:id` → `getUserById` |
| **控制器层** | controllers/ | HTTP 请求/响应处理 | 提取参数、调用 Service、返回 JSON |
| **服务层** | services/ | 业务逻辑、数据验证 | 检查邮箱唯一性、用户权限验证 |
| **数据访问层** | dao/ | 数据库 CRUD 操作 | 执行 SQL、事务管理 |

**对比 ASP.NET**：
```
ASP.NET:  RouteConfig → Controller → Service → Repository
Express:  routes     → controller → service → dao
```

### 为什么选择3层架构？

**优势**：
1. ✅ **职责分离**：每层只做一件事，符合单一职责原则
2. ✅ **易于测试**：可以单独测试业务逻辑（Service 层）
3. ✅ **代码复用**：业务逻辑可以在多个 Controller 中复用
4. ✅ **易于维护**：修改业务逻辑不影响 HTTP 处理
5. ✅ **企业标准**：符合大型项目的架构规范

**学习价值**：
- 理解"关注点分离"（Separation of Concerns）
- 理解"依赖倒置"（Dependency Inversion）
- 为学习 ORM（Prisma）打下基础

## 6. 已完成的功能

### 数据库配置
- ✅ PostgreSQL 17 Docker 容器配置
- ✅ 连接池管理（使用 `pg.Pool`）
- ✅ 参数化查询支持（防止 SQL 注入）
- ✅ 事务处理示例

### API 接口（RESTful 设计）

**基础 CRUD 接口**：
- ✅ `GET /api/users` - 获取所有用户
- ✅ `GET /api/users/:id` - 获取单个用户
- ✅ `POST /api/users` - 创建用户
- ✅ `PUT /api/users/:id` - 更新用户
- ✅ `DELETE /api/users/:id` - 删除用户

**高级功能接口**：
- ✅ `POST /api/users/batch` - 批量创建（事务示例）
- ✅ `GET /api/users/stats` - 获取用户统计信息
- ✅ `GET /api/users/page?page=1&pageSize=10` - 分页查询

### 核心功能
- ✅ Express 中间件配置
- ✅ 统一错误处理机制（区分业务异常和系统异常）
- ✅ 请求日志记录
- ✅ 健康检查端点
- ✅ 优雅关闭处理
- ✅ 数据验证（邮箱格式、必填字段等）
- ✅ 业务规则检查（邮箱唯一性等）

## 7. 数据库设计

### users 表结构
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,              -- 自增主键
  name VARCHAR(100) NOT NULL,         -- 用户名
  email VARCHAR(255) NOT NULL UNIQUE, -- 邮箱（唯一）
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

## 8. 关键概念对比（Express vs ASP.NET）

| 概念 | ASP.NET + SQL Server | Express + PostgreSQL |
|------|---------------------|---------------------|
| **路由** | Controller + Action | Router + Handler |
| **中间件** | HTTP Module / OWIN | Express Middleware |
| **参数化查询** | `@param1, @param2` | `$1, $2, $3` |
| **自增主键** | `IDENTITY` | `SERIAL` |
| **返回插入数据** | `SCOPE_IDENTITY()` | `RETURNING *` |
| **连接池** | 内置连接池 | `pg.Pool` |
| **事务** | `TransactionScope` | `BEGIN/COMMIT/ROLLBACK` |
| **业务逻辑** | Service 层 | Service 层 |
| **数据访问** | Repository | DAO |

## 9. 重要设计决策

### 为什么不使用 ORM？
- **当前阶段**：直接使用 SQL 更有助于理解数据库操作
- **学习目的**：理解参数化查询、事务等底层概念
- **下一步**：学习完3层架构后，将引入 Prisma ORM

### 为什么业务逻辑在应用层？
- **现代实践**：Node.js 生态更倾向于应用层处理业务逻辑
- **对比存储过程**：
  - 存储过程：数据库端执行，性能好，但难以测试和版本控制
  - 应用层：易于测试、调试、版本控制，更灵活

### 为什么使用连接池？
- **性能优化**：复用连接，避免频繁创建/销毁的开销
- **资源管理**：限制最大连接数，防止数据库过载
- **类比餐厅**：就像餐厅的服务员池，而非每次有客人就临时招聘

### 为什么使用3层架构？
- **职责分离**：Controller 只处理 HTTP，Service 处理业务逻辑，DAO 处理数据
- **可测试性**：可以单独测试每一层
- **可维护性**：修改一层不影响其他层
- **企业标准**：符合大型项目的架构规范

## 10. 代码注释风格

所有核心文件都包含：
1. **文件头注释**：说明文件用途
2. **递归学习提示**：标注可以进一步追问的概念
3. **核心概念说明**：解释关键技术点
4. **对比说明**：与 ASP.NET/SQL Server 对比
5. **使用场景**：说明何时使用该技术

**示例**：
```typescript
/**
 * 【核心概念】Service 层的职责
 * - 职责：处理业务逻辑、数据验证、业务规则
 * - 原则：不直接操作数据库，通过 DAO 层访问数据
 * - 优势：业务逻辑集中管理，易于测试和复用
 */
```

## 11. 快速启动命令

```bash
# 1. 启动数据库
cd docker && docker-compose up -d && cd ..

# 2. 安装依赖（支持 npm 或 pnpm）
npm install  # 或 pnpm install

# 3. 初始化数据库
npm run db:init

# 4. 启动开发服务器
npm run dev
```

## 12. 常见问题和解决方案

### 用户已确认的问题
1. **可以使用 pnpm 替代 npm** ✅
2. **已从2层架构重构为3层架构** ✅

### 潜在问题
- 数据库连接失败 → 检查 Docker 容器状态
- 端口被占用 → 修改 `.env` 中的 `PORT`
- TypeScript 编译错误 → 重新安装依赖

## 13. 下一步学习建议

### 基础巩固（当前阶段）
1. ✅ 运行项目，测试所有 API
2. ✅ 理解3层架构的职责分离
3. ✅ 对比2层和3层架构的区别
4. ⏳ 尝试添加新功能（例如：用户角色管理）

### 进阶学习（后续阶段）
1. ⏳ 使用 Prisma ORM 替换 DAO 层
2. ⏳ 添加数据验证库（express-validator / joi）
3. ⏳ 添加认证授权（JWT）
4. ⏳ 添加单元测试（Jest）
5. ⏳ 添加 API 文档（Swagger）
6. ⏳ 添加日志系统（Winston / Pino）

## 14. 与 Claude 对话的注意事项

### 必须遵守的原则
1. **使用简体中文**对话
2. **遵循递归式学习法**：先给结果，再解释原理
3. **提供详细注释**：标注"递归学习提示"
4. **对比 ASP.NET**：帮助用户快速理解
5. **鼓励提问**：不要一次性讲解所有内容

### 回答问题的模式
1. **先给答案**：直接回答问题
2. **再给原理**：解释为什么这样做
3. **提供对比**：与用户熟悉的技术对比
4. **引导追问**：提示可以进一步探索的方向

### 示例对话
```
用户：Service 层和 DAO 层有什么区别？
Claude：
✅ 答案：Service 处理业务逻辑，DAO 处理数据库操作
✅ 原理：分离关注点，Service 不关心数据如何存储，DAO 不关心业务规则
✅ 对比：类似 ASP.NET 的 Service 和 Repository 层
✅ 追问：可以进一步了解"如何测试 Service 层"和"如何处理复杂的业务规则"
```

## 15. 项目状态

- **创建时间**：2026-01-27
- **当前状态**：✅ 3层架构重构完成，可正常运行
- **最后更新**：2026-01-28
- **架构版本**：3层架构（Controller → Service → DAO）
- **下一步**：用户测试3层架构，理解各层职责，准备学习 Prisma ORM

---

**重要提醒**：这是一个学习项目，重点是理解3层架构的设计思想和职责分离！
