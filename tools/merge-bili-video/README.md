# B站视频合并工具 — 使用说明

把 B站客户端下载的拆分缓存（video.m4s + audio.m4s + cover.jpg + entry.json）批量合并为完整 MP4。
无损流复制（不重编码），封面嵌入容器元数据，37 个视频实测约 27 秒。

---

## 一、小白使用手册

### 方式 A：网页操作（推荐）

1. 在项目根目录右键 → 在终端中打开 → 运行 `.\dev.ps1`
   （会自动安装依赖并启动前后端，弹出两个 PowerShell 窗口，不要关）
2. 浏览器打开 http://localhost:5173
3. 点首页「视频合并」卡片（或顶部导航「视频合并」）
4. 填两个目录：
   - 输入目录：B站缓存根目录，例如 `D:\临时文件\down_data`
   - 输出目录：MP4 存放目录，例如 `D:\临时文件\output`
5. 点「扫描预览」确认数量 → 点「开始合并」→ 看进度条跑完即可
6. 已存在的文件会自动跳过，重复点不会重复合并

### 方式 B：命令行

```powershell
node tools\merge-bili-video\merge.mjs --input "D:\临时文件\down_data" --output "D:\临时文件\output"
# 可选 --limit 2 只处理前两个（测试用）
```

### 常见问题

- **Windows 自带播放器打不开/只有声音**：这批视频是 HEVC (H.265) 编码，系统需装
  「HEVC 视频扩展」，或直接用 PotPlayer / VLC 播放。
- **首次运行卡在下载 ffmpeg**：脚本自动从 npmmirror 镜像下载（约 28MB），只需一次，
  之后缓存在 `tools/merge-bili-video/bin/ffmpeg/`。
- **文件名里的 `/:*?"<>|`**：自动替换为 `_`，emoji 保留。

---

## 二、给后续 Agent 的维护说明

### 启动

`dev.ps1` 一键起前后端（server:3000 + client:5173），无需额外动作。
合并功能已集成进现有 Express 服务，无独立进程。

### 目录结构

```
tools/merge-bili-video/
├── merge-core.mjs      # 核心逻辑（ESM）：ensureFfmpeg / scanJobs / sanitize / runMerge
├── merge.mjs           # CLI 薄封装（进度条渲染 + 参数解析）
├── bin/ffmpeg/         # ffmpeg 自动下载缓存（.gitignore 已排除）
└── screenshots/        # 二期 UI 验收截图
```

改动涉及：
- `server/src/routes/merge.ts` — API 路由（POST /scan、POST /start、GET /status 轮询）
- `server/src/app.ts` — 挂载 `/api/merge`
- `client/src/pages/MergePage.tsx` — 页面
- `client/src/api/client.ts` — mergeAPI
- `client/src/App.tsx`、`pages/HomePage.tsx`、`components/Layout.tsx` — 路由与入口

### 关键设计（改动前必读）

1. **server 加载 ESM 的坑**：tsconfig 是 CommonJS，TS 会把 `import()` 转成 `require()`，
   无法加载 .mjs。merge.ts 里用 `new Function('s','return import(s)')` 保留原生动态导入，
   不要"优化"掉这层。
2. **输入目录协议**：`<input>/<avid>/c_<cid>/{entry.json, cover.jpg, <质量目录>/{video,audio}.m4s}`。
   扫描兼容多 c_ 目录和任意质量目录名（取数字最大者）。
3. **幂等**：按清洗后标题判断输出已存在即跳过；重名追加 ` (n)`。
4. **ffmpeg 输出选项位置**：`-max_muxing_queue_size` 等是输出选项，必须在输出文件之前，
   曾因此 bug 全量失败，见 plans/active/merge_video/。
5. **状态是内存态**：服务重启即清空；同一时刻只允许一个合并任务（409）。
6. **ffmpeg 下载源顺序**：npmmirror 镜像（国内快）→ gyan.dev → GitHub BtbN。

### 测试

无单元测试（一期以实测验收）。手动验证：
```powershell
# 后端单测不影响本模块；验证 API 可用 Invoke-RestMethod 打 /api/merge/scan
```
