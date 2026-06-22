import fs from 'fs';
import path from 'path';

export interface ChatLogEntry {
  id: string;
  timestamp: string;
  mode: 'semantic' | 'simple';
  userQuery: string;
  retrievedDocs: Array<{
    source: string;
    title: string;
    distance: number;
    content: string;
  }>;
  messages: Array<{
    role: string;
    content: string;
  }>;
  context: string;
  response: string;
  tokenUsage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  processingTime: number;
  error: string | null;
}

class LoggerService {
  private logDir: string;
  private maxLogFiles: number = 30; // 保留30天的日志

  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
    this.cleanOldLogs();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `chat-${date}.json`);
  }

  private generateId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  log(chatLog: Omit<ChatLogEntry, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const timestamp = new Date().toISOString();
    const logEntry: ChatLogEntry = {
      ...chatLog,
      id,
      timestamp,
    };

    // 写入文件
    this.appendToFile(logEntry);

    // 控制台输出（格式化）
    this.logToConsole(logEntry);

    return id;
  }

  private appendToFile(logEntry: ChatLogEntry): void {
    try {
      const filePath = this.getLogFilePath();
      let logs: ChatLogEntry[] = [];

      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        logs = JSON.parse(data);
      }

      logs.push(logEntry);
      fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  private logToConsole(logEntry: ChatLogEntry): void {
    const divider = '═'.repeat(80);
    console.log('\n' + divider);
    console.log(`📝 Chat Log ID: ${logEntry.id}`);
    console.log(`⏰ Time: ${logEntry.timestamp}`);
    console.log(`🔍 Mode: ${logEntry.mode === 'semantic' ? '语义检索' : '快速检索'}`);
    console.log(divider);

    console.log('\n👤 User Query:');
    console.log(`   ${logEntry.userQuery}`);

    if (logEntry.retrievedDocs.length > 0) {
      console.log('\n📚 Retrieved Documents:');
      logEntry.retrievedDocs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.title}`);
        console.log(`      Source: ${doc.source}`);
        console.log(`      Distance: ${doc.distance.toFixed(4)}`);
        console.log(`      Content: ${doc.content.substring(0, 100)}...`);
      });
    }

    console.log('\n💬 Response:');
    console.log(`   ${logEntry.response.substring(0, 200)}${logEntry.response.length > 200 ? '...' : ''}`);

    if (logEntry.tokenUsage.totalTokens) {
      console.log('\n📊 Token Usage:');
      console.log(`   Input: ${logEntry.tokenUsage.inputTokens || 'N/A'}`);
      console.log(`   Output: ${logEntry.tokenUsage.outputTokens || 'N/A'}`);
      console.log(`   Total: ${logEntry.tokenUsage.totalTokens}`);
    }

    console.log('\n⏱️  Processing Time:', logEntry.processingTime + 'ms');

    if (logEntry.error) {
      console.log('\n❌ Error:', logEntry.error);
    }

    console.log(divider + '\n');
  }

  getLogs(date?: string, limit: number = 50): ChatLogEntry[] {
    const filePath = date
      ? path.join(this.logDir, `chat-${date}.json`)
      : this.getLogFilePath();

    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const logs = JSON.parse(data);
      return logs.slice(-limit);
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }

  getLogById(id: string): ChatLogEntry | null {
    const files = fs.readdirSync(this.logDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const data = fs.readFileSync(path.join(this.logDir, file), 'utf-8');
        const logs: ChatLogEntry[] = JSON.parse(data);
        const found = logs.find(log => log.id === id);
        if (found) {
          return found;
        }
      } catch (error) {
        console.error(`Failed to read log file ${file}:`, error);
      }
    }

    return null;
  }

  private cleanOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir).filter(f => f.endsWith('.json'));
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.maxLogFiles);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];

      files.forEach(file => {
        const dateMatch = file.match(/chat-(\d{4}-\d{2}-\d{2})\.json/);
        if (dateMatch && dateMatch[1] < cutoffStr) {
          fs.unlinkSync(path.join(this.logDir, file));
          console.log(`🗑️  Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  getStats(): {
    totalLogs: number;
    todayLogs: number;
    totalTokens: number;
    dates: string[];
  } {
    const stats = {
      totalLogs: 0,
      todayLogs: 0,
      totalTokens: 0,
      dates: [] as string[],
    };

    try {
      const files = fs.readdirSync(this.logDir).filter(f => f.endsWith('.json'));
      const today = new Date().toISOString().split('T')[0];

      files.forEach(file => {
        const dateMatch = file.match(/chat-(\d{4}-\d{2}-\d{2})\.json/);
        if (dateMatch) {
          stats.dates.push(dateMatch[1]);
        }

        try {
          const data = fs.readFileSync(path.join(this.logDir, file), 'utf-8');
          const logs: ChatLogEntry[] = JSON.parse(data);

          stats.totalLogs += logs.length;

          if (dateMatch && dateMatch[1] === today) {
            stats.todayLogs = logs.length;
          }

          logs.forEach(log => {
            if (log.tokenUsage.totalTokens) {
              stats.totalTokens += log.tokenUsage.totalTokens;
            }
          });
        } catch (error) {
          console.error(`Failed to read log file ${file}:`, error);
        }
      });

      stats.dates.sort().reverse();
    } catch (error) {
      console.error('Failed to get stats:', error);
    }

    return stats;
  }
}

export const loggerService = new LoggerService();
