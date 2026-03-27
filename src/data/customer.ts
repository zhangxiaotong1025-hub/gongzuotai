/* ── Customer Module Shared Data & Types ── */

// ── Lifecycle Stages ──
export type DesignerLifecycle = "registered" | "activated" | "growing" | "mature" | "renewal" | "churn_warning" | "churned" | "recalled";
export type EndCustomerLifecycle = "new" | "following" | "won" | "serving" | "churn_warning" | "churned";

export const DESIGNER_LIFECYCLE_MAP: Record<DesignerLifecycle, { label: string; color: string }> = {
  registered: { label: "注册期", color: "bg-blue-100 text-blue-700" },
  activated: { label: "激活期", color: "bg-cyan-100 text-cyan-700" },
  growing: { label: "成长期", color: "bg-emerald-100 text-emerald-700" },
  mature: { label: "成熟期", color: "bg-primary/10 text-primary" },
  renewal: { label: "续费期", color: "bg-amber-100 text-amber-700" },
  churn_warning: { label: "流失预警", color: "bg-orange-100 text-orange-700" },
  churned: { label: "已流失", color: "bg-red-100 text-red-700" },
  recalled: { label: "召回期", color: "bg-violet-100 text-violet-700" },
};

export const END_CUSTOMER_LIFECYCLE_MAP: Record<EndCustomerLifecycle, { label: string; color: string }> = {
  new: { label: "新录入", color: "bg-blue-100 text-blue-700" },
  following: { label: "跟进中", color: "bg-cyan-100 text-cyan-700" },
  won: { label: "已成交", color: "bg-emerald-100 text-emerald-700" },
  serving: { label: "服务中", color: "bg-primary/10 text-primary" },
  churn_warning: { label: "流失预警", color: "bg-orange-100 text-orange-700" },
  churned: { label: "已流失", color: "bg-red-100 text-red-700" },
};

// ── Follow Status ──
export type FollowStatus = "pending" | "following" | "won" | "lost";
export const FOLLOW_STATUS_MAP: Record<FollowStatus, { label: string; color: string }> = {
  pending: { label: "待跟进", color: "bg-muted text-muted-foreground" },
  following: { label: "跟进中", color: "bg-blue-100 text-blue-700" },
  won: { label: "已成交", color: "bg-emerald-100 text-emerald-700" },
  lost: { label: "已流失", color: "bg-red-100 text-red-700" },
};

// ── Common Types ──
export interface Designer {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lifecycle: DesignerLifecycle;
  currentPackage: string;
  packageExpiry: string;
  usageRate: number; // 0-100
  totalSpent: number;
  lastLoginAt: string;
  registeredAt: string;
  tags: string[];
  source: string;
  cvsScore: number; // 0-100
  designCount: number;
  renderCount: number;
  loginDays30: number;
  featuresUsed: number;
  renewalCount: number;
}

export interface EndCustomer {
  id: string;
  name: string;
  phone: string;
  lifecycle: EndCustomerLifecycle;
  followStatus: FollowStatus;
  sourceEnterprise: string;
  assignedStaff: string;
  intentLevel: "high" | "medium" | "low";
  lastFollowAt: string;
  createdAt: string;
  tags: string[];
  remark?: string;
  linkedEnterprises: { id: string; name: string; type: string; staff: string; followStatus: FollowStatus; createdAt: string }[];
}

export interface FollowRecord {
  id: string;
  type: "phone" | "wechat" | "email" | "visit" | "online_meeting" | "system";
  content: string;
  feedback?: "positive" | "neutral" | "negative";
  result?: "won" | "lost" | "pending" | "need_followup";
  nextFollowAt?: string;
  operator: string;
  createdAt: string;
  enterprise?: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  type: "preset" | "custom";
  customerCount: number;
  conditions: string;
  status: "active" | "inactive";
  lastSyncedAt: string;
  createdAt: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: "entitlement_grant" | "coupon" | "message" | "exclusive_package";
  segmentName: string;
  targetCount: number;
  startAt: string;
  endAt: string;
  status: "draft" | "pending" | "running" | "finished" | "cancelled";
  reachCount: number;
  openCount: number;
  convertCount: number;
  convertAmount: number;
  createdAt: string;
}

export interface AlertCustomer {
  id: string;
  name: string;
  phone: string;
  type: "designer" | "end_customer";
  alertType: "expiring_urgent" | "expiring_soon" | "low_usage" | "inactive" | "usage_drop" | "not_activated";
  alertLevel: "red" | "orange" | "yellow";
  detail: string;
  lifecycle: string;
  handled: boolean;
}

