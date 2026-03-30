/* ══════════════════════════════════════════════════
   模型管理数据模型 — SPU / SKU 两层架构
   
   ModelSpu (模型SPU = 一个3D源文件款式)
        │ 1:N
        ▼
   ModelSku (模型SKU = 参数预设组合快照)
   
   ══════════════════════════════════════════════════ */

export type LibraryType = "PUBLIC" | "BRAND" | "PRIVATE";
export type AuditStatus = "PENDING" | "APPROVED" | "REJECTED" | "NONE";
export type ShelfStatus = "PENDING" | "ON_SHELF" | "OFF_SHELF";
export type ParamType = "MATERIAL" | "COLOR" | "DIMENSION" | "VISIBILITY";
export type ValueType = "ENUM" | "RANGE" | "BOOLEAN";

export interface ModelComponent {
  id: string;
  componentCode: string;
  componentName: string;
  componentType: string;
  sortOrder: number;
}

export interface ModelParamOption {
  id: string;
  optionCode: string;
  optionName: string;
  colorHex?: string;
  textureUrl?: string;
  previewUrl?: string;
  sortOrder: number;
}

export interface ModelParam {
  id: string;
  componentId: string;
  paramCode: string;
  paramName: string;
  paramType: ParamType;
  valueType: ValueType;
  isSkuDefining: boolean;
  sortOrder: number;
  options?: ModelParamOption[];
  rangeConfig?: {
    minValue: number;
    maxValue: number;
    step: number;
    defaultValue: number;
    unit: string;
  };
}

