# Agent Instructions

> 如果你是 AI Agent，接手这个项目前，请先读完本文档。
> 预计阅读时间：2 分钟。

---

## ⚡ 项目定位（先搞清楚！）

这是一个**个人知识管理 + RAG 实验平台**：

- **RAG 系统是「壳」**：提供检索和问答能力
- **内容层是「核」**：90% 的日常工作是补充内容，不是改 RAG 代码
- **目的**：探索 agent memory 管理和知识组织方式

**核心原则：先搞清楚你要改的是「壳」还是「内容」，再动手！**

---

## 🗂️ 目录结构速览

```
frontend-rag-knowledge-base/
├── 🔧 内核层（改代码）
│   ├── server/              # 后端服务
│   ├── client/              # 前端页面
│   └── dev.ps1              # 一键启动
│
├── 📚 内容层（加内容）⭐ 大多数时候你在这层工作
│   └── content/
│       ├── AGENT.md         # ⭐ 内容层 Agent 指南（加内容前必读）
│       ├── CONTENT_PROTOCOL.md  # 内容渲染协议
│       ├── templates/       # 内容模板
│       ├── archive/         # 📦 降级归档区
│       └── active/          # ✨ 活跃内容区
│           ├── 01-knowledge-base/   # 纯知识点（高价值）
│           ├── 02-learning-projects/ # 学习项目（带 demo）
│           └── 03-source-notes/     # 来源整理（碎片化）
│
├── 🏠 治理层（全局配置）
│   ├── AGENT.md              # 你正在看的（根入口）
│   ├── README.md
│   ├── ARCHITECTURE.md
│   └── agent-memory/         # Agent 全局记忆
│
└── ... 其他配置文件
```

---

## 🎯 任务 → 目录 映射表

| 你要做什么 | 去哪里 | 先读什么 |
|-----------|--------|---------|
| 改 RAG 后端逻辑 | `server/` | `server/API_DOCS.md` |
| 改前端页面 | `client/` | `client/src/` 下的组件 |
| 加纯知识点笔记 | `content/active/01-knowledge-base/` | `content/AGENT.md` + 模板 |
| 开一个新的学习项目（带 demo） | `content/active/02-learning-projects/` | `content/AGENT.md` + 项目模板 |
| 记录来源整理笔记 | `content/active/03-source-notes/` | `content/AGENT.md` + 来源笔记模板 |
| 降级/归档内容 | 移到 `content/archive/` | `content/archive/README.md` |
| 记录全局 TODO/想法 | `agent-memory/current-state.md` | `agent-memory/README.md` |

---

## 📖 开始工作前

**必读 2 个文件（按顺序）：**

1. **[agent-memory/README.md](agent-memory/README.md)** — Agent Memory 入口索引，告诉你有什么、去哪找
2. **[agent-memory/current-state.md](agent-memory/current-state.md)** — 当前项目状态、进度、待办、注意事项

**如果要在 content/ 下加内容，额外读：**

3. **[content/AGENT.md](content/AGENT.md)** — 内容层 Agent 指南（分类、升降级、命名规范）

---

## ✅ 工作结束后

**请更新以下文件：**

1. **[agent-memory/current-state.md](agent-memory/current-state.md)** — 增量更新变化的部分（进度、待办、已知问题）
2. **[agent-memory/work-log/YYYY-MM-DD.md](agent-memory/work-log/)** — 记录今天做了什么、关键决策、踩了什么坑

---

## 📋 常用信息速查

| 内容 | 去哪找 |
|------|--------|
| 启动命令、测试命令 | [agent-memory/playbook/common-commands.md](agent-memory/playbook/common-commands.md) |
| 沙盒环境踩坑 | [agent-memory/playbook/sandbox-tips.md](agent-memory/playbook/sandbox-tips.md) |
| API 接口文档 | [server/API_DOCS.md](server/API_DOCS.md) |
| 项目整体架构 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 内容渲染协议 | [content/CONTENT_PROTOCOL.md](content/CONTENT_PROTOCOL.md) |

---

## ⚠️ 重要提醒

|  | 说明 |
|--|------|
| ❌ **不要乱放内容** | 什么类型的内容放什么目录，别混放 |
| ❌ **不要把全局 TODO 放子目录** | 全局待办去 `agent-memory/current-state.md` |
| ❌ **不要在 project-notes/ 里新建东西** | 那是旧目录，新项目去 `content/active/02-learning-projects/` |
| ✅ **加内容先看 content/AGENT.md** | 了解分类、升降级、命名规范 |
| ✅ **新项目用模板** | 从 `content/templates/` 复制 |

---

**一句话原则：先分清改代码还是加内容，再找对目录动手。**
