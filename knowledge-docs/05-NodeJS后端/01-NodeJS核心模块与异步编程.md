# Node.js 核心模块与异步编程

## 核心知识点

### Node.js 核心模块

Node.js 提供了丰富的核心模块：

1. **fs**：文件系统操作
2. **http/https**：网络请求处理
3. **path**：路径处理
4. **crypto**：加密解密
5. **stream**：流处理

### 异步编程模型

Node.js 采用事件驱动和异步编程：

1. **回调函数**：传统异步方式
2. **Promise**：ES6 异步规范
3. **async/await**：更简洁的异步写法

### 事件循环

Node.js 的事件循环分为六个阶段：
- timers
- pending callbacks
- idle, prepare
- poll
- check
- close callbacks

## 代码示例

```javascript
const fs = require('fs').promises;
const path = require('path');

async function readFiles(dir) {
  const files = await fs.readdir(dir);
  
  const results = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        return await readFiles(filePath);
      }
      
      const content = await fs.readFile(filePath, 'utf-8');
      return { filePath, content };
    })
  );
  
  return results.flat();
}

const crypto = require('crypto');

function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function encryptData(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encrypted };
}

const { createServer } = require('http');

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello, Node.js!' }));
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 常见问题

### Q: Node.js 和浏览器中的 JavaScript 有什么区别？

A: Node.js 运行在服务端，有文件系统、网络等能力，没有 DOM。

### Q: 什么是事件循环？

A: 事件循环是 Node.js 处理异步操作的机制，确保非阻塞执行。

## 参考链接

- [Node.js Docs](https://nodejs.org/docs/)
- [Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
