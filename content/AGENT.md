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

## 内容协议（展示层契约）

**所有内容都遵循 Content Protocol，前端按协议渲染。**

完整协议文档：[CONTENT_PROTOCOL.md](CONTENT_PROTOCOL.md)

**快速参考：**

| 内容类型 | 驱动方式 | 加内容要不要改代码 |
|---------|---------|-----------------|
| knowledge-base | 目录驱动 | ❌ 不用，丢 .md 进分类目录 |
| learning-projects | manifest.json 驱动 | ❌ 不用，加文件 + 更新 manifest |
| source-notes | 目录驱动 | ❌ 不用，丢 .md 进分类目录 |

**什么时候需要扩展协议？**
- 加新的元数据字段 → 小改
- 加全新的内容类型（第四类）→ 大改
- 详细决策树见 [CONTENT_PROTOCOL.md](CONTENT_PROTOCOL.md#扩展决策指南)

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
