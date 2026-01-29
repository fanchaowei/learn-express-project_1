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
| **pg** | ^8.11.3 | PostgreSQL 客户端（原生 SQL） |
| **Prisma** | ^7.3.0 | ORM（对象关系映射）⭐ 新增 |
| **@prisma/client** | ^7.3.0 | Prisma 客户端 ⭐ 新增 |
| **ts-node-dev** | ^2.0.0 | 开发热重载 |

## 5. 项目结构

### 当前架构：3层架构（企业级标准）

```
express-demo-project_2/
├── docker/                    # PostgreSQL Docker 配置
│   ├── docker-compose.yml    # 容器编排
│   └── .env                  # 数据库环境变量
├── prisma/                   # Prisma 配置（新增）⭐
│   └── schema.prisma         # Prisma Schema 定义 ⭐
├── src/                      # 源代码
│   ├── config/
│   │   └── database.ts       # 数据库连接池配置 ⭐
│   ├── dao/                  # 数据访问层
│   │   ├── userDAO.ts        # 原生 SQL 版本 ⭐
│   │   └── userDAO.prisma.ts # Prisma ORM 版本 ⭐ 新增
│   ├── services/             # 业务逻辑层
│   │   └── userService.ts    # 用户业务逻辑 ⭐
│   ├── controllers/          # 控制器层
│   │   └── userController.ts # HTTP 请求处理 ⭐
│   ├── routes/
│   │   └── userRoutes.ts     # RESTful 路由配置 ⭐
│   ├── scripts/
│   │   └── initDb.ts         # 数据库初始化脚本
│   ├── generated/            # Prisma 生成的代码（新增）
│   │   └── prisma/           # Prisma Client
│   └── server.ts             # Express 服务器入口 ⭐
├── docs/                     # 文档（新增）
│   └── prisma-vs-native-sql.md # 原生 SQL vs Prisma 对比 ⭐
├── .env                      # 应用环境变量
├── prisma.config.ts          # Prisma 配置文件（新增）⭐
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

**阶段2：3层架构（已完成）**
- ✅ 符合企业级标准，职责分离清晰
- ✅ Controller（HTTP处理）→ Service（业务逻辑）→ DAO（数据操作）
- ✅ 代码可测试性强，易于维护和扩展

**阶段3：Prisma ORM（当前）**
- ✅ 学习 ORM 的概念和优势
- ✅ 对比原生 SQL 和 Prisma ORM
- ✅ 保留两种实现方式，便于对比学习
- ⏳ 在实际项目中选择合适的数据访问方式

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

| 概念 | ASP.NET + SQL Server | Express + PostgreSQL (原生) | Express + Prisma ORM |
|------|---------------------|------------------------|---------------------|
| **路由** | Controller + Action | Router + Handler | Router + Handler |
| **中间件** | HTTP Module / OWIN | Express Middleware | Express Middleware |
| **参数化查询** | `@param1, @param2` | `$1, $2, $3` | 自动处理 |
| **自增主键** | `IDENTITY` | `SERIAL` | `@default(autoincrement())` |
| **返回插入数据** | `SCOPE_IDENTITY()` | `RETURNING *` | 自动返回 |
| **连接池** | 内置连接池 | `pg.Pool` | `PrismaClient`（内置） |
| **事务** | `TransactionScope` | `BEGIN/COMMIT/ROLLBACK` | `$transaction` |
| **业务逻辑** | Service 层 | Service 层 | Service 层 |
| **数据访问** | Repository | DAO | DAO |
| **类型安全** | Entity Framework | 手动定义接口 | 自动生成类型 |
| **ORM** | Entity Framework | - | Prisma |

## 9. 重要设计决策

### 为什么同时保留原生 SQL 和 Prisma ORM？
- **学习目的**：理解 ORM 的价值，知道它在底层做了什么
- **对比学习**：通过对比两种实现方式，理解各自的优缺点
- **灵活选择**：在实际项目中，根据场景选择合适的方式
  - 90% 的场景：使用 Prisma（类型安全、快速开发）
  - 10% 的场景：使用原生 SQL（复杂查询、性能优化）

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

## 13. Prisma ORM 学习（新增）⭐

### 什么是 Prisma？

**Prisma** 是一个现代化的 TypeScript ORM（对象关系映射）工具。

**核心概念**：
- **ORM**：将数据库表映射为对象，用对象方法操作数据库
- **类型安全**：自动生成 TypeScript 类型，编译时检查错误
- **声明式**：描述"是什么"，而非"怎么做"

**对比 Entity Framework**：
- Prisma 类似于 ASP.NET 的 Entity Framework
- 都是 ORM，都提供类型安全
- Prisma 使用 Schema 文件，EF 使用 C# 类

### Prisma 核心组件

| 组件 | 作用 | 文件 |
|------|------|------|
| **Prisma Schema** | 定义数据模型 | `prisma/schema.prisma` |
| **Prisma Client** | 自动生成的数据库客户端 | `src/generated/prisma` |
| **Prisma CLI** | 命令行工具 | `npx prisma` |
| **Prisma Config** | 配置文件 | `prisma.config.ts` |

### 原生 SQL vs Prisma ORM

#### 代码对比示例

**查询所有用户**：
```typescript
// 原生 SQL
const result = await query('SELECT * FROM users ORDER BY created_at DESC');
const users = result.rows;

