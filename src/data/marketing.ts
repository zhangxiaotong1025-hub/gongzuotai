/* ── 精准客资智能营销系统 Mock 数据 ── */

// ── 渠道 ──
export interface Channel {
  id: string;
  name: string;
  type: "search" | "social" | "organic" | "offline" | "call";
  status: "active" | "paused" | "archived";
  budget: number;
  spent: number;
  leads: number;
  qualified: number;
  qualifiedRate: number;
  cac: number;
  conversions: number;
  revenue: number;
  roi: number;
  trend: "up" | "down" | "flat";
  dailyLeads: number[];
}

export function generateChannels(): Channel[] {
  return [
    { id: "ch-1", name: "抖音信息流", type: "social", status: "active", budget: 300000, spent: 285600, leads: 1680, qualified: 924, qualifiedRate: 55, cac: 170, conversions: 88, revenue: 176000, roi: 61.6, trend: "down", dailyLeads: [52,58,61,48,55,62,44,50,56,60,42,55,58,48] },
    { id: "ch-2", name: "百度SEM", type: "search", status: "active", budget: 200000, spent: 172800, leads: 960, qualified: 653, qualifiedRate: 68, cac: 180, conversions: 93, revenue: 124000, roi: 71.7, trend: "flat", dailyLeads: [30,35,32,28,34,31,33,30,36,29,31,34,32,30] },
    { id: "ch-3", name: "官网自然流量", type: "organic", status: "active", budget: 30000, spent: 23200, leads: 580, qualified: 476, qualifiedRate: 82, cac: 40, conversions: 69, revenue: 92000, roi: 296, trend: "up", dailyLeads: [18,20,19,22,21,24,20,23,19,21,25,20,22,24] },
    { id: "ch-4", name: "小红书种草", type: "social", status: "paused", budget: 100000, spent: 88200, leads: 420, qualified: 202, qualifiedRate: 48, cac: 210, conversions: 18, revenue: 36000, roi: 40.8, trend: "down", dailyLeads: [15,18,12,14,16,11,13,15,10,12,14,9,11,13] },
    { id: "ch-5", name: "线下活动/转介绍", type: "offline", status: "active", budget: 80000, spent: 68000, leads: 340, qualified: 299, qualifiedRate: 88, cac: 200, conversions: 87, revenue: 174000, roi: 155.9, trend: "up", dailyLeads: [10,12,11,14,13,12,11,10,15,12,11,13,14,12] },
    { id: "ch-6", name: "400电话", type: "call", status: "active", budget: 100000, spent: 81600, leads: 300, qualified: 117, qualifiedRate: 39, cac: 272, conversions: 11, revenue: 22000, roi: 27.0, trend: "down", dailyLeads: [8,10,12,9,11,10,8,12,9,10,11,8,10,9] },
  ];
}

// ── 活动 ──
export interface Campaign {
  id: string;
  name: string;
  type: "online_ad" | "exhibition" | "referral" | "cross_industry";
  status: "draft" | "active" | "completed" | "paused";
  channelId: string;
  channelName: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  targetLeads: number;
  actualLeads: number;
  qualified: number;
  conversions: number;
  cac: number;
  roi: number;
}

