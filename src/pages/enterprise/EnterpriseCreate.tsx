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
  mall: "卖场",
  brand: "品牌商",
  dealer: "经销商",
  decoration: "装修公司",
  studio: "工作室",
  store: "门店",
  supplier: "供应商",
};

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

type BenefitTone = "blue" | "teal" | "violet" | "amber" | "rose";

const BENEFIT_TONE_VARS: Record<BenefitTone, string> = {
  blue: "var(--benefit-blue)",
  teal: "var(--benefit-teal)",
  violet: "var(--benefit-violet)",
  amber: "var(--benefit-amber)",
  rose: "var(--benefit-rose)",
};

const BENEFIT_CATALOG: Record<string, { name: string; desc: string; tone: BenefitTone }[]> = {
  domestic3d: [
    { name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", tone: "blue" },
    { name: "3D工具设计权益包", desc: "含户型绘制、方案设计、模型库", tone: "teal" },
    { name: "VR漫游权益包", desc: "含VR全景漫游、场景切换", tone: "violet" },
    { name: "施工图权益包", desc: "含CAD导出、水电布局图", tone: "amber" },
    { name: "AI生图权益包", desc: "含AI渲染、风格迁移", tone: "rose" },
  ],
  international3d: [
    { name: "国际版渲染权益包", desc: "含8K渲染、HDR输出", tone: "blue" },
    { name: "国际版设计权益包", desc: "含全球模型库、多语言支持", tone: "teal" },
    { name: "国际版VR权益包", desc: "含VR漫游、AR预览", tone: "violet" },
  ],
  smartGuide: [
    { name: "智能导购权益包", desc: "含AI推荐、商品匹配", tone: "teal" },
    { name: "导购数据权益包", desc: "含客户画像、行为分析", tone: "blue" },
  ],
  customerData: [
    { name: "精准客资权益包", desc: "含线索分配、客户管理", tone: "rose" },
    { name: "客资分析权益包", desc: "含转化分析、ROI报表", tone: "amber" },
  ],
  smartPhoto: [{ name: "智能翻拍权益包", desc: "含AI抠图、场景替换", tone: "violet" }],
  live: [{ name: "直播权益包", desc: "含直播推流、互动工具", tone: "teal" }],
};

function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = (value || "").split(" ~ ");
  const startDate = parts[0] ? new Date(parts[0]) : undefined;
  const endDate = parts[1] ? new Date(parts[1]) : undefined;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      onChange("");
      return;
    }
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
            "h-9 w-full justify-start rounded-lg border-input bg-card px-3 text-left text-[13px] font-normal shadow-none hover:bg-muted/40",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50 shrink-0" />
          {displayText || <span>选择时间段</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl p-0" align="start">
        <Calendar
          mode="range"
          selected={startDate && endDate ? { from: startDate, to: endDate } : startDate ? { from: startDate, to: undefined } : undefined}
          onSelect={handleSelect as never}
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
  const isSub = Boolean(parentId);

  const [selectedSubType, setSelectedSubType] = useState(searchParams.get("type") || "brand");
  const type = isSub ? selectedSubType : (searchParams.get("type") || "brand");

  const brandRelation = TYPE_BRAND_RELATION[type] || "none";
  const steps = useMemo(() => getStepsForType(type), [type]);
  const [currentStep, setCurrentStep] = useState(0);

  const allowedSubTypes = isSub ? (SUB_TYPE_ALLOWED[parentType] || []) : [];
  void allowedSubTypes;

  const [form, setForm] = useState({
    name: "",
    license: "2020220",
    authType: "营业执照认证",
    industry: "家居建材",
    province: "广东",
    licenseFile: null as File | null,
    contactName: "",
    contactPhone: "",
    legalPerson: "",
    legalPhone: "",
    regCapital: "",
    brand: "",
    orgStructure: "上级/本级",
    region: "",
    address: "",
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
    ownedBrands: [] as OwnedBrand[],
    agentBrandIds: [] as string[],
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleProduct = (key: string) => {
    setForm((prev) => {
      const enabled = prev.enabledProducts;
      if (enabled.includes(key)) {
        return { ...prev, enabledProducts: enabled.filter((k) => k !== key) };
      }
      const newConfigs = prev.productConfigs[key]
        ? prev.productConfigs
        : { ...prev.productConfigs, [key]: { packageRows: [], productRows: [], accountCount: 30 } };
      return { ...prev, enabledProducts: [...enabled, key], productConfigs: newConfigs };
    });
  };

  const addRow = (productKey: string, typeKey: "packageRows" | "productRows", name?: string) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey] || { packageRows: [], productRows: [] };
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: { ...cfg, [typeKey]: [...cfg[typeKey], createRow(name)] },
        },
      };
    });
  };

  const removeRow = (productKey: string, typeKey: "packageRows" | "productRows", rowId: string) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey];
      if (!cfg) return prev;
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: { ...cfg, [typeKey]: cfg[typeKey].filter((r) => r.id !== rowId) },
        },
      };
    });
  };

  const updateRow = (productKey: string, typeKey: "packageRows" | "productRows", rowId: string, field: string, value: unknown) => {
    setForm((prev) => {
      const cfg = prev.productConfigs[productKey];
      if (!cfg) return prev;
      return {
        ...prev,
        productConfigs: {
          ...prev.productConfigs,
          [productKey]: {
            ...cfg,
            [typeKey]: cfg[typeKey].map((r) => (r.id === rowId ? { ...r, [field]: value } : r)),
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

  const addOwnedBrand = () => {
    update("ownedBrands", [
      ...form.ownedBrands,
      { id: crypto.randomUUID(), name: "", logo: null, country: "中国", info: "", categories: [], series: [] },
    ]);
  };

  const removeOwnedBrand = (id: string) => update("ownedBrands", form.ownedBrands.filter((b: OwnedBrand) => b.id !== id));

  const updateOwnedBrand = (id: string, field: string, value: unknown) => {
    update("ownedBrands", form.ownedBrands.map((b: OwnedBrand) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const toggleAgentBrand = (brandId: string) => {
    const ids = form.agentBrandIds as string[];
    update("agentBrandIds", ids.includes(brandId) ? ids.filter((id) => id !== brandId) : [...ids, brandId]);
  };

  const currentStepKey = steps[currentStep]?.key;
  const lastStepIndex = steps.length - 1;
  const isLastContentStep = currentStep === lastStepIndex - 1;

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, lastStepIndex));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/enterprise")} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
          企业管理
        </button>
        <span className="text-muted-foreground/30 text-xs">/</span>
        {isSub && parentName && (
          <>
            <span className="text-[13px] text-muted-foreground">{parentName}</span>
            <span className="text-muted-foreground/30 text-xs">/</span>
          </>
        )}
        <span className="text-[14px] text-foreground font-semibold tracking-tight">
          {searchParams.get("mode") === "edit" ? "编辑企业" : isSub ? "新建子企业" : `新建${TYPE_LABELS[type] || "企业"}`}
        </span>
      </div>

      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-center max-w-[720px] mx-auto">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-all border",
                      isCompleted && "bg-primary text-primary-foreground border-primary shadow-sm",
                      isCurrent && "bg-primary text-primary-foreground border-primary shadow-sm",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn("text-[13px] whitespace-nowrap transition-colors", isCurrent ? "text-foreground font-medium" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={cn("h-px", i < currentStep ? "bg-primary/40" : "bg-border")} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {currentStepKey === "basic" && (
          isSub
            ? <StepSubBasic form={form} update={update} parentName={parentName} type={type} />
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

        <div className="flex justify-center gap-3 px-6 py-5 border-t border-border/70 bg-muted/20">
          {currentStep === 0 && (
            <button onClick={() => navigate("/enterprise")} className="btn-secondary">取消</button>
          )}
          {currentStep > 0 && currentStepKey !== "done" && (
            <>
              <button onClick={() => navigate("/enterprise")} className="btn-secondary">取消</button>
              <button onClick={goPrev} className="btn-secondary">
                <ChevronLeft className="h-4 w-4" />
                上一步
              </button>
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

function StepBasic({ form, update }: { form: Record<string, any>; update: (k: string, v: unknown) => void }) {
  return (
    <div className="p-6">
      <div className="max-w-[760px] mx-auto space-y-6">
        <SectionTitle title="基础信息" description="统一填写企业主体信息，所有字段按同一栅格和间距规范排布。" />
        <SectionCard>
          <div className="space-y-5">
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
              <UploadCard label="点击上传" />
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
        </SectionCard>
      </div>
    </div>
  );
}

function StepSubBasic({
  form,
  update,
  parentName,
  type,
}: {
  form: Record<string, any>;
  update: (k: string, v: unknown) => void;
  parentName: string;
  type: string;
}) {
  return (
    <div className="p-6">
      <div className="max-w-[760px] mx-auto space-y-6">
        <SectionTitle title="基础信息" description="子企业沿用总部表单栅格规范，保证编辑体验一致。" />
        <SectionCard>
          <div className="space-y-5">
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
        </SectionCard>
      </div>
    </div>
  );
}

function StepBenefits({
  form,
  update,
  toggleProduct,
  addRow,
  removeRow,
  updateRow,
  updateProductAccountCount,
}: {
  form: Record<string, any>;
  update: (k: string, v: unknown) => void;
  toggleProduct: (key: string) => void;
  addRow: (productKey: string, type: "packageRows" | "productRows", name?: string) => void;
  removeRow: (productKey: string, type: "packageRows" | "productRows", rowId: string) => void;
  updateRow: (productKey: string, type: "packageRows" | "productRows", rowId: string, field: string, value: unknown) => void;
  updateProductAccountCount: (productKey: string, count: number) => void;
}) {
  return (
    <div className="p-6">
      <div className="space-y-6">
        <SectionTitle title="权益配置" description="同一产品块、同一列表、同一字段高度，避免编辑页视觉跳动。" />

        <SectionCard>
          <FormRow label="开通产品" wide>
            <div className="flex flex-wrap items-center gap-3">
              {AVAILABLE_PRODUCTS.map((p) => {
                const checked = form.enabledProducts.includes(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggleProduct(p.key)}
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-[13px] transition-all",
                      checked
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    <span className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-all",
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    )}>
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    {p.label}
                  </button>
                );
              })}
            </div>
          </FormRow>
        </SectionCard>

        {form.enabledProducts.map((pKey: string) => {
          const product = AVAILABLE_PRODUCTS.find((p) => p.key === pKey);
          if (!product) return null;
          const cfg = form.productConfigs[pKey] || { packageRows: [], productRows: [], accountCount: 30 };
          const catalog = BENEFIT_CATALOG[pKey] || [];
          return (
            <div key={pKey} className="rounded-2xl border border-border/70 overflow-hidden bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/25 px-5 py-4">
                <div>
                  <div className="text-[14px] font-semibold text-foreground">{product.label}</div>
                  <div className="text-[12px] text-muted-foreground mt-1">统一配置人数、权益包与权益商品</div>
                </div>
                <span className="rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">
                  已配置 {cfg.packageRows.length + cfg.productRows.length} 项
                </span>
              </div>
              <div className="p-5 space-y-5">
                <FormRow label="产品人数" wide>
                  <div className="flex items-center gap-2">
                    <input className="filter-input w-32" type="number" value={cfg.accountCount || 30} onChange={(e) => updateProductAccountCount(pKey, Number(e.target.value))} />
                    <span className="text-[12px] text-muted-foreground">人</span>
                  </div>
                </FormRow>
                <BenefitListSection
                  label="权益包"
                  productKey={pKey}
                  type="packageRows"
                  rows={cfg.packageRows}
                  catalog={catalog}
                  onAdd={addRow}
                  onRemove={removeRow}
                  onUpdate={updateRow}
                  onAddWithName={(name) => addRow(pKey, "packageRows", name)}
                />
                <BenefitListSection
                  label="权益商品"
                  productKey={pKey}
                  type="productRows"
                  rows={cfg.productRows}
                  catalog={catalog}
                  onAdd={addRow}
                  onRemove={removeRow}
                  onUpdate={updateRow}
                  onAddWithName={(name) => addRow(pKey, "productRows", name)}
                />
              </div>
            </div>
          );
        })}

        <SectionCard>
          <SubSectionTitle title="企业权益" />
          <div className="space-y-4 mt-5">
            <FormRow label="子企业上限" wide>
              <div className="flex items-center gap-2">
                <input className="filter-input w-32" type="number" value={form.maxSubCompanies} onChange={(e) => update("maxSubCompanies", Number(e.target.value))} />
                <span className="text-[12px] text-muted-foreground">个</span>
              </div>
            </FormRow>
            <FormRow label="独立配置子企业权益" wide>
              <ToggleSwitch checked={form.autoGrantSub} onChange={() => update("autoGrantSub", !form.autoGrantSub)} />
            </FormRow>
            <FormRow label="到期时间" wide>
              <input className="filter-input w-48" type="date" value={form.expireDate} onChange={(e) => update("expireDate", e.target.value)} />
            </FormRow>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function BenefitListSection({
  label,
  productKey,
  type,
  rows,
  catalog,
  onAdd,
  onRemove,
  onUpdate,
  onAddWithName,
}: {
  label: string;
  productKey: string;
  type: "packageRows" | "productRows";
  rows: BenefitRow[];
  catalog: { name: string; desc: string; tone: BenefitTone }[];
  onAdd: (productKey: string, type: "packageRows" | "productRows") => void;
  onRemove: (productKey: string, type: "packageRows" | "productRows", rowId: string) => void;
  onUpdate: (productKey: string, type: "packageRows" | "productRows", rowId: string, field: string, value: unknown) => void;
  onAddWithName: (name: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = catalog.filter((c) => c.name.includes(search));

  const getToneVar = (name: string) => BENEFIT_TONE_VARS[catalog.find((c) => c.name === name)?.tone || "blue"];
  void onAdd;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-muted-foreground tracking-wide">{label}</span>
        <button onClick={() => setShowPicker(true)} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium">
          <Plus className="h-3 w-3" /> 添加
        </button>
      </div>

      {rows.length === 0 ? (
        <div onClick={() => setShowPicker(true)} className="flex flex-col items-center justify-center gap-2 py-7 border border-dashed border-border rounded-xl text-muted-foreground cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
          <Plus className="h-4 w-4 opacity-60" />
          <span className="text-[12px]">点击添加{label}</span>
        </div>
      ) : (
        <div className="border border-border/70 rounded-xl overflow-hidden bg-card">
          <div className="grid grid-cols-[minmax(220px,1fr)_120px_84px_minmax(240px,1fr)_36px] bg-muted/35 border-b border-border/60 text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">
            <div className="px-4 py-3">名称</div>
            <div className="px-4 py-3">应用方式</div>
            <div className="px-4 py-3">人数</div>
            <div className="px-4 py-3">授权时间</div>
            <div />
          </div>
          {rows.map((row) => {
            const toneVar = getToneVar(row.packageName);
            return (
              <div key={row.id} className="grid grid-cols-[minmax(220px,1fr)_120px_84px_minmax(240px,1fr)_36px] items-center border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors group">
                <div className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium whitespace-nowrap" style={{ background: `hsl(${toneVar} / 0.08)`, color: `hsl(${toneVar})` }}>
                    <Package className="h-3 w-3 shrink-0" />
                    {row.packageName}
                  </span>
                </div>
                <div className="px-3 py-3">
                  <select className="filter-select h-9 w-full px-2 text-[13px]" value={row.applyMode} onChange={(e) => onUpdate(productKey, type, row.id, "applyMode", e.target.value)}>
                    <option value="指定人员">指定人员</option>
                    <option value="全部人员">全部人员</option>
                  </select>
                </div>
                <div className="px-3 py-3">
                  {row.applyMode === "指定人员" ? (
                    <input className="filter-input h-9 w-full px-2 text-center" type="number" value={row.applyCount} onChange={(e) => onUpdate(productKey, type, row.id, "applyCount", Number(e.target.value))} />
                  ) : (
                    <span className="text-[13px] text-muted-foreground">全员</span>
                  )}
                </div>
                <div className="px-4 py-3">
                  <DateRangePicker value={row.dateRange} onChange={(val) => onUpdate(productKey, type, row.id, "dateRange", val)} />
                </div>
                <div className="px-2 py-3 flex justify-center">
                  <button onClick={() => onRemove(productKey, type, row.id)} className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPicker(false)}>
          <div className="bg-card rounded-2xl border border-border/70 w-[560px] max-h-[520px] flex flex-col overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/25">
              <div>
                <h4 className="text-[14px] font-semibold text-foreground">选择{label}</h4>
                <p className="text-[12px] text-muted-foreground mt-1">同一权益仅可添加一次</p>
              </div>
              <button onClick={() => setShowPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-border/60">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className="filter-input w-full pl-9" placeholder="搜索权益名称..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-muted-foreground">暂无匹配的权益</div>
              ) : (
                filtered.map((item) => {
                  const alreadyAdded = rows.some((r) => r.packageName === item.name);
                  const toneVar = BENEFIT_TONE_VARS[item.tone];
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
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed bg-muted/20"
                          : "cursor-pointer hover:border-primary/30 hover:bg-muted/20",
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `hsl(${toneVar} / 0.08)` }}>
                        <Package className="h-4 w-4" style={{ color: `hsl(${toneVar})` }} />
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

function StepBrandConfig({
  form,
  update,
  brandRelation,
  addOwnedBrand,
  removeOwnedBrand,
  updateOwnedBrand,
  toggleAgentBrand,
}: {
  form: Record<string, any>;
  update: (k: string, v: unknown) => void;
  brandRelation: BrandRelation;
  addOwnedBrand: () => void;
  removeOwnedBrand: (id: string) => void;
  updateOwnedBrand: (id: string, field: string, value: unknown) => void;
  toggleAgentBrand: (brandId: string) => void;
}) {
  const showOwn = brandRelation === "own" || brandRelation === "both";
  const showAgent = brandRelation === "agent" || brandRelation === "both";
  void update;

  return (
    <div className="p-6">
      <div className="max-w-[980px] mx-auto space-y-6">
        <SectionTitle title="品牌配置" description="根据企业类型决定品牌权限，所有品牌区块遵循统一卡片规范。" />

        <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/25 px-4 py-4 text-[12px] text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
          <div className="leading-6">
            {showOwn && showAgent ? (
              <span><strong className="text-foreground font-semibold">拥有品牌</strong>：可上传公有模型，拥有品牌完整管理权限；<strong className="text-foreground font-semibold">代理品牌</strong>：可使用品牌资源，但不可上传公有模型。</span>
            ) : showOwn ? (
              <span><strong className="text-foreground font-semibold">拥有品牌</strong>：可上传公有模型，拥有品牌完整管理权限。</span>
            ) : (
              <span><strong className="text-foreground font-semibold">代理品牌</strong>：可使用品牌资源，但不可上传公有模型。</span>
            )}
          </div>
        </div>

        {showOwn && (
          <SectionCard>
            <div className="flex items-center justify-between mb-5">
              <SubSectionTitle title="拥有品牌" />
              <button onClick={addOwnedBrand} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" /> 新建
              </button>
            </div>

            {form.ownedBrands.length === 0 ? (
              <div onClick={addOwnedBrand} className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed rounded-xl text-muted-foreground cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-colors">
                <Plus className="h-5 w-5 opacity-60" />
                <span className="text-[13px]">点击新建品牌</span>
              </div>
            ) : (
              <div className="space-y-5">
                {form.ownedBrands.map((brand: OwnedBrand, idx: number) => (
                  <div key={brand.id} className="rounded-2xl border border-border/70 overflow-hidden bg-card">
                    <div className="flex items-center justify-between px-5 py-4 bg-muted/25 border-b border-border/60">
                      <div>
                        <span className="text-[13px] font-semibold text-foreground">品牌 {idx + 1}</span>
                        <p className="text-[12px] text-muted-foreground mt-1">统一品牌信息录入结构</p>
                      </div>
                      <button onClick={() => removeOwnedBrand(brand.id)} className="text-[12px] text-destructive hover:text-destructive/80 transition-colors">删除</button>
                    </div>
                    <div className="p-5 space-y-4">
                      <FormRow label="品牌名称" required>
                        <input className="filter-input w-full" placeholder="请输入" value={brand.name} onChange={(e) => updateOwnedBrand(brand.id, "name", e.target.value)} />
                      </FormRow>
                      <FormRow label="品牌Logo" required>
                        <UploadCard label="点击上传" />
                      </FormRow>
                      <FormRow label="国家">
                        <select className="filter-select w-full" value={brand.country} onChange={(e) => updateOwnedBrand(brand.id, "country", e.target.value)}>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </FormRow>
                      <FormRow label="品牌信息">
                        <textarea className="filter-input w-full min-h-[92px] resize-none py-2.5" placeholder="请输入" value={brand.info} onChange={(e) => updateOwnedBrand(brand.id, "info", e.target.value)} />
                      </FormRow>
                      <FormRow label="经营品类">
                        <div className="w-full space-y-2">
                          {brand.categories.map((cat: string, ci: number) => (
                            <div key={ci} className="flex items-center gap-2">
                              <select className="filter-select flex-1" value={cat} onChange={(e) => {
                                const newCats = [...brand.categories];
                                newCats[ci] = e.target.value;
                                updateOwnedBrand(brand.id, "categories", newCats);
                              }}>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <button onClick={() => updateOwnedBrand(brand.id, "categories", brand.categories.filter((_: string, i: number) => i !== ci))} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => updateOwnedBrand(brand.id, "categories", [...brand.categories, CATEGORIES[0]])} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors">
                            <Plus className="h-3 w-3" /> 添加品类
                          </button>
                        </div>
                      </FormRow>
                      <FormRow label="所含系列">
                        <div className="w-full space-y-2">
                          {brand.series.map((s: string, si: number) => (
                            <div key={si} className="flex items-center gap-2">
                              <input className="filter-input flex-1" value={s} placeholder="请输入系列名称" onChange={(e) => {
                                const newSeries = [...brand.series];
                                newSeries[si] = e.target.value;
                                updateOwnedBrand(brand.id, "series", newSeries);
                              }} />
                              <button onClick={() => updateOwnedBrand(brand.id, "series", brand.series.filter((_: string, i: number) => i !== si))} className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => updateOwnedBrand(brand.id, "series", [...brand.series, ""])} className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors">
                            <Plus className="h-3 w-3" /> 创建系列
                          </button>
                        </div>
                      </FormRow>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}

        {showAgent && (
          <SectionCard>
            <SubSectionTitle title="代理品牌" />
            <div className="mt-5">
              <FormRow label="代理品牌" required>
                <div className="flex flex-wrap gap-3">
                  {MOCK_AGENT_BRANDS.map((ab) => {
                    const selected = (form.agentBrandIds as string[]).includes(ab.id);
                    return (
                      <div
                        key={ab.id}
                        onClick={() => toggleAgentBrand(ab.id)}
                        className={cn(
                          "relative w-24 h-24 rounded-2xl border flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all bg-card",
                          selected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/20",
                        )}
                      >
                        {selected && (
                          <button onClick={(e) => { e.stopPropagation(); toggleAgentBrand(ab.id); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <span className="text-2xl">{ab.logo}</span>
                        <span className="text-[11px] text-foreground font-medium">{ab.name}</span>
                      </div>
                    );
                  })}
                  <div className="w-24 h-24 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="text-[10px]">点击选择</span>
                  </div>
                </div>
              </FormRow>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function StepDone({ type, form, navigate }: { type: string; form: Record<string, any>; navigate: (path: string) => void }) {
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  return (
    <div className="py-14 px-6">
      <div className="flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: "hsl(var(--success) / 0.12)" }}>
          <Check className="h-10 w-10" style={{ color: "hsl(var(--success))" }} strokeWidth={3} />
        </div>
        <h3 className="text-[22px] font-semibold text-foreground tracking-tight">创建成功</h3>
        <p className="text-[13px] text-muted-foreground mt-2">企业创建已完成，设置企业管理员后可开启使用</p>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={() => navigate("/enterprise")} className="btn-secondary">查看详情</button>
          <button onClick={() => navigate(`/enterprise/create?type=${type}`)} className="btn-secondary">继续创建</button>
          <button className="btn-primary" onClick={() => setShowAdminDialog(true)}>设置管理员</button>
        </div>
      </div>

      <div className="max-w-[780px] mx-auto mt-10 rounded-2xl border border-border/70 bg-muted/20 p-6">
        <div className="grid grid-cols-2 gap-x-14 gap-y-5">
          <SummaryItem label="公司名称" value={form.name || "未填写"} />
          <SummaryItem label="公司类型" value={TYPE_LABELS[type]} />
          <SummaryItem label="法人代表" value={form.legalPerson || "未填写"} />
          <SummaryItem label="法人手机号" value={form.legalPhone || "未填写"} />
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">开启产品：</span>
            <div className="flex flex-wrap gap-1.5">
              {(form.enabledProducts || []).map((pk: string) => {
                const prod = AVAILABLE_PRODUCTS.find((p) => p.key === pk);
                return prod ? <span key={pk} className="badge-product">{prod.label}</span> : null;
              })}
              {(!form.enabledProducts || form.enabledProducts.length === 0) && <span className="text-[13px] text-muted-foreground">未开启</span>}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">企业状态：</span>
            <div className="flex items-center gap-4">
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

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5">
        <div className="w-0.5 h-4 rounded-full bg-primary/60" />
        <h3 className="text-[15px] font-semibold text-foreground tracking-tight">{title}</h3>
      </div>
      {description && <p className="text-[12px] leading-6 text-muted-foreground ml-[14px]">{description}</p>}
    </div>
  );
}

function SubSectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-0.5 h-4 rounded-full bg-primary/50" />
      <h4 className="text-[14px] font-semibold text-foreground">{title}</h4>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6" style={{ boxShadow: "var(--shadow-xs)" }}>
      {children}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">{label}：</span>
      <span className="text-[13px] text-foreground font-medium">{value}</span>
    </div>
  );
}

function UploadCard({ label }: { label: string }) {
  return (
    <div className="w-24 h-24 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-1.5 cursor-pointer text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-colors">
      <Upload className="h-5 w-5" />
      <span className="text-[11px]">{label}</span>
    </div>
  );
}

function FormRow({ label, required, children, wide }: { label: string; required?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <label className={cn("text-[13px] text-muted-foreground pt-2 text-right shrink-0", wide ? "w-[120px]" : "w-[var(--form-label-width)]")}>
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-primary" : "bg-border")}
    >
      <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}
