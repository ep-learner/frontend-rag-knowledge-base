# Agent 工作指南

> 本文档会被 Trae IDE 索引为项目上下文。
> 作为 AI Agent，请遵循以下工作流程。

---

## 工作流程

### 开始工作前

1. 读取 [agent-memory/current-state.md](../../agent-memory/current-state.md) — 了解当前项目状态、待办、已知问题
2. 读取 [agent-memory/README.md](../../agent-memory/README.md) — 了解 Agent Memory 体系结构
3. 如有需要，查阅 [agent-memory/playbook/common-commands.md](../../agent-memory/playbook/common-commands.md) — 常用命令速查

### 工作结束后

1. **更新 [agent-memory/current-state.md](../../agent-memory/current-state.md)** — 增量更新：
   - 完成了哪些任务
   - 新增了哪些已知问题
   - 下一步建议有没有变化
2. **在 [agent-memory/work-log/](../../agent-memory/work-log/) 新增或更新当日日志** — 记录：
   - 今日完成内容
   - 关键决策及原因
   - 踩坑记录
   - 未完成事项

---

## 重要约定

| 约定 | 说明 |
|------|------|
| **测试命令** | `pnpm test` 跑单元测试（mock，不耗 API Key）；`pnpm test:integration` 才是真实调用 |
| **测试数据库** | 单元测试用 `chroma-db-test/`，会自动清理，不污染正式数据 |
| **API 格式** | 统一返回 `{ code, data, message }`，错误码见 API_DOCS |
| **向量库** | 目前是 JSON 文件存储，后续计划改 SQLite |
| **鉴权** | 目前无鉴权，部署公网前必须加 |

---

## 关键文档索引

| 文档 | 路径 |
|------|------|
| API 接口文档 | [server/API_DOCS.md](../../server/API_DOCS.md) |
| 项目架构 | [ARCHITECTURE.md](../../ARCHITECTURE.md) |
| 项目计划 | [PROJECT_PLAN.md](../../PROJECT_PLAN.md) |
| 使用指南 | [USAGE_GUIDE.md](../../USAGE_GUIDE.md) |
| 沙盒踩坑 | [agent-memory/playbook/sandbox-tips.md](../../agent-memory/playbook/sandbox-tips.md) |
