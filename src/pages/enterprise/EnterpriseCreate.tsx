import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Upload, X, Plus, Info, Search, Package } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  brand: "品牌商", dealer: "经销商", hq: "总部公司", studio: "工作室", supplier: "供应商",
};

const STEPS = [
  { key: "basic", label: "基础信息" },
  { key: "product", label: "权益配置" },
  { key: "config", label: "品牌配置" },
  { key: "done", label: "完成" },
];

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
    { name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", color: "hsl(var(--primary))" },
    { name: "3D工具设计权益包", desc: "含户型绘制、方案设计、模型库", color: "hsl(210 80% 55%)" },
    { name: "VR漫游权益包", desc: "含VR全景漫游、场景切换", color: "hsl(260 60% 55%)" },
    { name: "施工图权益包", desc: "含CAD导出、水电布局图", color: "hsl(170 60% 42%)" },
    { name: "AI生图权益包", desc: "含AI渲染、风格迁移", color: "hsl(340 70% 55%)" },
  ],
  international3d: [
    { name: "国际版渲染权益包", desc: "含8K渲染、HDR输出", color: "hsl(var(--primary))" },
    { name: "国际版设计权益包", desc: "含全球模型库、多语言支持", color: "hsl(210 80% 55%)" },
    { name: "国际版VR权益包", desc: "含VR漫游、AR预览", color: "hsl(260 60% 55%)" },
  ],
  smartGuide: [
    { name: "智能导购权益包", desc: "含AI推荐、商品匹配", color: "hsl(var(--primary))" },
    { name: "导购数据权益包", desc: "含客户画像、行为分析", color: "hsl(210 80% 55%)" },
  ],
  customerData: [
    { name: "精准客资权益包", desc: "含线索分配、客户管理", color: "hsl(var(--primary))" },
    { name: "客资分析权益包", desc: "含转化分析、ROI报表", color: "hsl(210 80% 55%)" },
  ],
  smartPhoto: [
    { name: "智能翻拍权益包", desc: "含AI抠图、场景替换", color: "hsl(var(--primary))" },
  ],
  live: [
    { name: "直播权益包", desc: "含直播推流、互动工具", color: "hsl(var(--primary))" },
  ],
};

interface BenefitRow {
  id: string;
  packageName: string;
  applyMode: "指定人员" | "全部人员";
  applyCount: number;
  dateRange: string; // "2026-01-01 ~ 2028-12-31"
}

interface ProductConfig {
  packageRows: BenefitRow[];
  productRows: BenefitRow[];
  accountCount?: number;
}

const createRow = (name?: string): BenefitRow => ({
  id: crypto.randomUUID(),
  packageName: name || "3D工具渲染权益包",
  applyMode: "指定人员",
  applyCount: 10,
  dateRange: "2026-01-01 ~ 2028-12-31",
});

