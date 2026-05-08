import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { productData as initialData, appData, skuData, EXCHANGE_TYPES, STATUS_MAP, getApp, type Product } from "@/data/entitlement";
import { ProductDialog } from "./dialogs/ProductDialog";

const filterFields: FilterField[] = [
  { key: "name", label: "产品名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "exchangeType", label: "交易方式", type: "select", options: EXCHANGE_TYPES.map((e) => ({ label: e.label, value: e.value })), width: 140 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
];

export default function ProductList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("权益产品已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "active", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("权益产品已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: Product) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const columns: TableColumn<Product>[] = [
    { key: "name", title: "产品名称", minWidth: 180, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors text-left" onClick={() => navigate(`/entitlement/product/detail/${(row as Product).id}`)}>{v}</button> },
    { key: "code", title: "编码", minWidth: 150, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
    { key: "appId", title: "所属应用", minWidth: 120, render: (v: string) => { const app = getApp(v); return app ? <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${v}`)}>{app.name}</button> : <span>—</span>; } },
    { key: "exchangeType", title: "交易方式", minWidth: 100, render: (v: string) => { const t = EXCHANGE_TYPES.find((x) => x.value === v); return t ? <span className={t.className}>{t.label}</span> : <span>—</span>; } },
    { key: "creditPrice", title: "积分", minWidth: 80, align: "right" as const, render: (v: number, row) => (row as Product).exchangeType === "credit" ? <span className="font-medium text-foreground">{v?.toLocaleString() || 0}</span> : <span className="text-muted-foreground">—</span> },
    { key: "ruleIds", title: "规则数", minWidth: 70, align: "center" as const, render: (_v: unknown, row) => <span className="text-primary font-medium">{((row as Product).ruleIds || []).length}</span> },
    { key: "limitPerUser", title: "每人限领", minWidth: 80, align: "center" as const, render: (v: number) => <span className="text-muted-foreground">{v && v > 0 ? `${v}次` : "不限"}</span> },
    { key: "status", title: "状态", minWidth: 70, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
    { key: "createdAt", title: "创建时间", minWidth: 100, render: (v) => <span className="text-muted-foreground">{v}</span> },
  ];

  const actions: ActionItem<Product>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/product/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益产品" subtitle="交易最小单元：积分兑换 / 内部发放 / 系统赠送 / 商品SKU 售卖均落到产品" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
      </div>
      <ProductDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
