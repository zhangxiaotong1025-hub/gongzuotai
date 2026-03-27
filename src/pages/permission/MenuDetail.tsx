import { useParams, Link } from "react-router-dom";
import { menuData, getMenuChildren, getMenuPath, MENU_TYPE_MAP, ROLE_TYPE_MAP, PRODUCTS, roleData, resourceData, type MenuItem } from "@/data/permission";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { ChevronRight } from "lucide-react";

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground text-[13px]">{label}</span>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

export default function MenuDetail() {
  const { id } = useParams();
  const menuIdx = menuData.findIndex(m => m.id === id);
  const menu = menuIdx >= 0 ? menuData[menuIdx] : null;

  if (!menu) return <div className="p-10 text-center text-muted-foreground">菜单不存在</div>;

  const typeCfg = MENU_TYPE_MAP[menu.menuType];
  const path = getMenuPath(menu.id);
  const children = getMenuChildren(menu.id);
  const parent = menu.parentId ? menuData.find(m => m.id === menu.parentId) : null;

  const productNames = menu.products.length > 0
    ? menu.products.map(code => PRODUCTS.find(p => p.code === code)?.name || code)
    : ["通用（全产品）"];

  const referencingRoles = roleData.filter(r => r.menuMode === "all" || r.menuIds.includes(menu.id));
  const referencingResources = resourceData.filter(r => r.menuId === menu.id);

  const allMenus = menuData;
  const prevMenu = menuIdx > 0 ? allMenus[menuIdx - 1] : null;
  const nextMenu = menuIdx < allMenus.length - 1 ? allMenus[menuIdx + 1] : null;

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="菜单管理"
        backPath="/permission/menu"
        currentName={menu.name}
        prevPath={prevMenu ? `/permission/menu/detail/${prevMenu.id}` : null}
        nextPath={nextMenu ? `/permission/menu/detail/${nextMenu.id}` : null}
      />

      {path.length > 1 && (
        <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
          {path.map((p, idx) => (
            <span key={p.id} className="flex items-center gap-1">
              {idx > 0 && <ChevronRight className="w-3 h-3" />}
              <Link to={`/permission/menu/detail/${p.id}`} className={idx === path.length - 1 ? "text-foreground font-medium" : "hover:text-primary"}>
                {p.name}
              </Link>
            </span>
          ))}
        </div>
      )}

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">基本信息</h3>
        <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-[13px]">
          <DetailItem label="菜单名称" value={<span className="font-medium text-foreground">{menu.name}</span>} />
          <DetailItem label="菜单编码" value={<span className="font-mono text-[12px] text-foreground">{menu.code}</span>} />
          <DetailItem label="菜单类型" value={<span className={typeCfg.className}>{typeCfg.label}</span>} />
          <DetailItem label="状态" value={<span className={menu.status === "active" ? "badge-active" : "badge-inactive"}>{menu.status === "active" ? "启用" : "停用"}</span>} />
          <DetailItem label="层级" value={<span className="text-foreground">L{menu.level}</span>} />
          <DetailItem label="上级菜单" value={parent ? <Link to={`/permission/menu/detail/${parent.id}`} className="text-primary hover:underline">{parent.name}</Link> : <span className="text-muted-foreground">无（顶级菜单）</span>} />
          <DetailItem label="排序" value={<span className="text-foreground">{menu.sort}</span>} />
          <DetailItem label="分组" value={<span className="text-foreground">{menu.groupType === "main" ? "主导航" : menu.groupType === "personal" ? "个人中心" : "基础"}</span>} />
          {menu.path && <DetailItem label="路径" value={<span className="font-mono text-[12px] text-foreground">{menu.path}</span>} />}
          {menu.remark && <DetailItem label="备注" value={<span className="text-foreground">{menu.remark}</span>} />}
        </div>
      </div>

      {/* 权限配置 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">权限配置</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-[13px]">
          <DetailItem label="角色可见范围" value={
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {menu.roleTypes.map(rt => {
                const cfg = ROLE_TYPE_MAP[rt];
                return <span key={rt} className={cfg.className}>{cfg.label}</span>;
              })}
            </div>
          } />
          <DetailItem label="关联产品" value={
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {productNames.map(name => <span key={name} className="badge-product">{name}</span>)}
            </div>
          } />
          <DetailItem label="权益要求" value={
            menu.requiredEntitlement
              ? <span className="badge-warning">{menu.requiredEntitlement}</span>
              : <span className="text-muted-foreground">无</span>
          } />
          <DetailItem label="企业属性要求" value={
            menu.enterpriseRequirements ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {menu.enterpriseRequirements.brandRelationship && (
                  <span className="badge-product">品牌关系: {menu.enterpriseRequirements.brandRelationship === "own" ? "拥有" : "代理"}</span>
                )}
                {menu.enterpriseRequirements.supplierStatus && (
                  <span className="badge-product">供应链: 已加入</span>
                )}
              </div>
            ) : <span className="text-muted-foreground">无</span>
          } />
        </div>
      </div>

      {/* 子菜单 */}
      {children.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">子菜单 ({children.length})</h3>
          <div className="space-y-2">
            {children.map(child => {
              const childTypeCfg = MENU_TYPE_MAP[child.menuType];
              return (
                <Link key={child.id} to={`/permission/menu/detail/${child.id}`} className="flex items-center justify-between border rounded-lg p-3 hover:border-primary/40 hover:bg-primary/5 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-foreground">{child.name}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{child.code}</span>
                    <span className={childTypeCfg.className}>{childTypeCfg.label}</span>
                  </div>
                  <span className={child.status === "active" ? "badge-active" : "badge-inactive"}>
                    {child.status === "active" ? "启用" : "停用"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 引用角色 */}
      {referencingRoles.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">引用此菜单的角色 ({referencingRoles.length})</h3>
          <div className="space-y-2">
            {referencingRoles.map(role => (
              <Link key={role.id} to={`/permission/role/detail/${role.id}`} className="flex items-center justify-between border rounded-lg p-3 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-foreground">{role.name}</span>
                  <span className={role.roleType === "platform" ? "badge-info" : "badge-active"}>
                    {role.roleType === "platform" ? "平台角色" : "企业角色"}
                  </span>
                </div>
                <span className="text-[12px] text-muted-foreground">{role.userCount} 人使用</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 关联资源 */}
      {referencingResources.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">关联资源 ({referencingResources.length})</h3>
          <div className="space-y-2">
            {referencingResources.map(res => (
              <div key={res.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-foreground">{res.name}</span>
                  <span className={res.type === "button" ? "badge-info" : res.type === "api" ? "badge-active" : "badge-warning"}>
                    {res.type === "button" ? "按钮" : res.type === "api" ? "接口" : "数据"}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">{res.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