// ── Constants ──
export const TAGS_POOL = ["高价值", "流失风险", "待激活", "高意向", "已签约", "VIP", "新客户", "待跟进", "装修中", "已交付"];
export const SOURCE_CHANNELS = ["官网注册", "销售邀请", "活动引流", "渠道推荐"];
export const PACKAGES = ["基础版", "专业版", "旗舰版", "企业定制版"];
export const ENTERPRISES = ["欧派家居集团", "索菲亚家居", "尚品宅配", "好莱客创意家居", "金牌厨柜", "志邦家居"];
export const FOLLOW_TYPES_MAP: Record<string, string> = {
  phone: "电话沟通", wechat: "微信沟通", email: "邮件", visit: "上门拜访", online_meeting: "线上会议", system: "系统自动",
};
export const CAMPAIGN_TYPE_MAP: Record<string, string> = {
  entitlement_grant: "权益赠送", coupon: "优惠券发放", message: "消息触达", exclusive_package: "专属套餐",
};
export const CAMPAIGN_STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-muted text-muted-foreground" },
  pending: { label: "待执行", color: "bg-blue-100 text-blue-700" },
  running: { label: "执行中", color: "bg-emerald-100 text-emerald-700" },
  finished: { label: "已结束", color: "bg-muted text-muted-foreground" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-600" },
};

// ── Mock Data Generators ──
const NAMES_C = ["张明", "李雪", "王浩然", "陈思", "刘畅", "赵婷", "周文", "吴建国", "郑丽华", "孙鹏飞", "黄伟", "林晓", "何芳", "马超", "罗敏"];
const NAMES_B = ["张先生", "李女士", "王总", "赵太太", "刘先生", "陈女士", "杨先生", "马女士", "黄总", "林女士", "周先生", "吴女士"];
const STAFF = ["王设计师", "李顾问", "张经理", "陈主管", "赵助理"];
const LIFECYCLE_C: DesignerLifecycle[] = ["registered", "activated", "growing", "mature", "renewal", "churn_warning", "churned"];
const LIFECYCLE_B: EndCustomerLifecycle[] = ["new", "following", "won", "serving", "churn_warning", "churned"];

function rPhone() { return `1${["38","39","50","58","86","87"][Math.floor(Math.random()*6)]}${String(Math.floor(Math.random()*1e8)).padStart(8,"0")}`; }
function rDate(year: number, monthRange: [number, number]) { return `${year}-${String(monthRange[0]+Math.floor(Math.random()*(monthRange[1]-monthRange[0]+1))).padStart(2,"0")}-${String(Math.floor(Math.random()*28)+1).padStart(2,"0")}`; }
function rPick<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }

export function generateDesigners(count = 40): Designer[] {
  return Array.from({ length: count }, (_, i) => {
    const lc = rPick(LIFECYCLE_C);
    const usage = lc === "mature" ? 70+Math.floor(Math.random()*30) : lc === "growing" ? 30+Math.floor(Math.random()*40) : lc === "churned" ? Math.floor(Math.random()*10) : Math.floor(Math.random()*60);
    const cvs = lc === "mature" ? 80+Math.floor(Math.random()*20) : lc === "growing" ? 50+Math.floor(Math.random()*30) : lc === "churned" ? Math.floor(Math.random()*20) : 20+Math.floor(Math.random()*60);
    return {
      id: `des-${i+1}`,
      name: NAMES_C[i % NAMES_C.length] + (i >= NAMES_C.length ? `${Math.floor(i/NAMES_C.length)+1}` : ""),
      phone: rPhone(),
      lifecycle: lc,
      currentPackage: rPick(PACKAGES),
      packageExpiry: rDate(2026, [3, 12]),
      usageRate: usage,
      totalSpent: Math.floor(Math.random()*50000)+1000,
      lastLoginAt: rDate(2026, [1, 3]),
      registeredAt: rDate(2024, [1, 12]),
      tags: Array.from(new Set(Array.from({ length: Math.floor(Math.random()*3)+1 }, () => rPick(TAGS_POOL)))),
      source: rPick(SOURCE_CHANNELS),
      cvsScore: cvs,
      designCount: Math.floor(Math.random()*80),
      renderCount: Math.floor(Math.random()*500),
      loginDays30: Math.floor(Math.random()*30),
      featuresUsed: Math.floor(Math.random()*8)+1,
      renewalCount: Math.floor(Math.random()*5),
    };
  });
}

