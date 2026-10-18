/**
 * B站下载视频合并 — 核心逻辑（CLI 与 server 共用）
 *
 * 导出：
 *   ensureFfmpeg()                     确保 ffmpeg 可用（缺失自动下载到 bin/ffmpeg 缓存）
 *   scanJobs(inputDir)                 扫描输入目录，返回合并任务列表
 *   runMerge({input,output,limit,onProgress})  执行批量合并，返回结果汇总
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG_DIR = path.join(SCRIPT_DIR, 'bin', 'ffmpeg');
const FFMPEG_EXE = path.join(FFMPEG_DIR, 'ffmpeg.exe');

// ---------------- ffmpeg 获取 ----------------
function findFfmpegInPath() {
  const r = spawnSync('where', ['ffmpeg'], { encoding: 'utf8', shell: false });
  if (r.status === 0 && r.stdout.trim()) {
    const first = r.stdout.split(/\r?\n/)[0].trim();
    if (first && fs.existsSync(first)) return first;
  }
  return null;
}

function httpDownload(url, destFile, onProgress) {
  return new Promise((resolve, reject) => {
    fetch(url, { redirect: 'follow' }).then((res) => {
      if (!res.ok) return reject(new Error(`HTTP ${res.status} from ${url}`));
      const total = Number(res.headers.get('content-length')) || 0;
      let received = 0;
      const src = Readable.fromWeb(res.body);
      src.on('data', (chunk) => {
        received += chunk.length;
        if (onProgress) onProgress(received, total);
      });
      pipeline(src, fs.createWriteStream(destFile)).then(resolve).catch(reject);
    }).catch(reject);
  });
}

function extractZip(zipFile, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  let r = spawnSync('tar', ['-xf', zipFile, '-C', destDir], { encoding: 'utf8' });
  if (r.status !== 0) {
    r = spawnSync('powershell', [
      '-NoProfile', '-Command',
      `Expand-Archive -LiteralPath '${zipFile}' -DestinationPath '${destDir}' -Force`,
    ], { encoding: 'utf8' });
  }
  if (r.status !== 0) throw new Error('解压失败: ' + (r.stderr || r.stdout || '').slice(0, 300));
}

function findFfmpegRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = findFfmpegRecursive(p);
      if (found) return found;
    } else if (e.name.toLowerCase() === 'ffmpeg.exe') {
      return p;
    }
  }
  return null;
}

export async function ensureFfmpeg(onLog = () => {}) {
  if (fs.existsSync(FFMPEG_EXE)) return FFMPEG_EXE;
  const inPath = findFfmpegInPath();
  if (inPath) return inPath;

  onLog('未检测到 ffmpeg，开始自动下载（约 28MB，仅需一次）...');
  // 源1: npmmirror 国内镜像（gzip 单文件，快）；源2/3: 海外官方 zip 备源
  const sources = [
    { url: 'https://registry.npmmirror.com/-/binary/ffmpeg-static/b6.1.1/ffmpeg-win32-x64.gz', gz: true },
    { url: 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip', gz: false },
    { url: 'https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip', gz: false },
  ];
  const tmpFile = path.join(FFMPEG_DIR, 'ffmpeg.download');
  const tmpDir = path.join(FFMPEG_DIR, '_extract');
  fs.mkdirSync(FFMPEG_DIR, { recursive: true });

  let lastErr = null;
  for (const src of sources) {
    try {
      onLog(`  源: ${src.url}`);
      await httpDownload(src.url, tmpFile);
      if (src.gz) {
        onLog('  解压 gzip...');
        const buf = gunzipSync(fs.readFileSync(tmpFile));
        fs.writeFileSync(FFMPEG_EXE, buf);
      } else {
        onLog('  解压 zip...');
        extractZip(tmpFile, tmpDir);
        const exe = findFfmpegRecursive(tmpDir);
        if (!exe) throw new Error('解压后未找到 ffmpeg.exe');
        fs.renameSync(exe, FFMPEG_EXE);
      }
      fs.rmSync(tmpFile, { force: true });
      fs.rmSync(tmpDir, { recursive: true, force: true });
      onLog('ffmpeg 就绪: ' + FFMPEG_EXE);
      return FFMPEG_EXE;
    } catch (e) {
      lastErr = e;
      onLog(`  源失败: ${e.message}，尝试下一个源...`);
    }
  }
  throw new Error('ffmpeg 下载失败: ' + (lastErr?.message || '未知错误'));
}

// ---------------- 扫描 ----------------
export function scanJobs(inputDir) {
  const jobs = [];
  const avidDirs = fs.readdirSync(inputDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const avid of avidDirs) {
    const avidPath = path.join(inputDir, avid);
    const cDirs = fs.readdirSync(avidPath, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name.startsWith('c_'))
      .map((e) => e.name);
    for (const cName of cDirs) {
      const cPath = path.join(avidPath, cName);
      const entryFile = path.join(cPath, 'entry.json');
      if (!fs.existsSync(entryFile)) continue;
      let title = '';
      try {
        title = JSON.parse(fs.readFileSync(entryFile, 'utf8')).title || '';
      } catch { /* title 解析失败则用目录名 */ }
      if (!title.trim()) title = avid;

      const subDirs = fs.readdirSync(cPath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0));
      let videoFile = null;
      for (const sub of subDirs) {
        const v = path.join(cPath, sub, 'video.m4s');
        if (fs.existsSync(v)) { videoFile = v; break; }
      }
      if (!videoFile) continue;

      const audioFile = path.join(path.dirname(videoFile), 'audio.m4s');
      const coverFile = path.join(cPath, 'cover.jpg');
      jobs.push({
        avid, cid: cName,
        title,
        video: videoFile,
        audio: fs.existsSync(audioFile) ? audioFile : null,
        cover: fs.existsSync(coverFile) ? coverFile : null,
      });
    }
  }
  return jobs;
}

