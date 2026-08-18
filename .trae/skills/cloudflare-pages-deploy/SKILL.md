---
name: "cloudflare-pages-deploy"
description: "Deploys static PWA to Cloudflare Pages for free hosting with mobile install support. Invoke when user wants to deploy a static HTML/CSS/JS demo or make it installable as an APP on phone home screen."
---

# Cloudflare Pages 静态部署 & PWA 安装指南

把纯静态页面（HTML/CSS/JS）部署到 Cloudflare Pages，获得公网链接，手机可「添加到主屏幕」变成 APP。

## 适用场景

- 有一个纯静态 HTML/CSS/JS 页面，需要公网链接
- 希望手机上像 APP 一样使用（独立窗口、离线可用）
- 不想花服务器成本、不想买域名

## 前置条件

- Cloudflare 账号（免费，邮箱注册即可）
- 一个包含 `index.html` 的静态目录

## 部署步骤

### 1. 准备 PWA 三件套

在你的静态目录下，确保有以下文件：

| 文件 | 作用 | 必须？ |
|------|------|--------|
| `manifest.json` | APP 元信息（名称/图标/启动方式） | ✅ 必须 |
| `sw.js` | Service Worker（离线缓存） | ✅ 必须 |
| 图标文件（PNG/SVG） | APP 桌面图标 | ✅ 必须 |
| `index.html` 引用 manifest | `<link rel="manifest" href="manifest.json">` | ✅ 必须 |
| `apple-touch-icon.png` | iOS 主屏图标（192x192 PNG） | ⚠️ 推荐，iOS 必需 |

#### manifest.json 最小模板

```json
{
  "name": "APP名称",
  "short_name": "简称",
  "description": "描述",
  "start_url": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#ff6b6b",
  "icons": [
    { "src": "apple-touch-icon.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

#### sw.js 最小模板

```js
const CACHE_NAME = 'app-v1';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(res => {
    if (res && res.status === 200) { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, clone)); }
    return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./'))));
});
```

#### index.html 必须加的 meta

```html
<meta name="theme-color" content="#ff6b6b" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="APP名称" />
<link rel="manifest" href="manifest.json" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<link rel="icon" type="image/svg+xml" href="icon.svg" />
```

### 2. 部署到 Cloudflare Pages

1. 打开 [dash.cloudflare.com](https://dash.cloudflare.com)，登录
2. 左侧菜单 → **Workers & Pages**
3. 点 **「Create application」** → 选 **「Pages」**（不是 Workers！）
4. 选 **「Direct Upload」**
5. 把静态目录里的文件**全选拖进上传框**（拖文件，别拖文件夹）
6. 点 **「Deploy site」**
7. 30 秒后拿到 `*.pages.dev` 格式的链接

### 3. 后续更新

回到 Pages 项目 → **Deployments** 标签 → **「Upload assets」** → 重新拖文件。域名不变，内容更新。

## iPhone 安装步骤

1. **用 Safari**（不是 Chrome）打开 `https://你的域名.pages.dev/`
2. 点底部分享图标（方框+箭头）→ 向下滑 → **「添加到主屏幕」**
3. 确认名称 → 点 **「添加」**
4. 主屏出现 APP 图标，点开全屏运行（无地址栏）

## Android 安装步骤

1. 用 Chrome 打开 `https://你的域名.pages.dev/`
2. 点右上 ⋮ 菜单 → **「添加到主屏幕」** 或 **「安装应用」**
3. 确认 → 主屏出现 APP 图标

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| manifest.json 404 | 没上传这个文件 | 确认文件已上传 |
| iOS 图标是截图不是自定义 | 没配 apple-touch-icon.png | 加 192x192 PNG 图标 |
| iOS 点了没「添加到主屏幕」 | 用了 Chrome 不是 Safari | 换 Safari |
| SW 注册失败 | 不是 https 或 localhost | Pages 自动 https，没问题 |
| 中文乱码 | Workers 不支持 UTF-8 | 改用 Pages |
| 部署后更新不生效 | SW 缓存 | 改 CACHE_NAME 版本号强制刷新 |
| 微信里打开没提示「添加到主屏」 | 微信浏览器不支持 | 复制链接用系统浏览器打开 |

## PWA vs 原生 APP

| 维度 | PWA | 原生 APP |
|------|-----|----------|
| 开发成本 | 极低（写网页就行） | 高（Swift/Kotlin/跨平台框架） |
| 分发 | 零审核，自己控制 | App Store/Play Store 审核 |
| 安装方式 | 浏览器「添加到主屏」 | 应用商店下载 |
| 离线可用 | ✅（Service Worker 缓存） | ✅ |
| 推送通知 | ⚠️ iOS 受限 | ✅ 完整 |
| 存储 | localStorage ~5MB（iOS 14 天清理） | 无限 |
| 系统 API | 有限 | 完整 |
| 成本 | 免费（Cloudflare Pages） | 域名+服务器+开发者账号 |

## 参考资源

- [W3C Web App Manifest 规范](https://developer.mozilla.org/zh-CN/docs/Web/Manifest)
- [MDN Service Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
