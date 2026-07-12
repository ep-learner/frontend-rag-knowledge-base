# Content Manifest Protocol - 内容渲染协议

> 本文档定义 content/ 目录下内容的渲染协议。前端框架层按照这个协议渲染页面，不关心具体内容。

---

## 一、整体架构

```
前端框架层（Framework）
    ↓ 读取
content/ 目录（Content）
    ↓ 按照协议组织
三大类内容（knowledge-base / learning-projects / source-notes）
```

**核心原则**：
- 框架层只认协议，不认具体内容
- 新增内容只要遵循协议，自动获得渲染能力
- 不同类型的内容有不同的协议细节

---

## 二、三大内容类型

| 类型 | 目录 | 协议 | 渲染方式 |
|------|------|------|---------|
| **知识点笔记** | `active/01-knowledge-base/` | 目录 + md 文件 | 分类列表 → 文档列表 → Markdown 渲染 |
| **学习项目** | `active/02-learning-projects/` | 项目目录 + manifest.json | 项目卡片列表 → 项目详情页（笔记列表 + Demo 预览） |
| **来源整理** | `active/03-source-notes/` | 目录 + md 文件 | 来源分类 → 文档列表 → Markdown 渲染 |

---

## 三、知识点笔记协议（knowledge-base）

### 目录结构
```
01-knowledge-base/
├── 01-TypeScript/
│   ├── 01-类型系统深度解析.md
│   ├── 02-泛型编程实战.md
│   └── ...
├── 02-React核心原理/
│   └── ...
└── README.md
```

### 元数据提取
- **分类名**：目录名（去掉数字前缀，如 `TypeScript`）
- **文档标题**：md 文件的第一个 `# 标题`
- **文档路径**：相对于 `01-knowledge-base/` 的路径

### API 接口
```
GET /api/content/knowledge-base/categories
→ 返回分类列表

GET /api/content/knowledge-base/docs?category=TypeScript
→ 返回某分类下的文档列表

GET /api/content/knowledge-base/doc/:path
→ 返回文档内容（Markdown）
```

---

## 四、学习项目协议（learning-projects）

### 目录结构
```
02-learning-projects/
├── vibe-learning/
│   ├── AGENT.md
│   ├── README.md
│   ├── manifest.json      # ⭐ 必须有！
│   ├── notes/
│   │   ├── 01-基础篇.md
│   │   └── 02-进阶篇.md
│   └── demo/
│       ├── index.html
│       └── ...
└── README.md
```

### manifest.json 协议（核心！）

```json
{
  "id": "vibe-learning",
  "title": "VibeVibe 教程学习",
  "description": "VibeVibe 基础篇 + 进阶篇全流程学习",
  "tags": ["前端", "AI", "教程"],
  "level": "beginner",
  "coverImage": "assets/cover.png",
  "status": "in-progress",
  "notes": [
    {
      "id": "note-base",
      "title": "基础篇学习笔记",
      "file": "notes/01-基础篇.md",
      "order": 1
    }
  ],
  "demos": [
    {
      "id": "demo-base",
      "title": "基础篇 Demo",
      "entry": "demo/index.html",
      "description": "基础篇的可运行示例",
      "order": 1
    }
  ],
  "sections": [
    {
      "id": "sec-base",
      "title": "基础篇",
      "noteIds": ["note-base"],
      "demoIds": ["demo-base"]
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 项目唯一 ID，英文小写，用 kebab-case |
| `title` | string | ✅ | 项目标题 |
| `description` | string | ✅ | 一句话描述 |
| `tags` | string[] | - | 标签数组 |
| `level` | string | - | 难度：beginner / intermediate / advanced |
| `coverImage` | string | - | 封面图路径（相对于项目目录） |
| `status` | string | - | 状态：not-started / in-progress / completed / archived |
| `notes` | array | ✅ | 笔记列表 |
| `notes[].id` | string | ✅ | 笔记唯一 ID |
| `notes[].title` | string | ✅ | 笔记标题 |
| `notes[].file` | string | ✅ | 笔记文件路径（相对于项目目录） |
| `notes[].order` | number | - | 排序，数字小的在前 |
| `demos` | array | - | Demo 列表 |
| `demos[].id` | string | ✅ | Demo 唯一 ID |
| `demos[].title` | string | ✅ | Demo 标题 |
| `demos[].entry` | string | ✅ | Demo 入口文件路径（相对于项目目录） |
| `demos[].description` | string | - | Demo 描述 |
| `demos[].order` | number | - | 排序 |
| `sections` | array | - | 章节分组（可选，用于复杂项目） |

### API 接口
```
GET /api/content/learning-projects/list
→ 返回项目列表（从各 manifest.json 汇总）

GET /api/content/learning-projects/:id
→ 返回单个项目的 manifest 详情

GET /api/content/learning-projects/:id/note/:noteId
→ 返回某篇笔记的内容

GET /api/content/learning-projects/:id/demo/:demoId
→ 返回 Demo 的入口文件（静态文件服务）
```

### 前端渲染

**项目列表页：**
- 卡片式布局，每个项目一张卡片
- 显示：封面图、标题、描述、标签、难度、状态
- 点击进入项目详情页

**项目详情页：**
- 左侧：章节/笔记导航
- 右侧主区域：
  - 默认显示 README.md 或项目介绍
  - 点击笔记 → 渲染 Markdown
  - 点击 Demo → iframe 加载 demo 入口 + 旁边显示说明

---

## 五、来源整理协议（source-notes）

### 目录结构
```
03-source-notes/
├── xiaohongshu/
│   ├── 2026-07-01-React性能优化技巧.md
│   └── ...
├── douyin/
│   └── ...
└── README.md
```

### 元数据提取
- **来源分类**：目录名（如 `xiaohongshu`、`douyin`）
- **文档标题**：md 文件的第一个 `# 标题`
- **价值评估**：从文件头部的元信息提取（可选）

### API 接口
```
GET /api/content/source-notes/categories
→ 返回来源分类列表

GET /api/content/source-notes/docs?category=xiaohongshu
→ 返回某来源下的文档列表

GET /api/content/source-notes/doc/:path
→ 返回文档内容
```

---

## 六、统一 API 响应格式

所有接口遵循统一格式：

```json
{
  "code": 0,
  "data": { ... },
  "message": "ok"
}
```

错误时：
```json
{
  "code": 404,
  "data": null,
  "message": "Not found"
}
```

---

## 七、扩展原则

1. **向后兼容**：新增字段不影响旧功能
2. **渐进式增强**：简单内容可以只有基础字段，复杂内容可以加更多字段
3. **约定优于配置**：能从目录/文件名推断的，就不用额外配置
4. **框架层不关心内容**：框架只负责渲染，不理解内容

---

**版本**：v1.0
**最后更新**：2026-07-12
