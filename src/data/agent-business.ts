/* ── Business Agent Mock Data ── */

// ── Proactive Insight Alerts ──
export interface AgentInsight {
  id: string;
  severity: "critical" | "warning" | "opportunity" | "info";
  domain: "supply_chain" | "operation" | "content" | "design";
  title: string;
  summary: string;
  metric?: { label: string; value: string; trend?: "up" | "down" | "flat"; change?: string };
  action: { label: string; route?: string };
  timestamp: string;
  relatedModule?: string;
  relatedResourceId?: string;
}

export function generateInsights(): AgentInsight[] {
  return [
    {
      id: "ins-1", severity: "critical", domain: "operation",
      title: "精准客资转化率异常下降",
      summary: "「欧派家居集团」近7天客资转化率从32%骤降至14%，远低于行业均值25%。主要原因：新分配的3位设计师平均跟进时效>48h，建议立即优化分配策略。",
      metric: { label: "转化率", value: "14%", trend: "down", change: "-56%" },
      action: { label: "查看分配策略", route: "/agent/leads" },
      timestamp: "12分钟前",
    },
    {
      id: "ins-2", severity: "critical", domain: "supply_chain",
      title: "3款热销商品库存即将耗尽",
      summary: "「北欧实木餐桌」「轻奢皮质沙发」「智能升降书桌」库存周转天数<7天，按当前销售速度预计3天内断货，建议紧急补货或启动预售策略。",
      metric: { label: "库存周转", value: "5.2天", trend: "down", change: "-3.8天" },
      action: { label: "查看补货方案" },
      timestamp: "25分钟前",
    },
    {
      id: "ins-3", severity: "warning", domain: "operation",
      title: "28个客资超48h未跟进",
      summary: "系统检测到28条高意向客资分配后超过48小时未首次联系，涉及「索菲亚家居」「好莱客创意家居」两家企业，客资流失风险极高。",
      metric: { label: "超时客资", value: "28条", trend: "up", change: "+12条" },
      action: { label: "立即处理", route: "/agent/leads" },
      timestamp: "1小时前",
    },
    {
      id: "ins-4", severity: "opportunity", domain: "operation",
      title: "高转化设计师可承载更多客资",
      summary: "设计师「张明」近30天转化率42%（Top 3），当前在跟客资仅6条（容量上限15条），建议增加客资分配量，预计可带来¥45,000增量。",
      metric: { label: "预期增量", value: "¥45,000", trend: "up" },
      action: { label: "调整分配" },
      timestamp: "2小时前",
    },
    {
      id: "ins-5", severity: "warning", domain: "supply_chain",
      title: "商品详情页转化率低于基准",
      summary: "「现代简约衣柜」详情页浏览量1,240次，下单转化率仅1.8%（品类均值4.2%）。AI分析建议：补充场景实拍图、优化卖点排序、添加用户评价模块。",
      metric: { label: "页面转化", value: "1.8%", trend: "down", change: "-2.4%" },
      action: { label: "AI优化详情页" },
      timestamp: "3小时前",
    },
    {
      id: "ins-6", severity: "opportunity", domain: "content",
      title: "3D方案分享带来高质量线索",
      summary: "近30天通过设计方案分享获取的客资转化率达38%，是渠道投放的2.4倍。建议在方案完成后自动生成分享链接并激励设计师分发。",
      metric: { label: "方案引流转化", value: "38%", trend: "up", change: "+8%" },
      action: { label: "配置分享策略" },
      timestamp: "5小时前",
    },
    {
      id: "ins-7", severity: "info", domain: "operation",
      title: "本周续费到期企业12家",
      summary: "含3家年消费>10万元的核心客户。其中「金牌厨柜」使用率仅23%，续费风险高；「志邦家居」使用率91%，可推荐升级旗舰版。",
      metric: { label: "到期企业", value: "12家" },
      action: { label: "查看续费清单" },
      timestamp: "今天 09:00",
    },
  ];
}

// ── Leads Funnel Data ──
export interface LeadsFunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
  avgTime: string;
  benchmark: number;
  status: "healthy" | "warning" | "critical";
}

export function generateLeadsFunnel(): LeadsFunnelStage[] {
  return [
    { stage: "客资获取", count: 1240, conversionRate: 100, avgTime: "-", benchmark: 100, status: "healthy" },
    { stage: "智能分配", count: 1180, conversionRate: 95.2, avgTime: "2.3h", benchmark: 98, status: "warning" },
    { stage: "首次联系", count: 920, conversionRate: 78.0, avgTime: "18.5h", benchmark: 85, status: "critical" },
    { stage: "需求确认", count: 645, conversionRate: 70.1, avgTime: "3.2天", benchmark: 65, status: "healthy" },
    { stage: "方案推荐", count: 480, conversionRate: 74.4, avgTime: "5.1天", benchmark: 70, status: "healthy" },
    { stage: "签约成交", count: 312, conversionRate: 65.0, avgTime: "8.7天", benchmark: 55, status: "healthy" },
  ];
}

