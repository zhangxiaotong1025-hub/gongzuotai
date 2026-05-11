import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { X, Plus, ChevronDown, ChevronUp, ChevronRight, CalendarIcon, Info, Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

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
  desc: string;
  tone: BenefitTone;
  dateRange: string;
}

const BENEFIT_CATALOG: Record<string, { name: string; desc: string; tone: BenefitTone }[]> = {
  domestic3d: [
    { name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", tone: "blue" },
    { name: "3D工具设计权益包", desc: "含户型绘制、方案设计、模型库", tone: "teal" },
    { name: "VR漫游权益包", desc: "含VR全景漫游、场景切换", tone: "violet" },
  ],
  international3d: [
    { name: "国际版渲染权益包", desc: "含8K渲染、HDR输出", tone: "blue" },
    { name: "国际版设计权益包", desc: "含全球模型库、多语言支持", tone: "teal" },
  ],
  smartGuide: [
    { name: "智能导购权益包", desc: "含AI推荐、商品匹配", tone: "teal" },
    { name: "导购数据权益包", desc: "含客户画像、行为分析", tone: "blue" },
  ],
  customerData: [
    { name: "精准客资权益包", desc: "含线索分配、客户管理", tone: "rose" },
    { name: "客资分析权益包", desc: "含转化分析、ROI报表", tone: "amber" },
  ],
};

/* ── Org Tree Data (same as StaffList) ── */
interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
}

const orgTreeData: OrgNode[] = [
  {
    id: "hq", name: "总部", children: [
      { id: "model", name: "模型部" },
      { id: "design", name: "设计部" },
    ]
  },
  {
    id: "supply", name: "供应链", children: [
      {
        id: "south", name: "华南供应链", children: [
          { id: "sd-supply", name: "山东供应链" },
          { id: "hb-supply", name: "河北供应链" },
          { id: "tj-supply", name: "天津供应链" },
        ]
      },
      { id: "north", name: "华北供应链" },
    ]
  },
];

/* Enterprise hierarchy for cascading display */
const ENTERPRISE_PATH = ["广州珊珊光纤有限公司", "佛山分公司", "南海店"];

/* ── Helpers ── */
function findOrgName(nodes: OrgNode[], id: string): string | null {
  for (const n of nodes) {
    if (n.id === id) return n.name;
    if (n.children) {
      const found = findOrgName(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function flattenOrg(nodes: OrgNode[], depth = 0): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = [];
  for (const n of nodes) {
    result.push({ id: n.id, name: n.name, depth });
    if (n.children) result.push(...flattenOrg(n.children, depth + 1));
  }
  return result;
}

/* ── Date Range Picker ── */
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
    : startDate ? `${format(startDate, "yyyy/MM/dd")} ~ 结束日期` : "";

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

/* ── Form Row ── */
function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[13px] text-muted-foreground pt-[7px] text-right shrink-0 w-[var(--form-label-width)]">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ── Org Tree Selector (dropdown with tree) ── */
function OrgTreeSelector({ selectedIds, onChange }: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  const selectedNames = selectedIds.map(id => findOrgName(orgTreeData, id)).filter(Boolean);

  return (
    <div className="relative" ref={ref}>
      <div
        className={cn(
          "filter-input w-full min-h-[36px] flex items-center flex-wrap gap-1 cursor-pointer pr-8",
          open && "ring-2 ring-primary/20 border-primary/40"
        )}
        onClick={() => setOpen(!open)}
      >
        {selectedNames.length === 0 && <span className="text-muted-foreground text-[13px]">选择组织架构（支持多选）</span>}
        {selectedNames.map((name, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-medium bg-primary/8 text-primary">
            {name}
            <X className="h-3 w-3 cursor-pointer hover:opacity-70" onClick={(e) => { e.stopPropagation(); toggle(selectedIds[i]); }} />
          </span>
        ))}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />
      </div>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 w-full rounded-xl border bg-popover py-2 max-h-[280px] overflow-y-auto"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <OrgTreeDropdown nodes={orgTreeData} selectedIds={selectedIds} onToggle={toggle} depth={0} />
        </div>
      )}
    </div>
  );
}

function OrgTreeDropdown({ nodes, selectedIds, onToggle, depth }: {
  nodes: OrgNode[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["hq", "supply", "south"]));

  return (
    <>
      {nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expanded.has(node.id);
        const isSelected = selectedIds.includes(node.id);

        return (
          <div key={node.id}>
            <div
              className={cn(
                "flex items-center gap-1.5 py-1.5 px-3 cursor-pointer text-[13px] hover:bg-muted/60 transition-colors",
              )}
              style={{ paddingLeft: `${12 + depth * 16}px` }}
            >
              {hasChildren ? (
                <button
                  className="p-0.5 rounded hover:bg-muted transition-colors shrink-0"
                  onClick={() => setExpanded(prev => {
                    const next = new Set(prev);
                    next.has(node.id) ? next.delete(node.id) : next.add(node.id);
                    return next;
                  })}
                >
                  {isExpanded
                    ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </button>
              ) : (
                <span className="w-[18px] shrink-0" />
              )}
              <div
                className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer",
                  isSelected ? "bg-primary border-primary" : "border-border bg-card"
                )}
                onClick={() => onToggle(node.id)}
              >
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              <span
                className="flex-1 truncate"
                onClick={() => onToggle(node.id)}
              >
                {node.name}
              </span>
            </div>
            {hasChildren && isExpanded && (
              <OrgTreeDropdown nodes={node.children!} selectedIds={selectedIds} onToggle={onToggle} depth={depth + 1} />
            )}
          </div>
        );
      })}
    </>
  );
}

