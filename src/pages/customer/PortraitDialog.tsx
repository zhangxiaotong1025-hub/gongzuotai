import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Brain, Activity, Heart, Target, Sparkles, Zap, Eye, Users, Star, Clock,
  Lightbulb, TrendingUp, Shield, AlertTriangle, CheckCircle, ArrowRight,
  MessageCircle, Repeat, DollarSign, Rocket, Flame, ThumbsUp, Award,
} from "lucide-react";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
export interface BehaviorTrait {
  label: string;
  level: "high" | "medium" | "low";
  score: number;
  evidence: string;
  detail: string;
  icon: React.ElementType;
}
export interface PersonalityTrait {
  dimension: string;
  score: number;
  leftLabel: string;
  rightLabel: string;
  desc: string;
  detail: string;
}
export interface DeepNeed {
  category: string;
  need: string;
  urgency: "urgent" | "normal" | "latent";
  importance: number;
  basis: string;
  suggestion: string;
  detail: string;
  icon: React.ElementType;
}
export interface DesignPreference {
  dimension: string;
  preference: string;
  confidence: number;
  basis: string;
  detail: string;
}
export interface RiskOpportunity {
  type: "risk" | "opportunity";
  title: string;
  detail: string;
  impact: "high" | "medium" | "low";
  action: string;
}
export interface ServiceStrategy {
  title: string;
  timing: string;
  channel: string;
  content: string;
  expectedOutcome: string;
  icon: React.ElementType;
}
export interface PortraitData {
  behaviorTraits: BehaviorTrait[];
  personalityTraits: PersonalityTrait[];
  deepNeeds: DeepNeed[];
  designPreferences: DesignPreference[];
  radarDimensions: { name: string; value: number }[];
  persona: string;
  personaDesc: string;
  healthScore: number;
  activityHeatmap: number[][];
  interestBubbles: { name: string; weight: number; color: string }[];
  journeyStages: { name: string; status: "done" | "current" | "future"; metric: string }[];
  // ── New rich narrative fields ──
  profileNarrative: string;       // 一段话讲清楚这个人
  valueAssessment: string;        // 价值研判
  serviceApproach: string;        // 服务策略总纲
  riskOpportunities: RiskOpportunity[];
  serviceStrategies: ServiceStrategy[];
  keyInsights: string[];          // 关键洞察 bullet points
  communicationStyle: { style: string; dos: string[]; donts: string[] };
  decisionFactors: { factor: string; weight: number; evidence: string }[];
}

/* ═══════════════════════════════════════════
   MOCK DATA — DESIGNER
   ═══════════════════════════════════════════ */
