# GitHub 营养/护理 循证 Skill 检索结果（按匹配度排序）
先给核心结论：
**没有几万星的超大爆款纯营养师Skill**，垂直领域这类带证据链、置信分级、输出格式约束的，基本都是 Claude 原生 `SKILL.md` 格式、中小几百星，在健康垂直里属于高质量；绝大多数高星营养类仓库只是食谱生成/宏量计算，**不带证据溯源、置信度、校验路径，完全解决不了你「鉴别AI对错」的核心诉求**，要区分开。

下面只筛选满足你核心要求：**结构化输出约束 + 显式证据链/证据分级 + 置信标注 + 配套客观验证方式** 的项目，分三类。

## 一、最匹配：营养师 / 饮食 / 补剂 专用 Skill（优先看）
### 1. npapatheodorou/personal-trainer-skill ⭐ 高匹配（营养子模块）
- Star：~300+，Claude Code / AGENTS.md 双兼容原生Skill
- ✅ 完全命中你的需求点：
  - 内置独立 `references/evidence.md`，**每条营养结论绑定文献来源、强制三档置信分级：Strong / Moderate / Emerging**，禁止编造引用，明确区分人体RCT/综述 vs 动物实验，主动拒绝排毒、神奇补剂这类伪科学
  - nutrition.md 覆盖宏量计算、膳食建议、补剂、减脂增肌；输出强制结构化：结论→证据等级→来源→适用人群→验证方法
  - 自带「如何客观测量效果」章节（实验室指标、单变量对照、体能指标），刚好对应你第二个问题
  - 可以单独抽nutrition部分用，不需要训练模块；支持Cursor / Claude Code / OpenAI Codex
- ❌ 局限：基于欧美运动营养共识（ISSN等），**没有对齐《中国居民膳食指南2022》、中国DRI、本土食物成分**；不覆盖临床营养、慢病饮食
- 适合：做补剂、运动营养、通用营养问题的证据校验Skill，是所有仓里**证据链机制做得最规范**的一个

### 2. H1an1/health-coach ⭐ 中文最优、国内场景首选
- Star：~200+，国内开发者原生中文Agent Skill
- ✅ 核心优势（最适配你之前的上下文）：
  - 补剂模块**天然三级证据分类：强证据/中等证据/证据不足（不推荐）**，明确标注剂量、UL上限、药物交互
  - 内置**中国菜/连锁食品数据库、适配中国人膳食结构、生化化验单（血常规/维生素/血脂等）指标解读SOP**，直接对应你要的「客观化验验证」
  - 输出强制分：建议、证据等级、风险禁忌、居家监测指标、医院复查项目+周期
  - 全本地文件存储、支持Apple Health导入、自动生成周/月追踪报告
  - 安装：`npx skills add H1an1/health-coach -g`
- ❌ 局限：置信分级没有上面那个skill严谨，膳食部分偏健康追踪，循证引用粒度弱一点；没有GRADE formal分级
- 适合：中文环境、日常饮食、国产食物、血检指标解读、补剂风险筛查，**目前唯一优先对齐本土数据的开源营养Skill**

### 3. dannykogan/ai-nutritionist ⭐ Claude 原生Skill，饮食合规追踪
- Star：~150+，Claude.ai 一键上传zip的官方Skill格式
- ✅ 特点：
  - 不是知识型，是**执行+验证工作流Skill**：对接MyFitnessPal → Apple Health → Notion，做宏量目标、周度合规判定
  - 输出强约束、结构化，适合饮食干预后的长期记录、量化效果，配合前面两个证据Skill组合用
- ❌ 局限：**几乎不带证据分级/文献溯源**，不能用来鉴别对错，只适合「改完饮食之后做客观追踪」那半段
- 适合：饮食记录、进度验证闭环

### ❌ 大量避坑：不推荐的高星"营养AI"项目
很多Star更高的如 NourishAI、NutriGen、各种meal-plan generator：
- 核心能力是生成食谱、算卡路里，**没有证据溯源、没有置信分级、不区分证据质量、不给出验证路径**
- 本质是格式化生成器，不能解决你「分不清AI对错、信息驳杂」的核心痛点，不要当作校验Skill用

## 二、护理 / 临床照护 类 Skill & Prompt 资源
如果你顺带要护理、慢病照护、患者宣教方向：
1. **ADPIE Nursing Care Plan Skill**（多个repo通用）
   - 代表：`Spicer7/S.R-prompts/nursing_care_plan.md`、moizullah/prompts
   - 强制ADPIE护理流程输出：Assessment → Diagnosis → Plan → Intervention → **Evaluation（可测量结局）**，每条干预要写evidence rationale，天然带验证环节，是护理最标准结构化Skill模板
   - 适配：慢病饮食护理、术后营养、患者教育
