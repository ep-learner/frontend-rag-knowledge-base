# 主页集成代码模板（merge_video 实战抽取）

以下模板已在本项目验证可用，改名字和路径即可复用。

## 1. server/src/routes/xxx.ts

要点：动态 import core.mjs（绕过 TS CommonJS 把 import() 转 require 的问题）；内存态任务状态；统一响应格式。

```ts
import express from 'express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { success, error as apiError, ErrorCode } from '../utils/response';

const router = express.Router();

// core.mjs 在 tools/<工具名>/ 下；src/routes 上三级即项目根
const CORE_URL = pathToFileURL(
  path.join(__dirname, '../../../tools/<工具名>/<工具名>-core.mjs')
).href;

// TS CommonJS 会把 import() 转成 require()，用 Function 保留原生动态导入以加载 .mjs
const dynamicImport = new Function('specifier', 'return import(specifier)') as (s: string) => Promise<any>;
let corePromise: Promise<any> | null = null;
function loadCore() {
  if (!corePromise) corePromise = dynamicImport(CORE_URL);
  return corePromise;
}

const taskStatus = {
  isRunning: false,
  startTime: null as number | null,
  endTime: null as number | null,
  progress: null as { current: number; total: number; currentTitle: string } | null,
  lastResult: null as any,
};

router.post('/scan', async (req, res) => {
  const input = req.body?.input;
  if (!input || typeof input !== 'string') {
    return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, '缺少 input 参数'));
  }
  if (!fs.existsSync(input)) {
    return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, `输入目录不存在: ${input}`));
  }
  try {
    const core = await loadCore();
    const jobs = core.scanJobs(input);
    res.json(success({ count: jobs.length, titles: jobs.slice(0, 10).map((j: any) => j.title), truncated: jobs.length > 10 }));
  } catch (e: any) {
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, e.message || '扫描失败'));
  }
});

router.post('/start', async (req, res) => {
  if (taskStatus.isRunning) {
    return res.status(409).json(apiError(ErrorCode.INTERNAL_ERROR, '任务正在进行中'));
  }
  const { input, output, limit } = req.body || {};
  if (!input || !output) {
    return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, '缺少 input/output 参数'));
  }
  taskStatus.isRunning = true;
  taskStatus.startTime = Date.now();
  taskStatus.progress = { current: 0, total: 0, currentTitle: '' };
  taskStatus.lastResult = null;

  (async () => {
    try {
      const core = await loadCore();
      const r = await core.runMerge({
        input, output, limit: Number(limit) || 0,
        onProgress: ({ current, total, title }: any) => {
          taskStatus.progress = { current, total, currentTitle: title };
        },
        onLog: (msg: string) => console.log('[<工具名>]', msg),
      });
      taskStatus.lastResult = r;
    } catch (e: any) {
      taskStatus.lastResult = { error: e.message };
    } finally {
      taskStatus.isRunning = false;
      taskStatus.endTime = Date.now();
    }
  })();

  res.json(success({ message: '任务已启动' }));
});

router.get('/status', (_req, res) => {
  res.json(success({ ...taskStatus }));
});

export default router;
```

挂载：server/src/index.ts 加 `app.use('/api/xxx', xxxRouter)`。

## 2. client/src/api/client.ts

```ts
export const xxxAPI = {
  scan: (input: string) => request('/api/xxx/scan', { method: 'POST', body: JSON.stringify({ input }) }),
  start: (input: string, output: string) => request('/api/xxx/start', { method: 'POST', body: JSON.stringify({ input, output }) }),
  getStatus: () => request('/api/xxx/status'),
};
```

## 3. client/src/pages/XxxPage.tsx

结构（完整可参照 client/src/pages/MergePage.tsx）：

- 两个文本框：输入目录、输出目录（运行中 disabled）
- 「扫描预览」按钮 → 显示"共发现 N 个"和前 10 个标题
- 「开始」按钮 → startPolling()：setInterval 1000ms 轮询 getStatus，isRunning=false 时 clearInterval
- 进度条：`Math.round(current/total*100)%`，运行中蓝色、完成绿色
- 完成态：成功/跳过/失败计数 + 耗时 + 失败明细列表
- 组件卸载 useEffect cleanup clearInterval

图标用 lucide-react（项目已有）。样式 Tailwind。

## 4. 入口接线

- `client/src/App.tsx`：`<Route path="/xxx" element={<XxxPage />} />`
- `client/src/pages/HomePage.tsx`：复制一张现有卡片改标题/描述/链接
- `client/src/components/Layout.tsx`（或导航所在组件）：加导航项

## 5. 自测脚本套路

```powershell
# 拷贝 2 个样本到独立测试目录（不动真实数据）
# 走 API 全链路
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/xxx/scan -ContentType 'application/json' -Body '{"input":"测试目录"}' 
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/xxx/start -ContentType 'application/json' -Body '{"input":"测试目录","output":"测试输出"}'
# 循环轮询 status 直到 isRunning=false
```

截图用 browser_use subagent，存 tools/<工具名>/screenshots/。
