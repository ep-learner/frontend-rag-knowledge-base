# 双写向量技术架构文档

> 📌 本文档说明了系统中双写向量的实现逻辑、代码位置和重要性
> 相关文档：[项目计划](./PROJECT_PLAN.md) | [使用指南](./USAGE_GUIDE.md) | [README](./README.md)

## 📋 概述

本文档说明了系统中双写向量的实现逻辑、代码位置和重要性，防止后续迭代中被改坏。

## 🎯 核心设计

### 1. 为什么要双写？

**问题**：用户需要在"语义检索"和"快速检索"两种模式之间自由切换。

**解决方案**：在上传文档时，同时生成并存储两份向量：
- `semanticEmbedding`：Minimax API 生成的语义向量
- `simpleEmbedding`：本地哈希算法生成的快速向量

**优势**：
- 用户可以自由选择查询模式
- 不需要重新上传文档来切换模式
- 兼容旧数据和未来扩展

## 🗂️ 代码位置

### 1. 数据结构定义

**文件**：`server/src/services/chroma.ts`（第10-16行）

```typescript
interface DocumentChunk {
  id: string;
  content: string;
  metadata: { source: string; title?: string };
  semanticEmbedding: number[];  // 📌 Minimax API 向量
  simpleEmbedding: number[];    // 📌 本地哈希向量
}
```

### 2. 双写逻辑（写入）

**文件**：`server/src/services/chroma.ts`（第77-115行）

**方法**：`addDocuments()`

**核心代码**：
```typescript
async addDocuments(...) {
  for (let i = 0; i < documents.length; i++) {
    // ✅ 双写：同时生成两种向量
    const semanticEmbedding = await minimaxService.generateEmbedding(documents[i]);
    const simpleEmbedding = this.generateSimpleEmbedding(documents[i]);

    this.documents.set(ids[i], {
      id: ids[i],
      content: documents[i],
      metadata: metadatas[i],
      semanticEmbedding,  // 📌 Minimax API 向量
      simpleEmbedding,    // 📌 本地哈希向量
    });
  }
}
```

**关键点**：
- 第96-98行：**必须同时生成两份向量**，不能省略任何一个
- `semanticEmbedding` 消耗 Minimax API Token
- `simpleEmbedding` 使用本地算法，不消耗 Token

### 3. 查询向量选择逻辑（读取）

**文件**：`server/src/services/chroma.ts`（第117-182行）

**方法**：`query()`

**核心代码**：
```typescript
async query(queryText, nResults, embeddingMode) {
  // 根据 embeddingMode 选择查询向量生成方式
  const queryEmbedding = embeddingMode === 'semantic'
    ? await minimaxService.generateEmbedding(queryText)  // ⚠️ 消耗 Token
    : this.generateSimpleEmbedding(queryText);            // ✅ 不消耗 Token

  // 使用对应的存储向量进行匹配
  for (const [, chunk] of this.documents) {
    const targetEmbedding = embeddingMode === 'semantic'
      ? chunk.semanticEmbedding
      : chunk.simpleEmbedding;

    const distance = this.cosineSimilarity(queryEmbedding, targetEmbedding);
    // ...
  }
}
```

**关键点**：
- 第145-147行：根据 mode 参数选择查询向量的生成方式
- 第157-159行：根据 mode 参数选择使用哪个存储向量
- **两者必须匹配**：查询时使用 semantic 模式，就要用 semanticEmbedding

## ⚠️ 注意事项

### ❌ 禁止的修改

1. **不要删除任何一个向量的生成逻辑**
   - 删除 `semanticEmbedding` → 语义检索无法使用
   - 删除 `simpleEmbedding` → 快速检索无法使用

2. **不要在 query() 中混用向量**
   - 查询时用 semanticEmbedding，存储时用 simpleEmbedding → 结果错误

3. **不要省略其中任何一个向量的存储**
   - 即使是空数组也要存储，保证数据结构一致

### ✅ 正确的修改

1. **添加新的向量类型**
   - 在 `DocumentChunk` 中添加新字段
   - 在 `addDocuments()` 中生成并存储
   - 在 `query()` 中添加新的查询模式分支

2. **修改向量生成算法**
   - 保持接口不变（都是 `number[]`）
   - 确保相同输入生成相同输出（可复现）

3. **修改查询逻辑**
   - 确保查询向量和存储向量使用相同的生成算法
   - 添加充分的单元测试

## 📊 Token 消耗分析

### 语义检索模式

| 阶段 | 是否消耗 Token | 说明 |
|------|--------------|------|
| 上传文档 | ✅ 消耗 | 为每个文档片段生成 semanticEmbedding |
| 查询向量生成 | ✅ 消耗 | 为用户查询生成 semanticEmbedding |
| LLM 回答生成 | ✅ 消耗 | 不可避免，与模式无关 |

### 快速检索模式

| 阶段 | 是否消耗 Token | 说明 |
|------|--------------|------|
| 上传文档 | ❌ 不消耗 | 生成 simpleEmbedding（本地算法） |
| 查询向量生成 | ❌ 不消耗 | 生成 simpleEmbedding（本地算法） |
| LLM 回答生成 | ✅ 消耗 | 不可避免，与模式无关 |

**结论**：
- "快速检索"可以节省 embedding 阶段的 Token
- 但无法节省 LLM 回答生成的 Token
- 适合在 Token 额度紧张时使用

## 🧪 测试建议

### 单元测试

```typescript
// 测试双写逻辑
test('addDocuments should generate both embeddings', async () => {
  const service = new ChromaService();
  await service.addDocuments(
    ['test content'],
    [{ source: 'test.md' }],
    ['test-id']
  );

  const doc = service.documents.get('test-id');
  expect(doc.semanticEmbedding).toBeDefined();
  expect(doc.simpleEmbedding).toBeDefined();
  expect(doc.semanticEmbedding.length).toBe(384);
  expect(doc.simpleEmbedding.length).toBe(384);
});

// 测试查询向量选择
test('query should use correct embedding based on mode', async () => {
  const service = new ChromaService();
  await service.addDocuments(['test content'], [{ source: 'test.md' }], ['test-id']);

  const semanticResults = await service.query('test', 5, 'semantic');
  const simpleResults = await service.query('test', 5, 'simple');

  // 两次查询应该都返回结果（只是相似度可能不同）
  expect(semanticResults.documents.length).toBeGreaterThan(0);
  expect(simpleResults.documents.length).toBeGreaterThan(0);
});
```

## 📝 维护日志

| 日期 | 修改内容 | 修改人 | 原因 |
|------|---------|--------|------|
| 2026-06-22 | 实现双写向量逻辑 | AI | 支持用户自由切换查询模式 |

## 🔗 相关文档

- [项目计划](./PROJECT_PLAN.md)
- [使用指南](./USAGE_GUIDE.md)
- [README 文档](./README.md)
