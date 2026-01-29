/**
 * 用户数据访问对象 - Prisma ORM 版本
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "Prisma Client 是什么？"
 * - "为什么不需要写 SQL 了？"
 * - "Prisma 如何防止 SQL 注入？"
 * - "Prisma 的类型安全是如何实现的？"
 */

import { PrismaClient } from '../generated/prisma';
import type { User, Prisma } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pool from '../config/database';

/**
 * 【核心概念】Prisma 7+ 的适配器模式
 * - Prisma 7 引入了适配器架构，可以复用现有的数据库连接
 * - 优势：不需要创建新的连接池，复用项目中已有的 pg.Pool
 * - 好处：统一管理连接，避免资源浪费
 *
 * 【对比 Prisma 6】
 * - Prisma 6: PrismaClient 自己管理连接
 * - Prisma 7: 通过 adapter 复用现有连接池
 */
const adapter = new PrismaPg(pool);

/**
 * 【核心概念】PrismaClient
 * - 作用：Prisma 自动生成的数据库客户端
 * - 优势：类型安全、自动补全、防止 SQL 注入
 * - 对比原生 pg：不需要手写 SQL，不需要手动定义类型
 *
 * 【单例模式】
 * - 全局只创建一个 PrismaClient 实例
 * - 避免创建过多数据库连接
 * - 通过 adapter 复用原生 pg 的连接池
 */
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'], // 开发环境打印 SQL 日志
});

/**
 * 【学习要点】DTO 类型定义
 * - CreateUserDTO: 使用 Prisma 自动生成的类型
 * - UpdateUserDTO: 自定义简化类型，保持与原生 SQL 版本一致
 *
 * 【为什么 UpdateUserDTO 不直接使用 Prisma.UserUpdateInput？】
 * - Prisma.UserUpdateInput 包含复杂的更新操作类型（如 StringFieldUpdateOperationsInput）
 * - Service 层不需要这些复杂类型，只需要简单的字段更新
 * - 保持与原生 SQL 版本的接口一致，便于切换
 */
export type CreateUserDTO = Prisma.UserCreateInput;
export type UpdateUserDTO = {
  name?: string;
  email?: string;
};

/**
 * 【重要】导出 User 类型
 * - 从 Prisma 生成的类型中导出
 * - 保持与原生 SQL 版本的接口一致性
 * - 这样 Service 层可以无缝切换两种实现
 */
export type { User };

/**
 * 用户 DAO 类 - Prisma 版本
 *
 * 【对比原生 SQL 版本】
 * - 原生版本：手写 SQL，手动处理参数
 * - Prisma 版本：使用方法链，自动生成 SQL
 */
export class UserDAOPrisma {
  /**
   * 查询所有用户
   *
   * 【对比原生 SQL】
   * 原生: await query('SELECT * FROM users ORDER BY created_at DESC')
   * Prisma: await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
   *
   * 【优势】
   * - 类型安全：返回类型自动推断为 User[]
   * - 自动补全：IDE 会提示所有可用字段
   * - 防止拼写错误：createdAt 拼错会编译报错
   */
  async findAll(): Promise<User[]> {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 根据 ID 查询用户
   *
   * 【对比原生 SQL】
   * 原生: await query('SELECT * FROM users WHERE id = $1', [id])
   * Prisma: await prisma.user.findUnique({ where: { id } })
   *
   * 【核心概念】findUnique vs findFirst
   * - findUnique: 用于唯一字段（id, email）
   * - findFirst: 用于非唯一字段，返回第一条匹配记录
   */
  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * 根据邮箱查询用户
   *
   * 【对比原生 SQL】
   * 原生: await query('SELECT * FROM users WHERE email = $1', [email])
   * Prisma: await prisma.user.findUnique({ where: { email } })
   *
   * 【注意】
   * - email 字段在 schema 中标记为 @unique
   * - 所以可以使用 findUnique
   */
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * 创建新用户
   *
   * 【对比原生 SQL】
   * 原生: await query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email])
   * Prisma: await prisma.user.create({ data: { name, email } })
   *
   * 【优势】
   * - 不需要写 RETURNING *，Prisma 自动返回创建的记录
   * - 不需要手动处理参数化查询
   * - 类型安全：data 对象的类型会被检查
   */
  async create(userData: CreateUserDTO): Promise<User> {
    return await prisma.user.create({
      data: userData,
    });
  }

  /**
   * 更新用户
   *
   * 【对比原生 SQL】
   * 原生: 需要动态构建 SQL，处理可选字段
   * Prisma: 自动处理可选字段，只更新提供的字段
   *
   * 【核心概念】Prisma 的部分更新
   * - 只更新提供的字段
   * - undefined 的字段不会被更新
   * - updatedAt 字段自动更新（因为 @updatedAt）
   */
  async update(id: number, userData: UpdateUserDTO): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData,
      });
    } catch (error) {
      // 如果记录不存在，Prisma 会抛出异常
      // 我们捕获异常并返回 null，保持与原生版本一致
      return null;
    }
  }

  /**
   * 删除用户
   *
   * 【对比原生 SQL】
   * 原生: await query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
   * Prisma: await prisma.user.delete({ where: { id } })
   *
   * 【注意】
   * - Prisma 的 delete 会自动返回被删除的记录
   * - 如果记录不存在，会抛出异常
   */
  async delete(id: number): Promise<User | null> {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * 批量创建用户（事务操作）
   *
   * 【对比原生 SQL】
   * 原生: 需要手动管理事务（BEGIN/COMMIT/ROLLBACK）
   * Prisma: 使用 $transaction 自动管理事务
   *
   * 【核心概念】Prisma 事务
   * - $transaction: 接收一个异步函数或操作数组
   * - 自动处理 COMMIT 和 ROLLBACK
   * - 如果任何操作失败，自动回滚所有操作
   *
   * 【对比原生版本】
   * 原生版本需要：
   * 1. 获取 client
   * 2. BEGIN
   * 3. 循环插入
   * 4. COMMIT
   * 5. catch 中 ROLLBACK
   * 6. finally 中 release
   *
   * Prisma 版本：
   * 1. 使用 $transaction
   * 2. 自动处理所有事务逻辑
   */
  async batchCreate(usersData: CreateUserDTO[]): Promise<User[]> {
    // 方式1：使用 createMany（更高效，但不返回创建的记录）
    // await prisma.user.createMany({ data: usersData });

    // 方式2：使用事务 + 循环 create（返回创建的记录）
    return await prisma.$transaction(
      usersData.map((userData) =>
        prisma.user.create({
          data: userData,
        })
      )
    );
  }

  /**
   * 统计用户总数
   *
   * 【对比原生 SQL】
   * 原生: await query('SELECT COUNT(*) as count FROM users')
   * Prisma: await prisma.user.count()
   *
   * 【优势】
   * - 直接返回数字，不需要解析结果
   * - 不需要 parseInt
   */
  async count(): Promise<number> {
    return await prisma.user.count();
  }

  /**
   * 分页查询用户
   *
   * 【对比原生 SQL】
   * 原生: await query('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [pageSize, offset])
   * Prisma: await prisma.user.findMany({ skip, take, orderBy })
   *
   * 【核心概念】Prisma 分页
   * - skip: 跳过多少条记录（对应 OFFSET）
   * - take: 获取多少条记录（对应 LIMIT）
   * - orderBy: 排序方式
   */
  async findByPage(page: number, pageSize: number): Promise<User[]> {
    const skip = (page - 1) * pageSize;

    return await prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }
}

