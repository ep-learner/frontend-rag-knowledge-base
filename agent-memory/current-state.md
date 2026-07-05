# 当前项目状态

> 最后更新：2026-07-06
> 状态：正常开发中

---

## 1. 基本信息

| 项 | 值 |
|----|----|
| 项目名 | frontend-rag-knowledge-base |
| 类型 | 前端 RAG 知识库（个人学习项目）|
| 主分支 | main |
| 最后 Commit | 本地未推送（GitHub 网络超时）|
| 远程仓库 | https://github.com/ep-learner/frontend-rag-knowledge-base.git |

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 后端 | Node.js + Express + TypeScript |
| 向量库 | 本地 JSON 文件 + Chroma（轻量实现）|
| LLM | Minimax API |
| 测试 | Jest + supertest + ts-jest |

---

## 3. 当前进度

### ✅ 已完成
- 前端三页：首页、文档列表、聊天页
- 后端核心：文档上传/列表/删除、对话（普通+流式）、日志
- API 格式统一：`{ code, data, message }` + 错误码体系
- 测试框架搭建：24 个单元测试（mock，不耗 token）+ 集成测试
- 测试数据库隔离：chroma-db-test/ 用完自动删
- API 文档：server/API_DOCS.md
- VibeVibe 学习笔记：基础篇 + 进阶篇 + Happy Coder
- README 重写：内容索引完善
- 一键启动脚本：dev.ps1

### 🔄 进行中
- 无

### 📋 待开始（按优先级）
1. **[高]** 数据库持久化改造：JSON → SQLite（学习 Prisma 或 Drizzle）
2. **[高]** 部署公网前必须加：API Key 鉴权（否则接口被滥用）
3. **[中]** 前端 API 层拆分：client.ts 按模块拆分
4. **[中]** 部署到公网：Vercel 前端 + 后端部署方案
5. **[低]** CI/CD：GitHub Actions 自动跑测试
6. **[低]** 更多测试覆盖：batch-upload、stream 流式对话

---

## 4. 已知问题 / 注意事项

| 问题 | 严重度 | 说明 |
|------|--------|------|
| GitHub 推送超时 | 低 | 沙盒环境网络问题，手动 `git push` 就行 |
| 集成测试耗 token | 中 | `pnpm test:integration` 会真实调用 Minimax API，别在 CI 里跑 |
| 向量库是 JSON 文件 | 中 | 目前 chroma.ts 用 JSON 文件存，数据量大了会慢，后续换 SQLite |
| 接口无鉴权 | 高 | **部署公网前必须加鉴权**，否则 API Key 会被刷爆 |

---

## 5. 下一步建议

根据当前状态，推荐优先做：

1. **先试试把服务跑起来**：`.\dev.ps1`，确认前后端都正常
2. **如果要改后端**：改之前先跑 `pnpm test`，确保有基线
3. **如果要加新功能**：建议先做数据库持久化，这是很多功能的基础

---

## 6. 关键文件索引

| 内容 | 去哪找 |
|------|--------|
| 接口文档 | [server/API_DOCS.md](../server/API_DOCS.md) |
| 架构说明 | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| 项目计划 | [PROJECT_PLAN.md](../PROJECT_PLAN.md) |
| 使用指南 | [USAGE_GUIDE.md](../USAGE_GUIDE.md) |
| 沙盒踩坑 | [playbook/sandbox-tips.md](playbook/sandbox-tips.md) |
| 常用命令 | [playbook/common-commands.md](playbook/common-commands.md) |
