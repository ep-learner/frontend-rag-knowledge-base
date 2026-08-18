# 当前项目状态

> 最后更新：2026-08-19
> 状态：视频笔记工具迭代完成，转向「插件提取 + 模板整理」方案

---

## 1. 基本信息

| 项 | 值 |
|----|----|
| 项目名 | frontend-rag-knowledge-base |
| 类型 | 前端 RAG 知识库（个人学习+知识组织实验）|
| 主分支 | main |
| 最后 Commit | 83c53f8（文档体系整理 + plans/ 目录 + 两个 skill）|
| 远程仓库 | https://github.com/ep-learner/frontend-rag-knowledge-base.git |

---

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 后端 | Node.js + Express + TypeScript |
| 向量库 | 本地 JSON 文件（纯 JS 实现，双模式：语义 + 快速）|
| LLM | Minimax API（ChatCompletion + Embedding）|
| 测试 | Jest + supertest + ts-jest |

---

## 3. 架构概览

### 核心分层
```
┌─────────────────────────────────────┐
│  内容层 content/                    │  ← 大多数日常工作在这里
│  ├─ active/01-knowledge-base       │     知识点笔记（目录驱动）
│  ├─ active/02-learning-projects    │     学习项目（manifest 驱动，带 demo）
│  └─ active/03-source-notes         │     来源整理（目录驱动）
├─────────────────────────────────────┤
│  渲染层（前端 + 后端 API）          │  ← 按 Content Protocol 渲染
├─────────────────────────────────────┤
│  RAG 层（检索 + 问答）              │  ← 索引 content/active 下的 .md
└─────────────────────────────────────┘
```

### 关键文档
- **README.md** — 给人看的：能力地图、扩展边界、快速开始
- **ARCHITECTURE.md** — 技术架构详解
- **content/CONTENT_PROTOCOL.md** — 内容渲染协议 + 扩展决策指南
- **AGENT.md** — 给 agent 看的：入口导航、必更清单、提交前检查

---

## 4. 当前进度

### ✅ 已完成
- **RAG 基础**：前端三页（首页/文档/聊天）、后端核心、双模式检索
- **API 规范化**：统一 `{ code, data, message }` + 错误码体系
- **测试框架**：24 个单元测试（mock）+ 集成测试隔离
- **Agent Memory 体系**：agent-memory/ 目录 + current-state + work-log
- **内容层架构**（2026-07-12）：
  - content/ 目录三层架构（active + archive + templates）
  - 三类内容：knowledge-base / learning-projects / source-notes
  - Content Protocol 渲染协议 + 扩展决策指南
  - 后端 content API（10+ 接口，读文件系统）
  - 前端知识库页面（三 Tab + 项目详情 + demo iframe）
  - 前端一键重建索引
  - dev.ps1 修复（英文避免编码问题）
- **内容迁移**（第一批）：
  - 前端交互与动画 → 01-knowledge-base
  - VibeVibe 学习项目 → 02-learning-projects/vibe-learning
  - Vercel&Netlify 部署指南 → 01-knowledge-base/工程化与部署
  - n8n 学习笔记 → 02-learning-projects/n8n
- **文档体系整理**（2026-07-12）：
  - 根目录只留 3 个入口：README.md / AGENT.md / ARCHITECTURE.md
  - RAG 技术笔记 + 使用指南 → docs/
  - 项目计划 + 想法池 → plans/（active + archive + AGENT.md）
  - ThinkingTODO + BACKLOG → plans/active/backlog.md
- **两个 Agent Skill**（2026-07-12）：
  - `project-init`：新对话初始化，引导读 AGENT.md + current-state
  - `commit-with-check`：提交代码前强制执行检查清单
  - 设计原则：AGENT.md 是唯一真理来源，skill 只做触发器
- **旧目录清理完成**（2026-07-12）：
  - `project-notes/SOP.md` → `content/templates/learning-project/SOP.md`
  - `project-notes/USER_GUIDE.md` → `content/active/02-learning-projects/USER_GUIDE.md`
  - 删除 `knowledge-docs/`（通识测试内容，36篇）
  - 删除 `project-notes/`（已全部迁移到 content/）
  - 内容层架构验证通过
