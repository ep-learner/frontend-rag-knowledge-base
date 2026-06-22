import express from 'express';
import { chromaService, EmbeddingMode } from '../services/chroma';
import { minimaxService, Message } from '../services/minimax';
import { loggerService } from '../services/logger';

const router = express.Router();

interface ChatRequest {
  query?: string;
  messages?: Array<{ role: string; content: string }>;
  mode?: 'semantic' | 'simple';
  useRag?: boolean;
  stream?: boolean;
  embeddingMode?: EmbeddingMode;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  history?: Message[];
  maxHistory?: number;
}

router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      query,
      messages,
      mode = 'semantic',
      useRag = true,
      stream = false,
      embeddingMode,
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      history = [],
      maxHistory = 10,
    } = req.body as ChatRequest;

    // 支持两种请求格式
    let actualQuery = query;
    if (!actualQuery && messages && messages.length > 0) {
      // 从 messages 中提取最后一个用户消息作为查询
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      actualQuery = lastUserMessage?.content;
    }

    if (!actualQuery) {
      return res.status(400).json({ error: 'query or messages is required' });
    }

    // mode 参数优先于 embeddingMode
    const actualEmbeddingMode = mode || embeddingMode || 'semantic';

    // 检索相关文档
    let context = '';
    let retrievedDocs: Array<{
      source: string;
      title: string;
      distance: number;
      content: string;
    }> = [];

    if (useRag) {
      const results = await chromaService.query(actualQuery, 5, actualEmbeddingMode);
      const relevantDocs = results.documents
        .map((doc, index) => ({
          content: doc,
          distance: results.distances[index],
          metadata: results.metadatas[index],
        }))
        .filter(doc => doc.distance < 2);

      retrievedDocs = relevantDocs.map(doc => ({
        source: doc.metadata?.source || 'unknown',
        title: doc.metadata?.title || doc.metadata?.source || 'unknown',
        distance: doc.distance,
        content: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
      }));

      if (relevantDocs.length > 0) {
        context = relevantDocs.map(doc => {
          return `来源: ${doc.metadata?.source || 'unknown'}\n${doc.content}`;
        }).join('\n\n---\n\n');
      }
    }

    const trimmedHistory = history.slice(-maxHistory);

    const completionOptions = {
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
    };

    let response: string;
    let tokenUsage: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    } = {};
    let error: string | null = null;

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let fullResponse = '';
      await minimaxService.generateStream(
        actualQuery,
        context,
        (chunk) => {
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ chunk, done: false })}\n\n`);
        },
        completionOptions,
        trimmedHistory
      );

      response = fullResponse;
      res.write(`data: ${JSON.stringify({ chunk: '', done: true, fullResponse })}\n\n`);
      res.end();
    } else {
      const result = await minimaxService.generate(
        actualQuery,
        context,
        completionOptions,
        trimmedHistory
      );

      response = result.response;
      if (result.usage) {
        tokenUsage = {
          inputTokens: result.usage.prompt_tokens,
          outputTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens,
        };
      }

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

    // 记录日志
    const processingTime = Date.now() - startTime;
    loggerService.log({
      mode: actualEmbeddingMode,
      userQuery: actualQuery,
      retrievedDocs,
      messages: [
        ...trimmedHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: actualQuery },
      ],
      context,
      response,
      tokenUsage,
      processingTime,
      error,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Error in chat:', error);

    // 记录错误日志
    loggerService.log({
      mode: 'semantic',
      userQuery: req.body.query || 'N/A',
      retrievedDocs: [],
      messages: [],
      context: '',
      response: '',
      tokenUsage: {},
      processingTime,
      error: (error as Error).message,
    });

    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/stream', async (req, res) => {
  try {
    const {
      query,
      useRag = true,
      embeddingMode = 'semantic',
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
      history = [],
      maxHistory = 10,
    } = req.body as ChatRequest;

    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }

    let context = '';

    if (useRag) {
      const results = await chromaService.query(query, 5, embeddingMode);
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

    const trimmedHistory = history.slice(-maxHistory);

    const completionOptions = {
      temperature,
      maxTokens,
      topP,
      presencePenalty,
      frequencyPenalty,
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await minimaxService.generateStream(
      query,
      context,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      },
      completionOptions,
      trimmedHistory
    );

    res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in stream chat:', error);
    res.status(500).json({ error: 'Failed to process stream request' });
  }
});

// ========================================
// 日志查看接口
// ========================================

router.get('/logs', async (req, res) => {
  try {
    const { date, limit } = req.query;
    const logs = loggerService.getLogs(date as string, limit ? parseInt(limit as string) : 50);

    res.json({
      success: true,
      logs,
      count: logs.length,
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

router.get('/logs/stats', async (req, res) => {
  try {
    const stats = loggerService.getStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting log stats:', error);
    res.status(500).json({ error: 'Failed to get log stats' });
  }
});

router.get('/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const log = loggerService.getLogById(id);

    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({
      success: true,
      log,
    });
  } catch (error) {
    console.error('Error getting log:', error);
    res.status(500).json({ error: 'Failed to get log' });
  }
});

export default router;
