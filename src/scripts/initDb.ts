/**
 * 数据库初始化脚本
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "什么是 DDL（数据定义语言）？"
 * - "为什么要用脚本初始化数据库？"
 * - "SERIAL 和 BIGSERIAL 是什么？"
 */

import { query, testConnection, closePool } from '../config/database';

/**
 * 创建用户表
 *
 * 【核心概念】DDL (Data Definition Language)
 * - 作用：定义数据库结构（表、索引、约束等）
 * - 常见命令：CREATE, ALTER, DROP
 *
 * 【对比 SQL Server】
 * - SERIAL → SQL Server 的 IDENTITY
 * - TIMESTAMP → SQL Server 的 DATETIME2
 * - TEXT → SQL Server 的 NVARCHAR(MAX)
 */
const createUsersTable = async () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      -- 主键：自增 ID
      -- SERIAL = INTEGER + AUTO_INCREMENT
      id SERIAL PRIMARY KEY,

      -- 用户名：不能为空
      name VARCHAR(100) NOT NULL,

      -- 邮箱：唯一约束
      email VARCHAR(255) NOT NULL UNIQUE,

      -- 时间戳：默认当前时间
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableSQL);
    console.log('✅ users 表创建成功');
  } catch (error) {
    console.error('❌ users 表创建失败:', error);
    throw error;
  }
};

/**
 * 创建索引
 *
 * 【核心概念】索引 (Index)
 * - 作用：加速查询，类似书的目录
 * - 代价：占用空间，降低写入速度
 * - 原则：在经常查询的字段上创建索引
 *
 * 【对比 SQL Server】
 * - 语法基本相同
 * - PostgreSQL 支持更多索引类型（GIN, GiST, BRIN 等）
 */
const createIndexes = async () => {
  const createIndexSQL = `
    -- 在 email 字段上创建索引（加速邮箱查询）
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    -- 在 created_at 字段上创建索引（加速时间范围查询）
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
  `;

  try {
    await query(createIndexSQL);
    console.log('✅ 索引创建成功');
  } catch (error) {
    console.error('❌ 索引创建失败:', error);
    throw error;
  }
};

/**
 * 插入示例数据
 *
 * 【学习要点】
 * - 使用 INSERT INTO ... VALUES 插入数据
 * - ON CONFLICT DO NOTHING：如果冲突则忽略（避免重复插入）
 */
const insertSampleData = async () => {
  const insertDataSQL = `
    INSERT INTO users (name, email) VALUES
      ('张三', 'zhangsan@example.com'),
      ('李四', 'lisi@example.com'),
      ('王五', 'wangwu@example.com')
    ON CONFLICT (email) DO NOTHING;
  `;

  try {
    const result = await query(insertDataSQL);
    console.log(`✅ 示例数据插入成功（插入 ${result.rowCount} 条）`);
  } catch (error) {
    console.error('❌ 示例数据插入失败:', error);
    throw error;
  }
};

/**
 * 主函数：执行所有初始化步骤
 *
 * 【执行流程】
 * 1. 测试数据库连接
 * 2. 创建表
 * 3. 创建索引
 * 4. 插入示例数据
 * 5. 关闭连接池
 */
const initDatabase = async () => {
  console.log('🚀 开始初始化数据库...\n');

  try {
    // 1. 测试连接
    console.log('📌 步骤 1: 测试数据库连接');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('数据库连接失败');
    }
    console.log('');

    // 2. 创建表
    console.log('📌 步骤 2: 创建数据表');
    await createUsersTable();
    console.log('');

    // 3. 创建索引
    console.log('📌 步骤 3: 创建索引');
    await createIndexes();
    console.log('');

    // 4. 插入示例数据
    console.log('📌 步骤 4: 插入示例数据');
    await insertSampleData();
    console.log('');

    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    // 关闭连接池
    await closePool();
  }
};

// 执行初始化
initDatabase();