export function generateCampaigns(): Campaign[] {
  return [
    { id: "cp-1", name: "春季装修季-抖音专场", type: "online_ad", status: "active", channelId: "ch-1", channelName: "抖音信息流", startDate: "2026-03-01", endDate: "2026-04-30", budget: 120000, spent: 98000, targetLeads: 800, actualLeads: 720, qualified: 396, conversions: 36, cac: 136, roi: 73.5 },
    { id: "cp-2", name: "百度品牌词竞价Q2", type: "online_ad", status: "active", channelId: "ch-2", channelName: "百度SEM", startDate: "2026-04-01", endDate: "2026-06-30", budget: 80000, spent: 32000, targetLeads: 400, actualLeads: 180, qualified: 122, conversions: 18, cac: 178, roi: 56.3 },
    { id: "cp-3", name: "家博会·广州站", type: "exhibition", status: "completed", channelId: "ch-5", channelName: "线下活动", startDate: "2026-03-15", endDate: "2026-03-17", budget: 45000, spent: 42000, targetLeads: 200, actualLeads: 186, qualified: 164, conversions: 49, cac: 226, roi: 116.7 },
    { id: "cp-4", name: "老客户转介绍奖励计划", type: "referral", status: "active", channelId: "ch-5", channelName: "转介绍", startDate: "2026-01-01", endDate: "2026-12-31", budget: 20000, spent: 12000, targetLeads: 150, actualLeads: 98, qualified: 86, conversions: 26, cac: 122, roi: 216.7 },
    { id: "cp-5", name: "小红书家装灵感合集", type: "online_ad", status: "paused", channelId: "ch-4", channelName: "小红书", startDate: "2026-02-01", endDate: "2026-04-30", budget: 50000, spent: 38000, targetLeads: 300, actualLeads: 210, qualified: 101, conversions: 8, cac: 181, roi: 21.1 },
    { id: "cp-6", name: "异业联盟-建材城", type: "cross_industry", status: "draft", channelId: "ch-5", channelName: "线下活动", startDate: "2026-05-01", endDate: "2026-05-31", budget: 15000, spent: 0, targetLeads: 100, actualLeads: 0, qualified: 0, conversions: 0, cac: 0, roi: 0 },
  ];
}

// ── 线索 ──
export type LeadStatus = "raw" | "pending_cleanse" | "cleansing" | "qualified" | "unqualified" | "pending_distribute" | "distributed" | "contacted" | "converted" | "lost";
export type IntentLevel = "high" | "medium" | "low" | "unknown";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  campaignName?: string;
  status: LeadStatus;
  intentLevel: IntentLevel;
  intentScore: number;
  region: string;
  houseType: string;
  budget?: string;
  stage: string;
  createdAt: string;
  lastContactAt?: string;
  assignedTo?: string;
  callCount: number;
  tags: string[];
}

export function generateLeads(): Lead[] {
  return [
    { id: "ld-1", name: "张先生", phone: "138****2201", source: "抖音信息流", campaignName: "春季装修季", status: "qualified", intentLevel: "high", intentScore: 92, region: "广州天河", houseType: "三室两厅 120㎡", budget: "15-20万", stage: "准备装修", createdAt: "2026-04-15 10:23", lastContactAt: "2026-04-15 14:30", callCount: 2, tags: ["全屋定制", "现代简约"] },
    { id: "ld-2", name: "李女士", phone: "139****8876", source: "百度SEM", status: "distributed", intentLevel: "high", intentScore: 88, region: "深圳南山", houseType: "两室一厅 89㎡", budget: "10-15万", stage: "对比中", createdAt: "2026-04-14 16:45", lastContactAt: "2026-04-15 09:15", assignedTo: "欧派家居", callCount: 1, tags: ["橱柜", "北欧风"] },
    { id: "ld-3", name: "王先生", phone: "136****5543", source: "官网表单", status: "pending_cleanse", intentLevel: "unknown", intentScore: 45, region: "成都武侯", houseType: "四室两厅 160㎡", stage: "刚拿房", createdAt: "2026-04-15 08:12", callCount: 0, tags: [] },
    { id: "ld-4", name: "赵女士", phone: "158****3321", source: "小红书", status: "cleansing", intentLevel: "medium", intentScore: 62, region: "杭州西湖", houseType: "两室两厅 95㎡", budget: "8-12万", stage: "了解阶段", createdAt: "2026-04-13 20:30", callCount: 1, tags: ["全屋定制"] },
    { id: "ld-5", name: "刘先生", phone: "137****7789", source: "400电话", status: "unqualified", intentLevel: "low", intentScore: 22, region: "上海浦东", houseType: "未知", stage: "随便看看", createdAt: "2026-04-12 15:40", callCount: 1, tags: [] },
    { id: "ld-6", name: "陈先生", phone: "135****1122", source: "线下活动", campaignName: "家博会·广州站", status: "converted", intentLevel: "high", intentScore: 96, region: "广州番禺", houseType: "别墅 280㎡", budget: "50万+", stage: "已签约", createdAt: "2026-03-16 11:20", lastContactAt: "2026-04-10 16:00", assignedTo: "城市之光装饰", callCount: 5, tags: ["别墅", "欧式", "全案"] },
    { id: "ld-7", name: "孙女士", phone: "188****4456", source: "抖音信息流", status: "contacted", intentLevel: "medium", intentScore: 68, region: "厦门思明", houseType: "三室一厅 110㎡", budget: "12-18万", stage: "量房阶段", createdAt: "2026-04-10 09:50", lastContactAt: "2026-04-14 11:30", assignedTo: "金牌厨柜", callCount: 3, tags: ["厨房翻新"] },
    { id: "ld-8", name: "周先生", phone: "186****9988", source: "百度SEM", status: "pending_distribute", intentLevel: "high", intentScore: 85, region: "合肥蜀山", houseType: "两室两厅 98㎡", budget: "10-15万", stage: "准备装修", createdAt: "2026-04-14 14:20", callCount: 2, tags: ["全屋定制", "现代轻奢"] },
    { id: "ld-9", name: "吴女士", phone: "159****6677", source: "转介绍", campaignName: "老客户转介绍", status: "distributed", intentLevel: "high", intentScore: 91, region: "广州白云", houseType: "三室两厅 130㎡", budget: "20-30万", stage: "方案对比", createdAt: "2026-04-11 13:45", lastContactAt: "2026-04-15 10:00", assignedTo: "尚品宅配", callCount: 4, tags: ["全案设计", "轻奢"] },
    { id: "ld-10", name: "郑先生", phone: "133****2244", source: "官网表单", status: "lost", intentLevel: "low", intentScore: 30, region: "北京朝阳", houseType: "一室一厅 55㎡", stage: "无明确计划", createdAt: "2026-04-08 17:30", callCount: 2, tags: [] },
  ];
}

