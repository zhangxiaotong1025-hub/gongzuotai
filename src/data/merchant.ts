// ==================== Merchant-side Mock Data ====================

// ---------- Types ----------
export interface MerchantLead {
  id: string;
  name: string;
  phone: string;
  source: string;
  aiScore: number;
  intentLevel: "high" | "medium" | "low";
  status: "pending_contact" | "contacted" | "interested" | "visited" | "signed" | "lost";
  assignedAt: string;
  lastFollowUp?: string;
  nextAction?: string;
  category: string;
  region: string;
  budget?: string;
  followUps: FollowUpRecord[];
}

export interface FollowUpRecord {
  id: string;
  time: string;
  type: "call" | "wechat" | "visit" | "quote" | "sign";
  content: string;
  result: string;
}

export interface Deal {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  category: string;
  designer: string;
  stage: "opportunity" | "quoted" | "signed" | "started";
  source: string;
  createdAt: string;
  signedAt?: string;
  expectedClose?: string;
  notes?: string;
}

export interface Project {
  id: string;
  customerName: string;
  dealId: string;
  amount: number;
  stage: "designing" | "constructing" | "inspecting" | "completed";
  designer: string;
  foreman?: string;
  startDate: string;
  expectedEnd: string;
  actualEnd?: string;
  milestones: ProjectMilestone[];
  overdue: boolean;
}

export interface ProjectMilestone {
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: "done" | "current" | "upcoming" | "overdue";
}

export interface Review {
  id: string;
  customerName: string;
  projectId: string;
  designScore: number;
  constructionScore: number;
  serviceScore: number;
  valueScore: number;
  overall: number;
  comment: string;
  createdAt: string;
}

export interface RetentionCustomer {
  id: string;
  name: string;
  phone: string;
  completedAt: string;
  projectType: string;
  totalSpent: number;
  satisfaction: number;
  opportunities: RetentionOpportunity[];
  referrals: number;
  lastContact?: string;
}

export interface RetentionOpportunity {
  type: "soft_furnishing" | "maintenance" | "renovation" | "referral";
  label: string;
  probability: number;
  estimatedValue: number;
}

export interface MerchantStats {
  totalLeads: number;
  contactRate: number;
  conversionRate: number;
  avgDealAmount: number;
  activeProjects: number;
  avgSatisfaction: number;
  creditLevel: "S" | "A" | "B" | "C" | "D";
  monthlyRevenue: number;
  referralLeads: number;
  cac: number;
}

// ---------- Status labels ----------
export const LEAD_STATUS_MAP: Record<MerchantLead["status"], { label: string; color: string }> = {
  pending_contact: { label: "待联系", color: "bg-amber-500/10 text-amber-600" },
  contacted: { label: "已联系", color: "bg-blue-500/10 text-blue-500" },
  interested: { label: "意向中", color: "bg-purple-500/10 text-purple-500" },
  visited: { label: "已约见", color: "bg-cyan-500/10 text-cyan-500" },
  signed: { label: "已签单", color: "bg-emerald-500/10 text-emerald-600" },
  lost: { label: "已流失", color: "bg-red-500/10 text-red-500" },
};

export const DEAL_STAGE_MAP: Record<Deal["stage"], { label: string; color: string }> = {
  opportunity: { label: "商机", color: "bg-blue-500/10 text-blue-500" },
  quoted: { label: "已报价", color: "bg-amber-500/10 text-amber-600" },
  signed: { label: "已签约", color: "bg-emerald-500/10 text-emerald-600" },
  started: { label: "已开工", color: "bg-purple-500/10 text-purple-500" },
};

export const PROJECT_STAGE_MAP: Record<Project["stage"], { label: string; color: string }> = {
  designing: { label: "设计中", color: "bg-blue-500/10 text-blue-500" },
  constructing: { label: "施工中", color: "bg-amber-500/10 text-amber-600" },
  inspecting: { label: "验收中", color: "bg-purple-500/10 text-purple-500" },
  completed: { label: "已完工", color: "bg-emerald-500/10 text-emerald-600" },
};