export interface ModelSku {
  id: string;
  spuId: string;
  skuCode: string;
  skuName: string;
  paramSnapshot: Record<string, string>;
  thumbnailUrl: string;
  isDefault: boolean;
  status: ShelfStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ModelSpu {
  id: string;
  spuCode: string;
  spuName: string;
  sourceFileFormat: string;
  sourceFileSize: number;
  baseWidth: number;
  baseDepth: number;
  baseHeight: number;
  polygonCount: number;
  componentCount: number;
  ownerEnterpriseName: string;
  usageScope: LibraryType;
  brandName: string;
  backendCategoryName: string;
  coverImageUrl: string;
  description: string;
  tags: string[];
  currentVersion: string;
  publicStatus: AuditStatus;
  status: ShelfStatus;
  skuCount: number;
  createdAt: string;
  updatedAt: string;
  components: ModelComponent[];
  params: ModelParam[];
  skus: ModelSku[];
}

// ── Mock Data ──

const components1: ModelComponent[] = [
  { id: "comp-1", componentCode: "BODY", componentName: "沙发主体", componentType: "MESH", sortOrder: 1 },
  { id: "comp-2", componentCode: "CUSHION", componentName: "靠垫", componentType: "MESH", sortOrder: 2 },
  { id: "comp-3", componentCode: "SEAT", componentName: "坐垫", componentType: "MESH", sortOrder: 3 },
  { id: "comp-4", componentCode: "LEG", componentName: "沙发腿", componentType: "MESH", sortOrder: 4 },
];

const params1: ModelParam[] = [
  {
    id: "param-1", componentId: "comp-1", paramCode: "FABRIC_COLOR", paramName: "面料颜色",
    paramType: "COLOR", valueType: "ENUM", isSkuDefining: true, sortOrder: 1,
    options: [
      { id: "opt-1", optionCode: "RED", optionName: "酒红色", colorHex: "#8B2252", sortOrder: 1 },
      { id: "opt-2", optionCode: "BLUE", optionName: "雾蓝色", colorHex: "#5B7FA5", sortOrder: 2 },
      { id: "opt-3", optionCode: "GRAY", optionName: "烟灰色", colorHex: "#8B8B83", sortOrder: 3 },
    ],
  },
  {
    id: "param-2", componentId: "comp-4", paramCode: "LEG_MATERIAL", paramName: "腿部材质",
    paramType: "MATERIAL", valueType: "ENUM", isSkuDefining: true, sortOrder: 2,
    options: [
      { id: "opt-4", optionCode: "OAK", optionName: "白橡木", sortOrder: 1 },
      { id: "opt-5", optionCode: "WALNUT", optionName: "胡桃木", sortOrder: 2 },
    ],
  },
  {
    id: "param-3", componentId: "comp-1", paramCode: "WIDTH", paramName: "宽度",
    paramType: "DIMENSION", valueType: "RANGE", isSkuDefining: true, sortOrder: 3,
    rangeConfig: { minValue: 1600, maxValue: 2400, step: 200, defaultValue: 1800, unit: "mm" },
  },
  {
    id: "param-4", componentId: "comp-2", paramCode: "SHOW_CUSHION", paramName: "显示靠垫",
    paramType: "VISIBILITY", valueType: "BOOLEAN", isSkuDefining: false, sortOrder: 4,
  },
];

const skus1: ModelSku[] = [
  { id: "msku-1", spuId: "mspu-1", skuCode: "SF001-R-OAK-18", skuName: "酒红·白橡木·1800mm", paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "白橡木", "宽度": "1800mm" }, thumbnailUrl: "", isDefault: true, status: "ON_SHELF", createdAt: "2026-01-15", updatedAt: "2026-03-12" },
  { id: "msku-2", spuId: "mspu-1", skuCode: "SF001-B-OAK-18", skuName: "雾蓝·白橡木·1800mm", paramSnapshot: { "面料颜色": "雾蓝色", "腿部材质": "白橡木", "宽度": "1800mm" }, thumbnailUrl: "", isDefault: false, status: "ON_SHELF", createdAt: "2026-01-15", updatedAt: "2026-03-12" },
  { id: "msku-3", spuId: "mspu-1", skuCode: "SF001-G-WAL-20", skuName: "烟灰·胡桃木·2000mm", paramSnapshot: { "面料颜色": "烟灰色", "腿部材质": "胡桃木", "宽度": "2000mm" }, thumbnailUrl: "", isDefault: false, status: "ON_SHELF", createdAt: "2026-01-16", updatedAt: "2026-03-12" },
  { id: "msku-4", spuId: "mspu-1", skuCode: "SF001-R-WAL-24", skuName: "酒红·胡桃木·2400mm", paramSnapshot: { "面料颜色": "酒红色", "腿部材质": "胡桃木", "宽度": "2400mm" }, thumbnailUrl: "", isDefault: false, status: "OFF_SHELF", createdAt: "2026-02-01", updatedAt: "2026-03-12" },
];

const components2: ModelComponent[] = [
  { id: "comp-5", componentCode: "TABLE_TOP", componentName: "桌面", componentType: "MESH", sortOrder: 1 },
  { id: "comp-6", componentCode: "TABLE_LEG", componentName: "桌腿", componentType: "MESH", sortOrder: 2 },
  { id: "comp-7", componentCode: "SHELF", componentName: "置物架", componentType: "MESH", sortOrder: 3 },
];

const params2: ModelParam[] = [
  {
    id: "param-5", componentId: "comp-5", paramCode: "SURFACE_MAT", paramName: "桌面材质",
    paramType: "MATERIAL", valueType: "ENUM", isSkuDefining: true, sortOrder: 1,
    options: [
      { id: "opt-6", optionCode: "MARBLE", optionName: "大理石", sortOrder: 1 },
      { id: "opt-7", optionCode: "WOOD", optionName: "原木", sortOrder: 2 },
      { id: "opt-8", optionCode: "GLASS", optionName: "钢化玻璃", sortOrder: 3 },
    ],
  },
  {
    id: "param-6", componentId: "comp-7", paramCode: "SHOW_SHELF", paramName: "显示置物架",
    paramType: "VISIBILITY", valueType: "BOOLEAN", isSkuDefining: true, sortOrder: 2,
  },
];