export function generateEndCustomers(count = 35): EndCustomer[] {
  return Array.from({ length: count }, (_, i) => {
    const lc = rPick(LIFECYCLE_B);
    const fs: FollowStatus = lc === "won" || lc === "serving" ? "won" : lc === "churned" ? "lost" : lc === "following" ? "following" : "pending";
    const ent = rPick(ENTERPRISES);
    return {
      id: `ec-${i+1}`,
      name: NAMES_B[i % NAMES_B.length] + (i >= NAMES_B.length ? `${Math.floor(i/NAMES_B.length)+1}` : ""),
      phone: rPhone(),
      lifecycle: lc,
      followStatus: fs,
      sourceEnterprise: ent,
      assignedStaff: rPick(STAFF),
      intentLevel: rPick(["high", "medium", "low"] as const),
      lastFollowAt: rDate(2026, [1, 3]),
      createdAt: rDate(2025, [1, 12]),
      tags: Array.from(new Set(Array.from({ length: Math.floor(Math.random()*3)+1 }, () => rPick(TAGS_POOL)))),
      remark: Math.random() > 0.5 ? "客户有明确装修需求" : undefined,
      linkedEnterprises: [
        { id: `ent-${i}`, name: ent, type: "品牌商", staff: rPick(STAFF), followStatus: fs, createdAt: rDate(2025, [1, 6]) },
        ...(Math.random() > 0.6 ? [{ id: `ent-${i+100}`, name: rPick(ENTERPRISES.filter(e => e !== ent)), type: "装修公司", staff: rPick(STAFF), followStatus: "following" as FollowStatus, createdAt: rDate(2025, [6, 12]) }] : []),
      ],
    };
  });
}

export function generateFollowRecords(count = 8): FollowRecord[] {
  const types: FollowRecord["type"][] = ["phone", "wechat", "visit", "online_meeting", "email"];
  return Array.from({ length: count }, (_, i) => ({
    id: `fr-${i+1}`,
    type: rPick(types),
    content: rPick([
      "客户表示对现代简约风格感兴趣，需要进一步沟通方案",
      "已发送设计方案PDF，客户反馈需要修改厨房布局",
      "电话沟通确认预算和时间安排，客户计划下月开工",
      "客户到店参观，对全屋定制方案非常满意",
      "微信发送效果图，客户已确认签约意向",
      "系统自动推送续费提醒",
    ]),
    feedback: rPick(["positive", "neutral", "negative"] as const),
    result: rPick(["won", "pending", "need_followup"] as const),
    nextFollowAt: Math.random() > 0.3 ? rDate(2026, [3, 6]) : undefined,
    operator: rPick(STAFF),
    createdAt: rDate(2026, [1, 3]),
    enterprise: rPick(ENTERPRISES),
  }));
}

export function generateSegments(): CustomerSegment[] {
  return [
    { id: "seg-1", name: "注册未激活", description: "注册>7天，无有效订单", type: "preset", customerCount: 42, conditions: "注册>7天 & 无订单", status: "active", lastSyncedAt: "2026-03-27 08:00", createdAt: "2026-01-01" },
    { id: "seg-2", name: "即将到期", description: "权益到期≤30天", type: "preset", customerCount: 35, conditions: "到期≤30天", status: "active", lastSyncedAt: "2026-03-27 08:00", createdAt: "2026-01-01" },
    { id: "seg-3", name: "高价值活跃", description: "CVS≥80，近7天有登录", type: "preset", customerCount: 89, conditions: "CVS≥80 & 7天内登录", status: "active", lastSyncedAt: "2026-03-27 08:00", createdAt: "2026-01-01" },
    { id: "seg-4", name: "低使用率", description: "使用率<20%，已购买>15天", type: "preset", customerCount: 28, conditions: "使用率<20% & 购买>15天", status: "active", lastSyncedAt: "2026-03-27 08:00", createdAt: "2026-01-01" },
    { id: "seg-5", name: "流失预警", description: "连续30天未登录", type: "preset", customerCount: 18, conditions: "30天未登录", status: "active", lastSyncedAt: "2026-03-27 08:00", createdAt: "2026-01-01" },
    { id: "seg-6", name: "已流失", description: "权益到期>30天无续费", type: "preset", customerCount: 67, conditions: "到期>30天 & 无续费", status: "active", lastSyncedAt: "2026-03-27 08:00", createdAt: "2026-01-01" },
    { id: "seg-7", name: "华东高消费设计师", description: "华东地区累计消费>2万的设计师", type: "custom", customerCount: 23, conditions: "华东 & 消费>2万", status: "active", lastSyncedAt: "2026-03-26 20:00", createdAt: "2026-02-15" },
    { id: "seg-8", name: "新注册专业版用户", description: "近30天注册且购买专业版", type: "custom", customerCount: 15, conditions: "30天内注册 & 专业版", status: "active", lastSyncedAt: "2026-03-26 20:00", createdAt: "2026-03-01" },
  ];
}

