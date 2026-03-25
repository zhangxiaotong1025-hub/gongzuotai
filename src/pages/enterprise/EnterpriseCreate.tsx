import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Upload, X, Plus, Info } from "lucide-react";

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
    const enabled = form.enabledProducts;
    if (enabled.includes(key)) {
      update("enabledProducts", enabled.filter((k) => k !== key));
    } else {
      update("enabledProducts", [...enabled, key]);
      if (!form.productConfigs[key]) {
        setForm((prev) => ({
          ...prev,
          enabledProducts: [...prev.enabledProducts.filter(k => k !== key), key],
          productConfigs: {
            ...prev.productConfigs,
            [key]: { packageRows: [], productRows: [], accountCount: 30 },
          },
        }));
      }
    }
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
      <div className="bg-muted/60 px-6 py-3 border-b">
        <h3 className="text-sm font-semibold text-foreground">产品权益</h3>
      </div>

      <div className="p-6 space-y-8">
        {/* 基础权益 */}
        <div>
          <SubSection title="基础权益" />
          <div className="mt-4 space-y-4 ml-4">
            <FormRow label="开启产品" wide>
              <div className="flex flex-wrap items-center gap-4">
                {AVAILABLE_PRODUCTS.map((p) => {
                  const checked = form.enabledProducts.includes(p.key);
                  return (
                    <label key={p.key} className="inline-flex items-center gap-1.5 text-[13px] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleProduct(p.key)}
                        className="w-3.5 h-3.5 rounded border-border accent-primary"
                      />
                      {p.label}
                    </label>
                  );
                })}
              </div>
            </FormRow>
            <FormRow label="是否加入供应链" wide>
              <div className="flex items-center gap-4">
                {[{ val: true, label: "加入" }, { val: false, label: "不加入" }].map((opt) => (
                  <label key={String(opt.val)} className="inline-flex items-center gap-1.5 text-[13px] cursor-pointer">
                    <input
                      type="radio"
                      name="supplyChain"
                      checked={form.joinSupplyChain === opt.val}
                      onChange={() => update("joinSupplyChain", opt.val)}
                      className="accent-primary"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FormRow>
            <FormRow label="通用权益配置" wide>
              <ToggleSwitch checked={form.enableGenericConfig} onChange={() => update("enableGenericConfig", !form.enableGenericConfig)} />
            </FormRow>
          </div>
        </div>

        {/* Per-product configurations */}
        {AVAILABLE_PRODUCTS.filter((p) => form.enabledProducts.includes(p.key)).map((product) => {
          const cfg: ProductConfig = form.productConfigs[product.key] || { packageRows: [], productRows: [] };
          const showAccountCount = product.key === "smartGuide" || product.key === "customerData";

          return (
            <div key={product.key}>
              <div className="flex items-center gap-3 mb-4">
                <SubSection title={product.label} />
                <button
                  onClick={() => addRow(product.key, "packageRows")}
                  className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-3 w-3" /> 添加权益套餐
                </button>
                <button
                  onClick={() => addRow(product.key, "productRows")}
                  className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="h-3 w-3" /> 添加权益商品
                </button>
              </div>

              <div className="ml-4 space-y-5">
                {showAccountCount && (
                  <FormRow label="账号数量" wide>
                    <input
                      className="filter-input w-60"
                      type="number"
                      value={cfg.accountCount ?? 30}
                      onChange={(e) => updateProductAccountCount(product.key, Number(e.target.value))}
                    />
                  </FormRow>
                )}

                {/* 权益套餐配置 */}
                {cfg.packageRows.length > 0 && (
                  <BenefitTable
                    label="权益套餐配置"
                    rows={cfg.packageRows}
                    productKey={product.key}
                    type="packageRows"
                    onUpdate={updateRow}
                    onRemove={removeRow}
                  />
                )}

                {/* 权益商品配置 */}
                {cfg.productRows.length > 0 && (
                  <BenefitTable
                    label="权益商品配置"
                    rows={cfg.productRows}
                    productKey={product.key}
                    type="productRows"
                    onUpdate={updateRow}
                    onRemove={removeRow}
                  />
                )}

                {cfg.packageRows.length === 0 && cfg.productRows.length === 0 && !showAccountCount && (
                  <div className="text-[13px] text-muted-foreground ml-[140px] py-2">暂无配置，请点击上方按钮添加权益</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 企业权益 Section Header */}
      <div className="bg-muted/60 px-6 py-3 border-y">
        <h3 className="text-sm font-semibold text-foreground">企业权益</h3>
      </div>

      <div className="p-6">
        <div className="max-w-[640px] mx-auto space-y-5">
          <FormRow label="子企业上限数">
            <input className="filter-input w-full" type="number" value={form.maxSubCompanies} onChange={(e) => update("maxSubCompanies", Number(e.target.value))} />
          </FormRow>
          <FormRow label="独立设置子企业权益">
            <ToggleSwitch checked={form.autoGrantSub} onChange={() => update("autoGrantSub", !form.autoGrantSub)} />
          </FormRow>
          <FormRow label="到期时间">
            <select className="filter-select w-full" value={form.expireDate} onChange={(e) => update("expireDate", e.target.value)}>
              <option value="2027-12-31">2027-12-31</option>
              <option value="2028-12-31">2028-12-31</option>
              <option value="2029-12-31">2029-12-31</option>
            </select>
          </FormRow>
        </div>
      </div>
    </div>
  );
}

/* ============ Benefit Table ============ */
function BenefitTable({
  label, rows, productKey, type, onUpdate, onRemove,
}: {
  label: string;
  rows: BenefitRow[];
  productKey: string;
  type: "packageRows" | "productRows";
  onUpdate: (pk: string, t: "packageRows" | "productRows", id: string, field: string, value: any) => void;
  onRemove: (pk: string, t: "packageRows" | "productRows", id: string) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[13px] text-muted-foreground pt-2 text-right shrink-0 w-[140px]">{label}：</label>
      <div className="flex-1 min-w-0 space-y-2">
        {/* Column headers */}
        <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-1">
          <span className="w-[160px]">权益套餐</span>
          <span className="w-[100px]">应用方式</span>
          <span className="w-[80px]">应用人员</span>
          <span className="flex-1">权益时间</span>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3">
            {/* Package tag */}
            <div className="w-[160px] shrink-0">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-[12px] text-foreground font-medium">
                {row.packageName}
                <Info className="h-3 w-3 text-muted-foreground" />
              </span>
            </div>
            {/* Apply mode */}
            <div className="w-[100px] shrink-0">
              <select
                className="filter-select h-8 text-[12px] w-full"
                value={row.applyMode}
                onChange={(e) => onUpdate(productKey, type, row.id, "applyMode", e.target.value)}
              >
                <option value="指定人员">指定人员</option>
                <option value="全部人员">全部人员</option>
              </select>
            </div>
            {/* Apply count */}
            <div className="w-[80px] shrink-0">
              {row.applyMode === "指定人员" ? (
                <div className="flex items-center gap-1">
                  <input
                    className="filter-input h-8 text-[12px] w-[50px]"
                    type="number"
                    value={row.applyCount}
                    onChange={(e) => onUpdate(productKey, type, row.id, "applyCount", Number(e.target.value))}
                  />
                  <span className="text-[12px] text-muted-foreground">人</span>
                </div>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-[12px] text-muted-foreground">全部 人</span>
              )}
            </div>
            {/* Date range */}
            <div className="flex items-center gap-1 flex-1">
              <input
                className="filter-input h-8 text-[12px] w-[110px]"
                type="date"
                value={row.startDate}
                onChange={(e) => onUpdate(productKey, type, row.id, "startDate", e.target.value)}
              />
              <span className="text-muted-foreground text-[12px]">~</span>
              <input
                className="filter-input h-8 text-[12px] w-[110px]"
                type="date"
                value={row.endDate}
                onChange={(e) => onUpdate(productKey, type, row.id, "endDate", e.target.value)}
              />
            </div>
            {/* Delete */}
            <button
              onClick={() => onRemove(productKey, type, row.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
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
    <div className="flex items-start gap-4">
      <label className={`text-[13px] text-muted-foreground pt-2 text-right shrink-0 ${wide ? "w-[140px]" : "w-[120px]"}`}>
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}：
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
