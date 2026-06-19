# React Context 与全局状态管理

## 核心知识点

### Context 概述

Context 提供了一种在组件之间共享数据的方式，无需通过每一层组件传递 props。

### Context API

Context API 包含三个主要部分：

1. **createContext**：创建一个 Context 对象
2. **Provider**：提供数据的组件
3. **Consumer**：消费数据的组件（或 useContext Hook）

### 使用场景

Context 适合共享以下类型的数据：
- 用户认证状态
- 主题（颜色、字体等）
- 语言设置
- 全局配置

## 代码示例

```jsx
const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      style={{
        backgroundColor: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333'
      }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      Toggle Theme
    </button>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (credentials) => {
    setUser({ name: credentials.username });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function UserProfile() {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 常见问题

### Q: Context 和 Redux 的区别是什么？

A: Context 适合简单的全局状态共享，Redux 适合复杂的状态管理场景。

### Q: Context 的性能问题如何优化？

A: 使用 memo 包装消费者组件，或拆分多个 Context 避免不必要的重渲染。

## 参考链接

- [React Context](https://react.dev/reference/react/createContext)
