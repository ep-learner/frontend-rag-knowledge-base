# API 接口文档

> 最后更新：2026-07-06
> 基础路径：`/api`
> 统一返回格式：`{ code: number, data: T | null, message: string }`
> - `code = 0`：成功
> - `code != 0`：失败，message 为错误描述

---

## 一、接口总览

| 模块 | 接口 | 方法 | 核心职责 | 优先级 |
|------|------|------|----------|--------|
| 系统 | `/health` | GET | 健康检查 | 低 |
| **文档** | `/documents/stats` | GET | 获取文档统计数据 | 中 |
| **文档** | `/documents/list` | GET | 获取文档列表 | 高 |
| **文档** | `/documents/content/:source` | GET | 获取单篇文档内容 | 高 |
| **文档** | `/documents/upload` | POST | 上传单篇文档 | 高 |
| **文档** | `/documents/batch-upload` | POST | 批量上传本地目录 | 中 |
| **文档** | `/documents/:id` | DELETE | 删除文档 | 高 |
| **对话** | `/chat` | POST | 普通对话（非流式） | 高 |
| **对话** | `/chat/stream` | GET | 流式对话（SSE） | 高 |
| **对话** | `/chat/logs` | GET | 获取对话日志列表 | 中 |
| **对话** | `/chat/logs/stats` | GET | 获取日志统计数据 | 低 |
| **对话** | `/chat/logs/:id` | GET | 获取单条日志详情 | 中 |

**核心接口（6 个）**：文档列表、文档内容、上传文档、删除文档、普通对话、流式对话

---

## 二、统一返回格式

### 成功响应

```json
{
  "code": 0,
  "data": { ... },
  "message": "ok"
}
```

### 失败响应

```json
{
  "code": 40001,
  "data": null,
  "message": "错误描述"
}
```

### 错误码约定

| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 40001 | 请求参数错误（BAD_REQUEST） |
| 40101 | 未授权（UNAUTHORIZED） |
| 40301 | 无权限（FORBIDDEN） |
| 40401 | 资源不存在（NOT_FOUND） |
| 50001 | 服务端内部错误（INTERNAL_ERROR） |
| 50301 | 服务不可用（SERVICE_UNAVAILABLE） |

---

## 三、文档模块接口

### 3.1 获取文档统计

- **接口**：`GET /api/documents/stats`
- **参数**：无
- **返回 data**：

```json
{
  "totalDocuments": 36,
  "totalChunks": 168,
  "categories": {
    "TypeScript": 8,
    "React核心原理": 8,
    ...
  }
}
```

---

### 3.2 获取文档列表

- **接口**：`GET /api/documents/list`
- **参数**：无
- **返回 data**：

```json
{
  "documents": [
    {
      "source": "01-TypeScript/类型系统.md",
      "title": "TypeScript 类型系统深度解析",
      "chunks": ["chunk-id-1", "chunk-id-2"],
      "chunkCount": 5
    }
  ],
  "totalCount": 36
}
```

---

### 3.3 获取文档内容

- **接口**：`GET /api/documents/content/:source`
- **URL 参数**：
  - `source`：文档来源标识（URL 编码）
- **返回 data**：

```json
{
  "source": "01-TypeScript/类型系统.md",
  "title": "TypeScript 类型系统深度解析",
  "content": "完整的 Markdown 内容...",
  "chunkCount": 5
}
```

- **错误**：40401 - 文档不存在

---

### 3.4 上传单篇文档

- **接口**：`POST /api/documents/upload`
- **Content-Type**：`application/json`
- **请求体**：

```json
{
  "filename": "typescript.md",
  "content": "# TypeScript\n\n内容..."
}
```

- **返回 data**：

```json
{
  "chunks": 3,
  "filename": "typescript.md",
  "title": "TypeScript"
}
```

- **错误**：40001 - content/filename 缺失

---

### 3.5 批量上传本地目录

- **接口**：`POST /api/documents/batch-upload`
- **Content-Type**：`application/json`
- **请求体**：

```json
{
  "directory": "content/active"
}
```

- **返回 data**：

```json
{
  "totalFiles": 36,
  "successCount": 36,
  "results": [
    { "filename": "xxx.md", "chunks": 5, "success": true }
  ]
}
```

- **错误**：
  - 40001 - directory 缺失
  - 40401 - 目录不存在

---

### 3.6 删除文档

- **接口**：`DELETE /api/documents/:id`
- **URL 参数**：
  - `id`：文档 chunk 的 ID（或 source）
- **返回 data**：`null`
- **错误**：50001 - 删除失败

---

## 四、对话模块接口

### 4.1 普通对话

- **接口**：`POST /api/chat`
- **Content-Type**：`application/json`
- **请求体**：

```json
{
  "query": "什么是 TypeScript 的泛型？",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "useRag": true,
  "mode": "semantic",
  "topK": 5
}
```

- **字段说明**：
  - `query`：当前问题（可选，如果传了 messages 可以从最后一条 user 消息取）
  - `messages`：历史对话（可选）
  - `useRag`：是否使用 RAG 检索（默认 true）
  - `mode`：向量检索模式，`semantic`（语义）或 `simple`（快速）
  - `topK`：检索结果数量（默认 5）

- **返回 data**：

