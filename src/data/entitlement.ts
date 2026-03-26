/* ══════════════════════════════════════════════════
   权益管理数据模型 — 4层架构
   
   Application (应用)
        │ 1:N
        ▼
   Capability (能力 = 技术能力 + consumePerUse)
        │ 1:N
        ▼
   EntitlementRule (权益规则 = 额度 + 周期 + 策略)
        │ N:M (sku_rules)
        ▼
      SKU (商品)
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
  { id: "app1", name: "居然设计家", code: "JURAN_DESIGN", description: "居然设计家3D设计工具", status: "active", createdAt: "2026-03-12", updatedAt: "2026-03-12" },
];

/* ── Capability (能力) ── */
export type DataType = "COUNTER" | "BOOLEAN" | "STORAGE" | "DURATION";

export interface Capability {
  id: string;
  name: string;
  code: string;
  appId: string;           // N:1 → Application
  dataType: DataType;
  unit: string;            // 次/布尔/MB/秒
  apiPath: string;         // 调用接口
  consumePerUse: number;   // 每次调用默认消耗量
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: "COUNTER", label: "计数型（次数）" },
  { value: "BOOLEAN", label: "布尔型（开关）" },
  { value: "STORAGE", label: "存储型（容量）" },
  { value: "DURATION", label: "时长型（时长）" },
];

