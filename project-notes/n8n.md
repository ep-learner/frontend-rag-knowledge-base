# n8n 学习笔记

> 项目地址：https://github.com/n8n-io/n8n
> 记录日期：2026-06-25
> 项目类型：工作流编排 / 自动化平台

---

## 1. 一句话总结

n8n 是一个**自托管的可视化工作流编排引擎**，核心是用**有向图执行模型 + 节点插件机制**，把各种外部 API、内部服务、AI 模型串成一条可执行的流水线。对研发来说，它的**节点抽象模型**和**工作流执行引擎**在 AI Agent 编排、多工具调用、任务流自动化场景有很高的借鉴价值；同时它本身也可以直接部署了当自动化工具用。

---

## 2. 研发视角的价值判断

### 2.1 它解决了什么技术问题

**本质上解决的是「多系统协同的胶水代码泛滥」问题：**

- 业务流程跨多个系统时，每个集成都要写一堆请求、鉴权、错误处理、数据转换的胶水代码
- 这些代码散落在各处，没有统一的编排和可视化，难以维护和调试
- 流程变了就得改代码、发版，响应慢
- 非研发人员没法自己搭流程，什么都找开发

**n8n 的技术解法：**
1. 把每个外部能力抽象成**统一接口的节点**（输入 → 处理 → 输出）
2. 用**有向图**描述流程，节点之间通过标准化的数据结构传递
3. 提供**可视化编辑器**，拖拽连线代替写胶水代码
4. 节点插件化，新增集成不用改核心引擎

### 2.2 对研发的价值

| 维度 | 价值大小 | 说明 |
|------|----------|------|
| 直接拿来用 | **高** | 部署一个就能用，日常工作流自动化（发版通知、数据同步、监控告警）都能搞定，省得自己写脚本 |
| 架构借鉴 | **高** | 节点插件化设计、有向图执行引擎、数据流模型，这一套在 AI Agent 编排、工具调用链、数据处理流水线场景完全可以复用 |
| AI Agent 相关 | **高** | n8n 本身就在往 AI Agent 方向走（AI Agent 节点、LangChain 集成），它的「工具=节点」「Agent=工作流节点」的抽象思路很有启发 |
| 二开成本 | **中** | 写自定义节点很简单（实现一个 execute 方法），但改核心引擎需要理解它的 Monorepo 和执行模型，有一定学习成本 |
| 实用价值总评 | **高** | 既可以直接当工具用，也可以当架构参考，对全栈研发来说投入产出比不错 |

### 2.3 最值得借鉴的 3 个设计点

1. **节点的统一抽象模型**：不管是发邮件、调 API、查数据库、跑 AI，全部封装成「输入 items → execute() → 输出 items」的统一接口。这个抽象是整个系统的基石，新增能力完全不用改核心。

2. **基于有向图的工作流执行引擎**：用拓扑排序确定执行顺序，用 `items` 数组做数据传递，支持分支、合并、循环。这套模型不只是给 SaaS 集成用，AI Agent 的工具调用链、任务编排也能直接套用。

3. **「配置驱动 UI」的节点参数系统**：节点的配置表单不是写死的 UI 代码，而是通过节点描述里的 `properties` 定义动态生成的。新增一个节点只要写一份参数定义，前后端都能用，扩展性极强。

---

## 3. 核心架构 & 数据流

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Editor UI (Vue.js)                        │
│  画布渲染 / 节点拖拽 / 连线 / 属性面板 / 执行面板              │
│  （节点参数表单由节点描述动态生成，不用写 UI 代码）            │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API + WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                    API / 调度层                               │
│  工作流 CRUD / 触发调度 / 执行管理 / 凭证加密存储             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              Workflow Engine（核心执行引擎）                  │
│                                                               │
│  1. 解析 workflow JSON（nodes + connections）                 │
│  2. 拓扑排序，确定节点执行顺序                                │
│  3. 逐个执行节点，传递 items 数据                             │
│  4. 处理分支/合并/循环/错误重试                               │
│                                                               │
│  核心包：n8n-workflow                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │ 节点注册表（Node Registry）
┌──────────────────────────▼──────────────────────────────────┐
│              节点插件层（1000+ 节点）                         │
│                                                               │
│  触发器节点：Webhook / Schedule / Form / Manual               │
│  动作节点：HTTP Request / Gmail / Slack / Database ...        │
│  逻辑节点：IF / Switch / Merge / Filter / Loop                │
│  AI 节点：OpenAI / Anthropic / AI Agent / Vector Store        │
│                                                               │
│  每个节点实现统一的 execute() 接口，输入输出都是 items 数组     │
└──────────────────────────┬──────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   外部 SaaS / API                 数据库 / 存储
  (Gmail / Slack / ...)         (PostgreSQL / SQLite)
