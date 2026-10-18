#!/usr/bin/env node
/**
 * B站下载视频合并工具（一期 CLI）
 *
 * 功能：扫描 <input>/<avid>/c_<cid>/{entry.json, cover.jpg, <质量>/video.m4s + audio.m4s}，
 *       合并为 <output>/<标题>.mp4（音频+视频流复制无损，封面嵌入为容器元数据 attached_pic）。
 *
 * 用法：
 *   node merge.mjs --input "D:\临时文件\down_data" --output "D:\临时文件\output" [--limit 2]
 *
 * 依赖：Node 18+。ffmpeg 缺失时自动下载到本目录 bin/ffmpeg/ 缓存（无需管理员权限）。
 */
import { runMerge } from './merge-core.mjs';

function parseArgs(argv) {
  const args = { input: 'D:\\临时文件\\down_data', output: 'D:\\临时文件\\output', limit: 0 };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--input') args.input = argv[++i];
    else if (k === '--output') args.output = argv[++i];
    else if (k === '--limit') args.limit = parseInt(argv[++i], 10) || 0;
    else if (k === '--help' || k === '-h') args.help = true;
  }
  return args;
}

function bar(done, total, label) {
  const width = 20;
  const filled = Math.round((done / total) * width);
  const pct = ((done / total) * 100).toFixed(0).padStart(3);
  const line = `[${'#'.repeat(filled)}${'.'.repeat(width - filled)}] ${done}/${total} (${pct}%) ${label}`;
  const cols = process.stdout.columns || 100;
  process.stdout.write('\r' + line.slice(0, cols).padEnd(cols));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('用法: node merge.mjs --input <视频根目录> --output <输出目录> [--limit N]');
    process.exit(0);
  }

  const r = await runMerge({
    input: args.input,
    output: args.output,
    limit: args.limit,
    onLog: (msg) => console.log(msg),
    onProgress: ({ current, total, title, phase }) => {
      if (phase === 'done') return;
      const short = title.length > 24 ? title.slice(0, 24) + '...' : title;
      bar(current, total, `合并中: ${short}`);
    },
  });

  bar(r.total, r.total, '完成');
  process.stdout.write('\n\n');
  console.log('========== 汇总 ==========');
  console.log(`成功 ${r.ok.length} / 跳过 ${r.skipped.length} / 失败 ${r.failed.length}，耗时 ${r.durationSec}s`);
  console.log(`输出目录: ${r.outputDir}`);
  for (const f of r.failed) console.log(`  [失败] ${f.title}\n         ${f.err}`);
  if (r.failed.length) process.exit(1);
}

main().catch((e) => {
  console.error('\n执行出错: ' + e.message);
  process.exit(1);
});
