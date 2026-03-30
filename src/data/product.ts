/* ══════════════════════════════════════════════════
   商品管理数据模型 — SPU / SKU 两层架构
   
   商品大类：供应链商品 / 企业商品 / 私有商品
   审核状态：待审核 / 审核通过 / 审核未通过
   业务状态（仅审核通过后）：待上架 / 已上架 / 已下架
   
   核心原则：应用企业、关联模型、状态均为 SKU 级别
   SPU 的相关数据由 SKU 聚合得出
   ══════════════════════════════════════════════════ */

import sofaNordic from "@/assets/products/sofa-nordic.jpg";
import sofaBlue from "@/assets/products/sofa-blue.jpg";
import sofaGrey from "@/assets/products/sofa-grey.jpg";
import livingroomSet from "@/assets/products/livingroom-set.jpg";
import bedLuxury from "@/assets/products/bed-luxury.jpg";
import bedBlack from "@/assets/products/bed-black.jpg";
import wardrobe from "@/assets/products/wardrobe.jpg";
import wardrobeOak from "@/assets/products/wardrobe-oak.jpg";
import coffeeTable from "@/assets/products/coffee-table.jpg";
import coffeeTableWood from "@/assets/products/coffee-table-wood.jpg";
import sceneLivingRoom from "@/assets/products/scene-living-room.jpg";
import sceneBedroom from "@/assets/products/scene-bedroom.jpg";
import detailFabric from "@/assets/products/detail-fabric.jpg";
import detailWoodJoint from "@/assets/products/detail-wood-joint.jpg";

export type ProductCategory = "SUPPLY_CHAIN" | "ENTERPRISE" | "PRIVATE";
export type ProductAuditStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProductShelfStatus = "PENDING_SHELF" | "ON_SHELF" | "OFF_SHELF";

export const categoryLabel: Record<ProductCategory, string> = {
  SUPPLY_CHAIN: "供应链商品",
  ENTERPRISE: "企业商品",
  PRIVATE: "私有商品",
};

export const auditLabel: Record<ProductAuditStatus, string> = { PENDING: "待审核", APPROVED: "审核通过", REJECTED: "审核未通过" };
export const auditBadge: Record<ProductAuditStatus, string> = { PENDING: "badge-warning", APPROVED: "badge-active", REJECTED: "badge-danger" };
export const shelfLabel: Record<ProductShelfStatus, string> = { PENDING_SHELF: "待上架", ON_SHELF: "已上架", OFF_SHELF: "已下架" };
export const shelfBadge: Record<ProductShelfStatus, string> = { PENDING_SHELF: "badge-muted", ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };

export interface AppliedEnterprise {
  id: string;
  name: string;
  type: string;
}

export interface ProductSku {
  id: string;
  productSpuId: string;
  productSkuCode: string;
  productSkuName: string;
  thumbnailUrl: string;
  /* ── 关联模型 (SKU级) ── */
  modelSkuId: string;
  modelSkuName: string;
  modelSpuId: string;
  modelSpuName: string;
  /* ── 应用企业 (SKU级) ── */
  appliedEnterprises: AppliedEnterprise[];
  paramSnapshot: Record<string, string>;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  barcode?: string;
  weight?: number;
  /* ── 状态 (SKU级) ── */
  auditStatus: ProductAuditStatus;
  shelfStatus: ProductShelfStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  url: string;
  label?: string;
}

export interface ProductSpu {
  id: string;
  productSpuCode: string;
  productSpuName: string;
  thumbnailUrl: string;
  /** 商品展示图（主图轮播） */
  displayImages: string[];
  /** 详情图（细节特写） */
  detailImages: ProductMedia[];
  /** 场景图（空间效果图） */
  sceneImages: ProductMedia[];
  /** 视频素材 */
  videos: ProductMedia[];
  /** SPU 级关联模型（方便 SKU 快速设置） */
  modelSpuId?: string;
  modelSpuName?: string;
  category: ProductCategory;
  ownerEnterpriseName: string;
  brandName: string;
  seriesName: string;
  backendCategoryName: string;
  frontendCategoryName: string;
  description: string;
  sellingPoints: string[];
  commercialAttrs: {
    origin: string;
    warranty: string;
    certifications: string[];
    deliveryCycle: string;
    material?: string;
    dimensions?: string;
  };
  createdAt: string;
  updatedAt: string;
  skus: ProductSku[];
}

