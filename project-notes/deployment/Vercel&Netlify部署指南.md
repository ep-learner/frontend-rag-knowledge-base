# Vercel & Netlify 部署学习笔记

> 记录日期：2026-07-06
> 适用场景：前端项目一键部署、静态站点托管、Serverless 函数

---

## 1. 它们是什么

### Vercel
Next.js 官方团队做的部署平台，主打「前端项目零配置部署」。推代码自动构建部署，自带 CDN、HTTPS、预览部署。

### Netlify
跟 Vercel 类似的静态站点部署平台，比 Vercel 更早出现，功能更全一点（表单处理、Edge Functions、拆分测试等）。

### 它们是 CI/CD 工具吗？

**可以算「简化版 CI/CD + 托管平台」，但不是完整的 CI/CD。**

| 维度 | 传统 CI/CD（GitHub Actions/Jenkins） | Vercel / Netlify |
|------|-------------------------------------|-----------------|
| 可以做什么 | 跑测试、打包、部署、发通知、... 什么都能做 | 主要就是「构建 + 部署」，其他能力有限 |
| 配置复杂度 | 高，要写 yml 脚本 | 低，点几下鼠标搞定 |
| 适用场景 | 复杂项目、多步骤流程 | 前端项目、静态站点、简单全栈 |
| 学习成本 | 高 | 极低 |

**简单说**：如果你的需求只是「push 代码 → 自动部署到公网」，用 Vercel/Netlify 就够了，不用搞复杂的 CI/CD。

---

## 2. 选 Vercel 还是 Netlify？

| 对比项 | Vercel | Netlify |
|--------|--------|---------|
| **最适合** | Next.js 项目 | 各种静态站点（Vue/React/纯静态） |
| **免费额度** | 个人免费，每月 100GB 带宽，6000 次构建 | 个人免费，每月 100GB 带宽，300 分钟构建时间 |
| **部署速度** | 快，有缓存优化 | 也快，略慢一点 |
| **Serverless 函数** | 支持（Node.js/Python/Go 等） | 支持，叫 Netlify Functions |
| **国内访问速度** | 一般（海外节点为主） | 一般（海外节点为主） |
| **自定义域名** | 支持 | 支持 |
| **预览部署** | 每个 PR 自动生成预览链接 | 每个 PR 自动生成预览链接 |
| **适合新手程度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**建议：**
- 如果你用 **Next.js** → 无脑选 Vercel（官方出品，优化最好）
- 如果你用 **Vite + React / Vue / 纯静态** → 两个都可以，先试试 Vercel
- 如果你需要 **国内访问快** → 考虑国内的平台（比如 Vercel 国内版、腾讯云 Webify、阿里云）

---

## 3. Vercel 使用流程

### 3.1 准备工作

- 一个 GitHub 账号
- 你的前端项目代码在 GitHub 仓库里
- 项目是可以正常 `npm run build` 的

### 3.2 三步部署

```
Step 1：登录 Vercel
    │
    └─ 打开 vercel.com
    └─ 用 GitHub 账号登录（一键授权）

Step 2：导入项目
    │
    └─ 点 "Add New" → "Project"
    └─ 选择你的 GitHub 仓库
    └─ 点 "Import"

Step 3：配置 & 部署
    │
    └─ Project Name：随便起一个
    └─ Framework Preset：Vercel 会自动识别（Vite/Next.js/...）
    └─ Root Directory：如果项目在子目录里就填，否则默认
    └─ Build Command：自动识别的一般没问题
    └─ Output Directory：自动识别的一般没问题
    └─ Environment Variables：如果有 .env 里的变量，在这里配
    └─ 点 "Deploy"
```

然后等 1-2 分钟，构建完了会给你一个 `xxx.vercel.app` 的域名，直接就能访问。

### 3.3 后续更新

**以后更新代码不用管 Vercel，直接往 GitHub push 就行。**

```
git push origin main
    │
    ▼
Vercel 自动检测到新提交
    │
    ▼
自动构建 + 部署
    │
    ▼
几分钟后线上就是最新版本了
```

### 3.4 环境变量怎么配

如果你的项目用了 `.env` 文件：

1. Vercel 控制台 → 你的项目 → Settings → Environment Variables
2. 把 `.env` 里的变量一个个加进去（Key + Value）
3. 选择环境（Production / Preview / Development，一般全选）
4. 保存后重新部署一次（Redeploy）才生效

**注意**：`.env` 文件不要提交到 Git，Vercel 上单独配置。

### 3.5 预览部署（Preview Deployments）

Vercel 有个很好用的功能：**你提一个 PR，它自动生成一个预览链接**。

