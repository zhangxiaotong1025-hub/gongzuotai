import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Upload, X, Plus } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  brand: "品牌商", dealer: "经销商", hq: "总部公司", studio: "工作室", supplier: "供应商",
};

const STEPS = [
  { key: "basic", label: "基础信息" },
  { key: "product", label: "资料认证" },
  { key: "config", label: "认证配置" },
  { key: "done", label: "完成" },
];

const INDUSTRIES = ["家居建材", "家具制造", "装饰装修", "智能家居", "软装设计", "其他"];
const PROVINCES = ["北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "山东", "福建", "湖南"];
const AUTH_TYPES = ["营业执照认证", "品牌授权认证", "ISO体系认证"];
const AVAILABLE_PRODUCTS = ["国内3D", "国际3D", "智能导购", "互联网营销", "VR全景", "定制插件"];
const PRODUCT_MODULES = ["云设计", "3D渲染", "VR漫游", "施工图", "报价系统", "订单管理"];

// Simulated people data for tables
const MOCK_ADMINS = [
  { name: "张三(品牌管理员)", account: "zhangsan@brand.com", role: "品牌管理员", status: "正常", joinDate: "2025-01-10", expireDate: "2026-01-10" },
  { name: "李四(运营经理)", account: "lisi@brand.com", role: "正常管理员", status: "正常", joinDate: "2025-03-01", expireDate: "2026-03-01" },
  { name: "王五(技术支持)", account: "wangwu@brand.com", role: "正常管理员", status: "正常", joinDate: "2024-08-15", expireDate: "2025-08-15" },
];

const MOCK_DISCOUNT_ACCOUNTS = [
  { name: "门店SVIP账号 ①", level: "N", joinDate: "2025-01-15", expireDate: "2025-12-31" },
  { name: "门店推广账号 ①②", level: "N", joinDate: "2026-01-15", expireDate: "2026-12-31" },
];

export default function EnterpriseCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "brand";
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [form, setForm] = useState({
    name: "", license: "2020220", authType: "营业执照认证", industry: "家居建材",
    province: "广东", licenseFile: null as File | null,
    contactName: "", contactPhone: "", legalPerson: "", legalPhone: "",
    regCapital: "", brand: "",
    // Product config
    selectedProducts: ["国内3D", "国际3D"] as string[],
    accessType: "B+C" as string,
    enableGenericConfig: false,
    // Admin limits
    maxAccounts: 30,
    // Enterprise limits
    maxSubCompanies: 30,
    autoGrantSub: false,
    expireDate: "2027-12-31",
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="space-y-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => navigate("/enterprise")}
          className="text-[13px] text-muted-foreground hover:text-primary transition-colors"
        >
          企业管理
        </button>
        <span className="text-muted-foreground text-xs">/</span>
        <span className="text-[13px] text-foreground font-medium">
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
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-[13px] whitespace-nowrap ${
                      isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                    }`}
                  >
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
      <div className="bg-card rounded-xl border p-6" style={{ boxShadow: 'var(--shadow-xs)' }}>
        {currentStep === 0 && <StepBasic form={form} update={update} />}
        {currentStep === 1 && <StepProduct form={form} update={update} />}
        {currentStep === 2 && <StepConfig form={form} update={update} />}
        {currentStep === 3 && <StepDone type={type} />}

        {/* Actions */}
        <div className="flex justify-center gap-3 mt-8 pt-6 border-t">
          {currentStep > 0 && currentStep < 3 && (
            <button onClick={goPrev} className="btn-secondary">
              <ChevronLeft className="h-4 w-4" />
              上一步
            </button>
          )}
          {currentStep === 0 && (
            <button onClick={() => navigate("/enterprise")} className="btn-secondary">取消</button>
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
    <div>
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

/* ============ Step 2: 产品配置 ============ */
function StepProduct({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  const toggleProduct = (p: string) => {
    const selected = form.selectedProducts as string[];
    update("selectedProducts", selected.includes(p) ? selected.filter((x: string) => x !== p) : [...selected, p]);
  };

  return (
    <div>
      <SectionTitle title="产品权益" />
      <div className="max-w-[900px] mx-auto space-y-6 mt-5">
        {/* Product entitlements */}
        <div className="space-y-4">
          <SubSection title="权益配置" />
          <FormRow label="开通产品" wide>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PRODUCTS.map((p) => {
                const checked = form.selectedProducts.includes(p);
                return (
                  <label
                    key={p}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] cursor-pointer transition-all border ${
                      checked
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleProduct(p)} />
                    {checked && <Check className="h-3 w-3" />}
                    {p}
                  </label>
                );
              })}
            </div>
          </FormRow>
          <FormRow label="受众接入类别配置" wide>
            <div className="flex items-center gap-4">
              {["B+C", "仅B端", "仅C端"].map((opt) => (
                <label key={opt} className="inline-flex items-center gap-1.5 text-[13px] cursor-pointer">
                  <input
                    type="radio"
                    name="accessType"
                    checked={form.accessType === opt}
                    onChange={() => update("accessType", opt)}
                    className="accent-primary"
                  />
                  {opt === "B+C" ? "B+C端" : opt === "仅B端" ? "仅B端" : "仅C端"}
                </label>
              ))}
            </div>
          </FormRow>
          <FormRow label="通用对话配置" wide>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => update("enableGenericConfig", !form.enableGenericConfig)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  form.enableGenericConfig ? "bg-primary" : "bg-border"
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.enableGenericConfig ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </div>
            </label>
          </FormRow>
        </div>

        {/* Product module table */}
        <div className="space-y-4">
          <SubSection title="国内3D工具" />
          <FormRow label="启用模块" wide>
            <div className="flex flex-wrap gap-2">
              {PRODUCT_MODULES.map((m) => (
                <span key={m} className="badge-product">{m}</span>
              ))}
            </div>
          </FormRow>

          {/* Admin account table */}
          <FormRow label="协议&口子管理" wide>
            <div className="border rounded-lg overflow-hidden">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>账号名称</th>
                    <th>配额级别</th>
                    <th>状态</th>
                    <th>开通时间</th>
                    <th>到期时间</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ADMINS.map((a, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5">
                        <span className="badge-product text-xs">{a.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <select className="filter-select h-7 text-xs w-24">{["品牌管理员", "正常管理员"].map(r => <option key={r}>{r}</option>)}</select>
                      </td>
                      <td className="px-4 py-2.5"><span className="text-[13px]">正常</span></td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{a.joinDate}</td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{a.expireDate}</td>
                      <td className="px-4 py-2.5">
                        <button className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormRow>

          {/* Discount accounts */}
          <FormRow label="优惠产品入口" wide>
            <div className="border rounded-lg overflow-hidden">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>优惠类型</th>
                    <th>优惠人数</th>
                    <th>开通时间</th>
                    <th>到期时间</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DISCOUNT_ACCOUNTS.map((d, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5">
                        <span className="badge-product text-xs">{d.name}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <select className="filter-select h-7 text-xs w-20">{["N", "1", "5", "10"].map(v => <option key={v}>{v}</option>)}</select>
                      </td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{d.joinDate}</td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{d.expireDate}</td>
                      <td className="px-4 py-2.5">
                        <button className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormRow>
        </div>

        {/* Management control */}
        <div className="space-y-4">
          <SubSection title="管理管控" />
          <FormRow label="协作数量" wide>
            <input className="filter-input w-40" type="number" value={form.maxAccounts} onChange={(e) => update("maxAccounts", Number(e.target.value))} />
          </FormRow>
          <FormRow label="优惠账号配置" wide>
            <div className="border rounded-lg overflow-hidden">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>优惠等级</th>
                    <th>级别</th>
                    <th>开通时间</th>
                    <th>到期时间</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DISCOUNT_ACCOUNTS.map((d, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5"><span className="badge-product text-xs">{d.name}</span></td>
                      <td className="px-4 py-2.5"><span className="text-[13px]">{d.level}</span></td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{d.joinDate}</td>
                      <td className="px-4 py-2.5 text-[13px] text-muted-foreground">{d.expireDate}</td>
                      <td className="px-4 py-2.5">
                        <button className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormRow>
        </div>
      </div>
    </div>
  );
}

/* ============ Step 3: 企业配额 ============ */
function StepConfig({ form, update }: { form: any; update: (k: string, v: any) => void }) {
  return (
    <div>
      <SectionTitle title="企业配额" />
      <div className="max-w-[640px] mx-auto space-y-5 mt-5">
        <FormRow label="子企业上限数">
          <input className="filter-input w-full" type="number" value={form.maxSubCompanies} onChange={(e) => update("maxSubCompanies", Number(e.target.value))} />
        </FormRow>
        <FormRow label="独立设置子企业权益">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => update("autoGrantSub", !form.autoGrantSub)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                form.autoGrantSub ? "bg-primary" : "bg-border"
              }`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                form.autoGrantSub ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </div>
          </label>
        </FormRow>
        <FormRow label="期限时间">
          <input className="filter-input w-full" type="date" value={form.expireDate} onChange={(e) => update("expireDate", e.target.value)} />
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

/* ============ Shared Form Components ============ */
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
    <div className="flex items-center gap-2">
      <div className="w-0.5 h-3 rounded-full bg-muted-foreground/30" />
      <h4 className="text-[13px] font-medium text-foreground">{title}</h4>
    </div>
  );
}

function FormRow({
  label, required, children, wide,
}: {
  label: string; required?: boolean; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 ${wide ? "" : ""}`}>
      <label className={`text-[13px] text-muted-foreground pt-2 text-right shrink-0 ${wide ? "w-[140px]" : "w-[120px]"}`}>
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}：
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
