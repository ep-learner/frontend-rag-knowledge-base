import fs from 'fs';
import path from 'path';
import { chromaService, EmbeddingMode } from './services/chroma';
import { splitText, extractTitle } from './utils/textSplitter';

async function uploadDocuments(embeddingMode: EmbeddingMode = 'semantic') {
  const docsPath = path.join(__dirname, '../../knowledge-docs');
  
  if (!fs.existsSync(docsPath)) {
    console.error(`Directory not found: ${docsPath}`);
    process.exit(1);
  }

  console.log(`\nEmbedding mode: ${embeddingMode === 'semantic' ? '语义向量 (Minimax API)' : '简单哈希 (本地)'}`);
  console.log(`Note: ${embeddingMode === 'semantic' ? '将消耗 Token，上传时间较长' : '不消耗 Token，上传速度快'}`);

  const dirs = fs.readdirSync(docsPath, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

  let totalFiles = 0;
  let totalChunks = 0;
  let successCount = 0;

  for (const dir of dirs) {
    const dirPath = path.join(docsPath, dir);
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.md'));

    console.log(`\nProcessing directory: ${dir} (${files.length} files)`);

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        const chunks = splitText(content);
        const title = extractTitle(content);
        const ids = chunks.map((_, index) => `${dir}/${file}-${index}-${Date.now()}`);
        const metadatas = chunks.map(() => ({
          source: `${dir}/${file}`,
          title,
        }));

        await chromaService.addDocuments(chunks, metadatas, ids, embeddingMode);

        totalFiles++;
        totalChunks += chunks.length;
        successCount++;

        console.log(`✓ ${file}: ${chunks.length} chunks`);
      } catch (error) {
        console.error(`✗ ${file}: ${(error as Error).message}`);
      }
    }
  }

  const stats = await chromaService.getCollectionStats();

  console.log(`\n=== Upload Summary ===`);
  console.log(`Total directories processed: ${dirs.length}`);
  console.log(`Total files uploaded: ${successCount}/${totalFiles}`);
  console.log(`Total chunks created: ${totalChunks}`);
  console.log(`Collection document count: ${stats.count}`);
}

const args = process.argv.slice(2);
const embeddingMode: EmbeddingMode = args.includes('--simple') ? 'simple' : 'semantic';

uploadDocuments(embeddingMode).catch(error => {
  console.error('Error uploading documents:', error);
  process.exit(1);
});
