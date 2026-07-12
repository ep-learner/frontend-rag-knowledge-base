# Content Agent Guide

> 如果你是 AI Agent，要在 content/ 目录下工作，请先读完本文档。
> 预计阅读时间：2 分钟。

---

## 这是什么地方

`content/` 是**知识库内容层**，所有可被 RAG 检索的内容都在这里。

- RAG 系统是「壳」，这里的内容才是「核」
- 90% 的日常工作是往这里补充内容，而不是改 RAG 代码
- 内容有明确的分类和升降级机制

---

## 内容分类（三大类）

| 类别 | 目录 | 特点 | 示例 |
|------|------|------|------|
| **知识点笔记** | `active/01-knowledge-base/` | 整理过的、高价值、纯文本知识点 | TypeScript 类型系统、React Hooks 原理 |
| **学习项目** | `active/02-learning-projects/` | 带 demo 的项目实践，有代码 + 笔记 | VibeVibe 教程、n8n 学习 |
| **来源整理** | `active/03-source-notes/` | 碎片化内容、待沉淀、价值密度低 | 小红书笔记整理、抖音教程记录 |

---

## 内容生命周期（升降级机制）

```
source-notes → knowledge-base / learning-projects → archive
    ↓                ↓                              ↓
  初加工          高价值                          低价值保留
  价值低          主检索区                        不参与主检索
```

### 升级（内容质量提升）
- source-notes → knowledge-base：整理后价值高的纯知识点
- source-notes → learning-projects：做了 demo 后的项目笔记

### 降级（内容价值降低但不删）
**什么时候降级到 `archive/`：**
- 学完发现内容太浅、过时
- 项目做完但参考价值不大
- 重复内容、已被更好的内容替代

**降级操作：**
1. 将整个目录从 `active/` 移动到 `archive/` 对应位置
2. 保留原目录结构不变
3. 在 `archive/README.md` 登记降级原因

---

## 新增内容流程

### 场景 1：加一篇纯知识点笔记
→ 去 `active/01-knowledge-base/` 对应分类下新建 md
→ 模板：`templates/knowledge-note.md`

### 场景 2：开一个新的学习项目（带 demo）
→ 去 `active/02-learning-projects/` 新建项目目录
→ 目录结构遵循 `templates/learning-project/` 模板
→ 每个项目必须有自己的 `AGENT.md` 和 `README.md`

### 场景 3：记录一个来源整理
→ 去 `active/03-source-notes/` 对应来源分类下新建
→ 模板：`templates/source-note.md`

---

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 目录 | kebab-case，英文，有意义 | `vibe-learning`、`react-hooks-deep-dive` |
| 笔记文件 | 数字前缀 + 中文标题 | `01-类型系统深度解析.md` |
| 项目目录 | 英文小写，描述性 | `n8n-workflow`、`minimax-rag-practice` |

---

## 内容协议（重要！）

所有内容都遵循 **Content Manifest 协议**，前端会按照这个协议渲染页面。

### 知识点笔记（knowledge-note）
- 纯 Markdown，无特殊结构要求
- 建议有清晰的标题层级（#、##、###）

### 学习项目（learning-project）
每个项目目录必须包含：
```
project-name/
├── AGENT.md          # 本项目的 Agent 工作指南
├── README.md         # 项目说明（给人看）
├── manifest.json     # 内容清单（前端渲染用）
├── notes/            # 学习笔记（md 文件）
└── demo/             # （可选）可运行的 demo 代码
```

**manifest.json 格式：**
```json
{
  "id": "project-id",
  "title": "项目标题",
  "description": "一句话描述",
  "tags": ["tag1", "tag2"],
  "level": "beginner",
  "notes": [
    { "id": "note1", "title": "笔记1", "file": "notes/01-xxx.md" }
  ],
  "demos": [
    { "id": "demo1", "title": "Demo 1", "entry": "demo/index.html" }
  ],
  "coverImage": "assets/cover.png"
}
```

### 来源整理（source-note）
- Markdown 文件，开头要有元信息
- 建议标注：来源、日期、原文链接、核心要点

---

## 重要提醒

|  | 说明 |
|--|------|
| ⚠️ **不要乱放** | 什么类型的内容放什么目录，别混放 |
| ⚠️ **不要把全局 TODO 放这里** | 全局待办去 `../agent-memory/current-state.md` |
| ⚠️ **新增项目必须有 AGENT.md** | 让后续接手的 Agent 知道怎么干活 |
| ✅ **用模板** | 新增内容先复制 templates/ 里的模板 |
| ✅ **定期升降级** | 内容不是一成不变的，价值变化了就移动 |

---

**一句话原则：先分类再动手，价值变化就升降级。**
