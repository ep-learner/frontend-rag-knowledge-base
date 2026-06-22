# 沙盒环境踩坑指南

本文档记录沙盒环境中常见的问题及其解决方案，方便后续切换上下文后快速上手。

---

## 1. SSH 连接 GitHub 首次需要确认主机密钥

### 问题

```powershell
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

沙盒环境无法交互式输入 `yes`，导致 SSH 连接失败。

### 解决方案

使用 `-o StrictHostKeyChecking=accept-new` 参数，自动接受新主机密钥：

```powershell
ssh -o StrictHostKeyChecking=accept-new git@github.com -T
```

### 后续操作

首次连接成功后，后续 `git push` 即可正常进行。

---

## 2. PowerShell 中 curl 是 Invoke-WebRequest 的别名

### 问题

```powershell
curl -X POST http://localhost:3000/api/chat
# 报错：无法绑定参数 "Headers"
```

Windows PowerShell 中 `curl` 是 `Invoke-WebRequest` 的别名，参数不兼容。

### 解决方案

**方案一：使用 Invoke-RestMethod（推荐）**

```powershell
$body = @{query="你的问题"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/chat -Method POST -Body $body -ContentType "application/json"
```

**方案二：使用完整路径调用 curl**

如果系统安装了 Git Bash 或其他包含 curl 的环境，可以使用：

```powershell
& "C:\Program Files\Git\bin\curl.exe" -X POST http://localhost:3000/api/chat
```

---

## 3. Git 命令中的 HEREDOC 语法不兼容

### 问题

```powershell
git commit -m "$(cat <<'EOF'
feat: add new feature
- line 1
- line 2
EOF
)"
# 报错：重定向运算符后面缺少文件规范
```

PowerShell 不支持 Bash 的 HEREDOC 语法。

### 解决方案

**方案一：单行消息（推荐）**

```powershell
git commit -m "feat: add new feature with bullet points"
```

**方案二：使用 PowerShell here-string**

```powershell
$message = @"
feat: add new feature

- Feature A
- Feature B
"@
git commit -m $message
```

---

## 4. Git 远程仓库地址格式

### SSH 格式

```powershell
git remote add origin git@github.com:用户名/仓库名.git
git push -u origin main
```

### HTTPS 格式

```powershell
git remote add origin https://github.com/用户名/仓库名.git
git push -u origin main
```

### 修改已有 remote

```powershell
git remote set-url origin git@github.com:用户名/仓库名.git
```

---

## 5. 查看 Git remote 配置

```powershell
git remote -v
```

输出示例：

```
origin  git@github.com:用户名/仓库名.git (fetch)
origin  git@github.com:用户名/仓库名.git (push)
```

---

## 6. 端口占用问题

### 问题

```powershell
Error: listen EADDRINUSE: address already in use :::3000
```

### 解决方案

**查找占用端口的进程**

```powershell
netstat -ano | findstr ":3000"
```

输出示例：

```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
```

**杀掉进程**

```powershell
taskkill /PID 12345 /F
```

---

## 7. pnpm 命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动开发服务器 |
| `pnpm upload` | 上传文档（语义模式） |
| `pnpm upload:simple` | 上传文档（简单模式） |
| `pnpm build` | 构建项目 |

---

## 8. Windows 路径问题

### 路径分隔符

Windows 使用反斜杠 `\` 作为路径分隔符，但 Git 和大多数工具也接受正斜杠 `/`。

### 路径引号

如果路径包含空格，必须用双引号包裹：

```powershell
cd "D:\My Projects\frontend-rag-knowledge-base"
```

### 常用路径操作

```powershell
# 查看当前目录
Get-Location

# 切换目录
cd D:\clawProject\zero_point\frontend-rag-knowledge-base

# 列出文件
Get-ChildItem

# 创建目录
New-Item -ItemType Directory -Path "D:\test"
```

---

## 9. 文件操作

### 读取文件

```powershell
Get-Content D:\path\to\file.txt
```

### 写入文件

```powershell
Set-Content -Path D:\path\to\file.txt -Value "content"
```

### 删除文件

```powershell
Remove-Item D:\path\to\file.txt
```

### 检查文件是否存在

```powershell
Test-Path D:\path\to\file.txt
```

---

## 10. 环境变量

### 查看环境变量

```powershell
$env:变量名
```

### 设置环境变量（仅当前会话）

```powershell
$env:NODE_ENV = "development"
```

### 常见环境变量

| 变量 | 说明 |
|------|------|
| `$env:PATH` | 系统路径 |
| `$env:USERPROFILE` | 用户目录（C:\Users\用户名） |
| `$env:TEMP` | 临时目录 |

---

## 11. 查看命令帮助

```powershell
Get-Help 命令名
Get-Help 命令名 -Examples
```

---

## 总结

| 场景 | 解决方案 |
|------|---------|
| SSH 首次连接 | `ssh -o StrictHostKeyChecking=accept-new git@github.com -T` |
| HTTP 请求 | `Invoke-RestMethod` 替代 `curl` |
| Git 多行提交 | 单行消息 或 PowerShell here-string |
| 端口占用 | `netstat -ano \| findstr ":端口"` + `taskkill /PID xxx /F` |

---

**文档版本**：v1.0  
**创建日期**：2026-06-22
