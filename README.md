# Minimax 个人前端 RAG 知识库

基于 Minimax 大模型 + 向量数据库搭建的个人前端技术问答系统。

## 技术栈

- 后端：Node.js 18+ + Express + TypeScript
- 前端：Vite + React + TypeScript + Tailwind CSS
- 向量检索：内存向量存储（纯 JS 实现）
- 包管理器：pnpm

## 项目结构

```
frontend-rag-knowledge-base/
├── client/              # 前端页面 (Vite + React + TypeScript)
│   ├── src/
│   │   ├── api/                # API 接口封装
│   │   ├── components/         # React 组件
│   │   │   ├── Layout.tsx      # 布局组件
│   │   │   └── MarkdownViewer.tsx  # Markdown 渲染组件
│   │   ├── pages/              # 页面组件
│   │   │   ├── HomePage.tsx    # 首页
│   │   │   ├── ChatPage.tsx    # 问答页
│   │   │   └── DocumentsPage.tsx  # 文档管理页
│   │   ├── App.tsx             # 应用入口
│   │   └── main.tsx            # 主入口
│   └── package.json
├── server/              # RAG后端服务 (Express + TypeScript)
│   ├── src/
│   │   ├── app.ts              # 主入口文件
│   │   ├── services/
│   │   │   ├── chroma.ts       # 向量数据库服务
│   │   │   └── minimax.ts      # Minimax API 集成
│   │   ├── routes/
│   │   │   ├── chat.ts         # 问答接口
│   │   │   └── documents.ts    # 文档管理接口
│   │   ├── utils/
│   │   │   └── textSplitter.ts  # 文档分片工具
│   │   └── upload-docs.ts       # 文档批量上传脚本
│   └── .env                    # 环境变量（本地）
└── knowledge-docs/      # 前端知识库原始MD文档
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
