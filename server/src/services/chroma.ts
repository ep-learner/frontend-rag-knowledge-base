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
  semanticEmbedding: number[];  // Minimax API 生成的语义向量
  simpleEmbedding: number[];    // 本地哈希生成的快速向量
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
        const chunks: any[] = JSON.parse(data);
        chunks.forEach(chunk => {
          // 兼容旧数据格式（只有 embedding）和新格式（有 semanticEmbedding 和 simpleEmbedding）
          if (chunk.semanticEmbedding && chunk.simpleEmbedding) {
            // 新格式：直接使用
            this.documents.set(chunk.id, {
              id: chunk.id,
              content: chunk.content,
              metadata: chunk.metadata,
              semanticEmbedding: chunk.semanticEmbedding,
              simpleEmbedding: chunk.simpleEmbedding,
            });
          } else if (chunk.embedding) {
            // 旧格式：将 embedding 转换为 semanticEmbedding，simpleEmbedding 留空
            this.documents.set(chunk.id, {
              id: chunk.id,
              content: chunk.content,
              metadata: chunk.metadata,
              semanticEmbedding: chunk.embedding,
              simpleEmbedding: [],  // 旧数据没有 simpleEmbedding
            });
          }
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

    console.log(`\n正在上传文档...`);

    // ========================================
    // 【双写逻辑】为每个文档片段同时生成并存储两份向量：
    // 1. semanticEmbedding: 调用 Minimax API，消耗 Token，效果好
    // 2. simpleEmbedding: 本地哈希算法，不消耗 Token，速度快
    // ========================================

    for (let i = 0; i < documents.length; i++) {
      // ✅ 双写：同时生成两种向量
      const semanticEmbedding = await minimaxService.generateEmbedding(documents[i]);
      const simpleEmbedding = this.generateSimpleEmbedding(documents[i]);

      this.documents.set(ids[i], {
        id: ids[i],
        content: documents[i],
        metadata: metadatas[i],
        semanticEmbedding,  // 📌 Minimax API 向量（用户选择"语义检索"时使用）
        simpleEmbedding,    // 📌 本地哈希向量（用户选择"快速检索"时使用）
      });

      if (i % 10 === 0) {
        console.log(`已处理 ${i}/${documents.length} 个片段...`);
      }
    }

    await this.saveToFile();
    console.log(`✓ 上传完成，共 ${documents.length} 个片段`);
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

    // ========================================
    // 【查询向量选择逻辑】
    // 根据 embeddingMode 参数选择使用哪个向量：
    // - 'semantic': 使用 semanticEmbedding（调用 Minimax API 生成查询向量，消耗 Token）
    // - 'simple': 使用 simpleEmbedding（本地哈希生成查询向量，不消耗 Token）
    // 存储的两份向量确保用户可以自由切换查询模式
    // ========================================

    console.log(`查询模式: ${embeddingMode === 'semantic' ? '语义检索（消耗 Token）' : '快速检索（不消耗 Token）'}`);

    // 生成查询向量
    const queryEmbedding = embeddingMode === 'semantic'
      ? await minimaxService.generateEmbedding(queryText)  // ⚠️ 消耗 Token
      : this.generateSimpleEmbedding(queryText);              // ✅ 不消耗 Token

    const results: Array<{
      document: string;
      metadata: { source: string; title?: string };
      distance: number;
    }> = [];

    // 使用对应的存储向量进行匹配
    for (const [, chunk] of this.documents) {
      const targetEmbedding = embeddingMode === 'semantic'
        ? chunk.semanticEmbedding
        : chunk.simpleEmbedding;

      // 兼容旧数据：如果某个向量不存在，使用另一个
      const embedding = targetEmbedding || chunk.semanticEmbedding || chunk.simpleEmbedding;

      if (embedding) {
        const distance = this.cosineSimilarity(queryEmbedding, embedding);
        results.push({
          document: chunk.content,
          metadata: chunk.metadata,
          distance,
        });
      }
    }

    results.sort((a, b) => b.distance - a.distance);
    const topResults = results.slice(0, nResults);

    return {
      documents: topResults.map(r => r.document),
      metadatas: topResults.map(r => r.metadata),
      distances: topResults.map(r => r.distance),
    };
  }

  async getCollectionStats(): Promise<{ count: number; categories: Record<string, number> }> {
    if (!this.isInitialized) {
      await this.init();
    }

    const categories: Record<string, number> = {};
    this.documents.forEach(doc => {
      const category = doc.metadata.source.split('/')[0];
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      count: this.documents.size,
      categories
    };
  }

  getAllDocuments(): DocumentChunk[] {
    return Array.from(this.documents.values());
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
