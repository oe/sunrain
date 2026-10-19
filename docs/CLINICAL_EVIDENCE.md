# Sunrain 评估与自助内容的医学依据

更新日期：2026-10-19。本文区分原始资料支持的结论、Sunrain 的产品选择，以及尚未完成的核验。关联规格见 [MENTAL_HEALTH_CHECK_IN.md](./MENTAL_HEALTH_CHECK_IN.md)。

## 当前核验状态

已找到 PHQ-9/GAD-7 原始研究、原版表单和评分手册；本次核对了可用的 15 份表单及其展示权限，详见 E24 和运行注册表。未把旧 YAML 译文视为原版，也未把官方提供的译本视为已验证适用于所有年龄、国家与场景。独立专业/母语审阅与 Sunrain 临床效果验证仍未完成。既有转介核验仅涉及记录的官方入口，不包括实际接诊或预约。APA/WHO 候选不因本次核查自动获准。

专业审阅人：未指定。专业审阅完成日期：未完成。网页资料核对不能替代专业审阅。

### E24：原版症状参考量表（2026-10-19）

- 读取 [PHQ Screeners 下载页](https://www.phqscreeners.com/select-screener)及[使用条款](https://www.phqscreeners.com/terms)，明确其来源表单和译本可复制、翻译、展示、分发；确诊需要临床判断。读取下载页链接的完整九页原始评分手册，包括第 2、5、6 页的完整性、功能影响、PHQ-9/GAD-7 计分与症状分段。
- 从该站下载 PHQ-9 八种语言、GAD-7 七种语言的 PDF，逐题比较文字、顺序、两周时间窗与选项。具体地区版本、URL、PDF SHA-256 与实现文字 SHA-256 见 [运行注册表](../src/data/screening-registry.json)。印地语与阿拉伯语文字提取存在字体编码问题，另查看 PDF 渲染逐项转录；是 AI 核对，不是母语或临床签署。
- 日语 GAD-7 不接入：[日本不安症学会 2025 表单](https://jpsad.jp/other_work/research-2012/files/jpsad_gad7.pdf)第 1 页明确限制未经许可转载、改编与电子媒体使用。未获得许可，不复制该译本；本次也未制作自己的 GAD-7 日语译本。英语原版允许独立翻译，但不能冒称译文继承现成日语版的验证结论；不能用 Pfizer 对其站内表单的许可覆盖这个独立版本。
- PHQ-9 日语采用 PHQ Screeners 实际提供、页脚明确允许展示的原版文件，与上述 GAD-7 2025 版不同。没有取得或声称取得后一版本的授权。
- 成人仅呈现手册中的症状参考分段，不运行诊断算法、不生成患病概率、药物或治疗处方。13–17 岁只记录症状与原始分数，不套成人分级；不声称八语青少年临床适用性已经核验。相关英文青少年研究的检索摘要可追溯到 PubMed 21041282、29069107；本次完整 PMC 页面返回验证挑战，未声称读取全文或核验所有译本。
- 本次症状参考版实施与边界见 [SCREENING_IMPLEMENTATION.md](./SCREENING_IMPLEMENTATION.md)。原 E2/E3 的待办中，“原版表单与展示权限”由本记录补充；独立临床审阅、分语言分人群的适用验证和网站临床效果仍未完成。

## 依据目录

### E1 APA 多维症状工具

- 来源：[DSM-5-TR 成人 Level 1 Cross-Cutting Symptom Measure 原文件](https://www.psychiatry.org/getmedia/e0b4b299-95b3-407b-b8c2-caa871ca218d/APADSM5TR-Level1MeasureAdult.pdf)。定位：第 1 页用途和授权；第 3 页 Instructions to Clinicians 及 Scoring and Interpretation。
- 支持范围：23 题、13 个症状维度，辅助临床进一步了解相关方面，不能单独用于诊断；不是所有疾病的排查工具。
- 权限：文件规定了研究者及临床人员特定用途的复制范围，修改、翻译和超出该范围的应用须另行处理授权。Sunrain 的公开自助网站用途尚未确认获准。
- 产品决定：仅为候选；不复制题目、改编评分或把维度阳性转换成疾病概率。临床样本中的用途与可靠性不能直接证明无专业支持的网站适用。

### E2 PHQ-9 原始验证研究

- 来源：Kroenke、Spitzer、Williams，2001，[The PHQ-9: validity of a brief depression severity measure](https://pubmed.ncbi.nlm.nih.gov/11556941/)。DOI：10.1046/j.1525-1497.2001.016009606.x。定位：Abstract / Results；[全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC1495268/)中的量表与严重程度说明。
- 支持范围：在研究所述医疗场景中评估抑郁症状；程度分界为 5、10、15、20 分。不能将研究的敏感度或特异度显示成某个用户的患病概率。
- 待核验：仓库两周回顾版本、各语言来源、当前展示授权、数字化实现和结果说明。其他机构的同名改编版可能使用不同回顾时间，不可混用。

### E3 GAD-7 原始验证研究

- 来源：Spitzer、Kroenke、Williams、Löwe，2006，[A brief measure for assessing generalized anxiety disorder: the GAD-7](https://pubmed.ncbi.nlm.nih.gov/16717171/)。DOI：10.1001/archinte.166.10.1092。定位：Abstract / Methods、Results、Conclusion。
- 支持范围：成人医疗场景中的广泛性焦虑筛查与程度评估；与抑郁症状可以同时出现，仍应分别解释。
- 待核验：指定原版完整评分说明、公开网站使用条件、各译本来源和目标人群适用性。原始英文研究不证明仓库各译本或组合流程经过验证。

### E4 NICE 抑郁评估指南

- 来源：[NG222 Recommendations](https://www.nice.org.uk/guidance/ng222/chapter/Recommendations)，1.2.6、1.2.7；[官方 PDF](https://www.nice.org.uk/guidance/ng222/resources/depression-in-adults-treatment-and-management-pdf-66143832307909)。
- 支持范围：临床评估不能只依赖症状计数，还需要病程、功能影响、既往情况等信息，并考虑情绪高涨史。
- 产品决定：不按一个分数生成诊断或治疗选择。用户自愿补充的生活影响仅为沟通摘要，不拼成自研诊断算法。

### E5 NICE 双相评估指南

- 来源：[CG185 Recommendations](https://www.nice.org.uk/guidance/cg185/chapter/recommendations)，1.2.2 至 1.2.5。
- 支持范围：不使用问卷在初级医疗中识别成人双相障碍；疑似躁狂或严重抑郁等情况需要专业评估；支持执行专业制定的照护计划。
- 产品决定：不以网站问卷给出双相结论。日常记录和沟通准备可作为独立支持方向，具体内容另行审阅，不把其他问题的自助流程自动套用。

### E6 USPSTF 筛查后的评估与照护

- 来源：[Depression and Suicide Risk in Adults: Screening](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-depression-suicide-risk-adults)，2023-06-20。定位：Pathway to Benefit、To whom does this recommendation apply。
- 支持范围：筛查阳性后应进一步评估，并在适当时获得循证照护。该推荐面向未确诊、未表现出已识别相关症状的成人群体，不能直接当作主动求助用户使用本网站的效果证据。
- 产品决定：结果必须连接一般专业支持与行动，不止提供分数。借鉴后续支持的原则，不宣称该指南认证 Sunrain。

### E7 NICE 自伤指南

- 来源：[NG225 Recommendations](https://www.nice.org.uk/guidance/ng225/chapter/recommendations)，1.6.1 至 1.6.5。
- 支持范围：不使用风险量表预测自杀或再次自伤，不用低中高风险分类决定治疗或出院等临床处置。
- 产品决定：网站不预测风险、不据低分作出安全保证，求助入口不受总分控制。现有 PHQ-9 相关回答提示是提供支持的产品规则，不是已验证的风险评估。

### E8 WHO 心理自助实施手册

- 来源：[Psychological self-help interventions: delivering self-help for individuals, featuring Step-by-Step and Doing What Matters in Times of Stress](https://www.who.int/publications/i/item/9789240120785)，2026-06-01。ISBN：978-92-4-012078-5。定位：出版页面 Overview。
- 支持范围：介绍有支持和无支持的结构化自助及其实施，适用于数字、纸质等形式；不能把方法层面的证据归为 Sunrain 的效果。
- 待核验：完整手册、适用条件、具体内容授权、改编要求和本地化。当前核对限于出版页面，不表示已经评审或采用完整课程。

### E9 WHO Step-by-Step 附件

- 来源：[Step-by-Step: a self-help intervention for depression](https://www.who.int/publications/i/item/B09738)，2026-06-01。参考号：B09738。定位：出版页面 Overview。
- 支持范围：出版说明列出了具体内容和实施资源，并说明多项试验中的效果是在受训非专科支持者每周提供简短支持的条件下得到的。
- 产品决定：可用于考察有连续支持的内容方向；不能将其试验结果直接转给自行编写、完全无人支持的短课程。完整资源、授权与交付条件尚待核验。

### E10 感官练习参考

- 来源：[NHS inform Grounding exercises](https://www.nhsinform.scot/healthy-living/mental-wellbeing/breathing-and-relaxation-exercises/grounding-exercises/)；补充：[Royal United Hospitals Bath 感官与正念练习手册](https://www.ruh.nhs.uk/patients/patient_information/PAE129_Mindfulness_and_grounding_exercises.pdf)，2024-09，第 1 页。
- 支持范围：感官定位方法的参考；后者面向特定患者，不是适用于所有情境的治疗证据。NHS inform 完整页面当前读取受限；医院 PDF 已读取。
- 产品决定：S01 为简短教育内容草案，睁眼选项、跳过不适用感官、不要求品尝物品和结束分支是 Sunrain 的产品适配，尚待专业审阅。不能宣称该八语改编由来源机构认可。
- 权利：未复制图片或完整手册；全文转载、翻译及具体改编的使用条件尚待核验。

### E11 日常自我照顾参考

- 来源：[NIMH Caring for Your Mental Health](https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health)，页面审阅日期 2026-04。定位：Set goals and priorities、Stay connected、When should I seek professional help。
- 支持范围：日常自我照顾、选择优先事项和寻求实际支持的教育建议，不是疾病治疗课程。
- 产品决定：S02 的小计划和回顾结构是 Sunrain 的实现草案；不据此宣称等同于行为激活治疗或可以替代照护计划。
- 权利：页面说明文字通常属公共领域，可使用并注明 NIMH；不包括图片。该说明不证明我们翻译的准确性，仍需逐语言审阅。

### E12 首次沟通准备参考

- 来源：[NIMH Tips for Talking With a Health Care Provider About Your Mental Health](https://www.nimh.nih.gov/health/publications/tips-for-talking-with-your-health-care-provider)，出版号 22-MH-8094。
- 支持范围：咨询初级医疗、预先整理问题与相关信息、可选择由信任的人陪同、在就诊时提问。
- 产品决定：用于 H01 沟通准备。预约模板为 Sunrain 原创草案；不能当作诊断访谈或自动发送给服务方。
- 权利：页面文字说明可按公共领域使用并注明 NIMH，不包含图片；不能把翻译标为 NIMH 官方译本。

### E13 一般服务查找与障碍处理

- 来源：[NIMH Help for Mental Illnesses](https://www.nimh.nih.gov/health/find-help)，页面审阅日期 2026-04。定位：How can I find a health care provider or treatment、How do I know if a provider is right for me。
- 支持范围：医疗、官方目录、保险及可能的学校或员工支持途径，联系服务前核对费用与适合程度；页面的具体服务主要适用于美国。
- 产品决定：H01 的一般准备可跨语言呈现，地区服务与资格仍分别核实。美国 FindTreatment.gov 已由该官方页面引用，但其交互查询和预约未测试；不得宣称已验证所有机构。

### E14 WHO 压力管理指南的语言覆盖

- 来源：[Doing What Matters in Times of Stress 官方资源页](https://www.who.int/publications/i/item/9789240003927)，2020-04-29。定位：Language 与 Audio exercises 表。
- 支持范围：官方页面列出英文、简中、繁中、西语、日语、韩语、印地语、阿拉伯语指南；部分语言有音频。不能据此声称所有语言均有音频。
- 核验状态：官方资源页已读取；尝试各指南下载时出现访问限制或超时，未完成完整文件和许可核验。使用官方资源页作为备选入口，不将下载标为可用性已验证。
- 产品决定：后续优先核验现有正式版本，避免擅自将自助课程从英文整套翻译。当前八语内容包是 Sunrain 草案，不是 WHO 课程的转载或官方翻译。

### E15 英格兰一般心理支持入口

- 来源：[NHS Find talking therapies for anxiety and depression](https://www.nhs.uk/nhs-services/mental-health-services/find-nhs-talking-therapies-for-anxiety-and-depression/)，页面审阅日期 2025-02-14。
- 支持范围：英格兰居民通常满 18 岁可自我转介，部分地区接收较年轻用户；无需先有正式诊断。具体范围以服务当时条件为准，不能用于其他国家或推定服务语言。
- 产品决定：仅收录官方查找入口和其地区条件，未实际提交查询、转介或预约。不自动把英文用户定位到英格兰。

新内容的源文字、翻译和 UI 适配分别记录。八语草案与逐出口内容见 [SUPPORT_CONTENT.md](./SUPPORT_CONTENT.md)。

## 每项内容的发布记录

### E18–E22. 新增地区入口与核验范围（2026-10-19）

- 日本：[厚生労働省 医療情報ネット](https://www.iryou.teikyouseido.mhlw.go.jp/znk-web/juminkanja/S2300/initialize)。已读取科室、地区、语言等查询入口和网站语言选项；未执行机构查询或预约。网站翻译不能解释为医生提供对应语言服务。
- 韩国：[国立精神健康中心机构介绍与位置查询入口](https://www.mentalhealth.go.kr/portal/health/fac/PotalHealthFacListTab1.do)。已读取中心、医疗机构等类型介绍和位置查找入口；未测试实际查询结果或接诊。
- 西班牙：[卫生部 REGCESS](https://regcess.mscbs.es/regcessWeb/inicioBuscarCentrosAction.do)。已读取按地区、机构类型、服务等字段查询的官方登记入口；登记不代表适合某一用户、免费或可预约。
- 香港：[医院管理局专科门诊](https://www.ha.org.hk/visitor/ha_visitor_index.asp?Content_ID=10053&Lang=CHIB5&Dimension=100&Parent_ID=10042)及其嵌入的官方指引。已读取新症转介与预约资料要求；没有测试精神科门诊的实际预约，也不宣称某一渠道适用于全部专科。
- 中国北京：[北京大学第六医院预约挂号指引](https://www.pkuh6.cn/Html/Mobile/Articles/4914.html)，官方文章日期 2025-12-08。已读取其微信小程序和挂号流程；仅收录该医院自身说明，不代表全国目录、推荐排名或可用号源。

未能读取完整入口的台湾、印度等候选资料没有加入运行目录。上述核验只涉及官方信息，不是对机构质量、服务响应或语言可用性的认可。运行 URL、实际网站语言和检查日期集中在 [运行目录](../src/data/support-services.json)，每个界面语言的地区标签和操作说明在运行文案包中。原始机构名称按其网站呈现，不能将名称误当作未翻译的流程说明。

日常活动的新增例子和分步 UI 是根据 E10、E11、E17 的范围编写的产品适配，不是新增的治疗方法或经验证的课程。选择休息、减少任务、寻求实际协助和安排可承受的小步骤，不产生完成分数、连续打卡要求或疗效结论。临床与母语审阅状态仍为 pending。

每个工具、目标语言版本、自助内容及结果响应分别记录：

| 记录项 | 完成条件 |
|---|---|
| 来源与定位 | 原始链接、出版/版本日期、具体章节；说明该来源支持哪一项用途 |
| 使用范围 | 人群、语言、场景、回顾时间、覆盖范围和限制 |
| 权利状态 | 公开站点展示、数字化、翻译和改编条件；所需授权凭据 |
| 版本一致性 | 原始内容与站点实现的差异记录、评分及缺失处理比对 |
| 专业审阅 | 审阅人的资质与相关经验、日期、内容版本、覆盖范围及结论 |
| 后续支持 | 安全响应、结果解释、适合与不适合的行动、求助渠道 |
| 验证 | 技术与可用性检查结果；任何临床效果主张须有对应研究 |

状态分别记录为“未核验”“核验中”“完成”或“不适用并说明原因”。只有相关项目满足发布条件后，工具才进入新初筛流程；不能用“有来源”一项替代其他条件。

发现来源或许可变化、译本差异、错误提示及过期求助信息时，暂停受影响的新内容，保留一般教育与求助入口。未完成评估、未覆盖领域和不适用情境不得显示为正常结果。


## E16. 危机支持目录

- 来源：[Find A Helpline — About](https://findahelpline.com/about)。2026-10-19 读取官方说明：由 ThroughLine 维护，服务方直接核验信息。
- 当前实现只提供目录入口，不复制号码、不把短信说明转换为电话链接，不宣称已经验证具体求助、响应时间或覆盖全部地区。它不是紧急救援调度。

## E17. 整理担忧的教育参考

- 来源：[NHS Every Mind Matters — Tackling your worries](https://www.nhs.uk/every-mind-matters/mental-wellbeing-tips/self-help-cbt-techniques/tackling-your-worries/)。2026-10-19 读取正文。
- 参考范围：区分可行动的问题与暂不可控制的担忧，为可行动的部分拟定具体步骤。站内采用自行编写的简短一般教育文字，未复制整套课程、图片或视频，也未宣称 NHS 审批或治疗疗效。独立专业和母语审阅仍未完成。


## 2026-10-19：基于来源的 AI 内容与语言核查

本次核查由 AI 执行，不是独立临床审阅或母语者签署。运行文案中的 `review.sourceConsistency` 与 `review.languageConsistency` 分别记录这两种检查，`professional` 和 `language` 继续如实保留为 pending。没有填写虚构的审阅人、资质或批准日期。

逐语言核对 en、zh-hans、zh-hant、es、ja、ko、hi、ar 的范围声明、紧急支持、精力与睡眠提示、四项活动、停止/跳过、保存边界和沟通准备。比对重点是语义与操作条件，不把字段齐全等同于翻译自然或医学有效。

- 重新读取 NIMH 自我照顾、双相障碍和就诊沟通准备资料（E11、E12），以及 NHS 整理担忧页面（E17）和 RUH 感官练习手册（E10）。NICE CG185 正文此次返回 403；相关规定可通过其官方检索摘要核对，但本次不声称重新完整读取了该指南。没有因此新增诊断规则、疾病概率、治疗或药物建议。
- 修正精力/睡眠提示的条件：选择项是“或”，回应不再假定用户同时报告了两项变化。它只是建议专业评估，不意味着识别出了双相障碍。
- 把“可跳过不适用或不舒服的感官步骤”提前到活动开始，避免用户直到后续步骤才知道可以跳过。
- 沟通准备中明确区分已经尝试与正在考虑的支持；未执行的计划不表述为已完成的治疗。
- 活动计划超过沟通栏容量时显示八语提示，完整计划继续留在本页，不能静默丢失。用户自行编辑的沟通内容不会被后续自动整理覆盖。
- 七个服务入口均重新取得 HTTP 200 并核对目的站点、机构名称及说明；HTTP 成功不等于查询、预约、服务响应或接诊成功。没有向机构发送消息、提交预约或提供个人健康信息。

这是可重复的编辑和工程核查记录，不是 Sunrain 的临床效果证据。真实用户研究、专业身份和母语者独立审校不能由浏览器测试或 AI 自行署名代替。

## E23. 青少年访问与求助指引（2026-10-19）

- 已读取 [NHS 儿童与青少年求助指引](https://www.nhs.uk/mental-health/children-and-young-adults/mental-health-support/how-to-get-support/where-to-get-support/)和 [NIMH Teen Depression](https://www.nimh.nih.gov/health/publications/teen-depression)。NHS 页面显示上次审阅为 2023-07-19；本次读取日期不替代其医学审阅日期。
- 支持范围：向专业人员、学校或可信任成年人寻求支持；NHS 说明在英格兰可能经 GP、学校或自我转介获得儿童青少年服务，具体资格、转介和同意要求因当地服务而异。NIMH 面向青少年的资料支持在持续困扰时向可信任成年人和专业人员求助，不能证明 Sunrain 的活动具有青少年治疗效果。
- 产品决定：一般近况梳理不要求确认年满 18 岁、不收集年龄；八语青年提示强调参考用途和尽早专业求助。“让用户感到安全”的成年人属于产品适配，不假定父母总是安全，不把父母许可设为访问站点的条件。英格兰成人服务旁补充明确标注地区和网站语言的 NHS 青少年路径，并保留无 JavaScript 阅读入口。
- 边界：不许诺医疗服务免家长同意或绝对保密，不把成人工具开放给未成年人，不新增疾病问卷、评分或治疗建议。未复制原文问卷、图片或完整课程；本站文字与八语翻译由 Sunrain 编写，不是机构官方译本或认可。独立专业与母语审阅状态继续保留 pending。


## E25. K6 日语版与计分（2026-10-19）

- [作者官方发布页](https://rckessler.scholars.harvard.edu/k10-and-k6-scales)：读取当前全文，明确 K6/K10 免费、无需正式许可；其发布译本可自由使用，须保留版权和引用 Kessler et al. (2003), doi:10.1001/archpsyc.60.2.184。旧 PDF 页脚要求联系许可，不应单独解释为公共领域；当前使用依据是同一作者现行网站的明确许可。没有向作者发送消息，也没有虚构额外授权。
- [日语 K6+ 原文 PDF](https://rckessler.scholars.harvard.edu/sites/g/files/omnuum8166/files/2026-03/Japanese_K6.pdf)：下载全文，读取三页并查看第一页渲染；核心六题、五个频率选项、过去 30 天时间窗；日语译者为 Toshiaki Furukawa、Norito Kawakami、Yoshiharu Kim。保留 © Ronald C. Kessler, PhD. 2007 及要求的文献引用。仅采用六个计分项目，不收集 PDF 中的姓名、住址、出生日期、研究编号等，不采用额外补充题。作者说明额外补充题并非计分所必需。
- [官方计分 FAQ](https://rckessler.scholars.harvard.edu/sites/g/files/omnuum8166/files/2026-03/Scoring_K6_K10.pdf)：全文两页已读。选项按高频至无症状排列，实际分值为 4/3/2/1/0，总分 0–24，不能直接累加表格中的 1–5 编号。FAQ 说明常用 13+ 阈值依赖校准人群；本实现不引入该诊断阈值、不沿用 PHQ/GAD 的症状分段，不输出疾病概率。
- [Furukawa et al., 2008](https://doi.org/10.1002/mpr.257)：读取出版者/索引摘要，日语 K6/K10 在 WMH-J 的 2,436 人研究中与 CIDI 比较。没有把论文或译本可用性表述为 Sunrain 获得临床批准，也未宣称已完整阅读研究全文或验证各年龄群适用性。
- 实现差异与边界：纸上圈数字改为单选；标题标明核心 K6 而非含补充题的 K6+；不改变核心题意或答案顺序。只有日语新增 K6；PHQ-9 与 K6 分别标明两周和 30 天，得分分开。青少年只显示原始记录，保留该语言青少年临床适合性未核验说明。一般求助、自助和未成年人入口继续可用。源 PDF、计分 PDF 和转录内容摘要见运行注册表。独立专业及母语审阅仍为 pending。
