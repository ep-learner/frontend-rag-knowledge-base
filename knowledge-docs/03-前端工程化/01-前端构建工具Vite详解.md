# 前端构建工具 Vite 详解

## 核心知识点

### Vite 概述

Vite 是新一代前端构建工具，由 Vue.js 作者开发。Vite 的核心特点：

1. **极速冷启动**：利用 ES Modules 原生支持，无需打包
2. **快速热更新**：HMR 基于原生 ESM，更新速度极快
3. **按需编译**：只编译当前需要的模块

### Vite 架构

Vite 分为两个阶段：

1. **开发阶段**：使用原生 ESM 提供服务
2. **生产阶段**：使用 Rollup 进行打包

### Vite 插件系统

Vite 插件基于 Rollup 插件 API，同时支持特定的 Vite 钩子：
- config
- configResolved
- transformIndexHtml
- handleHotUpdate

## 代码示例

```json
{
  "name": "vite-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

## 常见问题

### Q: Vite 和 Webpack 的区别是什么？

A: Vite 使用原生 ESM 开发，开发速度更快；Webpack 需要完整打包。

### Q: Vite 支持哪些框架？

A: 支持 Vue、React、Svelte、Solid 等主流框架。

## 参考链接

- [Vite 官方文档](https://vitejs.dev/)
