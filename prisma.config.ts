/**
 * Prisma 配置文件
 *
 * 【递归学习提示】如果你不理解某个概念，可以追问：
 * - "为什么 Prisma 7 要把 url 从 schema.prisma 移到这里？"
 * - "datasource.url 和 PrismaClient 的 adapter 有什么区别？"
 */

// 加载环境变量
import "dotenv/config";
import { defineConfig } from "prisma/config";

// 【核心概念】Prisma 配置
// - schema: Prisma Schema 文件路径
// - migrations: 迁移文件存放路径
// - datasource.url: 数据库连接字符串（从环境变量读取）
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 【重要】Prisma 7+ 版本中，数据库 URL 配置在这里
    // 格式：postgresql://用户名:密码@主机:端口/数据库名
    url: process.env["DATABASE_URL"],
  },
});