export const DESIGNER_PORTRAIT: PortraitData = {
  persona: "效率创作型",
  personaDesc: "以产出效率为核心竞争力的实战型设计师，善用AI工具批量出图，服务中小型家装客户为主，正处于从「接单执行」向「品牌化运营」转型的关键期",
  profileCards: [
    { icon: "user", label: "身份", value: "室内设计师 · 4年", color: "primary" },
    { icon: "map", label: "市场", value: "杭州 · 中小型家装", color: "blue" },
    { icon: "zap", label: "产出力", value: "42套/月 Top 8%", color: "emerald" },
    { icon: "brain", label: "工作方式", value: "AI出图占比87%", color: "violet" },
    { icon: "dollar", label: "累计消费", value: "¥28,600", color: "amber" },
    { icon: "repeat", label: "续费习惯", value: "3次 · 提前8天", color: "cyan" },
    { icon: "clock", label: "效率提升", value: "4.2h→1.8h/套", color: "emerald" },
    { icon: "target", label: "核心驱动", value: "效率 · 接单 · ROI", color: "primary" },
  ],
  healthScore: 78,

  profileNarrative: "张明是一位从业4年的室内设计师，目前服务于杭州地区的中小型家装市场。他的核心特征是「效率至上」——月均产出42套设计方案（平台Top 8%），AI辅助出图占比达87%，单套方案平均耗时从入驻初期的4.2小时压缩至1.8小时。他是典型的工具型用户，对能提升出图速度和客户成交的功能有极高的付费意愿（历史续费3次，每次均在到期前主动续费），但对社交传播类功能兴趣较低。从消费行为看，他属于「精准投入型」——只为直接产生收益的功能付费，累计消费¥28,600，ARPU高于同级用户均值35%。当前最大风险点是过度依赖单一风格（78%为现代简约），一旦市场风格偏好变化，产出竞争力可能下降。最大机会点是他的高产出量尚未转化为个人品牌影响力——他从未使用过作品展示和设计师主页功能，而同量级设计师中，开通主页者的客户溢价平均高出22%。",

  valueAssessment: "当前客户生命周期价值（LTV）预估¥85,000，位于平台设计师P75分位。续费确定性高（历史续费率100%，平均提前8天续费），但增购空间尚未打开——他只使用基础渲染和AI出图两大核心模块，VR全景、智能家居方案等高价值模块使用率为零。若成功激活品牌化运营（作品集+设计师主页），预估LTV可提升至¥120,000+，同时带来2-3个转介绍获客。",

  serviceApproach: "对张明的服务核心是「用效率换信任，用数据说服」。他不需要情感关怀式服务，而是需要被证明：你推荐的功能确实能帮他多接单、多赚钱。每一次触达都应该带有明确的数据支撑和ROI预估，而非泛泛的功能介绍。建议的沟通节奏是每月1-2次高价值触达，避免高频打扰。最佳触达时间为工作日下午14:00-16:00（他的方案整理时段，注意力有空闲）。",

  keyInsights: [
    "他的效率优势正在形成「路径依赖」——87%使用AI出图意味着一旦竞品提供更快的AI工具，迁移风险极高",
    "最近30天4K渲染使用率从8%升至16%，说明他开始接触对效果要求更高的客户，这是推动套餐升级的窗口",
    "他在周四的产出量比其他工作日高40%，推测周四是他的集中出图日，适合在周三下午推送功能更新提醒",
    "教程完成率78%但从不参与社区讨论，说明他是「静默学习者」——适合推送文字教程而非直播课",
    "3次续费均在到期前8天内完成，说明他有固定的费用审核周期，到期前10天是最佳续费提醒时间点",
  ],

  communicationStyle: {
    style: "直接、数据驱动、结果导向",
    dos: [
      "用数据和案例说话，如「同类设计师使用XX功能后客单价提升22%」",
      "提供可量化的ROI预估，如「开通设计师主页预计月增3-5个精准询盘」",
      "尊重他的时间，每次沟通控制在5分钟内，直奔主题",
      "在他的空闲时段（周一至周五14:00-16:00）触达",
    ],
    donts: [
      "不要用「亲」「哦」等过于亲昵的称呼，他偏好专业平等的对话方式",
      "不要推荐与出图效率无关的功能，会降低信任度",
      "不要在上午9-12点打扰，这是他的核心创作时段",
      "不要发大段文字，他偏好结构化的清单式信息",
    ],
  },

  decisionFactors: [
    { factor: "能否提升出图效率", weight: 35, evidence: "历史上所有付费决策都与效率提升直接相关" },
    { factor: "能否增加客户成交", weight: 30, evidence: "3次主动咨询均涉及「如何让客户更快签约」" },
    { factor: "投入产出比", weight: 20, evidence: "每次续费前会对比竞品定价，但最终因效率优势留下" },
    { factor: "学习成本", weight: 10, evidence: "放弃过2次新功能尝试，原因是「学不会」「太复杂」" },
    { factor: "同行口碑", weight: 5, evidence: "加入了2个设计师社群，偶尔参考群内推荐" },
  ],

  riskOpportunities: [
    { type: "risk", title: "风格依赖风险", detail: "78%方案为现代简约，一旦市场趋势转向（如新中式热度已同比上升45%），他的方案模板库将面临大面积失效，导致产出效率骤降", impact: "high", action: "在现有AI出图流程中嵌入「风格多样性提示」，并赠送新中式模板体验包" },
    { type: "risk", title: "竞品迁移风险", detail: "高度工具化的使用方式意味着低切换成本。竞品X近期上线了类似AI出图功能，且首年定价低30%", impact: "medium", action: "在续费窗口期（到期前10天）提供忠诚用户专属续费折扣，并展示历史数据资产价值" },
    { type: "opportunity", title: "品牌化升级机会", detail: "月产42套方案但零公开展示，同量级设计师开通主页后客户溢价+22%、询盘+35%。他的高产量是天然的内容资产", impact: "high", action: "精选他的10套最佳方案，提供一键生成作品集的专属邀请，附带「预计月增询盘数」的数据预估" },
    { type: "opportunity", title: "4K渲染升级窗口", detail: "近30天4K使用率翻倍（8%→16%），说明客户群体正在升级。当前基础版4K额度即将用尽", impact: "medium", action: "在他下次触发4K渲染时弹出升级引导，展示「专业版用户平均客单价高出¥2,800」" },
    { type: "opportunity", title: "转介绍激活潜力", detail: "已推荐3人注册但未形成持续机制。设计师社群中有一定影响力，若激活可成为KOC", impact: "medium", action: "推出「师徒计划」——每成功推荐1人续费，双方各获1个月高级功能体验" },
  ],

  serviceStrategies: [
    { title: "风格拓展引导", timing: "本周内", channel: "站内消息 + 模板推送", content: "推送「新中式AI快速出图」模板包，附带3分钟快速上手视频。话术：「你的出图效率可以直接复用到新中式——已有127位设计师用同样方法拓展了第二风格线」", expectedOutcome: "新中式方案产出从0提升至月均5套，降低风格集中度风险", icon: Lightbulb },
    { title: "设计师主页激活", timing: "下次续费时（预计4月中旬）", channel: "1对1微信", content: "精选他的10套高赞方案，提供「一键开通设计师主页」的专属链接。话术：「你上月产出42套方案，是平台Top 8%的设计师。同级别设计师开通主页后，月均多接3.2单，客单价提升¥2,200。我们帮你精选了10套最佳作品，点击即可上线」", expectedOutcome: "开通主页后3个月内自然询盘+15-20个，预计新增GMV ¥8,000-12,000", icon: Rocket },
    { title: "续费关怀触达", timing: "到期前10天", channel: "站内通知 + 短信", content: "展示他过去一年的使用数据报告（方案数、渲染量、节省时间），并提供忠诚用户专属续费价（95折）。话术：「过去一年你用平台节省了约480小时，产出了504套方案。作为连续3年的忠诚用户，我们为你准备了专属续费方案」", expectedOutcome: "续费率维持100%，同时引导关注专业版增值功能", icon: Repeat },
    { title: "高端客户承接能力培养", timing: "持续（月度）", channel: "精准推送教程", content: "每月推送1篇「高端住宅设计出图技巧」文字教程（非视频），重点讲解4K渲染、灯光氛围、材质细节的快速调参方法", expectedOutcome: "4K渲染使用率提升至40%，支撑他承接更高客单价项目", icon: TrendingUp },
  ],

  radarDimensions: [
    { name: "创作活跃", value: 92 }, { name: "工具深度", value: 65 },
    { name: "付费意愿", value: 82 }, { name: "分享传播", value: 35 },
    { name: "学习成长", value: 70 }, { name: "客户服务", value: 58 },
  ],
  activityHeatmap: [
    [0,0,0,0,0,0,1,3,8,12,15,10,5,9,18,22,15,8,4,2,1,0,0,0],
    [0,0,0,0,0,1,2,5,10,14,18,12,6,11,20,25,18,10,5,3,1,0,0,0],
    [0,0,0,0,0,0,1,4,9,11,14,8,4,8,15,19,14,7,3,2,0,0,0,0],
    [0,0,0,0,0,1,2,6,12,16,20,14,7,12,22,28,20,12,6,4,2,1,0,0],
    [0,0,0,0,0,0,1,5,11,15,18,11,5,10,19,24,17,9,4,2,1,0,0,0],
    [0,0,0,0,0,0,0,2,4,6,8,5,3,4,6,8,5,3,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,3,4,2,1,2,3,4,2,1,0,0,0,0,0,0],
  ],
  interestBubbles: [
    { name: "AI设计", weight: 89, color: "bg-primary" },
    { name: "3D渲染", weight: 71, color: "bg-blue-500" },
    { name: "方案导出", weight: 54, color: "bg-emerald-500" },
    { name: "模型下载", weight: 38, color: "bg-amber-500" },
    { name: "VR全景", weight: 25, color: "bg-violet-500" },
    { name: "智能家居", weight: 18, color: "bg-pink-500" },
    { name: "全屋定制", weight: 65, color: "bg-cyan-500" },
    { name: "高端住宅", weight: 72, color: "bg-indigo-500" },
  ],
  journeyStages: [
    { name: "注册", status: "done", metric: "2024-03" },
    { name: "首次付费", status: "done", metric: "5天转化" },
    { name: "活跃使用", status: "done", metric: "22天/月" },
    { name: "升级套餐", status: "done", metric: "2次升级" },
    { name: "推荐他人", status: "current", metric: "已推3人" },
    { name: "品牌大使", status: "future", metric: "待激活" },
  ],
  behaviorTraits: [
    { label: "高频创作", score: 92, level: "high", evidence: "月均42套 Top 8%", detail: "日均产出1.4套方案，周四集中出图（产出量高于其他工作日40%），推测存在固定的客户交付节奏。近3个月产出稳定无下降趋势。", icon: Zap },
    { label: "AI依赖度", score: 88, level: "high", evidence: "AI出图占比87%", detail: "几乎所有方案均使用AI辅助生成，手动调整比例仅13%。这意味着他对AI出图质量高度敏感——任何AI算法更新都会直接影响他的产出。", icon: Brain },
    { label: "效率优先", score: 88, level: "high", evidence: "方案耗时4.2→1.8h", detail: "入驻2年内将单套方案耗时压缩57%。他的操作路径高度模板化——90%的方案使用不超过5个固定模板，说明他已形成成熟的生产流水线。", icon: Activity },
    { label: "渲染升级中", score: 65, level: "medium", evidence: "4K使用率8%→16%", detail: "近30天4K渲染使用量翻倍，说明开始承接对效果要求更高的客户。但尚未触及专业版4K额度上限，预计2-3个月后可能面临额度不足。", icon: Eye },
    { label: "功能探索", score: 58, level: "medium", evidence: "6/8核心功能", detail: "已掌握6个核心功能（AI出图、3D渲染、方案导出、模型库、尺寸标注、材质替换），但VR全景和智能家居方案从未使用。放弃原因可能是「不确定客户是否需要」而非学习障碍。", icon: Lightbulb },
    { label: "社交传播", score: 35, level: "low", evidence: "公开分享3次/月", detail: "仅在被客户要求时才会分享方案链接。从未使用作品展示功能。但值得注意的是他在2个设计师微信群中活跃，偶尔分享使用心得，有KOC潜力但需要激励机制。", icon: Users },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 78, leftLabel: "感性", rightLabel: "理性", desc: "数据驱动型", detail: "他的每一次付费决策都能追溯到明确的效率提升需求。在客服咨询记录中，他3次主动要求提供「使用前后对比数据」。对「限时优惠」类促销不敏感，但对「功能升级」类信息响应率高。" },
    { dimension: "价格敏感", score: 40, leftLabel: "敏感", rightLabel: "不敏感", desc: "价值导向", detail: "不是不在乎价格，而是先评估价值再考虑价格。续费前会对比竞品定价（浏览记录显示访问过竞品官网），但因效率优势最终留下。对他来说，「省下的时间×时薪」是核心决策公式。" },
    { dimension: "社交倾向", score: 38, leftLabel: "内向", rightLabel: "外向", desc: "私域影响力", detail: "平台上极少互动（0条评论，3次分享），但在微信生态有一定影响力——2个设计师社群活跃成员，朋友圈偶尔分享作品。属于典型的「线下社交型」，不喜欢公开的线上展示但愿意在熟人圈子分享。" },
    { dimension: "风险偏好", score: 55, leftLabel: "保守", rightLabel: "进取", desc: "谨慎尝鲜", detail: "会尝试新功能（教程完成率78%），但需要先看到他人的成功案例。他放弃的2次新功能尝试都发生在「没有找到教程」的情况下。如果提供清晰的分步指引，接受度会显著提高。" },
    { dimension: "品牌忠诚", score: 72, leftLabel: "低", rightLabel: "高", desc: "条件忠诚", detail: "连续3年续费且每次提前续费，但忠诚度建立在「效率优势」之上。如果竞品在AI出图速度上实现赶超，他的迁移意愿会很高。需要通过数据资产沉淀（方案库、客户偏好数据）来提升切换成本。" },
  ],
  deepNeeds: [
    { category: "效率", need: "进一步缩短全流程出图时间", urgency: "urgent", importance: 95, basis: "频繁使用批量渲染，平均每次提交8张", suggestion: "提供「一键批量出图」快捷入口+常用参数预设", detail: "他的工作流瓶颈已经不在设计环节，而在渲染等待和导出整理。如果能将渲染队列管理和成果打包导出合并为一步操作，预计可再节省30%的后期时间。这是留住他的核心筹码。", icon: Zap },
    { category: "获客", need: "建立个人设计师品牌", urgency: "normal", importance: 70, basis: "月产42套但零公开展示", suggestion: "一键生成作品集+设计师主页", detail: "他目前的获客方式100%依赖线下转介绍和门店合作，没有线上获客渠道。同时他的作品质量在平台Top 15%但完全没有曝光。如果开通设计师主页，基于他的产出量和风格，预计月均可获得15-20次曝光，转化3-5个精准询盘。", icon: Target },
    { category: "品质", need: "提升交付专业度以匹配高端客户", urgency: "normal", importance: 65, basis: "4K使用率正在上升", suggestion: "赠送专业版4K渲染体验额度", detail: "他正在从服务中端客户（客单价¥8,000-15,000）向高端客户（¥20,000+）过渡。4K渲染、灯光方案、材质细节将成为他获取高端客户信任的关键工具。", icon: Star },
    { category: "风格", need: "拓展第二设计风格线", urgency: "latent", importance: 55, basis: "78%现代简约，新中式市场增长45%", suggestion: "新中式AI模板包+转型案例分享", detail: "他可能还没意识到这个需求，但市场数据表明新中式风格的搜索和需求量同比增长45%。如果他不拓展风格线，1-2年内可能面临客源收窄。需要用「同行已经在做」的社会证明来触发他的紧迫感。", icon: TrendingUp },
    { category: "管理", need: "客户关系数字化管理", urgency: "latent", importance: 40, basis: "客户信息散落在微信聊天中", suggestion: "轻量CRM工具集成", detail: "从他的使用行为推断，他的客户管理完全依赖微信和记忆。随着客户量增加（月均新增5-8个），遗漏跟进的风险在上升。但这个需求优先级低于效率和获客，可在关系建立后逐步引导。", icon: MessageCircle },
  ],
  designPreferences: [
    { dimension: "设计风格", preference: "现代简约", confidence: 95, basis: "78%方案使用简约模板", detail: "偏好直线条、开放式布局、极简配色。他的简约方案有一个明显特征：大量使用白色+原木色的组合，灰色系作为辅助。对复杂装饰元素（如雕花、罗马柱）的使用率接近零。" },
    { dimension: "色彩倾向", preference: "低饱和暖色系", confidence: 82, basis: "67%材质选择暖色调", detail: "他的方案色彩体系非常一致：主色调为白/米白（60%），辅助色为原木/浅胡桃（25%），点缀色为雾灰/莫兰迪绿（15%）。几乎不使用高饱和度的撞色设计。" },
    { dimension: "空间类型", preference: "住宅全屋·客厅为主", confidence: 90, basis: "客厅方案占比42%", detail: "方案中客厅占42%、卧室28%、厨房18%、卫浴12%。说明他的客户群以全屋定制需求为主，但客厅是他的核心展示空间——这也是他在客户沟通中最常展示的方案类型。" },
    { dimension: "材质偏好", preference: "实木+岩板", confidence: 78, basis: "木质材质使用率52%", detail: "实木使用率52%，岩板/石材28%，金属12%，布艺8%。值得注意的是，近2个月岩板使用率从20%提升至28%，说明他的客户群审美正在从「温暖自然」向「轻奢质感」微调。" },
    { dimension: "渲染风格", preference: "自然光·45°鸟瞰", confidence: 88, basis: "79%使用自然光参数", detail: "79%的渲染使用自然光参数，21%使用氛围灯光。相机角度偏好45°俯瞰（68%）和平视（27%）。这种组合能最高效地展示空间布局，与他「效率优先」的行为特征一致。" },
  ],
};

