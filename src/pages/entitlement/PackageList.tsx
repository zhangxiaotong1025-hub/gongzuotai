import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, ChevronDown, ChevronUp } from "lucide-react";
import { bundleData as initialData, appData, skuData, BILLING_CYCLES, STATUS_MAP, type Bundle, getRule } from "@/data/entitlement";
import { BundleDialog } from "./dialogs/BundleDialog";

const filterFields: FilterField[] = [
  { key: "name", label: "套餐名称", type: "input", placeholder: "请输入", width: 180 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "上架", value: "on_sale" }, { label: "下架", value: "off_sale" }], width: 100 },
];

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