- **视频笔记工具迭代**（2026-07-13）：
  - 豆包直接解析视频链接方案不可行，转向「插件提取 + 本地整理」方案
  - 归档原 video-content 计划到 `plans/archive/video-content-2026-07-13/`
  - 新增 `bilibilitato` 方案（二开 B 站插件做内容解析）
  - 后端新增待整理笔记 API（保存/列表/详情/删除），存放在 `03-source-notes/_pending/`
  - 前端改造「笔记整理工作台」：左侧待整理+已归档双区域，右侧编辑/预览切换
  - 新增 3 个内置模板：前端技术笔记、视频知识点沉淀、工具使用经验
  - 新增 `source-note-organizer` skill：待整理笔记 → AI 按模板整理 → 写入正式目录 → 清理原始文件
- **Agent 协作架构模板抽离**（2026-07-13）：
  - 从当前项目提炼通用「人+Agent 协作」架构模式
  - 产出可复用的 AGENT.md + 2 个核心 skill（project-init + commit-with-check）
  - 适配场景：FaaS 构建平台、组件库、知识库等「原子单元+组合单元」双层结构项目
  - 位置：`content/templates/agent-collaboration/`

### 🆕 新增：PWA 部署体系（2026-08-19）
- **Skill**：`.trae/skills/cloudflare-pages-deploy/SKILL.md` — 可执行的静态 PWA 部署流程
- **学习笔记**：`content/active/01-knowledge-base/08-工程化与部署/PWA渐进式Web应用.md` — PWA 完整知识体系
- **分享模板**：`content/active/02-learning-projects/pwa-deploy-template/` — 6 文件最小 PWA 模板 + 小白教程 README + manifest.json
- **Demo 归档**：`plans/archive/baby-workbench-2026-08-19/` — 带娃工作台已归档（功能验证完成）
- **已验证**：Cloudflare Pages 部署走通，PWA 三件套（manifest+sw+icon）正常，iOS/Android 可安装
- **部署测试 Plan**：`plans/active/deploy-platform-test/` — Workers vs Vercel 能力边界测试

### 🔄 进行中
- 无

### 📋 待开始（按优先级）
1. **[高]** 部署平台能力边界测试：Workers vs Vercel vs 跨域（见 deploy-platform-test plan）
2. **[中]** 部署到公网：Vercel 前端 + 后端部署方案
3. **[中]** 前端 API 层拆分：client.ts 按模块拆分
4. **[中]** 数据库持久化：向量库从 JSON 文件迁到 SQLite
5. **[低]** CI/CD：GitHub Actions 自动跑测试
6. **[低]** 更多测试覆盖：batch-upload、stream 流式对话

> 更多低优先级/长期想法见 [plans/active/backlog.md](../plans/active/backlog.md)

---

## 5. 已知问题 / 注意事项

| 问题 | 严重度 | 说明 |
|------|--------|------|
| GitHub 推送超时 | 低 | 沙盒环境网络问题，手动 `git push` 就行 |
| 集成测试耗 token | 中 | `pnpm test:integration` 会真实调用 Minimax API，别在 CI 里跑 |
| 向量库是 JSON 文件 | 中 | 目前 chroma.ts 用 JSON 文件存，数据量大了会慢，后续换 SQLite |
| 接口无鉴权 | 高 | **部署公网前必须加鉴权**，否则 API Key 会被刷爆 |

---

## 6. 下一步建议

根据当前状态，推荐优先做：

1. **部署到公网**：Vercel 前端 + 后端部署方案（部署前必须加鉴权）
2. **数据库持久化**：向量库从 JSON 文件迁到 SQLite，这是很多功能的基础
3. **前端 API 层拆分**：client.ts 按模块拆分，提高可维护性

---

## 7. 关键文件索引

| 内容 | 去哪找 |
|------|--------|
| 项目 README（人看的） | [README.md](../README.md) |
| 技术架构 | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| 使用指南 | [docs/USAGE_GUIDE.md](../docs/USAGE_GUIDE.md) |
| RAG 技术笔记 | [docs/rag/](../docs/rag/) |
| 内容渲染协议 | [content/CONTENT_PROTOCOL.md](../content/CONTENT_PROTOCOL.md) |
| 内容层 Agent 指南 | [content/AGENT.md](../content/AGENT.md) |
| 想法与待办计划 | [plans/README.md](../plans/README.md) |
| 接口文档 | [server/API_DOCS.md](../server/API_DOCS.md) |
| Agent 入口指南 | [AGENT.md](../AGENT.md) |
| 沙盒踩坑 | [playbook/sandbox-tips.md](playbook/sandbox-tips.md) |
| 常用命令 | [playbook/common-commands.md](playbook/common-commands.md) |
