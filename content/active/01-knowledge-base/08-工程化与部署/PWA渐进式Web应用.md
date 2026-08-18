# PWA 渐进式 Web 应用

> 一句话总结：**PWA = 网页 + manifest.json（APP 元信息）+ Service Worker（离线缓存）+ HTTPS**，让网页获得接近原生 APP 的体验。

## 1. 核心概念

### 1.1 什么是 PWA

Progressive Web App（渐进式 Web 应用）是一种使用 Web 技术构建的应用，能提供类似原生 APP 的体验。

**Google 在 2015 年提出**，核心目标：让网页在移动端获得 APP 级体验，无需用户从应用商店下载。

### 1.2 PWA 三件套（4 件套）

| 组件 | 作用 | 必须？ |
|------|------|--------|
| HTTPS | 安全前提，SW 只能在 https/localhost 下注册 | ✅ 必须 |
| manifest.json | APP 元信息（名称/图标/启动方式/主题色） | ✅ 必须 |
| Service Worker | 离线缓存、请求拦截、推送通知 | ✅ 必须 |
| 图标文件 | 桌面图标（PNG/SVG） | ✅ 必须 |

### 1.3 核心特性

- **可安装**：手机浏览器支持「添加到主屏幕」，获得独立图标和窗口
- **离线可用**：Service Worker 缓存静态资源，断网也能打开
- **响应式**：适配各种屏幕尺寸
- **安全**：HTTPS 提供传输加密
- **可发现**：搜索引擎能索引，无需应用商店分发
- **可更新**：访问时自动获取最新内容

## 2. manifest.json 详解

### 2.1 规范

