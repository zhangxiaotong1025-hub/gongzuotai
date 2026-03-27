import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { menuData, buildMenuTree, PRODUCTS, PERMISSION_ACTIONS, roleData, type RoleType, type PermissionAction } from "@/data/permission";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";

function FormRow({ label, required, children, wide }: { label: string; required?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <label className={`text-[13px] text-muted-foreground text-right pt-2 shrink-0 ${wide ? "w-[120px]" : "w-[var(--form-label-width)]"}`}>
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

interface MenuTreeNode {
  id: string;
  name: string;
  code: string;
  level: number;
  children?: MenuTreeNode[];
}

function MenuCheckTree({ tree, selected, onToggle, expanded, onToggleExpand }: {
  tree: MenuTreeNode[];
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
        const allChildIds = collectIds(node);
        const allChecked = allChildIds.every(id => selected.has(id));
        const someChecked = allChildIds.some(id => selected.has(id));

        return (
          <div key={node.id}>
            <div className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-muted/50" style={{ paddingLeft: 8 + (node.level - 1) * 20 }}>
              {hasChildren ? (
                <button onClick={() => onToggleExpand(node.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              ) : (
                <span className="w-5" />
              )}
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={() => onToggle(node.id, allChildIds)}
              />
              <span className="text-[13px] text-foreground">{node.name}</span>
              <span className="text-[11px] text-muted-foreground font-mono">{node.code}</span>
            </div>
            {isOpen && hasChildren && (
              <MenuCheckTree
                tree={node.children!}
                selected={selected}
                onToggle={onToggle}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function collectIds(node: MenuTreeNode): string[] {
  const ids = [node.id];
  node.children?.forEach(c => ids.push(...collectIds(c)));
  return ids;
}

export default function RoleCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    code: "",
    roleType: "enterprise" as RoleType,
    description: "",
    products: [] as string[],
    permissions: ["view"] as PermissionAction[],
    status: "active" as "active" | "inactive",
  });
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [treeExpanded, setTreeExpanded] = useState<Set<string>>(
    new Set(menuData.filter(m => m.level === 1).map(m => m.id))
  );

  const menuTree = useMemo(() => buildMenuTree(menuData), []);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleProduct = (code: string) => {
    setForm(prev => ({
      ...prev,
      products: prev.products.includes(code) ? prev.products.filter(p => p !== code) : [...prev.products, code],
    }));
  };

  const togglePermission = (perm: PermissionAction) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm],
    }));
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

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("请输入角色名称"); return; }
    if (!form.code.trim()) { toast.error("请输入角色编码"); return; }
    if (roleData.some(r => r.code === form.code)) { toast.error("角色编码已存在"); return; }
    if (selectedMenus.size === 0) { toast.error("请至少选择一个菜单权限"); return; }
    toast.success("角色创建成功");
    navigate("/permission/role");
  };

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="角色管理"
        backPath="/permission/role"
        currentName="新建角色"
      />

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-5">基本信息</h3>
        <div className="space-y-4 max-w-2xl">
          <FormRow label="角色名称" required>
            <input className="admin-input w-full" placeholder="请输入角色名称" value={form.name} onChange={e => update("name", e.target.value)} />
          </FormRow>
          <FormRow label="角色编码" required>
            <input className="admin-input w-full font-mono" placeholder="如 enterprise_admin" value={form.code} onChange={e => update("code", e.target.value)} />
          </FormRow>
          <FormRow label="角色类型" required>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="roleType" checked={form.roleType === "enterprise"} onChange={() => update("roleType", "enterprise")} className="accent-primary" />
                <span className="text-[13px]">企业角色</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="roleType" checked={form.roleType === "platform"} onChange={() => update("roleType", "platform")} className="accent-primary" />
                <span className="text-[13px]">平台角色</span>
              </label>
            </div>
          </FormRow>
          <FormRow label="角色描述">
            <textarea className="admin-input w-full min-h-[72px] resize-y" placeholder="描述该角色的职能和权限范围" value={form.description} onChange={e => update("description", e.target.value)} />
          </FormRow>
          <FormRow label="状态">
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" checked={form.status === "active"} onChange={() => update("status", "active")} className="accent-primary" />
                <span className="text-[13px]">启用</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" checked={form.status === "inactive"} onChange={() => update("status", "inactive")} className="accent-primary" />
                <span className="text-[13px]">停用</span>
              </label>
            </div>
          </FormRow>
        </div>
      </div>

      {/* 产品权限 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-5">产品权限</h3>
        <div className="flex flex-wrap gap-3">
          {PRODUCTS.map(p => (
            <label
              key={p.code}
              className={`flex items-center gap-2 border rounded-lg px-4 py-3 cursor-pointer transition-all ${
                form.products.includes(p.code)
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Checkbox
                checked={form.products.includes(p.code)}
                onCheckedChange={() => toggleProduct(p.code)}
              />
              <span className="text-[13px]">{p.icon} {p.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 操作权限 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-5">操作权限</h3>
        <div className="flex flex-wrap gap-3">
          {PERMISSION_ACTIONS.map(a => (
            <label
              key={a.value}
              className={`flex items-center gap-2 border rounded-lg px-4 py-2.5 cursor-pointer transition-all ${
                form.permissions.includes(a.value)
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <Checkbox
                checked={form.permissions.includes(a.value)}
                onCheckedChange={() => togglePermission(a.value)}
              />
              <span className="text-[13px]">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 菜单权限 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-foreground">
            菜单权限 <span className="text-muted-foreground font-normal">（已选 {selectedMenus.size} 项）</span>
          </h3>
          <div className="flex gap-2">
            <button className="btn-secondary text-[12px]" onClick={() => setTreeExpanded(new Set(menuData.map(m => m.id)))}>全部展开</button>
            <button className="btn-secondary text-[12px]" onClick={() => setTreeExpanded(new Set())}>全部收起</button>
            <button className="btn-secondary text-[12px]" onClick={() => setSelectedMenus(new Set(menuData.map(m => m.id)))}>全选</button>
            <button className="btn-secondary text-[12px]" onClick={() => setSelectedMenus(new Set())}>清空</button>
          </div>
        </div>
        <div className="border rounded-lg p-3 max-h-[400px] overflow-y-auto">
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
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-2">
        <button className="btn-secondary" onClick={() => navigate("/permission/role")}>取消</button>
        <button className="btn-primary" onClick={handleSubmit}>确认创建</button>
      </div>
    </div>
  );
}
