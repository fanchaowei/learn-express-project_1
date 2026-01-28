/**
 * 用户服务层 (Service Layer)
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "Service 层和 DAO 层有什么区别？"
 * - "什么是业务逻辑？"
 * - "为什么要分离业务逻辑和数据访问？"
 */

import { userDAO, CreateUserDTO, UpdateUserDTO, User } from '../dao/userDAO';

/**
 * 【核心概念】Service 层的职责
 * - 职责：处理业务逻辑、数据验证、业务规则
 * - 原则：不直接操作数据库，通过 DAO 层访问数据
 * - 优势：业务逻辑集中管理，易于测试和复用
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET 的 Service 层
 * - 或者 Domain Service / Application Service
 *
 * 【三层架构的数据流】
 * Controller → Service → DAO → Database
 *    ↓          ↓        ↓
 * HTTP处理   业务逻辑   数据操作
 */

/**
 * 业务异常类
 *
 * 【设计模式】自定义异常
 * - 作用：区分业务异常和系统异常
 * - 优势：Controller 可以根据异常类型返回不同的 HTTP 状态码
 */
export class BusinessError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

/**
 * 用户服务类
 *
 * 【设计模式】
 * - 使用类封装相关的业务逻辑
 * - 每个方法对应一个业务操作
 */
export class UserService {
  /**
   * 获取所有用户
   *
   * 【业务逻辑】
   * - 直接调用 DAO 层获取数据
   * - 未来可以添加：权限检查、数据过滤等
   */
  async getAllUsers(): Promise<User[]> {
    return await userDAO.findAll();
  }

  /**
   * 根据 ID 获取用户
   *
   * 【业务逻辑】
   * - 检查用户是否存在
   * - 如果不存在，抛出业务异常
   */
  async getUserById(id: number): Promise<User> {
    // 数据验证：ID 必须是正整数
    if (!id || id <= 0) {
      throw new BusinessError('用户 ID 无效', 400);
    }

    const user = await userDAO.findById(id);

    if (!user) {
      throw new BusinessError('用户不存在', 404);
    }

    return user;
  }

  /**
   * 创建新用户
   *
   * 【业务逻辑】
   * 1. 数据验证（必填字段、格式检查）
   * 2. 业务规则检查（邮箱唯一性）
   * 3. 调用 DAO 创建数据
   *
   * 【对比2层架构】
   * - 2层架构：验证逻辑在 Controller 中
   * - 3层架构：验证逻辑在 Service 中，Controller 只处理 HTTP
   */
  async createUser(userData: CreateUserDTO): Promise<User> {
    // 1. 数据验证
    this.validateUserData(userData);

    // 2. 业务规则：检查邮箱是否已存在
    const existingUser = await userDAO.findByEmail(userData.email);
    if (existingUser) {
      throw new BusinessError('邮箱已存在', 409);
    }

    // 3. 创建用户
    return await userDAO.create(userData);
  }

  /**
   * 更新用户
   *
   * 【业务逻辑】
   * 1. 检查用户是否存在
   * 2. 数据验证
   * 3. 业务规则检查（邮箱唯一性）
   * 4. 调用 DAO 更新数据
   */
  async updateUser(id: number, userData: UpdateUserDTO): Promise<User> {
    // 1. 检查用户是否存在
    const existingUser = await userDAO.findById(id);
    if (!existingUser) {
      throw new BusinessError('用户不存在', 404);
    }

    // 2. 数据验证
    if (userData.name !== undefined && !userData.name.trim()) {
      throw new BusinessError('用户名不能为空', 400);
    }

    if (userData.email !== undefined) {
      this.validateEmail(userData.email);

      // 3. 业务规则：检查邮箱是否被其他用户使用
      const userWithEmail = await userDAO.findByEmail(userData.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new BusinessError('邮箱已被其他用户使用', 409);
      }
    }

    // 4. 更新用户
    const updatedUser = await userDAO.update(id, userData);

    if (!updatedUser) {
      throw new BusinessError('更新失败', 500);
    }

    return updatedUser;
  }

