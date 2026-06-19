# TypeScript 编译器配置与优化

## 核心知识点

### tsconfig.json 重要配置

`tsconfig.json` 是 TypeScript 项目的核心配置文件，以下是一些重要配置项：

1. **compilerOptions**：编译器选项
2. **include**：包含的文件
3. **exclude**：排除的文件
4. **files**：指定编译文件

### 编译器选项详解

| 选项 | 说明 | 默认值 |
|------|------|--------|
| target | 输出 JavaScript 版本 | ES3 |
| module | 模块系统 | CommonJS |
| strict | 启用严格模式 | false |
| noImplicitAny | 禁止隐式 any | false |
| noImplicitReturns | 禁止隐式返回 | false |
| sourceMap | 生成 source map | false |
| declaration | 生成 .d.ts 文件 | false |

### 性能优化

大型项目中可以通过以下方式优化编译性能：
- 使用增量编译（incremental）
- 使用缓存（tsbuildinfo）
- 限制编译范围

## 代码示例

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.buildinfo"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

## 常见问题

### Q: 什么是 strict 模式？

A: strict 模式启用了一系列严格的类型检查选项，包括 noImplicitAny、noImplicitThis、strictNullChecks 等。

### Q: 如何处理第三方库缺少类型定义？

A: 使用 `@types/xxx` 包，或在 `src` 目录下创建 `.d.ts` 文件声明类型。

## 参考链接

- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
