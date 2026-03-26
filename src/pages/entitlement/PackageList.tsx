import { useState, useCallback } from "react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X, ChevronDown, ChevronUp } from "lucide-react";

/* ── Types ── */
interface PackageItem {
  id: string;
  name: string;
  code: string;
  appName: string;
  price: number;
  originalPrice?: number;
  billingCycle: string;
  trialDays: number;
  skuCount: number;
  skuList: { name: string; isCore: boolean }[];
  status: "on_sale" | "off_sale";
  sortOrder: number;
  description: string;
  createdAt: string;
}

/* ── Constants ── */
const BILLING_CYCLES = [
  { value: "MONTH", label: "月" },
  { value: "QUARTER", label: "季" },
  { value: "YEAR", label: "年" },
  { value: "PERMANENT", label: "永久" },
];
const APPS = ["国内3D设计工具", "国际3D设计工具", "AI App", "智能导购"];

/* ── Mock ── */
const initialData: PackageItem[] = [
  {
    id: "1", name: "免费版", code: "PKG_FREE", appName: "国内3D设计工具", price: 0, billingCycle: "PERMANENT", trialDays: 0, skuCount: 6, status: "on_sale", sortOrder: 1, description: "基础免费权益", createdAt: "2026-03-10",
    skuList: [
      { name: "AI设计100次/日", isCore: true }, { name: "4K渲染2次/日", isCore: true },
      { name: "全景图导出1次/日", isCore: false }, { name: "2D效果图导出1次/日", isCore: false },
      { name: "全屋模型库访问", isCore: false }, { name: "云存储200MB", isCore: false },
    ],
  },
  {
    id: "2", name: "基础会员", code: "PKG_BASIC", appName: "国内3D设计工具", price: 99, billingCycle: "MONTH", trialDays: 0, skuCount: 18, status: "on_sale", sortOrder: 2, description: "基础会员套餐", createdAt: "2026-03-10",
    skuList: [
      { name: "AI设计300次/日", isCore: true }, { name: "4K渲染4次/日", isCore: true },
      { name: "8K渲染1次/日", isCore: true }, { name: "全景图导出10次/日", isCore: true },
      { name: "2D效果图无限导出", isCore: true }, { name: "素材库全部访问", isCore: false },
    ],
  },
  {
    id: "3", name: "旗舰会员", code: "PKG_PRO", appName: "国内3D设计工具", price: 150, originalPrice: 299, billingCycle: "MONTH", trialDays: 0, skuCount: 20, status: "on_sale", sortOrder: 3, description: "旗舰会员套餐，全部权益", createdAt: "2026-03-10",
    skuList: [
      { name: "AI设计500次/日", isCore: true }, { name: "4K渲染4次/日", isCore: true },
      { name: "8K渲染1次/日", isCore: true }, { name: "8K渲染赠送1次", isCore: true },
      { name: "全景图导出10次/日", isCore: true }, { name: "大文件上传", isCore: true },
    ],
  },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  on_sale: { label: "上架", className: "badge-active" },
  off_sale: { label: "下架", className: "badge-inactive" },
};

const filterFields: FilterField[] = [
  { key: "name", label: "套餐名称", type: "input", placeholder: "请输入", width: 180 },
  { key: "app", label: "适用应用", type: "select", options: APPS.map((a) => ({ label: a, value: a })), width: 160 },
  { key: "status", label: "状态", type: "select", options: [{ label: "上架", value: "on_sale" }, { label: "下架", value: "off_sale" }], width: 100 },
];

export default function PackageList() {
  const [data, setData] = useState<PackageItem[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PackageItem | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const columns: TableColumn<PackageItem>[] = [
    {
      key: "name", title: "套餐名称", minWidth: 180,
      render: (v, row) => {
        const pkg = row as PackageItem;
        const isExpanded = expandedRows.has(pkg.id);
        return (
          <button className="flex items-center gap-1.5 text-foreground font-medium hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); toggleExpand(pkg.id); }}>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            {v}
          </button>
        );
      },
    },
    { key: "code", title: "套餐编码", minWidth: 120, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
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
    { key: "skuCount", title: "包含商品", minWidth: 80, align: "center" as const, render: (v) => <span className="text-primary font-medium">{v}个</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
    { key: "sortOrder", title: "排序", minWidth: 60, align: "center" as const },
    { key: "createdAt", title: "创建时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
  ];

  const toggleStatus = useCallback((item: PackageItem) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "on_sale" ? "off_sale" : "on_sale" } : a));
    toast.success(item.status === "on_sale" ? "已下架" : "已上架");
  }, []);

  const actions: ActionItem<PackageItem>[] = [
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: "查看明细", onClick: (r) => toggleExpand(r.id) },
    { label: (r) => r.status === "on_sale" ? "下架" : "上架", onClick: toggleStatus },
  ];

  /* Custom row render to show expanded SKU list */
  const renderExpandedRow = (row: PackageItem) => {
    if (!expandedRows.has(row.id)) return null;
    return (
      <tr key={`${row.id}-expanded`}>
        <td colSpan={columns.length + 1} className="px-0 py-0">
          <div className="px-6 py-3 bg-muted/20 border-t border-b border-border/40">
            <div className="text-[12px] text-muted-foreground mb-2 font-medium">包含权益（{row.skuList.length}项）</div>
            <div className="flex flex-wrap gap-1.5">
              {row.skuList.map((sku) => (
                <span key={sku.name} className={`inline-flex items-center px-2 py-1 rounded text-[12px] ${sku.isCore ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground"}`}>
                  {sku.isCore && <span className="w-1 h-1 rounded-full bg-primary mr-1.5" />}
                  {sku.name}
                </span>
              ))}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="权益包"
        subtitle="多个商品SKU的组合，业务标签（如「基础会员」）在此体现"
        actions={
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
          </div>
        }
      />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />

      {/* Expanded rows shown below the table */}
      {data.filter((d) => expandedRows.has(d.id)).map((row) => (
        <div key={row.id} className="bg-card rounded-xl border px-5 py-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold text-foreground">{row.name}</span>
            <span className="text-[12px] text-muted-foreground">包含权益（{row.skuList.length}项）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {row.skuList.map((sku) => (
              <span key={sku.name} className={`inline-flex items-center px-2.5 py-1 rounded text-[12px] ${sku.isCore ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground"}`}>
                {sku.isCore && <span className="w-1 h-1 rounded-full bg-primary mr-1.5" />}
                {sku.name}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
      </div>
    </div>
  );
}
