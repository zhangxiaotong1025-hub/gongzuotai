/* ── 精准客资管线数据模型 ──
 * 反映真实业务：平台获取线索 → 清洗 → 派发企业 → 企业跟进 → 反馈闭环
 */

// ── 平台管线总览 KPI ──
export interface PipelineKPI {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  status?: "good" | "warning" | "danger";
}

export function generatePlatformKPIs(): PipelineKPI[] {
  return [
    { label: "本月获取线索", value: "4,280", subValue: "日均142条", trend: "up", trendValue: "+12%", status: "good" },
    { label: "获客成本(CAC)", value: "¥168", subValue: "上月¥143", trend: "up", trendValue: "+17.5%", status: "danger" },
    { label: "清洗合格率", value: "62.4%", subValue: "合格2,671条", trend: "down", trendValue: "-3.2%", status: "warning" },
    { label: "已派发", value: "2,340", subValue: "待派发331条", trend: "flat", trendValue: "", status: "good" },
    { label: "企业反馈率", value: "34.2%", subValue: "仅800条有回传", trend: "down", trendValue: "-8%", status: "danger" },
    { label: "客资营收", value: "¥468,000", subValue: "毛利率38.2%", trend: "up", trendValue: "+5%", status: "good" },
  ];
}

export function generateEnterpriseKPIs(): PipelineKPI[] {
  return [
    { label: "本月收到客资", value: "186", subValue: "高意向82条", trend: "up", trendValue: "+15%", status: "good" },
    { label: "首次联系率", value: "71.5%", subValue: "24h内首联", trend: "down", trendValue: "-5%", status: "warning" },
    { label: "跟进转化率", value: "23.8%", subValue: "成交44单", trend: "flat", trendValue: "", status: "warning" },
    { label: "客资成本", value: "¥200/条", subValue: "高意向¥350/条", trend: "up", trendValue: "+8%", status: "warning" },
    { label: "客均产值", value: "¥12,600", subValue: "设计+施工", trend: "up", trendValue: "+12%", status: "good" },
    { label: "反馈回传率", value: "42.3%", subValue: "回传79条", trend: "up", trendValue: "+6%", status: "good" },
  ];
}

// ── 管线阶段 (平台视角) ──
export interface PipelineStage {
  id: string;
  stage: string;
  description: string;
  count: number;
  automationLevel: number; // 0-100, AI自动化程度
  avgCost: number;
  bottleneck?: string;
  aiCapability?: string;
}

export function generatePipelineStages(): PipelineStage[] {
  return [
    { id: "acquire", stage: "线索获取", description: "多渠道投放与自然流量", count: 4280, automationLevel: 40, avgCost: 168, bottleneck: "成本持续上升，ROI下降", aiCapability: "智能出价、素材自动生成" },
    { id: "cleanse", stage: "线索清洗", description: "号码校验 + 意向初筛", count: 2671, automationLevel: 25, avgCost: 0, bottleneck: "依赖人工客服，效率低", aiCapability: "AI自动外呼、意向评分" },
    { id: "enrich", stage: "信息补全", description: "需求确认 + 标签打标", count: 2450, automationLevel: 15, avgCost: 0, bottleneck: "客服人力成本高", aiCapability: "AI对话补全需求信息" },
    { id: "distribute", stage: "派发匹配", description: "按区域/品类匹配企业", count: 2340, automationLevel: 20, avgCost: 0, bottleneck: "人工派发，匹配精度低", aiCapability: "智能匹配算法、动态定价" },
    { id: "track", stage: "跟进追踪", description: "企业跟进状态回传", count: 800, automationLevel: 10, avgCost: 0, bottleneck: "企业不主动反馈，管线断裂", aiCapability: "激励机制、自动催促" },
    { id: "close", stage: "成交结算", description: "确认成交 + 结算分成", count: 312, automationLevel: 30, avgCost: 0, bottleneck: "成交数据不透明", aiCapability: "CPS结算、自动对账" },
  ];
}

