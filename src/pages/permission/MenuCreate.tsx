import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { menuData, getMenuChildren, PRODUCTS, type MenuType, type RoleType } from "@/data/permission";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function MenuCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    code: "",
    parentId: "" as string,
    groupType: "main",
    menuType: "basic" as MenuType,
    roleTypes: ["enterprise"] as RoleType[],
    products: [] as string[],
    requiredEntitlement: "",
    sort: 1,
    status: "active" as "active" | "inactive",
    remark: "",
    // Enterprise requirements
    brandRelationship: "" as string,
    supplierStatus: false,
  });

  const rootMenus = getMenuChildren(null);
  // Build parent options: flat list with indent
  const parentOptions: { id: string; name: string; level: number }[] = [];
  const buildParentList = (parentId: string | null, level: number) => {
    const children = getMenuChildren(parentId);
    children.forEach(c => {
      if (c.level < 3) { // max 3 levels
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

  const handleSubmit = () => {
    if (!form.name.trim()) { toast.error("请输入菜单名称"); return; }
    if (!form.code.trim()) { toast.error("请输入菜单编码"); return; }
    if (menuData.some(m => m.code === form.code)) { toast.error("菜单编码已存在"); return; }
    toast.success("菜单创建成功");
    navigate("/permission/menu");
  };

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="菜单管理"
        backPath="/permission/menu"
        currentName="新建菜单"
      />

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-5">基本信息</h3>
        <div className="space-y-4 max-w-2xl">
          <FormRow label="菜单名称" required>
            <input
              className="admin-input w-full"
              placeholder="请输入菜单名称"
              value={form.name}
              onChange={e => update("name", e.target.value)}
            />
          </FormRow>
          <FormRow label="菜单编码" required>
            <input
              className="admin-input w-full font-mono"
              placeholder="如 permission.menu"
              value={form.code}
              onChange={e => update("code", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground mt-1">使用英文句号分隔层级，如 marketing.resource.ads</p>
          </FormRow>
          <FormRow label="上级菜单">
            <select
              className="admin-select w-full"
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
              className="admin-select w-full"
              value={form.groupType}
              onChange={e => update("groupType", e.target.value)}
            >
              {GROUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormRow>
          <FormRow label="排序">
            <input
              type="number"
              className="admin-input w-24"
              min={1}
              value={form.sort}
              onChange={e => update("sort", Number(e.target.value))}
            />
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
          <FormRow label="备注">
            <textarea
              className="admin-input w-full min-h-[72px] resize-y"
              placeholder="可选备注信息"
              value={form.remark}
              onChange={e => update("remark", e.target.value)}
            />
          </FormRow>
        </div>
      </div>

      {/* 权限配置 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-5">权限配置</h3>
        <div className="space-y-4 max-w-2xl">
          <FormRow label="菜单类型" required>
            <div className="grid grid-cols-3 gap-3">
              {MENU_TYPE_OPTIONS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex flex-col gap-1 border rounded-lg p-3 cursor-pointer transition-all ${
                    form.menuType === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="menuType"
                      checked={form.menuType === opt.value}
                      onChange={() => update("menuType", opt.value)}
                      className="accent-primary"
                    />
                    <span className="text-[13px] font-medium">{opt.label}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground pl-5">{opt.desc}</span>
                </label>
              ))}
            </div>
          </FormRow>

          <FormRow label="角色可见" required>
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.roleTypes.includes("enterprise")}
                  onCheckedChange={() => toggleRoleType("enterprise")}
                />
                <span className="text-[13px]">企业角色</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={form.roleTypes.includes("platform")}
                  onCheckedChange={() => toggleRoleType("platform")}
                />
                <span className="text-[13px]">平台角色</span>
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">可同时选择多个角色类型</p>
          </FormRow>

          <FormRow label="关联产品">
            <div className="flex flex-wrap gap-3 pt-1">
              {PRODUCTS.map(p => (
                <label key={p.code} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={form.products.includes(p.code)}
                    onCheckedChange={() => toggleProduct(p.code)}
                  />
                  <span className="text-[13px]">{p.icon} {p.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">不选则为通用菜单，对所有产品可见</p>
          </FormRow>

          {form.menuType === "incremental" && (
            <FormRow label="权益要求" required>
              <input
                className="admin-input w-full"
                placeholder="如 3d_product_shooting"
                value={form.requiredEntitlement}
                onChange={e => update("requiredEntitlement", e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">增量菜单需配置对应权益编码</p>
            </FormRow>
          )}
        </div>
      </div>

      {/* 企业属性要求 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-5">企业属性要求</h3>
        <p className="text-[12px] text-muted-foreground mb-4">配置该菜单对企业属性的附加要求，不配置则无限制</p>
        <div className="space-y-4 max-w-2xl">
          <FormRow label="品牌关系">
            <select
              className="admin-select w-full"
              value={form.brandRelationship}
              onChange={e => update("brandRelationship", e.target.value)}
            >
              <option value="">不限</option>
              <option value="own">拥有品牌</option>
              <option value="agent">代理品牌</option>
            </select>
          </FormRow>
          <FormRow label="供应链状态">
            <div className="flex items-center gap-2 pt-2">
              <Checkbox
                checked={form.supplierStatus}
                onCheckedChange={(v) => update("supplierStatus", Boolean(v))}
              />
              <span className="text-[13px]">需已加入供应链</span>
            </div>
          </FormRow>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-2">
        <button className="btn-secondary" onClick={() => navigate("/permission/menu")}>取消</button>
        <button className="btn-primary" onClick={handleSubmit}>确认创建</button>
      </div>
    </div>
  );
}