- **W3C 标准**：[Web App Manifest](https://www.w3.org/TR/appmanifest/)
- **MDN 文档**：[Web App Manifest 字段](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)

### 2.2 关键字段

```json
{
  "name": "完整名称",           // 安装时显示的名称
  "short_name": "简称",        // 主屏图标下显示（≤12 字符）
  "description": "描述",        // APP 描述
  "start_url": "./",           // 启动入口
  "scope": "./",               // SW 作用域
  "display": "standalone",     // 显示模式
  "orientation": "portrait",   // 屏幕方向
  "background_color": "#fff",  // 启动屏背景色
  "theme_color": "#ff6b6b",    // 状态栏主题色
  "icons": [{
    "src": "icon.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"  // maskable = 自适应圆形裁剪
  }]
}
```

### 2.3 display 模式对比

| 模式 | 效果 | 适用场景 |
|------|------|----------|
| `fullscreen` | 完全全屏，无浏览器 UI | 沉浸式应用 |
| `standalone` | 独立窗口，无地址栏 | **推荐**，最像 APP |
| `minimal-ui` | 极简浏览器 UI | 需要地址栏时 |
| `browser` | 普通浏览器标签页 | 默认 |

## 3. Service Worker 详解

### 3.1 什么是 Service Worker

Service Worker 是浏览器在后台运行的脚本，能拦截所有网络请求，实现缓存策略。

**特点**：
- 独立于页面运行（即使页面关闭，SW 仍在）
- 只能在 https 或 localhost 下注册
- 生命周期：install → activate → fetch

### 3.2 缓存策略

| 策略 | 说明 | 适用 |
|------|------|------|
| Cache First | 先缓存，缓存没有再网络 | 静态资源（CSS/JS/图标） |
| Network First | 先网络，失败再缓存 | 需要实时更新的内容 |
| Stale While Revalidate | 先返回缓存，同时后台更新缓存 | **推荐**，兼顾速度和新鲜 |

### 3.3 最小可用 SW 模板

```js
const CACHE_NAME = 'app-v1';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./')))
  );
});
```

## 4. 双端兼容性

### 4.1 浏览器支持矩阵

| 平台 | 浏览器 | 安装到主屏 | 离线可用 | 备注 |
|------|--------|-----------|---------|------|
| Android | Chrome/Edge | ✅ | ✅ | 完整支持 |
| Android | Firefox | ⚠️ | ✅ | 部分支持 |
| iOS 16.4+ | Safari | ✅ | ✅ | 支持 push 和 splash |
| iOS 15-16.3 | Safari | ✅ | ⚠️ | 无 push、有限存储 |
| iOS | Chrome | ❌ | ❌ | 不支持添加到主屏 |
| iOS | 微信浏览器 | ❌ | ❌ | 需跳转 Safari |
| PC | Chrome/Edge | ✅ | ✅ | 安装到桌面 |

### 4.2 iOS 特殊注意事项

- **必须用 Safari**：Chrome 在 iOS 上不支持 PWA 安装
- **apple-touch-icon**：iOS 不支持 SVG 图标，必须提供 PNG
- **存储限制**：iOS Safari 给 PWA 约 5MB 独立存储，不受 ITP 7 天清理影响（因为装到主屏后是独立存储）
- **后台限制**：切后台超过几秒会被系统冻结
- **启动画面**：iOS 16.4+ 支持 splash screen，需配置 `icons` 的 `purpose` 为 `any`

### 4.3 Apple 相关 meta 标签

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="简称" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
```

## 5. PWA vs 其他方案

### 5.1 PWA vs 原生 APP

| 维度 | PWA | 原生 APP |
|------|-----|----------|
| 开发 | HTML/CSS/JS | Swift/Kotlin/Flutter |
| 分发 | 自由分享链接 | App Store/Play Store |
| 审核 | 无 | 有（可能被拒） |
| 安装 | 浏览器「添加到主屏」 | 应用商店下载 |
| 推送 | iOS 16.4+ 支持 | 完整支持 |
| 离线 | SW 缓存 | 完整本地存储 |
| 存储 | ~5MB（iOS）/~10MB（Android） | 无限 |
| 成本 | 免费 | 域名+服务器+开发者账号 |

### 5.2 PWA vs Tauri/Capacitor

| 维度 | PWA | Tauri | Capacitor |
|------|-----|-------|-----------|
| 打包 | 不需要 | 打包成 .exe/.apk | 打包成 .apk/.ipa |
| 系统 API | 有限 | 原生完整 | 原生完整 |
| 更新 | 网页直接更新 | 需重新打包 | 需重新打包 |
| 上架 | 不需要 | 可上架 | 可上架 |
| 复杂度 | 最低 | 中等 | 中等 |

## 6. 部署方案对比

| 方案 | 成本 | 域名 | 适合 |
|------|------|------|------|
| Cloudflare Pages | 免费 | `*.pages.dev`（永久） | **推荐**，纯静态最佳 |
| Vercel | 免费 | `*.vercel.app`（永久） | 同 Pages，另一种选择 |
| Netlify | 免费 | `*.netlify.app`（永久） | 同 Pages |
| GitHub Pages | 免费 | `*.github.io`（永久） | 需要 git 操作 |
| Workers | 免费 | `*.workers.dev` | ❌ 不适合静态，无 PWA |
| 自建服务器 | 付费 | 自有域名 | 需要完全控制 |

## 7. 实战：最小可用 PWA 文件清单

```
my-pwa/
├── index.html              # 主页面（必须引用 manifest）
├── style.css               # 样式
├── app.js                  # 逻辑
├── manifest.json           # PWA 元信息
├── sw.js                   # Service Worker
├── apple-touch-icon.png    # iOS 图标（192x192）
└── icon.svg                # 其他平台图标
```

**最小 index.html 头部**：
```html
<meta name="theme-color" content="#ff6b6b" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="APP名称" />
<link rel="manifest" href="manifest.json" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<link rel="icon" type="image/svg+xml" href="icon.svg" />
```

## 8. 调试技巧

### 8.1 验证 PWA 是否就绪

**Chrome DevTools** → Application 面板：
- **Manifest**：能看到 manifest.json 内容 → ✅
- **Service Workers**：能看到已注册 → ✅
- **Storage**：能看到缓存 → ✅

### 8.2 强制刷新 SW

改 CACHE_NAME（如 `app-v1` → `app-v2`），SW 会自动更新。

### 8.3 本地测试

```bash
cd my-pwa
python -m http.server 8080
# 浏览器打开 http://localhost:8080
```

localhost 下 SW 可以正常注册（不需要 https）。

## 9. 参考链接

- [MDN: Web App Manifest](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)
- [MDN: Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [W3C: Web App Manifest 规范](https://www.w3.org/TR/appmanifest/)
- [web.dev: PWA 学习](https://web.dev/progressive-web-apps/)
- [Can I use: PWAs 浏览器支持](https://caniuse.com/pwa)
