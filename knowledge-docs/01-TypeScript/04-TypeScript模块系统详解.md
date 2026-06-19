# TypeScript 模块系统详解

## 核心知识点

### 模块系统概述

TypeScript 支持两种模块系统：

1. **ES Modules**：使用 `import` 和 `export`
2. **CommonJS**：使用 `require` 和 `module.exports`

TypeScript 编译器可以将 ES Modules 转换为 CommonJS、AMD、UMD 等格式。

### 模块解析策略

TypeScript 有两种模块解析策略：

1. **Classic**：默认策略，用于向后兼容
2. **Node**：模拟 Node.js 的模块解析行为

### 路径别名配置

通过 `tsconfig.json` 的 `paths` 配置可以设置路径别名：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## 代码示例

```typescript
// math.ts - 命名导出
export const PI = 3.14159;

export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export interface Calculator {
  add(a: number, b: number): number;
  multiply(a: number, b: number): number;
}

// index.ts - 导入
import { PI, add, multiply } from './math';
import type { Calculator } from './math';

console.log(PI);
console.log(add(2, 3));
console.log(multiply(4, 5));

// 重新导出
export { PI } from './math';

// 默认导出
export default function greeting(name: string): string {
  return `Hello, ${name}!`;
}

// 导入默认导出
import greet from './greeting';
console.log(greet('张三'));
```

## 常见问题

### Q: 模块解析错误 "Cannot find module" 如何解决？

A: 检查 `tsconfig.json` 的 `baseUrl` 和 `paths` 配置，确保路径别名正确。

### Q: 什么时候使用命名导出 vs 默认导出？

A: 命名导出适合多个相关功能，默认导出适合单一功能或组件。

## 参考链接

- [TypeScript Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
