# Minimax 个人前端 RAG 知识库 - 项目计划

## 项目概述

基于 Minimax 大模型 + Chroma 向量数据库搭建的个人前端技术问答系统。

## 进度总览

| 阶段 | 状态 | 预计时间 |
|------|------|----------|
| Phase 1: 项目初始化 | ✅ 完成 | Day 1 |
| Phase 2: 知识库文档创建 | ✅ 完成 | Day 1 |
| Phase 3: 后端服务开发 | 🔲 待开始 | Day 2-3 |
| Phase 4: 前端页面开发 | 🔲 待开始 | Day 4-5 |
| Phase 5: RAG 功能集成 | 🔲 待开始 | Day 6-7 |
| Phase 6: 测试与优化 | 🔲 待开始 | Day 8-9 |
| Phase 7: 部署上线 | 🔲 待开始 | Day 10 |

---

## Phase 1: 项目初始化 ✅

- [x] 创建项目目录结构
- [x] 配置 Git 仓库
- [x] 创建 .env.example 和 .gitignore
- [x] 配置 README.md
- [x] 推送 GitHub

---

## Phase 2: 知识库文档创建 ✅

- [x] TypeScript 笔记（8篇）
- [x] React 核心原理笔记（8篇）
- [x] 前端工程化笔记（6篇）
- [x] 浏览器性能优化笔记（6篇）
- [x] NodeJS 后端笔记（4篇）
- [x] 面试复盘笔记（4篇）

---

## Phase 3: 后端服务开发 🔲

### 3.1 环境配置
- [ ] 安装依赖（express, chromadb, @minimaxai/node-sdk）
- [ ] 配置 TypeScript
- [ ] 配置 tsconfig.json

### 3.2 数据库服务
- [ ] 创建 Chroma DB 客户端
- [ ] 实现文档向量化存储
- [ ] 实现向量相似度检索

### 3.3 API 接口
- [ ] 创建文档上传接口
- [ ] 创建问答接口
- [ ] 创建文档列表接口
- [ ] 创建文档删除接口

### 3.4 业务逻辑
- [ ] 实现 RAG 检索增强生成
- [ ] 实现文档分片处理
- [ ] 实现上下文管理

---

## Phase 4: 前端页面开发 🔲

### 4.1 环境配置
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 安装依赖（tailwindcss, lucide-react, axios）
- [ ] 配置 Tailwind CSS

### 4.2 页面组件
- [ ] 首页：知识库概览
- [ ] 问答页面：RAG 问答交互
- [ ] 文档管理页面：上传/删除文档
- [ ] 导航栏组件

### 4.3 交互功能
- [ ] 问答输入与流式输出
- [ ] 文档上传与进度显示
- [ ] 响应式设计

---

## Phase 5: RAG 功能集成 🔲

- [ ] 集成 Minimax API
- [ ] 实现文档向量化流程
- [ ] 实现检索结果注入
- [ ] 优化检索精度

---

## Phase 6: 测试与优化 🔲

- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] Bug 修复

---

## Phase 7: 部署上线 🔲

- [ ] 打包构建
- [ ] Docker 容器化
- [ ] 部署到云服务器
- [ ] 配置域名与 SSL

---

## 环境变量

```bash
MINIMAX_API_KEY=your-minimax-api-key
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic
CHROMA_DB_PATH=./chroma-db
PORT=3000
```

---

## 技术栈

- 后端：Node.js 18+ + Express + TypeScript
- 前端：Vite + React + TypeScript + Tailwind CSS
- 向量数据库：Chroma DB（本地）
- API：Minimax Anthropic-compatible API
- 包管理器：pnpm

---

## 更新记录

| 日期 | 进度 | 备注 |
|------|------|------|
| 2026-06-19 | Phase 1 & 2 完成 | 项目初始化 + 36篇知识库文档 |
