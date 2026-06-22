import express from 'express';
import fs from 'fs';
import path from 'path';
import { chromaService } from '../services/chroma';
import { splitText, extractTitle } from '../utils/textSplitter';

const router = express.Router();

router.post('/upload', async (req, res) => {
  try {
    const { content, filename } = req.body;

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
    res.json({
      success: true,
      count: stats.count,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
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
