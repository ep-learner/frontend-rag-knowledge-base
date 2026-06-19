# TypeScript 面试常见坑与避坑指南

## 核心知识点

### 类型推断陷阱

TypeScript 的类型推断有时会产生意外结果：

1. **字面量类型收窄**：const 声明的变量会推断为字面量类型
2. **any 的传染性**：any 类型会污染整个类型推断链
3. **联合类型的窄化**：需要使用类型守卫来正确窄化类型

### 类型兼容性问题

TypeScript 的结构类型系统可能导致兼容性问题：

| 问题场景 | 说明 |
|----------|------|
| 对象赋值 | 多余属性检查只在直接赋值时生效 |
| 函数参数 | 逆变与协变的处理 |
| 泛型约束 | 类型参数的约束不够严格 |

### 高级类型易错点

高级类型的使用容易出错：
- 交叉类型 vs 联合类型
- 条件类型的 distributive 特性
- infer 的正确使用

## 代码示例

```typescript
const name = 'Alice';
type NameType = typeof name;

function greet(name: NameType) {
  console.log(`Hello, ${name}`);
}

greet('Alice');
greet('Bob');

function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

class Animal {
  eat() { }
}

class Dog extends Animal {
  bark() { }
}

function feed(animal: Animal) {
  animal.eat();
}

const dog = new Dog();
feed(dog);

interface Shape {
  type: 'circle' | 'rectangle';
}

interface Circle extends Shape {
  type: 'circle';
  radius: number;
}

interface Rectangle extends Shape {
  type: 'rectangle';
  width: number;
  height: number;
}

function getArea(shape: Circle | Rectangle): number {
  if (shape.type === 'circle') {
    return Math.PI * shape.radius ** 2;
  }
  return shape.width * shape.height;
}

type NonNullable<T> = T extends null | undefined ? never : T;

type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

type StringArray = string[];
type StringType = ExtractArrayType<StringArray>;
```

## 常见问题

### Q: TypeScript 中 typeof 和 instanceof 的区别是什么？

A: typeof 用于基本类型检查，instanceof 用于对象类型检查。

### Q: 什么是类型收窄？

A: 通过条件判断缩小变量的类型范围。

## 参考链接

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
