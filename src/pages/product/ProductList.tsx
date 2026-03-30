import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, ChevronRight, ChevronDown, Link2, Package, Building2, X,
  ChevronUp,
} from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import {
  productSpuData, type ProductSpu, type ProductSku, type ProductCategory,
  type ProductAuditStatus, type ProductShelfStatus,
  categoryLabel, auditLabel, auditBadge, shelfLabel, shelfBadge,
  getSpuPriceRange, getSpuTotalStock, getSpuRelatedModelCount,
  getSpuAppliedEnterprises, getSpuAggregatedAuditStatus, getSpuAggregatedShelfStatus,
} from "@/data/product";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

/* ── Stat overview variant colors (reuse benefit-card pattern) ── */
const VARIANT_VARS: Record<string, string> = {
  primary: "--primary",
  success: "--success",
  warning: "--warning",
  destructive: "--destructive",
  muted: "--muted-foreground",
};

interface StatCard {
  label: string;
  value: number;
  filterKey?: string;
  filterValue?: string;
  variant: string;
}

/* ── Category tabs ── */
const categoryTabs: { key: ProductCategory | "ALL"; label: string }[] = [
  { key: "ALL", label: "全部" },
  { key: "SUPPLY_CHAIN", label: "供应链商品" },
  { key: "ENTERPRISE", label: "企业商品" },
  { key: "PRIVATE", label: "私有商品" },
];

const filterFields: FilterField[] = [
  { key: "keyword", label: "关键词", type: "input", placeholder: "商品名称/编码" },
  { key: "brand", label: "品牌", type: "input", placeholder: "品牌名称" },
  { key: "owner", label: "所属企业", type: "input", placeholder: "企业名称" },
];

