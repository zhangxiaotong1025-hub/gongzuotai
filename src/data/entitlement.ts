/* ══════════════════════════════════════════════════
   Shared entitlement data store (mock)
   
   PRD Architecture (simplified - EntitlementProduct merged into Rule):
   
   Application ←──M:N──→ Capability (能力可跨应用复用)
        │                     │
        │                     │ 1:N
        │                     ▼
        │              MeteringRule (计量规则, 不透出菜单)
        │                     │
        │ 1:N                 │ N:1
        ▼                     ▼
   EntitlementProduct (权益产品 = 应用+能力+计量规则+额度+周期)
        │
        │ 1:N
        ▼
      SKU (商品)
        │
        │ N:M (BundleItems)
        ▼
     Bundle (套餐)
   
   ══════════════════════════════════════════════════ */

/* ── Application (应用) ── */
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
  { id: "app1", name: "国内3D设计工具", code: "DOMESTIC_3D", description: "国内3D建模工具", status: "active", createdAt: "2026-03-10", updatedAt: "2026-03-10" },
  { id: "app2", name: "国际3D设计工具", code: "GLOBAL_3D", description: "国际版3D建模工具", status: "active", createdAt: "2026-03-10", updatedAt: "2026-03-10" },
  { id: "app3", name: "AI App", code: "AI_APP", description: "AI设计应用", status: "active", createdAt: "2026-03-11", updatedAt: "2026-03-11" },
  { id: "app4", name: "智能导购", code: "SMART_GUIDE", description: "智能导购系统", status: "active", createdAt: "2026-03-11", updatedAt: "2026-03-12" },
  { id: "app5", name: "直播工具", code: "LIVE_TOOL", description: "直播/内容工具", status: "inactive", createdAt: "2026-03-12", updatedAt: "2026-03-12" },
];

/* ── Capability (能力) — 独立于应用，M:N ── */
export type CapabilityType = "AI" | "渲染" | "工具" | "存储" | "内容";

