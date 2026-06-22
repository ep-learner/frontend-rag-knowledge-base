﻿﻿﻿﻿﻿# TypeScript 泛型编程实战

## 核心知识点

### 泛型的本质

泛型（Generics）是 TypeScript 中实现类型复用的核心机制。它允许我们编写可以处理多种类型的组件，同时保持类型安全。泛型的本质是将类型作为参数传递给函数、接口或类。

### 泛型约束

通过 `extends` 关键字可以对泛型参数进行约束，确保传入的类型满足特定条件。

### 泛型默认值

TypeScript 2.3+ 支持为泛型参数设置默认值，当调用时没有提供类型参数时使用默认值。

## 代码示例

```typescript
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength('hello');
logLength([1, 2, 3]);
logLength({ length: 10, value: 'test' });

interface Cache<T = string> {
  get(key: string): T;
  set(key: string, value: T): void;
}

class MemoryCache<T = string> implements Cache<T> {
  private storage: Map<string, T> = new Map();

  get(key: string): T {
    return this.storage.get(key)!;
  }

  set(key: string, value: T): void {
    this.storage.set(key, value);
  }
}

const stringCache = new MemoryCache();
stringCache.set('name', '张三');

const numberCache = new MemoryCache<number>();
numberCache.set('age', 28);
```

## 常见问题

### Q: 泛型类型推断的规则是什么？

A: TypeScript 会根据传入的实参自动推断泛型参数类型，如果无法推断则需要显式指定。

### Q: 泛型和 any 的区别是什么？

A: 泛型保持类型安全，编译时进行类型检查；any 完全放弃类型检查，运行时可能出错。

## 参考链接

- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
