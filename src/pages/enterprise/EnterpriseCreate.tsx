import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Upload, X, Plus, Info, Search, Package, CalendarIcon } from "lucide-react";
import { SetAdminDialog } from "./SetAdminDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<string, string> = {
  mall: "卖场", brand: "品牌商", dealer: "经销商", decoration: "装修公司", studio: "工作室", store: "门店", supplier: "供应商",
};

// Sub-enterprise allowed types by parent type key
const SUB_TYPE_ALLOWED: Record<string, string[]> = {
  brand: ["brand", "dealer", "decoration", "store", "studio"],
  dealer: ["dealer", "decoration", "store", "studio"],
  decoration: ["decoration", "store", "studio"],
  store: ["store", "studio"],
  studio: ["studio"],
  supplier: ["supplier"],
  mall: ["brand", "dealer", "decoration", "store", "studio"],
};

const ORG_STRUCTURES = ["上级/本级", "独立运营", "分公司", "办事处"];
const REGIONS = ["华东", "华南", "华北", "华中", "西南", "西北", "东北"];

const ALL_STEPS = [
  { key: "basic", label: "基础信息" },
  { key: "product", label: "权益配置" },
  { key: "config", label: "品牌配置" },
  { key: "done", label: "完成" },
];

// 企业类型与品牌关系映射
// mall(卖场) → 拥有+代理; brand(品牌商) → 拥有+代理; dealer(经销商) → 代理; decoration(装修公司) → 无关; studio(工作室) → 无关; store(门店) → 无关
type BrandRelation = "own" | "agent" | "both" | "none";
const TYPE_BRAND_RELATION: Record<string, BrandRelation> = {
  mall: "both",
  brand: "both",
  dealer: "agent",
  decoration: "none",
  studio: "none",
  store: "none",
};

function getStepsForType(type: string) {
  const relation = TYPE_BRAND_RELATION[type] || "none";
  if (relation === "none") {
    return ALL_STEPS.filter((s) => s.key !== "config");
  }
  return ALL_STEPS;
}

