# Minimax 个人前端 RAG 知识库

基于 Minimax 托管知识库搭建的个人前端技术问答系统。

## 技术栈

- 后端：Node.js 18+ + Express + @minimaxai/node-sdk
- 前端：Vite + React
- 向量检索：Minimax 托管知识库
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

复制 `.env.example` 为 `.env`，填写 Minimax 相关配置：

```bash
cp .env.example .env
```

### 2. 安装依赖

```bash
cd server
pnpm install
```

### 3. 上传知识库文档

```bash
node run-upload.js
```

### 4. 启动后端服务

```bash
node src/app.js
```

## Minimax 配置步骤

1. 注册 [Minimax](https://www.minimax.chat/) 账号
2. 创建应用，获取 API_KEY
3. 创建分组，获取 GROUP_ID
4. 创建知识库，获取 KNOWLEDGE_BASE_ID
5. 将以上信息填入 `.env` 文件

## 文档书写规范

所有知识库文档请遵循 `knowledge-docs/template.md`