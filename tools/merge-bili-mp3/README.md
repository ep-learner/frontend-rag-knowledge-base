# B站音频提取工具 — 使用说明

把 B站客户端下载缓存（audio.m4s + entry.json）里的音频批量提取出来，以视频标题改名、扩展名改为 .mp3。
**不重编码**（直接拷贝改名），37 个音频实测 0.6 秒。

> 注意：文件内容仍是 AAC 编码（B站原始音频格式）。PotPlayer / VLC / 手机播放器都能直接播；
> 个别只认纯正 mp3 的播放器（部分车载、老式设备）可能打不开——遇到这种情况再考虑重编码方案。

---

## 一、小白使用手册

### 方式 A：网页操作（推荐）

> **2026-10-19 变更**：音频提取已并入「视频合并」页面，不再有独立入口。

1. 在项目根目录右键 → 在终端中打开 → 运行 `.\dev.ps1`
   （会自动安装依赖并启动前后端，弹出两个 PowerShell 窗口，不要关）
2. 浏览器打开 http://localhost:5173
3. 点首页「视频合并」卡片（或顶部导航「视频合并」）
4. 页面顶部切换到「提取音频 MP3」模式
5. 填两个目录：
   - 输入目录：B站缓存根目录，例如 `D:\临时文件\down_data`
   - 输出目录：MP3 存放目录，例如 `D:\临时文件\output_mp3`
6. 点「扫描预览」确认数量 → 点「开始提取」→ 进度条秒完
7. 已存在的文件会自动跳过，重复点不会重复拷贝

### 方式 B：命令行

```powershell
# 推荐：统一入口（merge.mjs --mode audio）
node tools\merge-bili-video\merge.mjs --input "D:\临时文件\down_data" --output "D:\临时文件\output_mp3" --mode audio
# 或本目录独立入口（等价）
node tools\merge-bili-mp3\mp3.mjs --input "D:\临时文件\down_data" --output "D:\临时文件\output_mp3"
# 可选 --limit 2 只处理前两个（测试用）
```

### 常见问题

- **播放器打不开/没声音**：文件是 AAC 内容，换 PotPlayer 或 VLC 播放。
- **文件名里的 `/:*?"<>|`**：自动替换为 `_`，emoji 保留。
- **重复运行**：输出目录里已有的同名文件自动跳过。

---

## 二、给后续 Agent 的维护说明

### 启动

`dev.ps1` 一键起前后端（server:3000 + client:5173），无需额外动作。
提取功能已集成进现有 Express 服务（`/api/mp3`），无独立进程。

### 目录结构

```
tools/merge-bili-mp3/
├── mp3-core.mjs      # 核心逻辑：scanJobs / sanitize / runMp3（纯 Node，无外部依赖）
├── mp3.mjs           # CLI 薄封装（--input --output --limit）
├── screenshots/      # 验收截图（页面初始/扫描/完成态/主页卡片）
└── README.md         # 本文件
```

### 关键设计

- **方案**：拷贝 audio.m4s → `sanitize(entry.json.title).mp3`。曾实现过 ffmpeg 重编码方案
  （libmp3lame 320k，37 条约 20 分钟），用户拍板改轻量方案；如需真 mp3 可回退参考 git 历史。
- **扫描结构**：`<input>/<avid>/c_*/<数字目录>/audio.m4s` + `<input>/<avid>/c_*/entry.json`。
- **幂等**：基础名已存在则跳过；重名自动加 ` (2)` 后缀。
- **server 集成**：`server/src/routes/mp3.ts` 通过 `new Function('s','return import(s)')` 动态加载
  core.mjs（TS CommonJS 会把 import() 转 require，必须这么绕）；内存态 status 轮询，
  模式同 `routes/merge.ts`。
- **前端**：`client/src/pages/Mp3Page.tsx`，1s 轮询 `/api/mp3/status`。
- **热重载注意**：core.mjs 在 server 进程里被缓存（corePromise），改 core.mjs 后需重启 server
  或触动 server/src 下任意文件触发 ts-node-dev 重载。

### 验收记录（2026-10-19）

- 全量 37 条：成功 35 / 跳过 2（测试文件）/ 失败 0，耗时 0.6s
- API 自测（独立测试目录 2 条）：scan → start → status 全链路通过
- UI 截图 4 张见 screenshots/
