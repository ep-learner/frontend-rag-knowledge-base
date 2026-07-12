# Content Library

> 个人知识库内容层 — 所有可检索的内容都在这里。

---

## 📂 目录结构

```
content/
├── AGENT.md              # Agent 工作指南（先读这个！）
├── README.md             # 你正在看的
├── templates/            # 内容模板
│   ├── knowledge-note.md
│   ├── source-note.md
│   └── learning-project/
├── archive/              # 📦 降级区（低价值但保留）
│   └── README.md
└── active/               # ✨ 活跃内容区
    ├── 01-knowledge-base/    # 纯知识点（高价值、整理过）
    ├── 02-learning-projects/ # 学习项目（带 demo）
    └── 03-source-notes/      # 来源整理（碎片化、待沉淀）
```

---

## 🎯 内容分类说明

| 类别 | 特点 | 价值密度 | RAG 检索 |
|------|------|---------|----------|
| knowledge-base | 整理过的纯知识点 | 高 | ✅ 主检索 |
| learning-projects | 带 demo 的项目实践 | 中高 | ✅ 主检索 |
| source-notes | 来源整理、碎片化 | 中低 | ⚡ 可选 |
| archive | 降级归档 | 低 | ❌ 不检索 |

---

## 🔄 升降级机制

内容不是一成不变的，价值变化了就移动：

- **升级**：source-notes → knowledge-base / learning-projects
- **降级**：knowledge-base / learning-projects → archive

详见 [AGENT.md](./AGENT.md)。

---

## 🚀 快速开始

**新增内容：**
1. 确定内容类型（知识点 / 学习项目 / 来源整理）
2. 从 `templates/` 复制对应模板
3. 放到 `active/` 对应目录下

**浏览内容：**
- 启动前端项目 → 知识库页面 → 三个 Tab 切换查看