const INDUSTRIES = ["家居建材", "家具制造", "装饰装修", "智能家居", "软装设计", "其他"];
const PROVINCES = ["北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "山东", "福建", "湖南"];
const AUTH_TYPES = ["营业执照认证", "品牌授权认证", "ISO体系认证"];

const AVAILABLE_PRODUCTS = [
  { key: "domestic3d", label: "国内3D工具" },
  { key: "international3d", label: "国际3D工具" },
  { key: "smartGuide", label: "智能导购" },
  { key: "customerData", label: "精准客资" },
  { key: "smartPhoto", label: "智能翻拍" },
  { key: "live", label: "直播" },
];

const BENEFIT_CATALOG: Record<string, { name: string; desc: string; color: string }[]> = {
  domestic3d: [
    { name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", color: "hsl(221 83% 53%)" },
    { name: "3D工具设计权益包", desc: "含户型绘制、方案设计、模型库", color: "hsl(210 80% 55%)" },
    { name: "VR漫游权益包", desc: "含VR全景漫游、场景切换", color: "hsl(260 60% 55%)" },
    { name: "施工图权益包", desc: "含CAD导出、水电布局图", color: "hsl(170 60% 42%)" },
    { name: "AI生图权益包", desc: "含AI渲染、风格迁移", color: "hsl(340 70% 55%)" },
  ],
  international3d: [
    { name: "国际版渲染权益包", desc: "含8K渲染、HDR输出", color: "hsl(221 83% 53%)" },
    { name: "国际版设计权益包", desc: "含全球模型库、多语言支持", color: "hsl(210 80% 55%)" },
    { name: "国际版VR权益包", desc: "含VR漫游、AR预览", color: "hsl(260 60% 55%)" },
  ],
  smartGuide: [
    { name: "智能导购权益包", desc: "含AI推荐、商品匹配", color: "hsl(221 83% 53%)" },
    { name: "导购数据权益包", desc: "含客户画像、行为分析", color: "hsl(210 80% 55%)" },
  ],
  customerData: [
    { name: "精准客资权益包", desc: "含线索分配、客户管理", color: "hsl(221 83% 53%)" },
    { name: "客资分析权益包", desc: "含转化分析、ROI报表", color: "hsl(210 80% 55%)" },
  ],
  smartPhoto: [
    { name: "智能翻拍权益包", desc: "含AI抠图、场景替换", color: "hsl(221 83% 53%)" },
  ],
  live: [
    { name: "直播权益包", desc: "含直播推流、互动工具", color: "hsl(221 83% 53%)" },
  ],
};

/* ── Date Range Picker Component ── */
function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = (value || "").split(" ~ ");
  const startDate = parts[0] ? new Date(parts[0]) : undefined;
  const endDate = parts[1] ? new Date(parts[1]) : undefined;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) { onChange(""); return; }
    const from = range.from ? format(range.from, "yyyy-MM-dd") : "";
    const to = range.to ? format(range.to, "yyyy-MM-dd") : "";
    onChange(to ? `${from} ~ ${to}` : from);
  };

  const displayText = startDate && endDate
    ? `${format(startDate, "yyyy/MM/dd")} ~ ${format(endDate, "yyyy/MM/dd")}`
    : startDate
    ? `${format(startDate, "yyyy/MM/dd")} ~ 结束日期`
    : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-7 w-full justify-start text-left font-normal text-[12px] px-2",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1.5 h-3 w-3 opacity-50 shrink-0" />
          {displayText || <span>选择时间段</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={startDate && endDate ? { from: startDate, to: endDate } : startDate ? { from: startDate, to: undefined } : undefined}
          onSelect={handleSelect as any}
          numberOfMonths={2}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

interface BenefitRow {
  id: string;
  packageName: string;
  applyMode: "指定人员" | "全部人员";
  applyCount: number;
  dateRange: string;
}

interface ProductConfig {
  packageRows: BenefitRow[];
  productRows: BenefitRow[];
  accountCount?: number;
}

const createRow = (name?: string): BenefitRow => ({
  id: crypto.randomUUID(),
  packageName: name || "权益包",
  applyMode: "指定人员",
  applyCount: 10,
  dateRange: "2026-01-01 ~ 2028-12-31",
});

interface OwnedBrand {
  id: string;
  name: string;
  logo: null;
  country: string;
  info: string;
  categories: string[];
  series: string[];
}

const MOCK_AGENT_BRANDS = [
  { id: "b1", name: "马可波罗", logo: "🏷️" },
  { id: "b2", name: "东鹏瓷砖", logo: "🏷️" },
  { id: "b3", name: "诺贝尔瓷砖", logo: "🏷️" },
  { id: "b4", name: "蒙娜丽莎", logo: "🏷️" },
  { id: "b5", name: "冠珠陶瓷", logo: "🏷️" },
  { id: "b6", name: "新中源陶瓷", logo: "🏷️" },
];

const COUNTRIES = ["中国", "美国", "日本", "韩国", "德国", "意大利", "法国", "英国"];
const CATEGORIES = ["瓷砖", "卫浴", "地板", "涂料", "灯具", "家具", "橱柜", "门窗", "五金", "墙纸"];

export default function EnterpriseCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parentType = searchParams.get("parentType") || "";
  const parentId = searchParams.get("parentId") || "";
  const parentName = searchParams.get("parentName") ? decodeURIComponent(searchParams.get("parentName")!) : "";
  const level = parseInt(searchParams.get("level") || "0", 10);
  const isSub = Boolean(parentId);

  // For sub-enterprise, need to select sub-type first if not provided
  const [selectedSubType, setSelectedSubType] = useState(searchParams.get("type") || "brand");
  const type = isSub ? selectedSubType : (searchParams.get("type") || "brand");

  const brandRelation = TYPE_BRAND_RELATION[type] || "none";
  const steps = useMemo(() => getStepsForType(type), [type]);
  const [currentStep, setCurrentStep] = useState(0);

  const allowedSubTypes = isSub ? (SUB_TYPE_ALLOWED[parentType] || []) : [];

  const [form, setForm] = useState({
    name: "", license: "2020220", authType: "营业执照认证", industry: "家居建材",
    province: "广东", licenseFile: null as File | null,
    contactName: "", contactPhone: "", legalPerson: "", legalPhone: "",
    regCapital: "", brand: "",
    // Sub-enterprise specific fields
    orgStructure: "上级/本级", region: "", address: "",
    enabledProducts: ["domestic3d", "smartGuide"] as string[],
    joinSupplyChain: true,
    enableGenericConfig: false,
    productConfigs: {
      domestic3d: {
        accountCount: 30,
        packageRows: [
          createRow("3D工具渲染权益包"),
          createRow("3D工具设计权益包"),
          createRow("VR漫游权益包"),
          createRow("施工图权益包"),
        ],
        productRows: [createRow("AI生图权益包")],
      },
      smartGuide: {
        accountCount: 30,
        packageRows: [
          createRow("智能导购权益包"),
          createRow("导购数据权益包"),
        ],
        productRows: [],
      },
    } as Record<string, ProductConfig>,
    maxSubCompanies: 30,
    autoGrantSub: false,
    expireDate: "2027-12-31",
    // Brand config
    ownedBrands: [] as OwnedBrand[],
    agentBrandIds: [] as string[],
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleProduct = (key: string) => {
    setForm((prev) => {
      const enabled = prev.enabledProducts;
      if (enabled.includes(key)) {
        return { ...prev, enabledProducts: enabled.filter((k) => k !== key) };
      } else {
        const newConfigs = prev.productConfigs[key]
          ? prev.productConfigs
          : { ...prev.productConfigs, [key]: { packageRows: [], productRows: [], accountCount: 30 } };
        return { ...prev, enabledProducts: [...enabled, key], productConfigs: newConfigs };
      }
    });
  };

  const addRow = (productKey: string, type: "packageRows" | "productRows", name?: string) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey] || { packageRows: [], productRows: [] };
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: { ...cfg, [type]: [...cfg[type], createRow(name)] },
        },
      };
    });
  };

  const removeRow = (productKey: string, type: "packageRows" | "productRows", rowId: string) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey];
      if (!cfg) return prev;
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: { ...cfg, [type]: cfg[type].filter((r) => r.id !== rowId) },
        },
      };
    });
  };

  const updateRow = (productKey: string, type: "packageRows" | "productRows", rowId: string, field: string, value: any) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey];
      if (!cfg) return prev;
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: {
            ...cfg,
            [type]: cfg[type].map((r) => r.id === rowId ? { ...r, [field]: value } : r),
          },
        },
      };
    });
  };

  const updateProductAccountCount = (productKey: string, count: number) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey] || { packageRows: [], productRows: [] };
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: { ...cfg, accountCount: count },
        },
      };
    });
  };

  // Owned brand CRUD
  const addOwnedBrand = () => {
    update("ownedBrands", [
      ...form.ownedBrands,
      { id: crypto.randomUUID(), name: "", logo: null, country: "中国", info: "", categories: [], series: [] },
    ]);
  };
  const removeOwnedBrand = (id: string) => update("ownedBrands", form.ownedBrands.filter((b: OwnedBrand) => b.id !== id));
  const updateOwnedBrand = (id: string, field: string, value: any) => {
    update("ownedBrands", form.ownedBrands.map((b: OwnedBrand) => b.id === id ? { ...b, [field]: value } : b));
  };

  // Agent brand toggle
  const toggleAgentBrand = (brandId: string) => {
    const ids = form.agentBrandIds as string[];
    update("agentBrandIds", ids.includes(brandId) ? ids.filter((id) => id !== brandId) : [...ids, brandId]);
  };

  const currentStepKey = steps[currentStep]?.key;
  const lastStepIndex = steps.length - 1;
  const isLastContentStep = currentStep === lastStepIndex - 1; // step before "done"

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, lastStepIndex));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate("/enterprise")} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
          企业管理
        </button>
        <span className="text-muted-foreground text-xs">/</span>
        {isSub && parentName && (
          <>
            <span className="text-[13px] text-muted-foreground">{parentName}</span>
            <span className="text-muted-foreground text-xs">/</span>
          </>
        )}
        <span className="text-[13px] text-foreground font-semibold">
          {isSub ? `新建子企业` : `新建${TYPE_LABELS[type] || "企业"}`}
        </span>
      </div>

      {/* Stepper */}
      <div className="bg-card rounded-xl border p-6 mb-5" style={{ boxShadow: 'var(--shadow-xs)' }}>
        <div className="flex items-center justify-center max-w-[600px] mx-auto">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isCompleted ? "bg-primary text-primary-foreground" :
                    isCurrent ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-[13px] whitespace-nowrap ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-px ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-xl border" style={{ boxShadow: 'var(--shadow-xs)' }}>
        {currentStepKey === "basic" && (
          isSub
            ? <StepSubBasic
                form={form}
                update={update}
                parentName={parentName}
                type={type}
              />
            : <StepBasic form={form} update={update} />
        )}
        {currentStepKey === "product" && (
          <StepBenefits
            form={form}
            update={update}
            toggleProduct={toggleProduct}
            addRow={addRow}
            removeRow={removeRow}
            updateRow={updateRow}
            updateProductAccountCount={updateProductAccountCount}
          />
        )}
        {currentStepKey === "config" && (
          <StepBrandConfig
            form={form}
            update={update}
            brandRelation={brandRelation}
            addOwnedBrand={addOwnedBrand}
            removeOwnedBrand={removeOwnedBrand}
            updateOwnedBrand={updateOwnedBrand}
            toggleAgentBrand={toggleAgentBrand}
          />
        )}
        {currentStepKey === "done" && <StepDone type={type} form={form} navigate={navigate} />}

        {/* Actions */}
        <div className="flex justify-center gap-3 px-6 py-5 border-t">
          {currentStep === 0 && (
            <button onClick={() => navigate("/enterprise")} className="btn-secondary">取消</button>
          )}
          {currentStep > 0 && currentStepKey !== "done" && (
            <>
              <button onClick={() => navigate("/enterprise")} className="btn-secondary">取消</button>
              <button onClick={goPrev} className="btn-secondary">上一步</button>
            </>
          )}
          {currentStepKey !== "done" && (
            <button onClick={goNext} className="btn-primary">
              {isLastContentStep ? "提交" : "下一步"}
            </button>
          )}
          {currentStepKey === "done" && (
            <button onClick={() => navigate("/enterprise")} className="btn-secondary">返回列表</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ Step 1: 基础信息 ============ */
function StepBasic({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="p-6">
      <SectionTitle title="基础信息" />
      <div className="max-w-[640px] mx-auto space-y-5 mt-5">
        <FormRow label="企业名称" required>
          <input className="filter-input w-full" placeholder="请输入" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </FormRow>
        <FormRow label="营业证" required>
          <input className="filter-input w-full" value={form.license} onChange={(e) => update("license", e.target.value)} />
        </FormRow>
        <FormRow label="资质认证">
          <select className="filter-select w-full" value={form.authType} onChange={(e) => update("authType", e.target.value)}>
            {AUTH_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </FormRow>
        <FormRow label="行业">
          <select className="filter-select w-full" value={form.industry} onChange={(e) => update("industry", e.target.value)}>
            {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </FormRow>
        <FormRow label="营业范围">
          <select className="filter-select w-full" value={form.province} onChange={(e) => update("province", e.target.value)}>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </FormRow>
        <FormRow label="证件照">
          <div className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Upload className="h-5 w-5" />
            <span className="text-[10px]">点击上传</span>
          </div>
        </FormRow>
        <FormRow label="对接销售/顾问">
          <input className="filter-input w-full" placeholder="请输入" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
        </FormRow>
        <FormRow label="企业人数" required>
          <input className="filter-input w-full" placeholder="请输入" value={form.legalPerson} onChange={(e) => update("legalPerson", e.target.value)} />
        </FormRow>
        <FormRow label="企业手机号" required>
          <input className="filter-input w-full" placeholder="请输入" value={form.legalPhone} onChange={(e) => update("legalPhone", e.target.value)} />
        </FormRow>
        <FormRow label="注册资金">
          <input className="filter-input w-full" placeholder="请输入" value={form.regCapital} onChange={(e) => update("regCapital", e.target.value)} />
        </FormRow>
        <FormRow label="品牌标识">
          <input className="filter-input w-full" placeholder="请输入" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
        </FormRow>
      </div>
    </div>
  );
}

/* ============ Step 1-Sub: 子企业基础信息 ============ */
function StepSubBasic({
  form, update, parentName, type,
}: {
  form: any;
  update: (k: string, v: any) => void;
  parentName: string;
  type: string;
}) {
  return (
    <div className="p-6">
      <SectionTitle title="基础信息" />
      <div className="max-w-[640px] mx-auto space-y-5 mt-5">
        <FormRow label="上级企业">
          <input className="filter-input w-full bg-muted/30" value={parentName} disabled />
        </FormRow>
        <FormRow label="企业类型">
          <input className="filter-input w-full bg-muted/30" value={TYPE_LABELS[type] || type} disabled />
        </FormRow>
        <FormRow label="企业名称" required>
          <input className="filter-input w-full" placeholder="请输入" value={form.name} onChange={(e) => update("name", e.target.value)} />
        </FormRow>
        <FormRow label="企业ID">
          <input className="filter-input w-full bg-muted/30" value={form.license} disabled />
        </FormRow>
        <FormRow label="组织结构">
          <select className="filter-select w-full" value={form.orgStructure} onChange={(e) => update("orgStructure", e.target.value)}>
            {ORG_STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormRow>
        <FormRow label="企业联系人">
          <input className="filter-input w-full" placeholder="请输入" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} />
        </FormRow>
        <FormRow label="联系人手机号">
          <input className="filter-input w-full" placeholder="请输入" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
        </FormRow>
        <FormRow label="覆盖区域">
          <select className="filter-select w-full" value={form.region} onChange={(e) => update("region", e.target.value)}>
            <option value="">请选择</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </FormRow>
        <FormRow label="详细地址">
          <input className="filter-input w-full" placeholder="请输入" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </FormRow>
      </div>
    </div>
  );
}

/* ============ Step 2: 权益配置 ============ */
function StepBenefits({
  form, update, toggleProduct, addRow, removeRow, updateRow, updateProductAccountCount,
}: {
  form: any;
  update: (k: string, v: any) => void;
  toggleProduct: (key: string) => void;
  addRow: (productKey: string, type: "packageRows" | "productRows", name?: string) => void;
  removeRow: (productKey: string, type: "packageRows" | "productRows", rowId: string) => void;
  updateRow: (productKey: string, type: "packageRows" | "productRows", rowId: string, field: string, value: any) => void;
  updateProductAccountCount: (productKey: string, count: number) => void;
}) {
  return (
    <div>
      <div className="px-6 py-4 border-b bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          产品权益
        </h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <FormRow label="开通产品" wide>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {AVAILABLE_PRODUCTS.map((p) => {
                const checked = form.enabledProducts.includes(p.key);
                return (
                  <label key={p.key} className="inline-flex items-center gap-2 text-[13px] cursor-pointer select-none group"
                    onClick={(e) => { e.preventDefault(); toggleProduct(p.key); }}>
                    <div className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all ${
                      checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                    }`}>
                      {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className={checked ? "text-foreground" : "text-muted-foreground"}>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </FormRow>
        </div>

        {form.enabledProducts.map((pKey: string) => {
          const product = AVAILABLE_PRODUCTS.find((p) => p.key === pKey);
          if (!product) return null;
          const cfg = form.productConfigs[pKey] || { packageRows: [], productRows: [], accountCount: 30 };
          const catalog = BENEFIT_CATALOG[pKey] || [];
          return (
            <div key={pKey} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b">
                <span className="text-[13px] font-semibold text-foreground">{product.label}</span>
              </div>
              <div className="p-5 space-y-5">
                <FormRow label="产品人数" wide>
                  <input className="filter-input w-32" type="number" value={cfg.accountCount || 30}
                    onChange={(e) => updateProductAccountCount(pKey, Number(e.target.value))} />
                  <span className="text-[12px] text-muted-foreground ml-2">人</span>
                </FormRow>
                <BenefitListSection
                  label="权益包" productKey={pKey} type="packageRows" rows={cfg.packageRows} catalog={catalog}
                  onAdd={addRow} onRemove={removeRow} onUpdate={updateRow}
                  onAddWithName={(name) => addRow(pKey, "packageRows", name)}
                />
                <BenefitListSection
                  label="权益商品" productKey={pKey} type="productRows" rows={cfg.productRows} catalog={catalog}
                  onAdd={addRow} onRemove={removeRow} onUpdate={updateRow}
                  onAddWithName={(name) => addRow(pKey, "productRows", name)}
                />
              </div>
            </div>
          );
        })}

        <div className="px-6 py-4 border-t bg-muted/30 -mx-6 -mb-6 mt-6">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-primary" />
            企业权益
          </h3>
        </div>
        <div className="space-y-4 pt-2">
          <FormRow label="子企业上限" wide>
            <input className="filter-input w-32" type="number" value={form.maxSubCompanies}
              onChange={(e) => update("maxSubCompanies", Number(e.target.value))} />
            <span className="text-[12px] text-muted-foreground ml-2">个</span>
          </FormRow>
          <FormRow label="独立配置子企业权益" wide>
            <ToggleSwitch checked={form.autoGrantSub} onChange={() => update("autoGrantSub", !form.autoGrantSub)} />
          </FormRow>
          <FormRow label="到期时间" wide>
            <input className="filter-input w-48" type="date" value={form.expireDate}
              onChange={(e) => update("expireDate", e.target.value)} />
          </FormRow>
        </div>
      </div>
    </div>
  );
}

/* ============ BenefitListSection ============ */
function BenefitListSection({
  label, productKey, type, rows, catalog, onAdd, onRemove, onUpdate, onAddWithName,
}: {
  label: string;
  productKey: string;
  type: "packageRows" | "productRows";
  rows: BenefitRow[];
  catalog: { name: string; desc: string; color: string }[];
  onAdd: (productKey: string, type: "packageRows" | "productRows") => void;
  onRemove: (productKey: string, type: "packageRows" | "productRows", rowId: string) => void;
  onUpdate: (productKey: string, type: "packageRows" | "productRows", rowId: string, field: string, value: any) => void;
  onAddWithName: (name: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = catalog.filter((c) => c.name.includes(search));

  const getTagColor = (name: string) => {
    const item = catalog.find((c) => c.name === name);
    return item?.color || "hsl(221 83% 53%)";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium text-muted-foreground tracking-wide">{label}</span>
        <button
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <Plus className="h-3 w-3" /> 添加
        </button>
      </div>

      {rows.length === 0 ? (
        <div
          onClick={() => setShowPicker(true)}
          className="flex flex-col items-center justify-center gap-1.5 py-5 border border-dashed rounded-lg text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4 opacity-60" />
          <span className="text-[12px]">点击添加{label}</span>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[minmax(180px,1fr)_110px_72px_minmax(200px,1fr)_32px] bg-muted/50 border-b text-[12px] font-medium text-muted-foreground">
            <div className="px-3 py-2">名称</div>
            <div className="px-3 py-2">应用方式</div>
            <div className="px-3 py-2">人数</div>
            <div className="px-3 py-2">授权时间</div>
            <div />
          </div>
          {rows.map((row) => {
            const color = getTagColor(row.packageName);
            return (
              <div key={row.id} className="grid grid-cols-[minmax(180px,1fr)_110px_72px_minmax(200px,1fr)_32px] items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors group">
                <div className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium whitespace-nowrap"
                    style={{ backgroundColor: color.replace(')', ' / 0.08)').replace('hsl(', 'hsl('), color }}>
                    <Package className="h-3 w-3 shrink-0" />
                    {row.packageName}
                  </span>
                </div>
                <div className="px-3 py-2.5">
                  <select className="filter-select h-7 text-[12px] w-full px-2" value={row.applyMode}
                    onChange={(e) => onUpdate(productKey, type, row.id, "applyMode", e.target.value)}>
                    <option value="指定人员">指定人员</option>
                    <option value="全部人员">全部人员</option>
                  </select>
                </div>
                <div className="px-2 py-2.5">
                  {row.applyMode === "指定人员" ? (
                    <input className="filter-input h-7 text-[12px] w-full text-center px-1" type="number" value={row.applyCount}
                      onChange={(e) => onUpdate(productKey, type, row.id, "applyCount", Number(e.target.value))} />
                  ) : (
                    <span className="text-[12px] text-muted-foreground">全员</span>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <DateRangePicker value={row.dateRange} onChange={(val) => onUpdate(productKey, type, row.id, "dateRange", val)} />
                </div>
                <div className="px-1 py-2.5 flex justify-center">
                  <button onClick={() => onRemove(productKey, type, row.id)}
                    className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPicker(false)}>
          <div className="bg-card rounded-xl border shadow-xl w-[520px] max-h-[480px] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h4 className="text-[14px] font-semibold text-foreground">选择{label}</h4>
              <button onClick={() => setShowPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="filter-input w-full pl-8 h-8 text-[13px]" placeholder="搜索权益名称..." value={search}
                  onChange={(e) => setSearch(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">暂无匹配的权益</div>
              ) : (
                filtered.map((item) => {
                  const alreadyAdded = rows.some((r) => r.packageName === item.name);
                  return (
                    <div key={item.name}
                      onClick={() => { if (!alreadyAdded) { onAddWithName(item.name); setShowPicker(false); setSearch(""); } }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${alreadyAdded ? "opacity-50 cursor-not-allowed bg-muted/30" : "cursor-pointer hover:border-primary hover:bg-primary/5"}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '15' }}>
                        <Package className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                      {alreadyAdded && <span className="text-[11px] text-muted-foreground shrink-0">已添加</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Step 3: 品牌配置 ============ */
function StepBrandConfig({
  form, update, brandRelation, addOwnedBrand, removeOwnedBrand, updateOwnedBrand, toggleAgentBrand,
}: {
  form: any;
  update: (k: string, v: any) => void;
  brandRelation: BrandRelation;
  addOwnedBrand: () => void;
  removeOwnedBrand: (id: string) => void;
  updateOwnedBrand: (id: string, field: string, value: any) => void;
  toggleAgentBrand: (brandId: string) => void;
}) {
  const showOwn = brandRelation === "own" || brandRelation === "both";
  const showAgent = brandRelation === "agent" || brandRelation === "both";

  return (
    <div className="p-6 space-y-8">
      {/* 权限说明 */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-muted/50 border text-[12px] text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <div>
          {showOwn && showAgent ? (
            <span><strong className="text-foreground">拥有品牌</strong>：可上传公有模型，拥有品牌完整管理权限；<strong className="text-foreground">代理品牌</strong>：可使用品牌资源，但不可上传公有模型。</span>
          ) : showOwn ? (
            <span><strong className="text-foreground">拥有品牌</strong>：可上传公有模型，拥有品牌完整管理权限。</span>
          ) : (
            <span><strong className="text-foreground">代理品牌</strong>：可使用品牌资源，但不可上传公有模型。</span>
          )}
        </div>
      </div>

      {/* 拥有品牌 Section */}
      {showOwn && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="拥有品牌" />
            <button onClick={addOwnedBrand} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 font-medium transition-colors">
              <Plus className="h-3.5 w-3.5" /> 新建
            </button>
          </div>

          {form.ownedBrands.length === 0 ? (
            <div onClick={addOwnedBrand}
              className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed rounded-lg text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
              <Plus className="h-5 w-5 opacity-60" />
              <span className="text-[13px]">点击新建品牌</span>
            </div>
          ) : (
            <div className="space-y-6">
              {form.ownedBrands.map((brand: OwnedBrand, idx: number) => (
                <div key={brand.id} className="border rounded-lg">
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/30 rounded-t-lg border-b">
                    <span className="text-[13px] font-medium text-foreground">品牌{idx + 1}信息</span>
                    <button onClick={() => removeOwnedBrand(brand.id)} className="text-[12px] text-destructive hover:text-destructive/80 transition-colors">删除</button>
                  </div>
                  <div className="p-5 space-y-4">
                    <FormRow label="品牌名称" required>
                      <input className="filter-input w-full" placeholder="请输入" value={brand.name}
                        onChange={(e) => updateOwnedBrand(brand.id, "name", e.target.value)} />
                    </FormRow>
                    <FormRow label="品牌Logo" required>
                      <div className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        <Upload className="h-5 w-5" />
                        <span className="text-[10px]">点击上传</span>
                      </div>
                    </FormRow>
                    <FormRow label="国家">
                      <select className="filter-select w-full" value={brand.country}
                        onChange={(e) => updateOwnedBrand(brand.id, "country", e.target.value)}>
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FormRow>
                    <FormRow label="品牌信息">
                      <textarea className="filter-input w-full h-20 resize-none" placeholder="请输入" value={brand.info}
                        onChange={(e) => updateOwnedBrand(brand.id, "info", e.target.value)} />
                    </FormRow>
                    <FormRow label="经营品类">
                      <div className="space-y-2">
                        {brand.categories.map((cat: string, ci: number) => (
                          <div key={ci} className="flex items-center gap-2">
                            <select className="filter-select flex-1" value={cat}
                              onChange={(e) => {
                                const newCats = [...brand.categories];
                                newCats[ci] = e.target.value;
                                updateOwnedBrand(brand.id, "categories", newCats);
                              }}>
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button onClick={() => updateOwnedBrand(brand.id, "categories", brand.categories.filter((_: string, i: number) => i !== ci))}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => updateOwnedBrand(brand.id, "categories", [...brand.categories, CATEGORIES[0]])}
                          className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors">
                          <Plus className="h-3 w-3" /> 添加品类
                        </button>
                      </div>
                    </FormRow>
                    <FormRow label="所含系列">
                      <div className="space-y-2">
                        {brand.series.map((s: string, si: number) => (
                          <div key={si} className="flex items-center gap-2">
                            <input className="filter-input flex-1" value={s} placeholder="请输入系列名称"
                              onChange={(e) => {
                                const newSeries = [...brand.series];
                                newSeries[si] = e.target.value;
                                updateOwnedBrand(brand.id, "series", newSeries);
                              }} />
                            <button onClick={() => updateOwnedBrand(brand.id, "series", brand.series.filter((_: string, i: number) => i !== si))}
                              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                        <button onClick={() => updateOwnedBrand(brand.id, "series", [...brand.series, ""])}
                          className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors">
                          <Plus className="h-3 w-3" /> 创建系列
                        </button>
                      </div>
                    </FormRow>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 代理品牌 Section */}
      {showAgent && (
        <div>
          <SectionTitle title="代理品牌" />
          <div className="mt-4">
            <FormRow label="代理品牌" required>
              <div className="flex flex-wrap gap-3">
                {MOCK_AGENT_BRANDS.map((ab) => {
                  const selected = (form.agentBrandIds as string[]).includes(ab.id);
                  return (
                    <div key={ab.id} onClick={() => toggleAgentBrand(ab.id)}
                      className={cn(
                        "relative w-20 h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      )}>
                      {selected && (
                        <button onClick={(e) => { e.stopPropagation(); toggleAgentBrand(ab.id); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <span className="text-2xl">{ab.logo}</span>
                      <span className="text-[11px] text-foreground font-medium">{ab.name}</span>
                    </div>
                  );
                })}
                <div className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="h-4 w-4" />
                  <span className="text-[10px]">点击选择</span>
                </div>
              </div>
            </FormRow>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Step 4: 完成 ============ */
function StepDone({ type, form, navigate }: { type: string; form: any; navigate: (path: string) => void }) {
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  return (
    <div className="py-10">
      {/* Success Icon & Message */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--success))] flex items-center justify-center mb-5">
          <Check className="h-10 w-10 text-[hsl(var(--success-foreground))]" strokeWidth={3} />
        </div>
        <h3 className="text-xl font-semibold text-foreground">创建成功</h3>
        <p className="text-[13px] text-muted-foreground mt-2">
          企业创建已完成，设置企业管理员可开启使用
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={() => navigate("/enterprise")} className="btn-secondary">查看详情</button>
          <button onClick={() => navigate(`/enterprise/create?type=${type}`)} className="btn-secondary">继续创建</button>
          <button className="btn-primary" onClick={() => setShowAdminDialog(true)}>设置管理员</button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="max-w-[720px] mx-auto mt-10 rounded-xl bg-muted/50 border p-6">
        <div className="grid grid-cols-2 gap-x-12 gap-y-5">
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">公司名称：</span>
            <span className="text-[13px] text-foreground font-medium">{form.name || "未填写"}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">公司类型：</span>
            <span className="text-[13px] text-foreground font-medium">{TYPE_LABELS[type]}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">法人代表：</span>
            <span className="text-[13px] text-foreground font-medium">{form.legalPerson || "未填写"}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">法人手机号：</span>
            <span className="text-[13px] text-foreground font-medium">{form.legalPhone || "未填写"}</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">开启产品：</span>
            <div className="flex flex-wrap gap-1.5">
              {(form.enabledProducts || []).map((pk: string) => {
                const prod = AVAILABLE_PRODUCTS.find(p => p.key === pk);
                return prod ? (
                  <span key={pk} className="badge-product">{prod.label}</span>
                ) : null;
              })}
              {(!form.enabledProducts || form.enabledProducts.length === 0) && <span className="text-[13px] text-muted-foreground">未开启</span>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">企业状态：</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-default">
                <div className="w-4 h-4 rounded-full border-[5px] border-foreground" />
                <span className="text-[13px] text-foreground">停用</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-default opacity-50">
                <div className="w-4 h-4 rounded-full border border-border" />
                <span className="text-[13px] text-muted-foreground">启用</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <SetAdminDialog
        open={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        enterpriseName={form.name || "未填写"}
        onConfirm={(data) => {
          console.log("设置管理员", data);
          setShowAdminDialog(false);
        }}
      />
    </div>
  );
}

/* ============ Shared Components ============ */
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b">
      <div className="w-1 h-4 rounded-full bg-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function FormRow({ label, required, children, wide }: { label: string; required?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <label className="text-[13px] text-muted-foreground pt-[7px] text-right shrink-0 w-[100px]">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${checked ? "bg-primary" : "bg-border"}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  );
}