// ---------------- 文件名清洗 ----------------
// 用 fromCharCode 构造控制字符范围，避免源码中嵌入真实控制字符
const CONTROL_RE = new RegExp('[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + ']', 'g');
export function sanitize(name) {
  let s = name.replace(/[\\/:*?"<>|]/g, '_').replace(CONTROL_RE, '_').trim();
  s = s.replace(/[. ]+$/, ''); // Windows 不允许结尾空格/点
  return s || 'untitled';
}

function uniqueOutPath(outputDir, title) {
  const base = sanitize(title);
  let candidate = path.join(outputDir, base + '.mp4');
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(outputDir, `${base} (${n}).mp4`);
    n++;
  }
  return candidate;
}

// ---------------- 合并 ----------------
function buildFfmpegArgs(job, outPath, fallback) {
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  args.push('-i', job.video);
  if (job.audio) args.push('-i', job.audio);
  if (job.cover) args.push('-i', job.cover);

  args.push('-map', '0:v:0');
  if (job.audio) args.push('-map', '1:a:0');
  if (job.cover) args.push('-map', '2:v:0');

  args.push('-c:v:0', 'copy');
  if (job.audio) args.push('-c:a:0', 'copy');
  if (job.cover) {
    args.push('-c:v:1', 'png', '-disposition:v:1', 'attached_pic');
  }
  // 以下为输出选项，必须位于输出文件之前
  if (fallback) args.push('-fflags', '+genpts', '-avoid_negative_ts', 'make_zero', '-max_muxing_queue_size', '9999');
  args.push('-movflags', '+faststart', outPath);
  return args;
}

function runFfmpeg(ffmpegExe, job, outPath) {
  return new Promise((resolve) => {
    let attempt = 0;
    const tryOnce = () => {
      const args = buildFfmpegArgs(job, outPath, attempt > 0);
      const child = spawn(ffmpegExe, args, { windowsHide: true });
      let stderr = '';
      child.stderr.on('data', (d) => { stderr += d.toString(); });
      child.on('close', (code) => {
        if (code === 0) return resolve({ ok: true });
        try { fs.rmSync(outPath, { force: true }); } catch { /* ignore */ }
        attempt++;
        if (attempt === 1) return tryOnce();
        resolve({ ok: false, err: stderr.trim().split(/\r?\n/).slice(-3).join(' | ').slice(0, 300) });
      });
    };
    tryOnce();
  });
}

// ---------------- 批量执行 ----------------
/**
 * @param {{input:string, output:string, limit?:number, onProgress?:(info:{current:number,total:number,title:string,phase:string})=>void, onLog?:(msg:string)=>void}} opts
 */
export async function runMerge(opts) {
  const { input, output, limit = 0, onProgress = () => {}, onLog = () => {} } = opts;
  if (!fs.existsSync(input)) throw new Error(`输入目录不存在: ${input}`);

  const ffmpegExe = await ensureFfmpeg(onLog);
  fs.mkdirSync(output, { recursive: true });

  let jobs = scanJobs(input);
  if (!jobs.length) throw new Error('未在输入目录中找到任何可合并的视频（<avid>/c_*/video.m4s）');
  if (limit > 0) jobs = jobs.slice(0, limit);

  const results = { ok: [], skipped: [], failed: [] };
  const t0 = Date.now();

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    onProgress({ current: i, total: jobs.length, title: job.title, phase: 'merging' });

    // 幂等：基础名已存在则跳过
    const plainPath = path.join(output, sanitize(job.title) + '.mp4');
    if (fs.existsSync(plainPath)) {
      results.skipped.push({ title: job.title, out: plainPath });
      continue;
    }

    const outPath = uniqueOutPath(output, job.title);
    const r = await runFfmpeg(ffmpegExe, job, outPath);
    if (r.ok) results.ok.push({ title: job.title, out: outPath });
    else results.failed.push({ title: job.title, err: r.err });
  }
  onProgress({ current: jobs.length, total: jobs.length, title: '', phase: 'done' });

  return {
    ...results,
    total: jobs.length,
    durationSec: Number(((Date.now() - t0) / 1000).toFixed(1)),
    outputDir: output,
  };
}