// ── 呼叫记录 ──
export interface CallRecord {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  type: "ai_outbound" | "manual_outbound" | "inbound";
  status: "connected" | "no_answer" | "busy" | "callback" | "invalid";
  duration: number;
  result: "qualified" | "unqualified" | "follow_up" | "callback" | "none";
  agent: string;
  createdAt: string;
  summary?: string;
}

export function generateCallRecords(): CallRecord[] {
  return [
    { id: "call-1", leadId: "ld-1", leadName: "张先生", phone: "138****2201", type: "ai_outbound", status: "connected", duration: 180, result: "qualified", agent: "AI-001", createdAt: "2026-04-15 10:35", summary: "客户确认近期有装修计划，120㎡三室两厅，预算15-20万，偏好全屋定制现代简约风格" },
    { id: "call-2", leadId: "ld-2", leadName: "李女士", phone: "139****8876", type: "manual_outbound", status: "connected", duration: 240, result: "qualified", agent: "客服-张丽", createdAt: "2026-04-14 17:00", summary: "客户正在对比3家品牌，关注橱柜品质和价格，预约周末量房" },
    { id: "call-3", leadId: "ld-3", leadName: "王先生", phone: "136****5543", type: "ai_outbound", status: "no_answer", duration: 0, result: "callback", agent: "AI-002", createdAt: "2026-04-15 08:30" },
    { id: "call-4", leadId: "ld-4", leadName: "赵女士", phone: "158****3321", type: "ai_outbound", status: "connected", duration: 120, result: "follow_up", agent: "AI-001", createdAt: "2026-04-14 10:20", summary: "客户在了解阶段，有兴趣但还未确定预算，需二次跟进" },
    { id: "call-5", leadId: "ld-5", leadName: "刘先生", phone: "137****7789", type: "manual_outbound", status: "connected", duration: 60, result: "unqualified", agent: "客服-王磊", createdAt: "2026-04-12 16:00", summary: "客户无装修计划，仅咨询价格" },
    { id: "call-6", leadId: "ld-8", leadName: "周先生", phone: "186****9988", type: "ai_outbound", status: "connected", duration: 210, result: "qualified", agent: "AI-003", createdAt: "2026-04-14 14:45", summary: "新房已交付，计划5月开始装修，预算10-15万，倾向全屋定制轻奢风" },
    { id: "call-7", leadId: "ld-7", leadName: "孙女士", phone: "188****4456", type: "manual_outbound", status: "connected", duration: 150, result: "qualified", agent: "客服-李娟", createdAt: "2026-04-10 10:15", summary: "厨房翻新需求，已量房，等待报价" },
    { id: "call-8", leadId: "ld-10", leadName: "郑先生", phone: "133****2244", type: "ai_outbound", status: "connected", duration: 45, result: "unqualified", agent: "AI-001", createdAt: "2026-04-09 09:30", summary: "一室一厅出租房，无装修预算" },
  ];
}

