# React 组件原理与生命周期

## 核心知识点

### 组件概述

React 组件是构建用户界面的独立模块，分为两类：

1. **函数组件**：使用函数定义，通过 Hooks 管理状态
2. **类组件**：使用 ES6 类定义，通过生命周期方法管理状态

### 类组件生命周期

类组件有三个主要生命周期阶段：

1. **挂载阶段**（Mounting）：组件首次渲染
   - constructor → static getDerivedStateFromProps → render → componentDidMount

2. **更新阶段**（Updating）：组件状态或属性变化
   - static getDerivedStateFromProps → shouldComponentUpdate → render → getSnapshotBeforeUpdate → componentDidUpdate

3. **卸载阶段**（Unmounting）：组件从 DOM 移除
   - componentWillUnmount

### 函数组件 Hooks

函数组件使用 Hooks 管理状态和副作用：
- useState：状态管理
- useEffect：副作用处理
- useContext：上下文访问
- useReducer：复杂状态管理

## 代码示例

```jsx
class ClassComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  componentDidMount() {
    console.log('Component mounted');
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('Component updated');
  }

  componentWillUnmount() {
    console.log('Component unmounted');
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment
        </button>
      </div>
    );
  }
}

function FunctionalComponent() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component unmounted');
    };
  }, []);

  useEffect(() => {
    console.log('Count updated:', count);
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## 常见问题

### Q: useEffect 的依赖数组有什么作用？

A: 依赖数组控制 useEffect 的执行时机，空数组只在挂载时执行一次。

### Q: 函数组件和类组件怎么选？

A: 推荐使用函数组件 + Hooks，类组件已不推荐使用。

## 参考链接

- [React Lifecycle](https://react.dev/reference/react/Component)
