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

// POST /api/users/batch - 批量创建用户（事务示例）
router.post('/batch', batchCreateUsers);

/**
 * 【学习要点】路由顺序很重要！
 * - 更具体的路由应该放在前面
 * - 例如：/batch 应该在 /:id 之前
 * - 否则 /batch 会被 /:id 匹配（id = "batch"）
 */

export default router;