// ── 坐席 ──
export interface Agent {
  id: string;
  name: string;
  type: "ai" | "human";
  status: "online" | "busy" | "offline";
  todayTasks: number;
  todayCompleted: number;
  connectRate: number;
  qualifiedRate: number;
  avgDuration: number;
}

export function generateAgents(): Agent[] {
  return [
    { id: "ag-1", name: "AI-001", type: "ai", status: "online", todayTasks: 120, todayCompleted: 98, connectRate: 62, qualifiedRate: 45, avgDuration: 130 },
    { id: "ag-2", name: "AI-002", type: "ai", status: "online", todayTasks: 115, todayCompleted: 90, connectRate: 58, qualifiedRate: 42, avgDuration: 125 },
    { id: "ag-3", name: "AI-003", type: "ai", status: "busy", todayTasks: 100, todayCompleted: 72, connectRate: 60, qualifiedRate: 48, avgDuration: 140 },
    { id: "ag-4", name: "客服-张丽", type: "human", status: "online", todayTasks: 45, todayCompleted: 38, connectRate: 72, qualifiedRate: 55, avgDuration: 210 },
    { id: "ag-5", name: "客服-王磊", type: "human", status: "online", todayTasks: 40, todayCompleted: 35, connectRate: 68, qualifiedRate: 50, avgDuration: 195 },
    { id: "ag-6", name: "客服-李娟", type: "human", status: "busy", todayTasks: 42, todayCompleted: 30, connectRate: 75, qualifiedRate: 58, avgDuration: 230 },
    { id: "ag-7", name: "客服-赵强", type: "human", status: "offline", todayTasks: 38, todayCompleted: 38, connectRate: 70, qualifiedRate: 52, avgDuration: 200 },
    { id: "ag-8", name: "客服-刘芳", type: "human", status: "online", todayTasks: 35, todayCompleted: 28, connectRate: 65, qualifiedRate: 48, avgDuration: 180 },
  ];
}

// ── 派发规则 ──
export interface DistributionRule {
  id: string;
  name: string;
  dimension: string;
  weight: number;
  description: string;
  enabled: boolean;
}

export function generateDistributionRules(): DistributionRule[] {
  return [
    { id: "dr-1", name: "区域匹配", dimension: "region", weight: 30, description: "客资所在区域与企业服务区域匹配", enabled: true },
    { id: "dr-2", name: "品类匹配", dimension: "category", weight: 25, description: "客户需求品类与企业主营品类匹配", enabled: true },
    { id: "dr-3", name: "转化率加权", dimension: "conversion", weight: 20, description: "历史转化率高的企业优先", enabled: true },
    { id: "dr-4", name: "反馈率加权", dimension: "feedback", weight: 15, description: "反馈积极的企业优先派发", enabled: true },
    { id: "dr-5", name: "容量均衡", dimension: "capacity", weight: 10, description: "避免单一企业超负荷", enabled: true },
  ];
}

// ── 派发记录 ──
export interface DistributionRecord {
  id: string;
  leadId: string;
  leadName: string;
  enterpriseId: string;
  enterpriseName: string;
  matchScore: number;
  price: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  distributedAt: string;
  respondedAt?: string;
  matchReasons: string[];
}