/* ═══════════════════════════════════════════
   MOCK DATA — END CUSTOMER
   ═══════════════════════════════════════════ */
export const EC_PORTRAIT: PortraitData = {
  persona: "品质决策型",
  personaDesc: "高净值家庭装修决策人，追求「省心+高品质」的一站式服务体验，决策周期长但一旦信任建立后忠诚度极高，有较强的朋友圈传播意愿",
  profileCards: [
    { icon: "user", label: "身份", value: "女主人 · 35-40岁", color: "primary" },
    { icon: "home", label: "项目", value: "140㎡改善型住房", color: "blue" },
    { icon: "dollar", label: "预算", value: "¥35万 · 高于均值40%", color: "amber" },
    { icon: "clock", label: "决策周期", value: "87天 · 信任后极快", color: "violet" },
    { icon: "eye", label: "决策方式", value: "视觉驱动 · 效果图优先", color: "cyan" },
    { icon: "share", label: "传播力", value: "朋友圈3次 · 带来2咨询", color: "emerald" },
    { icon: "star", label: "品质态度", value: "品质优先 · 愿意溢价", color: "amber" },
    { icon: "target", label: "核心诉求", value: "省心 · 收纳 · 一站式", color: "primary" },
  ],
  healthScore: 85,

  profileNarrative: "李女士是一位35-40岁的高净值家庭女主人，正在为新购的140㎡改善型住房进行全屋装修。她的决策特征是「视觉驱动+品质导向」——在87天的决策周期中，她浏览了380+张效果图，对比了3个平台的方案，最终选择我们是因为「效果图最真实，而且设计师能根据我的想法快速改方案」。她的预算定位在中高端（总预算约¥35万，客单价高于区域均值40%），愿意为品质溢价，但需要被「看到」而非「说服」——她更相信效果图和实景对比，而非销售话术。值得重点关注的是，她在签约后的朋友圈分享了3次装修进展，带来了2个朋友的咨询。她是典型的「体验驱动型传播者」——如果服务体验超预期，她会自发传播；但如果任何环节让她感到「不专业」，她也会迅速在社交圈表达不满。",

  valueAssessment: "当前订单金额¥35万（已签约），预计全项目周期贡献GMV ¥42-48万（含增购软装+智能家居概率72%）。更重要的是她的社交传播价值——她的朋友圈已带来2个精准咨询，若服务体验持续超预期，预估全周期可转介绍3-5个同圈层客户，间接贡献GMV ¥80-120万。她是该企业近半年获客成本最低的渠道来源之一。",

  serviceApproach: "李女士的服务核心是「超预期的可视化体验+适度的主动关怀」。她不需要被频繁跟进（会感到被催促），但需要在关键节点收到「比她预期更多」的信息——比如施工前主动发送材料实拍对比图、每个节点完成后发送实景vs效果图对比。沟通风格上要专业但不生硬，适当加入生活化的关心（如「上次您提到孩子喜欢蓝色，我们在儿童房加了一个星空主题灯带方案，您看看？」）。",

  keyInsights: [
    "她的决策周期虽长（87天），但信任建立后极少反复——签约后只提出了2次小修改，远低于同类客户均值（7次），说明前期沟通充分有效",
    "她在晚上19:00-22:00浏览方案的频率最高，周末全天活跃，说明装修决策是她的「家庭项目」，可能与家人一起讨论",
    "她3次提到「收纳」这个关键词，分别在客厅、卧室和厨房方案沟通中，这是她的核心痛点（可能与当前居住空间收纳不足有关）",
    "签约后她主动问过2次施工进度，间隔分别是12天和15天，建议每10天主动推送一次进度报告，比她主动问的频率略快",
    "她分享到朋友圈的3次内容都是效果图而非施工照片，说明「视觉美感」是她最愿意展示的维度——应重点打磨交付时的最终效果呈现",
  ],

  communicationStyle: {
    style: "温和专业、注重细节、偏好视觉沟通",
    dos: [
      "多用效果图、实拍对比图、3D漫游等视觉素材沟通，她的理解和决策主要靠「看」",
      "在关键节点（测量、设计定稿、施工启动、验收）主动发送阶段性报告",
      "适度展示个性化关怀——记住她提过的细节偏好并主动融入方案",
      "晚上19:00-21:00是她最活跃的沟通时段，消息回复率最高",
    ],
    donts: [
      "不要频繁打电话——她更偏好微信图文沟通，电话沟通容易让她感到被打扰",
      "不要使用行业术语（如「模数」「标准柜体」），她更习惯生活化的描述",
      "不要在工作日上午联系她——推测为职业女性，上午时段回复率极低",
      "不要在没有视觉素材的情况下描述方案变更——她需要「看到」而不是「听到」",
    ],
  },

  decisionFactors: [
    { factor: "效果图真实度", weight: 30, evidence: "3次提到「效果图和实际能一样吗？」" },
    { factor: "设计师响应速度", weight: 25, evidence: "选择我们的原因是「改方案快」" },
    { factor: "材质品质感", weight: 20, evidence: "主动要求看材料实物样板" },
    { factor: "一站式省心程度", weight: 15, evidence: "明确说「不想自己跑建材市场」" },
    { factor: "朋友推荐/口碑", weight: 10, evidence: "首次到店是因为邻居推荐" },
  ],

  riskOpportunities: [
    { type: "opportunity", title: "高传播价值客户", detail: "已自发朋友圈分享3次，带来2个精准咨询。她的社交圈层为同小区30-45岁业主群体，正是企业核心目标客群。如果提供「分享激励」（如软装优惠券），预计可再带来3-5个转介绍", impact: "high", action: "在施工关键节点提供专属「进展分享素材包」（精修效果图+对比视频），降低她的分享制作成本" },
    { type: "opportunity", title: "软装+智能家居增购", detail: "她2次提到对软装搭配的兴趣，1次主动询问智能窗帘。当前订单仅含硬装+定制柜，软装和智能家居增购空间约¥8-12万", impact: "high", action: "在硬装施工完成70%时（预计5月中旬），邀请参观软装样板间，同时展示智能家居体验方案" },
    { type: "risk", title: "施工阶段信任衰减", detail: "她的信任建立在「视觉体验」上，但施工阶段（拆改、水电、木工）视觉呈现度低，可能导致她感到进展不透明而焦虑", impact: "medium", action: "引入「施工可视化」——每个阶段提供工地实拍+下阶段效果预览，保持视觉连续性" },
    { type: "risk", title: "细节不满导致口碑反转", detail: "她对细节极其敏感（3次提到收纳细节），如果交付时任何细节与预期不符，她的社交传播会迅速从正面转为负面", impact: "high", action: "交付前安排预验收，逐项核对她在沟通中提到的所有细节需求（已整理清单共17条）" },
  ],

  serviceStrategies: [
    { title: "主动进度推送机制", timing: "即刻启动·每10天一次", channel: "微信图文消息", content: "每10天推送一次「装修进度报告」，包含：工地实拍3-5张、当前进度百分比、下阶段预告（附效果图预览）、以及一个她关心的细节确认（如「您提到的鞋柜感应灯已预留线位，下周安装」）", expectedOutcome: "消除施工阶段信息不对称，维持信任度。预计将她的主动询问频率从2周/次降至1月/次", icon: Eye },
    { title: "软装方案前置预热", timing: "硬装进度70%时（约5月中旬）", channel: "到店体验邀约", content: "邀请她和家人周末到店体验软装样板间。提前准备3套与她硬装风格匹配的软装方案（现代简约·奶油色系），重点展示她关注的收纳解决方案在软装阶段的升级可能", expectedOutcome: "软装增购转化率预估72%，预计增购金额¥6-8万", icon: Heart },
    { title: "转介绍激励计划", timing: "每次朋友圈分享后24小时内", channel: "微信私聊", content: "在她分享装修进展后，私聊发送感谢+专属推荐码：「感谢分享！如果朋友感兴趣，通过您的推荐码签约，双方各享软装设计费8折优惠」。同时提供「精修分享素材包」让她下次分享时使用", expectedOutcome: "3个月内新增转介绍2-3人，降低企业获客成本40%", icon: Users },
    { title: "交付仪式感打造", timing: "交付前2周开始准备", channel: "到店+入户", content: "交付前安排「预验收」——逐项核对17条细节需求。正式交付日准备「新家入住仪式包」（含鲜花、入住卡、家居使用手册），并提供专业摄影师拍摄新家照片（她可用于朋友圈分享）", expectedOutcome: "交付满意度100%，预计触发至少2次高质量朋友圈分享", icon: Award },
  ],

  radarDimensions: [
    { name: "意向度", value: 95 }, { name: "满意度", value: 88 },
    { name: "合作深度", value: 75 }, { name: "转介绍力", value: 82 },
    { name: "预算力", value: 85 }, { name: "配合度", value: 78 },
  ],
  activityHeatmap: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,4,2,0],
    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,6,5,2,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,3,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,8,6,3,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,5,4,1,0],
    [0,0,0,0,0,0,0,0,0,1,2,3,2,1,2,3,2,1,0,1,2,1,0,0],
    [0,0,0,0,0,0,0,0,0,2,3,4,3,2,3,4,3,2,1,1,1,0,0,0],
  ],
  interestBubbles: [
    { name: "全屋定制", weight: 92, color: "bg-primary" },
    { name: "现代简约", weight: 85, color: "bg-blue-500" },
    { name: "橱柜", weight: 78, color: "bg-emerald-500" },
    { name: "衣柜", weight: 72, color: "bg-amber-500" },
    { name: "收纳方案", weight: 88, color: "bg-cyan-500" },
    { name: "软装搭配", weight: 55, color: "bg-violet-500" },
    { name: "智能家居", weight: 40, color: "bg-pink-500" },
    { name: "环保材质", weight: 62, color: "bg-indigo-500" },
  ],
  journeyStages: [
    { name: "录入", status: "done", metric: "2025-08" },
    { name: "首次沟通", status: "done", metric: "3天响应" },
    { name: "方案确认", status: "done", metric: "5轮迭代" },
    { name: "到店体验", status: "done", metric: "2次到店" },
    { name: "签约", status: "done", metric: "87天转化" },
    { name: "增购复购", status: "current", metric: "概率72%" },
  ],
  behaviorTraits: [
    { label: "视觉决策", score: 92, level: "high", evidence: "浏览380+张效果图", detail: "她的决策路径几乎完全依赖视觉信息。在87天决策周期中，她浏览了380+张效果图，下载了47张，反复对比了12组方案。每次方案修改后，她最先看的是整体效果图而非平面图或报价单。", icon: Eye },
    { label: "品质导向", score: 88, level: "high", evidence: "均价+40%于区域", detail: "她的预算定位明确在中高端，总预算¥35万高于区域同面积均值40%。她主动要求看材料实物样板，并在2种同档次材料中选择了价格高15%但纹理更细腻的那款。价格不是她的决策障碍。", icon: Star },
    { label: "多方比较", score: 85, level: "high", evidence: "对比3个平台方案", detail: "签约前对比了3个平台的设计方案，最终选择我们的原因是「效果图最真实」和「改方案最快」。她会在不同平台间做详细的功能对比，但最终用「体验」而非「价格」做决定。", icon: Users },
    { label: "细节敏感", score: 82, level: "high", evidence: "17条细节确认清单", detail: "在沟通中累计提出17条细节确认需求，包括鞋柜感应灯位置、厨房操作台高度（她身高162cm要求台面高度82cm）、主卧窗帘盒宽度等。每一条都需要明确的视觉确认。", icon: Target },
    { label: "社交传播", score: 72, level: "medium", evidence: "朋友圈分享3次", detail: "签约后自发在朋友圈分享了3次装修进展（均为效果图），带来2个同小区邻居的咨询。她的分享有一个规律——只分享「好看的」内容，从不分享施工过程。", icon: MessageCircle },
    { label: "决策节奏", score: 55, level: "medium", evidence: "决策周期87天", detail: "决策周期长但不代表犹豫——她是在系统性地收集信息和验证。每次到店都有明确的验证目的（第1次看整体风格，第2次确认材料质感）。一旦信任建立，后续决策极快（签约后2次修改都在24小时内确认）。", icon: Clock },
  ],
  personalityTraits: [
    { dimension: "决策风格", score: 32, leftLabel: "感性", rightLabel: "理性", desc: "视觉驱动型", detail: "她的决策看似「感性」——靠效果图决定，但实际上她有自己的理性框架：先通过视觉确认「喜不喜欢」，再通过细节确认「靠不靠谱」。与其说她是感性决策，不如说她用视觉作为信任建立的快速通道。" },
    { dimension: "价格敏感", score: 25, leftLabel: "敏感", rightLabel: "不敏感", desc: "品质优先型", detail: "在可承受范围内，她始终选择品质更好的选项。但她并非不看价格——她会默默对比，只是不会把价格作为主要决策因素。对她来说，「贵一点但更好」是完全可接受的，但「贵很多但看不出区别」是不可接受的。" },
    { dimension: "参与度", score: 82, leftLabel: "被动", rightLabel: "主动", desc: "深度参与型", detail: "她不是那种「交给设计师就行」的客户。她会主动参与方案讨论、提出修改意见、确认每一个细节。但她的「主动」是有选择的——她只关心「看得见」的部分（效果、材质、色彩），对隐蔽工程（水电、防水）完全信任专业人士。" },
    { dimension: "信任速度", score: 42, leftLabel: "慢", rightLabel: "快", desc: "验证后信任", detail: "初期信任建立慢（87天），但一旦通过视觉验证和细节确认建立信任，后续几乎不质疑。签约后只提出2次修改（远低于均值7次），说明前期充分沟通后她对设计师高度信任。" },
    { dimension: "传播意愿", score: 68, leftLabel: "低", rightLabel: "高", desc: "体验驱动分享", detail: "她的传播不是因为被要求或激励，而是因为「觉得值得分享」。3次朋友圈分享都是在收到令她满意的效果图之后。她的传播阈值是「超预期」——如果服务只是「符合预期」她不会分享，但如果有「惊喜点」她会主动展示。" },
  ],
  deepNeeds: [
    { category: "核心", need: "省心的高品质一站式装修体验", urgency: "urgent", importance: 95, basis: "明确说「不想跑建材市场」", suggestion: "全程管家式服务+每10天主动进度汇报", detail: "她选择全屋定制的根本原因不是价格便宜，而是「不想操心」。她有稳定的职业收入但时间有限，装修对她来说是一个需要「被管理好」的项目而非「亲自管理」的项目。任何让她感到需要自己操心的环节都会降低满意度。", icon: Shield },
    { category: "收纳", need: "全屋系统性收纳解决方案", urgency: "urgent", importance: 88, basis: "3次在不同空间提到收纳需求", suggestion: "提供《收纳力评估报告》+定制收纳方案", detail: "「收纳」是她在3个不同空间（客厅、卧室、厨房）都主动提到的关键词。推测她目前的居住空间存在严重的收纳困扰，这是她换房装修的核心动机之一。如果我们的收纳方案能超预期解决这个痛点，她的满意度和传播意愿会大幅提升。", icon: Target },
    { category: "透明", need: "施工过程的可视化透明管理", urgency: "normal", importance: 72, basis: "签约后2次主动询问进度", suggestion: "引入施工可视化系统（实拍+效果对比）", detail: "她的信任建立在「看到」上，施工阶段的信息不对称会让她焦虑。虽然她只主动问了2次，但根据她的性格推测，没问不代表不焦虑——她可能在等设计师主动告知。如果每次都等她来问才回复，信任度会逐步衰减。", icon: Eye },
    { category: "延伸", need: "软装与智能家居一体化方案", urgency: "normal", importance: 65, basis: "2次提到软装+1次问智能窗帘", suggestion: "硬装70%时邀请软装体验", detail: "她对软装和智能家居有明确但尚未决策的兴趣。现在不是推销的时机——她的注意力还在硬装上。最佳推动节点是硬装完成70%、空间初步成型的时候，用实景+软装效果图的对比来激发她的购买欲。", icon: Heart },
    { category: "社交", need: "装修过程的「展示资本」", urgency: "latent", importance: 50, basis: "3次朋友圈分享均为效果图", suggestion: "提供专属分享素材包", detail: "她不会说自己需要「展示资本」，但她的行为说明了一切——每次收到好看的效果图都会分享。如果我们主动提供高质量的、适合朋友圈展示的素材（精修图+简短的装修故事文案），她的分享频率和质量都会提升，这对企业获客有直接贡献。", icon: Sparkles },
  ],
  designPreferences: [
    { dimension: "风格", preference: "现代简约·奶油系", confidence: 92, basis: "5轮方案均选简约暖色", detail: "她的审美非常稳定——5轮方案迭代中，她从未偏离过「现代简约+暖色调」的基调。对她来说，好的设计是「温暖、干净、不复杂」。她明确拒绝过一次「轻奢」方案，理由是「太冷了，不像家」。" },
    { dimension: "色调", preference: "奶油白+原木+雾灰", confidence: 88, basis: "参考图90%为暖白色系", detail: "她收藏和下载的47张效果图中，90%为暖白色调。她唯一接受的「冷色」是雾灰色作为客厅电视背景墙的辅助色。儿童房她提到「可以活泼一点」但也限定在「浅蓝」的范围内。" },
    { dimension: "功能", preference: "收纳优先·隐藏式", confidence: 85, basis: "3次强调收纳+要求隐藏设计", detail: "她的功能需求核心是「收纳」，但有一个重要附加条件——「看不出来是柜子」。她喜欢嵌入式、隐藏式、与墙面齐平的收纳设计，讨厌外露的把手和传统的柜门造型。这个偏好需要在施工时特别注意门板工艺。" },
    { dimension: "材质", preference: "实木触感·环保优先", confidence: 80, basis: "主动要求E0级+实木贴面", detail: "她对材质的要求是「摸起来温润」+「对孩子安全」。主动要求E0级环保板材，并在两种同价位板材中选择了实木贴面（而非三聚氰胺）。她对材质的判断主要靠「触感」和「气味」，而非技术参数。" },
    { dimension: "灯光", preference: "暖光·无主灯·氛围感", confidence: 75, basis: "2次提到「不想要大吊灯」", detail: "她明确表示「不想要传统的大吊灯」，偏好无主灯设计+暖色筒灯/灯带的组合。她在效果图中最常停留的区域是灯光效果明显的夜景渲染。灯光设计可能是打动她的一个「惊喜点」。" },
  ],
};

