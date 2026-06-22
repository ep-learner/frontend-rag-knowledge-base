import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import documentsRouter from './routes/documents';
import chatRouter from './routes/chat';
import { chromaService } from './services/chroma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/documents', documentsRouter);
app.use('/api/chat', chatRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
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
      <li>DELETE /api/documents/:id - Delete document</li>
      <li>POST /api/chat - Chat with RAG</li>
      <li>POST /api/chat/stream - Stream chat with RAG</li>
    </ul>
  `);
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message || 'Internal server error' });
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

startServer();
