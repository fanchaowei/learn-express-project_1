# 原生 SQL vs Prisma ORM 对比文档

> 本文档帮助你理解原生 SQL 和 Prisma ORM 的区别，以及何时使用哪种方式。

## 📋 目录

1. [核心概念对比](#核心概念对比)
2. [代码对比](#代码对比)
3. [优缺点分析](#优缺点分析)
4. [使用场景](#使用场景)
5. [学习建议](#学习建议)

---

## 核心概念对比

### 原生 SQL（使用 pg 库）

**核心思想**：直接编写 SQL 语句，手动管理数据库操作

```typescript
// 连接池
const pool = new Pool({ host, port, database, user, password });

// 执行查询
const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
const user = result.rows[0];
```

**特点**：
- ✅ 完全控制 SQL 语句
- ✅ 可以使用数据库特定功能
- ❌ 需要手写 SQL
- ❌ 没有类型安全
- ❌ 容易出现 SQL 注入（如果不小心）

### Prisma ORM

**核心思想**：使用对象方法操作数据库，自动生成 SQL

```typescript
// Prisma Client
const prisma = new PrismaClient();

// 执行查询
const user = await prisma.user.findUnique({ where: { id } });
```

**特点**：
- ✅ 类型安全（TypeScript）
- ✅ 自动补全（IDE 支持）
- ✅ 自动防止 SQL 注入
- ✅ 简化事务管理
- ❌ 学习曲线（需要学习 Prisma API）
- ❌ 复杂查询可能需要原生 SQL

---

## 代码对比

### 1. 查询所有用户

#### 原生 SQL 版本
```typescript
// src/dao/userDAO.ts
async findAll(): Promise<User[]> {
  const result = await query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
}
```

#### Prisma 版本
```typescript
// src/dao/userDAO.prisma.ts
async findAll(): Promise<User[]> {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
}
```

**对比**：
- 原生 SQL：需要写完整的 SQL 语句
- Prisma：使用方法链，更简洁
- Prisma：字段名使用 camelCase（createdAt），自动映射到数据库的 snake_case（created_at）

---

### 2. 根据 ID 查询用户

#### 原生 SQL 版本
```typescript
async findById(id: number): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}
```

#### Prisma 版本
```typescript
async findById(id: number): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
  });
}
```

**对比**：
- 原生 SQL：需要手动处理参数化查询（$1）
- Prisma：自动处理参数，更安全
- Prisma：自动返回 null（如果不存在）

---

### 3. 创建用户

#### 原生 SQL 版本
```typescript
async create(userData: CreateUserDTO): Promise<User> {
  const result = await query(
    'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
    [userData.name, userData.email]
  );
  return result.rows[0];
}
```

#### Prisma 版本
```typescript
async create(userData: CreateUserDTO): Promise<User> {
  return await prisma.user.create({
    data: userData,
  });
}
```

**对比**：
- 原生 SQL：需要写 `RETURNING *` 才能返回创建的记录
- Prisma：自动返回创建的记录
- Prisma：不需要手动列出字段名

---

### 4. 更新用户

#### 原生 SQL 版本（复杂！）
```typescript
async update(id: number, userData: UpdateUserDTO): Promise<User | null> {
  // 动态构建 UPDATE 语句
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (userData.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(userData.name);
  }
  if (userData.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(userData.email);
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);

  const sql = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await query(sql, values);
  return result.rows[0] || null;
}
```

#### Prisma 版本（简单！）
```typescript
async update(id: number, userData: UpdateUserDTO): Promise<User | null> {
  try {
    return await prisma.user.update({
      where: { id },
      data: userData,
    });
  } catch (error) {
    return null;
  }
}
```

**对比**：
- 原生 SQL：需要动态构建 SQL（20+ 行代码）
- Prisma：只需要 5 行代码
- Prisma：自动处理可选字段
- Prisma：自动更新 `updatedAt` 字段（因为 @updatedAt）

---

### 5. 批量创建用户（事务）

#### 原生 SQL 版本（复杂！）
```typescript
async batchCreate(usersData: CreateUserDTO[]): Promise<User[]> {
  const client: PoolClient = await getClient();

  try {
    // 开始事务
    await client.query('BEGIN');

    const createdUsers: User[] = [];

    // 批量插入
    for (const userData of usersData) {
      const result = await client.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [userData.name, userData.email]
      );
      createdUsers.push(result.rows[0]);
    }

    // 提交事务
    await client.query('COMMIT');

    return createdUsers;
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    throw error;
  } finally {
    // 释放连接（重要！）
    client.release();
  }
}
```

#### Prisma 版本（简单！）
```typescript
async batchCreate(usersData: CreateUserDTO[]): Promise<User[]> {
  return await prisma.$transaction(
    usersData.map((userData) =>
      prisma.user.create({
        data: userData,
      })
    )
  );
}
```

**对比**：
- 原生 SQL：需要手动管理事务（BEGIN/COMMIT/ROLLBACK）
- 原生 SQL：需要手动获取和释放连接
- 原生 SQL：需要 try-catch-finally（30+ 行代码）
- Prisma：只需要 5 行代码
- Prisma：自动处理所有事务逻辑

---

### 6. 分页查询

#### 原生 SQL 版本
```typescript
async findByPage(page: number, pageSize: number): Promise<User[]> {
  const offset = (page - 1) * pageSize;
  const result = await query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [pageSize, offset]
  );
  return result.rows;
}
```

#### Prisma 版本
```typescript
async findByPage(page: number, pageSize: number): Promise<User[]> {
  const skip = (page - 1) * pageSize;

  return await prisma.user.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}
```

**对比**：
- 原生 SQL：使用 `LIMIT` 和 `OFFSET`
- Prisma：使用 `take` 和 `skip`（更语义化）
- 代码复杂度相似

---

## 优缺点分析

### 原生 SQL 的优势

| 优势 | 说明 | 示例场景 |
|------|------|---------|
| **完全控制** | 可以写任何 SQL 语句 | 复杂的多表 JOIN、子查询 |
| **性能优化** | 可以手动优化 SQL | 需要使用数据库特定功能 |
| **数据库特性** | 可以使用 PostgreSQL 的 JSONB、全文搜索等 | 高级查询需求 |
| **学习曲线低** | 如果你熟悉 SQL，直接上手 | 已有 SQL 经验的开发者 |

### 原生 SQL 的劣势

| 劣势 | 说明 | 影响 |
|------|------|------|
| **没有类型安全** | 编译时无法检查错误 | 运行时才发现错误 |
| **容易出错** | 手写 SQL 容易拼写错误 | 调试困难 |
| **样板代码多** | 需要手动处理参数、结果 | 代码冗长 |
| **事务管理复杂** | 需要手动 BEGIN/COMMIT/ROLLBACK | 容易忘记释放连接 |

### Prisma 的优势

| 优势 | 说明 | 价值 |
|------|------|------|
| **类型安全** | 编译时检查，避免运行时错误 | 提高代码质量 |
| **自动补全** | IDE 智能提示所有可用方法 | 提高开发效率 |
| **防止 SQL 注入** | 自动处理参数化查询 | 提高安全性 |
| **简化事务** | 自动管理事务 | 减少样板代码 |
| **迁移管理** | 自动生成和管理数据库迁移 | 团队协作更容易 |

### Prisma 的劣势

| 劣势 | 说明 | 影响 |
|------|------|------|
| **学习曲线** | 需要学习 Prisma API | 初期投入时间 |
| **复杂查询限制** | 某些复杂查询需要原生 SQL | 需要混合使用 |
| **性能开销** | ORM 有一定性能开销 | 极端性能场景可能不适合 |

---

## 使用场景

### 何时使用原生 SQL？

1. **复杂查询**
   ```sql
   -- 多表 JOIN + 子查询 + 窗口函数
   SELECT u.*,
          COUNT(o.id) OVER (PARTITION BY u.id) as order_count,
          (SELECT AVG(price) FROM orders WHERE user_id = u.id) as avg_price
   FROM users u
   LEFT JOIN orders o ON u.id = o.user_id
   WHERE u.created_at > NOW() - INTERVAL '30 days'
   GROUP BY u.id
   HAVING COUNT(o.id) > 5;
   ```

2. **数据库特定功能**
   ```sql
   -- PostgreSQL 的 JSONB 查询
   SELECT * FROM users WHERE metadata @> '{"role": "admin"}';

   -- 全文搜索
   SELECT * FROM articles WHERE to_tsvector('english', content) @@ to_tsquery('database');
   ```

3. **性能优化**
   - 需要手动优化 SQL
   - 需要使用数据库特定的优化技巧

### 何时使用 Prisma？

1. **标准 CRUD 操作**（90% 的场景）
   - 查询、创建、更新、删除
   - 分页、排序、过滤

2. **需要类型安全**
   - TypeScript 项目
   - 团队协作（避免拼写错误）

3. **快速开发**
   - 减少样板代码
   - 自动处理事务

4. **关系查询**
   ```typescript
   // 查询用户及其所有订单（一对多）
   const user = await prisma.user.findUnique({
     where: { id: 1 },
     include: { orders: true },
   });
   ```

---

## 学习建议

### 阶段 1：理解原生 SQL（已完成 ✅）

- ✅ 理解参数化查询
- ✅ 理解连接池
- ✅ 理解事务管理
- ✅ 理解 CRUD 操作

**价值**：知道 ORM 底层做了什么

### 阶段 2：学习 Prisma 基础（当前阶段 🔄）

- ✅ 理解 Prisma Schema
- ✅ 理解 Prisma Client
- ✅ 对比原生 SQL 和 Prisma
- ⏳ 实践：使用 Prisma 重写 DAO 层

**价值**：提高开发效率，减少错误

### 阶段 3：混合使用（下一步 ⏳）

- ⏳ 标准操作使用 Prisma
- ⏳ 复杂查询使用原生 SQL
- ⏳ 理解何时使用哪种方式

**价值**：灵活应对不同场景

### 阶段 4：高级功能（未来 📅）

- 📅 Prisma 关系查询（一对多、多对多）
- 📅 Prisma 聚合查询
- 📅 Prisma 性能优化
- 📅 Prisma 迁移管理

---

## 总结

### 核心观点

1. **原生 SQL 和 Prisma 不是对立的**
   - 可以混合使用
   - 根据场景选择合适的工具

2. **学习顺序很重要**
   - 先学原生 SQL（理解底层）
   - 再学 Prisma（提高效率）
   - 最后混合使用（灵活应对）

3. **90% 的场景使用 Prisma**
   - 标准 CRUD 操作
   - 类型安全
   - 快速开发

4. **10% 的场景使用原生 SQL**
   - 复杂查询
   - 数据库特定功能
   - 性能优化

### 下一步行动

1. ✅ 阅读本文档，理解原生 SQL 和 Prisma 的区别
2. ⏳ 运行项目，测试 Prisma DAO 层
3. ⏳ 在 Service 层切换使用 Prisma DAO
4. ⏳ 对比两种实现方式的代码
5. ⏳ 思考：在你的项目中，哪些场景适合用 Prisma？哪些适合用原生 SQL？

---

**记住**：工具是为了解决问题，不是为了炫技。选择最适合你项目的工具！