// ---------- Generators ----------
const names = ["张伟", "李芳", "王磊", "赵丽", "刘洋", "陈静", "杨超", "黄蕾", "周杰", "吴敏", "徐飞", "孙琳", "马强", "朱明", "何雪"];
const designers = ["李设计师", "王设计师", "赵设计师", "陈设计师"];
const categories = ["全屋定制", "厨房改造", "卫浴翻新", "客厅装修", "卧室改造", "阳台封装"];
const sources = ["平台派发", "平台派发", "平台派发", "老客转介绍", "自然到店"];
const regions = ["朝阳区", "海淀区", "丰台区", "西城区", "东城区", "通州区"];

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }

export function generateMerchantLeads(count = 30): MerchantLead[] {
  const statuses: MerchantLead["status"][] = ["pending_contact", "contacted", "interested", "visited", "signed", "lost"];
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const followUps: FollowUpRecord[] = status !== "pending_contact" ? Array.from(
      { length: randomBetween(1, 4) },
      (_, j) => ({
        id: `fu-${i}-${j}`,
        time: `2025-04-${String(randomBetween(1, 15)).padStart(2, "0")} ${randomBetween(9, 18)}:00`,
        type: (["call", "wechat", "visit", "quote"] as const)[j % 4],
        content: ["首次电话沟通需求", "微信发送案例图册", "上门量房并沟通方案", "发送正式报价单"][j % 4],
        result: ["客户表示有兴趣", "已查看，回复稍后考虑", "现场沟通顺利", "客户审核报价中"][j % 4],
      })
    ) : [];

    return {
      id: `ml-${i + 1}`,
      name: names[i % names.length],
      phone: `138${String(randomBetween(10000000, 99999999))}`,
      source: randomItem(sources),
      aiScore: randomBetween(40, 98),
      intentLevel: (["high", "medium", "low"] as const)[Math.floor(Math.random() * 3)],
      status,
      assignedAt: `2025-04-${String(randomBetween(1, 10)).padStart(2, "0")}`,
      lastFollowUp: status !== "pending_contact" ? `2025-04-${String(randomBetween(10, 16)).padStart(2, "0")}` : undefined,
      nextAction: status === "pending_contact" ? "尽快首次联系" : status === "interested" ? "预约上门量房" : undefined,
      category: randomItem(categories),
      region: randomItem(regions),
      budget: `${randomBetween(5, 30)}万`,
      followUps,
    };
  });
}

export function generateDeals(count = 15): Deal[] {
  const stages: Deal["stage"][] = ["opportunity", "quoted", "signed", "started"];
  return Array.from({ length: count }, (_, i) => ({
    id: `deal-${i + 1}`,
    customerName: names[i % names.length],
    phone: `139${String(randomBetween(10000000, 99999999))}`,
    amount: randomBetween(30000, 200000),
    category: randomItem(categories),
    designer: randomItem(designers),
    stage: stages[Math.floor(Math.random() * stages.length)],
    source: randomItem(sources),
    createdAt: `2025-03-${String(randomBetween(1, 28)).padStart(2, "0")}`,
    signedAt: Math.random() > 0.5 ? `2025-04-${String(randomBetween(1, 15)).padStart(2, "0")}` : undefined,
    expectedClose: `2025-05-${String(randomBetween(1, 28)).padStart(2, "0")}`,
  }));
}