const skus2: ModelSku[] = [
  { id: "msku-5", spuId: "mspu-2", skuCode: "CJ001-MBL-Y", skuName: "大理石·有置物架", paramSnapshot: { "桌面材质": "大理石", "显示置物架": "是" }, thumbnailUrl: "", isDefault: true, status: "ON_SHELF", createdAt: "2026-02-10", updatedAt: "2026-03-10" },
  { id: "msku-6", spuId: "mspu-2", skuCode: "CJ001-WD-Y", skuName: "原木·有置物架", paramSnapshot: { "桌面材质": "原木", "显示置物架": "是" }, thumbnailUrl: "", isDefault: false, status: "ON_SHELF", createdAt: "2026-02-10", updatedAt: "2026-03-10" },
  { id: "msku-7", spuId: "mspu-2", skuCode: "CJ001-GL-N", skuName: "钢化玻璃·无置物架", paramSnapshot: { "桌面材质": "钢化玻璃", "显示置物架": "否" }, thumbnailUrl: "", isDefault: false, status: "OFF_SHELF", createdAt: "2026-02-12", updatedAt: "2026-03-10" },
];

const components3: ModelComponent[] = [
  { id: "comp-8", componentCode: "FRAME", componentName: "床架", componentType: "MESH", sortOrder: 1 },
  { id: "comp-9", componentCode: "HEADBOARD", componentName: "床头板", componentType: "MESH", sortOrder: 2 },
  { id: "comp-10", componentCode: "MATTRESS", componentName: "床垫", componentType: "MESH", sortOrder: 3 },
];

const params3: ModelParam[] = [
  {
    id: "param-7", componentId: "comp-8", paramCode: "FRAME_COLOR", paramName: "床架颜色",
    paramType: "COLOR", valueType: "ENUM", isSkuDefining: true, sortOrder: 1,
    options: [
      { id: "opt-9", optionCode: "WHITE", optionName: "象牙白", colorHex: "#FFFFF0", sortOrder: 1 },
      { id: "opt-10", optionCode: "BLACK", optionName: "雅致黑", colorHex: "#2C2C2C", sortOrder: 2 },
    ],
  },
  {
    id: "param-8", componentId: "comp-9", paramCode: "HEADBOARD_MAT", paramName: "床头材质",
    paramType: "MATERIAL", valueType: "ENUM", isSkuDefining: true, sortOrder: 2,
    options: [
      { id: "opt-11", optionCode: "LEATHER", optionName: "真皮", sortOrder: 1 },
      { id: "opt-12", optionCode: "FABRIC", optionName: "布艺", sortOrder: 2 },
    ],
  },
  {
    id: "param-9", componentId: "comp-8", paramCode: "BED_SIZE", paramName: "床体尺寸",
    paramType: "DIMENSION", valueType: "RANGE", isSkuDefining: true, sortOrder: 3,
    rangeConfig: { minValue: 1200, maxValue: 2000, step: 200, defaultValue: 1500, unit: "mm" },
  },
];

const skus3: ModelSku[] = [
  { id: "msku-8", spuId: "mspu-3", skuCode: "BD001-W-LTH-15", skuName: "象牙白·真皮·1500mm", paramSnapshot: { "床架颜色": "象牙白", "床头材质": "真皮", "床体尺寸": "1500mm" }, thumbnailUrl: "", isDefault: true, status: "ON_SHELF", createdAt: "2026-02-20", updatedAt: "2026-03-15" },
  { id: "msku-9", spuId: "mspu-3", skuCode: "BD001-B-FAB-18", skuName: "雅致黑·布艺·1800mm", paramSnapshot: { "床架颜色": "雅致黑", "床头材质": "布艺", "床体尺寸": "1800mm" }, thumbnailUrl: "", isDefault: false, status: "ON_SHELF", createdAt: "2026-02-20", updatedAt: "2026-03-15" },
  { id: "msku-10", spuId: "mspu-3", skuCode: "BD001-W-FAB-20", skuName: "象牙白·布艺·2000mm", paramSnapshot: { "床架颜色": "象牙白", "床头材质": "布艺", "床体尺寸": "2000mm" }, thumbnailUrl: "", isDefault: false, status: "PENDING", createdAt: "2026-03-01", updatedAt: "2026-03-15" },
];

