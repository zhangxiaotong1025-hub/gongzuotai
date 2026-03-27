import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { menuData, buildMenuTree, resourceData, roleData, type RoleType, type MenuItem, type ResourceType } from "@/data/permission";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============ Menu Check Tree ============

interface TreeNode {
  id: string;
  name: string;
  code: string;
  level: number;
  children?: TreeNode[];
}

function collectTreeIds(node: TreeNode): string[] {
  const ids = [node.id];
  node.children?.forEach(c => ids.push(...collectTreeIds(c)));
  return ids;
}

function MenuCheckTree({ tree, selected, onToggle, expanded, onToggleExpand }: {
  tree: TreeNode[];
  selected: Set<string>;
  onToggle: (id: string, children: string[]) => void;
  expanded: Set<string>;
  onToggleExpand: (id: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {tree.map(node => {
        const hasChildren = (node.children?.length || 0) > 0;
        const isOpen = expanded.has(node.id);
        const allChildIds = collectTreeIds(node);
        const allChecked = allChildIds.every(id => selected.has(id));
        const someChecked = allChildIds.some(id => selected.has(id));

        return (
          <div key={node.id}>
            <div className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-muted/50" style={{ paddingLeft: 8 + (node.level - 1) * 20 }}>
              {hasChildren ? (
                <button onClick={() => onToggleExpand(node.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              ) : <span className="w-5" />}
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={() => onToggle(node.id, allChildIds)}
              />
              <span className="text-[13px] text-foreground">{node.name}</span>
            </div>
            {isOpen && hasChildren && (
              <MenuCheckTree tree={node.children!} selected={selected} onToggle={onToggle} expanded={expanded} onToggleExpand={onToggleExpand} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============ Tag Input ============

function TagSelector({ label, items, selectedIds, onChange }: {
  label: string;
  items: { id: string; name: string; code: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const available = items.filter(i => !selectedIds.includes(i.id));

  return (
    <div>
      <label className="text-[13px] text-muted-foreground mb-2 block">{label}：</label>
      <div className="border rounded-lg p-2 min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
        {selectedIds.map(id => {
          const item = items.find(i => i.id === id);
          if (!item) return null;
          return (
            <span key={id} className="inline-flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-[12px] text-foreground">
              {item.name}
              <button onClick={(e) => { e.stopPropagation(); onChange(selectedIds.filter(s => s !== id)); }} className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {selectedIds.length === 0 && <span className="text-[12px] text-muted-foreground">请选择</span>}
      </div>
      {showDropdown && available.length > 0 && (
        <div className="border rounded-lg mt-1 max-h-[200px] overflow-y-auto bg-card shadow-lg z-10 relative">
          {available.map(item => (
            <button
              key={item.id}
              className="w-full text-left px-3 py-2 text-[12px] hover:bg-muted/50 transition-colors flex items-center justify-between"
              onClick={(e) => { e.stopPropagation(); onChange([...selectedIds, item.id]); }}
            >
              <span className="text-foreground">{item.name}</span>
              <span className="text-muted-foreground font-mono text-[11px]">{item.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Form Row ============

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

// ============ Main Component ============

export default function RoleCreate() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const existingRole = editId ? roleData.find(r => r.id === editId) : null;
  const isEdit = Boolean(existingRole);

  const [form, setForm] = useState({
    name: existingRole?.name || "",
    code: existingRole?.code || "",
    roleType: (existingRole?.roleType ? [existingRole.roleType] : ["enterprise"]) as RoleType[],
    description: existingRole?.description || "",
    menuMode: (existingRole?.menuMode || "specified") as "all" | "specified",
    resourceMode: (existingRole?.resourceMode || "specified") as "all" | "specified",
  });

  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(
    new Set(existingRole?.menuMode === "all" ? menuData.map(m => m.id) : existingRole?.menuIds || [])
  );
  const [treeExpanded, setTreeExpanded] = useState<Set<string>>(
    new Set(menuData.filter(m => m.level === 1).map(m => m.id))
  );
  const [selectedButtons, setSelectedButtons] = useState<string[]>(existingRole?.buttonResourceIds || []);
  const [selectedApis, setSelectedApis] = useState<string[]>(existingRole?.apiResourceIds || []);
  const [selectedData, setSelectedData] = useState<string[]>(existingRole?.dataResourceIds || []);

  const menuTree = useMemo(() => buildMenuTree(menuData), []);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleRoleType = (rt: RoleType) => {
    setForm(prev => {
      const next = prev.roleType.includes(rt)
        ? prev.roleType.filter(r => r !== rt)
        : [...prev.roleType, rt];
      return { ...prev, roleType: next.length ? next : prev.roleType };
    });
  };

  const handleMenuToggle = (id: string, allChildIds: string[]) => {
    setSelectedMenus(prev => {
      const next = new Set(prev);
      const allChecked = allChildIds.every(cid => next.has(cid));
      if (allChecked) {
        allChildIds.forEach(cid => next.delete(cid));
      } else {
        allChildIds.forEach(cid => next.add(cid));
      }
      return next;
    });
  };

  // Filter resources based on selected menus
  const availableResources = useMemo(() => {
    const menuIds = form.menuMode === "all" ? menuData.map(m => m.id) : [...selectedMenus];
    return {
      buttons: resourceData.filter(r => r.type === "button" && menuIds.includes(r.menuId)),
      apis: resourceData.filter(r => r.type === "api" && menuIds.includes(r.menuId)),
      data: resourceData.filter(r => r.type === "data" && menuIds.includes(r.menuId)),
    };
  }, [form.menuMode, selectedMenus]);

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("请输入角色名称"); return; }
    if (form.menuMode === "specified" && selectedMenus.size === 0) { toast.error("请至少选择一个模块权限"); return; }
    toast.success(isEdit ? "角色更新成功" : "角色创建成功");
    navigate("/permission/role");
  };

  const inputClass = "h-9 w-full rounded-lg border border-input bg-card px-3 text-[13px] shadow-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all";

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigate("/permission/role")} className="text-[13px] text-muted-foreground hover:text-primary transition-colors">
          角色管理
        </button>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <span className="text-[14px] text-foreground font-semibold tracking-tight">
          {isEdit ? `编辑角色 · ${existingRole?.name}` : "新建角色"}
        </span>
      </div>

      {/* 基本信息 */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">基本信息</h3>
        <p className="text-[13px] text-muted-foreground mb-6">配置角色的名称和类型</p>
        <div className="space-y-5 max-w-2xl">
          <FormRow label="角色名称" required>
            <input className={inputClass} placeholder="请输入角色名称" value={form.name} onChange={e => update("name", e.target.value)} />
          </FormRow>
          <FormRow label="角色编码" required hint="系统唯一标识，创建后不可修改">
            <input className={cn(inputClass, "font-mono")} placeholder="如 enterprise_admin" value={form.code} onChange={e => update("code", e.target.value)} disabled={isEdit} />
          </FormRow>
          <FormRow label="角色类型" required hint="可同时选择多个类型">
            <div className="flex flex-wrap gap-2 pt-1">
              {([
                { key: "platform" as RoleType, label: "平台" },
                { key: "enterprise" as RoleType, label: "企业" },
              ]).map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleRoleType(opt.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[13px] font-medium transition-all",
                    form.roleType.includes(opt.key)
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {opt.label}
                  {form.roleType.includes(opt.key) && (
                    <X className="w-3 h-3 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); toggleRoleType(opt.key); }} />
                  )}
                </button>
              ))}
            </div>
          </FormRow>
          <FormRow label="角色描述">
            <textarea
              className="w-full min-h-[72px] rounded-lg border border-input bg-card px-3 py-2 text-[13px] shadow-none resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-all"
              placeholder="描述该角色的职能和权限范围"
              value={form.description}
              onChange={e => update("description", e.target.value)}
            />
          </FormRow>
        </div>
      </div>

      {/* 模块权限 */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">模块权限</h3>
        <p className="text-[13px] text-muted-foreground mb-5">选择该角色可访问的菜单模块</p>

        <FormRow label="模块权限" required>
          <div className="flex items-center gap-5 mb-4">
            {[
              { key: "specified" as const, label: "指定模块" },
              { key: "all" as const, label: "全部模块" },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                  form.menuMode === opt.key ? "border-primary" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                )}>
                  {form.menuMode === opt.key && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-[13px]">{opt.label}</span>
              </label>
            ))}
          </div>
        </FormRow>

        {form.menuMode === "specified" && (
          <div className="ml-[136px] max-w-2xl">
            <div className="border rounded-lg p-3 max-h-[360px] overflow-y-auto">
              <MenuCheckTree
                tree={menuTree}
                selected={selectedMenus}
                onToggle={handleMenuToggle}
                expanded={treeExpanded}
                onToggleExpand={(id) => {
                  setTreeExpanded(prev => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id); else next.add(id);
                    return next;
                  });
                }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              已选 {selectedMenus.size} 个模块 · 仅支持选择支持模块下的资源，模块取消，支持资源同步删除
            </p>
          </div>
        )}
      </div>

      {/* 资源权限 */}
      <div className="bg-card rounded-2xl border border-border/70 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">资源权限</h3>
        <p className="text-[13px] text-muted-foreground mb-5">选择该角色可操作的按钮、接口和数据资源</p>

        <FormRow label="资源权限" required>
          <div className="flex items-center gap-5 mb-4">
            {[
              { key: "specified" as const, label: "指定资源" },
              { key: "all" as const, label: "全部资源" },
            ].map(opt => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer group">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                  form.resourceMode === opt.key ? "border-primary" : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                )}>
                  {form.resourceMode === opt.key && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-[13px]">{opt.label}</span>
              </label>
            ))}
          </div>
        </FormRow>

        {form.resourceMode === "specified" && (
          <div className="ml-[136px] max-w-2xl space-y-4">
            <TagSelector
              label="按钮资源"
              items={availableResources.buttons.map(r => ({ id: r.id, name: r.name, code: r.code }))}
              selectedIds={selectedButtons}
              onChange={setSelectedButtons}
            />
            <TagSelector
              label="接口资源"
              items={availableResources.apis.map(r => ({ id: r.id, name: r.name, code: r.code }))}
              selectedIds={selectedApis}
              onChange={setSelectedApis}
            />
            <TagSelector
              label="数据资源"
              items={availableResources.data.map(r => ({ id: r.id, name: r.name, code: r.code }))}
              selectedIds={selectedData}
              onChange={setSelectedData}
            />
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center gap-4 pt-2">
        <button className="btn-secondary px-8 py-2.5" onClick={() => navigate("/permission/role")}>取消</button>
        <button className="btn-primary px-8 py-2.5" onClick={handleSubmit}>{isEdit ? "更新" : "创建"}</button>
      </div>
    </div>
  );
}
