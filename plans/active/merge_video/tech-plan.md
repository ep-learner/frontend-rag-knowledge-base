# B站下载视频合并工具 — 技术方案草稿 v1

> 状态：待用户 review。确认后进入开发。

## 一、需求澄清（基于 D:\临时文件\down_data 实测）

### 实际数据结构（已扫描验证）

```
down_data/
├── <avid>/                          # 视频ID文件夹，共 37 个
│   └── c_<cid>/                     # 每个avid下恰好1个（已验证37/37一致）
│       ├── 80/                      # 清晰度目录（1080P）
│       │   ├── video.m4s            # 视频流（标准 fMP4 头，可直接合并）
│       │   ├── audio.m4s            # 音频流
│       │   └── index.json
│       ├── entry.json               # title = 视频标题
│       └── cover.jpg                # 封面
```

- 37 个文件夹结构完全一致，无多分P、无缺失文件，扫描逻辑可简化。
- **标题含 emoji（☔️）和全角字符（｜）**：Windows 文件名需清洗非法字符，emoji 可保留（NTFS 支持）。
- m4s 文件头为标准 `ftyp isom`，**无 B 站假头污染**，ffmpeg 直接读取即可，无需预处理。

### 决策点（已选默认值，如有异议请指出）

| # | 决策点 | 默认选择 |
|---|--------|---------|
| 1 | 输出文件名 | `entry.json.title` 清洗后直接命名（emoji 保留） |
| 2 | 默认输出目录 | `D:\临时文件\output`（命令行参数可覆盖） |
| 3 | 封面处理 | 嵌入为 MP4 容器元数据封面（见调研结论） |
| 4 | 重名冲突 | 自动追加 ` (2)` `(3)` |
| 5 | 重复执行 | 输出文件已存在则跳过，幂等可重跑 |

## 二、调研结论

### 问题1：视频+音频+封面能否合并？

**可以。** ffmpeg 三输入方案：

```
ffmpeg -i video.m4s -i audio.m4s -i cover.jpg \
  -map 0:v:0 -map 1:a:0 -map 2:v:0 \
  -c:v:0 copy -c:a:0 copy -c:v:1 png \
  -disposition:v:1 attached_pic \
  -movflags +faststart  output.mp4
```

- 视频/音频 **流复制（-c copy）不重编码**，无损且快（单个 200MB 视频约 1-3 秒）。
- 封面作为 `attached_pic` 流嵌入容器：Windows 资源管理器缩略图、PotPlayer 等可直接显示。
- 注意：封面是"容器元数据"，不是视频首帧画面（PRD 意图理解为缩略图场景）。

### 问题2：集成到现有仓库入口（二期）

- 现有主页是 Vite + React SPA（client/）。浏览器**无法**扫描任意本地目录/调用 ffmpeg，
  必须有一个本地小服务。方案：新增极简 Express 服务（约 50 行，仅本机监听），
  提供 `POST /merge`（SSE 推进度）两个接口；主页「来源整理」区加「视频合并」入口：
  输入目录 + 输出目录 + 开始按钮 + 滚动进度文本。优先跑通，不加复杂度。

## 三、一期方案：一键 Node 脚本

### 产物

```
tools/merge-bili-video/
├── merge.mjs        # 单文件脚本，零 npm 依赖
└── bin/ffmpeg/      # 首次运行自动下载（.gitignore，本机缓存）
```

### 运行方式（用户唯一命令）

```
node tools/merge-bili-video/merge.mjs --input "D:\临时文件\down_data" --output "D:\临时文件\output"
# 可选：--limit 2（测试用前两个）
```

### 关键设计

1. **ffmpeg 依赖自动解决**：脚本启动时检测 PATH 和 `bin/ffmpeg` 缓存；
   没有则用 Node 18+ 原生 fetch 下载静态构建（gyan.dev 主源 + GitHub 备源），
   PowerShell `Expand-Archive` 解压。全程无需用户装软件、无需管理员权限。
   开发阶段我会先跑通下载流程并缓存好，你运行时直接就是零等待。
2. **扫描**：`<input>/*/c_*/` 下找 `entry.json` + `*/video.m4s` + `*/audio.m4s`，
   不假设清晰度目录名，兼容多 c_ 目录（当前数据不会出现，但逻辑兼容）。
3. **文件名清洗**：替换 `\/:*?"<>|` 与控制符为 `_`，去尾部空格和点，保留 emoji。
4. **进度条**：CLI 单行刷新 `[##########......] 12/37 (32%) 当前: 标题...`。
5. **容错**：单个失败不中断，末尾输出汇总报告（成功 N / 跳过 N / 失败 N + 原因）。

### 测试计划

- 第一步：`--limit 2` 只合并前两个视频，输出到 `D:\临时文件\output`，由你验证
  画面/声音正常、封面缩略图显示、文件名正确。
- 第二步：你确认后跑全量 37 个。

### 时间预估

- ffmpeg 首次下载：1-3 分钟（取决于网络，之后缓存）
- 合并 37 个视频（-c copy 不重编码）：**约 2-5 分钟**（SSD 磁盘写入速度决定）

## 四、二期方案（一期验收后做）

- `tools/merge-bili-video/server.mjs`：Express 极简服务，复用 merge.mjs 的核心函数。
- 主页加入口（React 组件，极简表单）：目录输入×2 + 开始按钮 + 进度文本。
- 二期目标优先跑通，UI 不做样式打磨。

---

## 五、三期变更记录（2026-10-19，已交付并验证）

### 变更内容

1. **新增音频提取能力**：`tools/merge-bili-mp3/mp3-core.mjs`（scanJobs/sanitize/runMp3，纯 Node 无 ffmpeg 依赖），
   方案为用户拍板的轻量版：拷贝 audio.m4s → `sanitize(title).mp3`，不重编码（文件内容仍是 AAC）。
   曾实现 ffmpeg 重编码方案（libmp3lame 320k，37 条约 20 分钟），因体感太慢被用户否决，git 历史可查。
2. **入口合并**：音频提取并入「视频合并」页（MergePage 顶部模式切换），删除独立 Mp3Page/导航项/首页卡片；
   后端 `/api/merge` 与 `/api/mp3` 两套路由保留不动，前端按模式切换调用。
3. **CLI 统一**：`merge.mjs` 增加 `--mode video|audio`（默认 video），audio 分支复用 mp3-core；
   `merge-bili-mp3/mp3.mjs` 保留为独立便捷入口。

### 验证结果

- CLI：`--mode video --limit 2` → 2 个 mp4（1.4s）；`--mode audio --limit 2` → 2 个 mp3（0s）
- API：`/api/merge/scan` 与 `/api/mp3/scan` 均正常返回 count=2（测试目录）
- client `tsc --noEmit` 通过；按用户要求本次变更不截图
