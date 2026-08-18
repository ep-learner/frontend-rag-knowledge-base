# 部署平台能力边界测试：Workers vs Vercel

> 创建：2026-08-19
> 状态：待执行
> 来源：baby-workbench PWA 部署验证后的延伸

## 1. 目标

测试三种部署场景的能力边界，明确「什么该放哪里」：

1. **Cloudflare Pages + Workers**：前端 Pages 托管 + 后端 Workers 无服务器函数
2. **Vercel**：前端 + Serverless Functions 一体化部署
3. **跨域联通**：Pages 前端 → Vercel/Railway 后端的 HTTPS 请求

## 2. 待测试项目

### 2.1 测试项目 A：纯静态 PWA（已知工作）

- 用 `pwa-deploy-template` 部署到 Pages
- 验证：manifest + sw + icon 正常、iOS/Android 可安装
- **状态**：✅ 已验证

### 2.2 测试项目 B：Workers 跑简单 API

- 在 Workers 上实现一个简单 API（返回 JSON、读写 KV）
- 测试：Workers 的限制（CPU 时间、内存、Node.js 子集）
- 产出：Workers 能力边界文档

### 2.3 测试项目 C：Vercel Serverless Functions

- 在 Vercel 上部署一个前端 + Serverless Function
- 测试：Serverless 的冷启动、请求限制、与 Express 的差异
- 产出：Vercel 部署指南

### 2.4 测试项目 D：跨域联通

- Pages 前端 → fetch → Vercel/Railway 后端
- 测试：CORS 配置、混合内容、Cookie/Token 传递
- 产出：跨域部署最佳实践

## 3. 关键决策点

- **RAG 项目后端放哪？** 基于测试结果决定：Vercel Serverless / Railway / 自建
- **前端放 Pages 还是 Vercel？** 两者都免费，看哪个更顺手
- **Workers 能跑 RAG 后端吗？** 大概率不能（需要文件操作、数据库、LLM API 调用），需要验证

## 4. 验收标准

- 每种方案都有「可跑的 demo 链接」
- 有明确的「能力边界对比表」
- 有「RAG 项目推荐部署方案」