export function generateDistributionRecords(): DistributionRecord[] {
  return [
    { id: "dist-1", leadId: "ld-2", leadName: "李女士", enterpriseId: "ed-4", enterpriseName: "金牌厨柜", matchScore: 92, price: 200, status: "accepted", distributedAt: "2026-04-14 17:30", respondedAt: "2026-04-14 18:05", matchReasons: ["品类匹配:橱柜", "区域匹配:深圳", "转化率20%"] },
    { id: "dist-2", leadId: "ld-9", leadName: "吴女士", enterpriseId: "ed-5", enterpriseName: "尚品宅配", matchScore: 95, price: 220, status: "accepted", distributedAt: "2026-04-11 14:00", respondedAt: "2026-04-11 14:15", matchReasons: ["品类匹配:全案", "区域匹配:广州", "转化率30%", "反馈率72%"] },
    { id: "dist-3", leadId: "ld-7", leadName: "孙女士", enterpriseId: "ed-4", enterpriseName: "金牌厨柜", matchScore: 88, price: 180, status: "accepted", distributedAt: "2026-04-10 10:30", respondedAt: "2026-04-10 11:00", matchReasons: ["品类匹配:厨房", "区域匹配:厦门"] },
    { id: "dist-4", leadId: "ld-8", leadName: "周先生", enterpriseId: "ed-6", enterpriseName: "志邦家居", matchScore: 75, price: 160, status: "pending", distributedAt: "2026-04-15 09:00", matchReasons: ["区域匹配:合肥", "品类匹配:全屋"] },
    { id: "dist-5", leadId: "ld-6", leadName: "陈先生", enterpriseId: "ed-7", enterpriseName: "城市之光装饰", matchScore: 97, price: 250, status: "accepted", distributedAt: "2026-03-16 12:00", respondedAt: "2026-03-16 12:20", matchReasons: ["品类匹配:全案别墅", "区域匹配:广州", "转化率30%", "反馈率85%"] },
  ];
}

// ── 跟进状态 ──
export type TrackingStage = "distributed" | "contacted" | "visited" | "measured" | "quoted" | "signed" | "lost";

export interface TrackingItem {
  id: string;
  leadId: string;
  leadName: string;
  phone: string;
  enterpriseName: string;
  stage: TrackingStage;
  distributedAt: string;
  firstContactAt?: string;
  lastUpdateAt: string;
  daysInStage: number;
  isOverdue: boolean;
  overdueType?: "no_contact" | "no_progress" | "no_feedback";
  feedbackCount: number;
  notes: string[];
}

export function generateTrackingItems(): TrackingItem[] {
  return [
    { id: "tk-1", leadId: "ld-2", leadName: "李女士", phone: "139****8876", enterpriseName: "金牌厨柜", stage: "measured", distributedAt: "2026-04-14 17:30", firstContactAt: "2026-04-14 18:30", lastUpdateAt: "2026-04-15 16:00", daysInStage: 1, isOverdue: false, feedbackCount: 3, notes: ["已电话联系，预约周末量房", "已上门量房，客户满意", "正在出方案"] },
    { id: "tk-2", leadId: "ld-9", leadName: "吴女士", phone: "159****6677", enterpriseName: "尚品宅配", stage: "quoted", distributedAt: "2026-04-11 14:00", firstContactAt: "2026-04-11 14:30", lastUpdateAt: "2026-04-14 20:00", daysInStage: 2, isOverdue: false, feedbackCount: 5, notes: ["立即联系", "上门量房完成", "方案已出", "客户对比中", "报价已发送"] },
    { id: "tk-3", leadId: "ld-7", leadName: "孙女士", phone: "188****4456", enterpriseName: "金牌厨柜", stage: "visited", distributedAt: "2026-04-10 10:30", firstContactAt: "2026-04-10 11:15", lastUpdateAt: "2026-04-13 14:00", daysInStage: 3, isOverdue: true, overdueType: "no_progress", feedbackCount: 2, notes: ["已联系，约到店", "已到店参观"] },
    { id: "tk-4", leadId: "ld-8", leadName: "周先生", phone: "186****9988", enterpriseName: "志邦家居", stage: "distributed", distributedAt: "2026-04-15 09:00", lastUpdateAt: "2026-04-15 09:00", daysInStage: 1, isOverdue: true, overdueType: "no_contact", feedbackCount: 0, notes: [] },
    { id: "tk-5", leadId: "ld-6", leadName: "陈先生", phone: "135****1122", enterpriseName: "城市之光装饰", stage: "signed", distributedAt: "2026-03-16 12:00", firstContactAt: "2026-03-16 12:45", lastUpdateAt: "2026-04-10 16:00", daysInStage: 0, isOverdue: false, feedbackCount: 8, notes: ["当天联系", "次日量房", "方案确认", "签订合同", "施工中"] },
    { id: "tk-6", leadId: "ld-10", leadName: "郑先生", phone: "133****2244", enterpriseName: "百安居装修", stage: "lost", distributedAt: "2026-04-08 18:00", firstContactAt: "2026-04-09 10:00", lastUpdateAt: "2026-04-12 09:00", daysInStage: 4, isOverdue: false, feedbackCount: 1, notes: ["已联系但无装修计划", "标记为流失"] },
  ];
}

