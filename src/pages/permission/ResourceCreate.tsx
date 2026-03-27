import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resourceData, menuData, getMenuChildren, type ResourceType } from "@/data/permission";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: { value: ResourceType; label: string; desc: string }[] = [
  { value: "button", label: "按钮策略", desc: "控制页面上的操作按钮权限" },
  { value: "api", label: "接口策略", desc: "控制后端API的调用权限" },
  { value: "data", label: "数据策略", desc: "控制数据的访问范围" },
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

// Build menu options with indentation
function buildMenuOptions() {
  const options: { id: string; name: string; level: number; code: string }[] = [];
  const walk = (parentId: string | null, level: number) => {
    const children = getMenuChildren(parentId);
    children.forEach(c => {
      options.push({ id: c.id, name: c.name, level, code: c.code });
      walk(c.id, level + 1);
    });
  };
  walk(null, 0);
  return options;
}

export default function ResourceCreate() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const existingResource = editId ? resourceData.find(r => r.id === editId) : null;
  const isEdit = Boolean(existingResource);

  const [form, setForm] = useState({
    name: existingResource?.name || "",
    code: existingResource?.code || "",
    type: (existingResource?.type || "button") as ResourceType,
    menuId: existingResource?.menuId || "",
    description: existingResource?.description || "",
    status: (existingResource?.status || "active") as "active" | "inactive",
  });

  const menuOptions = useMemo(() => buildMenuOptions(), []);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  // Auto-generate menuPath from selected menu
  const selectedMenu = menuData.find(m => m.id === form.menuId);
  const menuPath = useMemo(() => {
    if (!form.menuId) return "";
    const parts: string[] = [];
    let current = menuData.find(m => m.id === form.menuId);
    while (current) {
      parts.unshift(current.name);
      current = current.parentId ? menuData.find(m => m.id === current!.parentId) : undefined;
    }
    return parts.join("/");
  }, [form.menuId]);

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("请输入策略名称"); return; }
    if (!form.code.trim()) { toast.error("请输入策略编码"); return; }
    if (!form.menuId) { toast.error("请选择所属模块"); return; }
    if (!isEdit && resourceData.some(r => r.code === form.code)) { toast.error("策略编码已存在"); return; }
    toast.success(isEdit ? "策略更新成功" : "策略创建成功");
    navigate("/permission/resource");
  };

  const inputClass = "h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all";

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate("/permission/resource")} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
          策略管理
        </button>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <span className="text-[14px] text-foreground font-semibold tracking-tight">
          {isEdit ? `编辑策略 · ${existingResource?.name}` : "新建策略"}
        </span>
      </div>

      {/* 基本信息 */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">基本信息</h3>
        <p className="text-[13px] text-muted-foreground mb-6">配置策略的名称、编码和基本属性</p>
        <div className="space-y-5 max-w-2xl">
          <FormRow label="策略名称" required>
            <input className={inputClass} placeholder="如：新建企业、审核素材" value={form.name} onChange={e => update("name", e.target.value)} />
          </FormRow>
          <FormRow label="策略编码" required hint="系统唯一标识，建议使用模块.操作格式，如 enterprise.list.create">
            <input className={cn(inputClass, "font-mono")} placeholder="如 enterprise.list.create" value={form.code} onChange={e => update("code", e.target.value)} disabled={isEdit} />
          </FormRow>
          <FormRow label="状态">
            <div className="flex items-center gap-5 pt-1.5">
              {[{ value: "active", label: "启用" }, { value: "inactive", label: "停用" }].map(opt => (
                <button key={opt.value} type="button" onClick={() => update("status", opt.value)} className="flex items-center gap-2 cursor-pointer group">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                    form.status === opt.value ? "border-primary" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                  )}>
                    {form.status === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <span className="text-[13px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* 策略类型 */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">策略类型</h3>
        <p className="text-[13px] text-muted-foreground mb-6">选择策略控制的维度</p>
        <div className="space-y-5 max-w-2xl">
          <FormRow label="策略类型" required>
            <div className="grid grid-cols-3 gap-3">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("type", opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 border-2 rounded-xl p-4 cursor-pointer transition-all text-center",
                    form.type === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:border-border hover:bg-muted"
                  )}
                >
                  <span className={cn("text-[13px] font-medium", form.type === opt.value ? "text-primary" : "text-foreground")}>{opt.label}</span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
          </FormRow>
        </div>
      </div>

      {/* 所属模块 */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">所属模块</h3>
        <p className="text-[13px] text-muted-foreground mb-6">选择该策略挂载的菜单模块</p>
        <div className="space-y-5 max-w-2xl">
          <FormRow label="所属模块" required>
            <select
              className={cn(inputClass, "appearance-none cursor-pointer")}
              value={form.menuId}
              onChange={e => update("menuId", e.target.value)}
            >
              <option value="">请选择模块</option>
              {menuOptions.map(m => (
                <option key={m.id} value={m.id}>
                  {"　".repeat(m.level)}{m.name} ({m.code})
                </option>
              ))}
            </select>
          </FormRow>
          {menuPath && (
            <FormRow label="模块路径">
              <div className="pt-2 text-[13px] text-foreground font-medium">{menuPath}</div>
            </FormRow>
          )}
          <FormRow label="描述">
            <textarea
              className="w-full min-h-[72px] rounded-lg border border-input bg-card px-3 py-2 text-[13px] shadow-none resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
              placeholder="描述该策略的用途和控制范围（可选）"
              value={form.description}
              onChange={e => update("description", e.target.value)}
            />
          </FormRow>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4 pt-2">
        <button type="button" className="btn-secondary px-8 py-2.5" onClick={() => navigate("/permission/resource")}>取消</button>
        <button type="button" className="btn-primary px-8 py-2.5" onClick={handleSubmit}>{isEdit ? "更新" : "创建"}</button>
      </div>
    </div>
  );
}