```json
{
  "response": "TypeScript 的泛型是...",
  "context": "检索到的上下文...",
  "sources": ["01-TypeScript/泛型.md"],
  "tokenUsage": {
    "inputTokens": 1000,
    "outputTokens": 200,
    "totalTokens": 1200
  }
}
```

- **错误**：
  - 40001 - query/messages 缺失
  - 50001 - 处理失败

---

### 4.2 流式对话（SSE）

- **接口**：`GET /api/chat/stream`
- **参数**（Query String）：
  - `query`：当前问题
  - `messages`：历史对话 JSON 字符串
  - `useRag`：是否使用 RAG（默认 true）
  - `mode`：检索模式
- **响应类型**：`text/event-stream`
- **事件格式**：

```
data: {"content": "Type", "done": false}

data: {"content": "Script", "done": false}

data: {"content": "", "done": true}
```

每个事件是一段增量文本，前端需要拼接起来。最后一个事件 `done: true` 表示结束。

---

### 4.3 获取对话日志列表

- **接口**：`GET /api/chat/logs`
- **Query 参数**：
  - `date`：日期（可选，格式 YYYY-MM-DD）
  - `limit`：返回数量（可选，默认 50）
- **返回 data**：

```json
{
  "logs": [
    {
      "id": "log-id",
      "query": "问题",
      "response": "回答",
      "mode": "semantic",
      "tokenUsage": 1200,
      "processingTime": 2500,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 50
}
```

---

### 4.4 获取日志统计

- **接口**：`GET /api/chat/logs/stats`
- **参数**：无
- **返回 data**：

```json
{
  "stats": {
    "totalRequests": 100,
    "totalTokens": 50000,
    "avgProcessingTime": 2000
  }
}
```

---

### 4.5 获取单条日志详情

- **接口**：`GET /api/chat/logs/:id`
- **URL 参数**：
  - `id`：日志 ID
- **返回 data**：

```json
{
  "log": {
    "id": "log-id",
    "query": "问题",
    "response": "回答",
    "context": "检索上下文",
    "sources": ["xxx.md"],
    "mode": "semantic",
    "tokenUsage": 1200,
    "processingTime": 2500,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "error": null
  }
}
```

- **错误**：40401 - 日志不存在

---

## 五、测试覆盖建议

### 5.1 高优先级（必须覆盖）

| 接口 | 测试用例 |
|------|---------|
| 文档列表 | 返回格式正确、数据结构正确 |
| 文档统计 | 返回格式正确、数字合理 |
| 上传文档 | 正常上传成功、参数缺失返回 40001 |
| 删除文档 | 删除成功、返回格式正确 |
| 普通对话 | 正常对话返回、参数缺失返回 40001 |

### 5.2 中优先级（有空再加）

| 接口 | 测试用例 |
|------|---------|
| 文档内容 | 存在的文档返回正确、不存在的返回 40401 |
| 批量上传 | 正常目录上传成功、目录不存在返回 40401 |
| 日志列表 | 返回格式正确 |
| 单条日志 | 存在的返回正确、不存在的返回 40401 |

### 5.3 低优先级（可选）

- 健康检查
- 日志统计
- 流式对话（需要 SSE 测试，相对复杂）

---

## 六、测试命令说明

### 6.1 命令速查

| 命令 | 测试类型 | 文件匹配 | 消耗 API Key | 推荐使用场景 |
|------|---------|--------|-----------|------------|
| `pnpm test` | 单元测试 | `*.test.ts` | ❌ 不消耗 | 日常开发、CI、改代码后验证 |
| `pnpm test:unit` | 单元测试 | `*.test.ts` | ❌ 不消耗 | 同 `pnpm test`，别名 |
| `pnpm test:integration` | 集成测试 | `*.integration.test.ts` | ✅ 真实调用 | 确认 API Key 有效、验证全链路 |

### 6.2 分层策略

**单元测试（默认）**：
- 使用 Jest mock 替换 `minimaxService`，不真实调用 Minimax API
- 覆盖：参数校验、返回格式、错误处理、接口逻辑
- 特点：快（~3 秒）、零成本、可频繁跑
- 测试文件：`src/__tests__/health.test.ts`、`documents.test.ts`、`chat.test.ts`

**集成测试（手动触发）**：
- 真实调用 Minimax API，走完整链路
- 覆盖：API Key 有效性、端到端对话链路、token 字段一致性
- 特点：慢、耗 token、只在需要时跑
- 测试文件：`src/__tests__/chat.integration.test.ts`

### 6.3 测试数据库隔离

- 单元测试和集成测试都使用**独立的测试数据库**：`chroma-db-test/`
- 每个测试文件 `beforeAll` 创建，`afterAll` 自动删除
- **不会污染**正式的 `chroma-db/` 数据
- 相关代码：`src/__tests__/testHelper.ts`

### 6.4 什么时候跑哪个？

| 场景 | 用哪个命令 |
|------|-----------|
| 改完代码想验证没挂 | `pnpm test` |
| CI/CD 流水线 | `pnpm test` |
| 怀疑 API Key 过期了 | `pnpm test:integration` |
| 改了 minimaxService 逻辑 | 先 `pnpm test`，再 `pnpm test:integration` |
| 改了 chroma 向量检索 | `pnpm test` 够用，必要时跑集成 |

