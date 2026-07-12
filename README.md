# 前端 RAG 知识库

一个**个人知识管理 + RAG 实验平台**。既是一个可用的 RAG 问答系统，也是一个探索 agent memory 和知识组织方式的实验场。

---

## 🗺️ 能力地图

### 内容层（你主要用的）

| 内容类型 | 放哪里 | 展示形式 | 加内容要不要改代码 |
|---------|--------|---------|-----------------|
| 📚 知识点笔记 | `content/active/01-knowledge-base/` | 分类 → 文档 → Markdown | ❌ 不用，丢 .md 进去就行 |
| 🎯 学习项目（带 demo） | `content/active/02-learning-projects/` | 项目卡片 → 详情页（笔记 + demo iframe） | ❌ 不用，加目录 + manifest.json |
| 📎 来源整理 | `content/active/03-source-notes/` | 来源分类 → 文档 → Markdown | ❌ 不用，丢 .md 进去就行 |
| 📦 归档内容 | `content/archive/` | —（不展示，不索引） | — |

### 功能层

| 功能 | 说明 |
|------|------|
| 🔍 RAG 智能问答 | 基于向量检索 + 大模型，问问题从知识库找答案 |
| 🌐 知识库浏览 | 网页端浏览所有内容，支持三类内容切换 |
| 📱 Demo 预览 | 学习项目的 demo 可以直接在页面里用 iframe 打开 |
| 🔄 索引重建 | 前端一键重建 RAG 向量索引 |

### 技术栈

- **前端**：Vite + React + TypeScript + Tailwind CSS
- **后端**：Node.js + Express + TypeScript
- **向量存储**：本地 JSON 文件（纯 JS 实现，双模式：语义检索 + 快速检索）
- **大模型**：Minimax（ChatCompletion + Embedding API）

---

## 📁 项目结构

```
frontend-rag-knowledge-base/
├── 🎨 client/                 # 前端页面
├── ⚙️ server/                 # 后端服务
│   └── src/routes/content.ts  # 内容 API（读文件系统）
│
├── 📚 content/                # ⭐ 所有内容在这里
│   ├── AGENT.md               # 内容层 Agent 指南
│   ├── CONTENT_PROTOCOL.md    # 内容渲染协议（扩展必看）
│   ├── templates/             # 内容模板
│   ├── active/                # 活跃内容（被索引 + 展示）
│   │   ├── 01-knowledge-base/ # 纯知识点
│   │   ├── 02-learning-projects/ # 学习项目（带 demo）
│   │   └── 03-source-notes/   # 来源整理
│   └── archive/               # 归档内容（不索引不展示）
│
├── 🤖 agent-memory/           # Agent 工作记忆（频繁更新）
│   ├── README.md              # Agent Memory 入口
│   ├── current-state.md       # 当前状态/待办
│   └── work-log/              # 工作日志
│
├── 🏗️ ARCHITECTURE.md         # 技术架构文档
├── 🤖 AGENT.md                # Agent 入口指南
└── 📖 README.md               # 你正在看的
```

---

## 🚀 快速开始

### 1. 配置环境变量

```bash
cd server
cp .env.example .env
# 编辑 .env，填入 MINIMAX_API_KEY 和 MINIMAX_GROUP_ID
```

### 2. 安装依赖

```bash
cd server && pnpm install
cd ../client && pnpm install
```

### 3. 构建索引

```bash
cd server
pnpm upload:simple   # 快速模式（不消耗 Token）
# 或
pnpm upload          # 语义模式（消耗 Token，质量高）
```

### 4. 启动

```bash
# 一键启动（Windows PowerShell）
.\dev.ps1

# 或分别启动
cd server && pnpm dev    # 后端：http://localhost:3000
cd client && pnpm dev    # 前端：http://localhost:5173
```

---

## 🧩 扩展边界

### ✅ 零代码扩展（直接用）
- 加知识点笔记、加分类
- 加学习项目、加笔记、加 demo
- 加来源整理笔记
- 内容升降级（active ↔ archive）

### ⚠️ 小改就能扩展（改前端组件 + manifest 加字段）
- 给笔记/项目加新的元数据字段（难度、阅读时长、评分等）
- 列表页加筛选、排序功能
- 调整展示样式（卡片换列表、换布局）

### ❌ 需要大改（加新内容类型 / 新交互）
- 新增第四类内容（比如代码片段库、视频教程、思维导图）
- 支持非 Markdown 内容（PDF、图片集、Notion 页面）
- 可交互的 demo（不是纯静态 iframe，而是和主站有通信）
- 多用户、权限系统
- 评论、点赞等社交功能

---

## 📖 想深入了解？

| 你想知道什么 | 去看哪 |
|-------------|--------|
| 技术架构怎么设计的 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 内容渲染协议细节 | [content/CONTENT_PROTOCOL.md](content/CONTENT_PROTOCOL.md) |
| 内容怎么加、怎么升降级 | [content/AGENT.md](content/AGENT.md) |
| 使用指南 | [docs/USAGE_GUIDE.md](docs/USAGE_GUIDE.md) |
| RAG 技术学习笔记 | [docs/rag/](docs/rag/) |
| 想法和待办计划 | [plans/README.md](plans/README.md) |
| 有哪些 API 接口 | `server/API_DOCS.md` |
| Agent 怎么工作的 | [AGENT.md](AGENT.md) |

---

## 更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-07-12 | 搭建 content 内容层架构；新增知识库页面（三 Tab + 项目详情 + demo 预览）；前端一键重建索引；dev.ps1 修复 |
| 2026-07-05 | 新增 VibeVibe 基础篇学习笔记 + Happy Coder 进阶篇笔记 + baseDemo 原型 |
| 2026-06-23 | 完成前端页面开发；实现双模式 Embedding；日志系统 |
| 2026-06-22 | 完成后端服务开发；RAG 功能集成 |
| 2026-06-19 | 首次提交；36 篇知识库文档；项目初始化 |
