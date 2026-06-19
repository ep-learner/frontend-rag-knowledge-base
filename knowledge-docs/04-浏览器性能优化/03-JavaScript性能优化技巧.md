# JavaScript 性能优化技巧

## 核心知识点

### 代码优化

JavaScript 性能优化的目标是减少执行时间和内存使用：

1. **减少 DOM 操作**：批量操作 DOM
2. **使用事件委托**：减少事件监听器数量
3. **避免同步阻塞**：使用异步操作
4. **优化循环**：减少循环内的计算

### 内存管理

内存管理的关键是避免内存泄漏：
- 清除事件监听器
- 释放 DOM 引用
- 避免全局变量
- 使用 WeakMap/WeakSet

### Web Workers

Web Workers 可以在后台线程执行脚本，不阻塞主线程：
- 处理大量计算
- 解析大文件
- 数据处理

## 代码示例

```javascript
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}

document.getElementById('container').appendChild(fragment);

document.addEventListener('click', (event) => {
  if (event.target.matches('.btn')) {
    console.log('Button clicked');
  }
});

const worker = new Worker('worker.js');

worker.postMessage({ type: 'compute', data: largeData });

worker.onmessage = (event) => {
  console.log('Result:', event.data);
};

worker.onerror = (error) => {
  console.error('Worker error:', error);
};

class EventEmitter {
  constructor() {
    this.listeners = new WeakMap();
  }
  
  on(obj, event, handler) {
    if (!this.listeners.has(obj)) {
      this.listeners.set(obj, new Map());
    }
    
    const events = this.listeners.get(obj);
    if (!events.has(event)) {
      events.set(event, []);
    }
    
    events.get(event).push(handler);
  }
}

let timeoutId;

function debounce(func, wait) {
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const debouncedFn = debounce(() => {
  console.log('Debounced');
}, 300);

const throttledFn = throttle(() => {
  console.log('Throttled');
}, 100);
```

## 常见问题

### Q: debounce 和 throttle 的区别是什么？

A: debounce 在最后一次调用后执行，throttle 在指定时间间隔内只执行一次。

### Q: 什么时候使用 Web Workers？

A: 当计算量大、耗时较长时，避免阻塞主线程。

## 参考链接

- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Performance Tips](https://web.dev/javascript-performance/)
