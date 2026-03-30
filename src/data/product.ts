/* ══════════════════════════════════════════════════
   商品管理数据模型 — SPU / SKU 两层架构
   
   审核状态：待审核 / 审核通过 / 审核未通过
   业务状态（仅审核通过后）：待上架 / 已上架 / 已下架
   
   库存 = 所有SKU库存之和
   关联模型 = 所有SKU关联的不重复模型SPU总数
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

export type ProductAuditStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProductShelfStatus = "PENDING_SHELF" | "ON_SHELF" | "OFF_SHELF";

export interface ProductSku {
  id: string;
  productSpuId: string;
  productSkuCode: string;
  productSkuName: string;
  thumbnailUrl: string;
  modelSkuId: string;
  modelSkuName: string;
  modelSpuId: string;
  modelSpuName: string;
  paramSnapshot: Record<string, string>;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  barcode?: string;
  weight?: number;
  auditStatus: ProductAuditStatus;
  shelfStatus: ProductShelfStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpu {
  id: string;
  productSpuCode: string;
  productSpuName: string;
  thumbnailUrl: string;
  ownerEnterpriseName: string;
  brandName: string;
  seriesName: string;
  backendCategoryName: string;
  frontendCategoryName: string;
  description: string;
  sellingPoints: string[];
  auditStatus: ProductAuditStatus;
  shelfStatus: ProductShelfStatus;
  commercialAttrs: {
    origin: string;
    warranty: string;
    certifications: string[];
    deliveryCycle: string;
  };
  createdAt: string;
  updatedAt: string;
  skus: ProductSku[];
}

// ── Computed helpers ──
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

export function getSpuSpecSummary(spu: ProductSpu): string {
  if (spu.skus.length === 0) return "—";
  const allKeys = new Set<string>();
  spu.skus.forEach((s) => Object.keys(s.paramSnapshot).forEach((k) => allKeys.add(k)));
  return Array.from(allKeys).slice(0, 3).join(" / ");
}

// ── Mock Data ──

export const productSpuData: ProductSpu[] = [
  {
    id: "pspu-1",
    productSpuCode: "PRD-001",
    productSpuName: "北欧客厅三人沙发",
    thumbnailUrl: sofaNordic,
    ownerEnterpriseName: "居然之家",
    brandName: "居然优选",
    seriesName: "北欧简约系列",
    backendCategoryName: "沙发",
    frontendCategoryName: "客厅家具",
    description: "北欧风格三人位布艺沙发，简约大气，舒适耐用",
    sellingPoints: ["高弹力海绵坐垫", "可拆洗面料", "实木框架"],
    auditStatus: "APPROVED",
    shelfStatus: "ON_SHELF",
    commercialAttrs: {
      origin: "广东佛山",
      warranty: "3年",
      certifications: ["ISO9001", "绿色环保认证"],
      deliveryCycle: "7-15天",
    },
    createdAt: "2026-01-20",
    updatedAt: "2026-03-12",
    skus: [
      {
        id: "psku-1", productSpuId: "pspu-1", productSkuCode: "PRD001-01",
        productSkuName: "酒红·白橡木·1800mm",
        thumbnailUrl: sofaNordic,
        modelSkuId: "msku-1", modelSkuName: "酒红·白橡木·1800mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 120,
        barcode: "6901234567890", weight: 45,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
      {
        id: "psku-2", productSpuId: "pspu-1", productSkuCode: "PRD001-02",
        productSkuName: "雾蓝·白橡木·1800mm",
        thumbnailUrl: sofaBlue,
        modelSkuId: "msku-2", modelSkuName: "雾蓝·白橡木·1800mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "雾蓝色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 85,
        barcode: "6901234567891", weight: 45,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
      {
        id: "psku-3", productSpuId: "pspu-1", productSkuCode: "PRD001-03",
        productSkuName: "烟灰·胡桃木·2000mm",
        thumbnailUrl: sofaGrey,
        modelSkuId: "msku-3", modelSkuName: "烟灰·胡桃木·2000mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "烟灰色", "腿部材质": "胡桃木", "宽度": "2000mm" },
        price: 7999, originalPrice: 8999, stockQuantity: 42,
        barcode: "6901234567892", weight: 52,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF",
        createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
    ],
  },
  {
    id: "pspu-2",
    productSpuCode: "PRD-002",
    productSpuName: "北欧客厅套装",
    thumbnailUrl: livingroomSet,
    ownerEnterpriseName: "居然之家",
    brandName: "居然优选",
    seriesName: "北欧简约系列",
    backendCategoryName: "套装",
    frontendCategoryName: "客厅套装",
    description: "北欧客厅套装，含沙发和茶几，一站式配齐",
    sellingPoints: ["沙发+茶几组合", "统一风格设计", "性价比之选"],
    auditStatus: "APPROVED",
    shelfStatus: "ON_SHELF",
    commercialAttrs: {
      origin: "广东佛山",
      warranty: "3年",
      certifications: ["ISO9001"],
      deliveryCycle: "10-20天",
    },
    createdAt: "2026-02-15",
    updatedAt: "2026-03-12",
    skus: [
      {
        id: "psku-4", productSpuId: "pspu-2", productSkuCode: "PRD002-01",
        productSkuName: "酒红沙发+大理石茶几",
        thumbnailUrl: sofaNordic,
        modelSkuId: "msku-1", modelSkuName: "酒红·白橡木·1800mm", modelSpuId: "mspu-1", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 7998, originalPrice: 9598, stockQuantity: 60,
        weight: 70,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
      {
        id: "psku-5", productSpuId: "pspu-2", productSkuCode: "PRD002-02",
        productSkuName: "大理石茶几·有置物架",
        thumbnailUrl: coffeeTable,
        modelSkuId: "msku-5", modelSkuName: "大理石·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" },
        price: 2999, originalPrice: 3599, stockQuantity: 80,
        weight: 25,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
      {
        id: "psku-6", productSpuId: "pspu-2", productSkuCode: "PRD002-03",
        productSkuName: "原木茶几·有置物架",
        thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-6", modelSkuName: "原木·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" },
        price: 2599, originalPrice: 3199, stockQuantity: 55,
        weight: 22,
        auditStatus: "REJECTED", shelfStatus: "PENDING_SHELF",
        createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
    ],
  },
  {
    id: "pspu-3",
    productSpuCode: "PRD-003",
    productSpuName: "现代轻奢主卧双人床",
    thumbnailUrl: bedLuxury,
    ownerEnterpriseName: "欧派家居",
    brandName: "欧派",
    seriesName: "轻奢雅居系列",
    backendCategoryName: "床",
    frontendCategoryName: "卧室家具",
    description: "现代轻奢风格双人床，优质真皮/布艺可选",
    sellingPoints: ["头层真皮", "静音排骨架", "液压储物"],
    auditStatus: "APPROVED",
    shelfStatus: "ON_SHELF",
    commercialAttrs: {
      origin: "广东广州",
      warranty: "5年",
      certifications: ["ISO9001", "绿色环保认证", "欧标E1"],
      deliveryCycle: "15-25天",
    },
    createdAt: "2026-02-25",
    updatedAt: "2026-03-15",
    skus: [
      {
        id: "psku-7", productSpuId: "pspu-3", productSkuCode: "PRD003-01",
        productSkuName: "象牙白·真皮·1500mm",
        thumbnailUrl: bedLuxury,
        modelSkuId: "msku-8", modelSkuName: "象牙白·真皮·1500mm", modelSpuId: "mspu-3", modelSpuName: "现代轻奢双人床",
        paramSnapshot: { "床架颜色": "象牙白", "床头材质": "真皮", "床体尺寸": "1500mm" },
        price: 8999, originalPrice: 10999, stockQuantity: 35,
        barcode: "6901234567900", weight: 85,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-02-25", updatedAt: "2026-03-15",
      },
      {
        id: "psku-8", productSpuId: "pspu-3", productSkuCode: "PRD003-02",
        productSkuName: "雅致黑·布艺·1800mm",
        thumbnailUrl: bedBlack,
        modelSkuId: "msku-9", modelSkuName: "雅致黑·布艺·1800mm", modelSpuId: "mspu-3", modelSpuName: "现代轻奢双人床",
        paramSnapshot: { "床架颜色": "雅致黑", "床头材质": "布艺", "床体尺寸": "1800mm" },
        price: 12999, originalPrice: 14999, stockQuantity: 18,
        barcode: "6901234567901", weight: 92,
        auditStatus: "APPROVED", shelfStatus: "OFF_SHELF",
        createdAt: "2026-02-25", updatedAt: "2026-03-15",
      },
    ],
  },
  {
    id: "pspu-4",
    productSpuCode: "PRD-004",
    productSpuName: "步入式衣柜定制版",
    thumbnailUrl: wardrobe,
    ownerEnterpriseName: "欧派家居",
    brandName: "欧派",
    seriesName: "全屋定制系列",
    backendCategoryName: "衣柜",
    frontendCategoryName: "卧室家具",
    description: "大容量步入式衣柜，多种板材花色可选，支持定制尺寸",
    sellingPoints: ["定制尺寸", "多种板材", "五金升级"],
    auditStatus: "PENDING",
    shelfStatus: "PENDING_SHELF",
    commercialAttrs: {
      origin: "广东广州",
      warranty: "10年",
      certifications: ["ISO9001", "欧标E0"],
      deliveryCycle: "25-35天",
    },
    createdAt: "2026-03-12",
    updatedAt: "2026-03-20",
    skus: [
      {
        id: "psku-9", productSpuId: "pspu-4", productSkuCode: "PRD004-01",
        productSkuName: "暖白色免漆板",
        thumbnailUrl: wardrobe,
        modelSkuId: "msku-13", modelSkuName: "暖白色免漆板", modelSpuId: "mspu-4", modelSpuName: "步入式衣柜",
        paramSnapshot: { "板材": "暖白色免漆板" },
        price: 15999, originalPrice: 18999, stockQuantity: 10,
        weight: 200,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF",
        createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
      {
        id: "psku-10", productSpuId: "pspu-4", productSkuCode: "PRD004-02",
        productSkuName: "橡木纹免漆板",
        thumbnailUrl: wardrobeOak,
        modelSkuId: "msku-14", modelSkuName: "橡木纹免漆板", modelSpuId: "mspu-4", modelSpuName: "步入式衣柜",
        paramSnapshot: { "板材": "橡木纹免漆板" },
        price: 18999, originalPrice: 21999, stockQuantity: 8,
        weight: 200,
        auditStatus: "PENDING", shelfStatus: "PENDING_SHELF",
        createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
      {
        id: "psku-11", productSpuId: "pspu-4", productSkuCode: "PRD004-03",
        productSkuName: "烤漆板",
        thumbnailUrl: wardrobe,
        modelSkuId: "msku-15", modelSkuName: "烤漆板", modelSpuId: "mspu-4", modelSpuName: "步入式衣柜",
        paramSnapshot: { "板材": "烤漆板" },
        price: 22999, originalPrice: 25999, stockQuantity: 5,
        weight: 210,
        auditStatus: "REJECTED", shelfStatus: "PENDING_SHELF",
        createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
    ],
  },
  {
    id: "pspu-5",
    productSpuCode: "PRD-005",
    productSpuName: "北欧圆形茶几",
    thumbnailUrl: coffeeTable,
    ownerEnterpriseName: "索菲亚",
    brandName: "居然优选",
    seriesName: "北欧简约系列",
    backendCategoryName: "茶几",
    frontendCategoryName: "客厅家具",
    description: "北欧风格圆形茶几，大理石/原木桌面可选",
    sellingPoints: ["品牌直供", "质量保证"],
    auditStatus: "APPROVED",
    shelfStatus: "ON_SHELF",
    commercialAttrs: {
      origin: "广东佛山",
      warranty: "3年",
      certifications: ["ISO9001"],
      deliveryCycle: "10-15天",
    },
    createdAt: "2026-03-01",
    updatedAt: "2026-03-18",
    skus: [
      {
        id: "psku-12", productSpuId: "pspu-5", productSkuCode: "PRD005-01",
        productSkuName: "大理石·有置物架",
        thumbnailUrl: coffeeTable,
        modelSkuId: "msku-5", modelSkuName: "大理石·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" },
        price: 3799, originalPrice: 3999, stockQuantity: 30,
        weight: 25,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-03-01", updatedAt: "2026-03-18",
      },
      {
        id: "psku-13", productSpuId: "pspu-5", productSkuCode: "PRD005-02",
        productSkuName: "原木·有置物架",
        thumbnailUrl: coffeeTableWood,
        modelSkuId: "msku-6", modelSkuName: "原木·有置物架", modelSpuId: "mspu-2", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" },
        price: 3299, originalPrice: 3599, stockQuantity: 25,
        weight: 22,
        auditStatus: "APPROVED", shelfStatus: "ON_SHELF",
        createdAt: "2026-03-01", updatedAt: "2026-03-18",
      },
    ],
  },
];