export interface Capability {
  id: string;
  name: string;
  code: string;
  type: CapabilityType;
  appIds: string[];       // M:N → Application
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const capabilityData: Capability[] = [
  { id: "cap1", name: "AI设计", code: "AI_DESIGN", type: "AI", appIds: ["app1", "app2", "app3"], description: "AI辅助设计能力", status: "active", createdAt: "2026-03-10" },
  { id: "cap2", name: "4K渲染", code: "RENDER_4K", type: "渲染", appIds: ["app1", "app2"], description: "4K分辨率渲染", status: "active", createdAt: "2026-03-10" },
  { id: "cap3", name: "8K渲染", code: "RENDER_8K", type: "渲染", appIds: ["app1", "app2"], description: "8K分辨率渲染", status: "active", createdAt: "2026-03-10" },
  { id: "cap4", name: "视频渲染", code: "VIDEO_RENDER", type: "渲染", appIds: ["app1"], description: "视频渲染能力", status: "active", createdAt: "2026-03-10" },
  { id: "cap5", name: "模型导入", code: "MODEL_IMPORT", type: "工具", appIds: ["app1", "app2"], description: "3D模型导入", status: "active", createdAt: "2026-03-10" },
  { id: "cap6", name: "云存储", code: "CLOUD_STORAGE", type: "存储", appIds: ["app1", "app2", "app3"], description: "云端文件存储", status: "active", createdAt: "2026-03-11" },
  { id: "cap7", name: "素材库", code: "MATERIAL_LIB", type: "内容", appIds: ["app1"], description: "设计素材资源库", status: "active", createdAt: "2026-03-11" },
  { id: "cap8", name: "AI Token", code: "AI_TOKEN", type: "AI", appIds: ["app3"], description: "AI积分/Token消耗", status: "active", createdAt: "2026-03-11" },
  { id: "cap9", name: "全景图导出", code: "EXPORT_PANORAMA", type: "工具", appIds: ["app1"], description: "全景图导出功能", status: "active", createdAt: "2026-03-10" },
  { id: "cap10", name: "智能推荐", code: "SMART_RECOMMEND", type: "AI", appIds: ["app4"], description: "AI智能推荐", status: "inactive", createdAt: "2026-03-11" },
];

/* ── MeteringRule (计量规则) — 1:N per Capability, 不透出菜单 ── */
export type MeterType = "count" | "token" | "storage" | "seat" | "time";

export interface MeteringRule {
  id: string;
  name: string;
  capabilityId: string;    // N:1 → Capability
  capabilityName: string;
  meterType: MeterType;
  unit: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const meteringRuleData: MeteringRule[] = [
  { id: "mr1", name: "AI设计计次", capabilityId: "cap1", capabilityName: "AI设计", meterType: "count", unit: "次", description: "按次数计量", status: "active", createdAt: "2026-03-10" },
  { id: "mr2", name: "4K渲染计次", capabilityId: "cap2", capabilityName: "4K渲染", meterType: "count", unit: "次", description: "按次数计量", status: "active", createdAt: "2026-03-10" },
  { id: "mr3", name: "8K渲染计次", capabilityId: "cap3", capabilityName: "8K渲染", meterType: "count", unit: "次", description: "按次数计量", status: "active", createdAt: "2026-03-10" },
  { id: "mr4", name: "AI Token计量", capabilityId: "cap8", capabilityName: "AI Token", meterType: "token", unit: "token", description: "按token计量", status: "active", createdAt: "2026-03-11" },
  { id: "mr5", name: "存储计量", capabilityId: "cap6", capabilityName: "云存储", meterType: "storage", unit: "MB", description: "按存储空间计量", status: "active", createdAt: "2026-03-11" },
  { id: "mr6", name: "视频渲染计次", capabilityId: "cap4", capabilityName: "视频渲染", meterType: "count", unit: "次", description: "按次数计量", status: "active", createdAt: "2026-03-10" },
  { id: "mr7", name: "模型导入计次", capabilityId: "cap5", capabilityName: "模型导入", meterType: "count", unit: "次", description: "按次数计量", status: "active", createdAt: "2026-03-10" },
  { id: "mr8", name: "全景图导出计次", capabilityId: "cap9", capabilityName: "全景图导出", meterType: "count", unit: "次", description: "按次数计量", status: "active", createdAt: "2026-03-10" },
  { id: "mr9", name: "素材库访问", capabilityId: "cap7", capabilityName: "素材库", meterType: "count", unit: "布尔", description: "是否可访问", status: "active", createdAt: "2026-03-11" },
];

/* ── EntitlementProduct (权益产品) = Application + Capability + MeteringRule + 额度 + 周期 ── */
export type PeriodType = "daily" | "monthly" | "yearly" | "once";

export interface EntitlementProduct {
  id: string;
  name: string;
  code: string;
  appId: string;           // N:1 → Application
  appName: string;
  capabilityId: string;    // N:1 → Capability
  capabilityName: string;
  meteringRuleId: string;  // N:1 → MeteringRule
  meteringRuleName: string;
  quota: number;
  period: PeriodType;
  validDays: number;       // 有效期（天）
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const entitlementProductData: EntitlementProduct[] = [
  // 国内3D工具
  { id: "ep1", name: "AI设计额度100次", code: "EP_AI_100", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap1", capabilityName: "AI设计", meteringRuleId: "mr1", meteringRuleName: "AI设计计次", quota: 100, period: "daily", validDays: 30, description: "免费版AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "ep2", name: "AI设计额度300次", code: "EP_AI_300", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap1", capabilityName: "AI设计", meteringRuleId: "mr1", meteringRuleName: "AI设计计次", quota: 300, period: "daily", validDays: 30, description: "基础会员AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "ep3", name: "AI设计额度900次", code: "EP_AI_900", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap1", capabilityName: "AI设计", meteringRuleId: "mr1", meteringRuleName: "AI设计计次", quota: 900, period: "daily", validDays: 30, description: "旗舰会员AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "ep4", name: "4K渲染额度1次", code: "EP_4K_1", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap2", capabilityName: "4K渲染", meteringRuleId: "mr2", meteringRuleName: "4K渲染计次", quota: 1, period: "daily", validDays: 30, description: "免费版4K渲染", status: "active", createdAt: "2026-03-10" },
  { id: "ep5", name: "4K渲染额度2次", code: "EP_4K_2", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap2", capabilityName: "4K渲染", meteringRuleId: "mr2", meteringRuleName: "4K渲染计次", quota: 2, period: "daily", validDays: 30, description: "基础会员4K渲染", status: "active", createdAt: "2026-03-10" },
  { id: "ep6", name: "4K渲染额度5次", code: "EP_4K_5", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap2", capabilityName: "4K渲染", meteringRuleId: "mr2", meteringRuleName: "4K渲染计次", quota: 5, period: "daily", validDays: 30, description: "旗舰会员4K渲染", status: "active", createdAt: "2026-03-10" },
  { id: "ep7", name: "8K渲染额度1次", code: "EP_8K_1", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap3", capabilityName: "8K渲染", meteringRuleId: "mr3", meteringRuleName: "8K渲染计次", quota: 1, period: "daily", validDays: 30, description: "旗舰会员8K渲染", status: "active", createdAt: "2026-03-10" },
  { id: "ep8", name: "云存储200MB", code: "EP_STORAGE_200", appId: "app1", appName: "国内3D设计工具", capabilityId: "cap6", capabilityName: "云存储", meteringRuleId: "mr5", meteringRuleName: "存储计量", quota: 200, period: "once", validDays: 0, description: "免费版云存储", status: "active", createdAt: "2026-03-10" },
  // AI App
  { id: "ep9", name: "AI Token 100", code: "EP_TOKEN_100", appId: "app3", appName: "AI App", capabilityId: "cap8", capabilityName: "AI Token", meteringRuleId: "mr4", meteringRuleName: "AI Token计量", quota: 100, period: "once", validDays: 0, description: "AI积分100", status: "active", createdAt: "2026-03-11" },
  { id: "ep10", name: "AI Token 200", code: "EP_TOKEN_200", appId: "app3", appName: "AI App", capabilityId: "cap8", capabilityName: "AI Token", meteringRuleId: "mr4", meteringRuleName: "AI Token计量", quota: 200, period: "once", validDays: 0, description: "AI积分200", status: "active", createdAt: "2026-03-11" },
  { id: "ep11", name: "AI Token 2000", code: "EP_TOKEN_2000", appId: "app3", appName: "AI App", capabilityId: "cap8", capabilityName: "AI Token", meteringRuleId: "mr4", meteringRuleName: "AI Token计量", quota: 2000, period: "once", validDays: 0, description: "AI积分2000", status: "active", createdAt: "2026-03-11" },
];

/* ── SKU (商品) ── */
export type BillingCycle = "once" | "monthly" | "yearly";

export interface Sku {
  id: string;
  name: string;
  code: string;
  appId: string;              // N:1 → Application
  appName: string;
  productId: string;          // N:1 → EntitlementProduct
  productName: string;
  price: number;
  billingCycle: BillingCycle;
  salesStatus: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

export const skuData: Sku[] = [
  // 国内3D工具 - 单次服务
  { id: "sku1", name: "4K普通图", code: "SKU_4K_SINGLE", appId: "app1", appName: "国内3D设计工具", productId: "ep4", productName: "4K渲染额度1次", price: 3, billingCycle: "once", salesStatus: "on_sale", sortOrder: 1, description: "单次4K渲染", createdAt: "2026-03-10" },
  { id: "sku2", name: "8K普通图", code: "SKU_8K_SINGLE", appId: "app1", appName: "国内3D设计工具", productId: "ep7", productName: "8K渲染额度1次", price: 8, billingCycle: "once", salesStatus: "on_sale", sortOrder: 2, description: "单次8K渲染", createdAt: "2026-03-10" },
  // 国内3D工具 - 会员用SKU（由套餐组合）
  { id: "sku3", name: "AI设计100次", code: "SKU_AI_100", appId: "app1", appName: "国内3D设计工具", productId: "ep1", productName: "AI设计额度100次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 3, description: "免费版用", createdAt: "2026-03-10" },
  { id: "sku4", name: "AI设计300次", code: "SKU_AI_300", appId: "app1", appName: "国内3D设计工具", productId: "ep2", productName: "AI设计额度300次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 4, description: "基础会员用", createdAt: "2026-03-10" },
  { id: "sku5", name: "AI设计900次", code: "SKU_AI_900", appId: "app1", appName: "国内3D设计工具", productId: "ep3", productName: "AI设计额度900次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 5, description: "旗舰会员用", createdAt: "2026-03-10" },
  { id: "sku6", name: "4K渲染1次", code: "SKU_4K_1", appId: "app1", appName: "国内3D设计工具", productId: "ep4", productName: "4K渲染额度1次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 6, description: "免费版用", createdAt: "2026-03-10" },
  { id: "sku7", name: "4K渲染2次", code: "SKU_4K_2", appId: "app1", appName: "国内3D设计工具", productId: "ep5", productName: "4K渲染额度2次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 7, description: "基础会员用", createdAt: "2026-03-10" },
  { id: "sku8", name: "4K渲染5次", code: "SKU_4K_5", appId: "app1", appName: "国内3D设计工具", productId: "ep6", productName: "4K渲染额度5次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 8, description: "旗舰会员用", createdAt: "2026-03-10" },
  { id: "sku9", name: "8K渲染1次", code: "SKU_8K_1", appId: "app1", appName: "国内3D设计工具", productId: "ep7", productName: "8K渲染额度1次", price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 9, description: "旗舰会员用", createdAt: "2026-03-10" },
  // AI App
  { id: "sku10", name: "AI积分100", code: "SKU_TOKEN_100", appId: "app3", appName: "AI App", productId: "ep9", productName: "AI Token 100", price: 10, billingCycle: "once", salesStatus: "on_sale", sortOrder: 1, description: "", createdAt: "2026-03-11" },
  { id: "sku11", name: "AI积分200", code: "SKU_TOKEN_200", appId: "app3", appName: "AI App", productId: "ep10", productName: "AI Token 200", price: 18, billingCycle: "once", salesStatus: "on_sale", sortOrder: 2, description: "", createdAt: "2026-03-11" },
  { id: "sku12", name: "AI积分2000", code: "SKU_TOKEN_2000", appId: "app3", appName: "AI App", productId: "ep11", productName: "AI Token 2000", price: 168, billingCycle: "once", salesStatus: "on_sale", sortOrder: 3, description: "", createdAt: "2026-03-11" },
];

/* ── Bundle (套餐) — N:M with SKU ── */
export interface BundleItem {
  skuId: string;
  skuName: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  code: string;
  appId: string;           // N:1 → Application
  appName: string;
  price: number;
  originalPrice?: number;
  billingCycle: BillingCycle;
  items: BundleItem[];     // N:M → SKU
  status: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

export const bundleData: Bundle[] = [
  {
    id: "bun1", name: "免费版", code: "BUN_FREE", appId: "app1", appName: "国内3D设计工具", price: 0, billingCycle: "monthly", status: "on_sale", sortOrder: 1, description: "基础免费权益", createdAt: "2026-03-10",
    items: [
      { skuId: "sku3", skuName: "AI设计100次", quantity: 1 },
      { skuId: "sku6", skuName: "4K渲染1次", quantity: 1 },
    ],
  },
  {
    id: "bun2", name: "基础会员", code: "BUN_BASIC", appId: "app1", appName: "国内3D设计工具", price: 99, billingCycle: "monthly", status: "on_sale", sortOrder: 2, description: "基础会员套餐", createdAt: "2026-03-10",
    items: [
      { skuId: "sku4", skuName: "AI设计300次", quantity: 1 },
      { skuId: "sku7", skuName: "4K渲染2次", quantity: 1 },
    ],
  },
  {
    id: "bun3", name: "旗舰会员", code: "BUN_PRO", appId: "app1", appName: "国内3D设计工具", price: 299, originalPrice: 399, billingCycle: "monthly", status: "on_sale", sortOrder: 3, description: "旗舰会员套餐，全部权益", createdAt: "2026-03-10",
    items: [
      { skuId: "sku5", skuName: "AI设计900次", quantity: 1 },
      { skuId: "sku8", skuName: "4K渲染5次", quantity: 1 },
      { skuId: "sku9", skuName: "8K渲染1次", quantity: 1 },
    ],
  },
];

/* ── Shared constants ── */
export const CAPABILITY_TYPES: CapabilityType[] = ["AI", "渲染", "工具", "存储", "内容"];

export const METER_TYPES: { value: MeterType; label: string }[] = [
  { value: "count", label: "次数" },
  { value: "token", label: "令牌" },
  { value: "storage", label: "存储(GB)" },
  { value: "seat", label: "席位" },
  { value: "time", label: "时长(分钟)" },
];

export const PERIOD_TYPES: { value: PeriodType; label: string }[] = [
  { value: "daily", label: "每日" },
  { value: "monthly", label: "每月" },
  { value: "yearly", label: "每年" },
  { value: "once", label: "一次性" },
];

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "once", label: "一次性" },
  { value: "monthly", label: "月" },
  { value: "yearly", label: "年" },
];

export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "启用", className: "badge-active" },
  inactive: { label: "停用", className: "badge-inactive" },
  on_sale: { label: "上架", className: "badge-active" },
  off_sale: { label: "下架", className: "badge-inactive" },
};

/* ── Helpers ── */
export const getAppNames = (ids: string[]) => ids.map((id) => appData.find((a) => a.id === id)?.name).filter(Boolean) as string[];
export const getCapabilitiesByApp = (appId: string) => capabilityData.filter((c) => c.appIds.includes(appId));
export const getRulesByCapability = (capId: string) => meteringRuleData.filter((r) => r.capabilityId === capId);
export const getProductsByApp = (appId: string) => entitlementProductData.filter((p) => p.appId === appId);
export const getProductsByCapability = (capId: string) => entitlementProductData.filter((p) => p.capabilityId === capId);
export const getSkusByApp = (appId: string) => skuData.filter((s) => s.appId === appId);
export const getSkusByProduct = (productId: string) => skuData.filter((s) => s.productId === productId);
export const getBundlesByApp = (appId: string) => bundleData.filter((b) => b.appId === appId);
export const getSkuRefCount = (productId: string) => skuData.filter((s) => s.productId === productId).length;