export function generateCampaigns(): MarketingCampaign[] {
  return [
    { id: "cmp-1", name: "春季续费优惠活动", type: "coupon", segmentName: "即将到期", targetCount: 35, startAt: "2026-03-01", endAt: "2026-03-31", status: "running", reachCount: 32, openCount: 24, convertCount: 12, convertAmount: 48000, createdAt: "2026-02-28" },
    { id: "cmp-2", name: "新用户激活体验权益", type: "entitlement_grant", segmentName: "注册未激活", targetCount: 42, startAt: "2026-03-15", endAt: "2026-04-15", status: "running", reachCount: 38, openCount: 30, convertCount: 8, convertAmount: 16000, createdAt: "2026-03-14" },
    { id: "cmp-3", name: "VIP客户专属升级", type: "exclusive_package", segmentName: "高价值活跃", targetCount: 89, startAt: "2026-04-01", endAt: "2026-04-30", status: "pending", reachCount: 0, openCount: 0, convertCount: 0, convertAmount: 0, createdAt: "2026-03-25" },
    { id: "cmp-4", name: "流失客户召回消息", type: "message", segmentName: "已流失", targetCount: 67, startAt: "2026-02-01", endAt: "2026-02-28", status: "finished", reachCount: 60, openCount: 35, convertCount: 5, convertAmount: 10000, createdAt: "2026-01-30" },
    { id: "cmp-5", name: "使用率提升计划", type: "message", segmentName: "低使用率", targetCount: 28, startAt: "2026-03-20", endAt: "2026-04-20", status: "running", reachCount: 25, openCount: 18, convertCount: 3, convertAmount: 6000, createdAt: "2026-03-18" },
  ];
}

export function generateAlerts(): AlertCustomer[] {
  return [
    { id: "des-3", name: "王浩然", phone: "138****1234", type: "designer", alertType: "expiring_urgent", alertLevel: "red", detail: "权益将在3天后到期", lifecycle: "续费期", handled: false },
    { id: "des-5", name: "刘畅", phone: "139****5678", type: "designer", alertType: "expiring_soon", alertLevel: "orange", detail: "权益将在22天后到期", lifecycle: "续费期", handled: false },
    { id: "des-8", name: "吴建国", phone: "150****9012", type: "designer", alertType: "low_usage", alertLevel: "yellow", detail: "使用率仅12%，已购买25天", lifecycle: "激活期", handled: false },
    { id: "des-12", name: "黄伟", phone: "186****3456", type: "designer", alertType: "inactive", alertLevel: "yellow", detail: "已连续45天未登录", lifecycle: "流失预警", handled: true },
    { id: "des-2", name: "李雪", phone: "158****7890", type: "designer", alertType: "usage_drop", alertLevel: "red", detail: "使用率环比下降62%", lifecycle: "成长期", handled: false },
    { id: "des-15", name: "罗敏", phone: "187****2345", type: "designer", alertType: "not_activated", alertLevel: "orange", detail: "注册12天仍未付费", lifecycle: "注册期", handled: false },
    { id: "ec-2", name: "李女士", phone: "139****6789", type: "end_customer", alertType: "inactive", alertLevel: "yellow", detail: "企业60天未跟进该客户", lifecycle: "跟进中", handled: false },
    { id: "ec-7", name: "杨先生", phone: "150****1234", type: "end_customer", alertType: "expiring_soon", alertLevel: "orange", detail: "关联企业权益即将到期", lifecycle: "服务中", handled: false },
  ];
}

export const ALERT_TYPE_MAP: Record<string, { label: string; icon: string }> = {
  expiring_urgent: { label: "即将到期(紧急)", icon: "🔴" },
  expiring_soon: { label: "即将到期", icon: "🟠" },
  low_usage: { label: "使用率过低", icon: "🟡" },
  inactive: { label: "长期未活跃", icon: "🟡" },
  usage_drop: { label: "使用骤降", icon: "🔴" },
  not_activated: { label: "注册未激活", icon: "🟠" },
};
