# React 性能优化策略

## 核心知识点

### 性能优化概述

React 性能优化主要关注两个方面：

1. **减少不必要的重渲染**
2. **优化渲染过程**

### 常用优化方法

| 方法 | 用途 |
|------|------|
| React.memo | 组件级别的记忆化 |
| useMemo | 计算结果缓存 |
| useCallback | 回调函数缓存 |
| Virtual List | 虚拟滚动 |
| Lazy Loading | 组件懒加载 |
| Code Splitting | 代码分割 |

### 性能分析工具

- React DevTools Profiler
- Chrome DevTools Performance
- Lighthouse

## 代码示例

```jsx
const ExpensiveComponent = memo(({ data }) => {
  return <div>{data.map(item => <div key={item.id}>{item.value}</div>)}</div>;
});

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [data] = useState([{ id: 1, value: 'A' }, { id: 2, value: 'B' }]);

  const memoizedData = useMemo(() => {
    return data.filter(item => item.value.length > 0);
  }, [data]);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveComponent data={memoizedData} />
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  const [showLazy, setShowLazy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowLazy(true)}>Load Lazy Component</button>
      {showLazy && (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </Suspense>
      )}
    </div>
  );
}
```

## 常见问题

### Q: React.memo 和 useMemo 的区别？

A: React.memo 缓存组件渲染结果，useMemo 缓存计算值。

### Q: 什么时候需要使用 useMemo？

A: 当计算成本很高且依赖变化不频繁时。

## 参考链接

- [React Performance](https://react.dev/docs/optimizing-performance)