// ── Designer Performance ──
export interface DesignerPerformance {
  id: string;
  name: string;
  enterprise: string;
  activeLeads: number;
  capacity: number;
  conversionRate: number;
  avgResponseTime: string;
  revenue30d: number;
  trend: "up" | "down" | "flat";
  riskLevel: "low" | "medium" | "high";
}

export function generateDesignerPerformance(): DesignerPerformance[] {
  return [
    { id: "dp-1", name: "张明", enterprise: "欧派家居集团", activeLeads: 6, capacity: 15, conversionRate: 42, avgResponseTime: "1.2h", revenue30d: 128000, trend: "up", riskLevel: "low" },
    { id: "dp-2", name: "李雪", enterprise: "索菲亚家居", activeLeads: 12, capacity: 12, conversionRate: 35, avgResponseTime: "3.5h", revenue30d: 96000, trend: "flat", riskLevel: "medium" },
    { id: "dp-3", name: "王浩然", enterprise: "好莱客创意家居", activeLeads: 14, capacity: 10, conversionRate: 18, avgResponseTime: "26h", revenue30d: 32000, trend: "down", riskLevel: "high" },
    { id: "dp-4", name: "陈思", enterprise: "尚品宅配", activeLeads: 8, capacity: 12, conversionRate: 38, avgResponseTime: "2.1h", revenue30d: 108000, trend: "up", riskLevel: "low" },
    { id: "dp-5", name: "刘畅", enterprise: "金牌厨柜", activeLeads: 3, capacity: 10, conversionRate: 28, avgResponseTime: "5.8h", revenue30d: 45000, trend: "down", riskLevel: "medium" },
    { id: "dp-6", name: "赵婷", enterprise: "欧派家居集团", activeLeads: 9, capacity: 12, conversionRate: 31, avgResponseTime: "4.2h", revenue30d: 78000, trend: "flat", riskLevel: "low" },
    { id: "dp-7", name: "周文", enterprise: "志邦家居", activeLeads: 11, capacity: 10, conversionRate: 15, avgResponseTime: "32h", revenue30d: 21000, trend: "down", riskLevel: "high" },
    { id: "dp-8", name: "吴建国", enterprise: "索菲亚家居", activeLeads: 5, capacity: 15, conversionRate: 45, avgResponseTime: "0.8h", revenue30d: 156000, trend: "up", riskLevel: "low" },
  ];
}

// ── Channel Performance ──
export interface ChannelPerformance {
  channel: string;
  leads: number;
  cost: number;
  conversions: number;
  revenue: number;
  cac: number;
  roi: number;
  quality: "high" | "medium" | "low";
}

export function generateChannelPerformance(): ChannelPerformance[] {
  return [
    { channel: "3D方案分享", leads: 180, cost: 0, conversions: 68, revenue: 272000, cac: 0, roi: 999, quality: "high" },
    { channel: "官网自然流量", leads: 320, cost: 15000, conversions: 82, revenue: 328000, cac: 183, roi: 2087, quality: "high" },
    { channel: "抖音信息流", leads: 420, cost: 85000, conversions: 63, revenue: 189000, cac: 1349, roi: 122, quality: "medium" },
    { channel: "百度SEM", leads: 180, cost: 42000, conversions: 38, revenue: 152000, cac: 1105, roi: 262, quality: "medium" },
    { channel: "线下活动", leads: 85, cost: 35000, conversions: 42, revenue: 210000, cac: 833, roi: 500, quality: "high" },
    { channel: "小红书种草", leads: 55, cost: 28000, conversions: 19, revenue: 57000, cac: 1474, roi: 104, quality: "low" },
  ];
}

// ── Lead Detail (for the leads page) ──
export interface LeadRecord {
  id: string;
  customerName: string;
  phone: string;
  channel: string;
  intentLevel: "high" | "medium" | "low";
  assignedTo: string;
  enterprise: string;
  stage: string;
  responseTime: string;
  followCount: number;
  createdAt: string;
  lastFollowAt: string;
  estimatedValue: number;
  riskFlag?: string;
}

