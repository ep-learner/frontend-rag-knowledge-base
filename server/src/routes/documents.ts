import express from 'express';
import fs from 'fs';
import path from 'path';
import { chromaService } from '../services/chroma';
import { splitText, extractTitle } from '../utils/textSplitter';

const router = express.Router();

router.post('/upload', async (req, res) => {
  try {
    // 支持 multipart/form-data 和 JSON 两种方式
    let content: string;
    let filename: string;

    if (req.is('multipart/form-data')) {
      // FormData 方式：从 req.file 获取（需要 multer）
      // 暂时不支持，返回错误提示
      return res.status(400).json({
        error: 'multipart/form-data not supported. Please use JSON format with { content, filename }'
      });
    } else {
      // JSON 方式
      content = req.body.content;
      filename = req.body.filename;
    }

    if (!content || !filename) {
      return res.status(400).json({ error: 'content and filename are required' });
    }

    const chunks = splitText(content);
    const title = extractTitle(content);
    const ids = chunks.map((_, index) => `${filename}-${index}-${Date.now()}`);
    const metadatas = chunks.map(() => ({
      source: filename,
      title,
    }));

    await chromaService.addDocuments(chunks, metadatas, ids);

    res.json({
      success: true,
      message: `Document uploaded successfully`,
      chunks: chunks.length,
      filename,
      title,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.post('/batch-upload', async (req, res) => {
  try {
    const { directory } = req.body;

    if (!directory) {
      return res.status(400).json({ error: 'directory is required' });
    }

    const docsPath = path.join(__dirname, '../../', directory);

    if (!fs.existsSync(docsPath)) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const files = fs.readdirSync(docsPath).filter(file => file.endsWith('.md'));
    const results: Array<{ filename: string; chunks: number; success: boolean }> = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(docsPath, file), 'utf-8');
        const chunks = splitText(content);
        const title = extractTitle(content);
        const ids = chunks.map((_, index) => `${file}-${index}-${Date.now()}`);
        const metadatas = chunks.map(() => ({
          source: file,
          title,
        }));

        await chromaService.addDocuments(chunks, metadatas, ids);

        results.push({
          filename: file,
          chunks: chunks.length,
          success: true,
        });
      } catch (error) {
        console.error(`Error uploading ${file}:`, error);
        results.push({
          filename: file,
          chunks: 0,
          success: false,
        });
      }
    }

    res.json({
      success: true,
      message: `Batch upload completed`,
      totalFiles: files.length,
      successCount: results.filter(r => r.success).length,
      results,
    });
  } catch (error) {
    console.error('Error batch uploading documents:', error);
    res.status(500).json({ error: 'Failed to batch upload documents' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await chromaService.getCollectionStats();

    // 计算文档数量（去重）
    const uniqueSources = new Set();
    const documents = chromaService.getAllDocuments();
    documents.forEach(doc => {
      uniqueSources.add(doc.metadata.source);
    });

    res.json({
      totalDocuments: uniqueSources.size,
      totalChunks: stats.count,
      categories: stats.categories,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const documents = chromaService.getAllDocuments();

    // 按 source 分组
    const groupedDocs: Record<string, {
      source: string;
      title: string;
      chunks: string[];
      chunkCount: number;
    }> = {};

    documents.forEach(doc => {
      const source = doc.metadata.source;
      if (!groupedDocs[source]) {
        groupedDocs[source] = {
          source,
          title: doc.metadata.title || source,
          chunks: [],
          chunkCount: 0,
        };
      }
      groupedDocs[source].chunks.push(doc.content);
    });

    // 计算每个文档的 chunk 数量
    Object.keys(groupedDocs).forEach(source => {
      groupedDocs[source].chunkCount = groupedDocs[source].chunks.length;
    });

    // 转换为数组并按标题排序
    const docList = Object.values(groupedDocs).sort((a, b) =>
      a.title.localeCompare(b.title)
    );

    res.json({
      success: true,
      documents: docList,
      totalCount: docList.length,
    });
  } catch (error) {
    console.error('Error getting document list:', error);
    res.status(500).json({ error: 'Failed to get document list' });
  }
});

router.get('/content/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const decodedSource = decodeURIComponent(source);
    const documents = chromaService.getAllDocuments();

    // 查找该 source 的所有文档
    const docChunks = documents.filter(doc =>
      doc.metadata.source === decodedSource
    );

    if (docChunks.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 按 chunk 顺序拼接内容
    const content = docChunks
      .sort((a, b) => {
        const indexA = a.id.match(/-(\d+)-(\d+)$/)?.[1] || '0';
        const indexB = b.id.match(/-(\d+)-(\d+)$/)?.[1] || '0';
        return parseInt(indexA) - parseInt(indexB);
      })
      .map(chunk => chunk.content)
      .join('\n\n');

    res.json({
      success: true,
      source: decodedSource,
      title: docChunks[0].metadata.title || decodedSource,
      content,
      chunkCount: docChunks.length,
    });
  } catch (error) {
    console.error('Error getting document content:', error);
    res.status(500).json({ error: 'Failed to get document content' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await chromaService.deleteDocument(id);
    res.json({
      success: true,
      message: 'Document deleted',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
