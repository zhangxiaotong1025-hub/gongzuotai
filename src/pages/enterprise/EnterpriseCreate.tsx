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

const BENEFIT_PACKAGES = [
  "3D工具渲染权益包", "3D工具设计权益包", "VR漫游权益包", "施工图权益包",
  "渲染权益包", "AI生图权益包", "高清渲染权益包",
];

interface BenefitRow {
  id: string;
  packageName: string;
  applyMode: "指定人员" | "全部人员";
  applyCount: number;
  startDate: string;
  endDate: string;
}

interface ProductConfig {
  packageRows: BenefitRow[];
  productRows: BenefitRow[];
  accountCount?: number;
}

const createRow = (): BenefitRow => ({
  id: crypto.randomUUID(),
  packageName: "3D工具渲染权益包",
  applyMode: "指定人员",
  applyCount: 10,
  startDate: "2026-12-12",
  endDate: "2028-12-12",
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
        packageRows: [createRow(), createRow(), createRow(), createRow()],
        productRows: [createRow()],
      },
      smartGuide: {
        accountCount: 30,
        packageRows: [
          { ...createRow(), packageName: "渲染权益包" },
          { ...createRow(), packageName: "AI生图权益包", applyCount: 20 },
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

  const addRow = (productKey: string, type: "packageRows" | "productRows") => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey] || { packageRows: [], productRows: [] };
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: { ...cfg, [type]: [...cfg[type], createRow()] },
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
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[13px] font-semibold text-foreground">{product.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground mr-2">产品人数</span>
          <input
            className="filter-input h-7 text-[12px] w-[80px] text-center"
            type="number"
            value={cfg.accountCount ?? 30}
            onChange={(e) => updateProductAccountCount(product.key, Number(e.target.value))}
          />
          <span className="text-[12px] text-muted-foreground">人</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4">
        <BenefitSection
          label="权益套餐"
          rows={cfg.packageRows}
          productKey={product.key}
          type="packageRows"
          onAdd={() => addRow(product.key, "packageRows")}
          onUpdate={updateRow}
          onRemove={removeRow}
        />
        <BenefitSection
          label="权益商品"
          rows={cfg.productRows}
          productKey={product.key}
          type="productRows"
          onAdd={() => addRow(product.key, "productRows")}
          onUpdate={updateRow}
          onRemove={removeRow}
        />
      </div>
    </div>
  );
}

/* ============ Benefit Section ============ */
function BenefitSection({
  label, rows, productKey, type, onAdd, onUpdate, onRemove,
}: {
  label: string;
  rows: BenefitRow[];
  productKey: string;
  type: "packageRows" | "productRows";
  onAdd: () => void;
  onUpdate: (pk: string, t: "packageRows" | "productRows", id: string, field: string, value: any) => void;
  onRemove: (pk: string, t: "packageRows" | "productRows", id: string) => void;
}) {
  return (
    <div>
      {rows.length > 0 && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
          <button onClick={onAdd} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium">
            <Plus className="h-3 w-3" /> 添加
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <div
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 py-3 border border-dashed rounded-lg text-[12px] text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          添加{label}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[minmax(160px,1.2fr)_110px_90px_minmax(220px,1fr)_32px] gap-0 bg-muted/40 border-b text-[12px] text-muted-foreground font-medium">
            <div className="px-3 py-1.5">名称</div>
            <div className="px-3 py-1.5">应用方式</div>
            <div className="px-3 py-1.5">人数</div>
            <div className="px-3 py-1.5">授权时间</div>
            <div />
          </div>
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className={`grid grid-cols-[minmax(160px,1.2fr)_110px_90px_minmax(220px,1fr)_32px] gap-0 items-center text-[12px] hover:bg-muted/20 transition-colors ${
                idx < rows.length - 1 ? "border-b border-border/50" : ""
              }`}
            >
              <div className="px-3 py-2">
                <select className="filter-select h-7 text-[12px] w-full" value={row.packageName}
                  onChange={(e) => onUpdate(productKey, type, row.id, "packageName", e.target.value)}>
                  {BENEFIT_PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="px-3 py-2">
                <select className="filter-select h-7 text-[12px] w-full" value={row.applyMode}
                  onChange={(e) => onUpdate(productKey, type, row.id, "applyMode", e.target.value)}>
                  <option value="指定人员">指定人员</option>
                  <option value="全部人员">全部人员</option>
                </select>
              </div>
              <div className="px-3 py-2">
                {row.applyMode === "指定人员" ? (
                  <div className="flex items-center gap-1">
                    <input className="filter-input h-7 text-[12px] w-[48px] text-center" type="number" value={row.applyCount}
                      onChange={(e) => onUpdate(productKey, type, row.id, "applyCount", Number(e.target.value))} />
                    <span className="text-muted-foreground">人</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">全员</span>
                )}
              </div>
              <div className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <input className="filter-input h-7 text-[12px] flex-1 min-w-0" type="date" value={row.startDate}
                    onChange={(e) => onUpdate(productKey, type, row.id, "startDate", e.target.value)} />
                  <span className="text-muted-foreground shrink-0">~</span>
                  <input className="filter-input h-7 text-[12px] flex-1 min-w-0" type="date" value={row.endDate}
                    onChange={(e) => onUpdate(productKey, type, row.id, "endDate", e.target.value)} />
                </div>
              </div>
              <div className="flex justify-center">
                <button onClick={() => onRemove(productKey, type, row.id)}
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
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
