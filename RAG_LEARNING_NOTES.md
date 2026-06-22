# RAG 技术方案学习笔记

本文档记录 RAG（Retrieval-Augmented Generation）项目的探索过程、技术方案演进、以及各方案的优劣权衡。

## 一、核心概念

### 1.1 RAG 是什么

RAG（检索增强生成）是一种结合信息检索与生成模型的技术范式：

```
用户提问 → 检索相关文档 → 构造上下文 → 大模型生成回答
```

核心价值：让大模型能够基于私有/特定知识库回答问题，而不是依赖其训练时的通用知识。

### 1.2 关键组件

| 组件 | 职责 |
|------|------|
| **Embedding 模型** | 将文本转换为语义向量 |
| **向量数据库** | 存储和检索向量 |
| **大语言模型** | 根据上下文生成回答 |

### 1.3 Token 消耗分析

| 操作 | 消耗来源 | 量级估计 |
|------|---------|---------|
| 上传知识库 | Embedding API | N × 50 tokens（N为文档数） |
| 每次问答 | Embedding API + 大模型 | 约 500-3000 tokens |
| 直接传全库 | 大模型 | 10000+ tokens（不可行） |

---

## 二、方案演进

### 2.1 方案一：伪向量（Simple Embedding）

**实现方式**：使用本地哈希算法生成伪向量，不依赖外部 API。

**代码位置**：`server/src/services/chroma.ts`（已废弃）

```typescript
private generateSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const hash = words.reduce((acc, word) => {
    let h = 0;
    for (let i = 0; i < word.length; i++) {
      h = (h * 31 + word.charCodeAt(i)) % 65536;
    }
    return acc + h;
  }, 0);
  // 生成 384 维伪向量...
}
```

**优点**：
- ✅ 无需调用外部 API，无 Token 消耗
- ✅ 完全本地运行，速度快
- ✅ 无网络依赖

**缺点**：
- ❌ 只能做关键词匹配，无法理解语义
- ❌ "React Hooks" 无法匹配 "useState"、"useEffect" 等相关内容
- ❌ 同义词、近义词无法匹配
- ❌ 检索质量差，上下文丢失严重

**适用场景**：
- 快速原型验证
- 纯关键词匹配场景
- 无 API 可用的离线环境

---

### 2.2 方案二：语义向量（Minimax Embedding API）

**实现方式**：调用 Minimax Embedding API 生成真正的语义向量。

**代码位置**：`server/src/services/minimax.ts`

```typescript
async generateEmbedding(text: string): Promise<number[]> {
  const body = JSON.stringify({
    model: 'embo-01',
    texts: [text],
    type: 'query',
    group_id: this.groupId,
  });
  // 调用 Embedding API...
}
```

**优点**：
- ✅ 真正的语义理解
- ✅ "React Hooks" 能匹配到 "useState"、"useEffect" 等相关文档
- ✅ 支持同义词、近义词匹配
- ✅ 检索质量高，上下文相关性强

**缺点**：
- ❌ 上传知识库时消耗 Token（约 8k tokens 上传 36 篇文档）
- ❌ 每次问答时也会消耗少量 Token（约 5 × 50 tokens）
- ❌ 依赖网络连接
- ❌ 有 API 调用延迟

**适用场景**：
- 生产环境
- 需要高质量语义检索的场景
- 可接受一定 Token 消耗的场景

---

### 2.3 方案对比

| 维度 | 方案一：伪向量 | 方案二：语义向量 |
|------|--------------|----------------|
| 语义理解能力 | ❌ 无 | ✅ 有 |
| Token 消耗（上传） | 0 | ~8,400 tokens |
| Token 消耗（问答） | 0 | ~250 tokens（embedding）+ 问答 |
| 检索准确率 | 低（关键词匹配） | 高（语义匹配） |
| 网络依赖 | ❌ 无 | ✅ 需要 |
| 延迟 | 低（纯本地） | 中等（API 调用） |
| 实现复杂度 | 低 | 中等 |

---

### 2.4 方案三：全量上下文（不推荐）

**实现方式**：将整个知识库作为上下文传给大模型。

**为什么不推荐**：
- Token 消耗巨大（168 chunks × 500 tokens ≈ 84,000 tokens/次）
- 超出模型上下文窗口限制（通常 4k-32k tokens）
- 成本极高（每次问答约 ¥0.08）
- 响应速度慢

