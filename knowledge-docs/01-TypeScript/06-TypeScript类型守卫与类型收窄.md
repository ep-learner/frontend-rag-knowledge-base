# TypeScript 类型守卫与类型收窄

## 核心知识点

### 类型守卫概述

类型守卫（Type Guard）是一种运行时检查，用于确保在某个范围内类型是符合预期的。TypeScript 支持以下几种类型守卫：

1. **typeof 类型守卫**：检查基本类型
2. **instanceof 类型守卫**：检查对象是否是某个类的实例
3. **in 类型守卫**：检查对象是否包含某个属性
4. **自定义类型守卫**：使用类型谓词（type predicate）

### 类型收窄

类型收窄（Type Narrowing）是指通过类型守卫将联合类型收窄为更具体的类型。

## 代码示例

```typescript
type Shape = Circle | Rectangle;

interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

function getArea(shape: Shape): number {
  if (shape.kind === 'circle') {
    return Math.PI * shape.radius ** 2;
  }
  
  return shape.width * shape.height;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processValue(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase());
  }
}

interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function getPet(): Fish | Bird {
  return Math.random() > 0.5 
    ? { swim: () => console.log('swimming'), layEggs: () => console.log('laying eggs') }
    : { fly: () => console.log('flying'), layEggs: () => console.log('laying eggs') };
}

const pet = getPet();
pet.layEggs();

if ('swim' in pet) {
  pet.swim();
}
```

## 常见问题

### Q: 类型谓词的语法是什么？

A: `value is Type`，其中 value 必须是函数参数的名称。

### Q: 什么时候需要使用类型守卫？

A: 当变量的类型是联合类型，需要根据具体类型执行不同逻辑时。

## 参考链接

- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
