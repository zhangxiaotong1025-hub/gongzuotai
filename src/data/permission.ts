// =============================================
// 权限管理数据模型 — 基于 PRD 架构设计
// 菜单管理(模块) · 资源管理(按钮/接口/数据) · 角色管理
// =============================================

// ============ 菜单体系(模块) ============

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
  roleTypes: RoleType[];  // 可见角色类型（多选）
  remark?: string;
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];  // 用于树形展示
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

export const GROUP_TYPE_MAP: Record<string, string> = {
  main: "主导航",
  base: "基础",
  personal: "个人中心",
};

// 菜单数据
export const menuData: MenuItem[] = [
  { id: "m1", name: "权限管理", code: "permission", groupType: "main", level: 1, parentId: null, sort: 1, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m1-1", name: "菜单管理", code: "permission.menu", groupType: "main", level: 2, parentId: "m1", sort: 1, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m1-2", name: "资源管理", code: "permission.resource", groupType: "main", level: 2, parentId: "m1", sort: 2, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m1-3", name: "角色管理", code: "permission.role", groupType: "main", level: 2, parentId: "m1", sort: 3, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m2", name: "企业管理", code: "enterprise", groupType: "main", level: 1, parentId: null, sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m2-1", name: "企业管理", code: "enterprise.list", groupType: "main", level: 2, parentId: "m2", sort: 1, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m2-2", name: "人员管理", code: "enterprise.staff", groupType: "main", level: 2, parentId: "m2", sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m3", name: "权益管理", code: "entitlement", groupType: "main", level: 1, parentId: null, sort: 3, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m3-1", name: "权益包管理", code: "entitlement.package", groupType: "main", level: 2, parentId: "m3", sort: 1, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m3-2", name: "权益管理", code: "entitlement.manage", groupType: "main", level: 2, parentId: "m3", sort: 2, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m4", name: "品牌管理", code: "brand", groupType: "main", level: 1, parentId: null, sort: 4, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], enterpriseRequirements: { brandRelationship: "own" }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m5", name: "属性管理", code: "attribute", groupType: "main", level: 1, parentId: null, sort: 5, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m6", name: "类目管理", code: "category", groupType: "main", level: 1, parentId: null, sort: 6, status: "active", products: [], menuType: "platform", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m7", name: "素材管理", code: "material", groupType: "main", level: 1, parentId: null, sort: 7, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-1", name: "平台素材管理", code: "material.platform", groupType: "main", level: 2, parentId: "m7", sort: 1, status: "active", products: [], menuType: "basic", roleTypes: ["platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-1-1", name: "模型管理", code: "material.platform.model", groupType: "main", level: 3, parentId: "m7-1", sort: 1, status: "active", products: [], menuType: "basic", roleTypes: ["platform"], enterpriseRequirements: { brandRelationship: "own" }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-1-2", name: "材质管理", code: "material.platform.texture", groupType: "main", level: 3, parentId: "m7-1", sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["platform"], enterpriseRequirements: { brandRelationship: "own" }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-2", name: "企业素材管理", code: "material.enterprise", groupType: "main", level: 2, parentId: "m7", sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-2-1", name: "模型管理", code: "material.enterprise.model", groupType: "main", level: 3, parentId: "m7-2", sort: 1, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m7-2-2", name: "材质管理", code: "material.enterprise.texture", groupType: "main", level: 3, parentId: "m7-2", sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m8", name: "商品管理", code: "product", groupType: "main", level: 1, parentId: null, sort: 8, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], enterpriseRequirements: { supplierStatus: true }, createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m9", name: "授权管理", code: "authorization", groupType: "main", level: 1, parentId: null, sort: 9, status: "active", products: ["domestic_3d", "smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m9-1", name: "授权管理", code: "authorization.manage", groupType: "main", level: 2, parentId: "m9", sort: 1, status: "active", products: ["domestic_3d", "smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m9-2", name: "授权申请管理", code: "authorization.apply", groupType: "main", level: 2, parentId: "m9", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m10", name: "方案管理", code: "plan", groupType: "main", level: 1, parentId: null, sort: 10, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m10-1", name: "方案管理", code: "plan.manage", groupType: "main", level: 2, parentId: "m10", sort: 1, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m10-2", name: "智能案例管理", code: "plan.case", groupType: "main", level: 2, parentId: "m10", sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["platform"], remark: "仅平台可见", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m11", name: "前台类目管理", code: "front_category", groupType: "main", level: 1, parentId: null, sort: 11, status: "active", products: ["domestic_3d", "international_3d", "smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m11-1", name: "国内展示目录", code: "front_category.domestic", groupType: "main", level: 2, parentId: "m11", sort: 1, status: "active", products: ["domestic_3d"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m11-2", name: "国际展示目录", code: "front_category.international", groupType: "main", level: 2, parentId: "m11", sort: 2, status: "active", products: ["international_3d"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m11-3", name: "智能导购展示目录", code: "front_category.smart_guide", groupType: "main", level: 2, parentId: "m11", sort: 3, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m12", name: "内容管理", code: "content", groupType: "main", level: 1, parentId: null, sort: 12, status: "active", products: ["smart_guide", "domestic_3d", "international_3d"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-1", name: "内容模版管理", code: "content.template", groupType: "main", level: 2, parentId: "m12", sort: 1, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-2", name: "内容管理", code: "content.manage", groupType: "main", level: 2, parentId: "m12", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-3", name: "全景图管理", code: "content.panorama", groupType: "main", level: 2, parentId: "m12", sort: 3, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m12-4", name: "3D爆品棚拍", code: "content.3d_shooting", groupType: "main", level: 2, parentId: "m12", sort: 4, status: "active", products: ["domestic_3d", "international_3d"], menuType: "incremental", requiredEntitlement: "3d_product_shooting", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m13", name: "营销管理", code: "marketing", groupType: "main", level: 1, parentId: null, sort: 13, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1", name: "资源位管理", code: "marketing.resource", groupType: "main", level: 2, parentId: "m13", sort: 1, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1-1", name: "广告位管理", code: "marketing.resource.ads", groupType: "main", level: 3, parentId: "m13-1", sort: 1, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1-2", name: "选品池管理", code: "marketing.resource.selection", groupType: "main", level: 3, parentId: "m13-1", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-1-3", name: "内容池管理", code: "marketing.resource.content_pool", groupType: "main", level: 3, parentId: "m13-1", sort: 3, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-2", name: "布局管理", code: "marketing.layout", groupType: "main", level: 2, parentId: "m13", sort: 2, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m13-3", name: "优惠管理", code: "marketing.coupon", groupType: "main", level: 2, parentId: "m13", sort: 3, status: "active", products: ["smart_guide"], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m14", name: "客户管理", code: "customer", groupType: "main", level: 1, parentId: null, sort: 14, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m15", name: "数据看版", code: "dashboard", groupType: "main", level: 1, parentId: null, sort: 15, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  { id: "m16", name: "个人中心", code: "personal", groupType: "personal", level: 1, parentId: null, sort: 16, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m16-1", name: "权益管理", code: "personal.entitlement", groupType: "personal", level: 2, parentId: "m16", sort: 1, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m16-2", name: "个人信息", code: "personal.info", groupType: "personal", level: 2, parentId: "m16", sort: 2, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise", "platform"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "m16-3", name: "我的上传", code: "personal.upload", groupType: "personal", level: 2, parentId: "m16", sort: 3, status: "active", products: [], menuType: "basic", roleTypes: ["enterprise"], createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
];

// ============ 资源体系(按钮/接口/数据) ============

export type ResourceType = "button" | "api" | "data";

export interface Resource {
  id: string;
  name: string;
  code: string;
  type: ResourceType;
  menuId: string;       // 所属菜单ID
  menuPath: string;     // 所属菜单路径（如"素材管理/企业素材管理"）
  status: "active" | "inactive";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const RESOURCE_TYPE_MAP: Record<ResourceType, { label: string; className: string }> = {
  button: { label: "按钮", className: "badge-info" },
  api: { label: "接口", className: "badge-active" },
  data: { label: "数据", className: "badge-warning" },
};

// 资源数据 — 按菜单组织
export const resourceData: Resource[] = [
  // 企业管理 > 企业管理
  { id: "res1", name: "新建企业", code: "enterprise.list.create", type: "button", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res2", name: "编辑企业", code: "enterprise.list.edit", type: "button", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res3", name: "审核企业", code: "enterprise.list.audit", type: "button", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res4", name: "停用企业", code: "enterprise.list.disable", type: "button", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res5", name: "导出企业", code: "enterprise.list.export", type: "button", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res6", name: "设置管理员", code: "enterprise.list.set_admin", type: "button", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  // 企业管理 > 企业管理 接口
  { id: "res7", name: "企业列表查询", code: "api.enterprise.list", type: "api", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res8", name: "企业详情查询", code: "api.enterprise.detail", type: "api", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res9", name: "企业创建接口", code: "api.enterprise.create", type: "api", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  // 企业管理 > 企业管理 数据
  { id: "res10", name: "全部企业数据", code: "data.enterprise.all", type: "data", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", description: "可查看所有企业数据", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res11", name: "本企业数据", code: "data.enterprise.own", type: "data", menuId: "m2-1", menuPath: "企业管理/企业管理", status: "active", description: "仅可查看本企业数据", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // 企业管理 > 人员管理
  { id: "res12", name: "添加人员", code: "enterprise.staff.create", type: "button", menuId: "m2-2", menuPath: "企业管理/人员管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res13", name: "编辑人员", code: "enterprise.staff.edit", type: "button", menuId: "m2-2", menuPath: "企业管理/人员管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res14", name: "停用人员", code: "enterprise.staff.disable", type: "button", menuId: "m2-2", menuPath: "企业管理/人员管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res15", name: "人员列表查询", code: "api.staff.list", type: "api", menuId: "m2-2", menuPath: "企业管理/人员管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // 素材管理 > 企业素材管理
  { id: "res16", name: "上传素材", code: "material.enterprise.upload", type: "button", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res17", name: "删除素材", code: "material.enterprise.delete", type: "button", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res18", name: "审核素材", code: "material.enterprise.audit", type: "button", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res19", name: "置顶素材", code: "material.enterprise.pin", type: "button", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res20", name: "素材列表查询", code: "api.material.enterprise.list", type: "api", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res21", name: "素材上传接口", code: "api.material.enterprise.upload", type: "api", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res22", name: "全部素材数据", code: "data.material.all", type: "data", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", description: "可查看所有素材", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res23", name: "个人素材数据", code: "data.material.own", type: "data", menuId: "m7-2", menuPath: "素材管理/企业素材管理", status: "active", description: "仅可查看本人上传素材", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // 权益管理
  { id: "res24", name: "创建权益包", code: "entitlement.package.create", type: "button", menuId: "m3-1", menuPath: "权益管理/权益包管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res25", name: "编辑权益包", code: "entitlement.package.edit", type: "button", menuId: "m3-1", menuPath: "权益管理/权益包管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res26", name: "发放权益", code: "entitlement.manage.grant", type: "button", menuId: "m3-2", menuPath: "权益管理/权益管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res27", name: "权益查询接口", code: "api.entitlement.query", type: "api", menuId: "m3-2", menuPath: "权益管理/权益管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // 内容管理
  { id: "res28", name: "创建内容", code: "content.manage.create", type: "button", menuId: "m12-2", menuPath: "内容管理/内容管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res29", name: "编辑内容", code: "content.manage.edit", type: "button", menuId: "m12-2", menuPath: "内容管理/内容管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res30", name: "删除内容", code: "content.manage.delete", type: "button", menuId: "m12-2", menuPath: "内容管理/内容管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res31", name: "审核内容", code: "content.manage.audit", type: "button", menuId: "m12-2", menuPath: "内容管理/内容管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res32", name: "内容查询接口", code: "api.content.list", type: "api", menuId: "m12-2", menuPath: "内容管理/内容管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },

  // 营销管理
  { id: "res33", name: "创建广告", code: "marketing.ads.create", type: "button", menuId: "m13-1-1", menuPath: "营销管理/资源位管理/广告位管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res34", name: "编辑广告", code: "marketing.ads.edit", type: "button", menuId: "m13-1-1", menuPath: "营销管理/资源位管理/广告位管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res35", name: "停用广告", code: "marketing.ads.disable", type: "button", menuId: "m13-1-1", menuPath: "营销管理/资源位管理/广告位管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
  { id: "res36", name: "广告查询接口", code: "api.marketing.ads.list", type: "api", menuId: "m13-1-1", menuPath: "营销管理/资源位管理/广告位管理", status: "active", createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00" },
];

// 获取菜单下的资源
export function getMenuResources(menuId: string, type?: ResourceType): Resource[] {
  return resourceData.filter(r => r.menuId === menuId && (!type || r.type === type));
}

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
  enterpriseId?: string;
  enterpriseName?: string;
  description: string;
  // 模块权限
  menuMode: "all" | "specified";
  menuIds: string[];         // menuMode为specified时有效
  // 资源权限
  resourceMode: "all" | "specified";
  buttonResourceIds: string[];  // 按钮资源ID列表
  apiResourceIds: string[];     // 接口资源ID列表
  dataResourceIds: string[];    // 数据资源ID列表
  // 兼容
  products: string[];
  permissions: PermissionAction[];
  userCount: number;
  status: "active" | "inactive";
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export const roleData: Role[] = [
  {
    id: "role1", name: "平台超级管理员", code: "platform_super_admin", roleType: "platform",
    description: "拥有平台所有功能的最高权限，包括权限管理、权益管理、菜单管理等平台治理能力",
    menuMode: "all", menuIds: [],
    resourceMode: "all", buttonResourceIds: [], apiResourceIds: [], dataResourceIds: [],
    products: ["domestic_3d", "international_3d", "smart_guide", "precision_marketing", "ai_designer_app"],
    permissions: ["view", "create", "edit", "delete", "export", "audit", "configure"],
    userCount: 2, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role2", name: "平台运营管理员", code: "platform_ops_admin", roleType: "platform",
    description: "负责企业入驻审核、权益发放、订单管理等日常运营工作",
    menuMode: "specified", menuIds: ["m2", "m2-1", "m2-2", "m3", "m3-1", "m3-2", "m4", "m14", "m15"],
    resourceMode: "specified",
    buttonResourceIds: ["res1", "res2", "res3", "res4", "res5", "res6", "res12", "res13", "res14", "res24", "res25", "res26"],
    apiResourceIds: ["res7", "res8", "res9", "res15", "res27"],
    dataResourceIds: ["res10"],
    products: ["domestic_3d", "international_3d", "smart_guide"],
    permissions: ["view", "create", "edit", "audit", "export"],
    userCount: 5, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role3", name: "平台内容运营", code: "platform_content_ops", roleType: "platform",
    description: "管理平台素材、内容模版和营销活动",
    menuMode: "specified", menuIds: ["m7", "m7-1", "m7-1-1", "m7-1-2", "m7-2", "m7-2-1", "m7-2-2", "m12", "m12-1", "m12-2", "m12-3", "m12-4", "m13", "m13-1", "m13-2", "m13-3"],
    resourceMode: "specified",
    buttonResourceIds: ["res16", "res17", "res18", "res19", "res28", "res29", "res30", "res31", "res33", "res34", "res35"],
    apiResourceIds: ["res20", "res21", "res32", "res36"],
    dataResourceIds: ["res22"],
    products: ["domestic_3d", "international_3d", "smart_guide"],
    permissions: ["view", "create", "edit", "delete"],
    userCount: 3, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role4", name: "企业管理员", code: "enterprise_admin", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "企业内最高权限角色，可管理企业信息、人员、产品使用和权益配置",
    menuMode: "specified", menuIds: ["m2", "m2-1", "m2-2", "m4", "m7", "m7-2", "m7-2-1", "m7-2-2", "m8", "m9", "m9-1", "m10", "m10-1", "m11", "m11-1", "m11-2", "m11-3", "m12", "m12-1", "m12-2", "m12-3", "m13", "m13-1", "m13-2", "m13-3", "m14", "m15", "m16", "m16-1", "m16-2", "m16-3"],
    resourceMode: "all", buttonResourceIds: [], apiResourceIds: [], dataResourceIds: [],
    products: ["domestic_3d", "international_3d", "smart_guide"],
    permissions: ["view", "create", "edit", "delete", "export", "configure"],
    userCount: 12, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role5", name: "设计师", code: "designer", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "使用3D工具进行方案设计，管理个人素材和方案",
    menuMode: "specified", menuIds: ["m7-2", "m7-2-1", "m7-2-2", "m10", "m10-1", "m12-3", "m16", "m16-1", "m16-2", "m16-3"],
    resourceMode: "specified",
    buttonResourceIds: ["res16"],
    apiResourceIds: ["res20", "res21"],
    dataResourceIds: ["res23"],
    products: ["domestic_3d"],
    permissions: ["view", "create", "edit"],
    userCount: 45, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role6", name: "运营人员", code: "operator", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "管理企业内容、营销活动和客户关系",
    menuMode: "specified", menuIds: ["m12", "m12-1", "m12-2", "m13", "m13-1", "m13-1-1", "m13-1-2", "m13-1-3", "m13-2", "m13-3", "m14", "m15"],
    resourceMode: "specified",
    buttonResourceIds: ["res28", "res29", "res30", "res33", "res34"],
    apiResourceIds: ["res32", "res36"],
    dataResourceIds: [],
    products: ["smart_guide"],
    permissions: ["view", "create", "edit", "export"],
    userCount: 18, status: "active", isSystem: true,
    createdAt: "2026-01-01 00:00:00", updatedAt: "2026-03-01 00:00:00",
  },
  {
    id: "role7", name: "门店店长", code: "store_manager", roleType: "enterprise",
    enterpriseId: "ent_default", enterpriseName: "（模板角色）",
    description: "管理门店信息、人员和日常业务运营",
    menuMode: "specified", menuIds: ["m2-1", "m2-2", "m10", "m10-1", "m14", "m15", "m16", "m16-1", "m16-2"],
    resourceMode: "specified",
    buttonResourceIds: ["res2", "res12", "res13"],
    apiResourceIds: ["res7", "res8", "res15"],
    dataResourceIds: ["res11"],
    products: ["domestic_3d", "smart_guide"],
    permissions: ["view", "create", "edit"],
    userCount: 30, status: "active", isSystem: false,
    createdAt: "2026-02-15 00:00:00", updatedAt: "2026-03-20 00:00:00",
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
  if (role.menuMode === "all") return menuData;
  return menuData.filter(m => role.menuIds.includes(m.id));
}

export function getMenuProductNames(menu: MenuItem): string[] {
  if (!menu.products.length) return ["通用"];
  return menu.products.map(code => PRODUCTS.find(p => p.code === code)?.name || code);
}

export function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const map = new Map<string, MenuItem>();
  const roots: MenuItem[] = [];
  items.forEach(item => map.set(item.id, { ...item, children: [] }));
  items.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots.sort((a, b) => a.sort - b.sort);
}

export function flattenMenuTree(tree: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];
  const walk = (items: MenuItem[]) => {
    for (const item of items.sort((a, b) => a.sort - b.sort)) {
      result.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(tree);
  return result;
}

export function collectMenuIds(menuId: string): string[] {
  const ids = [menuId];
  const children = getMenuChildren(menuId);
  children.forEach(c => ids.push(...collectMenuIds(c.id)));
  return ids;
}

// 获取角色的有效资源数量
export function getRoleResourceCount(role: Role): { buttons: number; apis: number; data: number } {
  if (role.resourceMode === "all") {
    const buttons = resourceData.filter(r => r.type === "button").length;
    const apis = resourceData.filter(r => r.type === "api").length;
    const data = resourceData.filter(r => r.type === "data").length;
    return { buttons, apis, data };
  }
  return {
    buttons: role.buttonResourceIds.length,
    apis: role.apiResourceIds.length,
    data: role.dataResourceIds.length,
  };
}
