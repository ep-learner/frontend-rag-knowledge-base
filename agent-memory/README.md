# Agent Memory

> 这是给 AI Agent 看的项目记忆。新 Agent 启动时先读此文件，按需深入。

---

## ⚡ 快速开始（必读，30秒）

**1. 当前项目状态 → [current-state.md](current-state.md)**
- 项目进度、未完成任务、已知问题、下一步建议
- 每次工作结束后更新

**2. 沙盒环境踩坑 → [playbook/sandbox-tips.md](playbook/sandbox-tips.md)**
- SSH、PowerShell、Git、端口占用等常见问题
- 环境出问题先查这个

**3. 常用命令速查 → [playbook/common-commands.md](playbook/common-commands.md)**
- 启动、测试、部署、上传文档等常用命令
- 不用再翻 package.json

---

## 📂 目录结构

```
agent-memory/
├── README.md              # 你正在看的（入口索引）
├── current-state.md       # ⭐ 当前项目状态（每次工作前必读）
├── work-log/              # 每日工作日志（历史档案，按需翻阅）
│   └── YYYY-MM-DD.md
└── playbook/              # 技能手册（环境、命令、约定）
    ├── sandbox-tips.md    # 沙盒环境踩坑指南
    └── common-commands.md # 常用命令速查
```

---

## 🔄 更新约定

| 文件 | 谁来更 | 什么时候更 |
|------|-------|-----------|
| `current-state.md` | 每个 Agent | 工作结束时，增量更新变化的部分 |
| `work-log/YYYY-MM-DD.md` | 每个 Agent | 当天工作结束时，记录当日产出 |
| `playbook/*` | 遇到新坑时 | 踩了新坑、总结了新经验就补充 |

---

## 📌 注意

- 这是 **Agent 内部文档**，不是给用户看的
- 保持简洁，能一句话说清的别写一段
- 具体技术文档去 `server/API_DOCS.md`、`ARCHITECTURE.md` 里找