// ── 获客渠道经济模型 ──
export interface AcquisitionChannel {
  channel: string;
  leads: number;
  cost: number;
  qualifiedRate: number; // 清洗合格率
  qualified: number;
  distributed: number;
  feedback: number;   // 企业有反馈的
  conversions: number;
  cac: number;
  qualifiedCac: number; // 合格线索CAC
  revenue: number;
  roi: number;
  trend: "up" | "down" | "flat";
  aiSuggestion: string;
}

export function generateAcquisitionChannels(): AcquisitionChannel[] {
  return [
    { channel: "抖音信息流", leads: 1680, cost: 285600, qualifiedRate: 55, qualified: 924, distributed: 880, feedback: 264, conversions: 88, cac: 170, qualifiedCac: 309, revenue: 176000, roi: 61.6, trend: "down", aiSuggestion: "合格率仅55%，建议优化落地页表单增加预筛字段，预计可提升合格率至65%" },
    { channel: "百度SEM", leads: 960, cost: 172800, qualifiedRate: 68, qualified: 653, distributed: 620, feedback: 217, conversions: 93, cac: 180, qualifiedCac: 265, revenue: 124000, roi: 71.7, trend: "flat", aiSuggestion: "合格率较高但成本偏贵，建议针对长尾词优化，预计CAC可降低15%" },
    { channel: "官网自然流量", leads: 580, cost: 23200, qualifiedRate: 82, qualified: 476, distributed: 460, feedback: 184, conversions: 69, cac: 40, qualifiedCac: 49, revenue: 92000, roi: 296, trend: "up", aiSuggestion: "最高性价比渠道，建议加大SEO投入和内容运营" },
    { channel: "小红书种草", leads: 420, cost: 88200, qualifiedRate: 48, qualified: 202, distributed: 180, feedback: 36, conversions: 18, cac: 210, qualifiedCac: 437, revenue: 36000, roi: 40.8, trend: "down", aiSuggestion: "合格率最低，用户意向弱。建议暂停直投，转为品牌种草+官网承接" },
    { channel: "线下活动/转介绍", leads: 340, cost: 68000, qualifiedRate: 88, qualified: 299, distributed: 290, feedback: 145, conversions: 87, cac: 200, qualifiedCac: 227, revenue: 174000, roi: 155.9, trend: "up", aiSuggestion: "转化率最高，建议增加设计师方案分享裂变机制" },
    { channel: "400电话", leads: 300, cost: 81600, qualifiedRate: 39, qualified: 117, distributed: 110, feedback: 22, conversions: 11, cac: 272, qualifiedCac: 697, revenue: 22000, roi: 27.0, trend: "down", aiSuggestion: "合格率极低，建议上线AI外呼替代人工初筛，预计节省60%人力成本" },
  ];
}