2. OpenClaw-Medical-Skills
   - 医疗技能集合，包含临床营养评估、PICO证据检索子Skill，GRADE分级；偏临床、门槛高
3. openmedica nursing-care-plan
   - NANDA-I / NOC / NIC 标准化护理诊断+证据干预，适合专业护理场景

> 注意：纯养生/中医养生类、带保健品带货导向、无证据分级的Skill在GitHub几乎没有合格开源项目，绝大多数是普通prompt，证据质量不可控，不建议直接用。

## 三、通用底层 Skill：叠加到营养问题上，解决「证据分级、防幻觉」
如果你想自己组合，这两个不是营养专用，但是**专门用来强制AI输出证据链+置信+验证路径**，可以作为外层系统Prompt套在任何营养问题上，价值很高：
1. **poferraz/make-prompt-better** ⭐ ~1k star
   - 核心：强制LLM输出**结构化推理证书（premise → evidence trace → conclusion）**，禁止跳步，强制区分证据类型、标注哪里需要外部核验，专门针对高风险事实类问题降幻觉
   - 非常适合改造营养Prompt，搭配膳食指南+GRADE规则
2. **PICO + GRADE Evidence Summary Prompt Skill**
   - 很多medical prompt库收录，把营养问题转成PICO框架、输出GRADE证据等级、指南来源、研究类型、**明确标注需要去PubMed/知网/营养学会官网二次验证的项目**
   - 这正是你之前问的「怎么判断AI输入是否正确」的标准工作流

## 四、推荐组合使用方案（最贴合你的目标）
| 你的需求 | 选用Skill |
|---|---|
| 鉴别营养/补剂说法、要证据链+置信度、防幻觉 | personal-trainer-skill (nutrition模块) + make-prompt-better |
| 中文、中国食物、膳食指南、血检指标解读、本土场景 | H1an1/health-coach |
| 饮食记录、干预后客观追踪、效果量化验证 | ai-nutritionist / health-coach 报告模块 |
| 慢病/护理、可评估结局的干预计划 | ADPIE nursing skill |
| 严谨文献级证据检索 | 叠加PICO/GRADE外层Prompt |

### 重要短板&改造提醒（两个核心营养Skill都存在）
1. 原生都**不默认绑定《中国居民膳食指南2022》、中国DRI/RNI-UL**，这是最大风险，直接用会偏向欧美营养结论。你可以把膳食指南PDF作为本地知识库，在Skill里加一条前置约束：
> 所有针对健康中国成年人的结论，优先对齐中国营养学会《中国居民膳食指南2022》、中国DRIs；如引用欧美ISSN/USDA结论必须显式标注人群差异。
2. 两个Skill的「验证环节」都已经覆盖你上一轮要的：区分主观体感 / 居家客观指标 / 医院化验金标准、单变量变更原则，这点是它们远优于普通prompt的地方。
3. 全部都是教育辅助工具，内置医疗免责，不能替代注册营养师/临床营养科。

## 五、现成可直接用：循证营养校验 Prompt（融合上面Skill的格式约束）
如果你不想装完整Skill，可以直接用这个系统Prompt，就是上面几个优秀Skill的输出规范：
```
# Role: Evidence-Based Nutrition Checker Skill
# Output Hard Constraints:
1. 分四段输出，禁止混写：
   - Conclusion：一句话结论
   - Evidence & Confidence：证据等级 Strong/Moderate/Low + 来源类型（中国营养学会指南 / RCT / Meta / 观察 / 体外动物 / 专家意见）+ 引用源
   - Population & Dose Boundary：适用人群、RNI/UL剂量边界、禁忌
   - Verification Path：如何客观验证效果，分「居家可测指标 / 建议医院化验 / 不建议仅靠体感」
2. 禁止编造文献；如果只有动物/细胞实验，Confidence强制Low并明确警告不能外推人体
3. 优先对齐中国居民膳食指南2022，冲突必须显式说明
4. 推荐补剂必须说明：优先食物、什么时候才值得补、检测什么指标复查
```

如果你需要，我可以：
- 把 `personal-trainer-skill` 的nutrition模块做一个**适配中国膳食指南2022的改造版独立SKILL.md**
- 或者整理一份这几个Skill的安装SOP + 各自的适用边界对比表