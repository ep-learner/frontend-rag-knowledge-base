import * as http from 'http';
import * as https from 'https';
import dotenv from 'dotenv';

dotenv.config();

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

class MinimaxService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.MINIMAX_API_KEY || '';
    this.baseUrl = process.env.MINIMAX_BASE_URL || 'https://api.minimaxi.com/anthropic';
    this.model = process.env.MINIMAX_MODEL || 'claude-3-sonnet-20240229';

    if (!this.apiKey) {
      console.warn('MINIMAX_API_KEY not set in environment variables');
    }
  }

  async generate(prompt: string, context?: string): Promise<string> {
    const messages: Message[] = [];

    if (context) {
      messages.push({
        role: 'system',
        content: `基于以下知识库内容回答问题：\n\n${context}\n\n请仅根据上述知识库内容回答，如果知识库中没有相关内容，请明确说明。`,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    return this.callApi(messages);
  }

  private async callApi(messages: Message[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/v1/chat/completions`);
      const body = JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 2048,
        temperature: 0.7,
      });

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(body),
        },
      };

      const protocol = url.protocol === 'https:' ? https : http;
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response: CompletionResponse = JSON.parse(data);
            if (response.choices && response.choices.length > 0) {
              resolve(response.choices[0].message.content);
            } else {
              reject(new Error('No response from model'));
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

  async generateStream(prompt: string, context?: string, onChunk?: (chunk: string) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/v1/chat/completions`);
      const messages: Message[] = [];

      if (context) {
        messages.push({
          role: 'system',
          content: `基于以下知识库内容回答问题：\n\n${context}\n\n请仅根据上述知识库内容回答，如果知识库中没有相关内容，请明确说明。`,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const body = JSON.stringify({
        model: this.model,
        messages,
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
      });

      const options: https.RequestOptions = {
        hostname: url.hostname,
        port: url.port,
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

      const req = protocol.request(options, (res) => {
        res.on('data', (chunk) => {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim();
              if (data === '[DONE]') {
                resolve(fullResponse);
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
          resolve(fullResponse);
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
