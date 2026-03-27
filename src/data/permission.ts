// =============================================
// 权限管理数据模型 — 基于 PRD 架构设计
// 菜单管理 · 角色管理 · 策略管理
// =============================================

// ============ 菜单体系 ============

export type MenuType = "basic" | "incremental" | "platform";
export type RoleType = "enterprise" | "platform";

export interface MenuItem {
  id: string;
  name: string;
  code: string;           // 唯一标识码
  groupType: "main" | "base" | "personal"; // 菜单分组
  level: number;          // 层级 1/2/3
  parentId: string | null;
  icon?: string;
  path?: string;
  sort: number;
  status: "active" | "inactive";
  // 产品属性
  products: string[];     // 关联产品代码
  menuType: MenuType;     // basic / incremental / platform
  // 权益要求（增量菜单）
  requiredEntitlement?: string;
  // 企业属性要求
  enterpriseRequirements?: {
    brandRelationship?: "own" | "agent" | null;
    supplierStatus?: boolean | null;
    enterpriseType?: string[] | null;
  };
  roleType: RoleType;     // enterprise / platform
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 产品定义
export const PRODUCTS = [
  { code: "domestic_3d", name: "国内3D工具", icon: "🏠" },
  { code: "international_3d", name: "国际3D工具", icon: "🌍" },
  { code: "smart_guide", name: "智能导购", icon: "🛒" },
  { code: "precision_marketing", name: "精准营销", icon: "📊" },
  { code: "ai_designer_app", name: "AI设计家App", icon: "🤖" },
];

export const MENU_TYPE_MAP: Record<MenuType, { label: string; className: string }> = {
  basic: { label: "基础菜单", className: "badge-active" },
  incremental: { label: "增量菜单", className: "badge-warning" },
  platform: { label: "平台菜单", className: "badge-info" },
};

export const ROLE_TYPE_MAP: Record<RoleType, { label: string; className: string }> = {
  enterprise: { label: "企业角色", className: "badge-active" },
  platform: { label: "平台角色", className: "badge-info" },
};

// 菜单数据 — 基于 PRD 菜单授权关系梳理
export const menuData: MenuItem[] = [
  // ===== 权限管理（平台菜单）=====
  { id: "m1", name: "权限管理", code: "permission", groupType: "main", level: 1, parentId: null, sort: 1, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m1-1", name: "菜单管理", code: "permission.menu", groupType: "main", level: 2, parentId: "m1", sort: 1, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m1-2", name: "策略管理", code: "permission.policy", groupType: "main", level: 2, parentId: "m1", sort: 2, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m1-3", name: "角色管理", code: "permission.role", groupType: "main", level: 2, parentId: "m1", sort: 3, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 企业管理（通用基础）=====
  { id: "m2", name: "企业管理", code: "enterprise", groupType: "main", level: 1, parentId: null, sort: 2, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m2-1", name: "企业管理", code: "enterprise.list", groupType: "main", level: 2, parentId: "m2", sort: 1, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m2-2", name: "人员管理", code: "enterprise.staff", groupType: "main", level: 2, parentId: "m2", sort: 2, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 权益管理（平台菜单）=====
  { id: "m3", name: "权益管理", code: "entitlement", groupType: "main", level: 1, parentId: null, sort: 3, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m3-1", name: "权益包管理", code: "entitlement.package", groupType: "main", level: 2, parentId: "m3", sort: 1, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m3-2", name: "权益管理", code: "entitlement.manage", groupType: "main", level: 2, parentId: "m3", sort: 2, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 品牌管理（通用基础，受品牌关系影响）=====
  { id: "m4", name: "品牌管理", code: "brand", groupType: "main", level: 1, parentId: null, sort: 4, status: "active", products: [], menuType: "basic", roleType: "enterprise", enterpriseRequirements: { brandRelationship: "own" }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 属性管理 / 类目管理（平台菜单）=====
  { id: "m5", name: "属性管理", code: "attribute", groupType: "main", level: 1, parentId: null, sort: 5, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m6", name: "类目管理", code: "category", groupType: "main", level: 1, parentId: null, sort: 6, status: "active", products: [], menuType: "platform", roleType: "platform", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 素材管理 =====
  { id: "m7", name: "素材管理", code: "material", groupType: "main", level: 1, parentId: null, sort: 7, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-1", name: "平台素材管理", code: "material.platform", groupType: "main", level: 2, parentId: "m7", sort: 1, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-1-1", name: "模型管理", code: "material.platform.model", groupType: "main", level: 3, parentId: "m7-1", sort: 1, status: "active", products: [], menuType: "basic", roleType: "enterprise", enterpriseRequirements: { brandRelationship: "own" }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-1-2", name: "材质管理", code: "material.platform.texture", groupType: "main", level: 3, parentId: "m7-1", sort: 2, status: "active", products: [], menuType: "basic", roleType: "enterprise", enterpriseRequirements: { brandRelationship: "own" }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-2", name: "企业素材管理", code: "material.enterprise", groupType: "main", level: 2, parentId: "m7", sort: 2, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-2-1", name: "模型管理", code: "material.enterprise.model", groupType: "main", level: 3, parentId: "m7-2", sort: 1, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-2-2", name: "材质管理", code: "material.enterprise.texture", groupType: "main", level: 3, parentId: "m7-2", sort: 2, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 商品管理（受供应链影响）=====
  { id: "m8", name: "商品管理", code: "product", groupType: "main", level: 1, parentId: null, sort: 8, status: "active", products: [], menuType: "basic", roleType: "enterprise", enterpriseRequirements: { supplierStatus: true }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 授权管理 =====
  { id: "m9", name: "授权管理", code: "authorization", groupType: "main", level: 1, parentId: null, sort: 9, status: "active", products: ["domestic_3d", "smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m9-1", name: "授权管理", code: "authorization.manage", groupType: "main", level: 2, parentId: "m9", sort: 1, status: "active", products: ["domestic_3d", "smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m9-2", name: "授权申请管理", code: "authorization.apply", groupType: "main", level: 2, parentId: "m9", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 方案管理 =====
  { id: "m10", name: "方案管理", code: "plan", groupType: "main", level: 1, parentId: null, sort: 10, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m10-1", name: "方案管理", code: "plan.manage", groupType: "main", level: 2, parentId: "m10", sort: 1, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m10-2", name: "智能案例管理", code: "plan.case", groupType: "main", level: 2, parentId: "m10", sort: 2, status: "active", products: [], menuType: "basic", roleType: "platform", remark: "仅平台可见", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 前台类目管理（按产品区分）=====
  { id: "m11", name: "前台类目管理", code: "front_category", groupType: "main", level: 1, parentId: null, sort: 11, status: "active", products: ["domestic_3d", "international_3d", "smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m11-1", name: "国内展示目录", code: "front_category.domestic", groupType: "main", level: 2, parentId: "m11", sort: 1, status: "active", products: ["domestic_3d"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m11-2", name: "国际展示目录", code: "front_category.international", groupType: "main", level: 2, parentId: "m11", sort: 2, status: "active", products: ["international_3d"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m11-3", name: "智能导购展示目录", code: "front_category.smart_guide", groupType: "main", level: 2, parentId: "m11", sort: 3, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 内容管理 =====
  { id: "m12", name: "内容管理", code: "content", groupType: "main", level: 1, parentId: null, sort: 12, status: "active", products: ["smart_guide", "domestic_3d", "international_3d"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-1", name: "内容模版管理", code: "content.template", groupType: "main", level: 2, parentId: "m12", sort: 1, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-2", name: "内容管理", code: "content.manage", groupType: "main", level: 2, parentId: "m12", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-3", name: "全景图管理", code: "content.panorama", groupType: "main", level: 2, parentId: "m12", sort: 3, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-4", name: "3D爆品棚拍", code: "content.3d_shooting", groupType: "main", level: 2, parentId: "m12", sort: 4, status: "active", products: ["domestic_3d", "international_3d"], menuType: "incremental", requiredEntitlement: "3d_product_shooting", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 营销管理 =====
  { id: "m13", name: "营销管理", code: "marketing", groupType: "main", level: 1, parentId: null, sort: 13, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1", name: "资源位管理", code: "marketing.resource", groupType: "main", level: 2, parentId: "m13", sort: 1, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1-1", name: "广告位管理", code: "marketing.resource.ads", groupType: "main", level: 3, parentId: "m13-1", sort: 1, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1-2", name: "选品池管理", code: "marketing.resource.selection", groupType: "main", level: 3, parentId: "m13-1", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1-3", name: "内容池管理", code: "marketing.resource.content_pool", groupType: "main", level: 3, parentId: "m13-1", sort: 3, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-2", name: "布局管理", code: "marketing.layout", groupType: "main", level: 2, parentId: "m13", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-3", name: "优惠管理", code: "marketing.coupon", groupType: "main", level: 2, parentId: "m13", sort: 3, status: "active", products: ["smart_guide"], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 客户管理 =====
  { id: "m14", name: "客户管理", code: "customer", groupType: "main", level: 1, parentId: null, sort: 14, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 数据看板 =====
  { id: "m15", name: "数据看版", code: "dashboard", groupType: "main", level: 1, parentId: null, sort: 15, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // ===== 个人中心 =====
  { id: "m16", name: "个人中心", code: "personal", groupType: "personal", level: 1, parentId: null, sort: 16, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m16-1", name: "权益管理", code: "personal.entitlement", groupType: "personal", level: 2, parentId: "m16", sort: 1, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m16-2", name: "个人信息", code: "personal.info", groupType: "personal", level: 2, parentId: "m16", sort: 2, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m16-3", name: "我的上传", code: "personal.upload", groupType: "personal", level: 2, parentId: "m16", sort: 3, status: "active", products: [], menuType: "basic", roleType: "enterprise", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
];

// ============ 角色体系 ============

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "audit" | "configure";

export const PERMISSION_ACTIONS: { value: PermissionAction; label: string }[] = [
  { value: "view", label: "查看" },
  { value: "create", label: "创建" },
  { value: "edit", label: "编辑" },
  { value: "delete", label: "删除" },
  { value: "export", label: "导出" },
  { value: "audit", label: "审核" },
  { value: "configure", label: "配置" },
];

export interface Role {
  id: string;
  name: string;
  code: string;
  roleType: RoleType;
  enterpriseId?: string;     // 企业角色必填
  enterpriseName?: string;
  description: string;
  products: string[];        // 产品权限
  menuIds: string[];         // 菜单权限
  permissions: PermissionAction[];  // 操作权限
  userCount: number;         // 已分配用户数
  status: "active" | "inactive";
  isSystem: boolean;         // 是否系统预设
  createdAt: string;
  updatedAt: string;
}

export const roleData: Role[] = [
  // 平台角色
  {
    id: "role1", name: "平台超级管理员", code: "platform_super_admin", roleType: "platform",
    description: "拥有平台所有功能的最高权限，包括权限管理、权益管理、菜单管理等平台治理能力",
    products: ["domestic_3d", "international_3d", "smart_guide", "precision_marketing", "ai_designer_app"],
    menuIds: menuData.map(m => m.id), // 全部菜单
    permissions: ["view", "create", "edit", "delete", "export", "audit", "configure"],
    userCount: 2, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role2", name: "平台运营管理员", code: "platform_ops_admin", roleType: "platform",
    description: "负责企业入驻审核、权益发放、订单管理等日常运营工作",
    products: ["domestic_3d", "international_3d", "smart_guide"],
    menuIds: ["m2", "m2-1", "m2-2", "m3", "m3-1", "m3-2", "m4", "m14", "m15"],
    permissions: ["view", "create", "edit", "audit", "export"],
    userCount: 5, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role3", name: "平台内容运营", code: "platform_content_ops", roleType: "platform",
    description: "管理平台素材、内容模版和营销活动",
    products: ["domestic_3d", "international_3d", "smart_guide"],
    menuIds: ["m7", "m7-1", "m7-1-1", "m7-1-2", "m7-2", "m7-2-1", "m7-2-2", "m12", "m12-1", "m12-2", "m12-3", "m12-4", "m13", "m13-1", "m13-2", "m13-3"],
    permissions: ["view", "create", "edit", "delete"],
    userCount: 3, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },

  // 企业角色
  {
    id: "role4", name: "企业管理员", code: "enterprise_admin", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "企业内最高权限角色，可管理企业信息、人员、产品使用和权益配置",
    products: ["domestic_3d", "international_3d", "smart_guide"],
    menuIds: ["m2", "m2-1", "m2-2", "m4", "m7", "m7-2", "m7-2-1", "m7-2-2", "m8", "m9", "m9-1", "m10", "m10-1", "m11", "m11-1", "m11-2", "m11-3", "m12", "m12-1", "m12-2", "m12-3", "m13", "m13-1", "m13-2", "m13-3", "m14", "m15", "m16", "m16-1", "m16-2", "m16-3"],
    permissions: ["view", "create", "edit", "delete", "export", "configure"],
    userCount: 12, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role5", name: "设计师", code: "designer", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "使用3D工具进行方案设计，管理个人素材和方案",
    products: ["domestic_3d"],
    menuIds: ["m7-2", "m7-2-1", "m7-2-2", "m10", "m10-1", "m12-3", "m16", "m16-1", "m16-2", "m16-3"],
    permissions: ["view", "create", "edit"],
    userCount: 45, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role6", name: "运营人员", code: "operator", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "管理企业内容、营销活动和客户关系",
    products: ["smart_guide"],
    menuIds: ["m12", "m12-1", "m12-2", "m13", "m13-1", "m13-1-1", "m13-1-2", "m13-1-3", "m13-2", "m13-3", "m14", "m15"],
    permissions: ["view", "create", "edit", "export"],
    userCount: 18, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role7", name: "门店店长", code: "store_manager", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "管理门店信息、人员和日常业务运营",
    products: ["domestic_3d", "smart_guide"],
    menuIds: ["m2-1", "m2-2", "m10", "m10-1", "m14", "m15", "m16", "m16-1", "m16-2"],
    permissions: ["view", "create", "edit"],
    userCount: 30, status: "active", isSystem: false,
    createdAt: "2026-02-15 00:00:00", updatedAt: "2026-03-20 00:00:00",
  },
];

// ============ 策略体系 ============

export type PolicyType = "product_access" | "menu_visibility" | "asset_permission" | "entitlement_check";
export type PolicyConditionField = "enabled_products" | "brand_relationship" | "supplier_status" | "enterprise_type" | "entitlement" | "role_type";
export type PolicyOperator = "equals" | "contains" | "not_equals" | "is_true" | "is_false" | "in";

export interface PolicyCondition {
  field: PolicyConditionField;
  operator: PolicyOperator;
  value: string | string[] | boolean;
  label: string;
}

export interface Policy {
  id: string;
  name: string;
  code: string;
  type: PolicyType;
  description: string;
  conditions: PolicyCondition[];
  effect: "allow" | "deny";
  priority: number;
  targetMenuIds?: string[];
  targetProducts?: string[];
  status: "active" | "inactive";
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export const POLICY_TYPE_MAP: Record<PolicyType, { label: string; className: string }> = {
  product_access: { label: "产品准入", className: "badge-info" },
  menu_visibility: { label: "菜单可见性", className: "badge-active" },
  asset_permission: { label: "资产权限", className: "badge-warning" },
  entitlement_check: { label: "权益校验", className: "badge-muted" },
};

export const POLICY_CONDITION_LABELS: Record<PolicyConditionField, string> = {
  enabled_products: "启用产品",
  brand_relationship: "品牌关系",
  supplier_status: "供应链状态",
  enterprise_type: "企业类型",
  entitlement: "权益配置",
  role_type: "角色类型",
};

export const policyData: Policy[] = [
  {
    id: "pol1", name: "产品主开关策略", code: "product_main_switch",
    type: "product_access",
    description: "企业必须启用对应产品后，才能进入该产品的权限空间。未启用产品的所有菜单、能力、权益均不可见",
    conditions: [{ field: "enabled_products", operator: "contains", value: "target_product", label: "企业已启用目标产品" }],
    effect: "allow", priority: 100, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "pol2", name: "基础菜单可见策略", code: "basic_menu_visible",
    type: "menu_visibility",
    description: "企业启用产品后，该产品关联的所有基础菜单自动进入可见池",
    conditions: [
      { field: "enabled_products", operator: "contains", value: "menu_products", label: "企业启用了菜单关联的产品" },
    ],
    effect: "allow", priority: 90, status: "active", isSystem: true,
    targetMenuIds: menuData.filter(m => m.menuType === "basic").map(m => m.id),
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "pol3", name: "增量菜单权益校验", code: "incremental_menu_check",
    type: "menu_visibility",
    description: "增量菜单除需启用产品外，还需企业具备对应权益才可见",
    conditions: [
      { field: "enabled_products", operator: "contains", value: "menu_products", label: "企业启用了菜单关联的产品" },
      { field: "entitlement", operator: "equals", value: "required_entitlement", label: "企业具备菜单要求的权益" },
    ],
    effect: "allow", priority: 80, status: "active", isSystem: true,
    targetMenuIds: menuData.filter(m => m.menuType === "incremental").map(m => m.id),
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "pol4", name: "平台菜单隔离策略", code: "platform_menu_isolation",
    type: "menu_visibility",
    description: "平台菜单仅对平台角色可见，企业角色无法访问任何平台治理功能",
    conditions: [
      { field: "role_type", operator: "equals", value: "platform", label: "用户拥有平台角色" },
    ],
    effect: "allow", priority: 95, status: "active", isSystem: true,
    targetMenuIds: menuData.filter(m => m.menuType === "platform").map(m => m.id),
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "pol5", name: "品牌关系资产策略", code: "brand_asset_policy",
    type: "asset_permission",
    description: "品牌关系仅影响公有资产的上传权限：拥有品牌可上传公有模型，代理品牌仅可使用，无关品牌不可操作公有模型",
    conditions: [
      { field: "brand_relationship", operator: "equals", value: "own", label: "企业拥有品牌关系" },
    ],
    effect: "allow", priority: 70, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "pol6", name: "供应链商品准入策略", code: "supply_chain_product",
    type: "asset_permission",
    description: "企业加入供应链后方可使用商品管理功能，否则商品管理菜单不可见",
    conditions: [
      { field: "supplier_status", operator: "is_true", value: true, label: "企业已加入供应链" },
    ],
    effect: "allow", priority: 60, status: "active", isSystem: true,
    targetMenuIds: ["m8"],
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "pol7", name: "3D爆品棚拍权益检查", code: "3d_shooting_entitlement",
    type: "entitlement_check",
    description: "3D爆品棚拍功能需要企业购买对应权益包后才可使用",
    conditions: [
      { field: "enabled_products", operator: "in", value: ["domestic_3d", "international_3d"], label: "企业启用了3D产品" },
      { field: "entitlement", operator: "equals", value: "3d_product_shooting", label: "企业具备棚拍权益" },
    ],
    effect: "allow", priority: 50, status: "active", isSystem: true,
    targetMenuIds: ["m12-4"],
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
];

// ============ 工具函数 ============

export function getMenuChildren(parentId: string | null): MenuItem[] {
  return menuData.filter(m => m.parentId === parentId).sort((a, b) => a.sort - b.sort);
}

export function getMenuPath(menuId: string): MenuItem[] {
  const path: MenuItem[] = [];
  let current = menuData.find(m => m.id === menuId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? menuData.find(m => m.id === current!.parentId) : undefined;
  }
  return path;
}

export function getRoleMenus(roleId: string): MenuItem[] {
  const role = roleData.find(r => r.id === roleId);
  if (!role) return [];
  return menuData.filter(m => role.menuIds.includes(m.id));
}

export function getMenuProductNames(menu: MenuItem): string[] {
  if (!menu.products.length) return ["通用"];
  return menu.products.map(code => PRODUCTS.find(p => p.code === code)?.name || code);
}
