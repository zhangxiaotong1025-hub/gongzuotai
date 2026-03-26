import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { Download } from "lucide-react";
import { accountData as initialData, appData, STATUS_MAP, type EntitlementAccount } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "customer", label: "企业名称", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "活跃", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
];

export default function AccountList() {
  const navigate = useNavigate();
  const [data] = useState<EntitlementAccount[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const columns: TableColumn<EntitlementAccount>[] = [
    { key: "customerName", title: "企业名称", minWidth: 200, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/account/detail/${(row as EntitlementAccount).id}`)}>{v}</button> },
    { key: "appName", title: "所属应用", minWidth: 120, render: (v: string, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${(row as EntitlementAccount).appId}`)}>{v}</button> },
    { key: "capabilities", title: "能力项", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{(row as EntitlementAccount).capabilities.length}项</span> },
    { key: "orderIds", title: "关联订单", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="font-medium">{(row as EntitlementAccount).orderIds.length}个</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg?.className}>{cfg?.label}</span>; } },
    { key: "updatedAt", title: "更新时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
  ];

  const filtered = data.filter((d) => {
    if (filters.customer && !d.customerName.includes(filters.customer)) return false;
    if (filters.appId && d.appId !== filters.appId) return false;
    if (filters.status && d.status !== filters.status) return false;
    return true;
  });

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const actions: ActionItem<EntitlementAccount>[] = [
    { label: "查看详情", onClick: (r) => navigate(`/entitlement/account/detail/${r.id}`) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益账户" subtitle="按企业+应用维度聚合的权益汇总，从订单聚合到能力+规则" actions={
        <div className="flex gap-2">
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={paged} rowKey={(r) => r.id} actions={actions} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
    </div>
  );
}
