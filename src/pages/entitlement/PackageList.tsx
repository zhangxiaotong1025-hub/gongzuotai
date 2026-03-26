import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X, ChevronDown, ChevronUp, Check } from "lucide-react";
import { packageData as initialData, appData, skuData, BILLING_CYCLES, STATUS_MAP, type PackageItem } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "套餐名称", type: "input", placeholder: "请输入", width: 180 },
  { key: "appId", label: "适用应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "上架", value: "on_sale" }, { label: "下架", value: "off_sale" }], width: 100 },
];

function PackageDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: PackageItem | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id, appName: initial?.appName || appData[0]?.name,
    price: initial?.price ?? 0, originalPrice: initial?.originalPrice || undefined as number | undefined,
    billingCycle: initial?.billingCycle || "MONTH", trialDays: initial?.trialDays ?? 0,
    sortOrder: initial?.sortOrder ?? 1, description: initial?.description || "",
    selectedSkuIds: initial?.skuIds || [] as string[],
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const toggleSku = (skuId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedSkuIds: prev.selectedSkuIds.includes(skuId)
        ? prev.selectedSkuIds.filter((id) => id !== skuId)
        : [...prev.selectedSkuIds, skuId],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑权益包" : "新建权益包"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">组合多个商品SKU形成套餐，如会员计划</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">适用应用</label>
              <select className="filter-input w-full" value={form.appId} onChange={(e) => {
                const app = appData.find((a) => a.id === e.target.value);
                setForm({ ...form, appId: e.target.value, appName: app?.name || "" });
              }}>
                {appData.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计费周期</label>
              <select className="filter-input w-full" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}>
                {BILLING_CYCLES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">价格（元）</label>
              <input type="number" className="filter-input w-full" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">原价</label>
              <input type="number" className="filter-input w-full" value={form.originalPrice ?? ""} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">排序</label>
              <input type="number" className="filter-input w-full" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
          </div>

          {/* SKU Selection */}
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">包含商品 <span className="text-destructive">*</span> <span className="text-[11px]">（已选{form.selectedSkuIds.length}个）</span></label>
            <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-1">
              {skuData.filter((s) => s.salesStatus === "on_sale").map((s) => (
                <button key={s.id} onClick={() => toggleSku(s.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all text-left ${form.selectedSkuIds.includes(s.id) ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${form.selectedSkuIds.includes(s.id) ? "bg-primary border-primary" : "border-border"}`}>
                    {form.selectedSkuIds.includes(s.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="flex-1">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground">{s.ruleName}</span>
                </button>
              ))}
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
            const skuList = form.selectedSkuIds.map((id) => {
              const s = skuData.find((s) => s.id === id);
              return { id, name: s?.name || "", isCore: false };
            });
            onSave({ ...form, skuIds: form.selectedSkuIds, skuList, skuCount: form.selectedSkuIds.length });
          }}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}

export default function PackageList() {
  const navigate = useNavigate();
  const [data, setData] = useState<PackageItem[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PackageItem | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleStatus = useCallback((item: PackageItem) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "on_sale" ? "off_sale" : "on_sale" } : a));
    toast.success(item.status === "on_sale" ? "已下架" : "已上架");
  }, []);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("权益包已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "on_sale", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("权益包已创建");
    }
    setDialogOpen(false);
    setEditTarget(null);
  }, [editTarget]);

  const columns: TableColumn<PackageItem>[] = [
    {
      key: "name", title: "套餐名称", minWidth: 180,
      render: (v, row) => {
        const pkg = row as PackageItem;
        const isExp = expandedRows.has(pkg.id);
        return (
          <div className="flex items-center gap-1.5">
            <button className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); toggleExpand(pkg.id); }}>
              {isExp ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/package/detail/${pkg.id}`)}>{v}</button>
          </div>
        );
      },
    },
    { key: "code", title: "编码", minWidth: 120, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
    { key: "appName", title: "适用应用", minWidth: 140, render: (v) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{v}</span> },
    {
      key: "price", title: "价格", minWidth: 100, align: "right" as const,
      render: (v: number, row) => {
        const pkg = row as PackageItem;
        return (
          <div className="text-right">
            <span className="font-medium text-foreground">{v > 0 ? `¥${v}` : "免费"}</span>
            {pkg.originalPrice && <span className="text-[11px] text-muted-foreground line-through ml-1">¥{pkg.originalPrice}</span>}
            {v > 0 && <span className="text-[11px] text-muted-foreground">/{BILLING_CYCLES.find((b) => b.value === pkg.billingCycle)?.label}</span>}
          </div>
        );
      },
    },
    { key: "skuList", title: "包含商品", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{(row as PackageItem).skuList.length}个</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
    { key: "sortOrder", title: "排序", minWidth: 60, align: "center" as const },
  ];

  const actions: ActionItem<PackageItem>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/package/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "on_sale" ? "下架" : "上架", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益包" subtitle="多个商品SKU的组合套餐，如会员计划" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />

      {/* Expanded rows */}
      {data.filter((d) => expandedRows.has(d.id)).map((row) => (
        <div key={row.id} className="bg-card rounded-xl border px-5 py-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold text-foreground">{row.name}</span>
            <span className="text-[12px] text-muted-foreground">包含商品（{row.skuList.length}项）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {row.skuList.map((sku) => (
              <button key={sku.id} onClick={() => navigate(`/entitlement/sku/detail/${sku.id}`)} className={`inline-flex items-center px-2.5 py-1 rounded text-[12px] hover:ring-1 ring-primary/30 transition-all ${sku.isCore ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground"}`}>
                {sku.isCore && <span className="w-1 h-1 rounded-full bg-primary mr-1.5" />}
                {sku.name}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
      </div>
      <PackageDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
