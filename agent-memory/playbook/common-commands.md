# 常用命令速查

> 项目常用命令一览表。不用翻 package.json，来这找。

---

## 1. 启动服务

| 命令 | 在哪运行 | 说明 |
|------|---------|------|
| `.\dev.ps1` | 项目根目录 | **一键启动前后端**（推荐）|
| `pnpm dev` | client/ | 前端开发服务器（Vite，端口 5173）|
| `pnpm dev` | server/ | 后端开发服务器（Express，端口 3000）|

**dev.ps1 会做什么：**
1. 检查依赖，没装就装
2. 新开一个 PowerShell 窗口跑后端
3. 再开一个 PowerShell 窗口跑前端
4. 前后端日志分别在各自窗口

---

## 2. 测试

| 命令 | 在哪运行 | 耗 API Key | 说明 |
|------|---------|-----------|------|
| `pnpm test` | server/ | ❌ 不耗 | **默认**，跑单元测试（mock AI）|
| `pnpm test:unit` | server/ | ❌ 不耗 | 同上，别名 |
| `pnpm test:integration` | server/ | ✅ 真实调用 | 跑集成测试（验证 API 链路）|

**什么时候跑哪个：**
- 改完代码 → `pnpm test`
- 怀疑 API Key 过期了 → `pnpm test:integration`
- CI/CD 流水线 → `pnpm test`

---

## 3. 文档上传

| 命令 | 在哪运行 | 说明 |
|------|---------|------|
| `pnpm upload` | server/ | 语义分块上传（推荐）|
| `pnpm upload:simple` | server/ | 简单分块上传 |

上传前确认 `server/.env` 里的 `KNOWLEDGE_BASE_DIR` 指向正确的文档目录。

---

## 4. 构建

| 命令 | 在哪运行 | 说明 |
|------|---------|------|
| `pnpm build` | client/ | 前端构建，产物在 `dist/` |
| `pnpm build` | server/ | 后端构建 |

---

## 5. Git 常用

| 命令 | 说明 |
|------|------|
| `git status` | 查看修改了哪些文件 |
| `git add 文件名` | 暂存指定文件 |
| `git add -A` | 暂存所有修改 |
| `git commit -m "描述"` | 提交 |
| `git log --oneline -10` | 查看最近 10 条提交 |
| `git push` | 推送到远程 |
| `git pull` | 拉取最新代码 |

---

## 6. 端口 & 地址

| 服务 | 地址 |
|------|------|
| 前端页面 | http://localhost:5173 |
| 后端 API | http://localhost:3000 |
| 健康检查 | http://localhost:3000/api/health |

前端 Vite 已配置代理，`/api` 请求自动转发到后端 3000 端口。

---

## 7. 项目根目录在哪？

```
D:\clawProject\zero_point\frontend-rag-knowledge-base\
```

所有相对路径都是基于这个目录。
