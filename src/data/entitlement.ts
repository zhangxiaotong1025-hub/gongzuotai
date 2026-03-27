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
  { id: "app1", name: "国内3D工具",  code: "CN_3D_TOOL",      description: "国内版3D家装设计工具",       status: "active",   createdAt: "2026-01-10", updatedAt: "2026-03-12" },
  { id: "app2", name: "国际3D工具",  code: "INTL_3D_TOOL",    description: "国际版3D设计工具（海外市场）", status: "active",   createdAt: "2026-01-15", updatedAt: "2026-03-10" },
  { id: "app3", name: "智能导购",    code: "SMART_GUIDE",     description: "门店智能导购推荐系统",       status: "active",   createdAt: "2026-02-01", updatedAt: "2026-03-08" },
  { id: "app4", name: "AI设计家",    code: "AI_DESIGNER",     description: "AI驱动的智能设计助手",       status: "active",   createdAt: "2026-02-20", updatedAt: "2026-03-15" },
  { id: "app5", name: "精准客资",    code: "PRECISE_LEADS",   description: "精准客户资源获取与管理",     status: "inactive", createdAt: "2026-03-01", updatedAt: "2026-03-12" },
];

/* ── Capability (能力) ── */
export type DataType = "COUNTER" | "BOOLEAN" | "STORAGE" | "DURATION";

export interface Capability {
  id: string;
  name: string;
  code: string;
  appId: string;
  dataType: DataType;
  unit: string;
  apiPath: string;
  consumePerUse: number;
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
  // 国内3D工具
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
  // AI设计家
  { id: "cap30", name: "AI方案生成",     code: "AI_PLAN_GEN",           appId: "app4", dataType: "COUNTER",  unit: "次",  apiPath: "/api/ai/plan",               consumePerUse: 1, description: "AI方案自动生成",       status: "active", createdAt: "2026-03-12" },
  { id: "cap31", name: "AI风格迁移",     code: "AI_STYLE_TRANSFER",     appId: "app4", dataType: "COUNTER",  unit: "次",  apiPath: "/api/ai/style-transfer",     consumePerUse: 1, description: "AI风格迁移能力",       status: "active", createdAt: "2026-03-12" },
  // 智能导购
  { id: "cap40", name: "导购推荐",       code: "GUIDE_RECOMMEND",       appId: "app3", dataType: "COUNTER",  unit: "次",  apiPath: "/api/guide/recommend",       consumePerUse: 1, description: "智能导购推荐",         status: "active", createdAt: "2026-03-12" },
  { id: "cap41", name: "客户画像",       code: "GUIDE_PROFILE",         appId: "app3", dataType: "BOOLEAN",  unit: "布尔", apiPath: "/api/guide/profile",          consumePerUse: 1, description: "客户画像分析",         status: "active", createdAt: "2026-03-12" },
  // 精准客资
  { id: "cap50", name: "线索获取",       code: "LEADS_ACQUIRE",         appId: "app5", dataType: "COUNTER",  unit: "条",  apiPath: "/api/leads/acquire",         consumePerUse: 1, description: "客资线索获取",         status: "active", createdAt: "2026-03-12" },
];

/* ── EntitlementRule (权益规则) ── */
export type PeriodType = "DAY" | "MONTH" | "YEAR" | "PERMANENT";
export type GrantType = "DAILY_REFRESH" | "MONTHLY_GRANT" | "ONE_TIME";
export type ExpirePolicy = "CLEAR_ON_EXPIRE" | "NEVER_EXPIRE";

