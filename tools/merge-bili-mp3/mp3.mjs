/**
 * B站缓存音频提取 CLI
 * 用法: node tools\merge-bili-mp3\mp3.mjs --input "D:\临时文件\down_data" --output "D:\临时文件\output_mp3" [--limit 2]
 */
import { runMp3 } from './mp3-core.mjs';

function parseArgs(argv) {
  const args = { limit: 0 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input') args.input = argv[++i];
    else if (argv[i] === '--output') args.output = argv[++i];
    else if (argv[i] === '--limit') args.limit = Number(argv[++i]) || 0;
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.input || !args.output) {
  console.error('用法: node mp3.mjs --input <输入目录> --output <输出目录> [--limit N]');
  process.exit(1);
}

let lastLineLen = 0;
const r = await runMp3({
  input: args.input,
  output: args.output,
  limit: args.limit,
  onProgress: ({ current, total, title, phase }) => {
    const line = phase === 'done'
      ? `[${total}/${total}] 完成`
      : `[${current}/${total}] 转码中: ${title}`;
    // 单行刷新
    process.stdout.write('\r' + line + ' '.repeat(Math.max(0, lastLineLen - line.length)));
    lastLineLen = line.length;
    if (phase === 'done') process.stdout.write('\n');
  },
  onLog: (msg) => { process.stdout.write('\n' + msg + '\n'); lastLineLen = 0; },
});

console.log(`\n成功 ${r.ok.length} / 跳过 ${r.skipped.length} / 失败 ${r.failed.length}，共 ${r.total} 条，耗时 ${r.durationSec}s`);
console.log(`输出目录: ${r.outputDir}`);
if (r.failed.length) {
  for (const f of r.failed) console.log(`[失败] ${f.title} — ${f.err}`);
  process.exitCode = 2;
}
