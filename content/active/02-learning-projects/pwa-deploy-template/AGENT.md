# PWA 部署模板 - Agent 指南

## 项目概述

PWA 最小可用模板 + Cloudflare Pages 部署教程，目标是让零代码基础的用户也能 3 步把网页变成手机 APP。

## 目录结构

```
pwa-deploy-template/
├── AGENT.md              ← 本文件
├── README.md             ← 小白部署教程
├── manifest.json         ← 学习项目元数据
├── demos/
│   └── minimal-pwa/      ← 6 文件最小 PWA 模板
│       ├── index.html
│       ├── style.css
│       ├── app.js
│       ├── manifest.json
│       ├── sw.js
│       ├── icon.svg
│       └── apple-touch-icon.png
└── notes/                ← 学习笔记（可扩展）
```

## Demo 文件说明

`demos/minimal-pwa/` 包含 6 个 PWA 核心文件，复制即用：

| 文件 | 作用 | 需要改吗 |
|------|------|----------|
| index.html | 页面骨架 | 改标题和 meta |
| manifest.json | APP 身份证 | 改名称、颜色、图标路径 |
| sw.js | 离线缓存 | 部署时改 CACHE_NAME 版本号 |
| style.css | 样式 | 改样式 |
| app.js | 注册 SW | 加业务逻辑 |
| apple-touch-icon.png | iOS 图标 | 替换成自定义图标（192x192） |

## 部署流程

1. 把 `demos/minimal-pwa/` 里的 7 个文件拖到 Cloudflare Pages
2. 访问 `https://xxx.pages.dev` 验证 PWA
3. 手机「添加到主屏幕」变成 APP

## 注意事项

- iOS 必须用 Safari，不支持 Chrome 安装 PWA
- `apple-touch-icon.png` 必须是 PNG，iOS 不支持 SVG 图标
- Service Worker 只在 https 或 localhost 下注册
- 更新部署后改 `CACHE_NAME` 版本号强制刷新缓存
