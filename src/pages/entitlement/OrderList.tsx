import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { orderData as initialData, appData, ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, type EntitlementOrder } from "@/data/entitlement";
import { OrderDialog } from "./dialogs/OrderDialog";

const filterFields: FilterField[] = [
  { key: "orderNo", label: "订单号/企业", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "orderType", label: "订单类型", type: "select", options: ORDER_TYPES.map((s) => ({ label: s.label, value: s.value })), width: 120 },
  { key: "paymentStatus", label: "支付状态", type: "select", options: PAYMENT_STATUS.map((s) => ({ label: s.label, value: s.value })), width: 120 },
  { key: "orderStatus", label: "订单状态", type: "select", options: ORDER_STATUS.map((s) => ({ label: s.label, value: s.value })), width: 120 },
];

export default function OrderList() {
  const navigate = useNavigate();
  const [data, setData] = useState<EntitlementOrder[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EntitlementOrder | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("订单已更新");
    } else {
      const orderNo = `ORD${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(data.length + 1).padStart(4, "0")}`;
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => [{
        id: String(Date.now()), orderNo, ...form, createdAt: now,
        statusHistory: [{ status: "created", label: "订单创建", time: now, remark: "运营创建内部订单" }],
      }, ...prev]);
      toast.success("订单已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget, data.length]);

  const filtered = data.filter((d) => {
    if (filters.orderNo && !d.orderNo.includes(filters.orderNo) && !d.customerName.includes(filters.orderNo)) return false;
    if (filters.appId && d.appId !== filters.appId) return false;
    if (filters.orderType && d.orderType !== filters.orderType) return false;
    if (filters.paymentStatus && d.paymentStatus !== filters.paymentStatus) return false;
    if (filters.orderStatus && d.orderStatus !== filters.orderStatus) return false;
    return true;
  });

  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns: TableColumn<EntitlementOrder>[] = [
    { key: "orderNo", title: "订单号", minWidth: 170, render: (v, row) => (
      <button className="text-foreground font-medium hover:text-primary transition-colors font-mono text-[12px]" onClick={() => navigate(`/entitlement/order/detail/${(row as EntitlementOrder).id}`)}>
        {v}
      </button>
    )},
    { key: "customerName", title: "企业", minWidth: 140 },
    { key: "appId", title: "所属应用", minWidth: 100, render: (_v, row) => {
      const app = appData.find((a) => a.id === (row as EntitlementOrder).appId);
      return app ? <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${app.id}`)}>{app.name}</button> : "—";
    }},
    { key: "orderType", title: "订单类型", minWidth: 90, render: (v: string) => {
      const cfg = ORDER_TYPES.find((t) => t.value === v);
      return <span className={`text-[12px] font-medium ${cfg?.className || ""}`}>{cfg?.label}</span>;
    }},
    { key: "items", title: "商品/套餐", minWidth: 160, render: (_v, row) => {
      const items = (row as EntitlementOrder).items;
      return <span className="text-[12px]">{items.map((i) => i.itemName).join("、")}</span>;
    }},
    { key: "totalAmount", title: "订单金额", minWidth: 100, align: "right" as const, render: (v: number) => (
      <span className={`font-medium ${v > 0 ? "text-destructive" : "text-muted-foreground"}`}>
        {v > 0 ? `¥${v.toFixed(2)}` : "¥0.00"}
      </span>
    )},
    { key: "paymentStatus", title: "支付状态", minWidth: 90, render: (v: string) => {
      const cfg = PAYMENT_STATUS.find((s) => s.value === v);
      return <span className={cfg?.className || ""}>{cfg?.label}</span>;
    }},
    { key: "orderStatus", title: "订单状态", minWidth: 90, render: (v: string) => {
      const cfg = ORDER_STATUS.find((s) => s.value === v);
      return <span className={cfg?.className || ""}>{cfg?.label}</span>;
    }},
    { key: "createdAt", title: "创建时间", minWidth: 150, render: (v) => <span className="text-muted-foreground">{v}</span> },
  ];

  const actions: ActionItem<EntitlementOrder>[] = [
    { label: "查看详情", onClick: (r) => navigate(`/entitlement/order/detail/${r.id}`) },
    { label: "标记已支付", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, paymentStatus: "paid" as const, orderStatus: "completed" as const, paidAt: now,
        statusHistory: [...o.statusHistory, { status: "paid", label: "支付完成", time: now, remark: "人工标记" }, { status: "granted", label: "权益发放", time: now, remark: "自动发放" }, { status: "completed", label: "订单完成", time: now }],
      } : o));
      toast.success("已标记为已支付");
    }, visible: (r) => r.paymentStatus === "pending" },
    { label: "退款", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, orderStatus: "refunded" as const,
        statusHistory: [...o.statusHistory, { status: "refunded", label: "退款完成", time: now, remark: "运营操作退款" }],
      } : o));
      toast.success("已退款");
    }, danger: true, visible: (r) => r.orderStatus === "completed" && r.paymentStatus === "paid" },
    { label: "关闭", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, orderStatus: "closed" as const,
        statusHistory: [...o.statusHistory, { status: "closed", label: "订单关闭", time: now, remark: "运营关闭订单" }],
      } : o));
      toast.success("订单已关闭");
    }, danger: true, visible: (r) => r.orderStatus === "pending" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="订单管理" subtitle="统一管理所有权益订单（用户购买+内部发放+系统发放）" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 创建内部订单</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />
      <AdminTable columns={columns} data={paged} rowKey={(r) => r.id} actions={actions} maxVisibleActions={1} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={filtered.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <OrderDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
