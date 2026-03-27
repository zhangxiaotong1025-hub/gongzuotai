import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { menuData, getMenuChildren, MENU_TYPE_MAP, PRODUCTS, type MenuItem } from "@/data/permission";
import { ChevronRight, ChevronDown, Plus, ExternalLink } from "lucide-react";

const filterFields: FilterField[] = [
  { key: "keyword", label: "菜单名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "menuType", label: "菜单类型", type: "select", options: [
    { label: "基础菜单", value: "basic" },
    { label: "增量菜单", value: "incremental" },
    { label: "平台菜单", value: "platform" },
  ], width: 120 },
  { key: "roleType", label: "角色可见", type: "select", options: [
    { label: "企业角色", value: "enterprise" },
    { label: "平台角色", value: "platform" },
  ], width: 120 },
  { key: "product", label: "关联产品", type: "select", options: PRODUCTS.map(p => ({ label: p.name, value: p.code })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [
    { label: "启用", value: "active" },
    { label: "停用", value: "inactive" },
  ], width: 100 },
];

function MenuTreeRow({ menu, level, expanded, onToggle, navigate, filters }: {
  menu: MenuItem; level: number; expanded: Set<string>; onToggle: (id: string) => void;
  navigate: (path: string) => void; filters: Record<string, string>;
}) {
  const children = getMenuChildren(menu.id);
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(menu.id);
  const typeCfg = MENU_TYPE_MAP[menu.menuType];
  const productNames = menu.products.length > 0
    ? menu.products.map(code => PRODUCTS.find(p => p.code === code)?.name || code)
    : [];

  // Filter matching
  if (filters.keyword && !menu.name.includes(filters.keyword) && !menu.code.includes(filters.keyword)) {
    // Check children
    const childrenMatch = children.some(c => matchesFilter(c, filters));
    if (!childrenMatch) return null;
  }
  if (filters.menuType && menu.menuType !== filters.menuType) return null;
  if (filters.roleType && menu.roleType !== filters.roleType) return null;
  if (filters.product && !menu.products.includes(filters.product)) return null;
  if (filters.status && menu.status !== filters.status) return null;

  return (
    <>
      <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors">
        {/* 菜单名称 */}
        <td className="py-2.5 text-[13px]" style={{ paddingLeft: 16 + level * 24 }}>
          <div className="flex items-center gap-1.5">
            {hasChildren ? (
              <button onClick={() => onToggle(menu.id)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted transition-colors">
                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <button
              className="text-foreground font-medium hover:text-primary transition-colors"
              onClick={() => navigate(`/permission/menu/detail/${menu.id}`)}
            >
              {menu.name}
            </button>
          </div>
        </td>
        {/* 编码 */}
        <td className="py-2.5 text-[12px] text-muted-foreground font-mono">{menu.code}</td>
        {/* 菜单类型 */}
        <td className="py-2.5"><span className={typeCfg.className}>{typeCfg.label}</span></td>
        {/* 关联产品 */}
        <td className="py-2.5">
          {productNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {productNames.map(name => (
                <span key={name} className="badge-product">{name}</span>
              ))}
            </div>
          ) : (
            <span className="text-[12px] text-muted-foreground">通用</span>
          )}
        </td>
        {/* 角色可见 */}
        <td className="py-2.5">
          <span className={menu.roleType === "platform" ? "badge-info" : "badge-active"}>
            {menu.roleType === "platform" ? "平台" : "企业"}
          </span>
        </td>
        {/* 权益要求 */}
        <td className="py-2.5 text-[12px]">
          {menu.requiredEntitlement ? (
            <span className="badge-warning">{menu.requiredEntitlement}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        {/* 企业属性要求 */}
        <td className="py-2.5 text-[12px]">
          {menu.enterpriseRequirements ? (
            <div className="flex flex-wrap gap-1">
              {menu.enterpriseRequirements.brandRelationship && (
                <span className="badge-product">品牌:{menu.enterpriseRequirements.brandRelationship === "own" ? "拥有" : "代理"}</span>
              )}
              {menu.enterpriseRequirements.supplierStatus && (
                <span className="badge-product">供应链:已加入</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        {/* 状态 */}
        <td className="py-2.5">
          <span className={menu.status === "active" ? "badge-active" : "badge-inactive"}>
            {menu.status === "active" ? "启用" : "停用"}
          </span>
        </td>
        {/* 操作 */}
        <td className="py-2.5 text-right pr-4">
          <button
            className="text-[12px] text-primary hover:underline"
            onClick={() => navigate(`/permission/menu/detail/${menu.id}`)}
          >
            详情
          </button>
        </td>
      </tr>
      {isOpen && children.map(child => (
        <MenuTreeRow
          key={child.id}
          menu={child}
          level={level + 1}
          expanded={expanded}
          onToggle={onToggle}
          navigate={navigate}
          filters={filters}
        />
      ))}
    </>
  );
}

function matchesFilter(menu: MenuItem, filters: Record<string, string>): boolean {
  if (filters.keyword && !menu.name.includes(filters.keyword) && !menu.code.includes(filters.keyword)) return false;
  if (filters.menuType && menu.menuType !== filters.menuType) return false;
  if (filters.roleType && menu.roleType !== filters.roleType) return false;
  if (filters.product && !menu.products.includes(filters.product)) return false;
  if (filters.status && menu.status !== filters.status) return false;
  return true;
}

export default function MenuList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(menuData.filter(m => m.level === 1).map(m => m.id))
  );

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(menuData.map(m => m.id)));
  const collapseAll = () => setExpanded(new Set());

  const rootMenus = getMenuChildren(null);

  // Stats
  const totalMenus = menuData.length;
  const basicCount = menuData.filter(m => m.menuType === "basic").length;
  const incrementalCount = menuData.filter(m => m.menuType === "incremental").length;
  const platformCount = menuData.filter(m => m.menuType === "platform").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="菜单管理"
        subtitle={`共 ${totalMenus} 个菜单项 · 基础 ${basicCount} · 增量 ${incrementalCount} · 平台 ${platformCount}`}
        actions={
          <div className="flex gap-2">
            <button className="btn-secondary text-[12px]" onClick={expandAll}>全部展开</button>
            <button className="btn-secondary text-[12px]" onClick={collapseAll}>全部收起</button>
            <button className="btn-primary"><Plus className="h-4 w-4" /> 新建菜单</button>
          </div>
        }
      />

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={5}
      />

      {/* 树形表格 */}
      <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
        <table className="admin-table w-full">
          <thead>
            <tr>
              <th className="text-left py-3 px-4" style={{ minWidth: 260 }}>菜单名称</th>
              <th className="text-left py-3" style={{ minWidth: 180 }}>编码</th>
              <th className="text-left py-3" style={{ minWidth: 100 }}>类型</th>
              <th className="text-left py-3" style={{ minWidth: 160 }}>关联产品</th>
              <th className="text-left py-3" style={{ minWidth: 80 }}>角色可见</th>
              <th className="text-left py-3" style={{ minWidth: 120 }}>权益要求</th>
              <th className="text-left py-3" style={{ minWidth: 120 }}>企业属性要求</th>
              <th className="text-left py-3" style={{ minWidth: 80 }}>状态</th>
              <th className="text-right py-3 pr-4" style={{ minWidth: 60 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rootMenus.map(menu => (
              <MenuTreeRow
                key={menu.id}
                menu={menu}
                level={0}
                expanded={expanded}
                onToggle={toggleExpand}
                navigate={navigate}
                filters={filters}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* PRD 规则说明 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">菜单类型说明</h3>
        <div className="grid grid-cols-3 gap-4 text-[13px]">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-active">基础菜单</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">启用产品后默认可见，不需要额外权益。多产品场景取并集 (∪)，确保企业看到所有已启用产品的基础功能。</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-warning">增量菜单</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">需要特定权益才能开启，如 3D爆品棚拍需购买对应权益包。支持通过订单/权益配置动态解锁。</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-info">平台菜单</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">仅平台角色可见，严格隔离平台治理能力（菜单管理、权限管理、类目管理等），不得下放至企业配置层。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
