# 启动 PE — 给下一个 Agent 的开场白

> 把下面这段话发给下一个 Agent，同时把 `agent-collaboration/` 这个文件夹拷到目标项目根目录（或放旁边）。

---

## 启动提示词（直接复制粘贴）

```
你好，我想让你帮我把当前项目改造成「人 + Agent 协作」的架构模式。

我给你准备了一份架构指南和两个核心 skill：
- AGENT.md — 改造指南（先读这个，5 分钟读完，搞清楚目标是什么）
- .trae/skills/ — 两个核心 skill（project-init + commit-with-check）

【你的任务】
先做这几步：
1. 读 AGENT.md，搞清楚目标架构是什么样的
2. 分析当前项目的现状（技术栈、目录结构、业务内容）
3. 给出改造方案和步骤（怎么把当前项目迁到这个架构上）
4. 我们一起讨论确认后，再开始动手

【重要】
- 先不要动手改代码，先分析、先出方案
- 方案要贴合当前项目的实际业务，不要硬套
- 有任何问题随时问我

开始吧，先读 AGENT.md，然后告诉我你理解了多少，以及你打算怎么分析当前项目。
```

---

## 给人看的使用说明

### 使用步骤
1. 把整个 `agent-collaboration/` 文件夹拷到目标项目里（或放旁边）
2. 把上面那段启动提示词发给 Agent
3. 同时告诉 Agent `agent-collaboration/` 这个目录的位置
4. 等 Agent 读完，和他讨论改造方案
5. 方案确认后，再让他动手

### 你可能需要补充的信息
- 当前项目的业务是什么？（FaaS？组件库？还是别的？）
- 「原子单元」和「组合单元」在当前项目里分别对应什么？
- 有没有现成的前端入口/管理后台？
- 内容现在存在哪？（数据库？散在代码里？文件里？）

### 最终产出预期
- 一份改造方案（文档）
- 目录结构调整（workspace/ + agent-memory/ + plans/ + .trae/skills/）
- 内容协议定义（DELIVERY_PROTOCOL.md）
- 第一批内容迁移
- Skill 配置（project-init + commit-with-check）

### 目录结构
```
agent-collaboration/
├── PE_START.md          ← 你正在看的
├── AGENT.md             ← ⭐ 给 Agent 的改造指南（核心）
└── .trae/skills/
    ├── project-init/        新对话初始化 skill
    └── commit-with-check/   提交前检查 skill
```
