# 前端持续集成与部署 CI/CD

## 核心知识点

### CI/CD 概述

CI/CD 是持续集成和持续部署的缩写，是现代软件开发的核心实践。

1. **CI（持续集成）**：频繁地将代码集成到主干分支
2. **CD（持续部署）**：自动将代码部署到生产环境

### CI/CD 工具

| 工具 | 用途 |
|------|------|
| GitHub Actions | GitHub 内置的 CI/CD |
| GitLab CI/CD | GitLab 内置的 CI/CD |
| Jenkins | 老牌 CI/CD 工具 |
| CircleCI | 云端 CI/CD 服务 |

### 工作流程

典型的 CI/CD 流程：
1. 代码提交到 Git
2. 触发 CI 流水线
3. 安装依赖
4. 运行测试
5. 构建项目
6. 部署到生产环境

## 代码示例

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run lint
      run: npm run lint
      
    - name: Run tests
      run: npm run test
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

```yaml
stages:
  - build
  - test
  - deploy

build_job:
  stage: build
  script:
    - npm ci
    - npm run build

test_job:
  stage: test
  script:
    - npm run test

deploy_job:
  stage: deploy
  only:
    - main
  script:
    - npm run deploy
```

## 常见问题

### Q: CI 和 CD 的区别是什么？

A: CI 关注代码集成和验证，CD 关注自动部署。

### Q: 如何保护敏感信息？

A: 使用环境变量和密钥管理，如 GitHub Secrets。

## 参考链接

- [GitHub Actions](https://docs.github.com/en/actions)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
