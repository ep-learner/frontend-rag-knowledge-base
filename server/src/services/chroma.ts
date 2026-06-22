import { ChromaClient, Collection } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config();

const CHROMA_DB_PATH = process.env.CHROMA_DB_PATH || './chroma-db';

class ChromaService {
  private client: ChromaClient;
  private collection: Collection | null = null;

  constructor() {
    this.client = new ChromaClient({
      path: CHROMA_DB_PATH,
    });
  }

  async init(): Promise<void> {
    this.collection = await this.client.getOrCreateCollection({
      name: 'frontend-knowledge-base',
    });
  }

  async addDocuments(documents: string[], metadatas: Array<{ source: string; title?: string }>, ids: string[]): Promise<void> {
    if (!this.collection) {
      await this.init();
    }
    await this.collection!.add({
      documents,
      metadatas,
      ids,
    });
  }

  async query(queryText: string, nResults: number = 5): Promise<{
    documents: string[];
    metadatas: Array<{ source: string; title?: string }>;
    distances: number[];
  }> {
    if (!this.collection) {
      await this.init();
    }
    const results = await this.collection!.query({
      queryTexts: [queryText],
      nResults,
    });
    const docs = results.documents[0];
    const metas = results.metadatas[0];
    const dists = results.distances?.[0];
    return {
      documents: (docs as string[]) || [],
      metadatas: (metas as Array<{ source: string; title?: string }>) || [],
      distances: (dists as number[]) || [],
    };
  }

  async getCollectionStats(): Promise<{ count: number }> {
    if (!this.collection) {
      await this.init();
    }
    const count = await this.collection!.count();
    return { count };
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.collection) {
      await this.init();
    }
    await this.collection!.delete({
      ids: [id],
    });
  }

  async getDocumentById(id: string): Promise<{
    documents: string[];
    metadatas: Array<{ source: string; title?: string }>;
  } | null> {
    if (!this.collection) {
      await this.init();
    }
    const results = await this.collection!.get({
      ids: [id],
    });
    const docs = results.documents as string[];
    if (!docs || docs.length === 0) {
      return null;
    }
    return {
      documents: docs,
      metadatas: results.metadatas as Array<{ source: string; title?: string }>,
    };
  }
}

export const chromaService = new ChromaService();
