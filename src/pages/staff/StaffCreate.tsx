import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Constants ── */
const PRODUCTS = [
  { key: "domestic3d", label: "国内3D工具" },
  { key: "international3d", label: "国际3D工具" },
  { key: "smartGuide", label: "智能导购" },
  { key: "customerData", label: "精准客资" },
];

const ROLES = ["设计师", "企业管理员", "店长", "导购", "模型管理员"];

type BenefitTone = "blue" | "teal" | "violet" | "amber" | "rose";
const VARIANT_VARS: Record<BenefitTone, string> = {
  blue: "--benefit-blue", teal: "--benefit-teal", violet: "--benefit-violet",
  amber: "--benefit-amber", rose: "--benefit-rose",
};

interface BenefitPkg {
  id: string;
  name: string;
  date: string;
  used: number;
  total: number;
  tone: BenefitTone;
}

const AVAILABLE_BENEFITS: BenefitPkg[] = [
  { id: "b1", name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, tone: "blue" },
  { id: "b2", name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, tone: "teal" },
  { id: "b3", name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, tone: "rose" },
];

/* ── Form Row ── */
function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[13px] text-muted-foreground pt-[7px] text-right shrink-0 w-[var(--form-label-width)]">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  );
}

/* ── Benefit Card (selectable) ── */
function BenefitCardSelect({ pkg, selected, onToggle, onRemove }: {
  pkg: BenefitPkg; selected?: boolean; onToggle?: () => void; onRemove?: () => void;
}) {
  const cssVar = VARIANT_VARS[pkg.tone];
  return (
    <div
      className="rounded-xl p-4 w-[220px] relative overflow-hidden transition-all"
      style={{
        border: `1px solid hsl(${cssVar.replace('--', 'var(--')}) / 0.2)`,
        background: `hsl(${cssVar.replace('--', 'var(--')}) / 0.03)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60" style={{ background: `hsl(var(${cssVar}))` }} />
      {onRemove && (
        <button
          className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-muted transition-colors"
          onClick={onRemove}
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
      <div className="flex items-start justify-between gap-1 mb-2 pr-5">
        <span className="text-[12px] font-semibold leading-tight" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</span>
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-30" style={{ color: `hsl(var(${cssVar}))` }} />
      </div>
      <div className="text-[11px] mb-3 text-muted-foreground">{pkg.date}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>
          {pkg.used}<span className="opacity-40 font-normal">/{pkg.total}</span>
        </span>
      </div>
    </div>
  );
}

export default function StaffCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("mode") === "edit";

  const [form, setForm] = useState({
    name: isEdit ? "王小二" : "",
    staffId: "202020",
    phone: "",
    enterprise: "当前企业架构树",
    orgStructure: "当前企业组织结构树",
    enabledProducts: ["domestic3d", "smartGuide"] as string[],
    roles: isEdit ? ["设计师", "企业管理员"] : [] as string[],
    benefits: isEdit ? AVAILABLE_BENEFITS.slice(0, 3) : [] as BenefitPkg[],
    status: "active" as "active" | "inactive",
    remark: "",
  });

  const update = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleProduct = (key: string) => {
    const arr = form.enabledProducts;
    update("enabledProducts", arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);
  };

  const toggleRole = (role: string) => {
    const arr = form.roles;
    update("roles", arr.includes(role) ? arr.filter((r) => r !== role) : [...arr, role]);
  };

  const addBenefit = (pkg: BenefitPkg) => {
    if (!form.benefits.find((b) => b.id === pkg.id)) {
      update("benefits", [...form.benefits, pkg]);
    }
  };

  const removeBenefit = (id: string) => {
    update("benefits", form.benefits.filter((b) => b.id !== id));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("请填写姓名");
      return;
    }
    toast.success(isEdit ? "人员信息已更新" : "人员创建成功，已进入审核流程");
    navigate("/enterprise/staff");
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/enterprise/staff")}>
          企业管理
        </span>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <h1 className="text-[14px] text-foreground font-semibold tracking-tight">
          {isEdit ? "编辑人员" : "新建人员"}
        </h1>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="p-6">
          <div className="max-w-[680px] mx-auto space-y-5">
            <FormRow label="姓名" required>
              <input className="filter-input w-full" placeholder="请输入" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </FormRow>
            <FormRow label="人员ID">
              <input className="filter-input w-full bg-muted/30" value={form.staffId} disabled />
            </FormRow>
            <FormRow label="手机号" required>
              <input className="filter-input w-full" placeholder="请输入" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </FormRow>
            <FormRow label="归属企业">
              <select className="filter-select w-full">
                <option>{form.enterprise}</option>
              </select>
            </FormRow>
            <FormRow label="组织结构">
              <select className="filter-select w-full">
                <option>{form.orgStructure}</option>
              </select>
            </FormRow>

            {/* Products */}
            <FormRow label="开启产品">
              <div className="flex flex-wrap gap-4">
                {PRODUCTS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer text-[13px]">
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                        form.enabledProducts.includes(p.key)
                          ? "bg-primary border-primary"
                          : "border-border bg-card"
                      )}
                      onClick={() => toggleProduct(p.key)}
                    >
                      {form.enabledProducts.includes(p.key) && (
                        <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {p.label}
                  </label>
                ))}
              </div>
            </FormRow>

            {/* Roles */}
            <FormRow label="角色">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-card min-h-[38px]">
                  {form.roles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-medium"
                      style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}
                    >
                      {r}
                      <X className="h-3 w-3 cursor-pointer hover:opacity-70" onClick={() => toggleRole(r)} />
                    </span>
                  ))}
                  <select
                    className="text-[13px] text-muted-foreground bg-transparent border-none outline-none flex-1 min-w-[100px] h-6"
                    value=""
                    onChange={(e) => { if (e.target.value) toggleRole(e.target.value); }}
                  >
                    <option value="" disabled>选择角色...</option>
                    {ROLES.filter((r) => !form.roles.includes(r)).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </FormRow>

            {/* Benefits */}
            <FormRow label="权益配置">
              <div className="flex-1 min-w-0 space-y-3">
                {form.benefits.map((pkg) => (
                  <BenefitCardSelect key={pkg.id} pkg={pkg} onRemove={() => removeBenefit(pkg.id)} />
                ))}
                <button
                  className="flex items-center gap-1.5 text-[12px] text-primary/70 hover:text-primary transition-colors mt-2"
                  onClick={() => {
                    const next = AVAILABLE_BENEFITS.find((b) => !form.benefits.find((fb) => fb.id === b.id));
                    if (next) addBenefit(next);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> 添加品类
                </button>
              </div>
            </FormRow>

            {/* Status */}
            <FormRow label="状态">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-[13px]">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                    form.status === "active" ? "border-primary" : "border-border"
                  )} onClick={() => update("status", "active")}>
                    {form.status === "active" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  启用
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[13px]">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                    form.status === "inactive" ? "border-primary" : "border-border"
                  )} onClick={() => update("status", "inactive")}>
                    {form.status === "inactive" && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  停用
                </label>
              </div>
            </FormRow>

            {/* Remark */}
            <FormRow label="备注">
              <textarea
                className="filter-input w-full min-h-[80px] py-2 resize-none"
                placeholder="请输入"
                value={form.remark}
                onChange={(e) => update("remark", e.target.value)}
              />
            </FormRow>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-3 px-6 py-5 border-t border-border/70 bg-muted/20">
          <button className="btn-secondary" onClick={() => navigate("/enterprise/staff")}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {isEdit ? "保存" : "下一步"}
          </button>
        </div>
      </div>
    </div>
  );
}