/* ═══════════════════════════════════════════
   SCROLL NAV
   ═══════════════════════════════════════════ */
const SECTIONS = [
  { id: "p-hero", label: "总览" },
  { id: "p-narrative", label: "研判" },
  { id: "p-behavior", label: "行为" },
  { id: "p-personality", label: "性格" },
  { id: "p-heatmap", label: "活跃" },
  { id: "p-interests", label: "兴趣" },
  { id: "p-needs", label: "需求" },
  { id: "p-preference", label: "偏好" },
  { id: "p-risk", label: "风险与机会" },
  { id: "p-strategy", label: "服务策略" },
  { id: "p-journey", label: "旅程" },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
interface Props { open: boolean; onOpenChange: (v: boolean) => void; isDesigner: boolean; name: string; }

export default function PortraitDialog({ open, onOpenChange, isDesigner, name }: Props) {
  const data = isDesigner ? DESIGNER_PORTRAIT : EC_PORTRAIT;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeNav, setActiveNav] = useState("p-hero");

  useEffect(() => {
    const c = scrollRef.current;
    if (!c) return;
    const handler = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = c.querySelector(`#${SECTIONS[i].id}`) as HTMLElement;
        if (el && el.offsetTop - c.scrollTop <= 64) { setActiveNav(SECTIONS[i].id); return; }
      }
      setActiveNav(SECTIONS[0].id);
    };
    c.addEventListener("scroll", handler, { passive: true });
    return () => c.removeEventListener("scroll", handler);
  }, [open]);

  const scrollTo = (id: string) => {
    const c = scrollRef.current;
    const el = c?.querySelector(`#${id}`) as HTMLElement;
    if (el && c) c.scrollTo({ top: el.offsetTop - 48, behavior: "smooth" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px] p-0 gap-0 overflow-hidden" style={{ maxHeight: "92vh" }}>
        <DialogHeader className="px-5 pt-4 pb-0">
          <DialogTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />{name} · 深度用户画像
          </DialogTitle>
        </DialogHeader>

        {/* Nav */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-5 mt-2">
          <div className="flex gap-0.5 py-1 overflow-x-auto">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${activeNav === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollRef} className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(92vh - 90px)" }}>
          <div className="space-y-6 pt-4">

            {/* ═══ HERO ═══ */}
            <section id="p-hero">
              <div className="grid grid-cols-12 gap-4">
                {/* Persona Card */}
                <div className="col-span-3 rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 to-primary/10 p-4 flex flex-col items-center text-center">
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5" className="stroke-muted/40" />
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="5"
                        className={data.healthScore >= 70 ? "stroke-emerald-500" : data.healthScore >= 40 ? "stroke-amber-500" : "stroke-red-500"}
                        strokeLinecap="round" strokeDasharray={`${data.healthScore * 2.14} 214`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold">{data.healthScore}</span>
                      <span className="text-[8px] text-muted-foreground">健康度</span>
                    </div>
                  </div>
                  <div className="mt-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-[11px] font-semibold text-primary">{data.persona}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{data.personaDesc}</p>
                </div>

                {/* Radar */}
                <div className="col-span-4 rounded-xl border border-border/40 p-3">
                  <div className="w-[180px] h-[180px] mx-auto">
                    <RadarChart dimensions={data.radarDimensions} />
                  </div>
                  <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 mt-1">
                    {data.radarDimensions.map(d => (
                      <div key={d.name} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[9px] text-muted-foreground">{d.name}</span>
                        <span className="text-[9px] font-bold ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision Factors */}
                <div className="col-span-5 rounded-xl border border-border/40 p-4">
                  <span className="text-[10px] font-medium text-muted-foreground">决策因素权重</span>
                  <div className="space-y-2 mt-2">
                    {data.decisionFactors.map((f, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-medium">{f.factor}</span>
                          <span className="text-[10px] font-bold text-primary">{f.weight}%</span>
                        </div>
                        <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${f.weight * 2.85}%` }} />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{f.evidence}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ NARRATIVE — 综合研判 ═══ */}
            <section id="p-narrative">
              <SectionLabel title="综合研判 · 这个人是谁" />
              <div className="mt-3 space-y-3">
                {/* Profile narrative */}
                <div className="rounded-xl border border-border/40 bg-gradient-to-br from-muted/20 to-muted/5 p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold">客户全貌</span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{data.profileNarrative}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Value assessment */}
                  <div className="rounded-xl border border-border/40 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-[11px] font-semibold">价值研判</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{data.valueAssessment}</p>
                  </div>

                  {/* Service approach */}
                  <div className="rounded-xl border border-border/40 p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-[11px] font-semibold">服务总纲</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{data.serviceApproach}</p>
                  </div>
                </div>

                {/* Key insights */}
                <div className="rounded-xl border border-border/40 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-[11px] font-semibold">关键洞察</span>
                  </div>
                  <div className="space-y-1.5">
                    {data.keyInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[8px] font-bold text-amber-600">{i + 1}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Communication style */}
                <div className="rounded-xl border border-border/40 p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageCircle className="h-3.5 w-3.5 text-violet-500" />
                    <span className="text-[11px] font-semibold">沟通方式指南</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 ml-1">{data.communicationStyle.style}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mb-1.5">
                        <CheckCircle className="h-3 w-3" /> 推荐做法
                      </span>
                      <div className="space-y-1">
                        {data.communicationStyle.dos.map((d, i) => (
                          <p key={i} className="text-[10px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-emerald-200">{d}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-medium text-red-500 flex items-center gap-1 mb-1.5">
                        <AlertTriangle className="h-3 w-3" /> 避免做法
                      </span>
                      <div className="space-y-1">
                        {data.communicationStyle.donts.map((d, i) => (
                          <p key={i} className="text-[10px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-red-200">{d}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ═══ BEHAVIOR TRAITS ═══ */}
            <section id="p-behavior">
              <SectionLabel title="行为特征指纹" />
              <div className="space-y-2 mt-3">
                {data.behaviorTraits.map((t, i) => {
                  const Icon = t.icon;
                  const barColor = t.level === "high" ? "bg-emerald-500" : t.level === "medium" ? "bg-amber-400" : "bg-muted-foreground/40";
                  return (
                    <div key={i} className="rounded-lg border border-border/40 p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center shrink-0">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-[11px] font-medium w-20 shrink-0">{t.label}</span>
                        <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden relative">
                          <div className={`h-full rounded ${barColor} transition-all`} style={{ width: `${t.score}%`, opacity: 0.65 }} />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">{t.evidence}</span>
                        </div>
                        <span className="text-[11px] font-bold w-7 text-right tabular-nums">{t.score}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-relaxed mt-1.5 ml-8">{t.detail}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ═══ PERSONALITY SPECTRUM ═══ */}
            <section id="p-personality">
              <SectionLabel title="性格特征谱" />
              <div className="space-y-2 mt-3">
                {data.personalityTraits.map((t, i) => (
                  <div key={i} className="rounded-lg border border-border/40 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium w-14 shrink-0">{t.dimension}</span>
                      <span className="text-[9px] text-muted-foreground w-10 text-right shrink-0">{t.leftLabel}</span>
                      <div className="flex-1 h-3 bg-muted/40 rounded-full relative mx-1">
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-400/30 via-primary/15 to-blue-400/30" />
                        </div>
                        {[20, 40, 60, 80].map(m => (
                          <div key={m} className="absolute top-0 h-full w-px bg-background/50" style={{ left: `${m}%` }} />
                        ))}
                        <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary shadow-md border-2 border-background"
                          style={{ left: `calc(${t.score}% - 7px)` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-10 shrink-0">{t.rightLabel}</span>
                      <span className="text-[10px] w-16 text-right text-muted-foreground shrink-0">{t.desc}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed mt-1.5 ml-14">{t.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ ACTIVITY HEATMAP ═══ */}
            <section id="p-heatmap">
              <SectionLabel title="活跃热力图" />
              <div className="rounded-xl border border-border/40 p-3 mt-3">
                <div className="flex gap-1">
                  <div className="flex flex-col gap-[2px] pt-4 pr-1 shrink-0">
                    {["一", "二", "三", "四", "五", "六", "日"].map(d => (
                      <div key={d} className="h-[14px] flex items-center"><span className="text-[8px] text-muted-foreground">{d}</span></div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-[2px] mb-[2px]">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div key={i} className="flex-1 min-w-[14px] text-center">
                          <span className="text-[7px] text-muted-foreground">{i % 3 === 0 ? `${i}` : ""}</span>
                        </div>
                      ))}
                    </div>
                    {data.activityHeatmap.map((row, ri) => (
                      <div key={ri} className="flex gap-[2px]">
                        {row.map((v, ci) => {
                          const max = Math.max(...data.activityHeatmap.flat());
                          const intensity = max > 0 ? v / max : 0;
                          return (
                            <div key={ci} className="flex-1 min-w-[14px] h-[14px] rounded-sm transition-colors"
                              style={{ backgroundColor: v === 0 ? "hsl(var(--muted) / 0.3)" : `hsl(var(--primary) / ${0.15 + intensity * 0.75})` }}
                              title={`周${"一二三四五六日"[ri]} ${ci}:00 — ${v}次`} />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-[8px] text-muted-foreground">少</span>
                  {[0.15, 0.3, 0.5, 0.7, 0.9].map((o, i) => (
                    <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
                  ))}
                  <span className="text-[8px] text-muted-foreground">多</span>
                </div>
              </div>
            </section>

            {/* ═══ INTEREST BUBBLES ═══ */}
            <section id="p-interests">
              <SectionLabel title="兴趣关注图谱" />
              <div className="rounded-xl border border-border/40 p-4 mt-3">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {data.interestBubbles
                    .sort((a, b) => b.weight - a.weight)
                    .map((b, i) => {
                      const size = 32 + (b.weight / 100) * 56;
                      return (
                        <div key={i}
                          className={`${b.color} rounded-full flex items-center justify-center text-white shrink-0 transition-transform hover:scale-110 cursor-default`}
                          style={{ width: `${size}px`, height: `${size}px`, opacity: 0.25 + (b.weight / 100) * 0.65 }}
                          title={`${b.name}: ${b.weight}%`}
                        >
                          <span className="text-[9px] font-medium text-center leading-tight px-1" style={{ fontSize: `${Math.max(8, size / 8)}px` }}>
                            {b.name}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </section>

            {/* ═══ NEEDS PRIORITY MATRIX ═══ */}
            <section id="p-needs">
              <SectionLabel title="深层需求矩阵" />
              <div className="space-y-2 mt-3">
                {data.deepNeeds.map((n, i) => {
                  const Icon = n.icon;
                  const urgencyColors = { urgent: "border-red-200 bg-red-500/5", normal: "border-blue-200 bg-blue-500/5", latent: "border-muted bg-muted/20" };
                  const urgencyLabel = { urgent: "紧急", normal: "一般", latent: "潜在" };
                  const urgencyTag = { urgent: "bg-red-500/10 text-red-600", normal: "bg-blue-500/10 text-blue-600", latent: "bg-muted text-muted-foreground" };
                  return (
                    <div key={i} className={`rounded-xl border ${urgencyColors[n.urgency]} p-4`}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border/40">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold">{n.need}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${urgencyTag[n.urgency]}`}>{urgencyLabel[n.urgency]}</span>
                            <span className="text-[9px] text-muted-foreground ml-auto">重要性 {n.importance}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{n.detail}</p>
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-muted-foreground">数据依据：</span>
                              <span className="text-[9px] font-medium">{n.basis}</span>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground/40" />
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-muted-foreground">建议动作：</span>
                              <span className="text-[9px] font-medium text-primary">{n.suggestion}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ═══ PREFERENCE ═══ */}
            <section id="p-preference">
              <SectionLabel title="偏好深度洞察" />
              <div className="space-y-2 mt-3">
                {data.designPreferences.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-center gap-3">
                      {/* Confidence ring */}
                      <div className="relative w-11 h-11 shrink-0">
                        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
                          <circle cx="22" cy="22" r="17" fill="none" strokeWidth="3" className="stroke-muted/30" />
                          <circle cx="22" cy="22" r="17" fill="none" strokeWidth="3"
                            className={p.confidence >= 85 ? "stroke-emerald-500" : p.confidence >= 70 ? "stroke-primary" : "stroke-amber-500"}
                            strokeLinecap="round" strokeDasharray={`${p.confidence * 1.07} 107`} />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-bold">{p.confidence}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{p.dimension}</span>
                          <span className="text-[11px] font-semibold">{p.preference}</span>
                          <span className="text-[9px] text-muted-foreground ml-auto">{p.basis}</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed mt-1">{p.detail}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══ RISK & OPPORTUNITY ═══ */}
            <section id="p-risk">
              <SectionLabel title="风险与机会识别" />
              <div className="space-y-2 mt-3">
                {data.riskOpportunities.map((ro, i) => {
                  const isRisk = ro.type === "risk";
                  const impactColors = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-muted-foreground" };
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${isRisk ? "border-red-200/60 bg-red-500/3" : "border-emerald-200/60 bg-emerald-500/3"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isRisk ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                          {isRisk ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> : <Rocket className="h-3.5 w-3.5 text-emerald-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold">{ro.title}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full text-white ${impactColors[ro.impact]}`}>
                              {ro.impact === "high" ? "高影响" : ro.impact === "medium" ? "中影响" : "低影响"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{ro.detail}</p>
                          <div className="mt-2 pt-2 border-t border-border/30 flex items-start gap-1.5">
                            <ArrowRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <p className="text-[10px] text-primary font-medium leading-relaxed">{ro.action}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ═══ SERVICE STRATEGY ═══ */}
            <section id="p-strategy">
              <SectionLabel title="精准服务策略" />
              <div className="space-y-2 mt-3">
                {data.serviceStrategies.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="rounded-xl border border-border/40 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold">{s.title}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s.timing}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">{s.channel}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed mt-1.5">{s.content}</p>
                          <div className="mt-2 pt-2 border-t border-border/30 flex items-start gap-1.5">
                            <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-emerald-600 font-medium leading-relaxed">{s.expectedOutcome}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ═══ JOURNEY ═══ */}
            <section id="p-journey">
              <SectionLabel title="客户旅程" />
              <div className="rounded-xl border border-border/40 p-4 mt-3">
                <div className="flex items-center">
                  {data.journeyStages.map((s, i) => {
                    const done = s.status === "done";
                    const current = s.status === "current";
                    return (
                      <div key={i} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                            done ? "bg-emerald-500 border-emerald-400 text-white" :
                            current ? "bg-primary border-primary text-primary-foreground animate-pulse" :
                            "bg-muted border-border text-muted-foreground"
                          }`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <span className={`text-[10px] font-medium mt-1 ${current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                          <span className="text-[9px] text-muted-foreground">{s.metric}</span>
                        </div>
                        {i < data.journeyStages.length - 1 && (
                          <div className={`h-0.5 flex-1 mx-0.5 rounded ${done ? "bg-emerald-500" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ═══════════════════════════════════════════
   SUB COMPONENTS
   ═══════════════════════════════════════════ */

function SectionLabel({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 rounded-full bg-primary" />
      <span className="text-xs font-semibold">{title}</span>
    </div>
  );
}

function RadarChart({ dimensions }: { dimensions: { name: string; value: number }[] }) {
  const n = dimensions.length;
  const cx = 70, cy = 70, r = 55;
  const pt = (i: number, val: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + (r * val / 100) * Math.cos(a), y: cy + (r * val / 100) * Math.sin(a) };
  };
  return (
    <svg viewBox="0 0 140 140" className="w-full h-full">
      {[25, 50, 75, 100].map(l => (
        <polygon key={l}
          points={Array.from({ length: n }, (_, i) => { const p = pt(i, l); return `${p.x},${p.y}`; }).join(" ")}
          fill="none" className="stroke-border/25" strokeWidth="0.5" />
      ))}
      {dimensions.map((_, i) => { const p = pt(i, 100); return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-border/15" strokeWidth="0.5" />; })}
      <polygon
        points={dimensions.map((dd, i) => { const p = pt(i, dd.value); return `${p.x},${p.y}`; }).join(" ")}
        className="fill-primary/12 stroke-primary" strokeWidth="1.5" strokeLinejoin="round" />
      {dimensions.map((dd, i) => {
        const p = pt(i, dd.value);
        return <circle key={`d${i}`} cx={p.x} cy={p.y} r="3" className="fill-primary stroke-background" strokeWidth="1.5" />;
      })}
      {dimensions.map((dd, i) => {
        const p = pt(i, 120);
        return <text key={`t${i}`} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[7px] font-medium">{dd.name}</text>;
      })}
    </svg>
  );
}
