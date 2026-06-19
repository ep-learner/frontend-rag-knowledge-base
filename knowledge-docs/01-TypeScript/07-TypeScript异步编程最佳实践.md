# TypeScript 异步编程最佳实践

## 核心知识点

### 异步编程概述

TypeScript 提供了多种异步编程方式：

1. **Promise**：ES6 引入的异步编程标准
2. **async/await**：基于 Promise 的语法糖
3. **Observable**：RxJS 提供的响应式编程

### async/await 注意事项

使用 async/await 时需要注意：
- async 函数返回的是 Promise
- await 只能在 async 函数内部使用
- 需要处理异常（try/catch）

### Promise 组合

常用的 Promise 组合方法：
- `Promise.all()`：等待所有 Promise 完成
- `Promise.race()`：等待第一个完成的 Promise
- `Promise.allSettled()`：等待所有 Promise 完成（无论成功失败）

## 代码示例

```typescript
interface User {
  id: number;
  name: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
}

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

async function fetchPosts(userId: number): Promise<Post[]> {
  const response = await fetch(`https://api.example.com/posts?userId=${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }
  return response.json();
}

async function getUserWithPosts(userId: number) {
  try {
    const [user, posts] = await Promise.all([
      fetchUser(userId),
      fetchPosts(userId)
    ]);
    
    return {
      ...user,
      posts
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function parallelRequests(urls: string[]) {
  const promises = urls.map(url => fetch(url).then(res => res.json()));
  const results = await Promise.allSettled(promises);
  
  return results.filter(result => result.status === 'fulfilled')
                .map(result => (result as PromiseFulfilledResult<any>).value);
}
```

## 常见问题

### Q: async/await 和 Promise 的性能差异？

A: 两者本质相同，async/await 是语法糖，性能上没有差异。

### Q: 如何取消一个 Promise？

A: Promise 本身不支持取消，可以使用 AbortController 或第三方库如 p-cancelable。

## 参考链接

- [TypeScript Async Await](https://www.typescriptlang.org/docs/handbook/2/functions.html)
