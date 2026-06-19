# TypeScript 装饰器模式详解

## 核心知识点

### 装饰器概述

装饰器是 TypeScript 中一种特殊的声明，可以附加到类声明、方法、访问器、属性或参数上。装饰器使用 `@expression` 语法，其中 expression 必须求值为一个函数，该函数会在运行时被调用，被装饰的声明信息作为参数传入。

### 装饰器类型

TypeScript 支持五种装饰器：

1. **类装饰器**：应用于类构造函数
2. **方法装饰器**：应用于方法的属性描述符
3. **访问器装饰器**：应用于访问器的属性描述符
4. **属性装饰器**：应用于属性
5. **参数装饰器**：应用于方法参数

### 装饰器执行顺序

装饰器的执行顺序是固定的：
- 参数装饰器 → 方法/访问器/属性装饰器 → 类装饰器

## 代码示例

```typescript
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

function logger(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with arguments: ${args}`);
    const result = originalMethod.apply(this, args);
    console.log(`Result: ${result}`);
    return result;
  };
  
  return descriptor;
}

function propertyDecorator(target: any, propertyKey: string) {
  let value = target[propertyKey];
  
  const getter = () => {
    console.log(`Getting value of ${propertyKey}`);
    return value;
  };
  
  const setter = (newValue: any) => {
    console.log(`Setting ${propertyKey} to ${newValue}`);
    value = newValue;
  };
  
  Object.defineProperty(target, propertyKey, {
    get: getter,
    set: setter,
    enumerable: true,
    configurable: true
  });
}

@sealed
class Greeter {
  @propertyDecorator
  greeting: string;
  
  constructor(greeting: string) {
    this.greeting = greeting;
  }
  
  @logger
  greet(name: string): string {
    return `${this.greeting}, ${name}!`;
  }
}

const greeter = new Greeter('Hello');
greeter.greeting = 'Hi';
console.log(greeter.greet('张三'));
```

## 常见问题

### Q: 装饰器需要什么编译器选项？

A: 需要在 `tsconfig.json` 中设置 `"experimentalDecorators": true` 和 `"emitDecoratorMetadata": true`。

### Q: 装饰器和高阶函数有什么区别？

A: 装饰器是语法糖，本质上也是函数，但提供了更简洁的语法来增强类和方法。

## 参考链接

- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