// ── Computed helpers (SPU 聚合 SKU) ──
export function getSpuPriceRange(spu: ProductSpu): { min: number; max: number } {
  if (spu.skus.length === 0) return { min: 0, max: 0 };
  const prices = spu.skus.map((s) => s.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function getSpuTotalStock(spu: ProductSpu): number {
  return spu.skus.reduce((sum, s) => sum + s.stockQuantity, 0);
}

export function getSpuRelatedModelCount(spu: ProductSpu): number {
  return new Set(spu.skus.map((s) => s.modelSpuId)).size;
}

/** 聚合所有 SKU 的应用企业（去重） */
export function getSpuAppliedEnterprises(spu: ProductSpu): AppliedEnterprise[] {
  const map = new Map<string, AppliedEnterprise>();
  spu.skus.forEach((sku) => (sku.appliedEnterprises || []).forEach((e) => map.set(e.id, e)));
  return Array.from(map.values());
}

/** 聚合 SPU 审核状态：只要有一个SKU未通过就显示未通过，全部通过才通过，否则待审核 */
export function getSpuAggregatedAuditStatus(spu: ProductSpu): ProductAuditStatus {
  if (spu.skus.some((s) => s.auditStatus === "REJECTED")) return "REJECTED";
  if (spu.skus.every((s) => s.auditStatus === "APPROVED")) return "APPROVED";
  return "PENDING";
}

/** 聚合 SPU 上架状态 */
export function getSpuAggregatedShelfStatus(spu: ProductSpu): ProductShelfStatus {
  if (spu.skus.some((s) => s.shelfStatus === "ON_SHELF")) return "ON_SHELF";
  if (spu.skus.some((s) => s.shelfStatus === "OFF_SHELF")) return "OFF_SHELF";
  return "PENDING_SHELF";
}

export function getSpuSpecSummary(spu: ProductSpu): string {
  if (spu.skus.length === 0) return "—";
  const allKeys = new Set<string>();
  spu.skus.forEach((s) => Object.keys(s.paramSnapshot).forEach((k) => allKeys.add(k)));
  return Array.from(allKeys).slice(0, 3).join(" / ");
}

// ── Mock Data ──
const enterprises: AppliedEnterprise[] = [
  { id: "ent-1", name: "居然之家北京总部", type: "卖场" },
  { id: "ent-2", name: "居然之家上海店", type: "门店" },
  { id: "ent-3", name: "红星美凯龙", type: "卖场" },
  { id: "ent-4", name: "索菲亚全屋定制", type: "品牌商" },
  { id: "ent-5", name: "欧派家居集团", type: "品牌商" },
  { id: "ent-6", name: "尚品宅配", type: "品牌商" },
  { id: "ent-7", name: "金牌厨柜", type: "经销商" },
  { id: "ent-8", name: "好莱客定制", type: "品牌商" },
];

export const productSpuData: ProductSpu[] = [
  {
    id: "pspu-1",
    productSpuCode: "PRD-001",
    productSpuName: "北欧客厅三人沙发",
    thumbnailUrl: sofaNordic,
    category: "SUPPLY_CHAIN",
    ownerEnterpriseName: "居然之家",
    brandName: "居然优选",
    seriesName: "北欧简约系列",
    backendCategoryName: "沙发",
    frontendCategoryName: "客厅家具",
    description: "北欧风格三人位布艺沙发，简约大气，舒适耐用",
    sellingPoints: ["高弹力海绵坐垫", "可拆洗面料", "实木框架"],
    commercialAttrs: { origin: "广东佛山", warranty: "3年", certifications: ["ISO9001", "绿色环保认证"], deliveryCycle: "7-15天" },
    createdAt: "2026-01-20",
    updatedAt: "2026-03-12",
    skus: [
      {
        id: "psku-1", productSpuId: "pspu-1", productSkuCode: "PRD001-01",
        productSkuName: "酒红·白橡木·1800mm", thumbnailUrl: sofaNordic,
        modelSkuId: "msku-1", modelSkuName: "酒红·白橡木·1800mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        appliedEnterprises: [enterprises[0], enterprises[1], enterprises[2]],
        paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 120,
        barcode: "6901234567890", weight: 45,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
      {
        id: "psku-2", productSpuId: "pspu-1", productSkuCode: "PRD001-02",
        productSkuName: "雾蓝·白橡木·1800mm", thumbnailUrl: sofaBlue,
        modelSkuId: "msku-2", modelSkuName: "雾蓝·白橡木·1800mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        appliedEnterprises: [enterprises[0], enterprises[1]],
        paramSnapshot: { "面料颜色": "雾蓝色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 85,
        barcode: "6901234567891", weight: 45,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
      {
        id: "psku-3", productSpuId: "pspu-1", productSkuCode: "PRD001-03",
        productSkuName: "烟灰·胡桃木·2000mm", thumbnailUrl: sofaGrey,
        modelSkuId: "msku-3", modelSkuName: "烟灰·胡桃木·2000mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        appliedEnterprises: [enterprises[0]],
        paramSnapshot: { "面料颜色": "烟灰色", "腿部材质": "胡桃木", "宽度": "2000mm" },
        price: 7999, originalPrice: 8999, stockQuantity: 42,
        barcode: "6901234567892", weight: 52,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF", createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
    ],
  },
  {
    id: "pspu-2",
    productSpuCode: "PRD-002",
    productSpuName: "北欧客厅套装",
    thumbnailUrl: livingroomSet,
    category: "SUPPLY_CHAIN",
    ownerEnterpriseName: "居然之家",
    brandName: "居然优选",
    seriesName: "北欧简约系列",
    backendCategoryName: "套装",
    frontendCategoryName: "客厅套装",
    description: "北欧客厅套装，含沙发和茶几，一站式配齐",
    sellingPoints: ["沙发+茶几组合", "统一风格设计", "性价比之选"],
    commercialAttrs: { origin: "广东佛山", warranty: "3年", certifications: ["ISO9001"], deliveryCycle: "10-20天" },
    createdAt: "2026-02-15",
    updatedAt: "2026-03-12",
    skus: [
      {
        id: "psku-4", productSpuId: "pspu-2", productSkuCode: "PRD002-01",
        productSkuName: "酒红沙发+大理石茶几", thumbnailUrl: sofaNordic,
        modelSkuId: "msku-1", modelSkuName: "酒红·白橡木·1800mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        appliedEnterprises: [enterprises[0], enterprises[1]],
        paramSnapshot: { "面料颜色": "酒红色", "茶几": "大理石" },
        price: 7998, originalPrice: 9598, stockQuantity: 60, weight: 70,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
      {
        id: "psku-5", productSpuId: "pspu-2", productSkuCode: "PRD002-02",
        productSkuName: "大理石茶几·有置物架", thumbnailUrl: coffeeTable,
        modelSkuId: "msku-5", modelSkuName: "大理石·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        appliedEnterprises: [enterprises[0], enterprises[1], enterprises[2]],
        paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" },
        price: 2999, originalPrice: 3599, stockQuantity: 80, weight: 25,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
      {
        id: "psku-6", productSpuId: "pspu-2", productSkuCode: "PRD002-03",
        productSkuName: "原木茶几·有置物架", thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-6", modelSkuName: "原木·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        appliedEnterprises: [enterprises[2]],
        paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" },
        price: 2599, originalPrice: 3199, stockQuantity: 55, weight: 22,
        auditStatus: "REJECTED", shelfStatus: "PENDING_SHELF", createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
    ],
  },
  {
    id: "pspu-3",
    productSpuCode: "PRD-003",
    productSpuName: "现代轻奢主卧双人床",
    thumbnailUrl: bedLuxury,
    category: "ENTERPRISE",
    ownerEnterpriseName: "欧派家居",
    brandName: "欧派",
    seriesName: "轻奢雅居系列",
    backendCategoryName: "床",
    frontendCategoryName: "卧室家具",
    description: "现代轻奢风格双人床，优质真皮/布艺可选",
    sellingPoints: ["头层真皮", "静音排骨架", "液压储物"],
    commercialAttrs: { origin: "广东广州", warranty: "5年", certifications: ["ISO9001", "绿色环保认证", "欧标E1"], deliveryCycle: "15-25天" },
    createdAt: "2026-02-25",
    updatedAt: "2026-03-15",
    skus: [
      {
        id: "psku-7", productSpuId: "pspu-3", productSkuCode: "PRD003-01",
        productSkuName: "象牙白·真皮·1500mm", thumbnailUrl: bedLuxury,
        modelSkuId: "msku-8", modelSkuName: "象牙白·真皮·1500mm", modelSpuId: "mspu-3", modelSpuName: "现代轻奢双人床",
        appliedEnterprises: [enterprises[4], enterprises[6]],
        paramSnapshot: { "床架颜色": "象牙白", "床头材质": "真皮", "床体尺寸": "1500mm" },
        price: 8999, originalPrice: 10999, stockQuantity: 35, barcode: "6901234567900", weight: 85,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-25", updatedAt: "2026-03-15",
      },
      {
        id: "psku-8", productSpuId: "pspu-3", productSkuCode: "PRD003-02",
        productSkuName: "雅致黑·布艺·1800mm", thumbnailUrl: bedBlack,
        modelSkuId: "msku-9", modelSkuName: "雅致黑·布艺·1800mm", modelSpuId: "mspu-3", modelSpuName: "现代轻奢双人床",
        appliedEnterprises: [enterprises[4]],
        paramSnapshot: { "床架颜色": "雅致黑", "床头材质": "布艺", "床体尺寸": "1800mm" },
        price: 12999, originalPrice: 14999, stockQuantity: 18, barcode: "6901234567901", weight: 92,
        auditStatus: "APPROVED", shelfStatus: "OFF_SHELF", createdAt: "2026-02-25", updatedAt: "2026-03-15",
      },
    ],
  },
  {
    id: "pspu-4",
    productSpuCode: "PRD-004",
    productSpuName: "步入式衣柜定制版",
    thumbnailUrl: wardrobe,
    category: "ENTERPRISE",
    ownerEnterpriseName: "欧派家居",
    brandName: "欧派",
    seriesName: "全屋定制系列",
    backendCategoryName: "衣柜",
    frontendCategoryName: "卧室家具",
    description: "大容量步入式衣柜，多种板材花色可选，支持定制尺寸",
    sellingPoints: ["定制尺寸", "多种板材", "五金升级"],
    commercialAttrs: { origin: "广东广州", warranty: "10年", certifications: ["ISO9001", "欧标E0"], deliveryCycle: "25-35天" },
    createdAt: "2026-03-12",
    updatedAt: "2026-03-20",
    skus: [
      {
        id: "psku-9", productSpuId: "pspu-4", productSkuCode: "PRD004-01",
        productSkuName: "暖白色免漆板", thumbnailUrl: wardrobe,
        modelSkuId: "msku-13", modelSkuName: "暖白色免漆板", modelSpuId: "mspu-4", modelSpuName: "步入式衣柜",
        appliedEnterprises: [enterprises[4], enterprises[5], enterprises[7]],
        paramSnapshot: { "板材": "暖白色免漆板" },
        price: 15999, originalPrice: 18999, stockQuantity: 10, weight: 200,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
      {
        id: "psku-10", productSpuId: "pspu-4", productSkuCode: "PRD004-02",
        productSkuName: "橡木纹免漆板", thumbnailUrl: wardrobeOak,
        modelSkuId: "msku-14", modelSkuName: "橡木纹免漆板", modelSpuId: "mspu-4", modelSpuName: "步入式衣柜",
        appliedEnterprises: [enterprises[4], enterprises[5]],
        paramSnapshot: { "板材": "橡木纹免漆板" },
        price: 18999, originalPrice: 21999, stockQuantity: 8, weight: 200,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
      {
        id: "psku-11", productSpuId: "pspu-4", productSkuCode: "PRD004-03",
        productSkuName: "烤漆板", thumbnailUrl: wardrobe,
        modelSkuId: "msku-15", modelSkuName: "烤漆板", modelSpuId: "mspu-4", modelSpuName: "步入式衣柜",
        appliedEnterprises: [enterprises[7]],
        paramSnapshot: { "板材": "烤漆板" },
        price: 22999, originalPrice: 25999, stockQuantity: 5, weight: 210,
        auditStatus: "REJECTED", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
    ],
  },
  {
    id: "pspu-5",
    productSpuCode: "PRD-005",
    productSpuName: "北欧圆形茶几",
    thumbnailUrl: coffeeTable,
    category: "SUPPLY_CHAIN",
    ownerEnterpriseName: "索菲亚",
    brandName: "居然优选",
    seriesName: "北欧简约系列",
    backendCategoryName: "茶几",
    frontendCategoryName: "客厅家具",
    description: "北欧风格圆形茶几，大理石/原木桌面可选",
    sellingPoints: ["品牌直供", "质量保证"],
    commercialAttrs: { origin: "广东佛山", warranty: "3年", certifications: ["ISO9001"], deliveryCycle: "10-15天" },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-18",
    skus: [
      {
        id: "psku-12", productSpuId: "pspu-5", productSkuCode: "PRD005-01",
        productSkuName: "大理石·有置物架", thumbnailUrl: coffeeTable,
        modelSkuId: "msku-5", modelSkuName: "大理石·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        appliedEnterprises: [enterprises[3], enterprises[0], enterprises[2], enterprises[6]],
        paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" },
        price: 3799, originalPrice: 3999, stockQuantity: 30, weight: 25,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-03-01", updatedAt: "2026-03-18",
      },
      {
        id: "psku-13", productSpuId: "pspu-5", productSkuCode: "PRD005-02",
        productSkuName: "原木·有置物架", thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-6", modelSkuName: "原木·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        appliedEnterprises: [enterprises[3], enterprises[0]],
        paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" },
        price: 3299, originalPrice: 3599, stockQuantity: 25, weight: 22,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-03-01", updatedAt: "2026-03-18",
      },
    ],
  },
  {
    id: "pspu-6",
    productSpuCode: "PRD-006",
    productSpuName: "意式极简餐桌",
    thumbnailUrl: coffeeTableWood,
    category: "SUPPLY_CHAIN",
    ownerEnterpriseName: "居然之家",
    brandName: "居然优选",
    seriesName: "意式轻奢系列",
    backendCategoryName: "餐桌",
    frontendCategoryName: "餐厅家具",
    description: "意式极简风格岩板餐桌，高级灰调配色",
    sellingPoints: ["岩板桌面", "碳素钢桌腿", "防污防刮"],
    commercialAttrs: { origin: "广东佛山", warranty: "5年", certifications: ["ISO9001"], deliveryCycle: "10-15天" },
    createdAt: "2026-02-18",
    updatedAt: "2026-03-22",
    skus: [
      {
        id: "psku-14", productSpuId: "pspu-6", productSkuCode: "PRD006-01",
        productSkuName: "雪花白岩板·1400mm", thumbnailUrl: coffeeTable,
        modelSkuId: "msku-20", modelSkuName: "雪花白岩板·1400mm", modelSpuId: "mspu-6", modelSpuName: "意式极简餐桌",
        appliedEnterprises: [enterprises[0], enterprises[2], enterprises[3]],
        paramSnapshot: { "桌面材质": "雪花白岩板", "尺寸": "1400mm" },
        price: 5999, originalPrice: 7299, stockQuantity: 45, weight: 60,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-18", updatedAt: "2026-03-22",
      },
      {
        id: "psku-15", productSpuId: "pspu-6", productSkuCode: "PRD006-02",
        productSkuName: "深灰岩板·1600mm", thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-21", modelSkuName: "深灰岩板·1600mm", modelSpuId: "mspu-6", modelSpuName: "意式极简餐桌",
        appliedEnterprises: [enterprises[0], enterprises[2]],
        paramSnapshot: { "桌面材质": "深灰岩板", "尺寸": "1600mm" },
        price: 6999, originalPrice: 8299, stockQuantity: 32, weight: 68,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-18", updatedAt: "2026-03-22",
      },
    ],
  },
  {
    id: "pspu-7",
    productSpuCode: "PRD-007",
    productSpuName: "现代简约电视柜",
    thumbnailUrl: wardrobeOak,
    category: "ENTERPRISE",
    ownerEnterpriseName: "索菲亚",
    brandName: "索菲亚",
    seriesName: "现代简约系列",
    backendCategoryName: "电视柜",
    frontendCategoryName: "客厅家具",
    description: "现代简约风格电视柜，悬浮式设计",
    sellingPoints: ["悬浮式安装", "理线槽设计", "大容量收纳"],
    commercialAttrs: { origin: "广东广州", warranty: "5年", certifications: ["ISO9001", "欧标E1"], deliveryCycle: "15-20天" },
    createdAt: "2026-03-05",
    updatedAt: "2026-03-25",
    skus: [
      {
        id: "psku-16", productSpuId: "pspu-7", productSkuCode: "PRD007-01",
        productSkuName: "白色烤漆·2000mm", thumbnailUrl: wardrobe,
        modelSkuId: "msku-22", modelSkuName: "白色烤漆·2000mm", modelSpuId: "mspu-7", modelSpuName: "现代简约电视柜",
        appliedEnterprises: [enterprises[3]],
        paramSnapshot: { "材质": "白色烤漆", "长度": "2000mm" },
        price: 3299, originalPrice: 3999, stockQuantity: 22, weight: 45,
        auditStatus: "APPROVED", shelfStatus: "OFF_SHELF", createdAt: "2026-03-05", updatedAt: "2026-03-25",
      },
      {
        id: "psku-17", productSpuId: "pspu-7", productSkuCode: "PRD007-02",
        productSkuName: "胡桃木色·2400mm", thumbnailUrl: wardrobeOak,
        modelSkuId: "msku-23", modelSkuName: "胡桃木色·2400mm", modelSpuId: "mspu-7", modelSpuName: "现代简约电视柜",
        appliedEnterprises: [enterprises[3]],
        paramSnapshot: { "材质": "胡桃木色", "长度": "2400mm" },
        price: 4299, originalPrice: 5199, stockQuantity: 15, weight: 52,
        auditStatus: "APPROVED", shelfStatus: "OFF_SHELF", createdAt: "2026-03-05", updatedAt: "2026-03-25",
      },
    ],
  },
  {
    id: "pspu-8",
    productSpuCode: "PRD-008",
    productSpuName: "儿童学习桌椅套装",
    thumbnailUrl: coffeeTable,
    category: "PRIVATE",
    ownerEnterpriseName: "好莱客定制",
    brandName: "好莱客",
    seriesName: "成长系列",
    backendCategoryName: "书桌",
    frontendCategoryName: "儿童家具",
    description: "可升降儿童学习桌椅，人体工学设计",
    sellingPoints: ["可升降调节", "环保E0板材", "护眼灯一体"],
    commercialAttrs: { origin: "广东广州", warranty: "5年", certifications: ["ISO9001", "CQC认证"], deliveryCycle: "7-10天" },
    createdAt: "2026-03-18",
    updatedAt: "2026-03-28",
    skus: [
      {
        id: "psku-18", productSpuId: "pspu-8", productSkuCode: "PRD008-01",
        productSkuName: "蓝色·1200mm桌面", thumbnailUrl: coffeeTable,
        modelSkuId: "msku-24", modelSkuName: "蓝色·1200mm", modelSpuId: "mspu-8", modelSpuName: "儿童学习桌椅",
        appliedEnterprises: [enterprises[7]],
        paramSnapshot: { "颜色": "天空蓝", "桌面宽度": "1200mm" },
        price: 3999, originalPrice: 4599, stockQuantity: 50, weight: 35,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-18", updatedAt: "2026-03-28",
      },
      {
        id: "psku-19", productSpuId: "pspu-8", productSkuCode: "PRD008-02",
        productSkuName: "粉色·1200mm桌面", thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-25", modelSkuName: "粉色·1200mm", modelSpuId: "mspu-8", modelSpuName: "儿童学习桌椅",
        appliedEnterprises: [enterprises[7]],
        paramSnapshot: { "颜色": "樱花粉", "桌面宽度": "1200mm" },
        price: 3999, originalPrice: 4599, stockQuantity: 38, weight: 35,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-18", updatedAt: "2026-03-28",
      },
    ],
  },
  {
    id: "pspu-9",
    productSpuCode: "PRD-009",
    productSpuName: "轻奢真皮转角沙发",
    thumbnailUrl: sofaGrey,
    category: "SUPPLY_CHAIN",
    ownerEnterpriseName: "居然之家",
    brandName: "居然优选",
    seriesName: "轻奢都市系列",
    backendCategoryName: "沙发",
    frontendCategoryName: "客厅家具",
    description: "L型转角真皮沙发，高级灰配色",
    sellingPoints: ["头层牛皮", "高密度海绵", "可调节头枕"],
    commercialAttrs: { origin: "浙江杭州", warranty: "5年", certifications: ["ISO9001", "绿色环保认证"], deliveryCycle: "15-20天" },
    createdAt: "2026-01-28",
    updatedAt: "2026-03-20",
    skus: [
      {
        id: "psku-20", productSpuId: "pspu-9", productSkuCode: "PRD009-01",
        productSkuName: "高级灰·左转角", thumbnailUrl: sofaGrey,
        modelSkuId: "msku-26", modelSkuName: "高级灰·左转角", modelSpuId: "mspu-9", modelSpuName: "轻奢转角沙发",
        appliedEnterprises: [enterprises[0], enterprises[1], enterprises[2], enterprises[3], enterprises[6]],
        paramSnapshot: { "皮质颜色": "高级灰", "转角方向": "左转角" },
        price: 15999, originalPrice: 18999, stockQuantity: 20, weight: 120,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-01-28", updatedAt: "2026-03-20",
      },
      {
        id: "psku-21", productSpuId: "pspu-9", productSkuCode: "PRD009-02",
        productSkuName: "高级灰·右转角", thumbnailUrl: sofaGrey,
        modelSkuId: "msku-27", modelSkuName: "高级灰·右转角", modelSpuId: "mspu-9", modelSpuName: "轻奢转角沙发",
        appliedEnterprises: [enterprises[0], enterprises[1], enterprises[2]],
        paramSnapshot: { "皮质颜色": "高级灰", "转角方向": "右转角" },
        price: 15999, originalPrice: 18999, stockQuantity: 16, weight: 120,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-01-28", updatedAt: "2026-03-20",
      },
      {
        id: "psku-22", productSpuId: "pspu-9", productSkuCode: "PRD009-03",
        productSkuName: "焦糖棕·左转角", thumbnailUrl: sofaNordic,
        modelSkuId: "msku-28", modelSkuName: "焦糖棕·左转角", modelSpuId: "mspu-9", modelSpuName: "轻奢转角沙发",
        appliedEnterprises: [enterprises[0], enterprises[6]],
        paramSnapshot: { "皮质颜色": "焦糖棕", "转角方向": "左转角" },
        price: 16999, originalPrice: 19999, stockQuantity: 12, weight: 120,
        auditStatus: "APPROVED", shelfStatus: "PENDING_SHELF", createdAt: "2026-01-28", updatedAt: "2026-03-20",
      },
    ],
  },
  {
    id: "pspu-10",
    productSpuCode: "PRD-010",
    productSpuName: "实木餐椅（4把装）",
    thumbnailUrl: coffeeTableWood,
    category: "PRIVATE",
    ownerEnterpriseName: "尚品宅配",
    brandName: "尚品宅配",
    seriesName: "原木系列",
    backendCategoryName: "餐椅",
    frontendCategoryName: "餐厅家具",
    description: "北欧实木餐椅，人体工学靠背，4把套装",
    sellingPoints: ["进口橡木", "人体工学", "榫卯工艺"],
    commercialAttrs: { origin: "江苏南通", warranty: "3年", certifications: ["ISO9001"], deliveryCycle: "10-15天" },
    createdAt: "2026-03-10",
    updatedAt: "2026-03-26",
    skus: [
      {
        id: "psku-23", productSpuId: "pspu-10", productSkuCode: "PRD010-01",
        productSkuName: "原木色·PU坐垫", thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-29", modelSkuName: "原木色·PU坐垫", modelSpuId: "mspu-10", modelSpuName: "实木餐椅",
        appliedEnterprises: [enterprises[5]],
        paramSnapshot: { "木色": "原木色", "坐垫": "PU皮" },
        price: 2399, originalPrice: 2999, stockQuantity: 60, weight: 24,
        auditStatus: "REJECTED", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-10", updatedAt: "2026-03-26",
      },
      {
        id: "psku-24", productSpuId: "pspu-10", productSkuCode: "PRD010-02",
        productSkuName: "胡桃木色·布艺坐垫", thumbnailUrl: coffeeTable,
        modelSkuId: "msku-30", modelSkuName: "胡桃木色·布艺坐垫", modelSpuId: "mspu-10", modelSpuName: "实木餐椅",
        appliedEnterprises: [enterprises[5]],
        paramSnapshot: { "木色": "胡桃木色", "坐垫": "布艺" },
        price: 2599, originalPrice: 3199, stockQuantity: 45, weight: 24,
        auditStatus: "REJECTED", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-10", updatedAt: "2026-03-26",
      },
    ],
  },
  {
    id: "pspu-11",
    productSpuCode: "PRD-011",
    productSpuName: "智能升降办公桌",
    thumbnailUrl: coffeeTable,
    category: "ENTERPRISE",
    ownerEnterpriseName: "金牌厨柜",
    brandName: "金牌",
    seriesName: "智能办公系列",
    backendCategoryName: "办公桌",
    frontendCategoryName: "办公家具",
    description: "电动升降办公桌，双电机驱动，记忆高度",
    sellingPoints: ["双电机驱动", "4档记忆高度", "防夹手保护"],
    commercialAttrs: { origin: "浙江杭州", warranty: "5年", certifications: ["ISO9001", "3C认证"], deliveryCycle: "7-12天" },
    createdAt: "2026-02-10",
    updatedAt: "2026-03-22",
    skus: [
      {
        id: "psku-25", productSpuId: "pspu-11", productSkuCode: "PRD011-01",
        productSkuName: "白色桌面·白色桌腿·1400mm", thumbnailUrl: coffeeTable,
        modelSkuId: "msku-31", modelSkuName: "白色·1400mm", modelSpuId: "mspu-11", modelSpuName: "智能升降办公桌",
        appliedEnterprises: [enterprises[6], enterprises[4]],
        paramSnapshot: { "桌面颜色": "白色", "桌腿颜色": "白色", "长度": "1400mm" },
        price: 2999, originalPrice: 3599, stockQuantity: 80, weight: 40,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-10", updatedAt: "2026-03-22",
      },
      {
        id: "psku-26", productSpuId: "pspu-11", productSkuCode: "PRD011-02",
        productSkuName: "橡木色桌面·黑色桌腿·1600mm", thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-32", modelSkuName: "橡木色·1600mm", modelSpuId: "mspu-11", modelSpuName: "智能升降办公桌",
        appliedEnterprises: [enterprises[6]],
        paramSnapshot: { "桌面颜色": "橡木色", "桌腿颜色": "黑色", "长度": "1600mm" },
        price: 3599, originalPrice: 4299, stockQuantity: 55, weight: 45,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF", createdAt: "2026-02-10", updatedAt: "2026-03-22",
      },
    ],
  },
  {
    id: "pspu-12",
    productSpuCode: "PRD-012",
    productSpuName: "全屋定制橱柜套餐",
    thumbnailUrl: wardrobe,
    category: "PRIVATE",
    ownerEnterpriseName: "金牌厨柜",
    brandName: "金牌",
    seriesName: "厨房定制系列",
    backendCategoryName: "橱柜",
    frontendCategoryName: "厨房家具",
    description: "L型/U型整体橱柜，石英石台面+实木柜体",
    sellingPoints: ["石英石台面", "实木多层板柜体", "阻尼五金"],
    commercialAttrs: { origin: "福建厦门", warranty: "10年", certifications: ["ISO9001", "欧标E0"], deliveryCycle: "30-45天" },
    createdAt: "2026-03-08",
    updatedAt: "2026-03-28",
    skus: [
      {
        id: "psku-27", productSpuId: "pspu-12", productSkuCode: "PRD012-01",
        productSkuName: "L型·暖白·3米", thumbnailUrl: wardrobe,
        modelSkuId: "msku-33", modelSkuName: "L型·暖白·3米", modelSpuId: "mspu-12", modelSpuName: "全屋定制橱柜",
        appliedEnterprises: [enterprises[6]],
        paramSnapshot: { "布局": "L型", "柜门颜色": "暖白", "延米": "3米" },
        price: 28999, originalPrice: 35999, stockQuantity: 8, weight: 300,
        auditStatus: "APPROVED", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-08", updatedAt: "2026-03-28",
      },
      {
        id: "psku-28", productSpuId: "pspu-12", productSkuCode: "PRD012-02",
        productSkuName: "U型·胡桃木·4米", thumbnailUrl: wardrobeOak,
        modelSkuId: "msku-34", modelSkuName: "U型·胡桃木·4米", modelSpuId: "mspu-12", modelSpuName: "全屋定制橱柜",
        appliedEnterprises: [enterprises[6]],
        paramSnapshot: { "布局": "U型", "柜门颜色": "胡桃木", "延米": "4米" },
        price: 42999, originalPrice: 52999, stockQuantity: 5, weight: 420,
        auditStatus: "APPROVED", shelfStatus: "PENDING_SHELF", createdAt: "2026-03-08", updatedAt: "2026-03-28",
      },
    ],
  },
];