// ── 结算 ──
export interface SettlementRecord {
  id: string;
  enterpriseName: string;
  period: string;
  leadsCount: number;
  qualifiedCount: number;
  conversions: number;
  model: "CPA" | "CPS" | "hybrid";
  unitPrice: number;
  totalAmount: number;
  deposit: number;
  deductions: number;
  finalAmount: number;
  status: "pending" | "confirmed" | "paid" | "disputed";
  createdAt: string;
}

export function generateSettlementRecords(): SettlementRecord[] {
  return [
    { id: "st-1", enterpriseName: "欧派家居集团", period: "2026年3月", leadsCount: 420, qualifiedCount: 380, conversions: 126, model: "CPA", unitPrice: 200, totalAmount: 84000, deposit: 16800, deductions: 2400, finalAmount: 64800, status: "paid", createdAt: "2026-04-01" },
    { id: "st-2", enterpriseName: "索菲亚家居", period: "2026年3月", leadsCount: 380, qualifiedCount: 340, conversions: 76, model: "CPA", unitPrice: 200, totalAmount: 76000, deposit: 15200, deductions: 3800, finalAmount: 57000, status: "confirmed", createdAt: "2026-04-01" },
    { id: "st-3", enterpriseName: "尚品宅配", period: "2026年3月", leadsCount: 260, qualifiedCount: 245, conversions: 78, model: "hybrid", unitPrice: 220, totalAmount: 57200, deposit: 11440, deductions: 0, finalAmount: 45760, status: "paid", createdAt: "2026-04-01" },
    { id: "st-4", enterpriseName: "好莱客创意家居", period: "2026年3月", leadsCount: 320, qualifiedCount: 280, conversions: 32, model: "CPA", unitPrice: 180, totalAmount: 57600, deposit: 11520, deductions: 8640, finalAmount: 37440, status: "disputed", createdAt: "2026-04-01" },
    { id: "st-5", enterpriseName: "城市之光装饰", period: "2026年3月", leadsCount: 180, qualifiedCount: 172, conversions: 54, model: "CPS", unitPrice: 250, totalAmount: 45000, deposit: 9000, deductions: 0, finalAmount: 36000, status: "paid", createdAt: "2026-04-01" },
    { id: "st-6", enterpriseName: "金牌厨柜", period: "2026年4月(截至)", leadsCount: 120, qualifiedCount: 108, conversions: 22, model: "CPA", unitPrice: 180, totalAmount: 21600, deposit: 4320, deductions: 0, finalAmount: 17280, status: "pending", createdAt: "2026-04-15" },
  ];
}

// ── 运营配置项 ──
export interface ScoringDimension {
  id: string;
  name: string;
  weight: number;
  description: string;
  options: { label: string; score: number }[];
}

export function generateScoringDimensions(): ScoringDimension[] {
  return [
    { id: "sd-1", name: "装修阶段", weight: 30, description: "客户当前所处装修决策阶段", options: [{ label: "已签约/施工中", score: 10 }, { label: "准备装修", score: 90 }, { label: "对比方案", score: 75 }, { label: "了解阶段", score: 50 }, { label: "无明确计划", score: 15 }] },
    { id: "sd-2", name: "预算范围", weight: 25, description: "客户装修预算与服务匹配度", options: [{ label: "50万+", score: 95 }, { label: "20-50万", score: 85 }, { label: "10-20万", score: 70 }, { label: "5-10万", score: 45 }, { label: "5万以下", score: 20 }] },
    { id: "sd-3", name: "房型面积", weight: 20, description: "房屋类型与面积", options: [{ label: "别墅/大平层", score: 95 }, { label: "三室及以上", score: 75 }, { label: "两室", score: 55 }, { label: "一室/单间", score: 25 }] },
    { id: "sd-4", name: "时间紧迫度", weight: 15, description: "客户期望装修开工时间", options: [{ label: "1个月内", score: 95 }, { label: "1-3个月", score: 75 }, { label: "3-6个月", score: 50 }, { label: "半年以上", score: 20 }] },
    { id: "sd-5", name: "响应质量", weight: 10, description: "客户在沟通中的参与度", options: [{ label: "主动咨询细节", score: 90 }, { label: "积极回应", score: 70 }, { label: "被动应答", score: 40 }, { label: "敷衍/挂断", score: 10 }] },
  ];
}

