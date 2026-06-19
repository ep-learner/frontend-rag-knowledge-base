# React 错误边界与错误处理

## 核心知识点

### 错误边界概述

错误边界（Error Boundary）是一种 React 组件，用于捕获子组件树中的 JavaScript 错误，并显示备用 UI。

### 错误边界特性

1. **只能捕获子组件的错误**：不能捕获自身的错误
2. **只能捕获渲染期间的错误**：不能捕获事件处理函数中的错误
3. **使用生命周期方法**：static getDerivedStateFromError 和 componentDidCatch

### 错误处理策略

| 位置 | 处理方式 |
|------|----------|
| 渲染错误 | Error Boundary |
| 事件处理 | try/catch |
| 异步操作 | catch 块 |

## 代码示例

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong!</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function BuggyComponent() {
  const [count, setCount] = useState(0);

  if (count === 5) {
    throw new Error('Intentional error at count 5');
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
}

function AsyncComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err));
  }, []);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>Data: {data}</div>;
}
```

## 常见问题

### Q: 错误边界能捕获异步错误吗？

A: 不能，需要在异步操作中单独处理。

### Q: 错误边界能捕获事件处理器中的错误吗？

A: 不能，需要使用 try/catch。

## 参考链接

- [React Error Boundary](https://react.dev/reference/react/Component#static-getDerivedStateFromError)