  /**
   * 删除用户
   *
   * 【业务逻辑】
   * 1. 检查用户是否存在
   * 2. 业务规则检查（例如：不能删除管理员）
   * 3. 调用 DAO 删除数据
   */
  async deleteUser(id: number): Promise<User> {
    // 1. 检查用户是否存在
    const existingUser = await userDAO.findById(id);
    if (!existingUser) {
      throw new BusinessError('用户不存在', 404);
    }

    // 2. 业务规则检查（示例）
    // 未来可以添加：不能删除管理员、不能删除有订单的用户等
    // if (existingUser.role === 'admin') {
    //   throw new BusinessError('不能删除管理员用户', 403);
    // }

    // 3. 删除用户
    const deletedUser = await userDAO.delete(id);

    if (!deletedUser) {
      throw new BusinessError('删除失败', 500);
    }

    return deletedUser;
  }

  /**
   * 批量创建用户（事务操作）
   *
   * 【业务逻辑】
   * 1. 验证所有用户数据
   * 2. 检查邮箱唯一性
   * 3. 调用 DAO 批量创建（事务）
   *
   * 【事务场景】
   * - 要么全部创建成功，要么全部失败
   * - 确保数据一致性
   */
  async batchCreateUsers(usersData: CreateUserDTO[]): Promise<User[]> {
    // 1. 验证数据
    if (!Array.isArray(usersData) || usersData.length === 0) {
      throw new BusinessError('请提供用户数组', 400);
    }

    // 验证每个用户数据
    for (const userData of usersData) {
      this.validateUserData(userData);
    }

    // 2. 检查邮箱唯一性
    const emails = usersData.map((u) => u.email);
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      throw new BusinessError('批量创建的用户中存在重复邮箱', 400);
    }

    // 检查数据库中是否已存在这些邮箱
    for (const email of emails) {
      const existingUser = await userDAO.findByEmail(email);
      if (existingUser) {
        throw new BusinessError(`邮箱 ${email} 已存在`, 409);
      }
    }

    // 3. 批量创建（事务）
    return await userDAO.batchCreate(usersData);
  }

  /**
   * 获取用户统计信息
   *
   * 【业务逻辑】
   * - 聚合多个数据源
   * - 计算业务指标
   */
  async getUserStats() {
    const totalUsers = await userDAO.count();

    return {
      totalUsers,
      // 未来可以添加更多统计信息
      // activeUsers: ...,
      // newUsersThisMonth: ...,
    };
  }

  /**
   * 分页获取用户
   *
   * 【业务逻辑】
   * - 参数验证
   * - 计算分页信息
   */
  async getUsersByPage(page: number, pageSize: number) {
    // 参数验证
    if (page < 1) {
      throw new BusinessError('页码必须大于0', 400);
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new BusinessError('每页数量必须在 1-100 之间', 400);
    }

    const users = await userDAO.findByPage(page, pageSize);
    const total = await userDAO.count();

    return {
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * 私有方法：验证用户数据
   *
   * 【设计模式】
   * - 将通用的验证逻辑抽取为私有方法
   * - 提高代码复用性
   */
  private validateUserData(userData: CreateUserDTO): void {
    if (!userData.name || !userData.name.trim()) {
      throw new BusinessError('用户名不能为空', 400);
    }

    if (userData.name.length > 100) {
      throw new BusinessError('用户名长度不能超过100个字符', 400);
    }

    if (!userData.email) {
      throw new BusinessError('邮箱不能为空', 400);
    }

    this.validateEmail(userData.email);
  }

  /**
   * 私有方法：验证邮箱格式
   *
   * 【正则表达式】
   * - 简单的邮箱格式验证
   * - 生产环境建议使用更严格的验证或第三方库
   */
  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BusinessError('邮箱格式不正确', 400);
    }

    if (email.length > 255) {
      throw new BusinessError('邮箱长度不能超过255个字符', 400);
    }
  }
}

// 导出单例实例（推荐做法）
export const userService = new UserService();