**结论**：此方案不可行，仅作反面教材。

---

## 三、服务端职责划分

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端页面                              │
│  用户输入 → 发送请求 → 接收响应 → 渲染回答                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        后端服务                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐    │
│  │  路由层     │  │  向量存储    │  │  Minimax API     │    │
│  │  (chat.ts)  │→ │ (chroma.ts) │→ │  (minimax.ts)    │    │
│  └─────────────┘  └─────────────┘  └──────────────────┘    │
│       │                 │                    │               │
│       │ 接收请求         │ 检索相似文档         │ 生成回答       │
│       │ 格式化输出       │ 存储文档向量         │ 生成嵌入向量   │
│       └─────────────────┴────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 各模块职责

#### 路由层（chat.ts）

**职责**：
1. 接收前端 HTTP 请求
2. 解析请求参数（query, useRag）
3. 调用向量检索服务
4. 构造上下文
5. 调用大模型 API
6. 格式化响应数据

**输入**：
```typescript
interface ChatRequest {
  query: string;           // 必传，用户问题
  useRag?: boolean;        // 可选，是否使用RAG检索
  stream?: boolean;        // 可选，是否流式输出
}
```

**输出**：
```typescript
interface ChatResponse {
  success: boolean;
  response: string;
  context: string | null;  // 检索到的上下文
  sources: string[];       // 来源文档列表
}
```

#### 向量存储服务（chroma.ts）

**职责**：
1. 存储文档片段及其向量
2. 提供向量相似度检索
3. 持久化到本地文件
4. 管理文档生命周期

**核心方法**：
- `addDocuments()`: 添加文档并生成向量
- `query()`: 根据语义检索相似文档
- `getCollectionStats()`: 获取统计信息

#### Minimax API 服务（minimax.ts）

**职责**：
1. 封装 Minimax ChatCompletion API
2. 封装 Minimax Embedding API
3. 处理 HTTP 请求和响应
4. 错误处理和重试

**核心方法**：
- `generate()`: 生成回答（非流式）
- `generateStream()`: 生成回答（流式）
- `generateEmbedding()`: 生成语义向量

---

## 四、API 交互格式

### 4.1 后端 ↔ Minimax API

#### Embedding API

**请求**：
```json
{
  "model": "embo-01",
  "texts": ["文本内容"],
  "type": "query",
  "group_id": "你的GROUP_ID"
}
```

**响应**：
```json
{
  "vectors": [[0.123, 0.456, ...]],
  "base_resp": {"status_code": 0, "status_msg": "success"}
}
```

#### ChatCompletion API

**请求**：
```json
{
  "model": "abab6.5-chat",
  "messages": [
    {
      "role": "system",
      "content": "基于以下知识库内容回答问题：\n\n上下文内容\n\n请仅根据上述知识库内容回答..."
    },
    {
      "role": "user",
      "content": "用户问题"
    }
  ],
  "max_tokens": 2048,
  "temperature": 0.7,
  "group_id": "你的GROUP_ID",
  "stream": false
}
```

**响应**：
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "回答内容"
      }
    }
  ]
}
```

### 4.2 前端 ↔ 后端

#### 问答接口（POST /api/chat）

**请求**：
```json
{
  "query": "React Hooks 是什么？",
  "useRag": true,
  "stream": false
}
```

**响应**：
```json
{
  "success": true,
  "response": "React Hooks 是 React 16.8 引入的功能...",
  "context": "来源: 02-React/04-Hooks.md\n...",
  "sources": ["02-React/04-Hooks.md"]
}
```

#### 健康检查（GET /api/health）

**响应**：
```json
{
  "status": "ok",
  "timestamp": 1718947200000
}
```

---

## 五、测试结果

### 5.1 测试环境

- 知识库：36 篇前端技术笔记，168 个文档片段
- 测试问题："React Hooks 是什么？"
- 方案：语义向量（Minimax Embedding API）

### 5.2 测试结果

**上传阶段**：
```
Total directories processed: 7
Total files uploaded: 36/36
Total chunks created: 168
Collection document count: 168
```

**问答阶段**：
```
=== 回答 ===
React Hooks 是 React 16.8 版本引入的一项功能，它允许开发者在函数组件中使用状态和其他 React 特性...

