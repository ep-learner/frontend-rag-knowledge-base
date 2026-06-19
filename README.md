# Minimax 个人前端 RAG 知识库

基于 Minimax 大模型 + Chroma 向量数据库搭建的个人前端技术问答系统。

## 技术栈

- 后端：Node.js 18+ + Express + @minimaxai/node-sdk
- 前端：Vite + React
- 向量检索：Chroma DB（本地）
- 包管理器：pnpm

## 项目结构

```
frontend-rag-knowledge-base/
├── knowledge-docs/     # 前端知识库原始MD文档
├── server/             # RAG后端服务
└── web-frontend/       # 前端页面
```

## 快速开始

### 1. 环境变量配置

在 server 目录下创建 .env 文件：

```bash
cd server
copy .env.example .env
```

### 2. 安装依赖

```bash
cd server
pnpm install
```

### 3. 上传知识库文档

```bash
cd server
node run-upload.js
```

### 4. 启动后端服务

```bash
cd server
node src/app.js
```

## Minimax 配置步骤

1. 注册 [Minimax](https://www.minimax.chat/) 账号
2. 创建应用，获取 API_KEY
3. 将 API_KEY 填入 `server/.env` 文件

## 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| MINIMAX_API_KEY | Minimax API 密钥 | - |
| MINIMAX_BASE_URL | API 基础地址 | https://api.minimaxi.com/anthropic |
| CHROMA_DB_PATH | Chroma 数据库本地路径 | ./chroma-db |

## 文档书写规范

所有知识库文档请遵循 `knowledge-docs/template.md`