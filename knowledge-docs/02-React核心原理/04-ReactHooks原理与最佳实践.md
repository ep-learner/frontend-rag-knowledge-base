# React Hooks 原理与最佳实践

## 核心知识点

### Hooks 规则

使用 Hooks 必须遵循两个规则：

1. **只在函数组件顶层调用**：不能在循环、条件或嵌套函数中调用
2. **只在 React 函数组件中调用**：不能在普通 JavaScript 函数中调用

### 常用 Hooks

| Hook | 用途 |
|------|------|
| useState | 状态管理 |
| useEffect | 副作用处理 |
| useContext | 上下文访问 |
| useReducer | 复杂状态管理 |
| useCallback | 回调函数缓存 |
| useMemo | 计算结果缓存 |
| useRef | DOM 引用或可变值 |
| useLayoutEffect | 同步副作用 |

### 自定义 Hooks

自定义 Hooks 是复用状态逻辑的方式，以 use 开头命名。

## 代码示例

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

function ExpensiveCalculation({ items }) {
  const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => acc + item.value, 0);
  }, [items]);

  return <div>Total: {expensiveValue}</div>;
}

function Button({ onClick, children }) {
  const memoizedClick = useCallback(onClick, [onClick]);

  return <button onClick={memoizedClick}>{children}</button>;
}
```

## 常见问题

### Q: useCallback 和 useMemo 的区别是什么？

A: useCallback 缓存函数引用，useMemo 缓存计算结果。

### Q: useEffect 和 useLayoutEffect 的区别？

A: useEffect 在浏览器绘制后执行，useLayoutEffect 在浏览器绘制前执行。

## 参考链接

- [React Hooks](https://react.dev/reference/react)
