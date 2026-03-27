import { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Info } from "lucide-react";
import { menuData, getMenuChildren, PRODUCTS, type MenuType, type RoleType } from "@/data/permission";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MENU_TYPE_OPTIONS: { value: MenuType; label: string; desc: string }[] = [
  { value: "basic", label: "基础菜单", desc: "启用产品后默认可见" },
  { value: "incremental", label: "增量菜单", desc: "需要特定权益才能开启" },
  { value: "platform", label: "平台菜单", desc: "仅平台角色可见" },
];

const GROUP_OPTIONS = [
  { value: "main", label: "主导航" },
  { value: "base", label: "基础" },
  { value: "personal", label: "个人中心" },
];

const ALL_STEPS = [
  { key: "basic", label: "基本信息" },
  { key: "permission", label: "权限配置" },
  { key: "enterprise", label: "企业要求" },
  { key: "done", label: "完成" },
];

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
      <label className="text-[13px] text-muted-foreground text-right pt-2.5 leading-tight">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="min-w-0">
        {children}
        {hint && <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{hint}</p>}
      </div>
    </div>
  );
}

export default function MenuCreate() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(editId) || searchParams.get("mode") === "edit";

  // Load existing data if editing
  const existingMenu = editId ? menuData.find(m => m.id === editId) : null;

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({
    name: existingMenu?.name || "",
    code: existingMenu?.code || "",
    parentId: existingMenu?.parentId || "" as string,
    groupType: existingMenu?.groupType || "main",
    menuType: (existingMenu?.menuType || "basic") as MenuType,
    roleTypes: (existingMenu?.roleTypes || ["enterprise"]) as RoleType[],
    products: existingMenu?.products || [] as string[],
    requiredEntitlement: existingMenu?.requiredEntitlement || "",
    sort: existingMenu?.sort || 1,
    status: (existingMenu?.status || "active") as "active" | "inactive",
    remark: existingMenu?.remark || "",
    brandRelationship: existingMenu?.enterpriseRequirements?.brandRelationship || "" as string,
    supplierStatus: existingMenu?.enterpriseRequirements?.supplierStatus || false,
  });

  // Build parent options
  const parentOptions: { id: string; name: string; level: number }[] = [];
  const buildParentList = (parentId: string | null, level: number) => {
    const children = getMenuChildren(parentId);
    children.forEach(c => {
      if (c.level < 3 && c.id !== editId) {
        parentOptions.push({ id: c.id, name: c.name, level });
        buildParentList(c.id, level + 1);
      }
    });
  };
  buildParentList(null, 0);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleRoleType = (rt: RoleType) => {
    setForm(prev => {
      const next = prev.roleTypes.includes(rt)
        ? prev.roleTypes.filter(r => r !== rt)
        : [...prev.roleTypes, rt];
      return { ...prev, roleTypes: next.length ? next : prev.roleTypes };
    });
  };

  const toggleProduct = (code: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.includes(code)
        ? prev.products.filter(p => p !== code)
        : [...prev.products, code],
    }));
  };

  const steps = form.menuType === "basic" && !form.roleTypes.includes("enterprise")
    ? ALL_STEPS.filter(s => s.key !== "enterprise")
    : ALL_STEPS;

  const currentStepKey = steps[currentStep]?.key;
  const lastStepIndex = steps.length - 1;
  const isLastContentStep = currentStep === lastStepIndex - 1;

  const goNext = () => {
    // Validation
    if (currentStepKey === "basic") {
      if (!form.name.trim()) { toast.error("请输入菜单名称"); return; }
      if (!form.code.trim()) { toast.error("请输入菜单编码"); return; }
      if (!isEdit && menuData.some(m => m.code === form.code)) { toast.error("菜单编码已存在"); return; }
    }
    if (isLastContentStep) {
      toast.success(isEdit ? "菜单更新成功" : "菜单创建成功");
    }
    setCurrentStep(s => Math.min(s + 1, lastStepIndex));
  };
  const goPrev = () => setCurrentStep(s => Math.max(s - 1, 0));

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/permission/menu")} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
          菜单管理
        </button>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <span className="text-[14px] text-foreground font-semibold tracking-tight">
          {isEdit ? `编辑菜单 · ${existingMenu?.name || ""}` : "新建菜单"}
        </span>
      </div>

      {/* Step indicator */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center justify-center max-w-[640px] mx-auto">
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

      {/* Form content */}
      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>

        {/* Step: 基本信息 */}
        {currentStepKey === "basic" && (
          <div className="p-6">
            <h3 className="text-[15px] font-semibold text-foreground mb-1">基本信息</h3>
            <p className="text-[13px] text-muted-foreground mb-6">配置菜单的名称、编码及基本属性</p>
            <div className="space-y-5 max-w-2xl">
              <FormRow label="菜单名称" required>
                <input
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
                  placeholder="请输入菜单名称"
                  value={form.name}
                  onChange={e => update("name", e.target.value)}
                />
              </FormRow>
              <FormRow label="菜单编码" required hint="使用英文句号分隔层级，如 marketing.resource.ads">
                <input
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] font-mono shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
                  placeholder="如 permission.menu"
                  value={form.code}
                  onChange={e => update("code", e.target.value)}
                />
              </FormRow>
              <FormRow label="上级菜单">
                <select
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all appearance-none cursor-pointer"
                  value={form.parentId}
                  onChange={e => update("parentId", e.target.value)}
                >
                  <option value="">无（顶级菜单）</option>
                  {parentOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {"　".repeat(p.level)}{p.name}
                    </option>
                  ))}
                </select>
              </FormRow>
              <FormRow label="菜单分组">
                <select
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all appearance-none cursor-pointer"
                  value={form.groupType}
                  onChange={e => update("groupType", e.target.value)}
                >
                  {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FormRow>
              <FormRow label="排序">
                <input
                  type="number"
                  className="h-9 w-24 rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
                  min={1}
                  value={form.sort}
                  onChange={e => update("sort", Number(e.target.value))}
                />
              </FormRow>
              <FormRow label="状态">
                <div className="flex items-center gap-5 pt-1.5">
                  {[{ value: "active", label: "启用" }, { value: "inactive", label: "停用" }].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                        form.status === opt.value ? "border-primary" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                      )}>
                        {form.status === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span className="text-[13px]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FormRow>
              <FormRow label="备注">
                <textarea
                  className="w-full min-h-[72px] rounded-lg border border-input bg-card px-3 py-2 text-[13px] shadow-none resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
                  placeholder="可选备注信息"
                  value={form.remark}
                  onChange={e => update("remark", e.target.value)}
                />
              </FormRow>
            </div>
          </div>
        )}

        {/* Step: 权限配置 */}
        {currentStepKey === "permission" && (
          <div className="p-6">
            <h3 className="text-[15px] font-semibold text-foreground mb-1">权限配置</h3>
            <p className="text-[13px] text-muted-foreground mb-6">配置菜单的可见性规则与关联产品</p>
            <div className="space-y-5 max-w-2xl">
              <FormRow label="菜单类型" required>
                <div className="grid grid-cols-3 gap-3">
                  {MENU_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("menuType", opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 border-2 rounded-xl p-4 cursor-pointer transition-all text-center",
                        form.menuType === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                      )}
                    >
                      <span className={cn("text-[13px] font-medium", form.menuType === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </FormRow>

              <FormRow label="角色可见" required hint="可同时选择多个角色类型">
                <div className="flex items-center gap-5 pt-1.5">
                  {[
                    { key: "enterprise" as RoleType, label: "企业角色" },
                    { key: "platform" as RoleType, label: "平台角色" },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer">
                      <Checkbox
                        checked={form.roleTypes.includes(opt.key)}
                        onCheckedChange={() => toggleRoleType(opt.key)}
                      />
                      <span className="text-[13px]">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FormRow>

              <FormRow label="关联产品" hint="不选则为通用菜单，对所有产品可见">
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {PRODUCTS.map(p => (
                    <label
                      key={p.code}
                      className={cn(
                        "flex items-center gap-2.5 border rounded-lg px-3 py-2.5 cursor-pointer transition-all",
                        form.products.includes(p.code)
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:border-primary/20 hover:bg-muted/30"
                      )}
                    >
                      <Checkbox
                        checked={form.products.includes(p.code)}
                        onCheckedChange={() => toggleProduct(p.code)}
                      />
                      <span className="text-[13px]">{p.icon} {p.name}</span>
                    </label>
                  ))}
                </div>
              </FormRow>

              {form.menuType === "incremental" && (
                <FormRow label="权益要求" required hint="增量菜单需配置对应权益编码">
                  <input
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] font-mono shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
                    placeholder="如 3d_product_shooting"
                    value={form.requiredEntitlement}
                    onChange={e => update("requiredEntitlement", e.target.value)}
                  />
                </FormRow>
              )}
            </div>
          </div>
        )}

        {/* Step: 企业要求 */}
        {currentStepKey === "enterprise" && (
          <div className="p-6">
            <h3 className="text-[15px] font-semibold text-foreground mb-1">企业属性要求</h3>
            <p className="text-[13px] text-muted-foreground mb-6">配置该菜单对企业属性的附加要求，不配置则无限制</p>
            <div className="space-y-5 max-w-2xl">
              <FormRow label="品牌关系">
                <select
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all appearance-none cursor-pointer"
                  value={form.brandRelationship}
                  onChange={e => update("brandRelationship", e.target.value)}
                >
                  <option value="">不限</option>
                  <option value="own">拥有品牌</option>
                  <option value="agent">代理品牌</option>
                </select>
              </FormRow>
              <FormRow label="供应链状态">
                <label className="flex items-center gap-2.5 pt-1.5 cursor-pointer">
                  <Checkbox
                    checked={form.supplierStatus}
                    onCheckedChange={(v) => update("supplierStatus", Boolean(v))}
                  />
                  <span className="text-[13px]">需已加入供应链</span>
                </label>
              </FormRow>

              {/* Preview hint */}
              <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-[12px] text-muted-foreground leading-relaxed">
                    <p className="font-medium text-foreground mb-1">配置说明</p>
                    <p>企业属性要求是叠加在菜单类型之上的额外条件。即使菜单对某企业可见，若不满足此处配置的属性要求，仍然不会显示。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: 完成 */}
        {currentStepKey === "done" && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-[18px] font-semibold text-foreground mb-2">
              {isEdit ? "菜单更新成功" : "菜单创建成功"}
            </h3>
            <p className="text-[13px] text-muted-foreground mb-6">
              菜单 <span className="font-medium text-foreground">{form.name}</span>（<span className="font-mono text-[12px]">{form.code}</span>）已{isEdit ? "更新" : "创建"}
            </p>
            <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
              <div className="w-full rounded-xl border border-border/70 bg-muted/20 p-4 text-left space-y-2 text-[13px]">
                <div className="flex justify-between"><span className="text-muted-foreground">菜单类型</span><span className="font-medium">{MENU_TYPE_OPTIONS.find(o => o.value === form.menuType)?.label}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">角色可见</span><span className="font-medium">{form.roleTypes.map(r => r === "enterprise" ? "企业" : "平台").join("、")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">关联产品</span><span className="font-medium">{form.products.length > 0 ? form.products.length + " 个" : "通用"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">状态</span><span className={form.status === "active" ? "badge-active" : "badge-inactive"}>{form.status === "active" ? "启用" : "停用"}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-center gap-3 px-6 py-5 border-t border-border/70 bg-muted/20">
          {currentStep === 0 && (
            <button onClick={() => navigate("/permission/menu")} className="btn-secondary">取消</button>
          )}
          {currentStep > 0 && currentStepKey !== "done" && (
            <>
              <button onClick={() => navigate("/permission/menu")} className="btn-secondary">取消</button>
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
            <button onClick={() => navigate("/permission/menu")} className="btn-secondary">返回列表</button>
          )}
        </div>
      </div>
    </div>
  );
}
