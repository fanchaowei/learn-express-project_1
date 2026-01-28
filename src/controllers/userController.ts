/**
 * 用户控制器 (Controller Layer)
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "Controller 在3层架构中的职责是什么？"
 * - "为什么 Controller 不直接操作数据库？"
 * - "如何处理业务异常和系统异常？"
 */

import { Request, Response } from 'express';
import { userService, BusinessError } from '../services/userService';

/**
 * 【核心概念】Controller 层的职责（3层架构）
 * - 职责：处理 HTTP 请求和响应
 * - 原则：不包含业务逻辑，只做参数提取和结果返回
 * - 优势：代码简洁，职责单一
 *
 * 【对比2层架构】
 * - 2层架构：Controller = HTTP处理 + 业务逻辑 + 数据操作
 * - 3层架构：Controller = HTTP处理（业务逻辑在 Service，数据操作在 DAO）
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET MVC 的 Controller
 * - 或者 ASP.NET Web API 的 ApiController
 *
 * 【三层架构的数据流】
 * HTTP 请求 → Controller → Service → DAO → Database
 *              ↓           ↓        ↓
 *          参数提取    业务逻辑   数据操作
 *              ↓
 *          HTTP 响应
 */

/**
 * 获取所有用户
 *
 * 【Controller 职责】
 * 1. 接收 HTTP 请求
 * 2. 调用 Service 层
 * 3. 返回 HTTP 响应
 *
 * 【注意】没有任何业务逻辑！
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 根据 ID 获取单个用户
 *
 * 【Controller 职责】
 * 1. 从路径参数提取 ID
 * 2. 转换数据类型（string → number）
 * 3. 调用 Service 层
 * 4. 返回 HTTP 响应
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const user = await userService.getUserById(id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 创建新用户
 *
 * 【Controller 职责】
 * 1. 从请求体提取数据
 * 2. 调用 Service 层
 * 3. 返回 HTTP 201 Created
 *
 * 【注意】数据验证在 Service 层，不在 Controller 层
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    const user = await userService.createUser({ name, email });

    res.status(201).json({
      success: true,
      data: user,
      message: '用户创建成功',
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 更新用户
 *
 * 【Controller 职责】
 * 1. 从路径参数提取 ID
 * 2. 从请求体提取更新数据
 * 3. 调用 Service 层
 * 4. 返回 HTTP 响应
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;

    const user = await userService.updateUser(id, { name, email });

    res.json({
      success: true,
      data: user,
      message: '用户更新成功',
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 删除用户
 *
 * 【Controller 职责】
 * 1. 从路径参数提取 ID
 * 2. 调用 Service 层
 * 3. 返回 HTTP 响应
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const user = await userService.deleteUser(id);

    res.json({
      success: true,
      message: '用户删除成功',
      data: user,
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 批量创建用户（事务示例）
 *
 * 【Controller 职责】
 * 1. 从请求体提取用户数组
 * 2. 调用 Service 层
 * 3. 返回 HTTP 201 Created
 */
export const batchCreateUsers = async (req: Request, res: Response) => {
  try {
    const { users } = req.body;

    const createdUsers = await userService.batchCreateUsers(users);

    res.status(201).json({
      success: true,
      data: createdUsers,
      message: `成功创建 ${createdUsers.length} 个用户`,
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 获取用户统计信息
 *
 * 【新增功能】展示 Service 层的业务逻辑聚合能力
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await userService.getUserStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 分页获取用户
 *
 * 【新增功能】展示分页查询
 */
export const getUsersByPage = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await userService.getUsersByPage(page, pageSize);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    handleError(error, res);
  }
};

/**
 * 统一错误处理函数
 *
 * 【核心概念】错误处理策略
 * - 业务异常（BusinessError）：返回对应的 HTTP 状态码
 * - 系统异常（其他错误）：返回 500 Internal Server Error
 *
 * 【对比2层架构】
 * - 2层架构：每个 Controller 方法都要写 try-catch
 * - 3层架构：统一的错误处理，代码更简洁
 */
function handleError(error: unknown, res: Response) {
  console.error('Controller 错误:', error);

  // 业务异常
  if (error instanceof BusinessError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
    });
  }

  // 数据库唯一约束冲突（邮箱重复）
  if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
    return res.status(409).json({
      success: false,
      error: '邮箱已存在',
    });
  }

  // 系统异常
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
  });
}
