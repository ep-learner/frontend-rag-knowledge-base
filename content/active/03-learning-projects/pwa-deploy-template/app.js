// PWA 模板入口 - 注册 Service Worker
// 其他业务逻辑写在下面

function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  // SW 只在 https 或 localhost 下注册
  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('[SW] 注册失败（不影响使用）:', err && err.message);
    });
  });
}

// 页面加载完成后注册 SW
registerSW();
