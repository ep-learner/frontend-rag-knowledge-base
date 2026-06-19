# 前端代码规范与 ESLint

## 核心知识点

### ESLint 概述

ESLint 是一个可插拔的 JavaScript 代码检查工具，用于识别和报告代码中的问题。

### ESLint 配置

ESLint 使用 `.eslintrc` 文件配置：

1. **extends**：继承预设规则
2. **rules**：自定义规则
3. **parser**：解析器
4. **plugins**：插件

### 常用规则

| 规则 | 说明 |
|------|------|
| no-unused-vars | 禁止未使用的变量 |
| no-console | 禁止 console |
| indent | 缩进规则 |
| quotes | 引号规则 |
| semi | 分号规则 |

## 代码示例

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "@typescript-eslint"
  ],
  "rules": {
    "no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## 常见问题

### Q: ESLint 和 Prettier 怎么配合使用？

A: 使用 eslint-config-prettier 禁用 ESLint 中的格式化规则，使用 eslint-plugin-prettier 将 Prettier 作为 ESLint 规则运行。

### Q: 如何在 IDE 中集成 ESLint？

A: 在 VS Code 中安装 ESLint 插件，启用 auto-fix on save。

## 参考链接

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