=== 来源 ===
02-React/04-Hooks.md
```

### 5.3 测试结论

| 测试项 | 结果 |
|--------|------|
| 上传成功 | ✅ 36 篇文档全部上传 |
| 向量生成 | ✅ Embedding API 调用成功 |
| 语义检索 | ✅ 检索到相关文档 |
| 回答质量 | ✅ 基于知识库内容回答 |
| 来源追溯 | ✅ 可追溯回答来源 |

### 5.4 预期改进

当前实现仍有改进空间：
1. **检索精度优化**：调整相似性阈值、返回数量
2. **上下文构建优化**：更好地组织上下文内容
3. **错误处理增强**：API 调用失败时的降级策略
4. **性能优化**：批量 Embedding 调用、缓存机制

---

## 六、Trade-off 分析

### 6.1 Token 消耗 vs 检索质量

| 选项 | Token 消耗 | 检索质量 | 结论 |
|------|-----------|---------|------|
| 伪向量 | 低 | 低 | 仅适用于原型 |
| 语义向量 | 中 | 高 | **推荐方案** |
| 全量上下文 | 高 | 高 | 不可行 |

### 6.2 本地运行 vs 云端服务

| 选项 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 本地向量存储 | 无网络依赖、低延迟 | 检索质量依赖本地算法 | 离线环境 |
| 云端向量服务 | 高检索质量、自动扩容 | 网络依赖、费用 | 生产环境 |

### 6.3 上传成本 vs 问答成本

- **上传成本**：一次性，约 8k tokens（36 篇文档）
- **问答成本**：每次约 750-2500 tokens
- **建议**：上传完成后，问答成本可控，适合日常使用

---

## 七、项目维护要点

### 7.1 需要维护的部分

| 维护项 | 说明 |
|--------|------|
| 知识库文档 | 定期更新 `knowledge-docs/` 目录 |
| API Key | 定期轮换，确保不泄露 |
| 向量数据库 | 定期备份 `chroma-db/documents.json` |
| 依赖版本 | 定期更新 npm 依赖 |
| 日志监控 | 监控 API 调用和错误 |

### 7.2 无需维护的部分

| 维护项 | 说明 |
|--------|------|
| Minimax API | 由 Minimax 官方维护 |
| 向量检索算法 | 封装在服务中，无需手动调整 |
| 文档分片逻辑 | 自动处理，无需干预 |

---

## 八、总结

### 核心结论

1. **RAG 是有效的**：通过检索+生成的组合，可以让大模型基于私有知识库回答问题
2. **语义向量是关键**：伪向量只能做关键词匹配，语义向量才能实现真正的语义理解
3. **成本可控**：上传一次性成本约 8k tokens，问答增量成本约 250-2000 tokens
4. **本地存储可行**：使用文件持久化的向量数据库，无需额外部署数据库服务

### 后续改进方向

1. **前端页面开发**：提供友好的用户界面
2. **检索优化**：调整检索参数，提高匹配精度
3. **错误处理**：增强 API 调用的容错能力
4. **性能优化**：批量处理、缓存机制

---

## 九、高级功能

### 9.1 双模式 Embedding 支持

系统支持两种 Embedding 模式，可根据场景选择：

**上传命令**：
```bash
# 默认语义模式（推荐，消耗 Token）
pnpm upload

# 简单模式（不消耗 Token，仅关键词匹配）
pnpm upload:simple

