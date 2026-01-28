/**
 * 用户数据访问对象 (DAO - Data Access Object)
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "什么是 DAO 模式？"
 * - "DAO 和 Repository 模式有什么区别？"
 * - "为什么要把 SQL 操作单独抽离？"
 */

import { query, getClient } from '../config/database';
import { PoolClient } from 'pg';

/**
 * 【核心概念】DAO 层的职责
 * - 职责：封装所有数据库操作（CRUD）
 * - 原则：只关心数据的存取，不包含业务逻辑
 * - 优势：SQL 集中管理，易于维护和优化
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET 的 Repository 层
 * - 或者 Entity Framework 的 DbContext
 */

/**
 * 用户数据类型定义
 *
 * 【学习要点】
 * - TypeScript 接口定义数据结构
 * - 确保类型安全
 */
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}

/**
 * 用户 DAO 类
 *
 * 【设计模式】
 * - 使用类封装相关的数据操作
 * - 每个方法对应一个数据库操作
 */
export class UserDAO {
  /**
   * 查询所有用户
   *
   * 【SQL 操作】SELECT
   * 【返回】用户数组
   */
  async findAll(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  /**
   * 根据 ID 查询用户
   *
   * 【SQL 操作】SELECT with WHERE
   * 【参数化查询】使用 $1 防止 SQL 注入
   */
  async findById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  /**
   * 根据邮箱查询用户
   *
   * 【使用场景】
   * - 检查邮箱是否已存在
   * - 登录验证（未来功能）
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  /**
   * 创建新用户
   *
   * 【SQL 操作】INSERT
   * 【PostgreSQL 特性】RETURNING * 返回插入的数据
   *
   * 【对比 SQL Server】
   * - SQL Server: INSERT ... ; SELECT SCOPE_IDENTITY()
   * - PostgreSQL: INSERT ... RETURNING *
   */
  async create(userData: CreateUserDTO): Promise<User> {
    const result = await query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [userData.name, userData.email]
    );
    return result.rows[0];
  }

  /**
   * 更新用户
   *
   * 【SQL 操作】UPDATE
   * 【动态 SQL】根据提供的字段动态构建 SQL
   */
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

    // 如果没有要更新的字段，返回 null
    if (updates.length === 0) {
      return null;
    }

    values.push(id); // 最后一个参数是 id

    const sql = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  /**
   * 删除用户
   *
   * 【SQL 操作】DELETE
   * 【注意】这是硬删除，数据会被永久删除
   *
   * 【扩展思考】
   * - 软删除：添加 deleted_at 字段，不真正删除数据
   * - 适用场景：需要数据恢复或审计的系统
   */
  async delete(id: number): Promise<User | null> {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  }

  /**
   * 批量创建用户（事务操作）
   *
   * 【核心概念】事务 (Transaction)
   * - 作用：确保多个操作要么全部成功，要么全部失败
   * - 原则：ACID（原子性、一致性、隔离性、持久性）
   *
   * 【对比存储过程】
   * - 你之前用 SQL Server 存储过程来处理事务
   * - 在 Node.js 中，通常在应用层使用 BEGIN/COMMIT/ROLLBACK
   *
   * 【使用场景】
   * - 银行转账（扣款和入账必须同时成功）
   * - 订单创建（订单记录 + 库存扣减必须同时成功）
   */
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

  /**
   * 统计用户总数
   *
   * 【SQL 操作】COUNT
   * 【使用场景】分页查询时需要知道总数
   */
  async count(): Promise<number> {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }

  /**
   * 分页查询用户
   *
   * 【SQL 操作】LIMIT + OFFSET
   * 【使用场景】列表展示，避免一次性加载大量数据
   *
   * 【对比 SQL Server】
   * - SQL Server: OFFSET ... ROWS FETCH NEXT ... ROWS ONLY
   * - PostgreSQL: LIMIT ... OFFSET ...
   */
  async findByPage(page: number, pageSize: number): Promise<User[]> {
    const offset = (page - 1) * pageSize;
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [pageSize, offset]
    );
    return result.rows;
  }
}

// 导出单例实例（推荐做法）
export const userDAO = new UserDAO();
