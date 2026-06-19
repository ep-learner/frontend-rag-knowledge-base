# React 服务端渲染 SSR 与 SSG

## 核心知识点

### SSR 概述

服务端渲染（Server-Side Rendering）是指在服务器端生成 HTML 并发送给客户端。

### SSR 优势

1. **更好的 SEO**：搜索引擎可以直接抓取完整内容
2. **更快的首屏加载**：客户端直接获取渲染好的 HTML
3. **更好的用户体验**：减少白屏时间

### SSG 概述

静态站点生成（Static Site Generation）是指在构建时生成静态 HTML 文件。

### SSR vs SSG

| 特性 | SSR | SSG |
|------|-----|-----|
| 生成时机 | 请求时 | 构建时 |
| 数据更新 | 实时 | 需要重新构建 |
| 适用场景 | 动态内容 | 静态内容 |

## 代码示例

```jsx
import { renderToString } from 'react-dom/server';
import App from './App';

async function handleRequest(req, res) {
  const app = renderToString(<App />);
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR Example</title>
      </head>
      <body>
        <div id="root">${app}</div>
        <script src="/client-bundle.js"></script>
      </body>
    </html>
  `;
  
  res.send(html);
}

import { GetServerSideProps } from 'next';

export async function getServerSideProps(context) {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  
  return {
    props: { data }
  };
}

function Page({ data }) {
  return (
    <div>
      <h1>Server Side Rendered Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Page;

import { GetStaticProps } from 'next';

export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();
  
  return {
    props: { data },
    revalidate: 60
  };
}

function StaticPage({ data }) {
  return (
    <div>
      <h1>Static Site Generated Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default StaticPage;
```

## 常见问题

### Q: SSR 和 CSR 的区别是什么？

A: SSR 在服务端渲染 HTML，CSR 在客户端渲染。

### Q: 什么时候使用 SSG？

A: 当内容相对稳定，不需要实时更新时。

## 参考链接

- [React SSR](https://react.dev/reference/react-dom/server)
- [Next.js SSR](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)