// ── 清洗队列 ──
export interface CleansingQueue {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export function generateCleansingQueue(): CleansingQueue[] {
  return [
    { status: "待清洗", count: 420, percentage: 9.8, color: "bg-muted-foreground" },
    { status: "AI初筛中", count: 185, percentage: 4.3, color: "bg-blue-500" },
    { status: "人工复核", count: 340, percentage: 7.9, color: "bg-amber-500" },
    { status: "合格待派", count: 331, percentage: 7.7, color: "bg-emerald-500" },
    { status: "已派发", count: 2340, percentage: 54.7, color: "bg-primary" },
    { status: "不合格", count: 664, percentage: 15.5, color: "bg-red-400" },
  ];
}

// ── 企业派发明细 ──
export interface EnterpriseDistribution {
  id: string;
  name: string;
  type: string; // 品牌商/经销商/装修公司
  region: string;
  totalReceived: number;
  highIntent: number;
  contacted: number;
  contactRate: number;
  converted: number;
  conversionRate: number;
  feedbackRate: number;
  avgResponseTime: string;
  satisfaction: number; // 对客资质量满意度 1-5
  pricePerLead: number;
  revenue: number;
  riskLevel: "low" | "medium" | "high";
  aiInsight: string;
}

export function generateEnterpriseDistributions(): EnterpriseDistribution[] {
  return [
    { id: "ed-1", name: "欧派家居集团", type: "品牌商", region: "广州", totalReceived: 420, highIntent: 180, contacted: 378, contactRate: 90, converted: 126, conversionRate: 30, feedbackRate: 82, avgResponseTime: "2.1h", satisfaction: 4.2, pricePerLead: 200, revenue: 84000, riskLevel: "low", aiInsight: "模范企业，反馈积极且转化率高，建议作为A级客户优先派发" },
    { id: "ed-2", name: "索菲亚家居", type: "品牌商", region: "广州", totalReceived: 380, highIntent: 152, contacted: 304, contactRate: 80, converted: 76, conversionRate: 20, feedbackRate: 65, avgResponseTime: "6.5h", satisfaction: 3.8, pricePerLead: 200, revenue: 76000, riskLevel: "medium", aiInsight: "联系率80%但转化偏低，客资匹配偏差可能是主因，建议优化品类匹配" },
    { id: "ed-3", name: "好莱客创意家居", type: "品牌商", region: "广州", totalReceived: 320, highIntent: 128, contacted: 192, contactRate: 60, converted: 32, conversionRate: 10, feedbackRate: 25, avgResponseTime: "18h", satisfaction: 2.8, pricePerLead: 180, revenue: 57600, riskLevel: "high", aiInsight: "联系率仅60%、反馈率25%，客资浪费严重。建议降级为B级或暂停派发" },
    { id: "ed-4", name: "金牌厨柜", type: "品牌商", region: "厦门", totalReceived: 280, highIntent: 112, contacted: 238, contactRate: 85, converted: 56, conversionRate: 20, feedbackRate: 48, avgResponseTime: "3.8h", satisfaction: 3.5, pricePerLead: 180, revenue: 50400, riskLevel: "low", aiInsight: "厨柜品类客资需求稳定，建议增加厨房装修关键词定向" },
    { id: "ed-5", name: "尚品宅配", type: "品牌商", region: "广州", totalReceived: 260, highIntent: 130, contacted: 234, contactRate: 90, converted: 78, conversionRate: 30, feedbackRate: 72, avgResponseTime: "1.5h", satisfaction: 4.5, pricePerLead: 220, revenue: 57200, riskLevel: "low", aiInsight: "响应最快、转化最高，建议提价至¥250并增加高意向客资配额" },
    { id: "ed-6", name: "志邦家居", type: "品牌商", region: "合肥", totalReceived: 220, highIntent: 66, contacted: 132, contactRate: 60, converted: 22, conversionRate: 10, feedbackRate: 18, avgResponseTime: "24h", satisfaction: 2.2, pricePerLead: 160, revenue: 35200, riskLevel: "high", aiInsight: "反馈率最低，跟进形同虚设。建议启动「质量保障金」机制倒逼跟进" },
    { id: "ed-7", name: "城市之光装饰", type: "装修公司", region: "成都", totalReceived: 180, highIntent: 90, contacted: 162, contactRate: 90, converted: 54, conversionRate: 30, feedbackRate: 85, avgResponseTime: "0.8h", satisfaction: 4.8, pricePerLead: 250, revenue: 45000, riskLevel: "low", aiInsight: "装修公司标杆，建议作为成都区域独家合作伙伴并提升配额" },
    { id: "ed-8", name: "百安居装修", type: "装修公司", region: "上海", totalReceived: 160, highIntent: 48, contacted: 112, contactRate: 70, converted: 24, conversionRate: 15, feedbackRate: 35, avgResponseTime: "8h", satisfaction: 3.0, pricePerLead: 200, revenue: 32000, riskLevel: "medium", aiInsight: "上海区域竞争激烈，转化一般。建议匹配更精准的户型偏好标签" },
  ];
}

// ── 反馈闭环数据 ──
export interface FeedbackMetrics {
  metric: string;
  value: string;
  benchmark: string;
  status: "good" | "warning" | "danger";
  impact: string;
}

export function generateFeedbackMetrics(): FeedbackMetrics[] {
  return [
    { metric: "企业平均反馈率", value: "34.2%", benchmark: "目标 ≥60%", status: "danger", impact: "65%的客资无法追踪最终转化，ROI计算失真" },
    { metric: "首次联系确认率", value: "76.5%", benchmark: "目标 ≥90%", status: "warning", impact: "23.5%的客资可能从未被真正联系" },
    { metric: "客资质量投诉率", value: "12.8%", benchmark: "目标 ≤5%", status: "danger", impact: "清洗标准需要提升，否则客户流失" },
    { metric: "回传平均延迟", value: "4.2天", benchmark: "目标 ≤1天", status: "danger", impact: "信息延迟导致无法及时干预和优化" },
    { metric: "成交数据回传率", value: "22.6%", benchmark: "目标 ≥50%", status: "danger", impact: "无法精确计算客资ROI和渠道归因" },
    { metric: "客资复购率", value: "68.3%", benchmark: "目标 ≥80%", status: "warning", impact: "31.7%的企业未续购，主因：质量不满意" },
  ];
}

// ── AI 自动化路线图 ──
export interface AutomationItem {
  id: string;
  stage: string;
  capability: string;
  currentState: string;
  targetState: string;
  impact: string;
  effort: "low" | "medium" | "high";
  priority: "P0" | "P1" | "P2";
  status: "ready" | "in_progress" | "planned";
}

export function generateAutomationRoadmap(): AutomationItem[] {
  return [
    { id: "auto-1", stage: "清洗", capability: "AI外呼初筛", currentState: "100%人工客服", targetState: "AI初筛70% + 人工复核30%", impact: "节省¥12万/月人力成本", effort: "medium", priority: "P0", status: "ready" },
    { id: "auto-2", stage: "清洗", capability: "智能意向评分", currentState: "客服主观判断", targetState: "多维度AI评分模型", impact: "合格率预计提升15%", effort: "medium", priority: "P0", status: "in_progress" },
    { id: "auto-3", stage: "派发", capability: "智能匹配引擎", currentState: "按区域人工分配", targetState: "品类+区域+转化率加权匹配", impact: "转化率预计提升8-12%", effort: "high", priority: "P0", status: "planned" },
    { id: "auto-4", stage: "派发", capability: "动态定价", currentState: "统一¥200/条", targetState: "按质量分层¥120-400", impact: "营收预计提升25%", effort: "medium", priority: "P1", status: "planned" },
    { id: "auto-5", stage: "跟进", capability: "自动催促与激励", currentState: "无跟进追踪", targetState: "质量保障金+反馈积分", impact: "反馈率目标提至60%", effort: "low", priority: "P0", status: "ready" },
    { id: "auto-6", stage: "获取", capability: "AI素材生成", currentState: "设计师手动出图", targetState: "AI批量生成投放素材", impact: "素材产出效率提升5x", effort: "medium", priority: "P1", status: "planned" },
    { id: "auto-7", stage: "获取", capability: "智能出价", currentState: "人工调整出价", targetState: "基于转化率自动调价", impact: "CAC预计降低20%", effort: "high", priority: "P1", status: "planned" },
    { id: "auto-8", stage: "结算", capability: "CPS自动对账", currentState: "人工月度对账", targetState: "实时成交数据同步对账", impact: "对账效率提升90%", effort: "low", priority: "P2", status: "planned" },
  ];
}

// ── 经营健康度（区分平台/企业）──
export interface BusinessHealthScore {
  dimension: string;
  score: number;
  trend: "up" | "down" | "flat";
  details: string;
  keyAction: string;
}

export function generatePlatformHealth(): BusinessHealthScore[] {
  return [
    { dimension: "获客效率", score: 58, trend: "down", details: "CAC连续3月上升17%，抖音/小红书ROI走低", keyAction: "优化渠道结构，增加高ROI渠道占比" },
    { dimension: "清洗产能", score: 45, trend: "down", details: "客服团队8人日均处理500条，积压420条", keyAction: "上线AI外呼替代70%初筛工作" },
    { dimension: "派发精度", score: 52, trend: "flat", details: "按区域粗放分配，品类匹配度仅63%", keyAction: "引入智能匹配引擎" },
    { dimension: "反馈闭环", score: 32, trend: "down", details: "仅34%企业有回传，管线严重断裂", keyAction: "质量保障金+反馈积分激励" },
    { dimension: "营收增长", score: 72, trend: "up", details: "营收增长5%但利润率被成本侵蚀", keyAction: "动态定价+降本增效" },
  ];
}
