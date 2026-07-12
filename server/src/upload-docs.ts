import fs from 'fs';
import path from 'path';
import { chromaService, EmbeddingMode } from './services/chroma';
import { splitText, extractTitle } from './utils/textSplitter';

const CONTENT_ROOT = path.join(__dirname, '../../content/active');
const LEGACY_DOCS_PATH = path.join(__dirname, '../../knowledge-docs');

export interface RebuildResult {
  success: boolean;
  totalFiles: number;
  successFiles: number;
  totalChunks: number;
  collectionCount: number;
  errors: string[];
}

interface RebuildStatus {
  isRunning: boolean;
  mode: EmbeddingMode | null;
  startTime: number | null;
  endTime: number | null;
  progress: {
    current: number;
    total: number;
    currentFile: string;
  } | null;
  lastResult: RebuildResult | null;
}

export const rebuildStatus: RebuildStatus = {
  isRunning: false,
  mode: null,
  startTime: null,
  endTime: null,
  progress: null,
  lastResult: null,
};

function collectMdFiles(dirPath: string, basePath: string): string[] {
  const results: string[] = [];

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectMdFiles(fullPath, basePath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(path.relative(basePath, fullPath));
    }
  }

  return results;
}

function resolveDocsPath(): { path: string; label: string } | null {
  if (fs.existsSync(CONTENT_ROOT)) {
    return { path: CONTENT_ROOT, label: 'content/active' };
  } else if (fs.existsSync(LEGACY_DOCS_PATH)) {
    return { path: LEGACY_DOCS_PATH, label: 'knowledge-docs (legacy)' };
  }
  return null;
}

export async function rebuildIndex(embeddingMode: EmbeddingMode = 'simple'): Promise<RebuildResult> {
  const result: RebuildResult = {
    success: true,
    totalFiles: 0,
    successFiles: 0,
    totalChunks: 0,
    collectionCount: 0,
    errors: [],
  };

  const docsInfo = resolveDocsPath();
  if (!docsInfo) {
    result.success = false;
    result.errors.push('No content directory found');
    return result;
  }

  rebuildStatus.isRunning = true;
  rebuildStatus.mode = embeddingMode;
  rebuildStatus.startTime = Date.now();
  rebuildStatus.endTime = null;
  rebuildStatus.progress = null;

  try {
    const mdFiles = collectMdFiles(docsInfo.path, docsInfo.path);
    result.totalFiles = mdFiles.length;

    rebuildStatus.progress = {
      current: 0,
      total: mdFiles.length,
      currentFile: '',
    };

    for (let i = 0; i < mdFiles.length; i++) {
      const relPath = mdFiles[i];
      rebuildStatus.progress.current = i + 1;
      rebuildStatus.progress.currentFile = relPath;

      try {
        const fullPath = path.join(docsInfo.path, relPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const chunks = splitText(content);
        const title = extractTitle(content);
        const ids = chunks.map((_, index) => `${relPath}-${index}-${Date.now()}`);
        const metadatas = chunks.map(() => ({
          source: relPath,
          title,
        }));

        await chromaService.addDocuments(chunks, metadatas, ids, embeddingMode);

        result.successFiles++;
        result.totalChunks += chunks.length;
      } catch (error) {
        result.errors.push(`${relPath}: ${(error as Error).message}`);
      }
    }

    const stats = await chromaService.getCollectionStats();
    result.collectionCount = stats.count;
  } catch (error) {
    result.success = false;
    result.errors.push(`Fatal error: ${(error as Error).message}`);
  } finally {
    rebuildStatus.isRunning = false;
    rebuildStatus.endTime = Date.now();
    rebuildStatus.lastResult = result;
  }

  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const embeddingMode: EmbeddingMode = args.includes('--simple') ? 'simple' : 'semantic';

  const docsInfo = resolveDocsPath();
  if (!docsInfo) {
    console.error('No content directory found. Looked for:');
    console.error(`  - ${CONTENT_ROOT}`);
    console.error(`  - ${LEGACY_DOCS_PATH}`);
    process.exit(1);
  }

  console.log(`\nContent source: ${docsInfo.label}`);
  console.log(`Content path: ${docsInfo.path}`);
  console.log(`\nEmbedding mode: ${embeddingMode === 'semantic' ? 'Semantic (Minimax API)' : 'Simple hash (local)'}`);
  console.log(`Note: ${embeddingMode === 'semantic' ? 'Will consume tokens, slower upload' : 'No token consumption, fast upload'}`);

  rebuildIndex(embeddingMode).then((result) => {
    console.log(`\n=== Upload Summary ===`);
    console.log(`Total files processed: ${result.successFiles}/${result.totalFiles}`);
    console.log(`Total chunks created: ${result.totalChunks}`);
    console.log(`Collection document count: ${result.collectionCount}`);
    if (result.errors.length > 0) {
      console.log(`\nErrors (${result.errors.length}):`);
      result.errors.forEach((e) => console.log(`  - ${e}`));
    }
    if (!result.success) {
      process.exit(1);
    }
  }).catch((error) => {
    console.error('Error uploading documents:', error);
    process.exit(1);
  });
}