```
你提交 PR → Vercel 自动构建 → 生成 xxx-git-feature-xxx.vercel.app
                                                           │
                                                           ▼
                                                  点进去就能预览效果
                                                  没问题了再合并
```

不需要手动操作，PR 一开自动就有了。

---

## 4. Netlify 使用流程

和 Vercel 几乎一样，简单说一下：

### 4.1 三步部署

```
Step 1：登录 Netlify
    └─ netlify.com
    └─ 用 GitHub 账号登录

Step 2：导入项目
    └─ "Add new site" → "Import an existing project"
    └─ 选 GitHub
    └─ 选你的仓库

Step 3：配置 & 部署
    └─ Branch to deploy：main
    └─ Build command：npm run build
    └─ Publish directory：dist（Vite 项目）
    └─ 点 "Deploy site"
```

完事了，给你一个 `xxx.netlify.app` 的域名。

### 4.2 Netlify 的特色功能

- **Netlify Forms**：静态页面加个表单，自动收数据，不用写后端
- **Netlify Functions**：写 Serverless 函数，相当于简单的后端接口
- **Split Testing**：A/B 测试，分流到不同版本
- **Edge Functions**：边缘计算，在 CDN 节点跑代码

这些功能 Vercel 也有类似的，但 Netlify 的更成熟一点。

---

## 5. 本项目（RAG 知识库）怎么部署

### 5.1 前端部署到 Vercel

这个最简单，直接部署 `client/` 目录：

```
1. 把项目推到 GitHub
2. Vercel 导入仓库
3. Root Directory 填 client
4. Framework Preset 选 Vite
5. Build Command 填 pnpm build（或 npm run build）
6. Output Directory 填 dist
7. 环境变量：
   - VITE_API_BASE_URL：后端地址（部署了后端之后再填）
8. 点 Deploy
```

### 5.2 后端怎么部署

后端是 Express + Node.js，有几种选择：

| 方案 | 难度 | 说明 |
|------|------|------|
| **Vercel Serverless Functions** | ⭐⭐⭐ | 把 Express 改成 Vercel Functions 格式，有点折腾 |
| **Railway / Render** | ⭐⭐ | 一键部署 Node.js 服务，免费额度够用 |
| **云服务器** | ⭐⭐⭐⭐ | 自己搭，灵活但麻烦 |
| **CNB 云开发** | ⭐⭐ | 腾讯云的云原生开发环境，有免费额度 |

**个人项目推荐**：先把前端部署到 Vercel，后端先用本地跑着 + 内网穿透（比如 ngrok / frp）临时用着。等真的需要稳定运行了，再把后端部署到 Railway 之类的平台。

### 5.3 前后端都部署后的配置

```
前端（Vercel）
    │
    └─ 环境变量 VITE_API_BASE_URL = https://你的后端地址
    │
后端（Railway / 服务器）
    │
    └─ 环境变量里配 Minimax API Key 等
    └─ 端口记得开
```

---

## 6. 常见问题

### Q：国内访问 Vercel 慢怎么办？

A：几个选择：
1. 用国内的平台：腾讯云 Webify、阿里云 Flow、又拍云
2. 套 CDN：Cloudflare（免费，但国内也一般）
3. 自己买服务器 + 域名，用 Nginx 部署

### Q：可以用自己的域名吗？

A：可以。Vercel/Netlify 控制台里加自定义域名，然后去域名服务商那里把 DNS 解析指过去。Vercel 会自动配 HTTPS 证书。

### Q：免费额度够用吗？

A：个人项目、学习用，完全够用。100GB 带宽/月，除非你项目特别火，否则用不完。构建时间也够。

### Q：需要备案吗？

A：用 Vercel/Netlify 的话，**不需要备案**，因为服务器在海外。但缺点就是国内访问慢。用国内平台就需要备案。

### Q：数据库怎么办？

A：SQLite 的话，Vercel 不行（Serverless 环境没有持久化文件系统）。要数据库的话：
- 用 Supabase（PostgreSQL，有免费额度）
- 用 PlanetScale（MySQL，有免费额度）
- 自己买服务器装数据库

---

## 7. 实操练习建议

如果你想练手，建议按这个顺序：

```
1. 先拿一个简单的 Vite 项目试试 Vercel 部署（10 分钟搞定）
   └─ 体验一下「push 就自动部署」的感觉

2. 再试试加环境变量、自定义域名
   └─ 了解配置怎么玩

3. 再试试 PR 预览部署
   └─ 感受一下团队协作的流程

4. 最后再考虑后端部署
   └─ 这部分复杂一些，等前端玩明白了再说
```

---

## 8. 相关链接

- Vercel 官网：https://vercel.com/
- Vercel 文档：https://vercel.com/docs
- Netlify 官网：https://www.netlify.com/
- Netlify 文档：https://docs.netlify.com/