# 语义模式（显式指定）
pnpm upload:semantic
```

**问答接口参数**：
```json
{
  "query": "React Hooks 是什么？",
  "embeddingMode": "semantic"  // "simple" 或 "semantic"
}
```

**两种模式对比**：

| 场景 | 推荐模式 | 原因 |
|------|---------|------|
| 教学演示 | simple | 不消耗 Token，快速启动 |
| 生产环境 | semantic | 语义理解，检索准确 |
| 离线环境 | simple | 无需网络 |
| 高质量问答 | semantic | 支持同义词、相关概念匹配 |

### 9.2 回复质量参数

前端可通过 API 参数控制回复质量：

**参数说明**：

| 参数 | 类型 | 默认值 | 作用 |
|------|------|--------|------|
| `temperature` | number | 0.7 | 温度，越低越确定，越高越随机 |
| `maxTokens` | number | 2048 | 最大输出 Token 数 |
| `topP` | number | 0.9 | 采样概率阈值 |
| `presencePenalty` | number | 0 | 降低重复主题概率 |
| `frequencyPenalty` | number | 0 | 降低重复词语概率 |

**使用示例**：

```json
{
  "query": "解释 React Hooks",
  "temperature": 0.3,    // 更确定的回答
  "maxTokens": 1024,     // 限制回答长度
  "topP": 0.8            // 更聚焦的采样
}
```

**参数调优指南**：

| 场景 | temperature | maxTokens | 说明 |
|------|-------------|-----------|------|
| 技术问答 | 0.3-0.5 | 1024-2048 | 确保准确、简洁 |
| 创意写作 | 0.8-1.0 | 2048-4096 | 允许更多创意 |
| 代码生成 | 0.2-0.4 | 2048-4096 | 确保代码正确性 |

### 9.3 Embedding API 可选参数

Minimax Embedding API 支持以下参数：

**请求参数**：
```json
{
  "model": "embo-01",    // 模型名称
  "texts": ["文本内容"],  // 文本数组
  "type": "query",       // "query" 或 "document"
  "group_id": "..."      // 组织 ID
}
```

**`type` 参数说明**：
- `query`: 用于查询文本的向量化，更关注语义匹配
- `document`: 用于文档文本的向量化，更关注内容完整性

**影响分析**：
- 使用 `query` 类型进行文档向量化：可能更注重查询相关性
- 使用 `document` 类型进行文档向量化：可能更注重文档内容的完整表达
- 当前实现统一使用 `query` 类型，后续可根据需求调整

### 9.4 多轮对话上下文

系统支持多轮对话，前端需维护对话历史：

**请求参数**：
```json
{
  "query": "那 useEffect 呢？",
  "history": [
    {
      "role": "user",
      "content": "React Hooks 是什么？"
    },
    {
      "role": "assistant",
      "content": "React Hooks 是 React 16.8 引入的功能..."
    }
  ],
  "maxHistory": 10  // 最多保留最近 10 轮对话
}
```

**上下文管理策略**：

```
前端维护对话历史 → 每次请求携带 → 后端截取最近 N 轮 → 传入大模型
```

**关键设计**：

| 设计点 | 实现方式 |
|--------|---------|
| 历史存储 | 前端 localStorage 或内存 |
| 历史传递 | 通过 HTTP 请求 body |
| 历史截断 | 后端 `history.slice(-maxHistory)` |
| 最大轮数 | 默认 10 轮，可配置 |

**为什么不在后端存储历史**：
- 无状态设计，便于水平扩展
- 避免会话管理复杂度
- 前端控制更灵活
- 降低后端内存占用

**Token 消耗注意**：
- 每轮对话都会增加 Token 消耗
- 建议限制历史长度（如 5-10 轮）
- 可定期清理历史或开启摘要模式

### 9.5 完整 API 请求示例

```json
{
  "query": "React Hooks 中 useEffect 和 useState 的区别？",
  "useRag": true,
  "stream": false,
  "embeddingMode": "semantic",
  "temperature": 0.5,
  "maxTokens": 2048,
  "topP": 0.9,
  "presencePenalty": 0.1,
  "frequencyPenalty": 0.1,
  "history": [
    { "role": "user", "content": "React Hooks 是什么？" },
    { "role": "assistant", "content": "React Hooks 是..." }
  ],
  "maxHistory": 10
}
```

---

## 十、常见问题

### 10.1 为什么感觉不到上下文？

**原因**：之前的实现确实是一次性问答，没有多轮对话支持。

**解决方案**：现在已支持 `history` 参数，前端需要在每次请求时携带历史记录。

### 10.2 是否需要从头造轮子？

**建议**：
- **核心逻辑（RAG流程）**：自己实现，理解原理
- **向量数据库**：可使用成熟方案（如 Chroma、Pinecone）
- **Embedding**：使用 API，无需自己训练
- **对话管理**：可使用 LangChain 等框架

**当前实现的权衡**：
- ✅ 代码透明，易于理解
- ✅ 无额外依赖，轻量级
- ❌ 功能不如成熟框架丰富
- ❌ 缺少高级优化（如摘要压缩）

### 10.3 何时使用 LangChain？

当需要以下功能时，可以考虑引入 LangChain：
- 复杂的提示词模板
- 多种检索策略
- 对话摘要压缩
- Agent 功能
- 与多种模型集成

---

**文档版本**：v1.1  
**创建日期**：2026-06-22  
**最后更新**：2026-06-22