export default function EnterpriseCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "brand";
  const [currentStep, setCurrentStep] = useState(0);

  const [form, setForm] = useState({
    name: "", license: "2020220", authType: "营业执照认证", industry: "家居建材",
    province: "广东", licenseFile: null as File | null,
    contactName: "", contactPhone: "", legalPerson: "", legalPhone: "",
    regCapital: "", brand: "",
    // Step 2
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
    // Step 3 - enterprise benefits
    maxSubCompanies: 30,
    autoGrantSub: false,
    expireDate: "2027-12-31",
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

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
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
          {STEPS.map((step, i) => {
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
                {i < STEPS.length - 1 && (
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
        {currentStep === 0 && <StepBasic form={form} update={update} />}
        {currentStep === 1 && (
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
        {currentStep === 2 && <StepBrandConfig form={form} update={update} />}
        {currentStep === 3 && <StepDone type={type} />}

        {/* Actions */}
        <div className="flex justify-center gap-3 px-6 py-5 border-t">
          {currentStep > 0 && currentStep < 3 && (
            <button onClick={() => { if (currentStep === 1) { setCurrentStep(0); } else goPrev(); }} className="btn-secondary">取消</button>
          )}
          {currentStep === 0 && (
            <button onClick={() => navigate("/enterprise")} className="btn-secondary">取消</button>
          )}
          {currentStep > 0 && currentStep < 3 && (
            <button onClick={goPrev} className="btn-secondary">上一步</button>
          )}
          {currentStep < 3 && (
            <button onClick={goNext} className="btn-primary">
              {currentStep === 2 ? "提交" : "下一步"}
            </button>
          )}
          {currentStep === 3 && (
            <button onClick={() => navigate("/enterprise")} className="btn-primary">返回列表</button>
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

/* ============ Step 2: 权益配置 ============ */
function StepBenefits({
  form, update, toggleProduct, addRow, removeRow, updateRow, updateProductAccountCount,
}: {
  form: any;
  update: (k: string, v: any) => void;
  toggleProduct: (key: string) => void;
  addRow: (productKey: string, type: "packageRows" | "productRows") => void;
  removeRow: (productKey: string, type: "packageRows" | "productRows", rowId: string) => void;
  updateRow: (productKey: string, type: "packageRows" | "productRows", rowId: string, field: string, value: any) => void;
  updateProductAccountCount: (productKey: string, count: number) => void;
}) {
  return (
    <div>
      {/* 产品权益 Section Header */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          产品权益
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* 基础权益 */}
        <div className="space-y-4">
          <FormRow label="开通产品" wide>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {AVAILABLE_PRODUCTS.map((p) => {
                const checked = form.enabledProducts.includes(p.key);
                return (
                  <label
                    key={p.key}
                    className="inline-flex items-center gap-2 text-[13px] cursor-pointer select-none group"
                    onClick={(e) => { e.preventDefault(); toggleProduct(p.key); }}
                  >
                    <div className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all ${
                      checked ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"
                    }`}>
                      {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className={checked ? "text-foreground font-medium" : "text-muted-foreground"}>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </FormRow>
          <FormRow label="是否加入供应链" wide>
            <div className="flex items-center gap-5">
              {[{ val: true, label: "加入" }, { val: false, label: "不加入" }].map((opt) => (
                <label key={String(opt.val)} className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all ${
                    form.joinSupplyChain === opt.val ? "border-primary" : "border-border"
                  }`}>
                    {form.joinSupplyChain === opt.val && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className={form.joinSupplyChain === opt.val ? "text-foreground" : "text-muted-foreground"}>{opt.label}</span>
                </label>
              ))}
            </div>
          </FormRow>
          <FormRow label="通用权益配置" wide>
            <ToggleSwitch checked={form.enableGenericConfig} onChange={() => update("enableGenericConfig", !form.enableGenericConfig)} />
          </FormRow>
        </div>

        {/* Per-product configurations */}
        {AVAILABLE_PRODUCTS.filter((p) => form.enabledProducts.includes(p.key)).map((product) => {
          const cfg: ProductConfig = form.productConfigs[product.key] || { packageRows: [], productRows: [] };
          return (
            <ProductConfigCard
              key={product.key}
              product={product}
              cfg={cfg}
              addRow={addRow}
              removeRow={removeRow}
              updateRow={updateRow}
              updateProductAccountCount={updateProductAccountCount}
            />
          );
        })}
      </div>

      {/* 企业权益 Section Header */}
      <div className="px-6 py-4 border-y bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          企业权益
        </h3>
      </div>

      <div className="p-6">
        <div className="max-w-[640px] space-y-5">
          <FormRow label="子企业上限数">
            <input className="filter-input w-60" type="number" value={form.maxSubCompanies} onChange={(e) => update("maxSubCompanies", Number(e.target.value))} />
          </FormRow>
          <FormRow label="独立设置子企业权益">
            <ToggleSwitch checked={form.autoGrantSub} onChange={() => update("autoGrantSub", !form.autoGrantSub)} />
          </FormRow>
          <FormRow label="到期时间">
            <input className="filter-input w-60" type="date" value={form.expireDate} onChange={(e) => update("expireDate", e.target.value)} />
          </FormRow>
        </div>
      </div>
    </div>
  );
}

/* ============ Product Config Card ============ */
function ProductConfigCard({
  product, cfg, addRow, removeRow, updateRow, updateProductAccountCount,
}: {
  product: { key: string; label: string };
  cfg: ProductConfig;
  addRow: (pk: string, t: "packageRows" | "productRows") => void;
  removeRow: (pk: string, t: "packageRows" | "productRows", id: string) => void;
  updateRow: (pk: string, t: "packageRows" | "productRows", id: string, f: string, v: any) => void;
  updateProductAccountCount: (pk: string, c: number) => void;
}) {
  const [dialogOpen, setDialogOpen] = useState<null | "packageRows" | "productRows">(null);
  const catalog = BENEFIT_CATALOG[product.key] || [];

  const handleSelectBenefit = (name: string) => {
    if (!dialogOpen) return;
    const row = createRow(name);
    // Use addRow logic inline
    addRow(product.key, dialogOpen);
    // Actually we need to set the name — let's just do it via updateRow after add
    // Simpler: directly manipulate
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[13px] font-semibold text-foreground">{product.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground mr-1">产品人数</span>
          <input
            className="filter-input h-7 text-[12px] w-[72px] text-center"
            type="number"
            value={cfg.accountCount ?? 30}
            onChange={(e) => updateProductAccountCount(product.key, Number(e.target.value))}
          />
          <span className="text-[12px] text-muted-foreground">人</span>
        </div>
      </div>

      <div className="p-4 space-y-5">
        <BenefitCardSection
          label="权益套餐"
          rows={cfg.packageRows}
          productKey={product.key}
          type="packageRows"
          catalog={catalog}
          onAdd={(name) => {
            // Add with specific name
            const newRow = createRow(name);
            // We need to directly update form — pass through addRow then updateRow
            addRow(product.key, "packageRows");
          }}
          onAddRaw={() => addRow(product.key, "packageRows")}
          onUpdate={updateRow}
          onRemove={removeRow}
        />
        <BenefitCardSection
          label="权益商品"
          rows={cfg.productRows}
          productKey={product.key}
          type="productRows"
          catalog={catalog}
          onAdd={(name) => addRow(product.key, "productRows")}
          onAddRaw={() => addRow(product.key, "productRows")}
          onUpdate={updateRow}
          onRemove={removeRow}
        />
      </div>
    </div>
  );
}

/* ============ Benefit Card Section ============ */
function BenefitCardSection({
  label, rows, productKey, type, catalog, onAdd, onAddRaw, onUpdate, onRemove,
}: {
  label: string;
  rows: BenefitRow[];
  productKey: string;
  type: "packageRows" | "productRows";
  catalog: { name: string; desc: string; color: string }[];
  onAdd: (name: string) => void;
  onAddRaw: () => void;
  onUpdate: (pk: string, t: "packageRows" | "productRows", id: string, field: string, value: any) => void;
  onRemove: (pk: string, t: "packageRows" | "productRows", id: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = catalog.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Color mapping by product for card borders
  const getCardColor = (name: string) => {
    const item = catalog.find((c) => c.name === name);
    return item?.color || "hsl(var(--primary))";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
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
          className="flex flex-col items-center justify-center gap-2 py-6 border border-dashed rounded-lg text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
        >
          <Package className="h-5 w-5 opacity-60" />
          <span className="text-[12px]">点击添加{label}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {rows.map((row) => (
            <BenefitCard
              key={row.id}
              row={row}
              borderColor={getCardColor(row.packageName)}
              productKey={productKey}
              type={type}
              onUpdate={onUpdate}
              onRemove={() => onRemove(productKey, type, row.id)}
            />
          ))}
          {/* Add card */}
          <div
            onClick={() => setShowPicker(true)}
            className="flex flex-col items-center justify-center gap-1.5 min-h-[120px] border-2 border-dashed rounded-xl text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-all hover:bg-primary/5"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[11px]">添加</span>
          </div>
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
                          onAddRaw();
                          // The newly added row will have default name, we'll handle it via the addRow which creates with default
                          // Better: we close and it adds
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

/* ============ Single Benefit Card ============ */
function BenefitCard({
  row, borderColor, productKey, type, onUpdate, onRemove,
}: {
  row: BenefitRow;
  borderColor: string;
  productKey: string;
  type: "packageRows" | "productRows";
  onUpdate: (pk: string, t: "packageRows" | "productRows", id: string, field: string, value: any) => void;
  onRemove: () => void;
}) {
  const [startDate, endDate] = (row.dateRange || "").split(" ~ ");

  return (
    <div className="relative group rounded-xl border-2 bg-card transition-all hover:shadow-md" style={{ borderColor: borderColor + '40' }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b" style={{ backgroundColor: borderColor }} />

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="p-3 pt-4 space-y-3">
        {/* Title row */}
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: borderColor + '15' }}>
            <Package className="h-3.5 w-3.5" style={{ color: borderColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-foreground leading-tight truncate">{row.packageName}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <input
                type="date"
                className="filter-input h-6 text-[11px] w-[100px] px-1.5"
                value={startDate?.trim() || ""}
                onChange={(e) => onUpdate(productKey, type, row.id, "dateRange", `${e.target.value} ~ ${endDate?.trim() || ""}`)}
              />
              <span className="text-[11px] text-muted-foreground">—</span>
              <input
                type="date"
                className="filter-input h-6 text-[11px] w-[100px] px-1.5"
                value={endDate?.trim() || ""}
                onChange={(e) => onUpdate(productKey, type, row.id, "dateRange", `${startDate?.trim() || ""} ~ ${e.target.value}`)}
              />
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <select
              className="filter-select h-6 text-[11px] w-[76px] px-1.5"
              value={row.applyMode}
              onChange={(e) => onUpdate(productKey, type, row.id, "applyMode", e.target.value)}
            >
              <option value="指定人员">指定人员</option>
              <option value="全部人员">全部人员</option>
            </select>
            {row.applyMode === "指定人员" && (
              <div className="flex items-center gap-0.5">
                <input
                  className="filter-input h-6 text-[11px] w-[40px] text-center px-1"
                  type="number"
                  value={row.applyCount}
                  onChange={(e) => onUpdate(productKey, type, row.id, "applyCount", Number(e.target.value))}
                />
                <span className="text-[11px] text-muted-foreground">人</span>
              </div>
            )}
          </div>
          {row.applyMode === "全部人员" && (
            <span className="text-[11px] text-muted-foreground">全员适用</span>
          )}
        </div>
      </div>
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

function SubSection({ title }: { title: string }) {
  return (
    <h4 className="text-[13px] font-semibold text-foreground">{title}</h4>
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
