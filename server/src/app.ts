import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import documentsRouter from './routes/documents';
import chatRouter from './routes/chat';
import contentRouter from './routes/content';
import { chromaService } from './services/chroma';
import { error as apiError, ErrorCode } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/documents', documentsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/content', contentRouter);

app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    message: 'ok',
  });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Minimax RAG Knowledge Base API</h1>
    <p>Available endpoints:</p>
    <ul>
      <li>GET /api/health - Health check</li>
      <li>POST /api/documents/upload - Upload document</li>
      <li>POST /api/documents/batch-upload - Batch upload documents</li>
      <li>GET /api/documents/stats - Get collection stats</li>
      <li>GET /api/documents/list - Get document list</li>
      <li>GET /api/documents/content/:source - Get document content</li>
      <li>DELETE /api/documents/:id - Delete document</li>
      <li>POST /api/chat - Chat with RAG</li>
      <li>POST /api/chat/stream - Stream chat with RAG</li>
      <li>GET /api/chat/logs - Get chat logs (today)</li>
      <li>GET /api/chat/logs/stats - Get log statistics</li>
      <li>GET /api/chat/logs/:id - Get specific log by ID</li>
    </ul>
  `);
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json(
    apiError(ErrorCode.INTERNAL_ERROR, error.message || 'Internal server error')
  );
});

async function startServer() {
  try {
    await chromaService.init();
    console.log('Chroma DB initialized successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;
