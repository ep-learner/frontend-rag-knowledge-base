# TypeScript 类型系统深度解析

## 核心知识点

### 类型系统概述

TypeScript 的类型系统是其最核心的特性，它在 JavaScript 运行时之上构建了一层静态类型检查。TypeScript 的类型系统是结构化的（structural typing），而非名义上的（nominal typing），这意味着类型兼容性是基于结构而非名称。

### 类型分类

TypeScript 的类型可以分为以下几类：

1. **基本类型**：string, number, boolean, null, undefined, symbol, bigint
2. **对象类型**：interface, type, class
3. **联合类型**：`type A = B | C`
4. **交叉类型**：`type A = B & C`
5. **泛型**：`<T>` 参数化类型
6. **条件类型**：`T extends U ? X : Y`

### 类型推断

TypeScript 编译器会根据上下文自动推断变量的类型，这大大减少了类型注解的编写工作量。类型推断发生在：

- 变量声明时
- 函数返回值
- 泛型类型参数

## 代码示例

```typescript
interface User {
  name: string;
  age: number;
  email?: string;
}

type Admin = User & {
  role: 'admin';
  permissions: string[];
};

function getUserInfo<T extends User>(user: T): T {
  return user;
}

const user: User = {
  name: '张三',
  age: 28
};

const admin: Admin = {
  name: '李四',
  age: 32,
  role: 'admin',
  permissions: ['read', 'write', 'delete']
};
```

## 常见问题

### Q: 什么时候使用 interface 什么时候使用 type？

A: interface 适合定义对象结构，支持声明合并；type 更灵活，可以定义联合类型、交叉类型、元组等。

### Q: any 和 unknown 的区别是什么？

A: any 会完全绕过类型检查，unknown 是类型安全的 any，需要类型守卫才能使用。

## 参考链接

- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
