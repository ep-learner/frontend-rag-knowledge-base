# Learning Projects - 学习项目

> 带 demo 的学习项目，有代码 + 笔记。RAG 主检索区。

---

## 说明

- 这里放**带 demo 的学习项目
- 每个项目是一个独立目录，有自己的 AGENT.md、README.md、manifest.json
- 前端会按照 manifest.json 渲染项目页面（笔记列表 + Demo 预览）

---

## 项目结构规范

每个项目必须包含：

```
project-name/
├── AGENT.md          # 本项目的 Agent 指南
├── README.md         # 项目说明
├── manifest.json     # 内容清单（前端渲染用）
├── notes/            # 学习笔记
└── demo/             # （可选）可运行的 demo
```

**manifest.json 是必须的**，前端靠它知道这个项目有什么内容。

---

## 新增项目

1. 从 `../../templates/learning-project/` 复制模板
2. 重命名目录，修改 AGENT.md、README.md、manifest.json 里的占位符
3. 开始学习，往 notes/ 里加笔记，往 demo/ 里加代码

---

## 当前项目

（暂无）
