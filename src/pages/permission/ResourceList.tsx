import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { resourceData, menuData, RESOURCE_TYPE_MAP, type Resource, type ResourceType } from "@/data/permission";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TAB_LIST: { key: ResourceType | "all"; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "button", label: "按钮" },
  { key: "api", label: "接口" },
  { key: "data", label: "数据" },
];

const filterFields: FilterField[] = [
  { key: "keyword", label: "策略名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "menu", label: "所属模块", type: "select", options: menuData.filter(m => m.level <= 2).map(m => ({ label: (m.level === 2 ? "　" : "") + m.name, value: m.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [
    { label: "启用", value: "active" },
    { label: "停用", value: "inactive" },
  ], width: 100 },
];

export default function ResourceList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ResourceType | "all">("all");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = resourceData.filter(r => {
    if (activeTab !== "all" && r.type !== activeTab) return false;
    if (filters.keyword && !r.name.includes(filters.keyword) && !r.code.includes(filters.keyword)) return false;
    if (filters.menu && r.menuId !== filters.menu) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  const stats = {
    all: resourceData.length,
    button: resourceData.filter(r => r.type === "button").length,
    api: resourceData.filter(r => r.type === "api").length,
    data: resourceData.filter(r => r.type === "data").length,
  };

  const columns: TableColumn<Resource>[] = [
    { key: "code", title: "策略编码", minWidth: 100, render: (v) => <span className="font-mono text-[12px] text-primary">{v}</span> },
    { key: "name", title: "策略名称", minWidth: 120, render: (v, row) => (
      <button className="text-[13px] font-medium text-foreground hover:text-primary transition-colors" onClick={() => navigate(`/permission/resource/detail/${(row as Resource).id}`)}>
        {v}
      </button>
    )},
    { key: "type", title: "类型", minWidth: 80, render: (v: string) => {
      const cfg = RESOURCE_TYPE_MAP[v as ResourceType];
      return <span className={cfg?.className}>{cfg?.label}</span>;
    }},
    { key: "menuPath", title: "所属模块", minWidth: 200, render: (v) => <span className="text-[12px] text-muted-foreground">{v}</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => (
      <span className={v === "active" ? "badge-active" : "badge-inactive"}>
        {v === "active" ? "启用" : "已停用"}
      </span>
    )},
  ];

  const actions: ActionItem<Resource>[] = [
    { label: "编辑", onClick: (r) => navigate(`/permission/resource/edit/${r.id}`) },
    { label: "停用", onClick: (r) => toast.success(`策略「${r.name}」已停用`), danger: true, visible: (r) => r.status === "active" },
    { label: "启用", onClick: (r) => toast.success(`策略「${r.name}」已启用`), visible: (r) => r.status === "inactive" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="策略管理"
        subtitle="管理系统中按钮、接口、数据三类策略，策略挂载在菜单模块下，通过角色分配给用户"
        actions={
          <button className="btn-primary" onClick={() => navigate("/permission/resource/create")}>
            <Plus className="h-4 w-4" /> 新建策略
          </button>
        }
      />

      {/* Tabs */}
      <div className="bg-card rounded-xl border p-1 inline-flex gap-1" style={{ boxShadow: "var(--shadow-xs)" }}>
        {TAB_LIST.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
            <span className={cn(
              "ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full",
              activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {stats[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={3}
      />

      <AdminTable columns={columns} data={filtered} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
    </div>
  );
}
