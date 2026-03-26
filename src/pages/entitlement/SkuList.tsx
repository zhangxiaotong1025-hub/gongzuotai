import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";
import { skuData as initialData, appData, entitlementProductData, getProductsByApp, BILLING_CYCLES, STATUS_MAP, type Sku, type BillingCycle } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "商品名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "上架", value: "on_sale" }, { label: "下架", value: "off_sale" }], width: 120 },
];

function SkuDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Sku | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id, appName: initial?.appName || appData[0]?.name,
    productId: initial?.productId || "", productName: initial?.productName || "",
    price: initial?.price ?? 0, billingCycle: (initial?.billingCycle || "once") as BillingCycle,
    sortOrder: initial?.sortOrder ?? 1, description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const availableProducts = getProductsByApp(form.appId).filter((p) => p.status === "active");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑商品" : "新建商品"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">商品SKU是可售卖的最小单元，必须关联权益产品</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">商品名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">商品编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => {
              const app = appData.find((a) => a.id === e.target.value);
              setForm({ ...form, appId: e.target.value, appName: app?.name || "", productId: "", productName: "" });
            }}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">关联权益产品 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.productId} onChange={(e) => {
              const p = entitlementProductData.find((p) => p.id === e.target.value);
              setForm({ ...form, productId: e.target.value, productName: p?.name || "" });
            }}>
              <option value="">请选择权益产品</option>
              {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name}（{p.capabilityName} · {p.quota}{p.period === "daily" ? "/日" : ""}）</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">价格（元）</label>
              <input type="number" className="filter-input w-full" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计费周期</label>
              <select className="filter-input w-full" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                {BILLING_CYCLES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">排序</label>
              <input type="number" className="filter-input w-full" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim() || !form.productId} onClick={() => onSave(form)}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}

export default function SkuList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Sku[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Sku | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("商品已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, salesStatus: "on_sale", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("商品已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: Sku) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, salesStatus: a.salesStatus === "on_sale" ? "off_sale" : "on_sale" } : a));
    toast.success(item.salesStatus === "on_sale" ? "已下架" : "已上架");
  }, []);

  const columns: TableColumn<Sku>[] = [
    { key: "name", title: "商品名称", minWidth: 140, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/sku/detail/${(row as Sku).id}`)}>{v}</button> },
    { key: "code", title: "编码", minWidth: 140, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
    { key: "appName", title: "所属应用", minWidth: 130, render: (v, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${(row as Sku).appId}`)}>{v}</button> },
    { key: "productName", title: "关联权益产品", minWidth: 150, render: (v, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => navigate(`/entitlement/rule/detail/${(row as Sku).productId}`)}>{v}</button> },
    { key: "price", title: "价格", minWidth: 80, align: "right" as const, render: (v: number) => <span className={`font-medium ${v > 0 ? "text-foreground" : "text-muted-foreground"}`}>{v > 0 ? `¥${v}` : "¥0"}</span> },
    { key: "billingCycle", title: "计费", minWidth: 60, render: (v: string) => <span className="text-[12px]">{BILLING_CYCLES.find((b) => b.value === v)?.label}</span> },
    { key: "salesStatus", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
    { key: "createdAt", title: "创建时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
  ];

  const actions: ActionItem<Sku>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/sku/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.salesStatus === "on_sale" ? "下架" : "上架", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="商品SKU" subtitle="可售卖的商品，是权益交易的最小单元，必须关联一个权益产品" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <SkuDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
