/* ══════════════════════════════════════════════════
   商品管理数据模型 — SPU / SKU 两层架构
   
   ProductSpu (商品SPU = 商业信息集合)
        │ 1:N
        ▼
   ProductSku (商品SKU = 可购买最小单位)
        │ N:1
        ▼
   ModelSku (模型SKU = 外观信息来源)
   
   ══════════════════════════════════════════════════ */

export type ProductLibraryType = "PRIVATE" | "PUBLIC";
export type ProductAuditStatus = "PENDING" | "APPROVED" | "REJECTED" | "NONE";
export type ProductShelfStatus = "ON_SHELF" | "OFF_SHELF";
export type DataType = "MASTER" | "SUB";

export interface ProductSku {
  id: string;
  productSpuId: string;
  productSkuCode: string;
  modelSkuId: string;
  modelSkuName: string;
  modelSpuName: string;
  paramSnapshot: Record<string, string>;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK";
  barcode?: string;
  weight?: number;
  status: ProductShelfStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpu {
  id: string;
  productSpuCode: string;
  productSpuName: string;
  ownerEnterpriseName: string;
  usageScope: ProductLibraryType;
  brandName: string;
  backendCategoryName: string;
  frontendCategoryName: string;
  priceMin: number;
  priceMax: number;
  currency: string;
  coverImageUrl: string;
  description: string;
  sellingPoints: string[];
  dataType: DataType;
  sourceProductSpuId?: string;
  publicStatus: ProductAuditStatus;
  status: ProductShelfStatus;
  skuCount: number;
  relatedModelCount: number;
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

// ── Mock Data ──

export const productSpuData: ProductSpu[] = [
  {
    id: "pspu-1",
    productSpuCode: "PRD-001",
    productSpuName: "北欧客厅三人沙发",
    ownerEnterpriseName: "居然之家",
    usageScope: "PUBLIC",
    brandName: "居然优选",
    backendCategoryName: "沙发",
    frontendCategoryName: "客厅家具",
    priceMin: 4999,
    priceMax: 7999,
    currency: "CNY",
    coverImageUrl: "",
    description: "北欧风格三人位布艺沙发，简约大气，舒适耐用",
    sellingPoints: ["高弹力海绵坐垫", "可拆洗面料", "实木框架"],
    dataType: "MASTER",
    publicStatus: "APPROVED",
    status: "ON_SHELF",
    skuCount: 3,
    relatedModelCount: 1,
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
        modelSkuId: "msku-1", modelSkuName: "酒红·白橡木·1800mm", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 120,
        stockStatus: "IN_STOCK", barcode: "6901234567890", weight: 45,
        status: "ON_SHELF", createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
      {
        id: "psku-2", productSpuId: "pspu-1", productSkuCode: "PRD001-02",
        modelSkuId: "msku-2", modelSkuName: "雾蓝·白橡木·1800mm", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "雾蓝色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 85,
        stockStatus: "IN_STOCK", barcode: "6901234567891", weight: 45,
        status: "ON_SHELF", createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
      {
        id: "psku-3", productSpuId: "pspu-1", productSkuCode: "PRD001-03",
        modelSkuId: "msku-3", modelSkuName: "烟灰·胡桃木·2000mm", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "烟灰色", "腿部材质": "胡桃木", "宽度": "2000mm" },
        price: 7999, originalPrice: 8999, stockQuantity: 42,
        stockStatus: "IN_STOCK", barcode: "6901234567892", weight: 52,
        status: "ON_SHELF", createdAt: "2026-01-20", updatedAt: "2026-03-12",
      },
    ],
  },
  {
    id: "pspu-2",
    productSpuCode: "PRD-002",
    productSpuName: "北欧客厅套装",
    ownerEnterpriseName: "居然之家",
    usageScope: "PUBLIC",
    brandName: "居然优选",
    backendCategoryName: "套装",
    frontendCategoryName: "客厅套装",
    priceMin: 2999,
    priceMax: 12998,
    currency: "CNY",
    coverImageUrl: "",
    description: "北欧客厅套装，含沙发和茶几，一站式配齐",
    sellingPoints: ["沙发+茶几组合", "统一风格设计", "性价比之选"],
    dataType: "MASTER",
    publicStatus: "APPROVED",
    status: "ON_SHELF",
    skuCount: 3,
    relatedModelCount: 2,
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
        modelSkuId: "msku-1", modelSkuName: "酒红·白橡木·1800mm", modelSpuName: "北欧布艺沙发",
        paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "白橡木", "宽度": "1800mm" },
        price: 4999, originalPrice: 5999, stockQuantity: 60,
        stockStatus: "IN_STOCK", weight: 45,
        status: "ON_SHELF", createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
      {
        id: "psku-5", productSpuId: "pspu-2", productSkuCode: "PRD002-02",
        modelSkuId: "msku-5", modelSkuName: "大理石·有置物架", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" },
        price: 2999, originalPrice: 3599, stockQuantity: 80,
        stockStatus: "IN_STOCK", weight: 25,
        status: "ON_SHELF", createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
      {
        id: "psku-6", productSpuId: "pspu-2", productSkuCode: "PRD002-03",
        modelSkuId: "msku-6", modelSkuName: "原木·有置物架", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" },
        price: 2599, originalPrice: 3199, stockQuantity: 55,
        stockStatus: "IN_STOCK", weight: 22,
        status: "ON_SHELF", createdAt: "2026-02-15", updatedAt: "2026-03-12",
      },
    ],
  },
  {
    id: "pspu-3",
    productSpuCode: "PRD-003",
    productSpuName: "现代轻奢主卧双人床",
    ownerEnterpriseName: "欧派家居",
    usageScope: "PRIVATE",
    brandName: "欧派",
    backendCategoryName: "床",
    frontendCategoryName: "卧室家具",
    priceMin: 8999,
    priceMax: 12999,
    currency: "CNY",
    coverImageUrl: "",
    description: "现代轻奢风格双人床，优质真皮/布艺可选",
    sellingPoints: ["头层真皮", "静音排骨架", "液压储物"],
    dataType: "MASTER",
    publicStatus: "NONE",
    status: "ON_SHELF",
    skuCount: 2,
    relatedModelCount: 1,
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
        modelSkuId: "msku-8", modelSkuName: "象牙白·真皮·1500mm", modelSpuName: "现代轻奢双人床",
        paramSnapshot: { "床架颜色": "象牙白", "床头材质": "真皮", "床体尺寸": "1500mm" },
        price: 8999, originalPrice: 10999, stockQuantity: 35,
        stockStatus: "IN_STOCK", barcode: "6901234567900", weight: 85,
        status: "ON_SHELF", createdAt: "2026-02-25", updatedAt: "2026-03-15",
      },
      {
        id: "psku-8", productSpuId: "pspu-3", productSkuCode: "PRD003-02",
        modelSkuId: "msku-9", modelSkuName: "雅致黑·布艺·1800mm", modelSpuName: "现代轻奢双人床",
        paramSnapshot: { "床架颜色": "雅致黑", "床头材质": "布艺", "床体尺寸": "1800mm" },
        price: 12999, originalPrice: 14999, stockQuantity: 18,
        stockStatus: "IN_STOCK", barcode: "6901234567901", weight: 92,
        status: "ON_SHELF", createdAt: "2026-02-25", updatedAt: "2026-03-15",
      },
    ],
  },
  {
    id: "pspu-4",
    productSpuCode: "PRD-004",
    productSpuName: "步入式衣柜定制版",
    ownerEnterpriseName: "欧派家居",
    usageScope: "PUBLIC",
    brandName: "欧派",
    backendCategoryName: "衣柜",
    frontendCategoryName: "卧室家具",
    priceMin: 15999,
    priceMax: 22999,
    currency: "CNY",
    coverImageUrl: "",
    description: "大容量步入式衣柜，多种板材花色可选，支持定制尺寸",
    sellingPoints: ["定制尺寸", "多种板材", "五金升级"],
    dataType: "MASTER",
    publicStatus: "PENDING",
    status: "OFF_SHELF",
    skuCount: 3,
    relatedModelCount: 1,
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
        modelSkuId: "msku-13", modelSkuName: "暖白色免漆板", modelSpuName: "步入式衣柜",
        paramSnapshot: { "板材": "暖白色免漆板" },
        price: 15999, originalPrice: 18999, stockQuantity: 10,
        stockStatus: "IN_STOCK", weight: 200,
        status: "OFF_SHELF", createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
      {
        id: "psku-10", productSpuId: "pspu-4", productSkuCode: "PRD004-02",
        modelSkuId: "msku-14", modelSkuName: "橡木纹免漆板", modelSpuName: "步入式衣柜",
        paramSnapshot: { "板材": "橡木纹免漆板" },
        price: 18999, originalPrice: 21999, stockQuantity: 8,
        stockStatus: "IN_STOCK", weight: 200,
        status: "OFF_SHELF", createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
      {
        id: "psku-11", productSpuId: "pspu-4", productSkuCode: "PRD004-03",
        modelSkuId: "msku-15", modelSkuName: "烤漆板", modelSpuName: "步入式衣柜",
        paramSnapshot: { "板材": "烤漆板" },
        price: 22999, originalPrice: 25999, stockQuantity: 5,
        stockStatus: "IN_STOCK", weight: 210,
        status: "OFF_SHELF", createdAt: "2026-03-12", updatedAt: "2026-03-20",
      },
    ],
  },
  {
    id: "pspu-5",
    productSpuCode: "PRD-005",
    productSpuName: "欧派·北欧茶几（子数据）",
    ownerEnterpriseName: "索菲亚",
    usageScope: "PRIVATE",
    brandName: "居然优选",
    backendCategoryName: "茶几",
    frontendCategoryName: "客厅家具",
    priceMin: 3299,
    priceMax: 3799,
    currency: "CNY",
    coverImageUrl: "",
    description: "引用自居然之家的北欧茶几，索菲亚定价版",
    sellingPoints: ["品牌直供", "质量保证"],
    dataType: "SUB",
    sourceProductSpuId: "pspu-2",
    publicStatus: "NONE",
    status: "ON_SHELF",
    skuCount: 2,
    relatedModelCount: 1,
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
        modelSkuId: "msku-5", modelSkuName: "大理石·有置物架", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" },
        price: 3799, originalPrice: 3999, stockQuantity: 30,
        stockStatus: "IN_STOCK", weight: 25,
        status: "ON_SHELF", createdAt: "2026-03-01", updatedAt: "2026-03-18",
      },
      {
        id: "psku-13", productSpuId: "pspu-5", productSkuCode: "PRD005-02",
        modelSkuId: "msku-6", modelSkuName: "原木·有置物架", modelSpuName: "北欧圆形茶几",
        paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" },
        price: 3299, originalPrice: 3599, stockQuantity: 25,
        stockStatus: "IN_STOCK", weight: 22,
        status: "ON_SHELF", createdAt: "2026-03-01", updatedAt: "2026-03-18",
      },
    ],
  },
];