export function generateLeadRecords(): LeadRecord[] {
  return [
    { id: "ld-1", customerName: "张先生", phone: "138****1234", channel: "官网自然流量", intentLevel: "high", assignedTo: "张明", enterprise: "欧派家居集团", stage: "方案推荐", responseTime: "0.5h", followCount: 6, createdAt: "2026-04-08", lastFollowAt: "2026-04-14", estimatedValue: 45000 },
    { id: "ld-2", customerName: "李女士", phone: "139****5678", channel: "抖音信息流", intentLevel: "high", assignedTo: "王浩然", enterprise: "好莱客创意家居", stage: "首次联系", responseTime: "52h", followCount: 0, createdAt: "2026-04-12", lastFollowAt: "-", estimatedValue: 38000, riskFlag: "超时未联系" },
    { id: "ld-3", customerName: "王总", phone: "150****9012", channel: "线下活动", intentLevel: "high", assignedTo: "吴建国", enterprise: "索菲亚家居", stage: "签约成交", responseTime: "0.3h", followCount: 8, createdAt: "2026-04-01", lastFollowAt: "2026-04-13", estimatedValue: 82000 },
    { id: "ld-4", customerName: "赵太太", phone: "186****3456", channel: "小红书种草", intentLevel: "medium", assignedTo: "李雪", enterprise: "索菲亚家居", stage: "需求确认", responseTime: "4.2h", followCount: 3, createdAt: "2026-04-10", lastFollowAt: "2026-04-13", estimatedValue: 28000 },
    { id: "ld-5", customerName: "刘先生", phone: "158****7890", channel: "百度SEM", intentLevel: "medium", assignedTo: "周文", enterprise: "志邦家居", stage: "智能分配", responseTime: "38h", followCount: 0, createdAt: "2026-04-13", lastFollowAt: "-", estimatedValue: 35000, riskFlag: "超时未联系" },
    { id: "ld-6", customerName: "陈女士", phone: "187****2345", channel: "3D方案分享", intentLevel: "high", assignedTo: "陈思", enterprise: "尚品宅配", stage: "方案推荐", responseTime: "1.1h", followCount: 5, createdAt: "2026-04-05", lastFollowAt: "2026-04-14", estimatedValue: 56000 },
    { id: "ld-7", customerName: "杨先生", phone: "139****6789", channel: "官网自然流量", intentLevel: "low", assignedTo: "赵婷", enterprise: "欧派家居集团", stage: "需求确认", responseTime: "2.8h", followCount: 2, createdAt: "2026-04-11", lastFollowAt: "2026-04-13", estimatedValue: 18000 },
    { id: "ld-8", customerName: "马女士", phone: "150****1234", channel: "抖音信息流", intentLevel: "medium", assignedTo: "刘畅", enterprise: "金牌厨柜", stage: "首次联系", responseTime: "12h", followCount: 1, createdAt: "2026-04-12", lastFollowAt: "2026-04-13", estimatedValue: 32000 },
  ];
}

// ── Business Health Score ──
export interface BusinessHealthModule {
  module: string;
  score: number;
  trend: "up" | "down" | "flat";
  keyMetric: { label: string; value: string };
  issues: string[];
}

export function generateBusinessHealth(): BusinessHealthModule[] {
  return [
    {
      module: "客资运营", score: 68, trend: "down",
      keyMetric: { label: "整体转化率", value: "25.2%" },
      issues: ["首次联系时效超标(18.5h vs 目标4h)", "3位设计师严重超载"],
    },
    {
      module: "商品经营", score: 82, trend: "up",
      keyMetric: { label: "动销率", value: "73.5%" },
      issues: ["3款热销品库存预警", "12个详情页转化率低于基准"],
    },
    {
      module: "权益续费", score: 74, trend: "flat",
      keyMetric: { label: "续费率", value: "68.3%" },
      issues: ["本周12家到期", "3家核心客户使用率<30%"],
    },
    {
      module: "内容运营", score: 85, trend: "up",
      keyMetric: { label: "方案引流占比", value: "14.5%" },
      issues: ["方案分享率仅22%，有提升空间"],
    },
  ];
}

// ── AI Recommendation Actions ──
export interface AIRecommendation {
  id: string;
  priority: "urgent" | "high" | "medium";
  domain: string;
  title: string;
  reason: string;
  expectedImpact: string;
  effort: "low" | "medium" | "high";
  actions: string[];
}

export function generateRecommendations(): AIRecommendation[] {
  return [
    {
      id: "rec-1", priority: "urgent", domain: "客资运营",
      title: "立即重新分配28条超时客资",
      reason: "48h未联系的客资转化率会骤降至5%以下",
      expectedImpact: "挽救预估¥126,000潜在营收",
      effort: "low",
      actions: ["将超载设计师的客资转移至空闲Top设计师", "触发自动短信安抚客户"],
    },
    {
      id: "rec-2", priority: "urgent", domain: "供应链",
      title: "紧急补货3款即将断货商品",
      reason: "库存周转<7天，日均销量12件",
      expectedImpact: "避免断货导致的¥85,000/周营收损失",
      effort: "medium",
      actions: ["启动供应商紧急订单", "前台展示「预售」标签"],
    },
    {
      id: "rec-3", priority: "high", domain: "客资运营",
      title: "优化客资分配算法 — 引入能力匹配",
      reason: "当前按轮询分配，Top设计师利用率不足",
      expectedImpact: "预计提升整体转化率6-8个百分点",
      effort: "medium",
      actions: ["按设计师历史转化率加权分配", "设置动态容量上限"],
    },
    {
      id: "rec-4", priority: "high", domain: "内容运营",
      title: "启用方案自动生成分享链接",
      reason: "方案引流转化率38%，远超付费渠道",
      expectedImpact: "预计月增120条高质量客资",
      effort: "low",
      actions: ["设计方案完成后自动弹出分享引导", "设计师分享奖励积分机制"],
    },
    {
      id: "rec-5", priority: "medium", domain: "权益续费",
      title: "对3家低使用率核心客户启动健康干预",
      reason: "年消费>10万但使用率<30%，续费风险极高",
      expectedImpact: "保住¥320,000年度营收",
      effort: "high",
      actions: ["安排专属客户成功经理上门", "定制使用培训方案", "赠送高级功能试用"],
    },
  ];
}