```

### 3.2 核心模块职责

| 模块 | 所在包 | 职责 |
|------|--------|------|
| 工作流执行引擎 | `n8n-workflow` | 核心中的核心。解析工作流定义、拓扑排序、节点执行调度、数据流转 |
| 节点注册表 | `n8n-workflow` | 管理所有节点类型的注册、查找、实例化 |
| 节点描述系统 | `n8n-workflow` | 定义节点的参数结构（驱动 UI 表单生成 + 参数校验） |
| API 服务 | `n8n` / `@n8n/api` | Express/NestJS 服务，提供工作流 CRUD、执行管理等 REST API |
| 前端编辑器 | `editor-ui` | Vue.js 实现的可视化画布，节点拖拽、连线、属性面板 |
| 凭证管理 | `@n8n/db` | 加密存储各种 API Key、OAuth Token |
| 任务调度 | `@n8n/task-runner` | 生产级部署用，BullMQ + Redis，多 Worker 水平扩展 |

### 3.3 关键数据流

**一个典型工作流的执行过程：**

```
外部触发（HTTP 请求 / 定时 / 手动点击）
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 触发器节点（Trigger Node）                           │
│ - 接收事件数据                                        │
│ - 包装成初始 items 数组                               │
│   items = [{ json: { eventData: ... } }]             │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ 节点 A（比如 HTTP Request）                           │
│                                                       │
│  输入：items 数组（来自上一个节点）                    │
│  处理：                                                │
│   1. 从参数配置里读取 URL / Method / Headers          │
│   2. 参数里可以用表达式引用 items 里的数据             │
│   3. 发起 HTTP 请求                                    │
│   4. 把响应数据塞进每个 item 的 json 里               │
│                                                       │
│  输出：新的 items 数组（每个 item 包含响应数据）       │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│ 节点 B（比如 IF 条件判断）                             │
│ - 读取 items 里的某个字段                             │
│ - 根据条件走 true 分支或 false 分支                    │
│ - 输出到不同的下游节点                                 │
└───────────┬──────────────────────┬──────────────────┘
            │ true                 │ false
            ▼                      ▼
      [节点 C：发邮件]        [节点 D：写数据库]
```

**核心数据结构 —— items 数组：**

```typescript
// 节点之间传递的标准数据格式
interface IDataItem {
  json: Record<string, any>;    // 结构化数据，节点主要操作这个
  binary?: Record<string, any>; // 二进制数据（文件、图片等）
  pairedItem?: number;          // 用于关联原始 item
}

// 每个节点的输入输出都是 IDataItem[][]
// 第一维是"输入端口"，第二维是该端口的 items 列表
type NodeInputOutput = IDataItem[][];
```

**为什么用数组而不是单个对象？**
- 支持批量处理：一个节点可以一次处理多条数据（比如查数据库返回 100 条，下游节点逐条处理）
- 支持 Map/Reduce 模式：上游拆分成多条，下游再合并

### 3.4 不同 SaaS 服务怎么抽象成统一节点？

这是 n8n 最核心的设计问题，它的解法是**「节点描述 + execute 方法」的契约**：

```typescript
interface INodeType {
  // 描述部分：告诉系统这个节点长什么样、有什么参数
  description: {
    name: string;           // 唯一标识，比如 'n8n-nodes-base.httpRequest'
    displayName: string;    // 显示名，比如 'HTTP Request'
    icon: string;           // 图标
    group: string[];        // 分组（用于左侧面板分类）
    inputs: string[];       // 输入端口，比如 ['main']
    outputs: string[];      // 输出端口，比如 ['main']
    
    // 关键：参数定义，前端根据这个动态生成配置表单
    properties: Array<{
      displayName: string;
      name: string;
      type: 'string' | 'number' | 'options' | 'collection' | ...;
      default: any;
      required?: boolean;
      options?: Array<{ name: string; value: any }>;
      // ... 还有很多控制 UI 显示的属性
    }>;
  };