// ── Dashboard KPIs ──
export interface MarketingKPI {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  status?: "good" | "warning" | "danger";
}

export function generateMarketingKPIs(): MarketingKPI[] {
  return [
    { label: "本月线索总量", value: "4,280", subValue: "日均142条", trend: "up", trendValue: "+12%", status: "good" },
    { label: "平均CAC", value: "¥168", subValue: "目标≤¥150", trend: "up", trendValue: "+17%", status: "danger" },
    { label: "清洗合格率", value: "62.4%", subValue: "目标≥70%", trend: "down", trendValue: "-3.2%", status: "warning" },
    { label: "派发转化率", value: "13.3%", subValue: "目标≥18%", trend: "flat", trendValue: "", status: "warning" },
    { label: "企业反馈率", value: "34.2%", subValue: "目标≥60%", trend: "down", trendValue: "-8%", status: "danger" },
    { label: "本月营收", value: "¥468,000", subValue: "毛利38.2%", trend: "up", trendValue: "+5%", status: "good" },
  ];
}

// ── 管线漏斗 ──
export interface FunnelStage {
  stage: string;
  count: number;
  rate?: number;
  benchmark?: number;
  color: string;
}

export function generateFunnel(): FunnelStage[] {
  return [
    { stage: "线索获取", count: 4280, color: "bg-blue-500" },
    { stage: "清洗合格", count: 2671, rate: 62.4, benchmark: 70, color: "bg-cyan-500" },
    { stage: "已派发", count: 2340, rate: 87.6, benchmark: 90, color: "bg-violet-500" },
    { stage: "企业已联系", count: 1638, rate: 70.0, benchmark: 85, color: "bg-amber-500" },
    { stage: "已转化", count: 312, rate: 19.0, benchmark: 25, color: "bg-emerald-500" },
    { stage: "已成交结算", count: 218, rate: 69.9, benchmark: 80, color: "bg-primary" },
  ];
}

// ── Lead status labels ──
export const LEAD_STATUS_MAP: Record<LeadStatus, { label: string; color: string }> = {
  raw: { label: "原始线索", color: "bg-muted-foreground" },
  pending_cleanse: { label: "待清洗", color: "bg-slate-400" },
  cleansing: { label: "清洗中", color: "bg-blue-500" },
  qualified: { label: "合格", color: "bg-emerald-500" },
  unqualified: { label: "不合格", color: "bg-red-400" },
  pending_distribute: { label: "待派发", color: "bg-violet-500" },
  distributed: { label: "已派发", color: "bg-primary" },
  contacted: { label: "已联系", color: "bg-amber-500" },
  converted: { label: "已转化", color: "bg-emerald-600" },
  lost: { label: "已流失", color: "bg-red-500" },
};

export const INTENT_LEVEL_MAP: Record<IntentLevel, { label: string; color: string }> = {
  high: { label: "高意向", color: "text-emerald-600" },
  medium: { label: "中意向", color: "text-amber-600" },
  low: { label: "低意向", color: "text-red-500" },
  unknown: { label: "待评估", color: "text-muted-foreground" },
};

export const TRACKING_STAGE_MAP: Record<TrackingStage, { label: string; color: string }> = {
  distributed: { label: "已派发", color: "bg-slate-400" },
  contacted: { label: "已联系", color: "bg-blue-500" },
  visited: { label: "已到店", color: "bg-cyan-500" },
  measured: { label: "已量房", color: "bg-violet-500" },
  quoted: { label: "已报价", color: "bg-amber-500" },
  signed: { label: "已签约", color: "bg-emerald-500" },
  lost: { label: "已流失", color: "bg-red-500" },
};