/* ── Mini stat card (same pattern as StaffList MiniBenefitCard) ── */
function MiniStatCard({
  stat, isActive, onClick,
}: { stat: StatCard; isActive: boolean; onClick: () => void }) {
  const cssVar = VARIANT_VARS[stat.variant] || "--primary";
  return (
    <button
      onClick={onClick}
      className="relative min-w-[140px] shrink-0 overflow-hidden rounded-xl px-4 py-3 text-left transition-all hover:shadow-sm"
      style={{
        border: `1px solid hsl(var(${cssVar}) / ${isActive ? 0.4 : 0.15})`,
        background: `hsl(var(${cssVar}) / ${isActive ? 0.06 : 0.02})`,
        boxShadow: isActive ? `0 0 0 1px hsl(var(${cssVar}) / 0.2)` : undefined,
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-[2px] opacity-50" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="text-[11px] text-muted-foreground mb-1">{stat.label}</div>
      <div className="text-[18px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>{stat.value}</div>
    </button>
  );
}

/* ── Flat row type for AdminTable (SPU + SKU mixed) ── */
interface ProductRow {
  _type: "spu" | "sku";
  _key: string;
  _spu: ProductSpu;
  _sku?: ProductSku;
  _expanded?: boolean;
  _level: number;
  _hasChildren: boolean;
}

export default function ProductList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "ALL">("ALL");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [statFilter, setStatFilter] = useState<{ key: string; value: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [statsCollapsed, setStatsCollapsed] = useState(false);

  /* ── Applied enterprises dialog (SKU级) ── */
  const [enterpriseDialogSku, setEnterpriseDialogSku] = useState<ProductSku | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  /* ── Filtered data ── */
  const categoryFiltered = useMemo(() => {
    return productSpuData.filter((spu) => {
      if (activeCategory !== "ALL" && spu.category !== activeCategory) return false;
      return true;
    });
  }, [activeCategory]);

  const filtered = useMemo(() => {
    return categoryFiltered.filter((spu) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!spu.productSpuName.toLowerCase().includes(kw) && !spu.productSpuCode.toLowerCase().includes(kw)) return false;
      }
      if (filters.brand && !spu.brandName.includes(filters.brand)) return false;
      if (filters.owner && !spu.ownerEnterpriseName.includes(filters.owner)) return false;

      if (statFilter) {
        const aggAudit = getSpuAggregatedAuditStatus(spu);
        const aggShelf = getSpuAggregatedShelfStatus(spu);
        if (statFilter.key === "audit" && aggAudit !== statFilter.value) return false;
        if (statFilter.key === "shelf" && aggShelf !== statFilter.value) return false;
      }
      return true;
    });
  }, [categoryFiltered, filters, statFilter]);

  /* ── Paginated ── */
  const paginatedSpus = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  /* ── Flatten SPU+SKU into rows for AdminTable ── */
  const tableData = useMemo(() => {
    const rows: ProductRow[] = [];
    for (const spu of paginatedSpus) {
      const isExpanded = expandedKeys.has(spu.id);
      rows.push({
        _type: "spu", _key: spu.id, _spu: spu, _expanded: isExpanded,
        _level: 0, _hasChildren: spu.skus.length > 0,
      });
      if (isExpanded) {
        for (const sku of spu.skus) {
          rows.push({
            _type: "sku", _key: sku.id, _spu: spu, _sku: sku,
            _level: 1, _hasChildren: false,
          });
        }
      }
    }
    return rows;
  }, [paginatedSpus, expandedKeys]);

  /* ── Stats ── */
  const stats = useMemo((): StatCard[] => {
    const total = categoryFiltered.length;
    const approved = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "APPROVED").length;
    const pending = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "PENDING").length;
    const rejected = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "REJECTED").length;
    const onShelf = categoryFiltered.filter((s) => getSpuAggregatedShelfStatus(s) === "ON_SHELF").length;
    const pendingShelf = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "APPROVED" && getSpuAggregatedShelfStatus(s) === "PENDING_SHELF").length;
    const offShelf = categoryFiltered.filter((s) => getSpuAggregatedShelfStatus(s) === "OFF_SHELF").length;
    return [
      { label: "商品总数", value: total, variant: "primary" },
      { label: "审核通过", value: approved, filterKey: "audit", filterValue: "APPROVED", variant: "success" },
      { label: "待审核", value: pending, filterKey: "audit", filterValue: "PENDING", variant: "warning" },
      { label: "审核未通过", value: rejected, filterKey: "audit", filterValue: "REJECTED", variant: "destructive" },
      { label: "已上架", value: onShelf, filterKey: "shelf", filterValue: "ON_SHELF", variant: "success" },
      { label: "待上架", value: pendingShelf, filterKey: "shelf", filterValue: "PENDING_SHELF", variant: "warning" },
      { label: "已下架", value: offShelf, filterKey: "shelf", filterValue: "OFF_SHELF", variant: "muted" },
    ];
  }, [categoryFiltered]);

  const handleStatClick = (stat: StatCard) => {
    if (!stat.filterKey) { setStatFilter(null); }
    else if (statFilter?.key === stat.filterKey && statFilter?.value === stat.filterValue) { setStatFilter(null); }
    else { setStatFilter({ key: stat.filterKey, value: stat.filterValue! }); }
    setPage(1);
  };

  const expandAll = () => setExpandedKeys(new Set(filtered.map((s) => s.id)));
  const collapseAll = () => setExpandedKeys(new Set());

  /* ── Status render ── */
  const renderStatus = (audit: ProductAuditStatus, shelf: ProductShelfStatus) => (
    <div className="flex flex-wrap gap-1">
      <span className={`${auditBadge[audit]} text-[10px]`}>{auditLabel[audit]}</span>
      {audit === "APPROVED" && (
        <span className={`${shelfBadge[shelf]} text-[10px]`}>{shelfLabel[shelf]}</span>
      )}
    </div>
  );

  /* ── AdminTable columns ── */
  const columns: TableColumn<ProductRow>[] = [
    {
      key: "info",
      title: "商品信息",
      minWidth: 240,
      render: (_, row) => {
        if (row._type === "spu") {
          const spu = row._spu;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(spu.id); }}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground transition-all shrink-0"
              >
                {row._expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted/40 shrink-0 border" style={{ borderColor: "hsl(var(--border) / 0.3)" }}>
                <img src={spu.thumbnailUrl} alt={spu.productSpuName} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground truncate hover:text-primary transition-colors cursor-pointer"
                  onClick={() => navigate(`/product/detail/${spu.id}`)}>{spu.productSpuName}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{spu.productSpuCode}</div>
              </div>
            </div>
          );
        }
        // SKU
        const sku = row._sku!;
        return (
          <div className="flex items-center gap-2 pl-8">
            <div className="w-[3px] h-6 rounded-full shrink-0" style={{ background: "hsl(var(--border) / 0.5)" }} />
            <div className="w-7 h-7 rounded-md overflow-hidden bg-muted/30 shrink-0 border" style={{ borderColor: "hsl(var(--border) / 0.2)" }}>
              <img src={sku.thumbnailUrl} alt={sku.productSkuName} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0">
              <div className="text-[12px] text-foreground truncate">{sku.productSkuName}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{sku.productSkuCode}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "brand",
      title: "品牌",
      width: 80,
      render: (_, row) => row._type === "spu"
        ? <span className="text-[12px] text-foreground">{row._spu.brandName}</span>
        : null,
    },
    {
      key: "series",
      title: "系列",
      width: 90,
      render: (_, row) => row._type === "spu"
        ? <span className="text-[11px] text-muted-foreground">{row._spu.seriesName}</span>
        : <div className="flex flex-wrap gap-1">
            {Object.values(row._sku!.paramSnapshot).slice(0, 2).map((v) => (
              <span key={v} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--muted) / 0.6)", color: "hsl(var(--muted-foreground))" }}>{v}</span>
            ))}
          </div>,
    },
    {
      key: "price",
      title: "参考价",
      width: 120,
      render: (_, row) => {
        if (row._type === "spu") {
          const range = getSpuPriceRange(row._spu);
          return (
            <div className="text-[12px]">
              <span className="font-medium text-foreground">{formatPrice(range.min)}</span>
              {range.min !== range.max && <span className="text-muted-foreground text-[11px]"> ~ {formatPrice(range.max)}</span>}
            </div>
          );
        }
        const sku = row._sku!;
        return (
          <div className="text-[12px]">
            <span className="font-medium text-foreground">{formatPrice(sku.price)}</span>
            {sku.originalPrice && <span className="line-through ml-1 text-[10px]" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}>{formatPrice(sku.originalPrice)}</span>}
          </div>
        );
      },
    },
    {
      key: "skuCount",
      title: "SKU",
      width: 50,
      align: "center" as const,
      render: (_, row) => row._type === "spu"
        ? <span className="text-[12px]">{row._spu.skus.length}</span>
        : null,
    },
    {
      key: "stock",
      title: "库存",
      width: 60,
      align: "center" as const,
      render: (_, row) => {
        if (row._type === "spu") {
          const total = getSpuTotalStock(row._spu);
          return <span className={`text-[12px] ${total <= 20 ? "text-destructive font-medium" : ""}`}>{total}</span>;
        }
        const qty = row._sku!.stockQuantity;
        return <span className={`text-[11px] ${qty <= 10 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{qty}</span>;
      },
    },
    {
      key: "model",
      title: "关联模型",
      width: 80,
      align: "center" as const,
      render: (_, row) => {
        if (row._type === "spu") {
          return <span className="inline-flex items-center gap-1 text-[11px] text-primary"><Link2 className="h-3 w-3" />{getSpuRelatedModelCount(row._spu)}</span>;
        }
        return <button className="text-[10px] text-primary hover:underline truncate max-w-[70px]">{row._sku!.modelSpuName}</button>;
      },
    },
    {
      key: "owner",
      title: "所属企业",
      width: 90,
      render: (_, row) => row._type === "spu"
        ? <span className="text-[12px] text-foreground truncate">{row._spu.ownerEnterpriseName}</span>
        : null,
    },
    {
      key: "applied",
      title: "应用企业",
      width: 70,
      align: "center" as const,
      render: (_, row) => {
        if (row._type === "spu") {
          return <span className="text-[12px] text-muted-foreground">{getSpuAppliedEnterprises(row._spu).length}</span>;
        }
        const sku = row._sku!;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); setEnterpriseDialogSku(sku); }}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
          >
            <Building2 className="h-3 w-3" />{(sku.appliedEnterprises || []).length}
          </button>
        );
      },
    },
    {
      key: "status",
      title: "状态",
      width: 100,
      align: "center" as const,
      render: (_, row) => {
        if (row._type === "spu") {
          return renderStatus(getSpuAggregatedAuditStatus(row._spu), getSpuAggregatedShelfStatus(row._spu));
        }
        return renderStatus(row._sku!.auditStatus, row._sku!.shelfStatus);
      },
    },
  ];

  /* ── AdminTable actions: maxVisibleActions=2 → 2 inline + "more" = 3 total ── */
  const actions: ActionItem<ProductRow>[] = [
    {
      label: "查看",
      onClick: (row) => {
        if (row._type === "spu") navigate(`/product/detail/${row._spu.id}`);
      },
    },
    {
      label: "编辑",
      onClick: (row) => {
        if (row._type === "spu") navigate(`/product/create?edit=${row._spu.id}`);
      },
    },
    {
      label: "添加SKU",
      onClick: () => {},
      visible: (row) => row._type === "spu",
    },
    {
      label: "审核",
      onClick: () => {},
    },
    {
      label: "复制",
      onClick: () => {},
    },
    {
      label: "删除",
      danger: true,
      onClick: () => {},
      confirm: {
        title: "确认删除",
        description: "删除后数据将无法恢复，请确认是否继续。",
      },
    },
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 56px)" }}>
      <div className="flex-1">
        <PageHeader
          title="商品管理"
          subtitle={`共 ${productSpuData.length} 个商品SPU · ${productSpuData.reduce((s, p) => s + p.skus.length, 0)} 个SKU`}
          actions={
            <button className="btn-primary" onClick={() => navigate("/product/create")}>
              <Plus className="h-3.5 w-3.5" />创建商品
            </button>
          }
        />

        {/* ── Category Tabs ── */}
        <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.key;
            const count = tab.key === "ALL"
              ? productSpuData.length
              : productSpuData.filter((s) => s.category === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveCategory(tab.key); setStatFilter(null); setPage(1); }}
                className="relative px-4 py-2.5 text-[13px] transition-colors whitespace-nowrap"
                style={{
                  color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {tab.label}
                <span
                  className="ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "hsl(var(--primary) / 0.08)" : "hsl(var(--muted))",
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full" style={{ background: "hsl(var(--primary))" }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Stat overview (same pattern as StaffList benefit cards) ── */}
        <div className="overflow-hidden rounded-xl border border-border/80 bg-card mb-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between px-5 pt-3.5 pb-1">
            <span className="text-[13px] font-medium text-foreground">数据概览</span>
            <button
              className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setStatsCollapsed(!statsCollapsed)}
            >
              {statsCollapsed ? "展开" : "收起"}
              {statsCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          </div>
          {!statsCollapsed && (
            <div className="overflow-x-auto px-5 pb-4 pt-2">
              <div className="flex gap-3">
                {stats.map((stat) => {
                  const isActive = statFilter?.key === stat.filterKey && statFilter?.value === stat.filterValue;
                  return <MiniStatCard key={stat.label} stat={stat} isActive={isActive} onClick={() => handleStatClick(stat)} />;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active stat filter indicator */}
        {statFilter && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="text-[12px] text-muted-foreground">当前筛选：</span>
            <span className="inline-flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full border" style={{ background: "hsl(var(--primary) / 0.05)", borderColor: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}>
              {stats.find((s) => s.filterKey === statFilter.key && s.filterValue === statFilter.value)?.label}
              <button onClick={() => setStatFilter(null)} className="hover:opacity-70"><X className="h-3 w-3" /></button>
            </span>
          </div>
        )}

        <FilterBar
          fields={filterFields}
          values={filters}
          onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
          onSearch={() => setPage(1)}
          onReset={() => { setFilters({}); setStatFilter(null); setPage(1); }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-[12px] text-primary hover:underline">全部展开</button>
            <span className="text-border">|</span>
            <button onClick={collapseAll} className="text-[12px] text-primary hover:underline">全部收起</button>
          </div>
          <span className="text-[12px] text-muted-foreground">筛选结果：{filtered.length} 个SPU</span>
        </div>

        {/* ── AdminTable ── */}
        <AdminTable
          columns={columns}
          data={tableData}
          rowKey={(r) => r._key}
          actions={actions}
          maxVisibleActions={2}
          actionColumnWidth={160}
        />
      </div>

      {/* ── Pagination pinned to bottom ── */}
      <div className="sticky bottom-0 bg-card border rounded-xl mt-4" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination
          current={page}
          total={filtered.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {/* ── Applied Enterprises Dialog (SKU级) ── */}
      <Dialog open={!!enterpriseDialogSku} onOpenChange={(open) => !open && setEnterpriseDialogSku(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">应用企业列表</DialogTitle>
            <DialogDescription className="text-[12px]">
              {enterpriseDialogSku?.productSkuName} — 共 {(enterpriseDialogSku?.appliedEnterprises || []).length} 家企业
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {(enterpriseDialogSku?.appliedEnterprises || []).map((ent) => (
              <div key={ent.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg border" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.08)" }}>
                    <Building2 className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-foreground">{ent.name}</div>
                    <div className="text-[11px] text-muted-foreground">{ent.type}</div>
                  </div>
                </div>
                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" title="移除">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-2 border-t" style={{ borderColor: "hsl(var(--border))" }}>
            <button className="btn-ghost text-primary text-[13px]">
              <Plus className="h-3.5 w-3.5" />添加企业
            </button>
            <button className="btn-secondary text-[13px]" onClick={() => setEnterpriseDialogSku(null)}>关闭</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
