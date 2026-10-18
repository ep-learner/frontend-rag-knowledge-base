---
name: local-tool-pipeline
description: 把一个本地批处理工具从 prd.md 走完需求澄清、技术方案确认、一期CLI开发小量验证、全量执行、二期主页集成、截图验收的全流程。用户说"按这个prd做一个本地工具/脚本"、"把这个需求走全流程"、"用 local-tool-pipeline 实现这个 prd"时触发。不适用于纯前端组件、纯调研报告类需求。
---

# 本地工具开发全流程（PRD → 验收）

输入只有一个：用户给的 `prd.md` 路径。输出是一个可复用的本地工具（CLI + 主页集成 UI）+ 验收材料。

**总原则**：技术方案必须用户确认后才开发；小量样本必须用户验证后才全量；集成后必须截图交验收。每一步不等用户确认就往下走等于返工。

## 步骤 0：读 PRD + 实测真实数据（不要假设）

1. Read prd.md 全文。
2. PRD 里提到的输入目录/文件，用 Glob / Shell `ls` 实际查看结构，列出真实样本（至少 2 个）。**不要凭 PRD 描述想象数据结构**——B站缓存、日志目录等常有隐藏层级或缺失字段。
3. 用 Get-ChildItem 统计样本量级（文件数、总大小），用于后续估算耗时。

## 步骤 1：写技术方案 → NotifyUser 确认

在 `plans/active/<需求名>/tech-plan.md` 写方案，结构固定：

1. **需求澄清表**：PRD 原文 → 我的理解 → 待确认项（歧义点全部列出，如格式转换 vs 流复制、输出目录名、重名处理）
2. **默认决策表**：歧义点若用户不回复，默认按哪项执行及理由
3. **调研结论**：是否复用现有工具（`tools/` 下已有工具优先，如 ffmpeg 缓存）、需新下载的依赖
4. **一期方案（CLI）**：输入/输出/参数/幂等策略/进度显示
5. **二期方案（主页集成）**：API 端点 + 页面 + 入口位置
6. **风险与回退**：可能失败点及降级方案

写完用 NotifyUser 通知用户 review，**等明确"确认"再继续**。

## 步骤 2：一期 CLI 开发

目录约定：`tools/<工具名>/` 下：

- `<工具名>-core.mjs` — ESM 核心逻辑，导出纯函数（scan / run / 工具函数），CLI 和 server 都复用它
- `<工具名>.mjs` 或 `cli.mjs` — 薄 CLI 封装（解析 argv → 调 core → 打进度）

功能基线（每个工具都要有）：

- `--input` `--output` 参数 + `--limit N` 只处理前 N 个（小量验证用）
- **幂等**：输出已存在则跳过，重复执行不重复产出
- 进度输出：当前第几个/总数/当前项标题
- 失败不中断批量：单条失败记录原因，继续下一条，最后汇总 成功/跳过/失败
- 外部二进制依赖（如 ffmpeg）：自动检测 PATH → 缺失则自动下载到 `tools/<工具名>/bin/` 缓存，国内镜像源优先（npmmirror），多源兜底

## 步骤 3：小量验证 → 用户确认 → 全量

1. 跑 `--limit 2`（或拷贝 2 个样本到独立测试目录），把输出文件交给用户验证效果。
2. **用户说"没问题"之后**才跑全量。全量时报告总数和耗时。
3. 工作区外的写入（如 D:\）沙箱会拦截，Shell 调用加 `dangerouslyDisableSandbox: true`。

## 步骤 4：二期主页集成

参照 `references/integration-patterns.md` 的代码模板，按现有项目结构集成：

1. `server/src/routes/<名>.ts`：`POST /scan`（预览数量）+ `POST /start`（异步启动，立即返回）+ `GET /status`（内存态轮询，模式照抄 routes/content.ts 的 rebuild-status）
2. `server/src/index.ts` 挂载路由
3. `client/src/api/client.ts` 加 API 方法
4. `client/src/pages/<名>Page.tsx`：输入目录 + 输出目录 + 扫描预览 + 进度条 + 结果汇总（极简，仿 MergePage）
5. `App.tsx` 加路由；`HomePage` 加卡片；`Layout` 加导航

**集成红线**：不新增独立服务进程，`dev.ps1` 一键起前后端即可用；UI 极简，能跑通优先，不引入新依赖。

## 步骤 5：自测 + 截图验收

1. 拷贝 2 个样本到新测试目录（不污染真实数据）。
2. 检查 3000/5173 端口是否已有服务在跑，没有再 `.\dev.ps1` 启动。
3. 用 Invoke-RestMethod 走通 scan → start → status 轮询全链路 API。
4. 用 browser_use subagent 截图（至少：页面初始态、扫描结果、完成态、主页卡片入口），存到 `tools/<工具名>/screenshots/`。
5. 写 `tools/<工具名>/README.md`：上半部分是小白使用手册（怎么启动、点哪里），下半部分是给后续 Agent 的维护说明（目录结构、怎么改、坑在哪）。
6. 把截图路径和 README 交给用户验收。

## Node/环境通用坑（本项目实测，提前规避省时间）

- **TS CommonJS 吃动态 import**：tsconfig module=commonjs 时 TS 把 `import()` 转成 `require()`，加载 `.mjs` 必须 `const dynamicImport = new Function('s', 'return import(s)')`。server 路由里 import core.mjs 都走这个。
- **ESM import Windows 路径**：动态 import 绝对路径要用 `pathToFileURL(...).href`（file:/// 前缀）。
- **工具调用 JSON 污染源码**：正则含控制字符范围（如 \x00-\x1f）时，字面写进源码会被 JSON 转义成真实 NUL 字符。用 `String.fromCharCode(0)+'-'+String.fromCharCode(31)` 构造。
- **PowerShell 内联 node -e**：含 `<` `>` `&` 会被当重定向/管道解析失败。复杂脚本写临时 .mjs/.ps1 文件再执行。
- **沙箱拦工作区外写入**：D:\ 等路径写入/执行需 `dangerouslyDisableSandbox: true`；后台任务沙箱限制更严，需要外部路径的操作尽量前台跑。
- **下载慢**：海外源前面垫 npmmirror（registry.npmmirror.com/-/binary/...）等国内镜像。
- **响应格式**：server 统一用 `utils/response.ts` 的 `success()` / `apiError(ErrorCode.X)`；ErrorCode 没有 INVALID_PARAMS，参数错误用 BAD_REQUEST。
- **端口占用**：起服务前先 Test-NetConnection 3000/5173，已有实例就不要重复起。

## 交付清单（最后逐项核对）

- [ ] plans/active/<需求名>/tech-plan.md（用户已确认）
- [ ] tools/<工具名>/<工具名>-core.mjs + cli.mjs（--limit 可用、幂等、进度输出）
- [ ] 小量验证用户确认记录 → 全量执行结果（成功/跳过/失败/耗时）
- [ ] server 路由 + client 页面 + 主页卡片入口
- [ ] tools/<工具名>/screenshots/ 截图 ≥4 张
- [ ] tools/<工具名>/README.md（小白手册 + Agent 维护说明）