/* ── Benefit Row Card (person-level: only date range, no mode/quota) ── */
function BenefitRowCard({ pkg, onUpdate, onRemove }: {
  pkg: BenefitPkg;
  onUpdate: (field: string, value: unknown) => void;
  onRemove: () => void;
}) {
  const cssVar = VARIANT_VARS[pkg.tone];
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{ borderColor: `hsl(var(${cssVar}) / 0.15)` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: `hsl(var(${cssVar}) / 0.03)` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full" style={{ background: `hsl(var(${cssVar}))` }} />
          <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded hover:bg-muted/60 transition-colors"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </div>

      {/* Body — only usage period for person-level */}
      {expanded && (
        <div className="px-4 py-4 space-y-3 border-t" style={{ borderColor: `hsl(var(${cssVar}) / 0.1)` }}>
          <div className="text-[12px] text-muted-foreground">{pkg.desc}</div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-muted-foreground font-medium">使用周期</label>
            <DateRangePicker
              value={pkg.dateRange}
              onChange={(v) => onUpdate("dateRange", v)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════
   Main Component
   ══════════════════════════ */
export default function StaffCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get("mode") === "edit";

  const [form, setForm] = useState({
    name: isEdit ? "王小二" : "",
    staffId: "202020",
    phone: isEdit ? "18512345678" : "",
    orgIds: isEdit ? ["model", "design"] : [] as string[],
    enabledProducts: ["domestic3d", "smartGuide"] as string[],
    roles: isEdit ? ["设计师", "企业管理员"] : [] as string[],
    benefits: isEdit ? [
      { id: "b1", name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", tone: "blue" as BenefitTone, dateRange: "2025-02-23 ~ 2028-02-23" },
      { id: "b2", name: "智能导购权益包", desc: "含AI推荐、商品匹配", tone: "teal" as BenefitTone, dateRange: "2025-02-23 ~ 2028-02-23" },
    ] : [] as BenefitPkg[],
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

  const availableBenefits = useMemo(() => {
    const all: { name: string; desc: string; tone: BenefitTone; productKey: string }[] = [];
    form.enabledProducts.forEach((pk) => {
      (BENEFIT_CATALOG[pk] || []).forEach((b) => {
        all.push({ ...b, productKey: pk });
      });
    });
    return all;
  }, [form.enabledProducts]);

  const addBenefit = (item: typeof availableBenefits[0]) => {
    if (form.benefits.find((b) => b.name === item.name)) return;
    update("benefits", [...form.benefits, {
      id: `b-${Date.now()}`,
      name: item.name,
      desc: item.desc,
      tone: item.tone,
      dateRange: "2026-01-01 ~ 2028-12-31",
    }]);
  };

  const removeBenefit = (id: string) => update("benefits", form.benefits.filter((b) => b.id !== id));

  const updateBenefit = (id: string, field: string, value: unknown) => {
    update("benefits", form.benefits.map((b) => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("请填写姓名"); return; }
    if (!form.phone.trim()) { toast.error("请填写手机号"); return; }
    toast.success(isEdit ? "人员信息已更新" : "人员创建成功");
    navigate("/enterprise/staff");
  };

  const [showBenefitPicker, setShowBenefitPicker] = useState(false);

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/enterprise/staff")}>
          人员管理
        </span>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <h1 className="text-[14px] text-foreground font-semibold tracking-tight">
          {isEdit ? "编辑人员" : "新建人员"}
        </h1>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="p-6">
          <div className="max-w-[760px] mx-auto space-y-5">

            {/* 默认登录密码提示 */}
            <div className="rounded-lg border border-primary/15 bg-primary/[0.03] px-4 py-3 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="text-[12.5px] leading-relaxed text-foreground">
                <span className="font-medium">初始登录密码：</span>
                <code className="text-primary bg-primary/8 px-1.5 py-0.5 rounded mx-0.5 font-mono text-[12px]">Aa@123456</code>
                <span className="text-muted-foreground">　新建人员保存后将以该默认密码作为初始登录凭证，员工可通过手机验证码登录后在「修改密码」中自行设置；管理员也可在人员列表中直接「重置密码」。</span>
              </div>
            </div>

            {/* Basic Info */}
            <FormRow label="姓名" required>
              <input className="filter-input w-full" placeholder="请输入姓名" value={form.name} onChange={(e) => update("name", e.target.value)} />
            </FormRow>
            <FormRow label="人员ID">
              <input className="filter-input w-full bg-muted/30" value={form.staffId} disabled />
            </FormRow>
            <FormRow label="手机号" required>
              <input className="filter-input w-full" placeholder="请输入手机号" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </FormRow>

            {/* Enterprise — cascading display */}
            <FormRow label="归属企业">
              <div className="flex items-center gap-1 text-[13px] text-foreground py-[7px]">
                {ENTERPRISE_PATH.map((name, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground/40">/</span>}
                    <span className={i === ENTERPRISE_PATH.length - 1 ? "font-medium text-primary" : "text-muted-foreground"}>{name}</span>
                  </span>
                ))}
              </div>
            </FormRow>

            {/* Org Structure — tree multi-select dropdown */}
            <FormRow label="组织架构">
              <OrgTreeSelector
                selectedIds={form.orgIds}
                onChange={(ids) => update("orgIds", ids)}
              />
            </FormRow>

            {/* Products */}
            <FormRow label="开启产品">
              <div className="flex flex-wrap gap-4 py-[7px]">
                {PRODUCTS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer text-[13px]">
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
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
            </FormRow>

            {/* Benefits — person level: only usage period */}
            <FormRow label="权益配置">
              <div className="space-y-3">
                {form.benefits.map((pkg) => (
                  <BenefitRowCard
                    key={pkg.id}
                    pkg={pkg}
                    onUpdate={(field, value) => updateBenefit(pkg.id, field, value)}
                    onRemove={() => removeBenefit(pkg.id)}
                  />
                ))}

                <div className="relative">
                  <button
                    className="flex items-center gap-1.5 text-[12px] text-primary/70 hover:text-primary transition-colors"
                    onClick={() => setShowBenefitPicker(!showBenefitPicker)}
                  >
                    <Plus className="h-3.5 w-3.5" /> 添加权益包
                  </button>
                  {showBenefitPicker && (
                    <div
                      className="absolute left-0 top-full mt-2 z-50 w-[320px] rounded-xl border bg-popover py-1 max-h-[280px] overflow-y-auto"
                      style={{ boxShadow: "var(--shadow-lg)" }}
                    >
                      {availableBenefits.length === 0 && (
                        <div className="px-4 py-3 text-[12px] text-muted-foreground">请先开启产品</div>
                      )}
                      {availableBenefits.map((item, i) => {
                        const already = form.benefits.find((b) => b.name === item.name);
                        const cssVar = VARIANT_VARS[item.tone];
                        return (
                          <button
                            key={i}
                            className={cn(
                              "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                              already ? "opacity-40 cursor-not-allowed" : "hover:bg-muted cursor-pointer"
                            )}
                            disabled={!!already}
                            onClick={() => { addBenefit(item); setShowBenefitPicker(false); }}
                          >
                            <div className="w-1 h-5 rounded-full shrink-0" style={{ background: `hsl(var(${cssVar}))` }} />
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-medium text-foreground">{item.name}</div>
                              <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                            </div>
                            {already && <span className="text-[11px] text-muted-foreground">已添加</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </FormRow>

            {/* Status */}
            <FormRow label="状态">
              <div className="flex items-center gap-6 py-[7px]">
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
                placeholder="请输入备注信息"
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
            {isEdit ? "保存" : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}