export const capabilityData: Capability[] = [
  { id: "cap1",  name: "AI设计",         code: "AI_DESIGN",             appId: "app1", dataType: "COUNTER",  unit: "次",  apiPath: "/api/ai/design",              consumePerUse: 1, description: "AI智能设计能力",       status: "active", createdAt: "2026-03-12" },
  { id: "cap2",  name: "4K渲染",         code: "RENDER_4K",             appId: "app1", dataType: "COUNTER",  unit: "次",  apiPath: "/api/render/4k",              consumePerUse: 1, description: "4K分辨率渲染",         status: "active", createdAt: "2026-03-12" },
  { id: "cap3",  name: "8K渲染",         code: "RENDER_8K",             appId: "app1", dataType: "COUNTER",  unit: "次",  apiPath: "/api/render/8k",              consumePerUse: 1, description: "8K分辨率渲染",         status: "active", createdAt: "2026-03-12" },
  { id: "cap4",  name: "全景图导出",     code: "EXPORT_PANORAMA",       appId: "app1", dataType: "COUNTER",  unit: "次",  apiPath: "/api/export/panorama",        consumePerUse: 1, description: "全景图导出功能",       status: "active", createdAt: "2026-03-12" },
  { id: "cap5",  name: "2D效果图导出",   code: "EXPORT_2D",             appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/export/2d",              consumePerUse: 1, description: "2D效果图导出",         status: "active", createdAt: "2026-03-12" },
  { id: "cap6",  name: "全屋模型库",     code: "MODEL_WHOLE_HOUSE",     appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/library/whole-house",    consumePerUse: 1, description: "全屋模型库访问",       status: "active", createdAt: "2026-03-12" },
  { id: "cap7",  name: "单品模型库",     code: "MODEL_SINGLE",          appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/library/single",         consumePerUse: 1, description: "单品模型库访问",       status: "active", createdAt: "2026-03-12" },
  { id: "cap8",  name: "贴图素材",       code: "MATERIAL_TEXTURE",      appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/texture",       consumePerUse: 1, description: "贴图素材访问",         status: "active", createdAt: "2026-03-12" },
  { id: "cap9",  name: "软装素材",       code: "MATERIAL_SOFT",         appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/soft",          consumePerUse: 1, description: "软装素材访问",         status: "active", createdAt: "2026-03-12" },
  { id: "cap10", name: "产品模型库",     code: "MATERIAL_PRODUCT",      appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/product",       consumePerUse: 1, description: "产品模型库访问",       status: "active", createdAt: "2026-03-12" },
  { id: "cap11", name: "灯光库",         code: "MATERIAL_LIGHTING",     appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/lighting",      consumePerUse: 1, description: "灯光库访问",           status: "active", createdAt: "2026-03-12" },
  { id: "cap12", name: "外景库",         code: "MATERIAL_OUTDOOR",      appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/outdoor",       consumePerUse: 1, description: "外景库访问",           status: "active", createdAt: "2026-03-12" },
  { id: "cap13", name: "装饰画库",       code: "MATERIAL_PAINTING",     appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/painting",      consumePerUse: 1, description: "装饰画库访问",         status: "active", createdAt: "2026-03-12" },
  { id: "cap14", name: "精选套餐库",     code: "MATERIAL_PACKAGE",      appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/package",       consumePerUse: 1, description: "精选套餐库访问",       status: "active", createdAt: "2026-03-12" },
  { id: "cap15", name: "多素材批量导入", code: "MATERIAL_BATCH_IMPORT", appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/material/batch-import",  consumePerUse: 1, description: "多素材批量导入",       status: "active", createdAt: "2026-03-12" },
  { id: "cap16", name: "批量替换",       code: "FEATURE_BATCH_REPLACE", appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/feature/batch-replace",  consumePerUse: 1, description: "批量替换功能",         status: "active", createdAt: "2026-03-12" },
  { id: "cap17", name: "导入人视图",     code: "FEATURE_HUMAN_VIEW",    appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/feature/human-view",     consumePerUse: 1, description: "导入人视图功能",       status: "active", createdAt: "2026-03-12" },
  { id: "cap18", name: "水印",           code: "FEATURE_WATERMARK",     appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/feature/watermark",      consumePerUse: 1, description: "水印控制",             status: "active", createdAt: "2026-03-12" },
  { id: "cap19", name: "实时渲染",       code: "FEATURE_REALTIME_RENDER", appId: "app1", dataType: "BOOLEAN", unit: "布尔", apiPath: "/api/feature/realtime-render", consumePerUse: 1, description: "实时渲染功能",        status: "active", createdAt: "2026-03-12" },
  { id: "cap20", name: "大文件上传",     code: "FEATURE_LARGE_FILE",    appId: "app1", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/feature/large-file",     consumePerUse: 1, description: "大文件上传功能",       status: "active", createdAt: "2026-03-12" },
  { id: "cap21", name: "云存储",         code: "FEATURE_CLOUD_STORAGE", appId: "app1", dataType: "STORAGE",  unit: "MB",  apiPath: "/api/feature/storage",        consumePerUse: 1, description: "云端文件存储",         status: "active", createdAt: "2026-03-12" },
];

/* ── EntitlementRule (权益规则) ── */
export type PeriodType = "DAY" | "MONTH" | "YEAR" | "PERMANENT";
export type GrantType = "DAILY_REFRESH" | "MONTHLY_GRANT" | "ONE_TIME";
export type ExpirePolicy = "CLEAR_ON_EXPIRE" | "NEVER_EXPIRE";

export interface EntitlementRule {
  id: string;
  name: string;
  code: string;
  capabilityId: string;     // N:1 → Capability
  quota: number;
  periodType: PeriodType;
  periodValue: number;      // 永久为0
  grantType: GrantType;
  isCumulative: boolean;
  expirePolicy: ExpirePolicy;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

export const PERIOD_TYPES: { value: PeriodType; label: string }[] = [
  { value: "DAY", label: "天" },
  { value: "MONTH", label: "月" },
  { value: "YEAR", label: "年" },
  { value: "PERMANENT", label: "永久" },
];

export const GRANT_TYPES: { value: GrantType; label: string }[] = [
  { value: "DAILY_REFRESH", label: "每日刷新" },
  { value: "MONTHLY_GRANT", label: "每月发放" },
  { value: "ONE_TIME", label: "一次性" },
];

export const EXPIRE_POLICIES: { value: ExpirePolicy; label: string }[] = [
  { value: "CLEAR_ON_EXPIRE", label: "到期清零" },
  { value: "NEVER_EXPIRE", label: "不过期" },
];

export const ruleData: EntitlementRule[] = [
  // 5.1 日额度规则（每日刷新）
  { id: "rule1",  name: "AI设计100次/日",     code: "RULE_AI_100_DAY",       capabilityId: "cap1", quota: 100, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新100次AI设计额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule2",  name: "AI设计300次/日",     code: "RULE_AI_300_DAY",       capabilityId: "cap1", quota: 300, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新300次AI设计额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule3",  name: "AI设计500次/日",     code: "RULE_AI_500_DAY",       capabilityId: "cap1", quota: 500, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新500次AI设计额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule4",  name: "4K渲染2次/日",       code: "RULE_4K_2_DAY",         capabilityId: "cap2", quota: 2,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新2次4K渲染额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule5",  name: "4K渲染4次/日",       code: "RULE_4K_4_DAY",         capabilityId: "cap2", quota: 4,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新4次4K渲染额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule6",  name: "8K渲染1次/日",       code: "RULE_8K_1_DAY",         capabilityId: "cap3", quota: 1,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新1次8K渲染额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule7",  name: "全景图导出1次/日",   code: "RULE_PANORAMA_1_DAY",   capabilityId: "cap4", quota: 1,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新1次全景图导出", status: "active", createdAt: "2026-03-12" },
  { id: "rule8",  name: "全景图导出10次/日",  code: "RULE_PANORAMA_10_DAY",  capabilityId: "cap4", quota: 10,  periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新10次全景图导出", status: "active", createdAt: "2026-03-12" },
  { id: "rule9",  name: "2D效果图导出1次/日", code: "RULE_2D_1_DAY",         capabilityId: "cap5", quota: 1,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新1次2D效果图导出", status: "active", createdAt: "2026-03-12" },
  // 5.2 永久权限规则（一次性发放）
  { id: "rule10", name: "2D效果图无限导出",   code: "RULE_2D_UNLIMITED",         capabilityId: "cap5",  quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "2D效果图无限导出权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule11", name: "全屋模型库访问",     code: "RULE_WHOLE_HOUSE_ACCESS",   capabilityId: "cap6",  quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "全屋模型库访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule12", name: "贴图素材访问",       code: "RULE_TEXTURE_ACCESS",       capabilityId: "cap8",  quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "贴图素材访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule13", name: "软装素材访问",       code: "RULE_SOFT_ACCESS",          capabilityId: "cap9",  quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "软装素材访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule14", name: "产品模型库访问",     code: "RULE_PRODUCT_ACCESS",       capabilityId: "cap10", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "产品模型库访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule15", name: "灯光库访问",         code: "RULE_LIGHTING_ACCESS",      capabilityId: "cap11", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "灯光库访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule16", name: "外景库访问",         code: "RULE_OUTDOOR_ACCESS",       capabilityId: "cap12", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "外景库访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule17", name: "装饰画库访问",       code: "RULE_PAINTING_ACCESS",      capabilityId: "cap13", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "装饰画库访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule18", name: "精选套餐库访问",     code: "RULE_PACKAGE_ACCESS",       capabilityId: "cap14", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "精选套餐库访问权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule19", name: "多素材批量导入",     code: "RULE_BATCH_IMPORT",         capabilityId: "cap15", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "多素材批量导入权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule20", name: "批量替换",           code: "RULE_BATCH_REPLACE",        capabilityId: "cap16", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "批量替换权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule21", name: "导入人视图",         code: "RULE_HUMAN_VIEW",           capabilityId: "cap17", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "导入人视图权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule22", name: "水印",               code: "RULE_WATERMARK",            capabilityId: "cap18", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "水印权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule23", name: "实时渲染",           code: "RULE_REALTIME_RENDER",      capabilityId: "cap19", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "实时渲染权限", status: "active", createdAt: "2026-03-12" },
  { id: "rule24", name: "大文件上传",         code: "RULE_LARGE_FILE",           capabilityId: "cap20", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "大文件上传权限", status: "active", createdAt: "2026-03-12" },
  // 5.3 存储规则
  { id: "rule25", name: "云存储200MB",     code: "RULE_STORAGE_200MB",  capabilityId: "cap21", quota: 200,   periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "200MB云存储", status: "active", createdAt: "2026-03-12" },
  { id: "rule26", name: "云存储4GB",       code: "RULE_STORAGE_4GB",    capabilityId: "cap21", quota: 4096,  periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "4GB云存储", status: "active", createdAt: "2026-03-12" },
  { id: "rule27", name: "云存储10GB",      code: "RULE_STORAGE_10GB",   capabilityId: "cap21", quota: 10240, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "10GB云存储", status: "active", createdAt: "2026-03-12" },
  // 5.4 充值规则（可累积）
  { id: "rule28", name: "4K渲染1次",       code: "RULE_4K_1_ONCE",      capabilityId: "cap2",  quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "单次4K渲染充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule29", name: "8K渲染1次",       code: "RULE_8K_1_ONCE",      capabilityId: "cap3",  quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "单次8K渲染充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule30", name: "8K渲染赠送1次",   code: "RULE_8K_GIFT_ONCE",   capabilityId: "cap3",  quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "8K渲染赠送", status: "active", createdAt: "2026-03-12" },
  { id: "rule31", name: "AI积分100次",     code: "RULE_AI_100_ONCE",    capabilityId: "cap1",  quota: 100,  periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "AI积分100次充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule32", name: "AI积分200次",     code: "RULE_AI_200_ONCE",    capabilityId: "cap1",  quota: 200,  periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "AI积分200次充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule33", name: "AI积分2000次",    code: "RULE_AI_2000_ONCE",   capabilityId: "cap1",  quota: 2000, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "AI积分2000次充值", status: "active", createdAt: "2026-03-12" },
];

/* ── SKU (商品) ── */
export type BillingCycle = "once" | "monthly" | "yearly";

export interface Sku {
  id: string;
  name: string;
  code: string;
  appId: string;              // N:1 → Application
  ruleIds: string[];          // N:M → EntitlementRule
  price: number;
  billingCycle: BillingCycle;
  salesStatus: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "once", label: "一次性" },
  { value: "monthly", label: "月" },
  { value: "yearly", label: "年" },
];

export const skuData: Sku[] = [
  // 单次充值商品（单规则）
  { id: "sku1",  name: "4K普通图",         code: "SKU_4K_SINGLE",    appId: "app1", ruleIds: ["rule28"],          price: 3,     billingCycle: "once",    salesStatus: "on_sale", sortOrder: 1,  description: "单次4K渲染",    createdAt: "2026-03-12" },
  { id: "sku2",  name: "8K普通图",         code: "SKU_8K_SINGLE",    appId: "app1", ruleIds: ["rule29"],          price: 8,     billingCycle: "once",    salesStatus: "on_sale", sortOrder: 2,  description: "单次8K渲染",    createdAt: "2026-03-12" },
  { id: "sku3",  name: "AI积分100·基础包", code: "SKU_AI_100",       appId: "app1", ruleIds: ["rule31"],          price: 9.9,   billingCycle: "once",    salesStatus: "on_sale", sortOrder: 3,  description: "100次AI积分",   createdAt: "2026-03-12" },
  { id: "sku4",  name: "AI积分200·专业包", code: "SKU_AI_200",       appId: "app1", ruleIds: ["rule32"],          price: 19.9,  billingCycle: "once",    salesStatus: "on_sale", sortOrder: 4,  description: "200次AI积分",   createdAt: "2026-03-12" },
  { id: "sku5",  name: "AI积分2000·高级包",code: "SKU_AI_2000",      appId: "app1", ruleIds: ["rule33"],          price: 169,   billingCycle: "once",    salesStatus: "on_sale", sortOrder: 5,  description: "2000次AI积分",  createdAt: "2026-03-12" },
  // 会员商品（多规则组合）
  { id: "sku6",  name: "免费版权益",       code: "SKU_FREE",         appId: "app1", ruleIds: ["rule1", "rule25", "rule7"], price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 10, description: "免费版：AI设计100次/日 + 云存储200MB + 全景图1次/日", createdAt: "2026-03-12" },
  { id: "sku7",  name: "基础会员权益",     code: "SKU_BASIC",        appId: "app1", ruleIds: ["rule2", "rule4", "rule9", "rule11", "rule12", "rule13", "rule14", "rule25"], price: 9.9, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 11, description: "基础会员：AI设计300次/日 + 4K渲染2次/日 + 素材库", createdAt: "2026-03-12" },
  { id: "sku8",  name: "旗舰会员权益",     code: "SKU_PRO",          appId: "app1", ruleIds: ["rule3", "rule5", "rule6", "rule8", "rule10", "rule11", "rule12", "rule13", "rule14", "rule15", "rule16", "rule17", "rule18", "rule19", "rule20", "rule21", "rule22", "rule23", "rule24", "rule26"], price: 150, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 12, description: "旗舰会员：全能力开放", createdAt: "2026-03-12" },
];

/* ── Bundle (套餐) ── */
export interface BundleItem {
  skuId: string;
  skuName: string;
  quantity: number;
}

export interface Bundle {
  id: string;
  name: string;
  code: string;
  appId: string;
  appName: string;
  price: number;
  originalPrice?: number;
  billingCycle: BillingCycle;
  items: BundleItem[];
  status: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

export const bundleData: Bundle[] = [
  {
    id: "bun1", name: "免费版", code: "BUN_FREE", appId: "app1", appName: "居然设计家", price: 0, billingCycle: "monthly", status: "on_sale", sortOrder: 1, description: "基础免费权益", createdAt: "2026-03-12",
    items: [
      { skuId: "sku6",  skuName: "AI设计100次/日",  quantity: 1 },
      { skuId: "sku12", skuName: "云存储200MB",      quantity: 1 },
    ],
  },
  {
    id: "bun2", name: "基础会员", code: "BUN_BASIC", appId: "app1", appName: "居然设计家", price: 9.9, billingCycle: "monthly", status: "on_sale", sortOrder: 2, description: "基础会员套餐", createdAt: "2026-03-12",
    items: [
      { skuId: "sku7",  skuName: "AI设计300次/日",  quantity: 1 },
      { skuId: "sku9",  skuName: "4K渲染2次/日",    quantity: 1 },
    ],
  },
  {
    id: "bun3", name: "旗舰会员", code: "BUN_PRO", appId: "app1", appName: "居然设计家", price: 150, originalPrice: 199, billingCycle: "monthly", status: "on_sale", sortOrder: 3, description: "旗舰会员套餐", createdAt: "2026-03-12",
    items: [
      { skuId: "sku8",  skuName: "AI设计500次/日",  quantity: 1 },
      { skuId: "sku10", skuName: "4K渲染4次/日",    quantity: 1 },
      { skuId: "sku11", skuName: "8K渲染1次/日",    quantity: 1 },
      { skuId: "sku13", skuName: "云存储4GB",        quantity: 1 },
    ],
  },
  {
    id: "bun4", name: "旗舰会员年卡", code: "BUN_PRO_YEARLY", appId: "app1", appName: "居然设计家", price: 1200, originalPrice: 1800, billingCycle: "yearly", status: "on_sale", sortOrder: 4, description: "旗舰会员年度套餐", createdAt: "2026-03-12",
    items: [
      { skuId: "sku8",  skuName: "AI设计500次/日",  quantity: 1 },
      { skuId: "sku10", skuName: "4K渲染4次/日",    quantity: 1 },
      { skuId: "sku11", skuName: "8K渲染1次/日",    quantity: 1 },
      { skuId: "sku13", skuName: "云存储4GB",        quantity: 1 },
    ],
  },
];

/* ── EntitlementOrder (权益订单) ── */
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";
export type OrderSource = "purchase" | "gift" | "promotion" | "system";

export interface OrderItem {
  type: "sku" | "bundle";
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface EntitlementOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  appId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  source: OrderSource;
  paidAt?: string;
  expireAt?: string;
  remark: string;
  createdAt: string;
}

export const ORDER_STATUS: { value: OrderStatus; label: string; className: string }[] = [
  { value: "pending", label: "待支付", className: "badge-warning" },
  { value: "paid", label: "已支付", className: "badge-active" },
  { value: "cancelled", label: "已取消", className: "badge-inactive" },
  { value: "expired", label: "已过期", className: "badge-inactive" },
];

export const ORDER_SOURCES: { value: OrderSource; label: string }[] = [
  { value: "purchase", label: "购买" },
  { value: "gift", label: "赠送" },
  { value: "promotion", label: "促销" },
  { value: "system", label: "系统发放" },
];

export const orderData: EntitlementOrder[] = [
  {
    id: "ord1", orderNo: "ENT202603120001", customerId: "cust1", customerName: "北京居然之家家居连锁集团",
    appId: "app1", totalAmount: 150, status: "paid", source: "purchase", paidAt: "2026-03-12 14:30:00", expireAt: "2027-03-12", remark: "旗舰会员月付", createdAt: "2026-03-12",
    items: [{ type: "bundle", itemId: "bun3", itemName: "旗舰会员", quantity: 1, unitPrice: 150 }],
  },
  {
    id: "ord2", orderNo: "ENT202603120002", customerId: "cust2", customerName: "上海设计工作室",
    appId: "app1", totalAmount: 9.9, status: "paid", source: "purchase", paidAt: "2026-03-13 09:15:00", expireAt: "2027-03-13", remark: "基础会员", createdAt: "2026-03-13",
    items: [{ type: "bundle", itemId: "bun2", itemName: "基础会员", quantity: 1, unitPrice: 9.9 }],
  },
  {
    id: "ord3", orderNo: "ENT202603120003", customerId: "cust1", customerName: "北京居然之家家居连锁集团",
    appId: "app1", totalAmount: 11, status: "paid", source: "purchase", paidAt: "2026-03-14 16:00:00", remark: "充值渲染次数", createdAt: "2026-03-14",
    items: [
      { type: "sku", itemId: "sku1", itemName: "4K普通图", quantity: 1, unitPrice: 3 },
      { type: "sku", itemId: "sku2", itemName: "8K普通图", quantity: 1, unitPrice: 8 },
    ],
  },
  {
    id: "ord4", orderNo: "ENT202603120004", customerId: "cust3", customerName: "深圳家装设计有限公司",
    appId: "app1", totalAmount: 0, status: "paid", source: "system", paidAt: "2026-03-15 10:00:00", remark: "系统发放免费版", createdAt: "2026-03-15",
    items: [{ type: "bundle", itemId: "bun1", itemName: "免费版", quantity: 1, unitPrice: 0 }],
  },
  {
    id: "ord5", orderNo: "ENT202603120005", customerId: "cust2", customerName: "上海设计工作室",
    appId: "app1", totalAmount: 169, status: "pending", source: "purchase", remark: "AI积分充值", createdAt: "2026-03-16",
    items: [{ type: "sku", itemId: "sku5", itemName: "AI积分2000·高级包", quantity: 1, unitPrice: 169 }],
  },
  {
    id: "ord6", orderNo: "ENT202603120006", customerId: "cust1", customerName: "北京居然之家家居连锁集团",
    appId: "app1", totalAmount: 1200, status: "paid", source: "promotion", paidAt: "2026-03-17 11:30:00", expireAt: "2027-03-17", remark: "年卡促销活动", createdAt: "2026-03-17",
    items: [{ type: "bundle", itemId: "bun4", itemName: "旗舰会员年卡", quantity: 1, unitPrice: 1200 }],
  },
];

/* ── EntitlementAccount (权益账户) ── */
export interface AccountCapability {
  capabilityId: string;
  capabilityName: string;
  ruleId: string;
  ruleName: string;
  totalQuota: number;
  usedQuota: number;
  unit: string;
  periodType: PeriodType;
  grantType: GrantType;
  expireAt?: string;
  sourceOrderIds: string[];
}

export interface EntitlementAccount {
  id: string;
  customerId: string;
  customerName: string;
  appId: string;
  appName: string;
  orderIds: string[];
  capabilities: AccountCapability[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export const accountData: EntitlementAccount[] = [
  {
    id: "acc1", customerId: "cust1", customerName: "北京居然之家家居连锁集团", appId: "app1", appName: "居然设计家",
    orderIds: ["ord1", "ord3", "ord6"], status: "active", createdAt: "2026-03-12", updatedAt: "2026-03-17",
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule3",  ruleName: "AI设计500次/日",     totalQuota: 500,   usedQuota: 128,  unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap2", capabilityName: "4K渲染",     ruleId: "rule5",  ruleName: "4K渲染4次/日",       totalQuota: 4,     usedQuota: 2,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap2", capabilityName: "4K渲染",     ruleId: "rule28", ruleName: "4K渲染1次",          totalQuota: 1,     usedQuota: 0,    unit: "次",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord3"] },
      { capabilityId: "cap3", capabilityName: "8K渲染",     ruleId: "rule6",  ruleName: "8K渲染1次/日",       totalQuota: 1,     usedQuota: 1,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap3", capabilityName: "8K渲染",     ruleId: "rule29", ruleName: "8K渲染1次",          totalQuota: 1,     usedQuota: 0,    unit: "次",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord3"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule26", ruleName: "云存储4GB",          totalQuota: 4096,  usedQuota: 1280, unit: "MB",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap5", capabilityName: "2D效果图导出", ruleId: "rule10", ruleName: "2D效果图无限导出", totalQuota: 1,     usedQuota: 0,    unit: "布尔", periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord1"] },
      { capabilityId: "cap6", capabilityName: "全屋模型库",  ruleId: "rule11", ruleName: "全屋模型库访问",   totalQuota: 1,     usedQuota: 0,    unit: "布尔", periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord1"] },
    ],
  },
  {
    id: "acc2", customerId: "cust2", customerName: "上海设计工作室", appId: "app1", appName: "居然设计家",
    orderIds: ["ord2"], status: "active", createdAt: "2026-03-13", updatedAt: "2026-03-13",
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule2",  ruleName: "AI设计300次/日",     totalQuota: 300,   usedQuota: 45,   unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord2"] },
      { capabilityId: "cap2", capabilityName: "4K渲染",     ruleId: "rule4",  ruleName: "4K渲染2次/日",       totalQuota: 2,     usedQuota: 0,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord2"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule25", ruleName: "云存储200MB",        totalQuota: 200,   usedQuota: 56,   unit: "MB",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord2"] },
    ],
  },
  {
    id: "acc3", customerId: "cust3", customerName: "深圳家装设计有限公司", appId: "app1", appName: "居然设计家",
    orderIds: ["ord4"], status: "active", createdAt: "2026-03-15", updatedAt: "2026-03-15",
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule1",  ruleName: "AI设计100次/日",     totalQuota: 100,   usedQuota: 12,   unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord4"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule25", ruleName: "云存储200MB",        totalQuota: 200,   usedQuota: 0,    unit: "MB",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord4"] },
      { capabilityId: "cap4", capabilityName: "全景图导出", ruleId: "rule7",  ruleName: "全景图导出1次/日",   totalQuota: 1,     usedQuota: 0,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord4"] },
    ],
  },
];

/* ── Helpers (Order & Account) ── */
export const getOrdersByCustomer = (custId: string) => orderData.filter((o) => o.customerId === custId);
export const getOrdersByApp = (appId: string) => orderData.filter((o) => o.appId === appId);
export const getAccountsByCustomer = (custId: string) => accountData.filter((a) => a.customerId === custId);
export const getOrder = (id: string) => orderData.find((o) => o.id === id);
export const getAccount = (id: string) => accountData.find((a) => a.id === id);

/* ── Shared constants ── */
export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "启用", className: "badge-active" },
  inactive: { label: "停用", className: "badge-inactive" },
  on_sale: { label: "上架", className: "badge-active" },
  off_sale: { label: "下架", className: "badge-inactive" },
};

/* ── Helpers ── */
export const getCapabilitiesByApp = (appId: string) => capabilityData.filter((c) => c.appId === appId);
export const getRulesByCapability = (capId: string) => ruleData.filter((r) => r.capabilityId === capId);
export const getSkusByRule = (ruleId: string) => skuData.filter((s) => s.ruleIds.includes(ruleId));
export const getSkusByApp = (appId: string) => skuData.filter((s) => s.appId === appId);
export const getBundlesByApp = (appId: string) => bundleData.filter((b) => b.appId === appId);
export const getCapability = (id: string) => capabilityData.find((c) => c.id === id);
export const getApp = (id: string) => appData.find((a) => a.id === id);
export const getRule = (id: string) => ruleData.find((r) => r.id === id);
export const getRulesByApp = (appId: string) => {
  const capIds = getCapabilitiesByApp(appId).map((c) => c.id);
  return ruleData.filter((r) => capIds.includes(r.capabilityId));
};
export const getRulesBySkuId = (skuId: string) => {
  const sku = skuData.find((s) => s.id === skuId);
  return sku ? sku.ruleIds.map((rid) => getRule(rid)).filter(Boolean) as EntitlementRule[] : [];
};
