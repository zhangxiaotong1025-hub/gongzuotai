import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { roleData, ROLE_TYPE_MAP, PRODUCTS, PERMISSION_ACTIONS, type Role } from "@/data/permission";
import { Plus, Download } from "lucide-react";
import { toast } from "sonner";

const filterFields: FilterField[] = [
  { key: "keyword", label: "角色名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "roleType", label: "角色类型", type: "select", options: [
    { label: "企业角色", value: "enterprise" },
    { label: "平台角色", value: "platform" },
  ], width: 120 },
  { key: "product", label: "产品权限", type: "select", options: PRODUCTS.map(p => ({ label: p.name, value: p.code })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [
    { label: "启用", value: "active" },
    { label: "停用", value: "inactive" },
  ], width: 100 },
];

export default function RoleList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = roleData.filter(r => {
    if (filters.keyword && !r.name.includes(filters.keyword) && !r.code.includes(filters.keyword)) return false;
    if (filters.roleType && r.roleType !== filters.roleType) return false;
    if (filters.product && !r.products.includes(filters.product)) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  const columns: TableColumn<Role>[] = [
    { key: "name", title: "角色名称", minWidth: 160, render: (v, row) => (
      <button className="text-foreground font-medium hover:text-primary transition-colors text-[13px]" onClick={() => navigate(`/permission/role/detail/${(row as Role).id}`)}>
        {v}
        {(row as Role).isSystem && <span className="ml-1.5 badge-info text-[10px]">系统</span>}
      </button>
    )},
    { key: "code", title: "编码", minWidth: 160, render: (v) => <span className="font-mono text-[12px] text-muted-foreground">{v}</span> },
    { key: "roleType", title: "角色类型", minWidth: 100, render: (v: string) => {
      const cfg = ROLE_TYPE_MAP[v as keyof typeof ROLE_TYPE_MAP];
      return <span className={cfg?.className}>{cfg?.label}</span>;
    }},
    { key: "products", title: "产品权限", minWidth: 200, render: (v: string[]) => (
      <div className="flex flex-wrap gap-1">
        {v.slice(0, 3).map(code => {
          const p = PRODUCTS.find(p => p.code === code);
          return <span key={code} className="badge-product">{p?.name || code}</span>;
        })}
        {v.length > 3 && <span className="text-[11px] text-muted-foreground">+{v.length - 3}</span>}
      </div>
    )},
    { key: "menuIds", title: "菜单权限", minWidth: 80, align: "center" as const, render: (v: string[]) => (
      <span className="text-[13px] font-medium text-foreground">{v.length}</span>
    )},
    { key: "permissions", title: "操作权限", minWidth: 200, render: (v: string[]) => (
      <div className="flex flex-wrap gap-1">
        {v.map(perm => {
          const cfg = PERMISSION_ACTIONS.find(a => a.value === perm);
          return <span key={perm} className="inline-flex items-center px-1.5 py-0 rounded text-[10px] border border-border text-muted-foreground">{cfg?.label || perm}</span>;
        })}
      </div>
    )},
    { key: "userCount", title: "用户数", minWidth: 80, align: "center" as const, render: (v: number) => (
      <span className={`text-[13px] font-medium ${v > 0 ? "text-foreground" : "text-muted-foreground"}`}>{v}</span>
    )},
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => (
      <span className={v === "active" ? "badge-active" : "badge-inactive"}>{v === "active" ? "启用" : "停用"}</span>
    )},
  ];

  const actions: ActionItem<Role>[] = [
    { label: "查看详情", onClick: (r) => navigate(`/permission/role/detail/${r.id}`) },
    { label: "编辑", onClick: () => toast.info("编辑角色"), visible: (r) => !r.isSystem },
    { label: "复制角色", onClick: () => toast.info("角色已复制") },
    { label: "停用", onClick: () => toast.info("角色已停用"), danger: true, visible: (r) => r.status === "active" && !r.isSystem },
  ];

  // Stats
  const platformRoles = roleData.filter(r => r.roleType === "platform").length;
  const enterpriseRoles = roleData.filter(r => r.roleType === "enterprise").length;
  const totalUsers = roleData.reduce((sum, r) => sum + r.userCount, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="角色管理"
        subtitle={`共 ${roleData.length} 个角色 · 平台 ${platformRoles} · 企业 ${enterpriseRoles} · 已分配 ${totalUsers} 人`}
        actions={
          <div className="flex gap-2">
            <button className="btn-primary"><Plus className="h-4 w-4" /> 新建角色</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
          </div>
        }
      />

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={4}
      />

      <AdminTable columns={columns} data={filtered} rowKey={(r) => r.id} actions={actions} maxVisibleActions={1} />
    </div>
  );
}
