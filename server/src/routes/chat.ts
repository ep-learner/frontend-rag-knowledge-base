import express from 'express';
import { chromaService } from '../services/chroma';
import { minimaxService } from '../services/minimax';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { query, useRag = true, stream = false } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    let context = '';

    if (useRag) {
      const results = await chromaService.query(query, 5);
      const relevantDocs = results.documents
        .map((doc, index) => ({
          content: doc,
          distance: results.distances[index],
          metadata: results.metadatas[index],
        }))
        .filter(doc => doc.distance < 2);

      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => {
          return `来源: ${doc.metadata?.source || 'unknown'}\n${doc.content}`;
        }).join('\n\n---\n\n');
      }
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';
      await minimaxService.generateStream(query, context, (chunk) => {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
      });

      res.write(`data: ${JSON.stringify({ chunk: '', done: true, fullResponse })}\n\n`);
      res.end();
    } else {
      const response = await minimaxService.generate(query, context);
      res.json({
        success: true,
        response,
        context: context || null,
        sources: useRag ? context.split('---\n\n').map((s: string) => {
          const match = s.match(/来源:\s*(\S+)/);
          return match ? match[1] : 'unknown';
        }).filter(Boolean) : [],
      });
    }
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const { query, useRag = true } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    let context = '';

    if (useRag) {
      const results = await chromaService.query(query, 5);
      const relevantDocs = results.documents
        .map((doc, index) => ({
          content: doc,
          distance: results.distances[index],
          metadata: results.metadatas[index],
        }))
        .filter(doc => doc.distance < 2);

      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => {
          return `来源: ${doc.metadata?.source || 'unknown'}\n${doc.content}`;
        }).join('\n\n---\n\n');
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await minimaxService.generateStream(query, context, (chunk) => {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in stream chat:', error);
    res.status(500).json({ error: 'Failed to process stream request' });
  }
});

export default router;
