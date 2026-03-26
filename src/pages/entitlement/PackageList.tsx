import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { bundleData as initialData, appData, skuData, getSkusByApp, BILLING_CYCLES, STATUS_MAP, type Bundle, type BillingCycle, getRule } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "套餐名称", type: "input", placeholder: "请输入", width: 180 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "上架", value: "on_sale" }, { label: "下架", value: "off_sale" }], width: 100 },
];

function BundleDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Bundle | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id, appName: initial?.appName || appData[0]?.name,
    price: initial?.price ?? 0, originalPrice: initial?.originalPrice || undefined as number | undefined,
    billingCycle: (initial?.billingCycle || "monthly") as BillingCycle,
    sortOrder: initial?.sortOrder ?? 1, description: initial?.description || "",
    selectedSkuIds: initial?.items.map((i) => i.skuId) || [] as string[],
    quantities: Object.fromEntries(initial?.items.map((i) => [i.skuId, i.quantity]) || []) as Record<string, number>,
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const availableSkus = getSkusByApp(form.appId).filter((s) => s.salesStatus === "on_sale");

  const toggleSku = (skuId: string) => {
    setForm((prev) => {
      const ids = prev.selectedSkuIds.includes(skuId) ? prev.selectedSkuIds.filter((id) => id !== skuId) : [...prev.selectedSkuIds, skuId];
      const q = { ...prev.quantities };
      if (!q[skuId]) q[skuId] = 1;
      return { ...prev, selectedSkuIds: ids, quantities: q };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑套餐" : "新建套餐"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">组合多个商品SKU形成会员套餐</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">套餐名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">套餐编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => {
              const app = appData.find((a) => a.id === e.target.value);
              setForm({ ...form, appId: e.target.value, appName: app?.name || "", selectedSkuIds: [], quantities: {} });
            }}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">套餐价格（元）</label>
              <input type="number" className="filter-input w-full" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">原价</label>
              <input type="number" className="filter-input w-full" value={form.originalPrice ?? ""} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计费周期</label>
              <select className="filter-input w-full" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                {BILLING_CYCLES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">包含商品 <span className="text-destructive">*</span> <span className="text-[11px]">（已选{form.selectedSkuIds.length}个）</span></label>
            <div className="border rounded-lg p-2 max-h-[220px] overflow-y-auto space-y-0.5">
              {availableSkus.map((s) => {
                const rule = getRule(s.ruleId);
                return (
                  <div key={s.id} className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all ${form.selectedSkuIds.includes(s.id) ? "bg-primary/10" : "hover:bg-muted/60"}`}>
                    <button onClick={() => toggleSku(s.id)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${form.selectedSkuIds.includes(s.id) ? "bg-primary border-primary" : "border-border"}`}>
                      {form.selectedSkuIds.includes(s.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                    </button>
                    <span className={`flex-1 ${form.selectedSkuIds.includes(s.id) ? "text-primary font-medium" : "text-foreground"}`}>{s.name}</span>
                    <span className="text-[11px] text-muted-foreground">{s.ruleIds.length}条规则</span>
                    {form.selectedSkuIds.includes(s.id) && (
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-muted-foreground">×</span>
                        <input type="number" min={1} className="filter-input w-12 text-center text-[12px] py-0.5" value={form.quantities[s.id] || 1} onChange={(e) => setForm({ ...form, quantities: { ...form.quantities, [s.id]: Math.max(1, Number(e.target.value)) } })} />
                      </div>
                    )}
                  </div>
                );
              })}
              {availableSkus.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">该应用下暂无上架商品</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim() || form.selectedSkuIds.length === 0} onClick={() => {
            const items = form.selectedSkuIds.map((skuId) => {
              const s = skuData.find((s) => s.id === skuId);
              return { skuId, skuName: s?.name || "", quantity: form.quantities[skuId] || 1 };
            });
            onSave({ ...form, items });
          }}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}

export default function PackageList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Bundle[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bundle | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => { setExpandedRows((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const toggleStatus = useCallback((item: Bundle) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "on_sale" ? "off_sale" : "on_sale" } : a));
    toast.success(item.status === "on_sale" ? "已下架" : "已上架");
  }, []);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("套餐已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "on_sale", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("套餐已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const columns: TableColumn<Bundle>[] = [
    {
      key: "name", title: "套餐名称", minWidth: 180,
      render: (v, row) => {
        const b = row as Bundle;
        const isExp = expandedRows.has(b.id);
        return (
          <div className="flex items-center gap-1.5">
            <button className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); toggleExpand(b.id); }}>
              {isExp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/package/detail/${b.id}`)}>{v}</button>
          </div>
        );
      },
    },
    { key: "code", title: "编码", minWidth: 120, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
    { key: "appName", title: "所属应用", minWidth: 130, render: (v, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${(row as Bundle).appId}`)}>{v}</button> },
    {
      key: "price", title: "价格", minWidth: 100, align: "right" as const,
      render: (v: number, row) => {
        const b = row as Bundle;
        return (
          <div className="text-right">
            <span className="font-medium text-foreground">{v > 0 ? `¥${v}` : "免费"}</span>
            {b.originalPrice && <span className="text-[11px] text-muted-foreground line-through ml-1">¥{b.originalPrice}</span>}
            {v > 0 && <span className="text-[11px] text-muted-foreground">/{BILLING_CYCLES.find((c) => c.value === b.billingCycle)?.label}</span>}
          </div>
        );
      },
    },
    { key: "items", title: "包含商品", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{(row as Bundle).items.length}个</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
    { key: "sortOrder", title: "排序", minWidth: 60, align: "center" as const },
  ];

  const actions: ActionItem<Bundle>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/package/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "on_sale" ? "下架" : "上架", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="商品套餐" subtitle="将多个商品SKU组合成会员套餐" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />

      {data.filter((d) => expandedRows.has(d.id)).map((row) => (
        <div key={row.id} className="bg-card rounded-xl border px-5 py-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold text-foreground">{row.name}</span>
            <span className="text-[12px] text-muted-foreground">包含商品（{row.items.length}项）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {row.items.map((item) => (
              <button key={item.skuId} onClick={() => navigate(`/entitlement/sku/detail/${item.skuId}`)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] bg-muted text-muted-foreground hover:ring-1 ring-primary/30 transition-all">
                {item.skuName}
                {item.quantity > 1 && <span className="text-primary font-medium">×{item.quantity}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <BundleDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