export function generateProjects(count = 10): Project[] {
  const stages: Project["stage"][] = ["designing", "constructing", "inspecting", "completed"];
  const milestoneNames = ["量房", "出图", "签约确认", "材料进场", "水电施工", "泥木施工", "油漆施工", "竣工验收"];
  return Array.from({ length: count }, (_, i) => {
    const stage = stages[Math.floor(Math.random() * stages.length)];
    const doneCount = stage === "completed" ? 8 : stage === "inspecting" ? 7 : stage === "constructing" ? randomBetween(3, 6) : randomBetween(1, 2);
    const overdue = Math.random() > 0.7;
    return {
      id: `proj-${i + 1}`,
      customerName: names[i % names.length],
      dealId: `deal-${i + 1}`,
      amount: randomBetween(50000, 200000),
      stage,
      designer: randomItem(designers),
      foreman: stage !== "designing" ? `${["张", "李", "王"][i % 3]}工长` : undefined,
      startDate: `2025-02-${String(randomBetween(1, 28)).padStart(2, "0")}`,
      expectedEnd: `2025-06-${String(randomBetween(1, 28)).padStart(2, "0")}`,
      actualEnd: stage === "completed" ? `2025-05-${String(randomBetween(1, 28)).padStart(2, "0")}` : undefined,
      overdue,
      milestones: milestoneNames.map((name, j) => ({
        name,
        plannedDate: `2025-${String(2 + Math.floor(j / 2)).padStart(2, "0")}-${String(randomBetween(1, 28)).padStart(2, "0")}`,
        actualDate: j < doneCount ? `2025-${String(2 + Math.floor(j / 2)).padStart(2, "0")}-${String(randomBetween(1, 28)).padStart(2, "0")}` : undefined,
        status: j < doneCount ? "done" : j === doneCount ? (overdue && j === doneCount ? "overdue" : "current") : "upcoming",
      })),
    };
  });
}

export function generateReviews(count = 12): Review[] {
  const comments = [
    "设计师很专业，方案满意", "施工进度有延迟，但质量不错", "性价比很高，会推荐给朋友",
    "服务态度非常好", "整体满意，小细节可以改进", "超出预期，非常推荐",
    "沟通顺畅，效果很好", "工期略有延迟", "材料选择丰富", "验收很仔细",
    "设计风格正是我想要的", "施工团队非常负责",
  ];
  return Array.from({ length: count }, (_, i) => {
    const scores = [randomBetween(3, 5), randomBetween(3, 5), randomBetween(3, 5), randomBetween(3, 5)];
    return {
      id: `rev-${i + 1}`,
      customerName: names[i % names.length],
      projectId: `proj-${(i % 10) + 1}`,
      designScore: scores[0],
      constructionScore: scores[1],
      serviceScore: scores[2],
      valueScore: scores[3],
      overall: +(scores.reduce((a, b) => a + b, 0) / 4).toFixed(1),
      comment: comments[i % comments.length],
      createdAt: `2025-04-${String(randomBetween(1, 16)).padStart(2, "0")}`,
    };
  });
}

export function generateRetentionCustomers(count = 15): RetentionCustomer[] {
  const oppTypes: RetentionOpportunity["type"][] = ["soft_furnishing", "maintenance", "renovation", "referral"];
  const oppLabels: Record<RetentionOpportunity["type"], string> = {
    soft_furnishing: "软装配饰", maintenance: "维修保养", renovation: "局部翻新", referral: "转介绍",
  };
  return Array.from({ length: count }, (_, i) => ({
    id: `ret-${i + 1}`,
    name: names[i % names.length],
    phone: `137${String(randomBetween(10000000, 99999999))}`,
    completedAt: `2024-${String(randomBetween(1, 12)).padStart(2, "0")}-${String(randomBetween(1, 28)).padStart(2, "0")}`,
    projectType: randomItem(categories),
    totalSpent: randomBetween(50000, 300000),
    satisfaction: randomBetween(3, 5),
    referrals: randomBetween(0, 3),
    lastContact: Math.random() > 0.3 ? `2025-0${randomBetween(1, 4)}-${String(randomBetween(1, 28)).padStart(2, "0")}` : undefined,
    opportunities: Array.from({ length: randomBetween(1, 3) }, () => {
      const type = randomItem(oppTypes);
      return {
        type,
        label: oppLabels[type],
        probability: randomBetween(20, 90),
        estimatedValue: randomBetween(5000, 80000),
      };
    }),
  }));
}

export function generateMerchantStats(): MerchantStats {
  return {
    totalLeads: 156,
    contactRate: 87,
    conversionRate: 23,
    avgDealAmount: 86500,
    activeProjects: 8,
    avgSatisfaction: 4.3,
    creditLevel: "A",
    monthlyRevenue: 692000,
    referralLeads: 12,
    cac: 185,
  };
}
