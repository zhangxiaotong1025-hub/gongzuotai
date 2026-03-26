/* ══════════════════════════════════════════════════
   Shared entitlement data store (mock)
   Entity chain: App → Capability → Rule → Sku → Package
   ══════════════════════════════════════════════════ */

/* ── App (应用/产品) ── */
export interface AppItem {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export const appData: AppItem[] = [
  { id: "app1", name: "国内3D设计工具", code: "JURAN_DESIGN", description: "居然设计家3D设计工具", status: "active", createdAt: "2026-03-10", updatedAt: "2026-03-10" },
  { id: "app2", name: "国际3D设计工具", code: "GLOBAL_3D", description: "国际版3D建模工具", status: "active", createdAt: "2026-03-10", updatedAt: "2026-03-10" },
  { id: "app3", name: "AI App", code: "AI_APP", description: "AI设计应用", status: "active", createdAt: "2026-03-11", updatedAt: "2026-03-11" },
  { id: "app4", name: "智能导购", code: "SMART_GUIDE", description: "智能导购系统", status: "active", createdAt: "2026-03-11", updatedAt: "2026-03-12" },
  { id: "app5", name: "直播工具", code: "LIVE_TOOL", description: "直播/内容工具", status: "inactive", createdAt: "2026-03-12", updatedAt: "2026-03-12" },
];

/* ── Capability (权益能力) ── */
export type DataType = "COUNTER" | "BOOLEAN" | "STORAGE" | "DURATION";

export interface Capability {
  id: string;
  name: string;
  code: string;
  appId: string;       // → AppItem.id
  appName: string;     // denormalized
  dataType: DataType;
  unit: string;
  apiPath: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const capabilityData: Capability[] = [
  { id: "cap1", name: "AI设计", code: "ai_design", appId: "app1", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/ai/design", description: "AI智能设计能力，支持自动生成设计方案", status: "active", createdAt: "2026-03-10" },
  { id: "cap2", name: "3D渲染", code: "3d_render", appId: "app1", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/render/3d", description: "高性能3D场景渲染服务", status: "active", createdAt: "2026-03-10" },
  { id: "cap3", name: "模型下载", code: "model_download", appId: "app1", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/model/download", description: "3D模型资源下载服务", status: "active", createdAt: "2026-03-10" },
  { id: "cap4", name: "AI配色", code: "ai_color", appId: "app3", appName: "AI App", dataType: "COUNTER", unit: "次", apiPath: "/api/ai/color", description: "AI智能配色建议服务", status: "inactive", createdAt: "2026-03-11" },
  { id: "cap5", name: "智能排版", code: "smart_layout", appId: "app3", appName: "AI App", dataType: "DURATION", unit: "tokens", apiPath: "/api/ai/layout", description: "自动智能排版布局生成", status: "active", createdAt: "2026-03-11" },
  { id: "cap6", name: "素材库", code: "material_library", appId: "app1", appName: "国内3D设计工具", dataType: "BOOLEAN", unit: "布尔", apiPath: "/api/material/library", description: "海量设计素材资源库访问", status: "active", createdAt: "2026-03-11" },
  { id: "cap7", name: "4K渲染", code: "render_4k", appId: "app1", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/render/4k", description: "4K分辨率高清渲染", status: "active", createdAt: "2026-03-10" },
  { id: "cap8", name: "8K渲染", code: "render_8k", appId: "app1", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/render/8k", description: "8K超清渲染", status: "active", createdAt: "2026-03-10" },
  { id: "cap9", name: "云存储", code: "cloud_storage", appId: "app1", appName: "国内3D设计工具", dataType: "STORAGE", unit: "MB", apiPath: "/api/storage", description: "云端文件存储服务", status: "active", createdAt: "2026-03-12" },
  { id: "cap10", name: "全景图导出", code: "export_panorama", appId: "app1", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/export/panorama", description: "全景图导出功能", status: "active", createdAt: "2026-03-10" },
];

/* ── Rule (权益规则) ── */
export interface Rule {
  id: string;
  name: string;
  code: string;
  capabilityId: string;    // → Capability.id
  capabilityName: string;  // denormalized
  appName: string;         // denormalized (from capability)
  quota: number;
  periodType: string;
  periodValue: number;
  grantType: string;
  isCumulative: boolean;
  expirePolicy: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const ruleData: Rule[] = [
  { id: "rule1", name: "AI设计100次/日", code: "RULE_AI_100_DAY", capabilityId: "cap1", capabilityName: "AI设计", appName: "国内3D设计工具", quota: 100, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新100次AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "rule2", name: "AI设计300次/日", code: "RULE_AI_300_DAY", capabilityId: "cap1", capabilityName: "AI设计", appName: "国内3D设计工具", quota: 300, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新300次AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "rule3", name: "AI设计500次/日", code: "RULE_AI_500_DAY", capabilityId: "cap1", capabilityName: "AI设计", appName: "国内3D设计工具", quota: 500, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新500次AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "rule4", name: "4K渲染2次/日", code: "RULE_4K_2_DAY", capabilityId: "cap7", capabilityName: "4K渲染", appName: "国内3D设计工具", quota: 2, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "rule5", name: "4K渲染4次/日", code: "RULE_4K_4_DAY", capabilityId: "cap7", capabilityName: "4K渲染", appName: "国内3D设计工具", quota: 4, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "rule6", name: "8K渲染1次/日", code: "RULE_8K_1_DAY", capabilityId: "cap8", capabilityName: "8K渲染", appName: "国内3D设计工具", quota: 1, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "rule7", name: "云存储200MB", code: "RULE_STORAGE_200MB", capabilityId: "cap9", capabilityName: "云存储", appName: "国内3D设计工具", quota: 200, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "rule8", name: "云存储4GB", code: "RULE_STORAGE_4GB", capabilityId: "cap9", capabilityName: "云存储", appName: "国内3D设计工具", quota: 4096, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "rule9", name: "4K渲染1次", code: "RULE_4K_1_ONCE", capabilityId: "cap7", capabilityName: "4K渲染", appName: "国内3D设计工具", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true, expirePolicy: "NEVER_EXPIRE", description: "充值类，可累积", status: "active", createdAt: "2026-03-11" },
  { id: "rule10", name: "素材库访问", code: "RULE_MATERIAL_ACCESS", capabilityId: "cap6", capabilityName: "素材库", appName: "国内3D设计工具", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "", status: "active", createdAt: "2026-03-11" },
];

/* ── Sku (权益商品) ── */
export interface Sku {
  id: string;
  name: string;
  code: string;
  ruleId: string;       // → Rule.id
  ruleName: string;     // denormalized
  capabilityName: string; // denormalized (from rule)
  appName: string;      // denormalized
  price: number;
  salesStatus: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

export const skuData: Sku[] = [
  { id: "sku1", name: "4K普通图", code: "SKU_4K_SINGLE", ruleId: "rule9", ruleName: "4K渲染1次", capabilityName: "4K渲染", appName: "国内3D设计工具", price: 3, salesStatus: "on_sale", sortOrder: 1, description: "单次4K渲染", createdAt: "2026-03-10" },
  { id: "sku2", name: "8K普通图", code: "SKU_8K_SINGLE", ruleId: "rule6", ruleName: "8K渲染1次/日", capabilityName: "8K渲染", appName: "国内3D设计工具", price: 6, salesStatus: "on_sale", sortOrder: 2, description: "单次8K渲染", createdAt: "2026-03-10" },
  { id: "sku3", name: "AI设计100次/日", code: "SKU_AI_100_DAY", ruleId: "rule1", ruleName: "AI设计100次/日", capabilityName: "AI设计", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 1, description: "免费版用", createdAt: "2026-03-10" },
  { id: "sku4", name: "AI设计300次/日", code: "SKU_AI_300_DAY", ruleId: "rule2", ruleName: "AI设计300次/日", capabilityName: "AI设计", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 2, description: "基础会员用", createdAt: "2026-03-10" },
  { id: "sku5", name: "AI设计500次/日", code: "SKU_AI_500_DAY", ruleId: "rule3", ruleName: "AI设计500次/日", capabilityName: "AI设计", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 3, description: "旗舰会员用", createdAt: "2026-03-10" },
  { id: "sku6", name: "4K渲染2次/日", code: "SKU_4K_2_DAY", ruleId: "rule4", ruleName: "4K渲染2次/日", capabilityName: "4K渲染", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 4, description: "", createdAt: "2026-03-10" },
  { id: "sku7", name: "4K渲染4次/日", code: "SKU_4K_4_DAY", ruleId: "rule5", ruleName: "4K渲染4次/日", capabilityName: "4K渲染", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 5, description: "", createdAt: "2026-03-10" },
  { id: "sku8", name: "8K渲染1次/日", code: "SKU_8K_1_DAY", ruleId: "rule6", ruleName: "8K渲染1次/日", capabilityName: "8K渲染", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 6, description: "", createdAt: "2026-03-10" },
  { id: "sku9", name: "云存储200MB", code: "SKU_STORAGE_200MB", ruleId: "rule7", ruleName: "云存储200MB", capabilityName: "云存储", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 7, description: "", createdAt: "2026-03-10" },
  { id: "sku10", name: "素材库访问", code: "SKU_MATERIAL", ruleId: "rule10", ruleName: "素材库访问", capabilityName: "素材库", appName: "国内3D设计工具", price: 0, salesStatus: "on_sale", sortOrder: 8, description: "", createdAt: "2026-03-11" },
];

/* ── Package (权益包) ── */
export interface PackageItem {
  id: string;
  name: string;
  code: string;
  appId: string;        // → AppItem.id
  appName: string;      // denormalized
  price: number;
  originalPrice?: number;
  billingCycle: string;
  trialDays: number;
  skuIds: string[];     // → Sku.id[]
  skuList: { id: string; name: string; isCore: boolean }[];
  status: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

export const packageData: PackageItem[] = [
  {
    id: "pkg1", name: "免费版", code: "PKG_FREE", appId: "app1", appName: "国内3D设计工具", price: 0, billingCycle: "PERMANENT", trialDays: 0, status: "on_sale", sortOrder: 1, description: "基础免费权益", createdAt: "2026-03-10",
    skuIds: ["sku3", "sku6", "sku9", "sku10"],
    skuList: [
      { id: "sku3", name: "AI设计100次/日", isCore: true },
      { id: "sku6", name: "4K渲染2次/日", isCore: true },
      { id: "sku9", name: "云存储200MB", isCore: false },
      { id: "sku10", name: "素材库访问", isCore: false },
    ],
  },
  {
    id: "pkg2", name: "基础会员", code: "PKG_BASIC", appId: "app1", appName: "国内3D设计工具", price: 99, billingCycle: "MONTH", trialDays: 0, status: "on_sale", sortOrder: 2, description: "基础会员套餐", createdAt: "2026-03-10",
    skuIds: ["sku4", "sku7", "sku8", "sku10"],
    skuList: [
      { id: "sku4", name: "AI设计300次/日", isCore: true },
      { id: "sku7", name: "4K渲染4次/日", isCore: true },
      { id: "sku8", name: "8K渲染1次/日", isCore: true },
      { id: "sku10", name: "素材库访问", isCore: false },
    ],
  },
  {
    id: "pkg3", name: "旗舰会员", code: "PKG_PRO", appId: "app1", appName: "国内3D设计工具", price: 150, originalPrice: 299, billingCycle: "MONTH", trialDays: 0, status: "on_sale", sortOrder: 3, description: "旗舰会员套餐，全部权益", createdAt: "2026-03-10",
    skuIds: ["sku5", "sku7", "sku8", "sku10"],
    skuList: [
      { id: "sku5", name: "AI设计500次/日", isCore: true },
      { id: "sku7", name: "4K渲染4次/日", isCore: true },
      { id: "sku8", name: "8K渲染1次/日", isCore: true },
      { id: "sku10", name: "素材库访问", isCore: false },
    ],
  },
];

/* ── Shared constants ── */
export const DATA_TYPES: { value: DataType; label: string; unit: string }[] = [
  { value: "COUNTER", label: "次数计量", unit: "次" },
  { value: "BOOLEAN", label: "布尔型", unit: "布尔" },
  { value: "STORAGE", label: "存储计量", unit: "MB" },
  { value: "DURATION", label: "时长计量", unit: "分钟" },
];

export const DATA_TYPE_MAP: Record<string, string> = {
  COUNTER: "次数计量", BOOLEAN: "布尔型", STORAGE: "存储计量", DURATION: "时长计量",
};

export const PERIOD_TYPES = [
  { value: "DAY", label: "天" },
  { value: "MONTH", label: "月" },
  { value: "YEAR", label: "年" },
  { value: "PERMANENT", label: "永久" },
];

export const GRANT_TYPES = [
  { value: "DAILY_REFRESH", label: "每日刷新" },
  { value: "MONTHLY_GRANT", label: "每月发放" },
  { value: "ONE_TIME", label: "一次性" },
];

export const EXPIRE_POLICIES = [
  { value: "CLEAR_ON_EXPIRE", label: "到期清零" },
  { value: "NEVER_EXPIRE", label: "不过期" },
];

export const BILLING_CYCLES = [
  { value: "MONTH", label: "月" },
  { value: "QUARTER", label: "季" },
  { value: "YEAR", label: "年" },
  { value: "PERMANENT", label: "永久" },
];

export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "启用", className: "badge-active" },
  inactive: { label: "停用", className: "badge-inactive" },
  on_sale: { label: "上架", className: "badge-active" },
  off_sale: { label: "下架", className: "badge-inactive" },
};

/* ── Helper: get related items ── */
export const getCapabilitiesByApp = (appId: string) => capabilityData.filter((c) => c.appId === appId);
export const getRulesByCapability = (capId: string) => ruleData.filter((r) => r.capabilityId === capId);
export const getSkusByRule = (ruleId: string) => skuData.filter((s) => s.ruleId === ruleId);
export const getPackagesByApp = (appId: string) => packageData.filter((p) => p.appId === appId);
