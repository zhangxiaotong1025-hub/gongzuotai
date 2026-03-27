import { useParams, Link } from "react-router-dom";
import { roleData, menuData, ROLE_TYPE_MAP, PRODUCTS, resourceData, getMenuChildren, MENU_TYPE_MAP, getRoleResourceCount, type MenuItem } from "@/data/permission";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Check, X } from "lucide-react";

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground text-[13px]">{label}</span>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}

export default function RoleDetail() {
  const { id } = useParams();
  const roleIdx = roleData.findIndex(r => r.id === id);
  const role = roleIdx >= 0 ? roleData[roleIdx] : null;

  if (!role) return <div className="p-10 text-center text-muted-foreground">角色不存在</div>;

  const prevRole = roleIdx > 0 ? roleData[roleIdx - 1] : null;
  const nextRole = roleIdx < roleData.length - 1 ? roleData[roleIdx + 1] : null;
  const typeCfg = ROLE_TYPE_MAP[role.roleType];
  const resCounts = getRoleResourceCount(role);

  const rootMenus = getMenuChildren(null);
  const roleMenuIds = role.menuMode === "all" ? new Set(menuData.map(m => m.id)) : new Set(role.menuIds);

  // Resources grouped by type
  const roleButtons = role.resourceMode === "all"
    ? resourceData.filter(r => r.type === "button")
    : resourceData.filter(r => r.type === "button" && role.buttonResourceIds.includes(r.id));
  const roleApis = role.resourceMode === "all"
    ? resourceData.filter(r => r.type === "api")
    : resourceData.filter(r => r.type === "api" && role.apiResourceIds.includes(r.id));
  const roleDataRes = role.resourceMode === "all"
    ? resourceData.filter(r => r.type === "data")
    : resourceData.filter(r => r.type === "data" && role.dataResourceIds.includes(r.id));

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="角色管理"
        backPath="/permission/role"
        currentName={role.name}
        prevPath={prevRole ? `/permission/role/detail/${prevRole.id}` : null}
        nextPath={nextRole ? `/permission/role/detail/${nextRole.id}` : null}
      />

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">基本信息</h3>
        <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-[13px]">
          <DetailItem label="角色名称" value={
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{role.name}</span>
              {role.isSystem && <span className="badge-info text-[10px]">系统预设</span>}
            </div>
          } />
          <DetailItem label="角色编码" value={<span className="font-mono text-[12px] text-foreground">{role.code}</span>} />
          <DetailItem label="角色类型" value={<span className={typeCfg.className}>{typeCfg.label}</span>} />
          <DetailItem label="状态" value={<span className={role.status === "active" ? "badge-active" : "badge-inactive"}>{role.status === "active" ? "启用" : "停用"}</span>} />
          {role.enterpriseName && <DetailItem label="所属企业" value={<span className="text-foreground">{role.enterpriseName}</span>} />}
          <DetailItem label="已分配用户" value={<span className="font-medium text-foreground">{role.userCount} 人</span>} />
          <DetailItem label="创建时间" value={<span className="text-foreground">{role.createdAt}</span>} />
          <DetailItem label="更新时间" value={<span className="text-foreground">{role.updatedAt}</span>} />
          <div className="col-span-4">
            <DetailItem label="角色描述" value={<span className="text-foreground">{role.description}</span>} />
          </div>
        </div>
      </div>

      {/* 模块权限 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground mb-1">模块权限</h3>
            <p className="text-[12px] text-muted-foreground">
              {role.menuMode === "all" ? "全部模块" : `已授权 ${role.menuIds.length} / ${menuData.length} 个模块`}
            </p>
          </div>
          {role.menuMode === "all" && <span className="badge-active">全部模块</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium" style={{ minWidth: 200 }}>菜单</th>
                <th className="text-left py-2 font-medium" style={{ minWidth: 100 }}>类型</th>
                <th className="text-center py-2 font-medium" style={{ minWidth: 80 }}>授权</th>
              </tr>
            </thead>
            <tbody>
              {rootMenus.map(rootMenu => {
                const l2Children = getMenuChildren(rootMenu.id);
                const rootHasAccess = roleMenuIds.has(rootMenu.id);
                const rows: React.ReactNode[] = [];

                rows.push(
                  <tr key={rootMenu.id} className="border-b border-border/40 bg-muted/20">
                    <td className="py-2 font-semibold text-foreground">
                      <Link to={`/permission/menu/detail/${rootMenu.id}`} className="hover:text-primary">{rootMenu.name}</Link>
                    </td>
                    <td className="py-2"><span className={MENU_TYPE_MAP[rootMenu.menuType].className}>{MENU_TYPE_MAP[rootMenu.menuType].label}</span></td>
                    <td className="py-2 text-center">
                      {rootHasAccess ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
                    </td>
                  </tr>
                );

                l2Children.forEach(l2 => {
                  const l2Has = roleMenuIds.has(l2.id);
                  rows.push(
                    <tr key={l2.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-1.5 pl-6 text-foreground">
                        <Link to={`/permission/menu/detail/${l2.id}`} className="hover:text-primary">{l2.name}</Link>
                      </td>
                      <td className="py-1.5"><span className={MENU_TYPE_MAP[l2.menuType].className}>{MENU_TYPE_MAP[l2.menuType].label}</span></td>
                      <td className="py-1.5 text-center">
                        {l2Has ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
                      </td>
                    </tr>
                  );

                  const l3Children = getMenuChildren(l2.id);
                  l3Children.forEach(l3 => {
                    const l3Has = roleMenuIds.has(l3.id);
                    rows.push(
                      <tr key={l3.id} className="border-b border-border/10 hover:bg-muted/20">
                        <td className="py-1.5 pl-12 text-muted-foreground">
                          <Link to={`/permission/menu/detail/${l3.id}`} className="hover:text-primary">{l3.name}</Link>
                        </td>
                        <td className="py-1.5"><span className={MENU_TYPE_MAP[l3.menuType].className}>{MENU_TYPE_MAP[l3.menuType].label}</span></td>
                        <td className="py-1.5 text-center">
                          {l3Has ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />}
                        </td>
                      </tr>
                    );
                  });
                });

                return rows;
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 资源权限 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground mb-1">资源权限</h3>
            <p className="text-[12px] text-muted-foreground">
              {role.resourceMode === "all" ? "全部资源" : `按钮 ${resCounts.buttons} · 接口 ${resCounts.apis} · 数据 ${resCounts.data}`}
            </p>
          </div>
          {role.resourceMode === "all" && <span className="badge-active">全部资源</span>}
        </div>

        {role.resourceMode === "specified" && (
          <div className="space-y-4">
            {/* 按钮资源 */}
            {roleButtons.length > 0 && (
              <div>
                <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">按钮资源 ({roleButtons.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {roleButtons.map(r => (
                    <span key={r.id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-[12px] text-foreground border border-border/50">
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 接口资源 */}
            {roleApis.length > 0 && (
              <div>
                <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">接口资源 ({roleApis.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {roleApis.map(r => (
                    <span key={r.id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-[12px] text-foreground border border-border/50">
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* 数据资源 */}
            {roleDataRes.length > 0 && (
              <div>
                <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">数据资源 ({roleDataRes.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {roleDataRes.map(r => (
                    <span key={r.id} className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-[12px] text-foreground border border-border/50">
                      {r.name}
                      {r.description && <span className="text-muted-foreground ml-1">· {r.description}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
