import * as http from 'http';
import * as https from 'https';
import dotenv from 'dotenv';

dotenv.config();

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface EmbeddingOptions {
  model?: string;
  type?: 'query' | 'document';
}

interface CompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

class MinimaxService {
  private apiKey: string;
  private baseUrl: string;
  private groupId: string;
  private embeddingUrl: string;

  constructor() {
    this.apiKey = process.env.MINIMAX_API_KEY || '';
    this.baseUrl = process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1/text/chatcompletion';
    this.embeddingUrl = 'https://api.minimax.chat/v1/embeddings';
    this.groupId = process.env.MINIMAX_GROUP_ID || '';

    if (!this.apiKey) {
      console.warn('MINIMAX_API_KEY not set in environment variables');
    }
  }

  async generateEmbedding(text: string, options: EmbeddingOptions = {}): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.embeddingUrl);
      const body = JSON.stringify({
        model: options.model || 'embo-01',
        texts: [text],
        type: options.type || 'query',
        group_id: this.groupId,
      });

      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.vectors && response.vectors.length > 0) {
              resolve(response.vectors[0]);
            } else {
              reject(new Error(`Embedding API response error: ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse embedding response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(body);
      req.end();
    });
  }

  async generate(
    prompt: string,
    context?: string,
    options: CompletionOptions = {},
    history?: Message[]
  ): Promise<{
    response: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  }> {
    const messages: Message[] = [];

    if (context) {
      messages.push({
        role: 'system',
        content: `基于以下知识库内容回答问题：\n\n${context}\n\n请仅根据上述知识库内容回答，如果知识库中没有相关内容，请明确说明。`,
      });
    }

    if (history && history.length > 0) {
      messages.push(...history);
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    return this.callApi(messages, options);
  }

  private async callApi(
    messages: Message[],
    options: CompletionOptions
  ): Promise<{ response: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl);
      const body = JSON.stringify({
        model: 'abab6.5-chat',
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP || 0.9,
        presence_penalty: options.presencePenalty || 0,
        frequency_penalty: options.frequencyPenalty || 0,
        group_id: this.groupId,
      });

      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response: CompletionResponse = JSON.parse(data);
            if (response.choices && response.choices.length > 0) {
              resolve({
                response: response.choices[0].message.content,
                usage: response.usage,
              });
            } else {
              reject(new Error(`API response error: ${data}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(body);
      req.end();
    });
  }

  async generateStream(
    prompt: string,
    context?: string,
    onChunk?: (chunk: string) => void,
    options: CompletionOptions = {},
    history?: Message[]
  ): Promise<{
    response: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  }> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl);
      const messages: Message[] = [];

      if (context) {
        messages.push({
          role: 'system',
          content: `基于以下知识库内容回答问题：\n\n${context}\n\n请仅根据上述知识库内容回答，如果知识库中没有相关内容，请明确说明。`,
        });
      }

      if (history && history.length > 0) {
        messages.push(...history);
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const body = JSON.stringify({
        model: 'abab6.5-chat',
        messages,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature ?? 0.7,
        top_p: options.topP || 0.9,
        presence_penalty: options.presencePenalty || 0,
        frequency_penalty: options.frequencyPenalty || 0,
        stream: true,
        group_id: this.groupId,
      });

      const reqOptions: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;
      let fullResponse = '';

      const req = protocol.request(reqOptions, (res) => {
        res.on('data', (chunk) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim();
              if (data === '[DONE]') {
                resolve({ response: fullResponse });
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                  const content = parsed.choices[0].delta.content || '';
                  fullResponse += content;
                  onChunk?.(content);
                }
              } catch (error) {
                console.error('Failed to parse stream chunk:', error);
              }
            }
          }
        });

        res.on('end', () => {
          resolve({ response: fullResponse });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(body);
      req.end();
    });
  }
}

export const minimaxService = new MinimaxService();
