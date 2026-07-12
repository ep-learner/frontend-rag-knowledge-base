# Vibe Learning Project - Agent Guide

> 本项目是跟着 VibeVibe 教程学习 AI 编程助手的完整记录

---

## 项目结构

```
vibe-learning/
├── manifest.json      # ⭐ 项目清单（前端渲染依据，改内容必须同步更新）
├── README.md          # 项目介绍（详情页默认展示）
├── AGENT.md           # 你正在看的
├── notes/             # 学习笔记（按章节/阶段分目录）
│   ├── base-level/    # 基础篇笔记
│   └── next-level/    # 进阶篇笔记
└── demos/             # Demo 页面（可直接嵌入前端 iframe）
    └── base-demo/     # 基础篇 demo
```

---

## 加内容的规则

| 操作 | 怎么做 |
|------|--------|
| 加一篇笔记 | 1. 把 .md 放到 `notes/` 对应子目录<br>2. **必须**在 `manifest.json` 的 `notes` 数组里加一条 |
| 加一个 demo | 1. 把 demo 放到 `demos/xxx/` 目录<br>2. **必须**在 `manifest.json` 的 `demos` 数组里加一条，填好 `entry`（入口 html 路径） |
| 加一个新章节 | 1. 在 `notes/` 下建子目录<br>2. 在 `manifest.json` 的 `sections` 数组里加章节定义<br>3. 笔记的 `section` 字段对应上 |

---

## ⚠️ 重要提醒

- **manifest.json 是和前端的契约**，加了笔记或 demo 不更新 manifest，前端看不到
- demo 是纯静态页面（html/css/js），不要放后端代码
- 笔记写在 .md 里，支持 frontmatter（title/description/tags）
