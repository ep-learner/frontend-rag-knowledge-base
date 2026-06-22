﻿﻿﻿﻿﻿# TypeScript 类型体操进阶

## 核心知识点

### 类型体操概述

类型体操是指使用 TypeScript 的高级类型特性来进行复杂的类型转换和推导。这是 TypeScript 高级开发中必备的技能，常用于：

- 类型转换
- 条件类型
- 映射类型
- 递归类型

### 条件类型

条件类型允许我们根据类型关系进行分支选择：

```typescript
type IsString<T> = T extends string ? true : false;
```

### 映射类型

映射类型允许我们基于旧类型创建新类型：

```typescript
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Partial<T> = { [P in keyof T]?: T[P] };
```

### 模板字面量类型

TypeScript 4.1+ 引入了模板字面量类型，支持字符串类型的模板操作：

```typescript
type EventName<T extends string> = `${T}Changed`;
type ButtonEvent = EventName<'click'>;
```

## 代码示例

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

type PickByType<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type StringKeys = PickByType<User, string>;

type CapitalizeKeys<T> = {
  [P in keyof T as P extends string ? Capitalize<P> : P]: T[P];
};

type UserWithCapitalKeys = CapitalizeKeys<User>;

type UnwrapArray<T> = T extends (infer U)[] ? U : T;
type NumberArray = number[];
type Unwrapped = UnwrapArray<NumberArray>;
```

## 常见问题

### Q: infer 关键字的作用是什么？

A: infer 用于在条件类型中推断类型，并将其保存为变量供后续使用。

### Q: 递归类型的深度限制是多少？

A: TypeScript 默认递归深度限制为 1000，可以通过编译器选项调整。

## 参考链接

- [TypeScript Advanced Types](https://www.typescriptlang.org/docs/handbook/2/advanced-types.html)
