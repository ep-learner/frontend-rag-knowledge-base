import express from 'express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { success, error as apiError, ErrorCode } from '../utils/response';

const router = express.Router();

// merge-core.mjs 位于项目根 tools/ 下；src/routes 与 dist/routes 上三级均为项目根
const MERGE_CORE_URL = pathToFileURL(
  path.join(__dirname, '../../../tools/merge-bili-video/merge-core.mjs')
).href;

type MergeCore = {
  scanJobs: (inputDir: string) => Array<{ title: string }>;
  runMerge: (opts: {
    input: string;
    output: string;
    limit?: number;
    onProgress?: (info: { current: number; total: number; title: string; phase: string }) => void;
    onLog?: (msg: string) => void;
  }) => Promise<{
    ok: Array<{ title: string; out: string }>;
    skipped: Array<{ title: string; out: string }>;
    failed: Array<{ title: string; err: string }>;
    total: number;
    durationSec: number;
    outputDir: string;
  }>;
};

let corePromise: Promise<MergeCore> | null = null;
// TS CommonJS 会把 import() 转成 require()，用 Function 保留原生动态导入以加载 .mjs
const dynamicImport = new Function('specifier', 'return import(specifier)') as (s: string) => Promise<any>;
function loadCore(): Promise<MergeCore> {
  if (!corePromise) corePromise = dynamicImport(MERGE_CORE_URL);
  return corePromise;
}

// ---------------- 任务状态（内存态，与 rebuild-status 同模式） ----------------
const mergeStatus = {
  isRunning: false,
  startTime: null as number | null,
  endTime: null as number | null,
  progress: null as { current: number; total: number; currentTitle: string } | null,
  lastResult: null as {
    success: number;
    skipped: number;
    failed: number;
    total: number;
    durationSec: number;
    outputDir: string;
    failures: Array<{ title: string; err: string }>;
    error?: string;
  } | null,
};

// ---------------- 扫描预览 ----------------
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
    res.json(success({
      count: jobs.length,
      titles: jobs.slice(0, 10).map((j) => j.title),
      truncated: jobs.length > 10,
    }));
  } catch (e: any) {
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, e.message || '扫描失败'));
  }
});

// ---------------- 启动合并 ----------------
router.post('/start', async (req, res) => {
  if (mergeStatus.isRunning) {
    return res.status(409).json(apiError(ErrorCode.INTERNAL_ERROR, '合并任务正在进行中'));
  }
  const { input, output, limit } = req.body || {};
  if (!input || typeof input !== 'string') {
    return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, '缺少 input 参数'));
  }
  if (!output || typeof output !== 'string') {
    return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, '缺少 output 参数'));
  }
  if (!fs.existsSync(input)) {
    return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, `输入目录不存在: ${input}`));
  }

  mergeStatus.isRunning = true;
  mergeStatus.startTime = Date.now();
  mergeStatus.endTime = null;
  mergeStatus.progress = { current: 0, total: 0, currentTitle: '' };
  mergeStatus.lastResult = null;

  (async () => {
    try {
      const core = await loadCore();
      const r = await core.runMerge({
        input,
        output,
        limit: Number(limit) || 0,
        onProgress: ({ current, total, title }) => {
          mergeStatus.progress = { current, total, currentTitle: title };
        },
        onLog: (msg) => console.log('[merge]', msg),
      });
      mergeStatus.lastResult = {
        success: r.ok.length,
        skipped: r.skipped.length,
        failed: r.failed.length,
        total: r.total,
        durationSec: r.durationSec,
        outputDir: r.outputDir,
        failures: r.failed,
      };
    } catch (e: any) {
      mergeStatus.lastResult = {
        success: 0, skipped: 0, failed: 0, total: 0, durationSec: 0,
        outputDir: output, failures: [], error: e.message || '合并失败',
      };
    } finally {
      mergeStatus.isRunning = false;
      mergeStatus.endTime = Date.now();
    }
  })();

  res.json(success({ message: '合并任务已启动' }));
});

// ---------------- 状态查询（前端轮询） ----------------
router.get('/status', (req, res) => {
  res.json(success({
    isRunning: mergeStatus.isRunning,
    startTime: mergeStatus.startTime,
    endTime: mergeStatus.endTime,
    progress: mergeStatus.progress,
    lastResult: mergeStatus.lastResult,
  }));
});

export default router;
