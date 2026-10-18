# 当前项目状态

> 最后更新：2026-08-27
> 状态：create-industry-skill（陌生行业可信Skill生成器）开发完成，5步标准化流程全验证，内置10个references模板+示例，原方法论笔记升级为使用说明

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
- **PWA 部署体系**（2026-08-19）：
  - **Skill**：`.trae/skills/cloudflare-pages-deploy/SKILL.md` — 可执行的静态 PWA 部署流程
  - **学习笔记**：`content/active/01-knowledge-base/08-工程化与部署/PWA渐进式Web应用.md` — PWA 完整知识体系
  - **分享模板**：`content/active/02-learning-projects/pwa-deploy-template/` — 7 文件最小 PWA 模板（demos/minimal-pwa/）+ 小白教程 README + AGENT.md + manifest.json
  - **Demo 归档**：`plans/archive/baby-workbench-2026-08-19/` — 带娃工作台已归档（功能验证完成）
  - **已验证**：Cloudflare Pages 部署走通，PWA 三件套（manifest+sw+icon）正常，iOS/Android 可安装
  - **部署测试 Plan**：`plans/active/deploy-platform-test/` — Workers vs Vercel 能力边界测试
- **循证营养师 Skill（nutrition-advisor）**（2026-08-22，🆕 新增）：
  - **Skill 位置**：`.trae/skills/nutrition-advisor/SKILL.md`
  - **方案选择**：融合 GitHub 调研的 3 个方案（personal-trainer-skill 证据分级 + H1an1/health-coach 本土化 + 循证校验 Prompt 结构约束），优先对齐《中国居民膳食指南2022》《中国DRIs 2023》
  - **核心能力（6段强制输出）**：一句话结论 → 证据等级Strong/Moderate/Low+来源 → 可执行量化方案 → 适用边界禁忌 → 三级客观验证路径（居家→医院不靠体感）→ 二次查证检索关键词+权威源白名单
  - **Case1 测试通过**：`plans/active/food-skill/case1-output-demo.md`（28岁男作息饮食不规律易疲惫）
  - **Case2 测试通过**：`plans/active/food-skill/case2-output-demo.md`（25岁男暴走后半月板疼是否缺钙）
  - **解决用户原始3大痛点**：①鉴别AI对错（证据分级+显式出处）②不靠体感验证效果（三级验证时间节点+指标）③防止被广告忽悠（检索源白名单+避坑提醒）
  - **Skill 现有总数**：project-init、commit-with-check、source-note-organizer、cloudflare-pages-deploy、nutrition-advisor（共 5 个）
- **陌生领域 AI 输出信任建立 方法论学习笔记**（2026-08-22，🆕 新增）：
  - **笔记位置**：`content/active/01-knowledge-base/09-AI协作与方法论/陌生领域AI输出信任建立-Skill三段式工作流.md`
  - **核心内容**：通用三段式工作流 `originPrd（需求结构化）+ case.md（测试用例）+ plan.md（高star skill检索筛选）`，附可复用模板
  - **包含**：① 6段可信输出结构设计（任意领域通用）② 三档证据分级标准（简化版GRADE）③ 4个GitHub筛选避坑标准 ④ 营养师项目完整复盘作为实例 ⑤ 5个常见误区 ⑥ 检索源白名单
  - **适用**：任何陌生领域（护肤/法律/财税/养宠…），不想深入但想要放心结论的场景
- **陌生行业可信 Skill 生成器（create-industry-skill）**（2026-08-27，🆕 核心新增，上述笔记升级为可执行Skill）：
  - **Skill 位置**：`.trae/skills/create-industry-skill/SKILL.md`
  - **设计定位**：这是「Skill 的 Skill」，输入一段原始诉求，按标准化5步流程产出带证据链的行业可信 Skill
  - **5 步强制流程（分工明确）**：Step1 提炼PRD+用户确认（基准唯一）→ Step2 GitHub高star调研出plan → Step3 准出规范（6段结构+证据分级13条Checklist）→ **Step4 必须用户自写case**（Agent不代写，保证真实场景）→ Step5 Agent自测到全过 → 用户验收（不满意改规则，不改输出）
  - **内置 references（Skill 100%自包含，不依赖外部plans）**：
    - `templates/` 4 个填空模板：originPrd / plan / acceptance-specs / case
    - `food-skill-example/` 6 个营养师项目完整示例（均弱化业务语义，标注「看结构不要看内容」）
  - **使用说明**：原方法论笔记已改造为配套使用说明（含快速上手6步+每步对应Skill映射+附录文件索引）
  - **价值**：nutrition-advisor 只是单个行业Skill的副产物，create-industry-skill 是通用流程标准化，可复制到任何陌生行业
  - **当前 Skill 总数**：6 个（project-init / commit-with-check / source-note-organizer / cloudflare-pages-deploy / nutrition-advisor / create-industry-skill）

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
4. **（可选，营养师Skill后续）**：如果要真正落地用，把膳食指南2022 PDF接入本地RAG知识库，Skill里加前置约束优先检索本地知识库

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
| **营养师 Skill（新）** | [.trae/skills/nutrition-advisor/SKILL.md](../.trae/skills/nutrition-advisor/SKILL.md) |
| 营养师 Skill Case1 示例输出 | [plans/active/food-skill/case1-output-demo.md](../plans/active/food-skill/case1-output-demo.md) |
| 营养师 Skill Case2 示例输出 | [plans/active/food-skill/case2-output-demo.md](../plans/active/food-skill/case2-output-demo.md) |
| **陌生领域AI信任方法论笔记（已升级为使用说明）** | [content/active/01-knowledge-base/09-AI协作与方法论/陌生领域AI输出信任建立-Skill三段式工作流.md](../content/active/01-knowledge-base/09-AI协作与方法论/陌生领域AI输出信任建立-Skill三段式工作流.md) |
| **create-industry-skill 主文件（核心新增）** | [.trae/skills/create-industry-skill/SKILL.md](../.trae/skills/create-industry-skill/SKILL.md) |
| create-industry-skill 模板（4个） | `../.trae/skills/create-industry-skill/references/templates/` |
| create-industry-skill 营养师示例（6个） | `../.trae/skills/create-industry-skill/references/food-skill-example/` |




---

## 2026-10-19 B站缓存处理双模式 + local-tool-pipeline skill

**当前焦点**：无进行中任务，本轮全部交付完毕。

- **merge_video 三期**：音频提取并入「视频合并」页（MergePage 顶部模式切换 video/audio），
  删除独立 Mp3Page/导航/首页卡片；`merge.mjs --mode video|audio` 统一 CLI。
  后端 `/api/merge` + `/api/mp3` 双路由保留。API_DOCS.md 已补第 8 节。
- **merge_mp3 已交付**：轻量方案（拷贝 audio.m4s 改名 .mp3，不重编码，37 个 0.6s），
  产物 `D:\临时文件\output_mp3`。重编码方案（libmp3lame，约20min）被用户否决，git 历史可查。
  注意：.mp3 内容实为 AAC，老设备可能播不了。
- **新 skill**：`.trae/skills/local-tool-pipeline/`（PRD→澄清→方案确认→CLI小量验证→全量→主页集成→截图验收
  全流程 + Node 通用坑清单 + references/integration-patterns.md 代码模板）。
  能力边界：本地、单用户、批处理、产物是文件；不含持久化/并发/复杂交互。
- **关键坑**：改 tools/*/core.mjs 后需触动 server/src 文件触发 ts-node-dev 重载（corePromise 有缓存）；
  Vite ERR_CACHE_READ_FAILURE 需删 client/node_modules/.vite 重启前端。
