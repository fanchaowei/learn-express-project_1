/**
 * Express 服务器主文件
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "什么是中间件（middleware）？"
 * - "express.json() 的作用是什么？"
 * - "为什么要分离路由和服务器配置？"
 */

import express, { Request, Response, NextFunction } from 'express';
import { testConnection, closePool } from './config/database';
import userRoutes from './routes/userRoutes';

/**
 * 创建 Express 应用实例
 *
 * 【核心概念】Express 应用
 * - 类比：Express 就像一个餐厅的管理系统
 * - app 是整个应用的核心对象
 */
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 中间件配置
 *
 * 【核心概念】中间件 (Middleware)
 * - 类比：就像餐厅的流水线，每个环节处理一部分工作
 * - 执行顺序：从上到下依次执行
 * - 作用：请求预处理、日志记录、错误处理等
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET 的 HTTP Module 或 OWIN 中间件
 */

// 1. JSON 解析中间件（解析请求体中的 JSON 数据）
app.use(express.json());

// 2. URL 编码解析中间件（解析表单数据）
app.use(express.urlencoded({ extended: true }));

// 3. 请求日志中间件（自定义中间件示例）
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next(); // 调用 next() 传递给下一个中间件
});

/**
 * 路由配置
 *
 * 【核心概念】路由 (Routes)
 * - 作用：定义 URL 路径和处理函数的映射关系
 * - 模式：RESTful API 设计
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET MVC 的路由配置
 * - 或者 Web API 的 Controller
 */

// 健康检查路由（用于测试服务器是否正常运行）
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 用户相关路由（挂载到 /api/users 路径下）
app.use('/api/users', userRoutes);

/**
 * 404 错误处理
 *
 * 【学习要点】
 * - 放在所有路由之后
 * - 捕获未匹配的请求
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `路径 ${req.path} 不存在`,
  });
});

/**
 * 全局错误处理中间件
 *
 * 【核心概念】错误处理
 * - 4个参数的中间件会被识别为错误处理中间件
 * - 捕获所有未处理的错误
 *
 * 【对比 ASP.NET】
 * - 类似于 ASP.NET 的全局异常过滤器
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
  });
});

/**
 * 启动服务器
 *
 * 【执行流程】
 * 1. 测试数据库连接
 * 2. 启动 HTTP 服务器
 * 3. 监听指定端口
 */
const startServer = async () => {
  try {
    // 测试数据库连接
    console.log('🔍 正在测试数据库连接...');
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('❌ 数据库连接失败，服务器启动中止');
      process.exit(1);
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器已启动！`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log(`👤 用户API: http://localhost:${PORT}/api/users`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

/**
 * 优雅关闭
 *
 * 【学习要点】
 * - 监听进程信号（SIGINT, SIGTERM）
 * - 确保资源正确释放
 */
process.on('SIGINT', async () => {
  console.log('\n⏹️  正在关闭服务器...');
  await closePool();
  process.exit(0);
});

// 启动服务器
startServer();
