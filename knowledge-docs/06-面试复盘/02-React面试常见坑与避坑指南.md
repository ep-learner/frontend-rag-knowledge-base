# React 面试常见坑与避坑指南

## 核心知识点

### Hooks 使用陷阱

React Hooks 的使用有很多规则和陷阱：

1. **Hooks 规则**：只能在函数组件顶层调用
2. **依赖数组**：依赖项遗漏会导致闭包问题
3. **useEffect 清理**：忘记清理会导致内存泄漏

### 状态管理问题

状态管理的常见问题：

| 问题场景 | 说明 |
|----------|------|
| 状态更新时机 | setState 是异步的 |
| 状态依赖 | 需要使用函数式更新 |
| Context 性能 | Context 值变化会触发所有消费者 |

### 性能优化误区

性能优化的常见误区：
- 过度使用 useMemo/useCallback
- 忽略 React.memo 的作用
- 没有正确使用 key

## 代码示例

```jsx
import { useState, useEffect, useCallback, useMemo } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleIncrement = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const doubledCount = useMemo(() => {
    return count * 2;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Doubled: {doubledCount}</p>
      <button onClick={handleIncrement}>Increment</button>
    </div>
  );
}

const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.value}</div>;
});

function App() {
  const [items, setItems] = useState([]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), value: 'New Item' }]);
  };

  return (
    <div>
      <button onClick={addItem}>Add Item</button>
      {items.map(item => (
        <MemoizedComponent key={item.id} data={item} />
      ))}
    </div>
  );
}
```

## 常见问题

### Q: useState 的更新是同步还是异步的？

A: 在事件处理函数中是异步的，在 setTimeout 等异步操作中是同步的。

### Q: useMemo 和 useCallback 的区别是什么？

A: useMemo 缓存值，useCallback 缓存函数引用。

## 参考链接

- [React Docs](https://react.dev/)
- [Hooks Rules](https://react.dev/reference/rules/hooks-rules)
