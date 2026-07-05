# 前端 RAG 知识库 + AI 开发学习笔记

一个**个人前端技术知识库 + AI 辅助开发学习笔记**的集合项目。

核心包含两部分：
- **RAG 知识库系统**：基于 Minimax 大模型 + 向量检索的前端技术问答系统
- **AI 开发学习笔记**：记录 AI 辅助开发、Agent 工具、全栈教程等学习过程

---

## 📚 知识库内容

### 前端技术知识库（knowledge-docs/）

已整理的技术笔记，可直接导入 RAG 系统：

| 分类 | 数量 | 包含内容 |
|------|------|----------|
| TypeScript | 8 篇 | 类型系统、泛型、类型体操、模块系统、装饰器、类型守卫、异步编程、编译器配置 |
| React 核心原理 | 8 篇 | 组件原理、状态管理、虚拟 DOM、Hooks、Context、性能优化、SSR、错误边界 |
| 前端工程化 | 6 篇 | Vite、Webpack、ESLint、自动化测试、CI/CD、监控与性能监控 |
| 浏览器性能优化 | 6 篇 | 渲染原理、资源加载、JS 性能、网络优化、安全与性能、移动端优化 |
| Node.js 后端 | 4 篇 | 核心模块、Express、数据库 ORM、API 设计与安全 |
| 面试复盘 | 4 篇 | TypeScript、React、工程化、浏览器原理 常见坑与避坑指南 |
| 前端交互与动画 | 1 篇 | 滚动定位与锚点原理深度解析 |

### AI 开发学习笔记（project-notes/）

记录 AI 辅助开发过程中的工具探索、教程学习、方法论总结：

| 目录 | 内容 |
|------|------|
| [vibeLearning/](project-notes/vibeLearning/) | VibeVibe 教程学习笔记（基础篇 + Happy Coder 进阶篇） + baseDemo 原型 |
| [n8n/](project-notes/n8n/) | n8n 工作流自动化工具学习笔记 |
| [SOP.md](project-notes/SOP.md) | AI 辅助开发标准作业流程 |
| [USER_GUIDE.md](project-notes/USER_GUIDE.md) | 用户指南 |

---

## 🛠️ 技术栈

### RAG 系统

- **后端**：Node.js 18+ + Express + TypeScript
- **前端**：Vite + React + TypeScript + Tailwind CSS
- **向量检索**：内存向量存储（纯 JS 实现，双模式：语义检索 + 快速检索）
- **大模型**：Minimax（ChatCompletion + Embedding API）
- **包管理器**：pnpm

---

## 📁 项目结构

```
frontend-rag-knowledge-base/
├── client/                    # 前端页面 (Vite + React + TypeScript)
│   ├── src/
│   │   ├── api/                # API 接口封装
│   │   ├── components/         # React 组件
│   │   ├── pages/              # 页面组件（首页 / 问答 / 文档管理）
│   │   ├── App.tsx             # 应用入口
│   │   └── main.tsx            # 主入口
│   └── package.json
├── server/                    # RAG 后端服务 (Express + TypeScript)
│   ├── src/
│   │   ├── app.ts              # 主入口
│   │   ├── services/
│   │   │   ├── chroma.ts       # 向量数据库服务（双写向量）
│   │   │   └── minimax.ts      # Minimax API 集成
│   │   ├── routes/
│   │   │   ├── chat.ts         # 问答接口（普通 + 流式）
│   │   │   └── documents.ts    # 文档管理接口
│   │   ├── utils/
│   │   │   └── textSplitter.ts # 文档分片工具
│   │   └── upload-docs.ts      # 批量上传脚本
│   └── .env.example
├── knowledge-docs/            # 前端知识库原始 MD 文档
│   ├── 01-TypeScript/
│   ├── 02-React核心原理/
│   ├── 03-前端工程化/
│   ├── 04-浏览器性能优化/
│   ├── 05-NodeJS后端/
│   ├── 06-面试复盘/
│   ├── 07-前端交互与动画/
│   └── template.md
├── project-notes/             # AI 开发学习笔记
│   ├── vibeLearning/          # VibeVibe 教程 + Happy Coder 笔记
│   ├── n8n/                   # n8n 工作流工具笔记
│   ├── SOP.md                 # AI 辅助开发 SOP
│   └── USER_GUIDE.md          # 用户指南
├── ARCHITECTURE.md            # 双写向量技术架构文档
├── PROJECT_PLAN.md            # 项目计划与进度
├── RAG_LEARNING_NOTES.md      # RAG 学习笔记
└── README.md
```

## 快速开始

### 1. 环境变量配置

在 server 目录下创建 .env 文件：

```bash
cd server
copy .env.example .env
```

编辑 `.env` 文件，填入你的 Minimax API Key：

```bash
MINIMAX_API_KEY=your-api-key-here
MINIMAX_GROUP_ID=your-group-id
```

### 2. 安装依赖

```bash
cd server
pnpm install
```

### 3. 上传知识库文档

```bash
cd server
pnpm upload
```

这会读取 `knowledge-docs/` 目录下的所有 Markdown 文件，分片后存入向量数据库。

### 4. 启动后端服务

```bash
cd server
pnpm dev
```

服务启动后访问：http://localhost:3000

### 5. 启动前端服务

```bash
cd client
pnpm install
pnpm dev
```

前端启动后访问：http://localhost:5173

## API 接口

### 后端接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | /api/health | 健康检查 |
| POST | /api/documents/upload | 上传单篇文档 |
| POST | /api/documents/batch-upload | 批量上传文档 |
| GET | /api/documents/stats | 获取文档统计 |
| GET | /api/documents/list | 获取文档列表 |
| GET | /api/documents/content/:source | 获取文档内容 |
| DELETE | /api/documents/:id | 删除文档 |
| POST | /api/chat | RAG 问答 |
| POST | /api/chat/stream | RAG 问答（流式） |
| GET | /api/chat/logs | 查看问答日志 |
| GET | /api/chat/logs/stats | 查看日志统计 |
| GET | /api/chat/logs/:id | 查看单条日志详情 |

### 前端页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 首页 | / | 知识库概览、统计数据、功能入口 |
| 问答页 | /chat | RAG 智能问答、多轮对话、模式切换 |
| 文档管理 | /documents | 文档列表、上传、查看、统计信息 |

## Minimax 配置步骤

1. 注册 [Minimax](https://www.minimax.chat/) 账号
2. 创建应用，获取 API_KEY
3. 获取 GROUP_ID（在账户中心查看）
4. 将 API_KEY 和 GROUP_ID 填入 `server/.env` 文件
5. 充值账户余额（首次充值有优惠）

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MINIMAX_API_KEY | Minimax API 密钥 | - |
| MINIMAX_GROUP_ID | Minimax 组织 ID | - |
| MINIMAX_BASE_URL | API 基础地址 | https://api.minimax.chat/v1/chat/completions |
| CHROMA_DB_PATH | 数据库路径 | ./chroma-db |
| PORT | 服务端口 | 3000 |

## 文档书写规范

所有知识库文档请遵循 `knowledge-docs/template.md`

## 更新记录

- 2026-06-19: 首次提交，完成36篇知识库文档创建
- 2026-06-22: 完成后端服务开发，修复 API 地址和向量存储方案
- 2026-06-23: 完成前端页面开发，包含首页、问答、文档管理页面
- 2026-06-23: 实现双模式 Embedding（语义检索 + 快速检索）
- 2026-06-23: 实现完整的日志系统，记录问答上下文和 Token 消耗
- 2026-06-23: 实现文档内容查看功能，支持 Markdown 渲染
