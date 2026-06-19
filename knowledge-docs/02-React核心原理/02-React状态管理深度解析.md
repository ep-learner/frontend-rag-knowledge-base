# React 状态管理深度解析

## 核心知识点

### 状态管理概述

React 中的状态管理分为多个层次：

1. **局部状态**：组件内部状态，使用 useState 管理
2. **全局状态**：跨组件共享状态，使用 Context + useReducer 或第三方库
3. **服务端状态**：从 API 获取的数据，通常使用 SWR 或 React Query

### useState 原理

useState 的工作原理：
- 首次渲染时初始化状态
- 每次调用 setState 触发重新渲染
- React 批处理多个 setState 调用

### useReducer 原理

useReducer 适合复杂状态逻辑：
- 将状态更新逻辑集中到 reducer 函数
- 支持多个相关状态的统一管理
- 便于测试和复用

## 代码示例

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('张三');

  const increment = () => {
    setCount(prev => prev + 1);
  };

  const decrement = () => {
    setCount(prev => prev - 1);
  };

  return (
    <div>
      <p>Name: {name}</p>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <input 
        type="text" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
    </div>
  );
}

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error('Unknown action');
  }
}

function ReducerCounter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

## 常见问题

### Q: useState 的更新是同步还是异步？

A: React 18 中，useState 的更新在事件处理函数中是异步的，在 setTimeout 中是同步的。

### Q: 什么时候使用 useReducer 而不是 useState？

A: 当状态逻辑复杂、需要多个相关状态、或状态更新依赖于前一个状态时。

## 参考链接

- [React useState](https://react.dev/reference/react/useState)
- [React useReducer](https://react.dev/reference/react/useReducer)