// Prisma ORM
const users = await prisma.user.findMany({
  orderBy: { createdAt: 'desc' }
});
```

**创建用户**：
```typescript
// 原生 SQL
const result = await query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
  [name, email]
);
const user = result.rows[0];

// Prisma ORM
const user = await prisma.user.create({
  data: { name, email }
});
```

**批量创建（事务）**：
```typescript
// 原生 SQL（30+ 行代码）
const client = await getClient();
try {
  await client.query('BEGIN');
  // ... 循环插入
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
} finally {
  client.release();
}

// Prisma ORM（5 行代码）
await prisma.$transaction(
  usersData.map(data => prisma.user.create({ data }))
);
```

### Prisma 的优势

| 优势 | 说明 | 价值 |
|------|------|------|
| ✅ **类型安全** | 编译时检查，避免运行时错误 | 提高代码质量 |
| ✅ **自动补全** | IDE 智能提示所有可用方法 | 提高开发效率 |
| ✅ **防止 SQL 注入** | 自动处理参数化查询 | 提高安全性 |
| ✅ **简化事务** | 自动管理 BEGIN/COMMIT/ROLLBACK | 减少样板代码 |
| ✅ **迁移管理** | 自动生成和管理数据库迁移 | 团队协作更容易 |
| ✅ **关系处理** | 轻松处理表之间的关系 | 简化复杂查询 |

### Prisma 的劣势

| 劣势 | 说明 | 影响 |
|------|------|------|
| ❌ **学习曲线** | 需要学习 Prisma API | 初期投入时间 |
| ❌ **复杂查询限制** | 某些复杂查询需要原生 SQL | 需要混合使用 |
| ❌ **性能开销** | ORM 有一定性能开销 | 极端性能场景可能不适合 |

### 何时使用 Prisma？何时使用原生 SQL？

**使用 Prisma**（90% 的场景）：
- ✅ 标准 CRUD 操作
- ✅ 需要类型安全
- ✅ 快速开发
- ✅ 团队协作

**使用原生 SQL**（10% 的场景）：
- ✅ 复杂的多表 JOIN
- ✅ 数据库特定功能（JSONB、全文搜索）
- ✅ 性能优化
- ✅ 复杂的子查询和窗口函数

### Prisma Schema 示例

```prisma
// prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(100)
  email     String   @unique @db.VarChar(255)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([email])
  @@map("users")
}
```

**对比原生 SQL**：
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

### 学习资源

- **对比文档**：[docs/prisma-vs-native-sql.md](docs/prisma-vs-native-sql.md) ⭐
- **原生 SQL 实现**：[src/dao/userDAO.ts](src/dao/userDAO.ts)
- **Prisma 实现**：[src/dao/userDAO.prisma.ts](src/dao/userDAO.prisma.ts)
- **Prisma Schema**：[prisma/schema.prisma](prisma/schema.prisma)

### 下一步学习

1. ⏳ 阅读对比文档，理解两种方式的区别
2. ⏳ 在 Service 层切换使用 Prisma DAO
3. ⏳ 测试 Prisma 版本的 API
4. ⏳ 学习 Prisma 的关系查询（一对多、多对多）
5. ⏳ 学习 Prisma 的迁移管理

## 14. 下一步学习建议

### 基础巩固（已完成）
1. ✅ 运行项目，测试所有 API
2. ✅ 理解3层架构的职责分离
3. ✅ 对比2层和3层架构的区别
4. ✅ 学习 Prisma ORM 基础

### Prisma ORM 学习（当前阶段）
1. ⏳ 阅读 [docs/prisma-vs-native-sql.md](docs/prisma-vs-native-sql.md)
2. ⏳ 对比 `userDAO.ts` 和 `userDAO.prisma.ts`
3. ⏳ 在 Service 层切换使用 Prisma DAO
4. ⏳ 测试 Prisma 版本的所有 API
5. ⏳ 理解何时使用 Prisma，何时使用原生 SQL

### 进阶学习（后续阶段）
1. ⏳ Prisma 关系查询（一对多、多对多）
2. ⏳ Prisma 迁移管理（`prisma migrate`）
3. ⏳ 添加数据验证库（express-validator / joi）
4. ⏳ 添加认证授权（JWT）
5. ⏳ 添加单元测试（Jest）
6. ⏳ 添加 API 文档（Swagger）
7. ⏳ 添加日志系统（Winston / Pino）

## 15. 与 Claude 对话的注意事项

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

## 16. 项目状态

- **创建时间**：2026-01-27
- **当前状态**：✅ Prisma ORM 集成完成，保留原生 SQL 版本用于对比学习
- **最后更新**：2026-01-29
- **架构版本**：3层架构（Controller → Service → DAO）
- **数据访问方式**：原生 SQL + Prisma ORM（两种方式并存）
- **当前分支**：`feature/prisma-orm`
- **下一步**：用户学习 Prisma ORM，对比两种实现方式，选择合适的数据访问方式

---

**重要提醒**：这是一个学习项目，重点是理解原生 SQL 和 Prisma ORM 的区别，以及何时使用哪种方式！