export interface EntitlementRule {
  id: string;
  name: string;
  code: string;
  capabilityId: string;
  quota: number;
  periodType: PeriodType;
  periodValue: number;
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
  // 日额度规则（每日刷新）
  { id: "rule1",  name: "AI设计100次/日",     code: "RULE_AI_100_DAY",       capabilityId: "cap1", quota: 100, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新100次AI设计额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule2",  name: "AI设计300次/日",     code: "RULE_AI_300_DAY",       capabilityId: "cap1", quota: 300, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新300次AI设计额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule3",  name: "AI设计500次/日",     code: "RULE_AI_500_DAY",       capabilityId: "cap1", quota: 500, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新500次AI设计额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule4",  name: "4K渲染2次/日",       code: "RULE_4K_2_DAY",         capabilityId: "cap2", quota: 2,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新2次4K渲染额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule5",  name: "4K渲染4次/日",       code: "RULE_4K_4_DAY",         capabilityId: "cap2", quota: 4,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新4次4K渲染额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule6",  name: "8K渲染1次/日",       code: "RULE_8K_1_DAY",         capabilityId: "cap3", quota: 1,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新1次8K渲染额度", status: "active", createdAt: "2026-03-12" },
  { id: "rule7",  name: "全景图导出1次/日",   code: "RULE_PANORAMA_1_DAY",   capabilityId: "cap4", quota: 1,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新1次全景图导出", status: "active", createdAt: "2026-03-12" },
  { id: "rule8",  name: "全景图导出10次/日",  code: "RULE_PANORAMA_10_DAY",  capabilityId: "cap4", quota: 10,  periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新10次全景图导出", status: "active", createdAt: "2026-03-12" },
  { id: "rule9",  name: "2D效果图导出1次/日", code: "RULE_2D_1_DAY",         capabilityId: "cap5", quota: 1,   periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新1次2D效果图导出", status: "active", createdAt: "2026-03-12" },
  // 永久权限规则
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
  // 存储规则
  { id: "rule25", name: "云存储200MB",     code: "RULE_STORAGE_200MB",  capabilityId: "cap21", quota: 200,   periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "200MB云存储", status: "active", createdAt: "2026-03-12" },
  { id: "rule26", name: "云存储4GB",       code: "RULE_STORAGE_4GB",    capabilityId: "cap21", quota: 4096,  periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "4GB云存储", status: "active", createdAt: "2026-03-12" },
  { id: "rule27", name: "云存储10GB",      code: "RULE_STORAGE_10GB",   capabilityId: "cap21", quota: 10240, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "10GB云存储", status: "active", createdAt: "2026-03-12" },
  // 充值规则（可累积）
  { id: "rule28", name: "4K渲染1次",       code: "RULE_4K_1_ONCE",      capabilityId: "cap2",  quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "单次4K渲染充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule29", name: "8K渲染1次",       code: "RULE_8K_1_ONCE",      capabilityId: "cap3",  quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "单次8K渲染充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule30", name: "8K渲染赠送1次",   code: "RULE_8K_GIFT_ONCE",   capabilityId: "cap3",  quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "8K渲染赠送", status: "active", createdAt: "2026-03-12" },
  { id: "rule31", name: "AI积分100次",     code: "RULE_AI_100_ONCE",    capabilityId: "cap1",  quota: 100,  periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "AI积分100次充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule32", name: "AI积分200次",     code: "RULE_AI_200_ONCE",    capabilityId: "cap1",  quota: 200,  periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "AI积分200次充值", status: "active", createdAt: "2026-03-12" },
  { id: "rule33", name: "AI积分2000次",    code: "RULE_AI_2000_ONCE",   capabilityId: "cap1",  quota: 2000, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true,  expirePolicy: "NEVER_EXPIRE", description: "AI积分2000次充值", status: "active", createdAt: "2026-03-12" },
  // AI设计家规则
  { id: "rule40", name: "AI方案100次/月",  code: "RULE_AI_PLAN_100_M",  capabilityId: "cap30", quota: 100,  periodType: "MONTH", periodValue: 1, grantType: "MONTHLY_GRANT", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每月100次AI方案生成", status: "active", createdAt: "2026-03-12" },
  { id: "rule41", name: "AI风格50次/月",   code: "RULE_AI_STYLE_50_M",  capabilityId: "cap31", quota: 50,   periodType: "MONTH", periodValue: 1, grantType: "MONTHLY_GRANT", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每月50次AI风格迁移", status: "active", createdAt: "2026-03-12" },
  // 智能导购规则
  { id: "rule50", name: "导购推荐500次/月",code: "RULE_GUIDE_500_M",    capabilityId: "cap40", quota: 500,  periodType: "MONTH", periodValue: 1, grantType: "MONTHLY_GRANT", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每月500次导购推荐", status: "active", createdAt: "2026-03-12" },
  { id: "rule51", name: "客户画像开通",    code: "RULE_GUIDE_PROFILE",  capabilityId: "cap41", quota: 1,    periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "客户画像功能开通", status: "active", createdAt: "2026-03-12" },
  // 精准客资规则
  { id: "rule60", name: "线索100条/月",    code: "RULE_LEADS_100_M",    capabilityId: "cap50", quota: 100,  periodType: "MONTH", periodValue: 1, grantType: "MONTHLY_GRANT", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每月100条客资线索", status: "active", createdAt: "2026-03-12" },
];

/* ── SKU (商品) ── */
export type BillingCycle = "once" | "monthly" | "yearly";

export interface Sku {
  id: string;
  name: string;
  code: string;
  appId: string;
  ruleIds: string[];
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
  // 国内3D - 单次充值
  { id: "sku1",  name: "4K普通图",         code: "SKU_4K_SINGLE",    appId: "app1", ruleIds: ["rule28"],          price: 3,     billingCycle: "once",    salesStatus: "on_sale", sortOrder: 1,  description: "单次4K渲染",    createdAt: "2026-03-12" },
  { id: "sku2",  name: "8K普通图",         code: "SKU_8K_SINGLE",    appId: "app1", ruleIds: ["rule29"],          price: 8,     billingCycle: "once",    salesStatus: "on_sale", sortOrder: 2,  description: "单次8K渲染",    createdAt: "2026-03-12" },
  { id: "sku3",  name: "AI积分100·基础包", code: "SKU_AI_100",       appId: "app1", ruleIds: ["rule31"],          price: 9.9,   billingCycle: "once",    salesStatus: "on_sale", sortOrder: 3,  description: "100次AI积分",   createdAt: "2026-03-12" },
  { id: "sku4",  name: "AI积分200·专业包", code: "SKU_AI_200",       appId: "app1", ruleIds: ["rule32"],          price: 19.9,  billingCycle: "once",    salesStatus: "on_sale", sortOrder: 4,  description: "200次AI积分",   createdAt: "2026-03-12" },
  { id: "sku5",  name: "AI积分2000·高级包",code: "SKU_AI_2000",      appId: "app1", ruleIds: ["rule33"],          price: 169,   billingCycle: "once",    salesStatus: "on_sale", sortOrder: 5,  description: "2000次AI积分",  createdAt: "2026-03-12" },
  // 国内3D - 会员
  { id: "sku6",  name: "免费版权益",       code: "SKU_FREE",         appId: "app1", ruleIds: ["rule1", "rule25", "rule7"], price: 0, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 10, description: "免费版基础权益", createdAt: "2026-03-12" },
  { id: "sku7",  name: "基础会员权益",     code: "SKU_BASIC",        appId: "app1", ruleIds: ["rule2", "rule4", "rule9", "rule11", "rule12", "rule13", "rule14", "rule25"], price: 9.9, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 11, description: "基础会员权益包", createdAt: "2026-03-12" },
  { id: "sku8",  name: "旗舰会员权益",     code: "SKU_PRO",          appId: "app1", ruleIds: ["rule3", "rule5", "rule6", "rule8", "rule10", "rule11", "rule12", "rule13", "rule14", "rule15", "rule16", "rule17", "rule18", "rule19", "rule20", "rule21", "rule22", "rule23", "rule24", "rule26"], price: 150, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 12, description: "旗舰会员全能力", createdAt: "2026-03-12" },
  // AI设计家
  { id: "sku20", name: "AI设计家基础版",   code: "SKU_AI_BASIC",     appId: "app4", ruleIds: ["rule40"],          price: 29.9,  billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 1,  description: "AI方案100次/月", createdAt: "2026-03-12" },
  { id: "sku21", name: "AI设计家专业版",   code: "SKU_AI_PRO",       appId: "app4", ruleIds: ["rule40", "rule41"], price: 59.9, billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 2,  description: "AI方案+风格迁移", createdAt: "2026-03-12" },
  // 智能导购
  { id: "sku30", name: "导购标准版",       code: "SKU_GUIDE_STD",    appId: "app3", ruleIds: ["rule50"],          price: 99,    billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 1,  description: "导购推荐500次/月", createdAt: "2026-03-12" },
  { id: "sku31", name: "导购高级版",       code: "SKU_GUIDE_PRO",    appId: "app3", ruleIds: ["rule50", "rule51"], price: 199,  billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 2,  description: "导购+客户画像", createdAt: "2026-03-12" },
  // 精准客资
  { id: "sku40", name: "客资基础包",       code: "SKU_LEADS_100",    appId: "app5", ruleIds: ["rule60"],          price: 199,   billingCycle: "monthly", salesStatus: "on_sale", sortOrder: 1,  description: "每月100条线索", createdAt: "2026-03-12" },
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
    id: "bun1", name: "免费版", code: "BUN_FREE", appId: "app1", appName: "国内3D工具", price: 0, billingCycle: "monthly", status: "on_sale", sortOrder: 1, description: "基础免费权益", createdAt: "2026-03-12",
    items: [{ skuId: "sku6", skuName: "免费版权益", quantity: 1 }],
  },
  {
    id: "bun2", name: "基础会员", code: "BUN_BASIC", appId: "app1", appName: "国内3D工具", price: 9.9, billingCycle: "monthly", status: "on_sale", sortOrder: 2, description: "基础会员套餐", createdAt: "2026-03-12",
    items: [{ skuId: "sku7", skuName: "基础会员权益", quantity: 1 }],
  },
  {
    id: "bun3", name: "旗舰会员", code: "BUN_PRO", appId: "app1", appName: "国内3D工具", price: 299, originalPrice: 399, billingCycle: "monthly", status: "on_sale", sortOrder: 3, description: "旗舰会员套餐", createdAt: "2026-03-12",
    items: [{ skuId: "sku8", skuName: "旗舰会员权益", quantity: 1 }],
  },
  {
    id: "bun4", name: "旗舰会员年卡", code: "BUN_PRO_YEARLY", appId: "app1", appName: "国内3D工具", price: 2388, originalPrice: 3588, billingCycle: "yearly", status: "on_sale", sortOrder: 4, description: "旗舰会员年度套餐", createdAt: "2026-03-12",
    items: [{ skuId: "sku8", skuName: "旗舰会员权益", quantity: 1 }],
  },
  {
    id: "bun5", name: "AI设计家套装", code: "BUN_AI_SUITE", appId: "app4", appName: "AI设计家", price: 79.9, originalPrice: 89.8, billingCycle: "monthly", status: "on_sale", sortOrder: 1, description: "AI方案+风格迁移套装", createdAt: "2026-03-12",
    items: [{ skuId: "sku21", skuName: "AI设计家专业版", quantity: 1 }],
  },
  {
    id: "bun6", name: "导购+客资套装", code: "BUN_GUIDE_LEADS", appId: "app3", appName: "智能导购", price: 349, originalPrice: 398, billingCycle: "monthly", status: "on_sale", sortOrder: 1, description: "智能导购+精准客资联合套装", createdAt: "2026-03-12",
    items: [{ skuId: "sku31", skuName: "导购高级版", quantity: 1 }, { skuId: "sku40", skuName: "客资基础包", quantity: 1 }],
  },
];

/* ══════════════════════════════════════════════════
   权益订单 — 支持跨应用多商品
   ══════════════════════════════════════════════════ */

export type OrderType = "user_purchase" | "internal_grant" | "system_grant" | "enterprise_grant";
export type PaymentStatus = "paid" | "pending" | "no_payment" | "refunded";
export type OrderStatus = "draft" | "pending_effect" | "active" | "expired" | "suspended" | "cancelled" | "closed";
export type AuditStatus = "auto_approved" | "pending_audit" | "approved" | "rejected" | "follow_enterprise";

export interface StatusHistoryEntry {
  status: string;
  label: string;
  time: string;
  remark?: string;
}

export interface OrderItem {
  type: "sku" | "bundle";
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export type CustomerType = "B" | "C";
export const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: "B", label: "B端企业" },
  { value: "C", label: "C端用户" },
];

/** C端用户模拟数据 */
export interface CUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export const cUserData: CUser[] = [
  { id: "user1", name: "张三", phone: "138****1234", email: "zhangsan@example.com" },
  { id: "user2", name: "李四", phone: "139****5678", email: "lisi@example.com" },
  { id: "user3", name: "王五", phone: "137****9012" },
  { id: "user4", name: "赵六", phone: "136****3456", email: "zhaoliu@example.com" },
  { id: "user5", name: "刘七", phone: "135****7890" },
  { id: "user6", name: "陈八", phone: "158****2345", email: "chba@example.com" },
  { id: "user7", name: "周九", phone: "159****6789" },
  { id: "user8", name: "吴十", phone: "186****0123", email: "wushi@example.com" },
];

/** B端企业模拟数据（支持层级结构） */
export interface BEnterprise {
  id: string;
  name: string;
  type: string;
  level: number; // 0=总部, 1=子企业, 2=孙企业
  parentId?: string;
  parentName?: string;
}

export const bEnterpriseData: BEnterprise[] = [
  // 总部（0级）
  { id: "cust1", name: "欧派家居集团股份有限公司", type: "品牌商", level: 0 },
  { id: "cust2", name: "索菲亚家居股份有限公司", type: "品牌商", level: 0 },
  { id: "cust3", name: "尚品宅配家居股份有限公司", type: "品牌商", level: 0 },
  { id: "cust4", name: "金牌厨柜家居科技股份有限公司", type: "品牌商", level: 0 },
  { id: "cust5", name: "志邦家居股份有限公司", type: "品牌商", level: 0 },
  { id: "cust6", name: "我乐家居股份有限公司", type: "品牌商", level: 0 },
  { id: "cust7", name: "好莱客创意家居股份有限公司", type: "品牌商", level: 0 },
  { id: "cust8", name: "居然之家投资控股集团", type: "卖场", level: 0 },
  { id: "cust9", name: "红星美凯龙家居集团", type: "卖场", level: 0 },
  // 欧派子企业（1级）
  { id: "cust1-1", name: "欧派家居北京经销商", type: "经销商", level: 1, parentId: "cust1", parentName: "欧派家居集团股份有限公司" },
  { id: "cust1-2", name: "欧派家居上海经销商", type: "经销商", level: 1, parentId: "cust1", parentName: "欧派家居集团股份有限公司" },
  { id: "cust1-3", name: "欧派家居广州旗舰店", type: "门店", level: 1, parentId: "cust1", parentName: "欧派家居集团股份有限公司" },
  // 欧派孙企业（2级）
  { id: "cust1-1-1", name: "欧派北京朝阳门店", type: "门店", level: 2, parentId: "cust1-1", parentName: "欧派家居北京经销商" },
  { id: "cust1-1-2", name: "欧派北京海淀门店", type: "门店", level: 2, parentId: "cust1-1", parentName: "欧派家居北京经销商" },
  { id: "cust1-2-1", name: "欧派上海浦东门店", type: "门店", level: 2, parentId: "cust1-2", parentName: "欧派家居上海经销商" },
  // 索菲亚子企业（1级）
  { id: "cust2-1", name: "索菲亚华南经销商", type: "经销商", level: 1, parentId: "cust2", parentName: "索菲亚家居股份有限公司" },
  { id: "cust2-2", name: "索菲亚西南装修合作商", type: "装修公司", level: 1, parentId: "cust2", parentName: "索菲亚家居股份有限公司" },
  // 索菲亚孙企业（2级）
  { id: "cust2-1-1", name: "索菲亚深圳南山门店", type: "门店", level: 2, parentId: "cust2-1", parentName: "索菲亚华南经销商" },
  // 居然之家子企业
  { id: "cust8-1", name: "居然之家北京北四环店", type: "门店", level: 1, parentId: "cust8", parentName: "居然之家投资控股集团" },
  { id: "cust8-2", name: "居然之家上海真北店", type: "门店", level: 1, parentId: "cust8", parentName: "居然之家投资控股集团" },
  // 红星美凯龙子企业
  { id: "cust9-1", name: "红星美凯龙杭州商场", type: "门店", level: 1, parentId: "cust9", parentName: "红星美凯龙家居集团" },
  { id: "cust9-2", name: "红星美凯龙南京商场", type: "门店", level: 1, parentId: "cust9", parentName: "红星美凯龙家居集团" },
  // 独立装修公司
  { id: "cust10", name: "北京金隅装饰工程有限公司", type: "装修公司", level: 0 },
  { id: "cust11", name: "上海东易日盛装饰有限公司", type: "装修公司", level: 0 },
  { id: "cust12", name: "深圳市名雕装饰股份有限公司", type: "装修公司", level: 0 },
];

export interface EntitlementOrder {
  id: string;
  orderNo: string;
  customerType: CustomerType;
  customerId: string;
  customerName: string;
  /** 订单不绑定单一应用，涉及的应用从 items 中的商品/套餐推导 */
  orderType: OrderType;
  auditStatus: AuditStatus;
  auditRemark?: string;
  auditBy?: string;
  auditAt?: string;
  /** 关联企业ID（enterprise_grant 类型时有值） */
  linkedEnterpriseId?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: string;
  expireAt?: string;
  remark: string;
  createdAt: string;
  statusHistory: StatusHistoryEntry[];
}

/** 从订单条目推导涉及的应用ID列表（去重） */
export function getOrderAppIds(order: EntitlementOrder): string[] {
  const appIds = new Set<string>();
  for (const item of order.items) {
    if (item.type === "sku") {
      const sku = skuData.find((s) => s.id === item.itemId);
      if (sku) appIds.add(sku.appId);
    } else {
      const bundle = bundleData.find((b) => b.id === item.itemId);
      if (bundle) appIds.add(bundle.appId);
      // 套餐中的SKU可能跨应用
      if (bundle) {
        for (const bi of bundle.items) {
          const sku = skuData.find((s) => s.id === bi.skuId);
          if (sku) appIds.add(sku.appId);
        }
      }
    }
  }
  return Array.from(appIds);
}

/** 获取订单涉及的应用对象列表 */
export function getOrderApps(order: EntitlementOrder): AppItem[] {
  return getOrderAppIds(order).map((id) => appData.find((a) => a.id === id)).filter(Boolean) as AppItem[];
}

export const ORDER_TYPES: { value: OrderType; label: string; className: string }[] = [
  { value: "user_purchase",    label: "用户购买",   className: "text-primary" },
  { value: "internal_grant",   label: "内部发放",   className: "text-amber-600" },
  { value: "system_grant",     label: "系统发放",   className: "text-muted-foreground" },
  { value: "enterprise_grant", label: "企业入驻",   className: "text-emerald-600" },
];

export const PAYMENT_STATUS: { value: PaymentStatus; label: string; className: string }[] = [
  { value: "paid",       label: "已支付",   className: "badge-active" },
  { value: "pending",    label: "待支付",   className: "badge-warning" },
  { value: "no_payment", label: "无需支付", className: "text-muted-foreground text-[12px]" },
  { value: "refunded",   label: "已退款",   className: "badge-inactive" },
];

export const ORDER_STATUS: { value: OrderStatus; label: string; className: string }[] = [
  { value: "draft",           label: "草稿",    className: "badge-warning" },
  { value: "pending_payment", label: "待支付",  className: "badge-warning" },
  { value: "processing",     label: "处理中",  className: "text-primary text-[12px] font-medium" },
  { value: "completed",      label: "已完成",  className: "badge-active" },
  { value: "cancelled",      label: "已取消",  className: "badge-inactive" },
  { value: "refunded",       label: "已退款",  className: "badge-inactive" },
  { value: "closed",         label: "已关闭",  className: "badge-inactive" },
];

export const AUDIT_STATUS: { value: AuditStatus; label: string; className: string }[] = [
  { value: "auto_approved",     label: "自动通过",   className: "badge-active" },
  { value: "pending_audit",     label: "待审核",     className: "badge-warning" },
  { value: "approved",          label: "审核通过",   className: "badge-active" },
  { value: "rejected",          label: "审核驳回",   className: "badge-danger" },
  { value: "follow_enterprise", label: "跟随企业",   className: "text-emerald-600 text-[12px] font-medium" },
];

/** 根据订单类型自动确定审核状态 */
export function getInitialAuditStatus(orderType: OrderType): AuditStatus {
  switch (orderType) {
    case "user_purchase":    return "auto_approved";
    case "system_grant":     return "auto_approved";
    case "internal_grant":   return "pending_audit";
    case "enterprise_grant": return "follow_enterprise";
  }
}

/** 根据订单类型和审核状态确定初始订单状态 */
export function getInitialOrderStatus(orderType: OrderType, auditStatus: AuditStatus): OrderStatus {
  if (auditStatus === "pending_audit" || auditStatus === "follow_enterprise") return "draft";
  if (orderType === "user_purchase") return "pending_payment";
  return "processing"; // auto_approved + no payment needed
}

export type OrderSource = "purchase" | "gift" | "promotion" | "system";
export const ORDER_SOURCES: { value: OrderSource; label: string }[] = [
  { value: "purchase", label: "购买" },
  { value: "gift", label: "赠送" },
  { value: "promotion", label: "促销" },
  { value: "system", label: "系统发放" },
];

export const orderData: EntitlementOrder[] = [
  {
    id: "ord1", orderNo: "ORD202603120001", customerType: "B", customerId: "cust1", customerName: "欧派家居集团股份有限公司",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 299, paymentStatus: "paid", orderStatus: "completed",
    paidAt: "2026-03-12 10:05:00", expireAt: "2027-03-12", remark: "旗舰会员月付", createdAt: "2026-03-12 10:00:00",
    items: [{ type: "bundle", itemId: "bun3", itemName: "旗舰会员", quantity: 1, unitPrice: 299 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-12 10:00:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-12 10:00:01", remark: "用户购买订单自动通过" },
      { status: "paid",          label: "支付完成", time: "2026-03-12 10:05:00", remark: "微信支付" },
      { status: "granted",       label: "权益发放", time: "2026-03-12 10:05:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-12 10:05:10" },
    ],
  },
  {
    id: "ord2", orderNo: "ORD202603120002", customerType: "B", customerId: "cust2", customerName: "索菲亚家居股份有限公司",
    orderType: "internal_grant", auditStatus: "approved", auditBy: "运营主管·张丽", auditAt: "2026-03-12 11:15:00",
    totalAmount: 0, paymentStatus: "no_payment", orderStatus: "completed",
    remark: "内部发放基础会员", createdAt: "2026-03-12 11:00:00",
    items: [{ type: "bundle", itemId: "bun2", itemName: "基础会员", quantity: 1, unitPrice: 0 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-12 11:00:00", remark: "运营创建内部订单" },
      { status: "pending_audit", label: "提交审核", time: "2026-03-12 11:00:01", remark: "内部发放订单需人工审核" },
      { status: "approved",      label: "审核通过", time: "2026-03-12 11:15:00", remark: "运营主管·张丽 审核通过" },
      { status: "granted",       label: "权益发放", time: "2026-03-12 11:15:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-12 11:15:10" },
    ],
  },
  {
    id: "ord3", orderNo: "ORD202603120003", customerType: "C", customerId: "user1", customerName: "张三",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 9.9, paymentStatus: "pending", orderStatus: "pending_payment",
    remark: "AI积分充值", createdAt: "2026-03-12 12:00:00",
    items: [{ type: "sku", itemId: "sku3", itemName: "AI积分100·基础包", quantity: 1, unitPrice: 9.9 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-12 12:00:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-12 12:00:01", remark: "用户购买订单自动通过" },
    ],
  },
  {
    id: "ord4", orderNo: "ORD202603140001", customerType: "B", customerId: "cust1", customerName: "欧派家居集团股份有限公司",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 11, paymentStatus: "paid", orderStatus: "completed",
    paidAt: "2026-03-14 16:05:00", remark: "充值渲染次数", createdAt: "2026-03-14 16:00:00",
    items: [
      { type: "sku", itemId: "sku1", itemName: "4K普通图", quantity: 1, unitPrice: 3 },
      { type: "sku", itemId: "sku2", itemName: "8K普通图", quantity: 1, unitPrice: 8 },
    ],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-14 16:00:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-14 16:00:01" },
      { status: "paid",          label: "支付完成", time: "2026-03-14 16:05:00", remark: "支付宝" },
      { status: "granted",       label: "权益发放", time: "2026-03-14 16:05:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-14 16:05:10" },
    ],
  },
  {
    // 企业入驻订单 — 跟随企业审核（已通过）
    id: "ord5", orderNo: "ORD202603150001", customerType: "B", customerId: "cust2", customerName: "索菲亚家居股份有限公司",
    orderType: "enterprise_grant", auditStatus: "follow_enterprise", linkedEnterpriseId: "cust2",
    totalAmount: 0, paymentStatus: "no_payment", orderStatus: "completed",
    remark: "企业入驻权益配置 — 3D工具+导购", createdAt: "2026-03-15 09:25:00",
    items: [
      { type: "bundle", itemId: "bun2", itemName: "基础会员", quantity: 1, unitPrice: 0 },
      { type: "sku", itemId: "sku31", itemName: "导购高级版", quantity: 1, unitPrice: 0 },
    ],
    statusHistory: [
      { status: "created",            label: "订单创建", time: "2026-03-15 09:25:00", remark: "企业入驻自动生成" },
      { status: "follow_enterprise",  label: "跟随企业审核", time: "2026-03-15 09:25:01", remark: "订单状态跟随企业「索菲亚家居」审核结果" },
      { status: "enterprise_approved", label: "企业审核通过", time: "2026-03-15 10:30:00", remark: "企业审核通过，订单自动放行" },
      { status: "granted",            label: "权益发放", time: "2026-03-15 10:30:05", remark: "自动发放至对应应用账户" },
      { status: "completed",          label: "订单完成", time: "2026-03-15 10:30:10" },
    ],
  },
  {
    id: "ord6", orderNo: "ORD202603160001", customerType: "B", customerId: "cust1", customerName: "欧派家居集团股份有限公司",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 2388, paymentStatus: "paid", orderStatus: "completed",
    paidAt: "2026-03-16 11:30:00", expireAt: "2027-03-16", remark: "年卡升级", createdAt: "2026-03-16 11:25:00",
    items: [{ type: "bundle", itemId: "bun4", itemName: "旗舰会员年卡", quantity: 1, unitPrice: 2388 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-16 11:25:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-16 11:25:01" },
      { status: "paid",          label: "支付完成", time: "2026-03-16 11:30:00", remark: "支付宝" },
      { status: "granted",       label: "权益发放", time: "2026-03-16 11:30:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-16 11:30:10" },
    ],
  },
  {
    // 企业入驻订单 — 跟随企业审核（已通过）
    id: "ord7", orderNo: "ORD202603170001", customerType: "B", customerId: "cust3", customerName: "尚品宅配家居股份有限公司",
    orderType: "enterprise_grant", auditStatus: "follow_enterprise", linkedEnterpriseId: "cust3",
    totalAmount: 0, paymentStatus: "no_payment", orderStatus: "completed",
    remark: "企业入驻权益配置 — AI设计家+客资", createdAt: "2026-03-17 14:00:00",
    items: [
      { type: "sku", itemId: "sku21", itemName: "AI设计家专业版", quantity: 1, unitPrice: 0 },
      { type: "sku", itemId: "sku40", itemName: "客资基础包", quantity: 1, unitPrice: 0 },
    ],
    statusHistory: [
      { status: "created",            label: "订单创建", time: "2026-03-17 14:00:00", remark: "企业入驻自动生成" },
      { status: "follow_enterprise",  label: "跟随企业审核", time: "2026-03-17 14:00:01", remark: "订单状态跟随企业「尚品宅配」审核结果" },
      { status: "enterprise_approved", label: "企业审核通过", time: "2026-03-17 15:20:00", remark: "企业审核通过，订单自动放行" },
      { status: "granted",            label: "权益发放", time: "2026-03-17 15:20:05", remark: "自动发放" },
      { status: "completed",          label: "订单完成", time: "2026-03-17 15:20:10" },
    ],
  },
  {
    id: "ord8", orderNo: "ORD202603180001", customerType: "B", customerId: "cust4", customerName: "金牌厨柜家居科技股份有限公司",
    orderType: "system_grant", auditStatus: "auto_approved", totalAmount: 0, paymentStatus: "no_payment", orderStatus: "completed",
    remark: "新企业注册赠送免费版", createdAt: "2026-03-18 08:00:00",
    items: [{ type: "bundle", itemId: "bun1", itemName: "免费版", quantity: 1, unitPrice: 0 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-18 08:00:00", remark: "系统自动创建" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-18 08:00:01", remark: "系统发放订单自动通过" },
      { status: "granted",       label: "权益发放", time: "2026-03-18 08:00:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-18 08:00:10" },
    ],
  },
  {
    id: "ord9", orderNo: "ORD202603190001", customerType: "C", customerId: "user2", customerName: "李四",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 169, paymentStatus: "refunded", orderStatus: "refunded",
    paidAt: "2026-03-19 15:00:00", remark: "已申请退款", createdAt: "2026-03-19 14:55:00",
    items: [{ type: "sku", itemId: "sku5", itemName: "AI积分2000·高级包", quantity: 1, unitPrice: 169 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-19 14:55:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-19 14:55:01" },
      { status: "paid",          label: "支付完成", time: "2026-03-19 15:00:00", remark: "微信支付" },
      { status: "granted",       label: "权益发放", time: "2026-03-19 15:00:05", remark: "自动发放" },
      { status: "refunded",      label: "退款完成", time: "2026-03-20 10:00:00", remark: "客户申请退款，权益已回收" },
    ],
  },
  {
    // 跨3个应用的大订单
    id: "ord10", orderNo: "ORD202603200001", customerType: "B", customerId: "cust2", customerName: "索菲亚家居股份有限公司",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 528.8, paymentStatus: "paid", orderStatus: "completed",
    paidAt: "2026-03-20 10:15:00", remark: "企业升级套装 — 3D+AI+导购", createdAt: "2026-03-20 10:10:00",
    items: [
      { type: "bundle", itemId: "bun3", itemName: "旗舰会员", quantity: 1, unitPrice: 299 },
      { type: "bundle", itemId: "bun5", itemName: "AI设计家套装", quantity: 1, unitPrice: 79.9 },
      { type: "sku", itemId: "sku31", itemName: "导购高级版", quantity: 1, unitPrice: 199 },
    ],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-20 10:10:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-20 10:10:01" },
      { status: "paid",          label: "支付完成", time: "2026-03-20 10:15:00", remark: "支付宝" },
      { status: "granted",       label: "权益发放", time: "2026-03-20 10:15:05", remark: "自动发放至3个应用账户" },
      { status: "completed",     label: "订单完成", time: "2026-03-20 10:15:10" },
    ],
  },
  {
    // C端用户购买
    id: "ord11", orderNo: "ORD202603210001", customerType: "C", customerId: "user3", customerName: "王五",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 99, paymentStatus: "paid", orderStatus: "completed",
    paidAt: "2026-03-21 09:30:00", remark: "个人购买基础会员", createdAt: "2026-03-21 09:25:00",
    items: [{ type: "bundle", itemId: "bun2", itemName: "基础会员", quantity: 1, unitPrice: 99 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-21 09:25:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-21 09:25:01" },
      { status: "paid",          label: "支付完成", time: "2026-03-21 09:30:00", remark: "微信支付" },
      { status: "granted",       label: "权益发放", time: "2026-03-21 09:30:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-21 09:30:10" },
    ],
  },
  {
    // C端系统赠送
    id: "ord12", orderNo: "ORD202603220001", customerType: "C", customerId: "user4", customerName: "赵六",
    orderType: "system_grant", auditStatus: "auto_approved", totalAmount: 0, paymentStatus: "no_payment", orderStatus: "completed",
    remark: "新用户注册赠送体验包", createdAt: "2026-03-22 14:00:00",
    items: [{ type: "bundle", itemId: "bun1", itemName: "免费版", quantity: 1, unitPrice: 0 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-22 14:00:00", remark: "系统自动创建" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-22 14:00:01", remark: "系统发放订单自动通过" },
      { status: "granted",       label: "权益发放", time: "2026-03-22 14:00:05", remark: "自动发放" },
      { status: "completed",     label: "订单完成", time: "2026-03-22 14:00:10" },
    ],
  },
  {
    // 内部发放 — 待审核（未处理）
    id: "ord13", orderNo: "ORD202603230001", customerType: "B", customerId: "cust5", customerName: "志邦家居股份有限公司",
    orderType: "internal_grant", auditStatus: "pending_audit", totalAmount: 0, paymentStatus: "no_payment", orderStatus: "draft",
    remark: "新客户体验权益发放", createdAt: "2026-03-23 09:00:00",
    items: [{ type: "bundle", itemId: "bun2", itemName: "基础会员", quantity: 1, unitPrice: 0 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-23 09:00:00", remark: "运营·王磊 创建内部订单" },
      { status: "pending_audit", label: "提交审核", time: "2026-03-23 09:00:01", remark: "内部发放订单需人工审核" },
    ],
  },
  {
    // 内部发放 — 审核驳回
    id: "ord14", orderNo: "ORD202603230002", customerType: "B", customerId: "cust6", customerName: "我乐家居股份有限公司",
    orderType: "internal_grant", auditStatus: "rejected", auditBy: "运营主管·张丽", auditAt: "2026-03-23 14:30:00",
    auditRemark: "客户资质未确认，暂不发放",
    totalAmount: 0, paymentStatus: "no_payment", orderStatus: "closed",
    remark: "试用权益发放", createdAt: "2026-03-23 10:00:00",
    items: [{ type: "sku", itemId: "sku21", itemName: "AI设计家专业版", quantity: 1, unitPrice: 0 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-23 10:00:00", remark: "运营·李明 创建内部订单" },
      { status: "pending_audit", label: "提交审核", time: "2026-03-23 10:00:01", remark: "内部发放订单需人工审核" },
      { status: "rejected",      label: "审核驳回", time: "2026-03-23 14:30:00", remark: "运营主管·张丽 驳回：客户资质未确认，暂不发放" },
      { status: "closed",        label: "订单关闭", time: "2026-03-23 14:30:05", remark: "审核驳回，订单自动关闭" },
    ],
  },
  {
    // 企业入驻订单 — 跟随企业审核（企业待审核，订单草稿中）
    id: "ord15", orderNo: "ORD202603240001", customerType: "B", customerId: "cust7", customerName: "好莱客创意家居股份有限公司",
    orderType: "enterprise_grant", auditStatus: "follow_enterprise", linkedEnterpriseId: "cust7",
    totalAmount: 0, paymentStatus: "no_payment", orderStatus: "draft",
    remark: "企业入驻权益配置 — 国内3D工具", createdAt: "2026-03-24 10:00:00",
    items: [
      { type: "bundle", itemId: "bun2", itemName: "基础会员", quantity: 1, unitPrice: 0 },
    ],
    statusHistory: [
      { status: "created",           label: "订单创建", time: "2026-03-24 10:00:00", remark: "企业入驻自动生成" },
      { status: "follow_enterprise", label: "跟随企业审核", time: "2026-03-24 10:00:01", remark: "订单状态跟随企业「好莱客创意家居」审核结果，企业当前待审核" },
    ],
  },
  {
    // 用户购买 — 已取消（超时未支付）
    id: "ord16", orderNo: "ORD202603250001", customerType: "C", customerId: "user5", customerName: "刘七",
    orderType: "user_purchase", auditStatus: "auto_approved", totalAmount: 299, paymentStatus: "pending", orderStatus: "cancelled",
    remark: "旗舰会员月付（超时未支付）", createdAt: "2026-03-25 08:00:00",
    items: [{ type: "bundle", itemId: "bun3", itemName: "旗舰会员", quantity: 1, unitPrice: 299 }],
    statusHistory: [
      { status: "created",       label: "订单创建", time: "2026-03-25 08:00:00", remark: "用户下单" },
      { status: "auto_approved", label: "自动审核通过", time: "2026-03-25 08:00:01" },
      { status: "cancelled",     label: "订单取消", time: "2026-03-25 08:30:00", remark: "超时未支付，系统自动取消" },
    ],
  },
];

/* ── AllocationRecord (分配记录 — 订单维度的权益分配) ── */
export interface AllocationRecord {
  id: string;
  orderId: string;
  orderNo: string;
  itemType: "sku" | "bundle";
  itemId: string;
  itemName: string;
  appId: string;
  appName: string;
  capabilityCount: number;  // 包含权益数
  instanceCount: number;    // 有效实例数
  usageRate: number;        // 使用率 0-100
  allocatedAt: string;
}

/* ── EntitlementAccount (权益账户 — 按客户维度聚合) ── */
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
  customerType: CustomerType;
  /** 涉及的应用IDs */
  appIds: string[];
  appNames: string[];
  /** 分配记录 */
  allocations: AllocationRecord[];
  capabilities: AccountCapability[];
  orderIds: string[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

/** 聚合客户维度的统计 */
export function getAccountStats(acc: EntitlementAccount) {
  const productCount = acc.appIds.length;
  const capCount = new Set(acc.capabilities.map((c) => c.capabilityId)).size;
  const instanceCount = acc.capabilities.length;
  const totalUsed = acc.capabilities.filter((c) => c.unit !== "布尔").reduce((s, c) => s + c.usedQuota, 0);
  const totalQuota = acc.capabilities.filter((c) => c.unit !== "布尔").reduce((s, c) => s + c.totalQuota, 0);
  const usageRate = totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100 * 10) / 10 : 0;
  return { productCount, capCount, instanceCount, usageRate };
}

export const accountData: EntitlementAccount[] = [
  {
    id: "acc1", customerId: "cust1", customerName: "欧派家居集团股份有限公司", customerType: "B",
    appIds: ["app1"], appNames: ["国内3D工具"],
    orderIds: ["ord1", "ord4", "ord6"], status: "active", createdAt: "2026-03-12", updatedAt: "2026-03-16",
    allocations: [
      { id: "alloc1", orderId: "ord1", orderNo: "ORD202603120001", itemType: "bundle", itemId: "bun3", itemName: "旗舰会员（国内3D工具）", appId: "app1", appName: "国内3D工具", capabilityCount: 3, instanceCount: 3, usageRate: 15.2, allocatedAt: "2026-03-12 10:00:00" },
      { id: "alloc2", orderId: "ord4", orderNo: "ORD202603140001", itemType: "sku", itemId: "sku1", itemName: "4K普通图", appId: "app1", appName: "国内3D工具", capabilityCount: 1, instanceCount: 1, usageRate: 0, allocatedAt: "2026-03-14 16:00:00" },
      { id: "alloc3", orderId: "ord4", orderNo: "ORD202603140001", itemType: "sku", itemId: "sku2", itemName: "8K普通图", appId: "app1", appName: "国内3D工具", capabilityCount: 1, instanceCount: 1, usageRate: 0, allocatedAt: "2026-03-14 16:00:00" },
    ],
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule3",  ruleName: "AI设计500次/日",     totalQuota: 500,   usedQuota: 128,  unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap2", capabilityName: "4K渲染",     ruleId: "rule5",  ruleName: "4K渲染4次/日",       totalQuota: 4,     usedQuota: 2,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap2", capabilityName: "4K渲染",     ruleId: "rule28", ruleName: "4K渲染1次",          totalQuota: 1,     usedQuota: 0,    unit: "次",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord4"] },
      { capabilityId: "cap3", capabilityName: "8K渲染",     ruleId: "rule6",  ruleName: "8K渲染1次/日",       totalQuota: 1,     usedQuota: 1,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap3", capabilityName: "8K渲染",     ruleId: "rule29", ruleName: "8K渲染1次",          totalQuota: 1,     usedQuota: 0,    unit: "次",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord4"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule26", ruleName: "云存储4GB",          totalQuota: 4096,  usedQuota: 1280, unit: "MB",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord1", "ord6"] },
      { capabilityId: "cap5", capabilityName: "2D效果图导出", ruleId: "rule10", ruleName: "2D效果图无限导出", totalQuota: 1,     usedQuota: 0,    unit: "布尔", periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord1"] },
      { capabilityId: "cap6", capabilityName: "全屋模型库",  ruleId: "rule11", ruleName: "全屋模型库访问",   totalQuota: 1,     usedQuota: 0,    unit: "布尔", periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord1"] },
    ],
  },
  {
    id: "acc2", customerId: "cust2", customerName: "索菲亚家居股份有限公司", customerType: "B",
    appIds: ["app1", "app3", "app4"], appNames: ["国内3D工具", "智能导购", "AI设计家"],
    orderIds: ["ord2", "ord5", "ord10"], status: "active", createdAt: "2026-03-12", updatedAt: "2026-03-20",
    allocations: [
      { id: "alloc4", orderId: "ord10", orderNo: "ORD202603200001", itemType: "bundle", itemId: "bun3", itemName: "旗舰会员（国内3D工具）", appId: "app1", appName: "国内3D工具", capabilityCount: 3, instanceCount: 3, usageRate: 89.1, allocatedAt: "2026-03-20 10:10:00" },
      { id: "alloc5", orderId: "ord5", orderNo: "ORD202603150001", itemType: "sku", itemId: "sku31", itemName: "导购高级版", appId: "app3", appName: "智能导购", capabilityCount: 2, instanceCount: 2, usageRate: 24.0, allocatedAt: "2026-03-15 09:25:00" },
      { id: "alloc6", orderId: "ord10", orderNo: "ORD202603200001", itemType: "bundle", itemId: "bun5", itemName: "AI设计家套装", appId: "app4", appName: "AI设计家", capabilityCount: 2, instanceCount: 2, usageRate: 20.7, allocatedAt: "2026-03-20 10:10:00" },
    ],
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule3",  ruleName: "AI设计500次/日",     totalQuota: 500,   usedQuota: 445,   unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord10"] },
      { capabilityId: "cap2", capabilityName: "4K渲染",     ruleId: "rule5",  ruleName: "4K渲染4次/日",       totalQuota: 4,     usedQuota: 0,    unit: "次",  periodType: "DAY",       grantType: "DAILY_REFRESH", sourceOrderIds: ["ord10"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule26", ruleName: "云存储4GB",          totalQuota: 4096,  usedQuota: 56,   unit: "MB",  periodType: "PERMANENT", grantType: "ONE_TIME",      sourceOrderIds: ["ord10"] },
      { capabilityId: "cap40", capabilityName: "导购推荐",   ruleId: "rule50", ruleName: "导购推荐500次/月", totalQuota: 500, usedQuota: 120, unit: "次", periodType: "MONTH", grantType: "MONTHLY_GRANT", sourceOrderIds: ["ord5", "ord10"] },
      { capabilityId: "cap41", capabilityName: "客户画像",   ruleId: "rule51", ruleName: "客户画像开通",     totalQuota: 1,   usedQuota: 0,   unit: "布尔", periodType: "PERMANENT", grantType: "ONE_TIME", sourceOrderIds: ["ord5", "ord10"] },
      { capabilityId: "cap30", capabilityName: "AI方案生成", ruleId: "rule40", ruleName: "AI方案100次/月",   totalQuota: 100, usedQuota: 23, unit: "次", periodType: "MONTH", grantType: "MONTHLY_GRANT", sourceOrderIds: ["ord10"] },
      { capabilityId: "cap31", capabilityName: "AI风格迁移", ruleId: "rule41", ruleName: "AI风格50次/月",    totalQuota: 50,  usedQuota: 8,  unit: "次", periodType: "MONTH", grantType: "MONTHLY_GRANT", sourceOrderIds: ["ord10"] },
    ],
  },
  {
    id: "acc3", customerId: "cust3", customerName: "尚品宅配家居股份有限公司", customerType: "B",
    appIds: ["app4", "app5"], appNames: ["AI设计家", "精准客资"],
    orderIds: ["ord7"], status: "active", createdAt: "2026-03-17", updatedAt: "2026-03-17",
    allocations: [
      { id: "alloc7", orderId: "ord7", orderNo: "ORD202603170001", itemType: "sku", itemId: "sku21", itemName: "AI设计家专业版", appId: "app4", appName: "AI设计家", capabilityCount: 2, instanceCount: 2, usageRate: 5.3, allocatedAt: "2026-03-17 14:00:00" },
      { id: "alloc8", orderId: "ord7", orderNo: "ORD202603170001", itemType: "sku", itemId: "sku40", itemName: "客资基础包", appId: "app5", appName: "精准客资", capabilityCount: 1, instanceCount: 1, usageRate: 32.0, allocatedAt: "2026-03-17 14:00:00" },
    ],
    capabilities: [
      { capabilityId: "cap30", capabilityName: "AI方案生成", ruleId: "rule40", ruleName: "AI方案100次/月",   totalQuota: 100, usedQuota: 5, unit: "次", periodType: "MONTH", grantType: "MONTHLY_GRANT", sourceOrderIds: ["ord7"] },
      { capabilityId: "cap31", capabilityName: "AI风格迁移", ruleId: "rule41", ruleName: "AI风格50次/月",    totalQuota: 50,  usedQuota: 0, unit: "次", periodType: "MONTH", grantType: "MONTHLY_GRANT", sourceOrderIds: ["ord7"] },
      { capabilityId: "cap50", capabilityName: "线索获取",   ruleId: "rule60", ruleName: "线索100条/月",     totalQuota: 100, usedQuota: 32, unit: "条", periodType: "MONTH", grantType: "MONTHLY_GRANT", sourceOrderIds: ["ord7"] },
    ],
  },
  {
    id: "acc4", customerId: "cust4", customerName: "金牌厨柜家居科技股份有限公司", customerType: "B",
    appIds: ["app1"], appNames: ["国内3D工具"],
    orderIds: ["ord8"], status: "active", createdAt: "2026-03-18", updatedAt: "2026-03-18",
    allocations: [
      { id: "alloc9", orderId: "ord8", orderNo: "ORD202603180001", itemType: "bundle", itemId: "bun1", itemName: "免费版（国内3D工具）", appId: "app1", appName: "国内3D工具", capabilityCount: 2, instanceCount: 2, usageRate: 6.0, allocatedAt: "2026-03-18 08:00:00" },
    ],
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule1",  ruleName: "AI设计100次/日",     totalQuota: 100, usedQuota: 12, unit: "次", periodType: "DAY", grantType: "DAILY_REFRESH", sourceOrderIds: ["ord8"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule25", ruleName: "云存储200MB",        totalQuota: 200, usedQuota: 0,  unit: "MB", periodType: "PERMANENT", grantType: "ONE_TIME", sourceOrderIds: ["ord8"] },
    ],
  },
  {
    id: "acc5", customerId: "user3", customerName: "王五", customerType: "C",
    appIds: ["app1"], appNames: ["国内3D工具"],
    orderIds: ["ord11"], status: "active", createdAt: "2026-03-21", updatedAt: "2026-03-21",
    allocations: [
      { id: "alloc10", orderId: "ord11", orderNo: "ORD202603210001", itemType: "bundle", itemId: "bun2", itemName: "基础会员", appId: "app1", appName: "国内3D工具", capabilityCount: 2, instanceCount: 2, usageRate: 8.3, allocatedAt: "2026-03-21 09:30:00" },
    ],
    capabilities: [
      { capabilityId: "cap1", capabilityName: "AI设计",     ruleId: "rule2",  ruleName: "AI设计200次/日",     totalQuota: 200, usedQuota: 15, unit: "次", periodType: "DAY", grantType: "DAILY_REFRESH", sourceOrderIds: ["ord11"] },
      { capabilityId: "cap21", capabilityName: "云存储",    ruleId: "rule25", ruleName: "云存储200MB",        totalQuota: 200, usedQuota: 18,  unit: "MB", periodType: "PERMANENT", grantType: "ONE_TIME", sourceOrderIds: ["ord11"] },
    ],
  },
];

/* ── Account Health Metrics (Mock) ── */
export interface AccountHealthMetrics {
  healthScore: number;
  healthLevel: "excellent" | "good" | "warning" | "critical";
  usageTrend: { month: string; rate: number }[];
  renewalRate: number;
  renewalHistory: { year: string; renewed: boolean; amount: number }[];
  intentScore: number;
  intentSignals: { label: string; value: string; trend: "up" | "down" | "stable" }[];
  riskFactors: string[];
  opportunities: string[];
  lastLoginDays: number;
  activeUsers: number;
  totalUsers: number;
  avgSessionMinutes: number;
}

const HEALTH_DATA: Record<string, AccountHealthMetrics> = {
  acc1: {
    healthScore: 82, healthLevel: "good",
    usageTrend: [
      { month: "2025-10", rate: 45 }, { month: "2025-11", rate: 52 }, { month: "2025-12", rate: 58 },
      { month: "2026-01", rate: 63 }, { month: "2026-02", rate: 71 }, { month: "2026-03", rate: 68 },
    ],
    renewalRate: 100,
    renewalHistory: [
      { year: "2024", renewed: true, amount: 128000 },
      { year: "2025", renewed: true, amount: 156000 },
      { year: "2026", renewed: true, amount: 189000 },
    ],
    intentScore: 75,
    intentSignals: [
      { label: "功能使用频率", value: "高频（日均85次）", trend: "up" },
      { label: "新功能试用", value: "已体验3个Beta功能", trend: "up" },
      { label: "客服咨询", value: "本月2次咨询升级", trend: "up" },
      { label: "合同到期", value: "剩余286天", trend: "stable" },
    ],
    riskFactors: ["8K渲染使用率100%，可能影响体验"],
    opportunities: ["推荐升级旗舰版", "AI设计使用率上升，可推荐AI设计家"],
    lastLoginDays: 0, activeUsers: 45, totalUsers: 60, avgSessionMinutes: 38,
  },
  acc2: {
    healthScore: 42, healthLevel: "warning",
    usageTrend: [
      { month: "2025-10", rate: 30 }, { month: "2025-11", rate: 55 }, { month: "2025-12", rate: 72 },
      { month: "2026-01", rate: 81 }, { month: "2026-02", rate: 87 }, { month: "2026-03", rate: 89 },
    ],
    renewalRate: 66.7,
    renewalHistory: [
      { year: "2024", renewed: true, amount: 98000 },
      { year: "2025", renewed: false, amount: 0 },
      { year: "2026", renewed: true, amount: 210000 },
    ],
    intentScore: 58,
    intentSignals: [
      { label: "功能使用频率", value: "超高频（日均320次）", trend: "up" },
      { label: "额度消耗速度", value: "提前12天用完月额度", trend: "up" },
      { label: "客服咨询", value: "本月5次咨询扩容", trend: "up" },
      { label: "合同到期", value: "剩余92天", trend: "down" },
    ],
    riskFactors: ["AI设计使用率89%，接近上限", "合同3个月内到期", "2025年曾中断续约"],
    opportunities: ["紧急扩容AI设计额度", "提前续约锁定优惠价", "追加智能导购高级版"],
    lastLoginDays: 1, activeUsers: 128, totalUsers: 150, avgSessionMinutes: 52,
  },
  acc3: {
    healthScore: 91, healthLevel: "excellent",
    usageTrend: [
      { month: "2025-10", rate: 0 }, { month: "2025-11", rate: 0 }, { month: "2025-12", rate: 0 },
      { month: "2026-01", rate: 8 }, { month: "2026-02", rate: 15 }, { month: "2026-03", rate: 18 },
    ],
    renewalRate: 100,
    renewalHistory: [{ year: "2026", renewed: true, amount: 76000 }],
    intentScore: 88,
    intentSignals: [
      { label: "功能使用频率", value: "中频（日均25次）", trend: "up" },
      { label: "新功能试用", value: "已体验5个Beta功能", trend: "up" },
      { label: "培训参与", value: "参加2次线上培训", trend: "up" },
      { label: "合同到期", value: "剩余355天", trend: "stable" },
    ],
    riskFactors: [],
    opportunities: ["新客户，关注首月体验", "推荐精准客资高级版"],
    lastLoginDays: 2, activeUsers: 18, totalUsers: 30, avgSessionMinutes: 28,
  },
  acc4: {
    healthScore: 35, healthLevel: "critical",
    usageTrend: [
      { month: "2025-10", rate: 22 }, { month: "2025-11", rate: 18 }, { month: "2025-12", rate: 12 },
      { month: "2026-01", rate: 8 }, { month: "2026-02", rate: 6 }, { month: "2026-03", rate: 6 },
    ],
    renewalRate: 50,
    renewalHistory: [
      { year: "2025", renewed: true, amount: 15000 },
      { year: "2026", renewed: false, amount: 0 },
    ],
    intentScore: 22,
    intentSignals: [
      { label: "功能使用频率", value: "极低频（日均3次）", trend: "down" },
      { label: "最近登录", value: "15天前", trend: "down" },
      { label: "客服咨询", value: "无近期咨询", trend: "stable" },
      { label: "合同到期", value: "已过期", trend: "down" },
    ],
    riskFactors: ["使用率持续下降", "15天未登录", "免费版用户，付费转化低", "合同已过期未续约"],
    opportunities: ["安排客户成功回访", "提供限时升级优惠"],
    lastLoginDays: 15, activeUsers: 2, totalUsers: 8, avgSessionMinutes: 5,
  },
  acc5: {
    healthScore: 65, healthLevel: "good",
    usageTrend: [
      { month: "2025-10", rate: 0 }, { month: "2025-11", rate: 0 }, { month: "2025-12", rate: 0 },
      { month: "2026-01", rate: 0 }, { month: "2026-02", rate: 0 }, { month: "2026-03", rate: 8 },
    ],
    renewalRate: 100,
    renewalHistory: [{ year: "2026", renewed: true, amount: 99 }],
    intentScore: 45,
    intentSignals: [
      { label: "功能使用频率", value: "低频（日均8次）", trend: "stable" },
      { label: "新功能试用", value: "未试用Beta功能", trend: "stable" },
      { label: "合同到期", value: "剩余360天", trend: "stable" },
    ],
    riskFactors: ["C端个人用户，留存风险较高"],
    opportunities: ["推荐基础会员升级", "发送功能引导邮件"],
    lastLoginDays: 3, activeUsers: 1, totalUsers: 1, avgSessionMinutes: 12,
  },
};

export function getAccountHealth(accId: string): AccountHealthMetrics {
  return HEALTH_DATA[accId] || {
    healthScore: 50, healthLevel: "good" as const,
    usageTrend: [], renewalRate: 0, renewalHistory: [],
    intentScore: 50, intentSignals: [], riskFactors: [], opportunities: [],
    lastLoginDays: 0, activeUsers: 0, totalUsers: 0, avgSessionMinutes: 0,
  };
}

/* ── Helpers ── */
export const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "启用", className: "badge-active" },
  inactive: { label: "停用", className: "badge-inactive" },
  on_sale: { label: "上架", className: "badge-active" },
  off_sale: { label: "下架", className: "badge-inactive" },
};

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
export const getOrdersByCustomer = (custId: string) => orderData.filter((o) => o.customerId === custId);
export const getAccountsByCustomer = (custId: string) => accountData.filter((a) => a.customerId === custId);
export const getOrder = (id: string) => orderData.find((o) => o.id === id);
export const getAccount = (id: string) => accountData.find((a) => a.id === id);
/** 根据应用ID筛选订单（只要订单中有任一商品属于该应用即匹配） */
export const getOrdersByApp = (appId: string) => orderData.filter((o) => getOrderAppIds(o).includes(appId));