  // 执行部分：这个节点实际做什么
  execute(this: IExecuteFunctions): Promise<IDataItem[][]>;
}
```

**这个抽象的好处：**
1. **统一的数据模型**：不管什么 SaaS，输入输出都是 items 数组，节点之间不用关心对方是什么
2. **统一的配置体验**：所有节点的配置表单都是一套 UI 组件动态生成的
3. **完全解耦**：新增一个节点不需要改引擎代码，只要注册进去就行
4. **可组合**：节点可以任意串起来，形成复杂流程

**代价/挑战：**
- 每个 SaaS 的鉴权方式不一样（OAuth / API Key / JWT ...），需要一套凭证管理系统来抽象
- 数据格式差异大，需要表达式引擎做字段映射和转换
- 错误处理方式不统一，需要约定错误码和重试策略

---

## 4. Quick Start & 运行效果

### 4.1 最简启动方式

```bash
# 方式一：npx（最快，推荐体验用）
npx n8n

# 方式二：Docker（推荐自托管）
docker run -it --rm -p 5678:5678 n8nio/n8n
```

### 4.2 启动后提供什么服务

- **端口**：5678
- **Web 界面**：http://localhost:5678 — 可视化工作流编辑器
- **REST API**：http://localhost:5678/api — 工作流 CRUD、执行管理等
- **Webhook 端点**：http://localhost:5678/webhook/{id} — 接收外部事件触发工作流
- **定时调度**：内置，Cron 表达式触发工作流

### 4.3 用户视角能做什么

核心就是**搭工作流**：
1. 从左侧面板拖节点到画布
2. 连线把节点串起来
3. 点击节点，右侧面板配置参数（URL、API Key、条件表达式等）
4. 点「Execute」执行，看每个节点的输入输出数据
5. 调试没问题就「Activate」，让它正式跑起来（定时触发或 Webhook 触发）

---

## 5. 扩展性分析

### 5.1 扩展方式

| 扩展方式 | 难度 | 说明 |
|----------|------|------|
| 配置化使用 | 低 | 用现成节点，拖拖拽拽拼工作流，不用写代码 |
| 自定义节点开发 | 中 | 实现 INodeType 接口，写一个 execute 方法，打包成 npm 包安装 |
| 自定义 App | 中高 | 一整套 SaaS 集成（含多个节点 + 鉴权方式），有脚手架工具 |
| 核心引擎二开 | 高 | 改执行引擎、前端编辑器，需要理解整个 Monorepo 架构 |

### 5.2 推荐使用方式

**n8n 是「应用 + 框架」二合一的项目，两种用法都可以：**

**用法一：直接拿来当工具用（推荐优先尝试）**
- 适用场景：团队内部的自动化需求（发版通知、数据同步、监控告警、AI 工作流）
- 成本：部署 + 配置，几乎不用写代码
- 好处：开箱即用，省得自己造轮子

**用法二：当工作流引擎框架做二开**
- 适用场景：你要做的产品本身需要可视化工作流能力（比如 AI Agent 平台、数据处理平台）
- 成本：需要理解核心引擎，可能要改前端编辑器
- 好处：站在成熟项目的基础上，不用从零实现工作流引擎

**对全栈研发的建议：**
- 先直接用起来，感受一下它的节点模型和编排思路
- 如果你的项目需要工作流/Agent 编排能力，再考虑基于它二开，或者借鉴它的设计自己实现一个更轻量的版本

### 5.3 节点 vs HTTP Request 节点：什么时候需要专用节点？

n8n 自带一个**通用的 HTTP Request 节点**，理论上任何 HTTP API 都能调。那为什么还要开发专用节点？

#### 直接调 API（HTTP Request 节点）的场景

| 场景 | 举例 | 代价 |
|------|------|------|
| 一次性 / 实验性调用 | 临时调某个 API 测试一下 | 配置一次可以接受 |
| API 足够简单 | 只传 URL 和 Body | 配置成本可接受 |
| 没有认证复杂度 | 无认证 / Basic Auth | 手动配 token 可以接受 |

**HTTP Request 节点每次都要手动配的：**
- URL、Method、Path 参数
- Headers（Authorization、Content-Type...）
- Body 结构（嵌套 JSON 要手写）
- 认证方式（API Key / OAuth2 / JWT...每次都要配）
- 返回数据的解析逻辑（字段映射）
- 错误处理（判断 status code、做重试...）

#### 专用节点的价值

| 价值点 | 说明 |
|--------|------|
| **认证封装** | OAuth2 的授权跳转、Token 刷新不用每次配，节点内置好了 |
| **参数可视化** | 飞书文档只填链接，不用手写 JSON；GitHub PR 只选仓库，不用配 API 路径 |
| **输出标准化** | 不管飞书 API 返回什么乱七八糟的字段，节点统一输出 `{content, title, url}` |
| **错误处理** | 节点开发者已经处理了常见错误码、限流、重试等 |
| **降低门槛** | 非研发人员也能用，不然每次都要找开发配 HTTP 请求 |

**所以：简单场景用 HTTP Request 节点省事；高频、复杂、认证繁琐的场景用专用节点。**

### 5.4 与扣子（Coze）的组合使用

n8n 和扣子不是非此即彼的关系，可以**扬长避短组合使用**：

| 能力 | n8n 擅长 | 扣子擅长 |
|------|----------|----------|
| 传统自动化 | ✅ 定时任务、Webhook、系统集成 | ❌ 不是它的重点 |
| 可视化编排 | ✅ 拖拽连线，开箱即用 | ✅ 也支持，但更偏 AI |
| AI 能力 | 需要自己搭节点 | ✅ 内置 RAG、知识库、多模态 |
| 数据控制 | ✅ 完全自托管 | ❌ 数据在字节服务器 |
| 成本 | 零软件费，自建服务器 | 按 Token 计费 |

#### 组合模式：n8n 做编排层 + 扣子做 AI 计算层

```
┌─────────────────────────────────────────┐
│  n8n（你部署，自托管）                    │
│                                          │
│  [定时触发] → [查询飞书文档] → [构造问题] │
│                     ↓                    │
│              HTTP Request 节点            │
│                     ↓                    │
│         POST api.coze.cn/workflow/run    │
│                     ↓                    │
│         [处理结果] → [发送邮件]           │
└─────────────────────────────────────────┘
                   ↓ 公网调用
