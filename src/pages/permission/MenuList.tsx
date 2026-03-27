import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { menuData, getMenuChildren, buildMenuTree, flattenMenuTree, MENU_TYPE_MAP, ROLE_TYPE_MAP, PRODUCTS, type MenuItem } from "@/data/permission";
import { Plus, Expand, Shrink } from "lucide-react";
import { toast } from "sonner";

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

function matchesFilter(menu: MenuItem, filters: Record<string, string>): boolean {
  if (filters.keyword && !menu.name.includes(filters.keyword) && !menu.code.includes(filters.keyword)) return false;
  if (filters.menuType && menu.menuType !== filters.menuType) return false;
  if (filters.roleType && !menu.roleTypes.includes(filters.roleType as any)) return false;
  if (filters.product && !menu.products.includes(filters.product)) return false;
  if (filters.status && menu.status !== filters.status) return false;
  return true;
}

function filterTree(items: MenuItem[], filters: Record<string, string>): MenuItem[] {
  const hasActiveFilter = Object.values(filters).some(v => v);
  if (!hasActiveFilter) return items;

  return items.reduce<MenuItem[]>((acc, item) => {
    const children = item.children?.length ? filterTree(item.children, filters) : [];
    const selfMatch = matchesFilter(item, filters);
    if (selfMatch || children.length > 0) {
      acc.push({ ...item, children });
    }
    return acc;
  }, []);
}

export default function MenuList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(menuData.filter(m => m.level === 1).map(m => m.id))
  );

  const tree = useMemo(() => buildMenuTree(menuData), []);
  const filteredTree = useMemo(() => filterTree(tree, filters), [tree, filters]);
  const flatData = useMemo(() => flattenMenuTree(filteredTree), [filteredTree]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(menuData.map(m => m.id)));
  const collapseAll = () => setExpanded(new Set());

  const columns: TableColumn<MenuItem>[] = [
    {
      key: "name", title: "菜单名称", minWidth: 260,
      render: (v, row) => (
        <button
          className="text-foreground font-medium hover:text-primary transition-colors text-[13px]"
          onClick={() => navigate(`/permission/menu/detail/${row.id}`)}
        >
          {v}
        </button>
      ),
    },
    {
      key: "code", title: "编码", minWidth: 180,
      render: (v) => <span className="font-mono text-[12px] text-muted-foreground">{v}</span>,
    },
    {
      key: "menuType", title: "类型", minWidth: 100,
      render: (v: string) => {
        const cfg = MENU_TYPE_MAP[v as keyof typeof MENU_TYPE_MAP];
        return <span className={cfg?.className}>{cfg?.label}</span>;
      },
    },
    {
      key: "products", title: "关联产品", minWidth: 160,
      render: (v: string[]) => {
        if (!v?.length) return <span className="text-[12px] text-muted-foreground">通用</span>;
        const names = v.map(code => PRODUCTS.find(p => p.code === code)?.name || code);
        return (
          <div className="flex flex-wrap gap-1">
            {names.slice(0, 2).map(name => <span key={name} className="badge-product">{name}</span>)}
            {names.length > 2 && <span className="text-[11px] text-muted-foreground">+{names.length - 2}</span>}
          </div>
        );
      },
    },
    {
      key: "roleTypes", title: "角色可见", minWidth: 120,
      render: (v: string[]) => (
        <div className="flex flex-wrap gap-1">
          {v?.map(rt => {
            const cfg = ROLE_TYPE_MAP[rt as keyof typeof ROLE_TYPE_MAP];
            return <span key={rt} className={cfg?.className}>{cfg?.label === "企业角色" ? "企业" : "平台"}</span>;
          })}
        </div>
      ),
    },
    {
      key: "requiredEntitlement", title: "权益要求", minWidth: 120,
      render: (v: string) => v ? <span className="badge-warning">{v}</span> : <span className="text-muted-foreground text-[12px]">—</span>,
    },
    {
      key: "status", title: "状态", minWidth: 80,
      render: (v: string) => (
        <span className={v === "active" ? "badge-active" : "badge-inactive"}>
          {v === "active" ? "启用" : "停用"}
        </span>
      ),
    },
  ];

  const actions: ActionItem<MenuItem>[] = [
    { label: "详情", onClick: (r) => navigate(`/permission/menu/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => navigate(`/permission/menu/edit/${r.id}`) },
    {
      label: (r) => r.status === "active" ? "停用" : "启用",
      onClick: (r) => toast.success(`${r.name} 已${r.status === "active" ? "停用" : "启用"}`),
      danger: true,
      confirm: { title: "确认操作", description: "该操作将立即生效，请确认是否继续。" },
    },
  ];

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
          <button className="btn-primary" onClick={() => navigate("/permission/menu/create")}>
            <Plus className="h-4 w-4" /> 新建菜单
          </button>
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

      {/* 表格工具栏 */}
      <div className="flex items-center justify-end gap-2">
        <button className="btn-secondary text-[12px] gap-1" onClick={expandAll}>
          <Expand className="h-3.5 w-3.5" /> 全部展开
        </button>
        <button className="btn-secondary text-[12px] gap-1" onClick={collapseAll}>
          <Shrink className="h-3.5 w-3.5" /> 全部收起
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={flatData}
        rowKey={(r) => r.id}
        actions={actions}
        maxVisibleActions={2}
        actionColumnWidth={160}
        expandable={{
          childrenKey: "children",
          expandedKeys: expanded,
          onToggle: toggleExpand,
          indent: 24,
        }}
        getLevel={(r) => r.level - 1}
      />

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
