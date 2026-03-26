import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Upload, X, Plus, Info, Search, Package, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const TYPE_LABELS: Record<string, string> = {
  brand: "品牌商", dealer: "经销商", hq: "总部公司", studio: "工作室", supplier: "供应商",
};

const ALL_STEPS = [
  { key: "basic", label: "基础信息" },
  { key: "product", label: "权益配置" },
  { key: "config", label: "品牌配置" },
  { key: "done", label: "完成" },
];

// 企业类型与品牌关系映射
// brand(品牌商) → 拥有品牌(创建); dealer(经销商) → 代理品牌(关联); hq → 两者皆有; studio/supplier → 无品牌配置
type BrandRelation = "own" | "agent" | "both" | "none";
const TYPE_BRAND_RELATION: Record<string, BrandRelation> = {
  brand: "own",
  dealer: "agent",
  hq: "both",
  studio: "none",
  supplier: "none",
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
  const type = searchParams.get("type") || "brand";
  const brandRelation = TYPE_BRAND_RELATION[type] || "none";
  const steps = useMemo(() => getStepsForType(type), [type]);
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    name: "", license: "2020220", authType: "营业执照认证", industry: "家居建材",
    province: "广东", licenseFile: null as File | null,
    contactName: "", contactPhone: "", legalPerson: "", legalPhone: "",
    regCapital: "", brand: "",
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
        <span className="text-[13px] text-foreground font-semibold">
          新建{TYPE_LABELS[type] || "企业"}
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
        {currentStepKey === "basic" && <StepBasic form={form} update={update} />}
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
        {currentStepKey === "done" && <StepDone type={type} />}

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
            <button onClick={() => navigate("/enterprise")} className="btn-primary">返回列表</button>
          )}
        </div>
      </div>
    </div>
  );

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
          {/* Table header */}
          <div className="grid grid-cols-[minmax(180px,1fr)_110px_72px_minmax(200px,1fr)_32px] bg-muted/50 border-b text-[12px] font-medium text-muted-foreground">
            <div className="px-3 py-2">名称</div>
            <div className="px-3 py-2">应用方式</div>
            <div className="px-3 py-2">人数</div>
            <div className="px-3 py-2">授权时间</div>
            <div />
          </div>
          {/* Rows */}
          {rows.map((row) => {
            const color = getTagColor(row.packageName);
            return (
              <div
                key={row.id}
                className="grid grid-cols-[minmax(180px,1fr)_110px_72px_minmax(200px,1fr)_32px] items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors group"
              >
                {/* Name tag */}
                <div className="px-3 py-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[12px] font-medium whitespace-nowrap"
                    style={{ backgroundColor: color.replace(')', ' / 0.08)').replace('hsl(', 'hsl('), color: color }}
                  >
                    <Package className="h-3 w-3 shrink-0" />
                    {row.packageName}
                  </span>
                </div>
                {/* Apply mode */}
                <div className="px-3 py-2.5">
                  <select
                    className="filter-select h-7 text-[12px] w-full px-2"
                    value={row.applyMode}
                    onChange={(e) => onUpdate(productKey, type, row.id, "applyMode", e.target.value)}
                  >
                    <option value="指定人员">指定人员</option>
                    <option value="全部人员">全部人员</option>
                  </select>
                </div>
                {/* Count */}
                <div className="px-2 py-2.5">
                  {row.applyMode === "指定人员" ? (
                    <input
                      className="filter-input h-7 text-[12px] w-full text-center px-1"
                      type="number"
                      value={row.applyCount}
                      onChange={(e) => onUpdate(productKey, type, row.id, "applyCount", Number(e.target.value))}
                    />
                  ) : (
                    <span className="text-[12px] text-muted-foreground">全员</span>
                  )}
                </div>
                {/* Date range picker */}
                <div className="px-3 py-2.5">
                  <DateRangePicker
                    value={row.dateRange}
                    onChange={(val) => onUpdate(productKey, type, row.id, "dateRange", val)}
                  />
                </div>
                {/* Delete */}
                <div className="px-1 py-2.5 flex justify-center">
                  <button
                    onClick={() => onRemove(productKey, type, row.id)}
                    className="w-6 h-6 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selection Dialog */}
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
                <input
                  className="filter-input w-full pl-8 h-8 text-[13px]"
                  placeholder="搜索权益名称..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">暂无匹配的权益</div>
              ) : (
                filtered.map((item) => {
                  const alreadyAdded = rows.some((r) => r.packageName === item.name);
                  return (
                    <div
                      key={item.name}
                      onClick={() => {
                        if (!alreadyAdded) {
                          onAddWithName(item.name);
                          setShowPicker(false);
                          setSearch("");
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed bg-muted/30"
                          : "cursor-pointer hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '15' }}>
                        <Package className="h-4 w-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-foreground">{item.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                      </div>
                      {alreadyAdded && (
                        <span className="text-[11px] text-muted-foreground shrink-0">已添加</span>
                      )}
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
function StepBrandConfig({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div className="p-6">
      <SectionTitle title="品牌配置" />
      <div className="max-w-[640px] mx-auto space-y-5 mt-5">
        <FormRow label="品牌名称">
          <input className="filter-input w-full" placeholder="请输入品牌名称" value={form.brand} onChange={(e) => update("brand", e.target.value)} />
        </FormRow>
        <FormRow label="品牌Logo">
          <div className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary transition-colors">
            <Upload className="h-5 w-5" />
            <span className="text-[10px]">点击上传</span>
          </div>
        </FormRow>
        <FormRow label="品牌简介">
          <textarea className="filter-input w-full h-20 resize-none" placeholder="请输入品牌简介" />
        </FormRow>
      </div>
    </div>
  );
}

/* ============ Step 4: 完成 ============ */
function StepDone({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Check className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">创建成功</h3>
      <p className="text-[13px] text-muted-foreground mt-2">
        {TYPE_LABELS[type]}已成功创建，可在企业列表中查看
      </p>
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
      <label className={`text-[13px] text-muted-foreground pt-[7px] text-right shrink-0 ${wide ? "w-[120px]" : "w-[100px]"}`}>
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