┌─────────────────────────────────────────┐
│  扣子云（字节托管）                       │
│                                          │
│  执行 AI RAG 工作流，返回答案             │
└─────────────────────────────────────────┘
```

**这种组合的价值：**
- n8n 负责「控制流」：定时、串流程、错误处理、发通知
- 扣子负责「AI 计算」：RAG 问答、知识库检索
- 各取所长，组合成本比单纯用某一个更低

**注意：**
- 数据会经过扣子服务器，敏感数据要注意
- 跨公网有延迟，高频调用要考虑 QPS 限制

---

## 6. 最简 Demo 设计（可选）

### 6.1 Demo 成本评估

- **成本判断**：中高
- **判断理由**：可视化画布部分用 react-flow 可以快速搞定，但工作流执行引擎 + 节点抽象体系需要一定代码量。完整可运行的 Demo 估计要 2-3 小时。
- **当前策略**：先给出伪代码和项目结构，如果需要实际可运行的代码再说。

### 6.2 设计目标

**保留**：
- 可视化画布（节点拖拽、连线）
- 工作流执行引擎（拓扑排序 + 逐节点执行）
- 节点统一接口（execute 方法 + items 数据结构）
- 3 个基础节点（触发、HTTP 请求、日志输出）
- 执行结果展示

**去掉**：
- 各种应用节点（只留 HTTP Request 一个通用节点）
- 凭证管理、用户系统
- 数据库持久化（内存存储）
- 定时触发、Webhook 触发（只留手动触发）
- 表达式引擎（简化为直接读参数）
- 错误处理、重试、分支合并
- 子工作流

### 6.3 项目结构

```
n8n-mini-demo/
├── client/                      # 前端编辑器
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowCanvas.tsx   # 画布（基于 react-flow）
│   │   │   ├── NodePanel.tsx    # 左侧节点面板
│   │   │   └── PropertyPanel.tsx # 右侧属性面板
│   │   ├── store/workflow.ts    # 工作流状态
│   │   ├── types/workflow.ts    # 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                      # 后端执行引擎
│   ├── src/
│   │   ├── engine/
│   │   │   ├── WorkflowExecutor.ts  # 工作流执行器
│   │   │   └── NodeRegistry.ts      # 节点注册表
│   │   ├── nodes/
│   │   │   ├── ManualTrigger.ts     # 手动触发
│   │   │   ├── HttpRequest.ts       # HTTP 请求
│   │   │   └── Log.ts               # 日志输出
│   │   ├── types/
│   │   │   └── workflow.ts          # 类型定义
│   │   ├── routes/execute.ts        # 执行 API
│   │   └── app.ts
│   └── package.json
│
└── README.md
```

### 6.4 核心模块伪代码

#### 类型定义

```typescript
// 工作流定义
interface Workflow {
  nodes: WorkflowNode[];
  connections: Record<string, string[]>; // fromNodeId -> [toNodeId, ...]
}

interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  params: Record<string, any>;
}

// 数据项
interface DataItem {
  json: Record<string, any>;
}
```

#### 节点接口

```typescript
interface NodeType {
  name: string;
  displayName: string;
  group: 'trigger' | 'action' | 'output';
  
  execute(params: Record<string, any>, inputItems: DataItem[]): Promise<DataItem[]>;
}
```

#### 执行引擎

```typescript
class WorkflowExecutor {
  private registry: NodeRegistry;

  constructor(registry: NodeRegistry) {
    this.registry = registry;
  }

  async execute(workflow: Workflow): Promise<Record<string, DataItem[]>> {
    const results: Record<string, DataItem[]> = {};
    const order = this.topologicalSort(workflow);

    for (const nodeId of order) {
      const node = workflow.nodes.find(n => n.id === nodeId)!;
      const nodeType = this.registry.get(node.type);
      
      const inputItems = this.collectInputItems(nodeId, workflow, results);
      const outputItems = await nodeType.execute(node.params, inputItems);
      
      results[nodeId] = outputItems;
    }

    return results;
  }

  // 拓扑排序（Kahn 算法）
  private topologicalSort(workflow: Workflow): string[] {
    const inDegree: Record<string, number> = {};
    workflow.nodes.forEach(n => (inDegree[n.id] = 0));

    for (const fromId in workflow.connections) {
      for (const toId of workflow.connections[fromId]) {
        inDegree[toId]++;
      }
    }

    const queue = Object.keys(inDegree).filter(id => inDegree[id] === 0);
    const result: string[] = [];

    while (queue.length > 0) {
      const id = queue.shift()!;
      result.push(id);

      for (const nextId of workflow.connections[id] || []) {
        inDegree[nextId]--;
        if (inDegree[nextId] === 0) queue.push(nextId);
      }
    }

    return result;
  }

  private collectInputItems(
    nodeId: string,
    workflow: Workflow,
    results: Record<string, DataItem[]>
  ): DataItem[] {
    const items: DataItem[] = [];
    
    // 找到所有指向当前节点的上游
    for (const fromId in workflow.connections) {
      if (workflow.connections[fromId].includes(nodeId)) {
        items.push(...(results[fromId] || []));
      }
    }
    
    return items;
  }
}
```

---

## 7. 参考链接

- GitHub：https://github.com/n8n-io/n8n
- 官方文档：https://docs.n8n.io/
- 节点开发文档：https://docs.n8n.io/integrations/creating-nodes/
- 架构博客：https://n8n.io/blog/（搜索 architecture 相关文章）
