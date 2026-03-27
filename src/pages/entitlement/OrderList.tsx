import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { orderData as initialData, appData, ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, AUDIT_STATUS, CUSTOMER_TYPES, getOrderApps, getOrderAppIds, getInitialAuditStatus, getInitialOrderStatus, type EntitlementOrder } from "@/data/entitlement";
import { OrderDialog } from "./dialogs/OrderDialog";

const filterFields: FilterField[] = [
  { key: "orderNo", label: "订单号/客户", type: "input", placeholder: "请输入", width: 200 },
  { key: "customerType", label: "账户类型", type: "select", options: CUSTOMER_TYPES.map((t) => ({ label: t.label, value: t.value })), width: 120 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "orderType", label: "订单类型", type: "select", options: ORDER_TYPES.map((s) => ({ label: s.label, value: s.value })), width: 120 },
  { key: "auditStatus", label: "审核状态", type: "select", options: AUDIT_STATUS.map((s) => ({ label: s.label, value: s.value })), width: 120 },
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
      const auditStatus = getInitialAuditStatus(form.orderType);
      const orderStatus = getInitialOrderStatus(form.orderType, auditStatus);
      setData((prev) => [{
        id: String(Date.now()), orderNo, ...form, auditStatus, orderStatus, createdAt: now,
        statusHistory: [
          { status: "created", label: "订单创建", time: now, remark: "运营创建内部订单" },
          { status: "pending_audit", label: "提交审核", time: now, remark: "内部发放订单需人工审核" },
        ],
      }, ...prev]);
      toast.success("订单已创建，等待审核");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget, data.length]);

  const filtered = data.filter((d) => {
    if (filters.orderNo && !d.orderNo.includes(filters.orderNo) && !d.customerName.includes(filters.orderNo)) return false;
    if (filters.customerType && d.customerType !== filters.customerType) return false;
    if (filters.appId && !getOrderAppIds(d).includes(filters.appId)) return false;
    if (filters.orderType && d.orderType !== filters.orderType) return false;
    if (filters.auditStatus && d.auditStatus !== filters.auditStatus) return false;
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
    { key: "customerType", title: "账户类型", minWidth: 80, render: (v: string) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${v === "B" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>
        {v === "B" ? "B端企业" : "C端用户"}
      </span>
    )},
    { key: "customerName", title: "客户名称", minWidth: 120 },
    { key: "_apps", title: "所属应用", minWidth: 160, render: (_v, row) => {
      const apps = getOrderApps(row as EntitlementOrder);
      return (
        <div className="flex flex-wrap gap-1">
          {apps.map((app) => (
            <button key={app.id} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary hover:bg-primary/20 transition-colors" onClick={() => navigate(`/entitlement/app/detail/${app.id}`)}>
              {app.name}
            </button>
          ))}
        </div>
      );
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
        ¥{v > 0 ? v.toFixed(2) : "0.00"}
      </span>
    )},
    { key: "auditStatus", title: "审核状态", minWidth: 100, render: (v: string) => {
      const cfg = AUDIT_STATUS.find((s) => s.value === v);
      return <span className={cfg?.className || ""}>{cfg?.label}</span>;
    }},
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
    { label: "审核通过", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, auditStatus: "approved" as const, orderStatus: "active" as const,
        auditBy: "当前运营", auditAt: now,
        statusHistory: [...o.statusHistory,
          { status: "approved", label: "审核通过", time: now, remark: "运营审核通过" },
          { status: "granted", label: "权益生效", time: now, remark: "权益已发放，订单生效中" },
        ],
      } : o));
      toast.success("审核通过，权益已生效");
    }, visible: (r) => r.auditStatus === "pending_audit" },
    { label: "审核驳回", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, auditStatus: "rejected" as const, orderStatus: "closed" as const,
        auditBy: "当前运营", auditAt: now, auditRemark: "审核未通过",
        statusHistory: [...o.statusHistory,
          { status: "rejected", label: "审核驳回", time: now, remark: "运营驳回订单" },
          { status: "closed", label: "订单关闭", time: now, remark: "审核驳回，订单自动关闭" },
        ],
      } : o));
      toast.success("已驳回");
    }, danger: true, visible: (r) => r.auditStatus === "pending_audit" },
    { label: "标记已支付", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, paymentStatus: "paid" as const, orderStatus: "active" as const, paidAt: now,
        statusHistory: [...o.statusHistory,
          { status: "paid", label: "支付完成", time: now, remark: "人工标记" },
          { status: "granted", label: "权益生效", time: now, remark: "权益已发放，订单生效中" },
        ],
      } : o));
      toast.success("已标记为已支付，权益已生效");
    }, visible: (r) => r.orderStatus === "pending_effect" && r.paymentStatus === "pending" },
    { label: "退款", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, paymentStatus: "refunded" as const, orderStatus: "closed" as const,
        statusHistory: [...o.statusHistory,
          { status: "refunded", label: "退款完成", time: now, remark: "运营操作退款，权益已回收" },
          { status: "closed", label: "订单关闭", time: now, remark: "退款后权益失效" },
        ],
      } : o));
      toast.success("已退款，权益已关闭");
    }, danger: true, visible: (r) => r.orderStatus === "active" && r.paymentStatus === "paid" },
    { label: "暂停权益", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, orderStatus: "suspended" as const,
        statusHistory: [...o.statusHistory, { status: "suspended", label: "权益暂停", time: now, remark: "运营暂停权益" }],
      } : o));
      toast.success("权益已暂停");
    }, danger: true, visible: (r) => r.orderStatus === "active" },
    { label: "恢复权益", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, orderStatus: "active" as const,
        statusHistory: [...o.statusHistory, { status: "active", label: "权益恢复", time: now, remark: "运营恢复权益" }],
      } : o));
      toast.success("权益已恢复");
    }, visible: (r) => r.orderStatus === "suspended" },
    { label: "关闭订单", onClick: (r) => {
      const now = new Date().toLocaleString("zh-CN");
      setData((prev) => prev.map((o) => o.id === r.id ? {
        ...o, orderStatus: "closed" as const,
        statusHistory: [...o.statusHistory, { status: "closed", label: "订单关闭", time: now, remark: "运营关闭订单" }],
      } : o));
      toast.success("订单已关闭");
    }, danger: true, visible: (r) => r.orderStatus === "pending_effect" || r.orderStatus === "draft" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="订单管理" subtitle="统一管理所有权益订单，支持用户购买、内部发放、系统发放、企业入驻四种订单类型，内部发放需人工审核，企业入驻跟随企业审核状态" actions={
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
