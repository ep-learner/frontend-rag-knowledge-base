# Active Content - Agent Guide

> 活跃内容区 — 所有正在维护、需要被 RAG 检索的内容都在这里。
> 加内容前先看根目录 [content/AGENT.md](../AGENT.md)

---

## 三个子目录分工

| 目录 | 放什么 | 例子 | RAG 索引 |
|------|--------|------|---------|
| `01-knowledge-base/` | **纯知识点笔记**：结构化、高价值、可独立检索的知识条目 | React Hooks 原理、TypeScript 泛型、CSS 布局技巧 | ✅ 是 |
| `02-learning-projects/` | **学习项目**：带 demo、有完整上下文的项目式学习内容，每个项目有自己的 `manifest.json` | vibeLearning 项目、todo-app 实战 | ✅ 只索引 .md |
| `03-source-notes/` | **来源整理**：碎片化的文章/视频/课程笔记，保留原始来源链接，价值密度低 | 某篇博客的笔记、某个视频的摘抄 | ✅ 是 |

---

## 加内容的判断流程

```
你要加内容
    ↓
这是一个完整的学习项目吗？（有 demo、有多个章节）
    ├─ 是 → 02-learning-projects/
    └─ 否
         ↓
    这是系统化的知识点吗？（结构清晰、高价值）
         ├─ 是 → 01-knowledge-base/
         └─ 否 → 03-source-notes/
```

---

## 命名规范

| 类型 | 格式 | 例子 |
|------|------|------|
| 目录 | `kebab-case` 小写，短横线分隔 | `react-hooks`, `vibe-learning` |
| 文件 | `kebab-case` 小写，`.md` 后缀 | `use-effect-deep-dive.md` |
| 分类目录 | `数字-名称` 形式，用于排序 | `01-react`, `02-typescript` |

---

## 内容模板

从 `content/templates/` 复制：

| 内容类型 | 模板路径 |
|---------|---------|
| 知识点笔记 | `templates/knowledge-note.md` |
| 学习项目（整套） | `templates/learning-project/` |
| 来源整理笔记 | `templates/source-note.md` |

---

## 升降级（归档/恢复）

**降级到 archive/**：当内容长期不维护、价值下降、或者只是历史存档时，把整个目录移到 `content/archive/` 对应子目录下。

**从 archive/ 恢复**：移回 `active/` 对应目录即可。

> 注意：降级后的内容**不会**被 RAG 索引，也不会在前端知识库页面展示。

---

## 重要提醒

|  | 说明 |
|--|------|
| ❌ **不要放代码文件** | 代码放在项目的 demos/ 里，但 RAG 只索引 .md |
| ❌ **不要乱放** | 什么类型放什么目录，别混放 |
| ✅ **每个文件要有 frontmatter** | title、description、tags 至少填一下 |
| ✅ **学习项目必须有 manifest.json** | 没有的话前端识别不出来 |
