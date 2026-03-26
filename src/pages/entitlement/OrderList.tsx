import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { orderData as initialData, appData, ORDER_STATUS, ORDER_SOURCES, type EntitlementOrder } from "@/data/entitlement";
import { OrderDialog } from "./dialogs/OrderDialog";

const filterFields: FilterField[] = [
  { key: "orderNo", label: "订单号/客户", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: ORDER_STATUS.map((s) => ({ label: s.label, value: s.value })), width: 120 },
  { key: "source", label: "来源", type: "select", options: ORDER_SOURCES.map((s) => ({ label: s.label, value: s.value })), width: 120 },
];

export default function OrderList() {
  const navigate = useNavigate();
  const [data, setData] = useState<EntitlementOrder[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EntitlementOrder | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("订单已更新");
    } else {
      const orderNo = `ENT${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(data.length + 1).padStart(4, "0")}`;
      setData((prev) => [{ id: String(Date.now()), orderNo, ...form, createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("订单已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget, data.length]);

  const columns: TableColumn<EntitlementOrder>[] = [
    { key: "orderNo", title: "订单号", minWidth: 170, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors font-mono text-[12px]" onClick={() => navigate(`/entitlement/order/detail/${(row as EntitlementOrder).id}`)}>{v}</button> },
    { key: "customerName", title: "客户", minWidth: 180 },
    { key: "items", title: "商品/套餐", minWidth: 160, render: (_v, row) => {
      const items = (row as EntitlementOrder).items;
      return <span className="text-[12px]">{items.map((i) => i.itemName).join("、")}</span>;
    }},
    { key: "totalAmount", title: "金额", minWidth: 80, align: "right" as const, render: (v: number) => <span className={`font-medium ${v > 0 ? "text-foreground" : "text-muted-foreground"}`}>{v > 0 ? `¥${v}` : "¥0"}</span> },
    { key: "source", title: "来源", minWidth: 80, render: (v: string) => <span className="text-[12px]">{ORDER_SOURCES.find((s) => s.value === v)?.label}</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const s = ORDER_STATUS.find((os) => os.value === v); return <span className={s?.className || ""}>{s?.label}</span>; } },
    { key: "createdAt", title: "创建时间", minWidth: 110 },
  ];

  const filtered = data.filter((d) => {
    if (filters.orderNo && !d.orderNo.includes(filters.orderNo) && !d.customerName.includes(filters.orderNo)) return false;
    if (filters.appId && d.appId !== filters.appId) return false;
    if (filters.status && d.status !== filters.status) return false;
    if (filters.source && d.source !== filters.source) return false;
    return true;
  });

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const actions = (row: EntitlementOrder): ActionItem[] => [
    { label: "查看详情", onClick: () => navigate(`/entitlement/order/detail/${row.id}`) },
    ...(row.status === "pending" ? [
      { label: "标记已支付", onClick: () => { setData((prev) => prev.map((o) => o.id === row.id ? { ...o, status: "paid" as const, paidAt: new Date().toLocaleString("zh-CN") } : o)); toast.success("已标记为已支付"); } },
      { label: "取消订单", onClick: () => { setData((prev) => prev.map((o) => o.id === row.id ? { ...o, status: "cancelled" as const } : o)); toast.success("订单已取消"); }, danger: true },
    ] : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益订单管理" actions={[
        { label: "导出", icon: Download, variant: "outline" as const, onClick: () => toast.info("导出功能开发中") },
        { label: "新建订单", icon: Plus, onClick: () => { setEditTarget(null); setDialogOpen(true); } },
      ]} />
      <FilterBar fields={filterFields} values={filters} onChange={setFilters} onReset={() => setFilters({})} />
      <AdminTable columns={columns} data={paged} rowKey="id" actions={actions} />
      <Pagination current={currentPage} pageSize={pageSize} total={filtered.length} onChange={setCurrentPage} onPageSizeChange={setPageSize} />
      <OrderDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
