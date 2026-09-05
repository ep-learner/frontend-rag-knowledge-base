---
name: "create-industry-skill"
description: "陌生行业可信Skill生成器 —— 输入一段原始诉求，按「PRD对齐→调研plan→准出规范→用户自写case→自测+验收」5步标准化流程，产出带证据链/验证路径/检索关键词的行业Skill，从源头解决AI输出信任问题。"
---

# 陌生行业可信 Skill 生成器 (Create Industry Skill)

> **核心定位**：这是一个「**Skill 的 Skill**」。你不需要懂这个行业、不需要写 Prompt、不需要懂证据分级，只要给一段你的原始需求（一句话都行），本 Skill 会用标准化 5 步流程，帮你产出一个「带证据分级、可验证、用户自己能每条查证」的行业 Skill。
>
> **你要做的 vs Agent 要做的（明确分工，不混淆）**：
> - ✅ **你负责**：① 原始需求描述 + 打磨确认 PRD ② 提供你真实使用场景的测试 case（必须你写，Agent 不猜）③ 验收最终输出
> - ✅ **Agent 负责**：① 提炼结构化 PRD ② GitHub 高 star Skill 调研出 plan ③ 补齐通用准出规范（证据分级/6段结构）④ 按 case 自测直到满足准出 ⑤ 产出最终 Skill 文件
>
> **配套使用说明（推荐先读）**：
> [content/active/01-knowledge-base/09-AI协作与方法论/陌生领域AI输出信任建立-Skill三段式工作流.md](file:///d:/clawProject/zero_point/frontend-rag-knowledge-base/content/active/01-knowledge-base/09-AI协作与方法论/陌生领域AI输出信任建立-Skill三段式工作流.md)

---

## 触发场景

用户说以下任意内容时，**强制启动本 Skill**：
- 「我想做一个 xx 行业的 Skill」
- 「我对 xx 领域不懂，想做一个可信的 AI 助手」
- 「我怕 AI 骗我，怎么在这个领域做一个带证据链的 Prompt/Skill」
- 「有没有标准化的流程产出一个可靠的行业 Skill」
- 用户给出了一段原始需求（即使没说「要做 Skill」），只要符合：陌生领域 + 想要可信输出 + 要参考高 star 方案，就启动本 Skill

---

## 前置：本 Skill 内置 References 模板

本 Skill 自带完整示例（基于营养师 Skill 项目），所有模板文件都可以直接复制后替换行业语义：

```
.trae/skills/create-industry-skill/references/（内置，无需手动找）
├── templates/
│   ├── originPrd-TEMPLATE.md       ← PRD 模板（第1步产出用）
│   ├── plan-TEMPLATE.md            ← 调研方案模板（第2步产出用）
│   ├── acceptance-specs-TEMPLATE.md ← 准出规范模板（第3步产出用）
│   └── case-TEMPLATE.md            ← case 模板（第4步用户填用）
└── food-skill-example/              ← 营养师完整示例（对照参考，不要直接复制业务内容）
    ├── 1-originPrd-example.md       ← 营养师原始PRD（示例，看结构不要看内容）
    ├── 2-plan-example.md            ← 营养师plan调研结果（示例，看筛选逻辑）
    ├── 3-acceptance-specs-example.md ← 营养师准出规范（示例，看6段结构细节）
    ├── 4-case-example.md            ← 营养师测试case（示例，看case怎么写）
    ├── 5-case1-output-example.md    ← 营养师case1输出（示例，看准出怎么满足）
    └── 6-case2-output-example.md    ← 营养师case2输出（示例，看验收标准）
```

---

## 标准化 5 步执行流程

### ⬜ Step 1：提炼 PRD + 用户确认（**PRD 是唯一基准，后续变更全以 PRD 为准**）

#### Agent 要做的：
1. **读取用户的原始诉求**（不管用户写成什么样，哪怕是一段话、碎片信息都行）
2. **按 `references/templates/originPrd-TEMPLATE.md` 模板结构**，把原始诉求整理成结构化 PRD
3. PRD 必须完整包含 4 要素（一个都不能缺）：
   - **① 背景**：用户在这个领域的认知水平、遇到的具体痛点
   - **② 核心问题 ≥ 2 个**：编号列清楚，用「怎么/如何」开头（**这是验收时的漏答检查依据**）
   - **③ 产出物要求**：格式、证据、验证、避坑、长度等写清楚（没有明确要求的话，Agent 按本 Skill 的默认建议补齐）
   - **④ 方案调研范围**：GitHub 搜什么关键词、star 筛选标准、必须满足的能力点、必须排除的方案类型
4. **Agent 自动补齐默认要求**（如果用户没写的话）：
   - 默认建议：必须有证据分级（Strong/Moderate/Low）、必须有客观验证路径、必须有检索关键词、必须本土化优先
5. **产出 PRD 文件**放到 `plans/active/{行业名}-skill/` 目录下（如：`plans/active/skincare-skill/originPrd.md`）
6. **以「用户 review 成本最低」为目标展示 PRD**：
   - 不要直接丢大段 md 给用户
   - 用「表格+要点」的方式总结 PRD 核心：**核心问题 x 条、默认补齐了哪些要求、哪些需要用户确认/补充**
   - **明确问用户 3 个问题**：
     1. 核心问题列全了吗？有没有漏/错？
     2. 我默认补齐的产出物要求（证据分级/验证路径/检索关键词）有没有你要加的或删的？
     3. 方案调研范围的 star 标准和排除项 OK 吗？

#### 用户要做的：
- 逐条确认 PRD 的 4 要素
- **有改动直接改 PRD，不要口头说改哪条**（PRD 是唯一基准，后续所有交付物都要对照 PRD 检查）
- 全部 OK 了就说「PRD 确认通过」，Agent 才进入 Step2

#### 准出条件（本步完成才能进下一步）：
- [ ] PRD 结构化完成，4 要素齐全
- [ ] 用户明确回复「PRD 确认通过」（必须有这句，不接受「差不多」「先继续」）

---

### ⬜ Step 2：GitHub 高 star Skill 调研 → plan.md

#### Agent 要做的：
1. **读取 Step1 确认通过的 PRD**（严格按 PRD 的调研范围来，不要自己扩范围）
2. **执行检索**：
   - GitHub：按 PRD 里的关键词搜（`best {行业} skill github` / `{行业} prompt star github` 等组合词）
   - 开源社区：Hugging Face Prompt Library、Awesome-XX 清单等
3. **按 PRD 的筛选标准筛掉不合格方案**（核心不匹配的 star 再高也不要）
4. **按 `references/templates/plan-TEMPLATE.md` 模板**产出 plan.md，必须包含：
   - **① 方案总览表**：3~5 个方案按匹配度排序 → star 数、满足了 PRD 哪些要求、不满足什么、适用边界
   - **② 最终推荐方案 + 理由**：用哪个/哪几个融合、为什么其他不选（不能说「都不错」，必须有明确结论）
   - **③ 现成最小版 Prompt**：如果用户不想装完整 Skill，直接能复制用的版本（融合了推荐方案精华）
   - **④ 所有推荐方案的已知短板**：本土化缺失、证据粒度不够等（改造方向）
5. 放到 `plans/active/{行业名}-skill/plan.md`
6. **向用户汇报**：用表格列推荐方案的对比 + 最终推荐理由 + 短板说明，问用户「方案 OK 吗？有没有想换的？」

#### 用户要做的：
- 看方案对比表和推荐理由
- 有想调整的直接改 plan.md 或告诉 Agent
- 回复「方案确认通过」进入 Step3

#### 准出条件：
- [ ] 方案对比表 ≥ 3 个，每个标注 star + 满足/不满足 PRD 要求
- [ ] 有明确最终推荐（单一方案或多方案融合）+ 理由
- [ ] 有现成最小版 Prompt
- [ ] 有已知短板 + 改造说明
- [ ] 用户明确回复「方案确认通过」

---

### ⬜ Step 3：**准出规范 acceptance-specs.md**（Agent 补齐通用部分 + 用户可追加）

> **作用**：这是「最终 Skill 输出必须满足什么格式」的规则文件，也是 Step5 自测和验收的**唯一判定标准**。写得越清楚，Skill 越不会偏。

#### Agent 要做的：
1. **按 `references/templates/acceptance-specs-TEMPLATE.md` 模板**，先补齐通用准出规范（所有行业通用，不用改）：
   - **6 段强制输出结构**：一句话结论 → 证据等级+来源 → 可执行量化方案 → 适用边界禁忌 → 三级客观验证路径 → 二次查证检索关键词
   - **三档证据分级标准**（Strong/Moderate/Low）+ 硬性规则（动物实验只能标 Low、非本土数据必须标注、禁止编造文献）
   - **检索源白名单**（国内权威+国际权威，禁止百度知道/小红书/知乎）
   - **避坑提醒要求**：必须指出常见营销骗局
   - **免责声明**：教育辅助不能替代专业人士
2. **结合 PRD 的行业特性**，追加行业特定规则（如：营养类要对齐中国膳食指南、法律类要标注适用地区+不能替代律师）
3. 放到 `plans/active/{行业名}-skill/acceptance-specs.md`
4. **发给用户看**，明确告诉用户：
   - 通用部分是默认的，建议保留（这是信任的核心）
   - **用户可以随意补充/修改**：比如你觉得还要加什么输出段落、加什么规则、什么必须强制写
   - 后续如果发现 Agent 输出不符合要求，就把规则补到这里再重新生成
5. 问用户：「准出规范 OK 吗？有没有要补充/修改的？」

#### 用户要做的：
- 看通用规范是否 OK（一般都 OK，不用改）
- **补行业特殊要求**（这一步非常有价值，越早补后面返工越少）
- 可以先通过，后面看到 Agent 输出不满意了再反向补规则
- 回复「准出规范确认通过」进入 Step4

#### 准出条件：
- [ ] 6 段结构 + 三档证据分级 已写入
- [ ] 检索源白名单 已写入
- [ ] 行业特定规则已追加（如没有也要明确写「暂无特殊要求」）
- [ ] 用户明确回复「准出规范确认通过」

---

### ⬜ Step 4：**用户自写 case.md（强烈建议必须用户写，Agent 不能代劳！）**

> **为什么必须用户写？**
> Agent 会默认假设「用户会用非常标准、非常完备的 Prompt 去触发 Skill」，但真实情况是用户的输入往往很口语、信息缺漏、带个人背景。如果 Agent 自己编 case 测，测出来的 Skill 在真实场景下根本不好用。

#### 用户要做的（本步必须用户做，Agent 不替写）：
1. 按 `references/templates/case-TEMPLATE.md` 模板写 2~3 个 case
2. 每个 case 必须包含：
   - **用户画像**：性别年龄职业等基本信息
   - **问题原文**：**就按你真实会怎么问的口吻写**，不要「标准问法」、不要补你不会说的信息、不要怕不完整
   - **覆盖不同类型**：case1 一个类型、case2 另一个类型（如营养里「亚健康调理」和「具体症状决策」）
3. 放到 `plans/active/{行业名}-skill/case.md`
4. 告诉 Agent：「case 写好了，开始测试」

#### Agent 要做的：
- 只读，不要改，不要评论「你这个 case 信息不全」——真实世界用户就是会给不全的信息，Skill 就要能应对（按要求追问缺失信息即可）
- 确认收到 case 后进入 Step5

#### 准出条件：
- [ ] 2~3 个 case
- [ ] 每个包含用户画像 + 问题原文
- [ ] 覆盖不同类型问题
- [ ] 确认为用户本人提供（不是 Agent 编的）

---

### ⬜ Step 5：Agent 自测 → 用户验收（**双保险，不满足准出不出手**）

#### Agent 要做的：
1. **写 Skill 主文件**：放到 `.trae/skills/{行业名}-advisor/SKILL.md`（如果不是营养类就换名字，如 skincare-advisor）
   - Skill 必须内嵌 acceptance-specs.md 的全部规则（直接拷贝进 Skill 的输出格式约束部分）
2. **自测开始**：每个 case 按 acceptance-specs.md 跑一遍输出，保存到：
   - `plans/active/{行业名}-skill/case1-output-demo.md`
   - `plans/active/{行业名}-skill/case2-output-demo.md`
   - ……
3. **自测 Checklist（必须全部过了再给用户）**：
   针对每条输出，对照 acceptance-specs.md 逐条查：
   - [ ] 6 段结构全吗？（少一段都不行）
   - [ ] 每条关键建议都标证据等级了吗？标注符合分级标准吗？
   - [ ] 方案是量化的吗？（有没有「多吃点」「适量」这种空话）
   - [ ] 有适用边界和禁忌吗？
   - [ ] 三级验证路径有明确时间节点和检测项目吗？（有没有说「看体感」就完了）
   - [ ] 给了 3~5 组检索关键词 + 权威检索源吗？
   - [ ] 有没有覆盖 PRD 里的所有核心问题？（PRD 里列了编号的，一条一条对应）
   - [ ] 有没有把 PRD 里用户不了解的术语解释清楚？
   - [ ] 避坑提醒和免责声明有吗？
4. **有任何一条不满足 → 修改 Skill → 重新生成输出 → 再过 Checklist**，循环直到所有 case 所有条目都满足
5. **给用户验收**：
   - 交付物清单：Skill 文件路径 + 每个 case 的 output-demo 路径
   - 给用户一张「验收 Checklist」：告诉用户按 acceptance-specs.md 和 PRD 的核心问题清单查
   - 明确告诉用户：「有任何不满意的，要么改 acceptance-specs 补规则，要么改 PRD，我重新跑，不要改输出文件本身」

#### 用户要做的：
- 打开每个 case 的 output-demo，按 acceptance-specs.md + PRD 核心问题逐条查
- 不满意的地方：
  - 如果是「我要的格式没满足」→ 补 acceptance-specs.md 规则
  - 如果是「核心问题没回答/理解错了」→ 改 PRD
  - 如果是「方案本身推荐错了」→ 改 plan.md
- 改完文件告诉 Agent「重新跑」，不要自己改输出 demo
- 所有 output 都满意了 → 回复「验收通过」，Skill 正式完成

#### 准出条件：
- [ ] 所有 case 自测 Checklist 100% 通过（Agent 内部）
- [ ] 用户明确回复「验收通过」
- [ ] 最终 Skill 文件 + 所有 case 输出 demo 都在对应目录

---

## 全流程分工总表（再重申一次，不混）

| 阶段 | 步骤 | 用户做 | Agent 做 |
|------|------|-------|---------|
| **方案制定阶段** | Step1 PRD | 确认/修改/补充 PRD 4 要素，最终回复「通过」 | 从原始诉求提炼结构化 PRD，补齐默认要求，等用户确认 |
| | Step2 Plan | 确认/调整方案，最终回复「通过」 | 按 PRD 搜 GitHub 高 star，筛方案，写对比表+推荐+最小版Prompt |
| | Step3 准出规范 | 补行业特殊规则，反向补规则也行，最终回复「通过」 | 补齐通用6段结构+证据分级+检索白名单，等用户补充 |
| **测试验收阶段** | Step4 Case | **必须用户自己写**真实使用场景 case，写完告诉 Agent | 只接收，不修改，不代写 |
| | Step5 自测+验收 | 按准出+PRD查输出，不满意就改 PRD/准出/plan，最终回复「验收通过」 | 写 Skill → 按准出自测到全过 → 交付验收 → 改了就重跑 |

---

## 最终交付物清单（项目结束时必须全部有）

```
plans/active/{行业名}-skill/
├── originPrd.md              ← Step1 产出（用户确认过的基准）
├── plan.md                   ← Step2 产出（调研方案）
├── acceptance-specs.md       ← Step3 产出（准出规范）
├── case.md                   ← Step4 产出（用户自写的测试case）
├── case1-output-demo.md      ← Step5 产出（Agent自测+用户验收通过的示例）
├── case2-output-demo.md      ← Step5 产出
└── ...（有多少case就有多少demo）

.trae/skills/{行业名}-advisor/
└── SKILL.md                  ← 最终可直接调用的 Skill 文件（内嵌所有准出规则）
```
