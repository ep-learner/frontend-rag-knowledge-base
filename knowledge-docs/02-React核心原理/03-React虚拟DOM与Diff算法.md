# React 虚拟DOM与Diff算法

## 核心知识点

### 虚拟DOM概述

虚拟 DOM 是 React 的核心概念，它是真实 DOM 的内存表示。虚拟 DOM 的优势：

1. **性能优化**：减少直接操作 DOM 的次数
2. **跨平台**：可以渲染到不同平台（Web、Native）
3. **一致性**：提供统一的编程模型

### Diff算法

React 的 Diff 算法用于比较新旧虚拟 DOM 树，找出最小的更新操作：

1. **同层比较**：只比较同一层级的节点
2. **key优化**：使用 key 标识节点，避免不必要的重新渲染
3. **类型比较**：不同类型的节点直接替换

### Fiber架构

React 16 引入了 Fiber 架构，实现了增量渲染：
- 将渲染工作拆分成小块
- 可以中断和恢复渲染
- 优先处理高优先级任务

## 代码示例

```jsx
function ListComponent({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
];

<ListComponent items={items} />

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

## 常见问题

### Q: 为什么需要 key？

A: key 帮助 React 识别哪些元素改变了、添加了或删除了，提高 Diff 效率。

### Q: 虚拟 DOM 一定比直接操作 DOM 快吗？

A: 不一定。对于简单操作，直接操作 DOM 可能更快；对于复杂应用，虚拟 DOM 的批量更新更高效。

## 参考链接

- [React Reconciliation](https://react.dev/docs/reconciliation)
- [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)