// 导出单例实例
export const userDAOPrisma = new UserDAOPrisma();

/**
 * 【学习总结】Prisma vs 原生 SQL
 *
 * | 操作 | 原生 SQL | Prisma ORM |
 * |------|---------|-----------|
 * | 查询所有 | `query('SELECT * FROM users')` | `prisma.user.findMany()` |
 * | 根据 ID 查询 | `query('SELECT * FROM users WHERE id = $1', [id])` | `prisma.user.findUnique({ where: { id } })` |
 * | 创建 | `query('INSERT INTO users (...) VALUES ($1, $2) RETURNING *', [...])` | `prisma.user.create({ data: {...} })` |
 * | 更新 | 动态构建 SQL | `prisma.user.update({ where: { id }, data: {...} })` |
 * | 删除 | `query('DELETE FROM users WHERE id = $1 RETURNING *', [id])` | `prisma.user.delete({ where: { id } })` |
 * | 事务 | 手动 BEGIN/COMMIT/ROLLBACK | `prisma.$transaction([...])` |
 * | 统计 | `query('SELECT COUNT(*) FROM users')` | `prisma.user.count()` |
 * | 分页 | `query('... LIMIT $1 OFFSET $2', [...])` | `prisma.user.findMany({ skip, take })` |
 *
 * 【Prisma 的核心优势】
 * 1. ✅ **类型安全**：编译时检查，避免运行时错误
 * 2. ✅ **自动补全**：IDE 智能提示所有可用方法和字段
 * 3. ✅ **防止 SQL 注入**：自动处理参数化查询
 * 4. ✅ **简化事务**：自动管理 BEGIN/COMMIT/ROLLBACK
 * 5. ✅ **迁移管理**：自动生成和管理数据库迁移
 * 6. ✅ **关系处理**：轻松处理表之间的关系（未来学习）
 *
 * 【何时使用原生 SQL？】
 * - 复杂的 SQL 查询（多表 JOIN、子查询、窗口函数）
 * - 性能优化（需要手动优化 SQL）
 * - 数据库特定功能（PostgreSQL 的 JSONB、全文搜索等）
 *
 * 【何时使用 Prisma？】
 * - 标准的 CRUD 操作（90% 的场景）
 * - 需要类型安全和自动补全
 * - 团队协作（统一的数据访问方式）
 * - 快速开发（减少样板代码）
 */

/**
 * 【下一步学习】
 * - 如何在 Service 层切换使用 Prisma DAO？
 * - 如何处理 Prisma 的关系查询（一对多、多对多）？
 * - 如何使用 Prisma 的高级查询（聚合、分组）？
 * - 如何优化 Prisma 的性能？
 */
