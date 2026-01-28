/**
 * 用户路由配置
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "什么是 Router？"
 * - "为什么要分离路由和控制器？"
 * - "RESTful API 的设计原则是什么？"
 */

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  batchCreateUsers,
  getUserStats,
  getUsersByPage,
} from '../controllers/userController';

/**
 * 【核心概念】Router
 * - 作用：模块化路由管理
 * - 优势：代码组织更清晰，易于维护
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET MVC 的 RouteConfig
 * - 或者 Web API 的 Attribute Routing
 */
const router = Router();

/**
 * RESTful API 路由设计
 *
 * 【核心概念】RESTful API
 * - REST: Representational State Transfer（表现层状态转换）
 * - 核心思想：使用 HTTP 方法表达操作意图
 *
 * 【HTTP 方法对应关系】
 * - GET:    查询（读取数据，不修改）
 * - POST:   创建（新增数据）
 * - PUT:    更新（完整更新）
 * - PATCH:  更新（部分更新）
 * - DELETE: 删除
 *
 * 【对比 SQL】
 * - GET    → SELECT
 * - POST   → INSERT
 * - PUT    → UPDATE
 * - DELETE → DELETE
 */

/**
 * 【重要】路由顺序很重要！
 * - 更具体的路由应该放在前面
 * - 例如：/stats 和 /batch 应该在 /:id 之前
 * - 否则 /stats 会被 /:id 匹配（id = "stats"）
 */

// GET /api/users/stats - 获取用户统计信息（新增）
router.get('/stats', getUserStats);

// GET /api/users/page - 分页获取用户（新增）
router.get('/page', getUsersByPage);

// POST /api/users/batch - 批量创建用户（事务示例）
router.post('/batch', batchCreateUsers);

// GET /api/users - 获取所有用户
router.get('/', getAllUsers);

// GET /api/users/:id - 获取单个用户
// :id 是路径参数，可以通过 req.params.id 访问
router.get('/:id', getUserById);

// POST /api/users - 创建新用户
router.post('/', createUser);

// PUT /api/users/:id - 更新用户
router.put('/:id', updateUser);

// DELETE /api/users/:id - 删除用户
router.delete('/:id', deleteUser);

/**
 * 【3层架构的完整流程】
 *
 * 用户请求: GET /api/users/1
 *   ↓
 * 路由匹配: router.get('/:id', getUserById)
 *   ↓
 * Controller: 提取参数 id=1，调用 userService.getUserById(1)
 *   ↓
 * Service: 验证参数，调用 userDAO.findById(1)
 *   ↓
 * DAO: 执行 SQL: SELECT * FROM users WHERE id = $1
 *   ↓
 * Database: 返回用户数据
 *   ↓
 * DAO: 返回 User 对象
 *   ↓
 * Service: 返回 User 对象（可以添加业务逻辑处理）
 *   ↓
 * Controller: 包装为 HTTP 响应 { success: true, data: user }
 *   ↓
 * 用户收到响应
 */

export default router;
