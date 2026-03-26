import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { accountData as initialData, appData, STATUS_MAP, type EntitlementAccount } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "customer", label: "客户名称", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "活跃", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
];

export default function AccountList() {
  const navigate = useNavigate();
  const [data] = useState<EntitlementAccount[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns: TableColumn<EntitlementAccount>[] = [
    { key: "customerName", title: "客户名称", minWidth: 200, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/account/detail/${(row as EntitlementAccount).id}`)}>{v}</button> },
    { key: "appName", title: "所属应用", minWidth: 120, render: (v: string, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${(row as EntitlementAccount).appId}`)}>{v}</button> },
    { key: "capabilities", title: "能力项", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{(row as EntitlementAccount).capabilities.length}项</span> },
    { key: "orderIds", title: "关联订单", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="font-medium">{(row as EntitlementAccount).orderIds.length}个</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg?.className}>{cfg?.label}</span>; } },
    { key: "updatedAt", title: "更新时间", minWidth: 110 },
  ];

  const filtered = data.filter((d) => {
    if (filters.customer && !d.customerName.includes(filters.customer)) return false;
    if (filters.appId && d.appId !== filters.appId) return false;
    if (filters.status && d.status !== filters.status) return false;
    return true;
  });

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const actions = (row: EntitlementAccount): ActionItem[] => [
    { label: "查看详情", onClick: () => navigate(`/entitlement/account/detail/${row.id}`) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益账户" actions={[
        { label: "导出", icon: Download, variant: "outline" as const, onClick: () => toast.info("导出功能开发中") },
      ]} />
      <FilterBar fields={filterFields} values={filters} onChange={setFilters} onReset={() => setFilters({})} />
      <AdminTable columns={columns} data={paged} rowKey="id" actions={actions} />
      <Pagination current={currentPage} pageSize={pageSize} total={filtered.length} onChange={setCurrentPage} onPageSizeChange={setPageSize} />
    </div>
  );
}
