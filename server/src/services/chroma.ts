import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { minimaxService } from './minimax';

dotenv.config();

export type EmbeddingMode = 'simple' | 'semantic';

interface DocumentChunk {
  id: string;
  content: string;
  metadata: { source: string; title?: string };
  embedding: number[];
}

class ChromaService {
  private documents: Map<string, DocumentChunk> = new Map();
  private isInitialized = false;
  private dbPath = path.join(__dirname, '../../chroma-db/documents.json');

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadFromFile();
    this.isInitialized = true;
  }

  private async loadFromFile(): Promise<void> {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        const chunks: DocumentChunk[] = JSON.parse(data);
        chunks.forEach(chunk => {
          this.documents.set(chunk.id, chunk);
        });
        console.log(`Loaded ${this.documents.size} documents from ${this.dbPath}`);
      }
    } catch (error) {
      console.warn(`Failed to load documents from file: ${(error as Error).message}`);
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = JSON.stringify(Array.from(this.documents.values()), null, 2);
      fs.writeFileSync(this.dbPath, data, 'utf-8');
    } catch (error) {
      console.error(`Failed to save documents to file: ${(error as Error).message}`);
    }
  }

  async addDocuments(
    documents: string[], 
    metadatas: Array<{ source: string; title?: string }>, 
    ids: string[],
    embeddingMode: EmbeddingMode = 'semantic'
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    for (let i = 0; i < documents.length; i++) {
      const embedding = embeddingMode === 'semantic'
        ? await minimaxService.generateEmbedding(documents[i])
        : this.generateSimpleEmbedding(documents[i]);

      this.documents.set(ids[i], {
        id: ids[i],
        content: documents[i],
        metadata: metadatas[i],
        embedding,
      });
    }

    await this.saveToFile();
  }

  async query(
    queryText: string, 
    nResults: number = 5,
    embeddingMode: EmbeddingMode = 'semantic'
  ): Promise<{
    documents: string[];
    metadatas: Array<{ source: string; title?: string }>;
    distances: number[];
  }> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (this.documents.size === 0) {
      return { documents: [], metadatas: [], distances: [] };
    }

    const queryEmbedding = embeddingMode === 'semantic'
      ? await minimaxService.generateEmbedding(queryText)
      : this.generateSimpleEmbedding(queryText);

    const results: Array<{
      document: string;
      metadata: { source: string; title?: string };
      distance: number;
    }> = [];

    for (const [, chunk] of this.documents) {
      const distance = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({
        document: chunk.content,
        metadata: chunk.metadata,
        distance,
      });
    }

    results.sort((a, b) => b.distance - a.distance);
    const topResults = results.slice(0, nResults);

    return {
      documents: topResults.map(r => r.document),
      metadatas: topResults.map(r => r.metadata),
      distances: topResults.map(r => r.distance),
    };
  }

  async getCollectionStats(): Promise<{ count: number }> {
    if (!this.isInitialized) {
      await this.init();
    }
    return { count: this.documents.size };
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }
    this.documents.delete(id);
    await this.saveToFile();
  }

  async getDocumentById(id: string): Promise<{
    documents: string[];
    metadatas: Array<{ source: string; title?: string }>;
  } | null> {
    if (!this.isInitialized) {
      await this.init();
    }
    const chunk = this.documents.get(id);
    if (!chunk) {
      return null;
    }
    return {
      documents: [chunk.content],
      metadatas: [chunk.metadata],
    };
  }

  private generateSimpleEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const hash = words.reduce((acc, word) => {
      let h = 0;
      for (let i = 0; i < word.length; i++) {
        h = (h * 31 + word.charCodeAt(i)) % 65536;
      }
      return acc + h;
    }, 0);

    const embedding: number[] = [];
    for (let i = 0; i < 384; i++) {
      embedding.push(((hash * (i + 1)) ^ (i * 97)) % 1000 / 1000);
    }

    const norm = Math.sqrt(embedding.reduce((sum, x) => sum + x * x, 0));
    return embedding.map(x => x / norm);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const chromaService = new ChromaService();
