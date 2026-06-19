# API 设计与安全

## 核心知识点

### RESTful API 设计

RESTful API 设计原则：

1. **资源命名**：使用名词而非动词
2. **HTTP 方法**：GET, POST, PUT, DELETE
3. **状态码**：使用标准 HTTP 状态码
4. **版本控制**：在 URL 或 header 中指定版本

### API 安全

API 安全措施：

| 安全措施 | 说明 |
|----------|------|
| JWT | JSON Web Token 认证 |
| OAuth2 | 第三方授权 |
| CORS | 跨域资源共享 |
| Rate Limiting | 请求限流 |

### 错误处理

统一的错误处理机制：
- 统一错误格式
- 详细的错误信息
- 错误日志记录

## 代码示例

```javascript
const jwt = require('jsonwebtoken');

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

app.use('/api/', apiLimiter);

const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: {
      message: err.message,
      code: err.code,
      details: err.details
    }
  });
  
  console.error(err);
});

class AppError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = [];
  }
}

const error = new AppError('User not found', 'USER_NOT_FOUND', 404);
```

## 常见问题

### Q: JWT 和 Session 哪个更好？

A: JWT 无状态，适合分布式系统；Session 需要服务器存储。

### Q: 如何防止 SQL 注入？

A: 使用参数化查询或 ORM 框架。

## 参考链接

- [REST API Design](https://restfulapi.net/)
- [JWT](https://jwt.io/)
