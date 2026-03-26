import { useState, useCallback } from "react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";

/* ── Types ── */
interface Sku {
  id: string;
  name: string;
  code: string;
  ruleName: string;
  price: number;
  salesStatus: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

/* ── Constants ── */
const RULES = [
  "AI设计100次/日", "AI设计300次/日", "AI设计500次/日",
  "4K渲染2次/日", "4K渲染4次/日", "8K渲染1次/日",
  "4K渲染1次", "8K渲染1次", "云存储200MB", "云存储4GB",
  "素材库访问",
];

/* ── Mock ── */
const initialData: Sku[] = [
  { id: "1", name: "4K普通图", code: "SKU_4K_SINGLE", ruleName: "4K渲染1次", price: 3, salesStatus: "on_sale", sortOrder: 1, description: "单次4K渲染", createdAt: "2026-03-10" },
  { id: "2", name: "8K普通图", code: "SKU_8K_SINGLE", ruleName: "8K渲染1次", price: 6, salesStatus: "on_sale", sortOrder: 2, description: "单次8K渲染", createdAt: "2026-03-10" },
  { id: "3", name: "AI设计100次/日", code: "SKU_AI_100_DAY", ruleName: "AI设计100次/日", price: 0, salesStatus: "on_sale", sortOrder: 1, description: "免费版用", createdAt: "2026-03-10" },
  { id: "4", name: "AI设计300次/日", code: "SKU_AI_300_DAY", ruleName: "AI设计300次/日", price: 0, salesStatus: "on_sale", sortOrder: 2, description: "基础会员用", createdAt: "2026-03-10" },
  { id: "5", name: "AI设计500次/日", code: "SKU_AI_500_DAY", ruleName: "AI设计500次/日", price: 0, salesStatus: "on_sale", sortOrder: 3, description: "旗舰会员用", createdAt: "2026-03-10" },
  { id: "6", name: "4K渲染2次/日", code: "SKU_4K_2_DAY", ruleName: "4K渲染2次/日", price: 0, salesStatus: "on_sale", sortOrder: 4, description: "", createdAt: "2026-03-10" },
  { id: "7", name: "4K渲染4次/日", code: "SKU_4K_4_DAY", ruleName: "4K渲染4次/日", price: 0, salesStatus: "on_sale", sortOrder: 5, description: "", createdAt: "2026-03-10" },
  { id: "8", name: "8K渲染1次/日", code: "SKU_8K_1_DAY", ruleName: "8K渲染1次/日", price: 0, salesStatus: "on_sale", sortOrder: 6, description: "", createdAt: "2026-03-10" },
  { id: "9", name: "云存储200MB", code: "SKU_STORAGE_200MB", ruleName: "云存储200MB", price: 0, salesStatus: "on_sale", sortOrder: 7, description: "", createdAt: "2026-03-10" },
  { id: "10", name: "素材库访问", code: "SKU_MATERIAL", ruleName: "素材库访问", price: 0, salesStatus: "on_sale", sortOrder: 8, description: "", createdAt: "2026-03-11" },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  on_sale: { label: "上架", className: "badge-active" },
  off_sale: { label: "下架", className: "badge-inactive" },
};

const filterFields: FilterField[] = [
  { key: "name", label: "商品名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "status", label: "销售状态", type: "select", options: [{ label: "上架", value: "on_sale" }, { label: "下架", value: "off_sale" }], width: 120 },
];

const columns: TableColumn<Sku>[] = [
  { key: "name", title: "商品名称", minWidth: 160, render: (v) => <span className="text-foreground font-medium">{v}</span> },
  { key: "code", title: "商品编码", minWidth: 160, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
  { key: "ruleName", title: "权益规则", minWidth: 140, render: (v) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{v}</span> },
  { key: "price", title: "价格", minWidth: 80, align: "right" as const, render: (v: number) => <span className={`font-medium ${v > 0 ? "text-foreground" : "text-muted-foreground"}`}>{v > 0 ? `¥${v}` : "¥0"}</span> },
  { key: "salesStatus", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  { key: "sortOrder", title: "排序", minWidth: 60, align: "center" as const },
  { key: "createdAt", title: "创建时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
];

function SkuDialog({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Sku | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "", ruleName: initial?.ruleName || RULES[0],
    price: initial?.price ?? 0, sortOrder: initial?.sortOrder ?? 1, description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑商品" : "新建商品"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">可售卖的权益单位，每个SKU关联一个权益规则</p>
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
              <input className="filter-input w-full font-mono" placeholder="SKU_开头" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">权益规则 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.ruleName} onChange={(e) => setForm({ ...form, ruleName: e.target.value })}>
              {RULES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">价格（元）</label>
              <input type="number" className="filter-input w-full" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">UI排序</label>
              <input type="number" className="filter-input w-full" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">商品描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim()} onClick={() => onSave(form)}>
            {isEdit ? "保存" : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SkuList() {
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
    setDialogOpen(false);
    setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: Sku) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, salesStatus: a.salesStatus === "on_sale" ? "off_sale" : "on_sale" } : a));
    toast.success(item.salesStatus === "on_sale" ? "已下架" : "已上架");
  }, []);

  const actions: ActionItem<Sku>[] = [
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.salesStatus === "on_sale" ? "下架" : "上架", onClick: toggleStatus },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="权益商品"
        subtitle="可售卖的权益单位，每个SKU关联一个权益规则"
        actions={
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
          </div>
        }
      />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
      </div>
      <SkuDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