export const modelSpuData: ModelSpu[] = [
  {
    id: "mspu-1", spuCode: "SF-001", spuName: "北欧布艺沙发", sourceFileFormat: ".max",
    sourceFileSize: 125829120, baseWidth: 1800, baseDepth: 850, baseHeight: 780,
    polygonCount: 45230, componentCount: 4, ownerEnterpriseName: "居然之家",
    usageScope: "PUBLIC", brandName: "居然优选", backendCategoryName: "沙发",
    coverImageUrl: "", description: "北欧风格三人位布艺沙发，简约大气",
    tags: ["北欧", "布艺", "客厅"], currentVersion: "1.2.0",
    publicStatus: "APPROVED", status: "ON_SHELF", skuCount: 4,
    createdAt: "2026-01-15", updatedAt: "2026-03-12",
    components: components1, params: params1, skus: skus1,
  },
  {
    id: "mspu-2", spuCode: "CJ-001", spuName: "北欧圆形茶几", sourceFileFormat: ".fbx",
    sourceFileSize: 52428800, baseWidth: 800, baseDepth: 800, baseHeight: 450,
    polygonCount: 18650, componentCount: 3, ownerEnterpriseName: "居然之家",
    usageScope: "PUBLIC", brandName: "居然优选", backendCategoryName: "茶几",
    coverImageUrl: "", description: "北欧简约圆形茶几，支持多种桌面材质",
    tags: ["北欧", "茶几", "客厅"], currentVersion: "1.0.0",
    publicStatus: "APPROVED", status: "ON_SHELF", skuCount: 3,
    createdAt: "2026-02-10", updatedAt: "2026-03-10",
    components: components2, params: params2, skus: skus2,
  },
  {
    id: "mspu-3", spuCode: "BD-001", spuName: "现代轻奢双人床", sourceFileFormat: ".gltf",
    sourceFileSize: 89128960, baseWidth: 1800, baseDepth: 2100, baseHeight: 1050,
    polygonCount: 62180, componentCount: 3, ownerEnterpriseName: "欧派家居",
    usageScope: "BRAND", brandName: "欧派", backendCategoryName: "床",
    coverImageUrl: "", description: "现代轻奢风格双人床，真皮/布艺床头可选",
    tags: ["轻奢", "双人床", "卧室"], currentVersion: "2.0.0",
    publicStatus: "NONE", status: "ON_SHELF", skuCount: 3,
    createdAt: "2026-02-20", updatedAt: "2026-03-15",
    components: components3, params: params3, skus: skus3,
  },
  {
    id: "mspu-4", spuCode: "GZ-001", spuName: "简约办公书桌", sourceFileFormat: ".max",
    sourceFileSize: 35651584, baseWidth: 1200, baseDepth: 600, baseHeight: 750,
    polygonCount: 12400, componentCount: 2, ownerEnterpriseName: "索菲亚",
    usageScope: "PRIVATE", brandName: "索菲亚", backendCategoryName: "书桌",
    coverImageUrl: "", description: "简约风格办公书桌，适合书房和工作室",
    tags: ["简约", "书桌", "书房"], currentVersion: "1.0.0",
    publicStatus: "NONE", status: "OFF_SHELF", skuCount: 2,
    createdAt: "2026-03-05", updatedAt: "2026-03-18",
    components: [
      { id: "comp-11", componentCode: "DESKTOP", componentName: "桌面", componentType: "MESH", sortOrder: 1 },
      { id: "comp-12", componentCode: "DESK_LEG", componentName: "桌腿", componentType: "MESH", sortOrder: 2 },
    ],
    params: [
      {
        id: "param-10", componentId: "comp-11", paramCode: "DESK_COLOR", paramName: "桌面颜色",
        paramType: "COLOR", valueType: "ENUM", isSkuDefining: true, sortOrder: 1,
        options: [
          { id: "opt-13", optionCode: "NATURAL", optionName: "原木色", colorHex: "#C4A882", sortOrder: 1 },
          { id: "opt-14", optionCode: "DARK", optionName: "深胡桃", colorHex: "#5C4033", sortOrder: 2 },
        ],
      },
    ],
    skus: [
      { id: "msku-11", spuId: "mspu-4", skuCode: "GZ001-NAT", skuName: "原木色", paramSnapshot: { "桌面颜色": "原木色" }, thumbnailUrl: "", isDefault: true, status: "OFF_SHELF", createdAt: "2026-03-05", updatedAt: "2026-03-18" },
      { id: "msku-12", spuId: "mspu-4", skuCode: "GZ001-DK", skuName: "深胡桃", paramSnapshot: { "桌面颜色": "深胡桃" }, thumbnailUrl: "", isDefault: false, status: "OFF_SHELF", createdAt: "2026-03-05", updatedAt: "2026-03-18" },
    ],
  },
  {
    id: "mspu-5", spuCode: "YG-001", spuName: "步入式衣柜", sourceFileFormat: ".max",
    sourceFileSize: 157286400, baseWidth: 2400, baseDepth: 600, baseHeight: 2400,
    polygonCount: 85600, componentCount: 6, ownerEnterpriseName: "欧派家居",
    usageScope: "PUBLIC", brandName: "欧派", backendCategoryName: "衣柜",
    coverImageUrl: "", description: "大容量步入式衣柜，多种板材可选",
    tags: ["衣柜", "卧室", "定制"], currentVersion: "1.1.0",
    publicStatus: "PENDING", status: "PENDING", skuCount: 3,
    createdAt: "2026-03-10", updatedAt: "2026-03-20",
    components: [
      { id: "comp-13", componentCode: "CABINET", componentName: "柜体", componentType: "MESH", sortOrder: 1 },
      { id: "comp-14", componentCode: "DOOR_L", componentName: "左门板", componentType: "MESH", sortOrder: 2 },
      { id: "comp-15", componentCode: "DOOR_R", componentName: "右门板", componentType: "MESH", sortOrder: 3 },
      { id: "comp-16", componentCode: "DRAWER", componentName: "抽屉", componentType: "MESH", sortOrder: 4 },
      { id: "comp-17", componentCode: "SHELF_IN", componentName: "层板", componentType: "MESH", sortOrder: 5 },
      { id: "comp-18", componentCode: "HANGER", componentName: "挂衣杆", componentType: "MESH", sortOrder: 6 },
    ],
    params: [
      {
        id: "param-11", componentId: "comp-13", paramCode: "PANEL_MAT", paramName: "板材",
        paramType: "MATERIAL", valueType: "ENUM", isSkuDefining: true, sortOrder: 1,
        options: [
          { id: "opt-15", optionCode: "MFC_WHITE", optionName: "暖白色免漆板", sortOrder: 1 },
          { id: "opt-16", optionCode: "MFC_OAK", optionName: "橡木纹免漆板", sortOrder: 2 },
          { id: "opt-17", optionCode: "LACQUER", optionName: "烤漆板", sortOrder: 3 },
        ],
      },
    ],
    skus: [
      { id: "msku-13", spuId: "mspu-5", skuCode: "YG001-WH", skuName: "暖白色免漆板", paramSnapshot: { "板材": "暖白色免漆板" }, thumbnailUrl: "", isDefault: true, status: "PENDING", createdAt: "2026-03-10", updatedAt: "2026-03-20" },
      { id: "msku-14", spuId: "mspu-5", skuCode: "YG001-OAK", skuName: "橡木纹免漆板", paramSnapshot: { "板材": "橡木纹免漆板" }, thumbnailUrl: "", isDefault: false, status: "PENDING", createdAt: "2026-03-10", updatedAt: "2026-03-20" },
      { id: "msku-15", spuId: "mspu-5", skuCode: "YG001-LAC", skuName: "烤漆板", paramSnapshot: { "板材": "烤漆板" }, thumbnailUrl: "", isDefault: false, status: "PENDING", createdAt: "2026-03-10", updatedAt: "2026-03-20" },
    ],
  },
  {
    id: "mspu-6", spuCode: "DG-001", spuName: "吊灯·星空系列", sourceFileFormat: ".fbx",
    sourceFileSize: 18874368, baseWidth: 600, baseDepth: 600, baseHeight: 400,
    polygonCount: 8200, componentCount: 2, ownerEnterpriseName: "居然之家",
    usageScope: "PUBLIC", brandName: "居然优选", backendCategoryName: "灯具",
    coverImageUrl: "", description: "现代简约星空系列吊灯，适合客厅和餐厅",
    tags: ["灯具", "吊灯", "现代"], currentVersion: "1.0.0",
    publicStatus: "REJECTED", status: "OFF_SHELF", skuCount: 2,
    createdAt: "2026-03-15", updatedAt: "2026-03-22",
    components: [
      { id: "comp-19", componentCode: "LAMPSHADE", componentName: "灯罩", componentType: "MESH", sortOrder: 1 },
      { id: "comp-20", componentCode: "CHAIN", componentName: "吊链", componentType: "MESH", sortOrder: 2 },
    ],
    params: [
      {
        id: "param-12", componentId: "comp-19", paramCode: "SHADE_COLOR", paramName: "灯罩颜色",
        paramType: "COLOR", valueType: "ENUM", isSkuDefining: true, sortOrder: 1,
        options: [
          { id: "opt-18", optionCode: "GOLD", optionName: "香槟金", colorHex: "#D4AF37", sortOrder: 1 },
          { id: "opt-19", optionCode: "SILVER", optionName: "磨砂银", colorHex: "#C0C0C0", sortOrder: 2 },
        ],
      },
    ],
    skus: [
      { id: "msku-16", spuId: "mspu-6", skuCode: "DG001-GD", skuName: "香槟金", paramSnapshot: { "灯罩颜色": "香槟金" }, thumbnailUrl: "", isDefault: true, status: "OFF_SHELF", createdAt: "2026-03-15", updatedAt: "2026-03-22" },
      { id: "msku-17", spuId: "mspu-6", skuCode: "DG001-SV", skuName: "磨砂银", paramSnapshot: { "灯罩颜色": "磨砂银" }, thumbnailUrl: "", isDefault: false, status: "OFF_SHELF", createdAt: "2026-03-15", updatedAt: "2026-03-22" },
    ],
  },
];

// Helper: flatten SPU+SKU for table display
export interface ModelSpuRow extends ModelSpu {
  _type: "spu";
  _children: ModelSkuRow[];
}

export interface ModelSkuRow {
  _type: "sku";
  _parentSpuId: string;
  _parentSpuName: string;
  id: string;
  skuCode: string;
  skuName: string;
  paramSnapshot: Record<string, string>;
  thumbnailUrl: string;
  isDefault: boolean;
  status: ShelfStatus;
  createdAt: string;
}

export function buildModelTableData(): ModelSpuRow[] {
  return modelSpuData.map((spu) => ({
    ...spu,
    _type: "spu" as const,
    _children: spu.skus.map((sku) => ({
      _type: "sku" as const,
      _parentSpuId: spu.id,
      _parentSpuName: spu.spuName,
      id: sku.id,
      skuCode: sku.skuCode,
      skuName: sku.skuName,
      paramSnapshot: sku.paramSnapshot,
      thumbnailUrl: sku.thumbnailUrl,
      isDefault: sku.isDefault,
      status: sku.status,
      createdAt: sku.createdAt,
    })),
  }));
}
