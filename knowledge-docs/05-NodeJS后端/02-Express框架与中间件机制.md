# Express 框架与中间件机制

## 核心知识点

### Express 基础

Express 是 Node.js 最流行的 Web 框架：

1. **路由**：定义 URL 与处理函数的映射
2. **中间件**：处理请求和响应的函数链
3. **模板引擎**：渲染 HTML 页面

### 中间件类型

| 类型 | 说明 |
|------|------|
| 应用级中间件 | 全局中间件 |
| 路由级中间件 | 特定路由中间件 |
| 错误处理中间件 | 捕获错误 |
| 内置中间件 | express.static 等 |

### 路由机制

Express 支持多种 HTTP 方法：
- GET
- POST
- PUT
- DELETE
- PATCH

## 代码示例

```javascript
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

app.use(logger);

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

app.get('/', (req, res) => {
  res.json({ message: 'Welcome!' });
});

app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Protected content' });
});

app.post('/api/users', (req, res) => {
  const user = req.body;
  res.status(201).json({ id: 1, ...user });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 常见问题

### Q: 中间件的执行顺序是什么？

A: 按定义顺序执行，调用 next() 传递给下一个中间件。

### Q: 如何处理跨域问题？

A: 使用 cors 中间件。

## 参考链接

- [Express Docs](https://expressjs.com/)
- [Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)
