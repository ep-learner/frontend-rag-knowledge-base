/**
 * B站缓存音频提取 — 核心逻辑（CLI 与 server 共用）
 *
 * 输入目录结构：<input>/<avid>/c_xxx/80/audio.m4s + <input>/<avid>/c_xxx/entry.json
 * 方案（用户确认的轻量版）：直接拷贝 audio.m4s → 以 entry.json 的 title 改名，扩展名改为 .mp3
 * 注意：不重编码，文件内容仍是 AAC；PotPlayer/VLC/大部分手机播放器可直接播放。
 *
 * 导出：
 *   scanJobs(inputDir)                 扫描输入目录，返回任务列表
 *   sanitize(name)                     文件名清洗
 *   runMp3({input,output,limit,onProgress,onLog})  批量执行，返回结果汇总
 */
import fs from 'node:fs';
import path from 'node:path';

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

      // 数字命名的子目录（80 等），找其中的 audio.m4s
      const subDirs = fs.readdirSync(cPath, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort((a, b) => (parseInt(b, 10) || 0) - (parseInt(a, 10) || 0));
      let audioFile = null;
      for (const sub of subDirs) {
        const a = path.join(cPath, sub, 'audio.m4s');
        if (fs.existsSync(a)) { audioFile = a; break; }
      }
      if (!audioFile) continue;

      jobs.push({ avid, cid: cName, title, audio: audioFile });
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
  let candidate = path.join(outputDir, base + '.mp3');
  let n = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(outputDir, `${base} (${n}).mp3`);
    n++;
  }
  return candidate;
}

// ---------------- 批量执行 ----------------
/**
 * @param {{input:string, output:string, limit?:number, onProgress?:(info:{current:number,total:number,title:string,phase:string})=>void, onLog?:(msg:string)=>void}} opts
 */
export async function runMp3(opts) {
  const { input, output, limit = 0, onProgress = () => {} } = opts;
  if (!fs.existsSync(input)) throw new Error(`输入目录不存在: ${input}`);

  fs.mkdirSync(output, { recursive: true });

  let jobs = scanJobs(input);
  if (!jobs.length) throw new Error('未在输入目录中找到任何音频（<avid>/c_*/audio.m4s）');
  if (limit > 0) jobs = jobs.slice(0, limit);

  const results = { ok: [], skipped: [], failed: [] };
  const t0 = Date.now();

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    onProgress({ current: i, total: jobs.length, title: job.title, phase: 'copying' });

    // 幂等：基础名已存在则跳过
    const plainPath = path.join(output, sanitize(job.title) + '.mp3');
    if (fs.existsSync(plainPath)) {
      results.skipped.push({ title: job.title, out: plainPath });
      continue;
    }

    const outPath = uniqueOutPath(output, job.title);
    try {
      fs.copyFileSync(job.audio, outPath);
      results.ok.push({ title: job.title, out: outPath });
    } catch (e) {
      try { fs.rmSync(outPath, { force: true }); } catch { /* ignore */ }
      results.failed.push({ title: job.title, err: String(e.message || e).slice(0, 300) });
    }
  }
  onProgress({ current: jobs.length, total: jobs.length, title: '', phase: 'done' });

  return {
    ...results,
    total: jobs.length,
    durationSec: Number(((Date.now() - t0) / 1000).toFixed(1)),
    outputDir: output,
  };
}
