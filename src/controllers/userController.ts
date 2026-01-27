/**
 * 用户控制器
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "什么是控制器（Controller）？"
 * - "为什么要分离控制器和路由？"
 * - "async/await 是如何工作的？"
 */

import { Request, Response } from 'express';
import { query, getClient } from '../config/database';

/**
 * 【核心概念】控制器 (Controller)
 * - 作用：处理业务逻辑，连接路由和数据库
 * - 模式：MVC 模式中的 C（Controller）
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET MVC 的 Controller
 * - 每个方法对应一个 API 端点
 */

/**
 * 获取所有用户
 *
 * 【RESTful API 设计】
 * - 方法：GET
 * - 路径：/api/users
 * - 返回：用户列表
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // 执行 SQL 查询（注意：PostgreSQL 使用小写表名和字段名）
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户列表失败',
    });
  }
};

/**
 * 根据 ID 获取单个用户
 *
 * 【学习要点】
 * - 路径参数：req.params.id
 * - 参数化查询：防止 SQL 注入
 * - 404 处理：用户不存在的情况
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 参数化查询（使用 $1 占位符）
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({
      success: false,
      error: '获取用户失败',
    });
  }
};

/**
 * 创建新用户
 *
 * 【学习要点】
 * - 请求体：req.body
 * - INSERT 语句：RETURNING * 返回插入的数据
 * - 数据验证：简单的非空验证
 *
 * 【对比 SQL Server】
 * - SQL Server: INSERT ... ; SELECT SCOPE_IDENTITY()
 * - PostgreSQL: INSERT ... RETURNING *
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    // 简单验证
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: '姓名和邮箱不能为空',
      });
    }

    // 插入数据并返回结果
    const result = await query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '用户创建成功',
    });
  } catch (error: any) {
    console.error('创建用户失败:', error);

    // 处理唯一约束冲突（邮箱重复）
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: '邮箱已存在',
      });
    }

    res.status(500).json({
      success: false,
      error: '创建用户失败',
    });
  }
};

/**
 * 更新用户
 *
 * 【学习要点】
 * - UPDATE 语句
 * - 动态构建 SQL（根据提供的字段）
 * - 乐观更新：先检查是否存在
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // 简单验证
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: '至少提供一个要更新的字段',
      });
    }

    // 构建更新语句
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    values.push(id); // 最后一个参数是 id

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: '用户更新成功',
    });
  } catch (error: any) {
    console.error('更新用户失败:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: '邮箱已存在',
      });
    }

    res.status(500).json({
      success: false,
      error: '更新用户失败',
    });
  }
};

/**
 * 删除用户
 *
 * 【学习要点】
 * - DELETE 语句
 * - 软删除 vs 硬删除（这里是硬删除）
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: '用户不存在',
      });
    }

    res.json({
      success: true,
      message: '用户删除成功',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      error: '删除用户失败',
    });
  }
};

/**
 * 事务示例：批量创建用户
 *
 * 【核心概念】事务 (Transaction)
 * - 作用：确保多个操作要么全部成功，要么全部失败
 * - 类比：银行转账（扣款和入账必须同时成功）
 *
 * 【对比存储过程】
 * - 你之前用 SQL Server 存储过程来处理事务
 * - 在 Node.js 中，通常在应用层使用 BEGIN/COMMIT/ROLLBACK
 */
export const batchCreateUsers = async (req: Request, res: Response) => {
  const client = await getClient();

  try {
    const { users } = req.body; // 期望是一个用户数组

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供用户数组',
      });
    }

    // 开始事务
    await client.query('BEGIN');

    const createdUsers = [];

    // 批量插入
    for (const user of users) {
      const result = await client.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [user.name, user.email]
      );
      createdUsers.push(result.rows[0]);
    }

    // 提交事务
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: createdUsers,
      message: `成功创建 ${createdUsers.length} 个用户`,
    });
  } catch (error) {
    // 回滚事务
    await client.query('ROLLBACK');
    console.error('批量创建用户失败:', error);
    res.status(500).json({
      success: false,
      error: '批量创建用户失败',
    });
  } finally {
    // 释放连接（重要！）
    client.release();
  }
};
