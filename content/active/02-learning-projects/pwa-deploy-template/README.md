# 小白教程：3 步把网页变成手机 APP

> 零代码基础、零成本、5 分钟搞定

## 第一步：准备你的网页文件夹

需要 6 个文件：

```
my-app/
├── index.html          ← 你的网页
├── style.css           ← 你的样式
├── app.js              ← 你的脚本
├── manifest.json       ← APP 身份证（告诉浏览器这是个 APP）
├── sw.js               ← 离线缓存脚本
└── apple-touch-icon.png ← APP 图标（192x192）
```

**manifest.json 填什么？**

改 3 个地方就行：

```json
{
  "name": "你的APP名称",       // 改这里
  "short_name": "简称",        // 改这里（主屏显示的短名字）
  "theme_color": "#ff6b6b",   // 改这里（APP 主题色）
  // 下面别动
  "start_url": "./",
  "display": "standalone",
  "icons": [{ "src": "apple-touch-icon.png", "sizes": "192x192", "type": "image/png" }]
}
```

**图标怎么搞？**

1. 打开 [realfavicongenerator.net](https://realfavicongenerator.net/)
2. 选一张图片上传 → 生成 → 下载
3. 把 `apple-touch-icon.png` 放进你的文件夹

## 第二步：部署到 Cloudflare Pages

1. 浏览器打开 [dash.cloudflare.com](https://dash.cloudflare.com)，邮箱注册/登录
2. 点左侧 **「Workers & Pages」**
3. 点 **「Create application」** → 选 **「Pages」**
4. 点 **「Direct Upload」**
5. 把你的文件夹里 **6 个文件全选拖进去**（别拖文件夹本身，拖文件）
6. 点 **「Deploy site」**
7. 30 秒后拿到 `https://xxx.pages.dev` 链接 ✅

> 💡 后续更新：回到 Pages 项目 → **Deployments** → **「Upload assets」** → 重新拖文件。域名不变。

## 第三步：手机安装成 APP

### iPhone（必须用 Safari）

1. Safari 打开你的 `https://xxx.pages.dev/`
2. 点底部分享图标 → 向下滑 → **「添加到主屏幕」**
3. 确认 → 主屏出现 APP 图标 🎉

### Android

1. Chrome 打开你的 `https://xxx.pages.dev/`
2. 点右上 ⋮ → **「添加到主屏幕」** 或 **「安装应用」**
3. 确认 → 主屏出现 APP 图标 🎉

## 常见问题

| 问题 | 解决 |
|------|------|
| iOS 图标不对 | 确认 `apple-touch-icon.png` 已上传 |
| 微信里没提示「添加到主屏」 | 复制链接，用 Safari/Chrome 打开 |
| 打开还是浏览器 | 确认 `manifest.json` 里 `display` 是 `standalone` |
| 部署后更新不生效 | 改 `sw.js` 里的 `CACHE_NAME`（v1→v2） |

## 进阶：文件从哪来？

本项目 `demos/minimal-pwa/` 已经放好了 7 个模板文件，复制一份改改就能用：

- [index.html](demos/minimal-pwa/index.html) — 改标题
- [manifest.json](demos/minimal-pwa/manifest.json) — 改名称和颜色
- [sw.js](demos/minimal-pwa/sw.js) — 不用改（部署时改 CACHE_NAME 版本号）
- [style.css](demos/minimal-pwa/style.css) — 改样式
- [app.js](demos/minimal-pwa/app.js) — 加业务逻辑
- [icon.svg](demos/minimal-pwa/icon.svg) — 用 realfavicongenerator 生成 PNG 版替换
- [apple-touch-icon.png](demos/minimal-pwa/apple-touch-icon.png) — 替换成自定义 192x192 图标

## 想深入了解？

- [PWA 完整学习笔记](../../01-knowledge-base/08-工程化与部署/PWA渐进式Web应用.md)
- [Cloudflare Pages 部署 SKILL](../../../.trae/skills/cloudflare-pages-deploy/SKILL.md)
