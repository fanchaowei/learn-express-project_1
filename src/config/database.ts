/**
 * 数据库连接配置模块
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "什么是连接池？为什么需要它？"
 * - "Pool 和直接连接有什么区别？"
 * - "这些配置参数的作用是什么？"
 */

import dotenv from 'dotenv'
import { Pool } from 'pg'

// 加载环境变量（从 .env 文件读取配置）
// override: true 表示覆盖已存在的环境变量
dotenv.config({ override: true })

/**
 * 连接池配置
 *
 * 【核心概念】连接池 (Connection Pool)
 * - 类比：就像餐厅的服务员池，而不是每次有客人就临时招聘服务员
 * - 优势：复用连接，避免频繁创建/销毁连接的开销
 * - 对比 SQL Server：类似于 SQL Server 的连接池机制
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost', // 数据库服务器地址
  port: parseInt(process.env.DB_PORT || '5433'), // PostgreSQL 默认端口
  database: process.env.DB_NAME || 'myapp_db', // 数据库名称
  user: process.env.DB_USER || 'postgres', // 用户名
  password: process.env.DB_PASSWORD, // 密码

  // 连接池配置参数
  max: 20, // 最大连接数（类比：餐厅最多20个服务员）
  idleTimeoutMillis: 30000, // 空闲连接超时时间（30秒）
  connectionTimeoutMillis: 2000, // 连接超时时间（2秒）
})

/**
 * 测试数据库连接
 *
 * 【学习要点】
 * - async/await：异步编程模式（如果不熟悉，可以追问）
 * - try-catch：错误处理机制
 * - pool.query()：执行 SQL 查询的方法
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    // 执行简单查询测试连接（类似 SQL Server 的 SELECT 1）
    const result = await pool.query('SELECT NOW()')
    console.log('✅ 数据库连接成功！当前时间:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('❌ 数据库连接失败:', error)
    return false
  }
}

/**
 * 执行查询（带参数化查询支持）
 *
 * 【核心概念】参数化查询
 * - 作用：防止 SQL 注入攻击
 * - 语法：使用 $1, $2, $3... 作为占位符（不同于 SQL Server 的 @param）
 * - 示例：query('SELECT * FROM users WHERE id = $1', [userId])
 *
 * 【对比 SQL Server】
 * - SQL Server: @param1, @param2
 * - PostgreSQL: $1, $2, $3
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 执行查询:', {
      text,
      duration: `${duration}ms`,
      rows: result.rowCount,
    })
    return result
  } catch (error) {
    console.error('❌ 查询执行失败:', { text, error })
    throw error
  }
}

/**
 * 获取连接池客户端（用于事务操作）
 *
 * 【使用场景】
 * - 需要执行多个相关操作（事务）
 * - 需要手动控制连接的获取和释放
 *
 * 【重要】使用后必须调用 client.release() 释放连接
 *
 * 【对比存储过程】
 * - 你之前用 SQL Server 存储过程来封装业务逻辑
 * - 在 Node.js 中，通常在应用层处理业务逻辑和事务
 */
export const getClient = async () => {
  const client = await pool.connect()
  return client
}

/**
 * 优雅关闭连接池
 *
 * 【使用场景】
 * - 应用程序关闭时
 * - 确保所有连接正确释放
 */
export const closePool = async () => {
  await pool.end()
  console.log('🔌 数据库连接池已关闭')
}

// 导出连接池实例（高级用法）
export default pool
