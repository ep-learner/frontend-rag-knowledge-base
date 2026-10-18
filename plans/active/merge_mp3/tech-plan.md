# merge_mp3 技术方案（local-tool-pipeline 流程产物）

## 1. 需求澄清表

| PRD 原文 | 我的理解 | 待确认 |
|---|---|---|
| 输入 D:\临时文件\down_data 得到文件列表 | 同 merge_video 的 B站缓存目录结构（37 个 avid 目录，每个含 c_xxx/80/audio.m4s + entry.json）——已实测确认 | 无 |
| entry.json 里的 title 是音频标题 | 输出文件名用 title（清洗非法字符，同 merge_video） | 无 |
| 合并成一个单一文件 mp3 格式 | 每条缓存 → 一个音频文件。但实测 audio.m4s 编码是 **AAC**，**无法无损转 mp3**，必须重编码 | **见决策表第 1 项** |
| 产出 output_mp3 文件夹，里面是所有 mp3 列表 | 输出目录默认 `D:\临时文件\output_mp3`，支持自定义 | 无 |

## 2. 默认决策表（不回复即按默认执行）

| # | 歧义点 | 选项 | 默认 | 理由 |
|---|---|---|---|---|
| 1 | 输出格式 | ~~A. 真 mp3（重编码 libmp3lame）~~<br>B. 直接拷贝 audio.m4s 改扩展名为 .mp3（不重编码，秒级完成；内容是 AAC，PotPlayer/VLC/大部分手机播放器可播） | **B（用户拍板：先简单做，不要重编码）** | 重编码 37 条约 20 分钟体感太慢；轻量方案秒级完成，后续有需要再升级 |
| 2 | 是否需要封面嵌入 | 嵌 / 不嵌 | 不嵌 | PRD 未提；mp3 嵌封面需额外转码 cover.jpg，增加耗时，二期可加 |
| 3 | 重名文件 | 覆盖 / 自动加 (2) 后缀 | 加后缀，同 merge_video | 已验证的幂等模式 |
| 4 | 耗时预期 | — | 重编码约 1-3 分钟/47 分钟音频（AAC→MP3 320k），37 个预计 30-90 分钟 | 重编码无法像流复制那样秒级完成，跑全量时给实时进度 |

## 3. 调研结论

- **复用**：`tools/merge-bili-video/merge-core.mjs` 的 ensureFfmpeg（ffmpeg 已缓存，零下载）、sanitize、scanJobs 模式、幂等/进度模式全部复用思路，但**新建独立目录 `tools/merge-bili-mp3/`**，不改 merge_video 的代码（两个工具独立演进）。
- ffmpeg 缓存路径 `tools/merge-bili-video/bin/ffmpeg/ffmpeg.exe` 直接探测复用，不存在才触发下载。
- 无新 npm 依赖。

## 4. 一期方案（CLI）

目录 `tools/merge-bili-mp3/`：

- `mp3-core.mjs`：导出 `scanJobs(inputDir)`（只找 audio.m4s，不需要 video/cover）、`ensureFfmpeg()`（优先探测 merge_video 缓存）、`sanitize()`、`runMp3({input, output, limit, onProgress, onLog})`
- `mp3.mjs`（cli 薄封装）：`node tools\merge-bili-mp3\mp3.mjs --input "..." --output "..." [--limit 2]`
- ffmpeg 参数：`-y -hide_banner -loglevel error -i <audio.m4s> -vn -c:a libmp3lame -b:a 320k <out.mp3>`
- 幂等：输出 `sanitize(title).mp3` 已存在则跳过；进度：current/total/当前标题；失败不中断，最后汇总

## 5. 二期方案（主页集成）

- `server/src/routes/mp3.ts`：`POST /api/mp3/scan` + `POST /api/mp3/start` + `GET /api/mp3/status`（内存态轮询，模板同 merge.ts）
- `client/src/pages/Mp3Page.tsx`：极简 UI（输入/输出目录、扫描预览、进度条、结果汇总）
- `App.tsx` 路由 `/mp3`、`HomePage` 卡片「音频提取」、`Layout` 导航
- 不新增独立服务，`dev.ps1` 一键可用

## 6. 风险与回退

| 风险 | 应对 |
|---|---|
| 重编码耗时超预期 | 一期 limit 2 实测单条耗时后如实告知，再决定是否跑全量 |
| 个别音频损坏 | 单条失败记录原因继续，最后汇总失败清单 |
| 输出盘空间 | 37 个 × 约 65MB（47min 320k）≈ 2.4GB，先检查 D 盘余量 |

## 7. 验收路径（与 merge_video 同标准）

1. 本方案你确认后 → 开发 CLI
2. `--limit 2` 出 2 个 mp3 → **你试听验证**
3. 确认后跑全量 37 个，报告耗时
4. 二期主页集成 → API 自测 → 截图 4 张交你验收
5. tools/merge-bili-mp3/README.md（小白手册 + Agent 维护说明）
