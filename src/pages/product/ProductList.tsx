import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Plus, ChevronRight, ChevronDown, Link2, Package, Eye, Pencil, PlusCircle,
  ClipboardCheck, Copy, Trash2, MoreHorizontal, Building2, X,
} from "lucide-react";
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

/* ── Stat card type ── */
interface StatCard {
  label: string;
  value: number;
  filterKey?: string;
  filterValue?: string;
  color: string;
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

/* ── Action menu item definition ── */
interface ActionDef {
  icon: typeof Eye;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

/* ── Reusable action cell: show up to maxVisible inline, rest in overflow ── */
function ActionButtons({ actions, maxVisible = 3 }: { actions: ActionDef[]; maxVisible?: number }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [open, closeMenu]);

  const shown = actions.slice(0, maxVisible);
  const overflow = actions.slice(maxVisible);

  return (
    <div className="flex items-center gap-1">
      {shown.map((a, i) => (
        <button
          key={a.label + i}
          type="button"
          onClick={(e) => { e.stopPropagation(); a.onClick(); }}
          className={`btn-text ${a.danger ? "text-danger-action" : "text-primary-action"}`}
        >
          {a.label}
        </button>
      ))}
      {overflow.length > 0 && (
        <>
          <button
            ref={triggerRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (open) { closeMenu(); return; }
              if (triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 6, left: rect.right });
              }
              setOpen(true);
            }}
            className="admin-action-trigger"
            data-state={open ? "open" : "closed"}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {open && createPortal(
            <div
              ref={menuRef}
              className="admin-action-menu"
              data-state="open"
              style={{ top: menuPos.top, left: menuPos.left, transform: "translateX(calc(-100% + 2px))" }}
            >
              {overflow.map((a, i) => (
                <button
                  key={a.label + i}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); closeMenu(); a.onClick(); }}
                  className={`admin-action-menu-item ${a.danger ? "admin-action-menu-item-danger" : ""}`}
                >
                  <a.icon className="h-3.5 w-3.5" />{a.label}
                </button>
              ))}
            </div>,
            document.body,
          )}
        </>
      )}
    </div>
  );
}

export default function ProductList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "ALL">("ALL");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [statFilter, setStatFilter] = useState<{ key: string; value: string } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

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

  /* ── Filtered data (use aggregated status from SKUs) ── */
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

  /* ── Paginated data ── */
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  /* ── Stats (aggregate from SKUs) ── */
  const stats = useMemo((): StatCard[] => {
    const allSkus = categoryFiltered.flatMap((s) => s.skus);
    const total = categoryFiltered.length;
    const approved = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "APPROVED").length;
    const pending = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "PENDING").length;
    const rejected = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "REJECTED").length;
    const onShelf = categoryFiltered.filter((s) => getSpuAggregatedShelfStatus(s) === "ON_SHELF").length;
    const pendingShelf = categoryFiltered.filter((s) => getSpuAggregatedAuditStatus(s) === "APPROVED" && getSpuAggregatedShelfStatus(s) === "PENDING_SHELF").length;
    const offShelf = categoryFiltered.filter((s) => getSpuAggregatedShelfStatus(s) === "OFF_SHELF").length;
    return [
      { label: "商品总数", value: total, color: "var(--primary)" },
      { label: "审核通过", value: approved, filterKey: "audit", filterValue: "APPROVED", color: "var(--success)" },
      { label: "待审核", value: pending, filterKey: "audit", filterValue: "PENDING", color: "var(--warning)" },
      { label: "审核未通过", value: rejected, filterKey: "audit", filterValue: "REJECTED", color: "var(--destructive)" },
      { label: "已上架", value: onShelf, filterKey: "shelf", filterValue: "ON_SHELF", color: "var(--success)" },
      { label: "待上架", value: pendingShelf, filterKey: "shelf", filterValue: "PENDING_SHELF", color: "var(--warning)" },
      { label: "已下架", value: offShelf, filterKey: "shelf", filterValue: "OFF_SHELF", color: "var(--muted-foreground)" },
    ];
  }, [categoryFiltered]);

  const expandAll = () => setExpandedKeys(new Set(filtered.map((s) => s.id)));
  const collapseAll = () => setExpandedKeys(new Set());

  const handleStatClick = (stat: StatCard) => {
    if (!stat.filterKey) { setStatFilter(null); }
    else if (statFilter?.key === stat.filterKey && statFilter?.value === stat.filterValue) { setStatFilter(null); }
    else { setStatFilter({ key: stat.filterKey, value: stat.filterValue! }); }
    setPage(1);
  };

  /* ── Unified status render ── */
  const renderStatus = (audit: ProductAuditStatus, shelf: ProductShelfStatus) => (
    <div className="flex flex-wrap gap-1 justify-center">
      <span className={`${auditBadge[audit]} text-[10px]`}>{auditLabel[audit]}</span>
      {audit === "APPROVED" && (
        <span className={`${shelfBadge[shelf]} text-[10px]`}>{shelfLabel[shelf]}</span>
      )}
    </div>
  );

  /* ── SPU actions ── */
  const getSpuActions = (spu: ProductSpu): ActionDef[] => [
    { icon: Eye, label: "查看", onClick: () => navigate(`/product/detail/${spu.id}`) },
    { icon: Pencil, label: "编辑", onClick: () => navigate(`/product/create?edit=${spu.id}`) },
    { icon: PlusCircle, label: "添加SKU", onClick: () => {} },
    { icon: ClipboardCheck, label: "审核", onClick: () => {} },
    { icon: Copy, label: "复制", onClick: () => {} },
    { icon: Trash2, label: "删除", danger: true, onClick: () => {} },
  ];

  /* ── SKU actions ── */
  const getSkuActions = (sku: ProductSku): ActionDef[] => [
    { icon: Eye, label: "查看", onClick: () => {} },
    { icon: Pencil, label: "编辑", onClick: () => {} },
    { icon: ClipboardCheck, label: "审核", onClick: () => {} },
    { icon: Copy, label: "复制", onClick: () => {} },
    { icon: Trash2, label: "删除", danger: true, onClick: () => {} },
  ];

  const GRID = "44px minmax(200px,2fr) 80px 90px 120px 55px 65px 60px 80px 75px 80px 160px";
  const SKU_GRID = "44px minmax(200px,2fr) 80px 90px 120px 55px 65px 60px 80px 75px 80px 140px";

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

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {stats.map((stat) => {
            const isActive = statFilter?.key === stat.filterKey && statFilter?.value === stat.filterValue;
            return (
              <button
                key={stat.label}
                onClick={() => handleStatClick(stat)}
                className="bg-card rounded-lg border px-3 py-2.5 text-left transition-all hover:shadow-sm"
                style={{
                  borderColor: isActive ? `hsl(${stat.color})` : "hsl(var(--border))",
                  boxShadow: isActive ? `0 0 0 1px hsl(${stat.color} / 0.2)` : "var(--shadow-xs)",
                }}
              >
                <div className="text-[11px] text-muted-foreground mb-1">{stat.label}</div>
                <div className="text-[18px] font-semibold" style={{ color: `hsl(${stat.color})` }}>
                  {stat.value}
                </div>
              </button>
            );
          })}
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

        {/* ── Table ── */}
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="overflow-x-auto admin-table-scroll">
            {/* Header */}
            <div
              className="grid text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-4 py-2.5 border-b"
              style={{ background: "hsl(var(--table-header))", gridTemplateColumns: GRID }}
            >
              <div />
              <div>商品信息</div>
              <div>品牌</div>
              <div>系列</div>
              <div>参考价</div>
              <div className="text-center">SKU</div>
              <div className="text-center">库存</div>
              <div className="text-center">模型</div>
              <div>所属企业</div>
              <div className="text-center">应用企业</div>
              <div className="text-center">状态</div>
              <div className="text-center">操作</div>
            </div>

            {/* SPU rows */}
            {paginatedData.map((spu) => {
              const isExpanded = expandedKeys.has(spu.id);
              const priceRange = getSpuPriceRange(spu);
              const totalStock = getSpuTotalStock(spu);
              const modelCount = getSpuRelatedModelCount(spu);
              const appliedEnts = getSpuAppliedEnterprises(spu);
              const aggAudit = getSpuAggregatedAuditStatus(spu);
              const aggShelf = getSpuAggregatedShelfStatus(spu);

              return (
                <div key={spu.id}>
                  {/* SPU Row */}
                  <div
                    className="grid items-center px-4 py-3 border-b transition-colors cursor-pointer group"
                    style={{
                      gridTemplateColumns: GRID,
                      borderColor: "hsl(var(--border) / 0.4)",
                      background: isExpanded ? "hsl(var(--table-row-hover))" : undefined,
                    }}
                    onClick={() => navigate(`/product/detail/${spu.id}`)}
                  >
                    {/* Expand */}
                    <div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(spu.id); }}
                        className="p-1 rounded hover:bg-muted text-muted-foreground transition-all"
                      >
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Product info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/40 shrink-0 border" style={{ borderColor: "hsl(var(--border) / 0.3)" }}>
                        <img src={spu.thumbnailUrl} alt={spu.productSpuName} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">{spu.productSpuName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{spu.productSpuCode}</div>
                      </div>
                    </div>

                    <div className="text-[12px] text-foreground truncate">{spu.brandName}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{spu.seriesName}</div>

                    {/* Price range */}
                    <div className="text-[12px]">
                      <span className="font-medium text-foreground">{formatPrice(priceRange.min)}</span>
                      {priceRange.min !== priceRange.max && (
                        <span className="text-muted-foreground text-[11px]"> ~ {formatPrice(priceRange.max)}</span>
                      )}
                    </div>

                    <div className="text-center text-[12px] text-foreground">{spu.skus.length}</div>
                    <div className={`text-center text-[12px] ${totalStock <= 20 ? "text-destructive font-medium" : "text-foreground"}`}>{totalStock}</div>

                    {/* Related models (aggregated) */}
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                        <Link2 className="h-3 w-3" />{modelCount}
                      </span>
                    </div>

                    <div className="text-[12px] text-foreground truncate">{spu.ownerEnterpriseName}</div>

                    {/* Applied enterprises (aggregated from SKUs) */}
                    <div className="text-center text-[12px] text-muted-foreground">{appliedEnts.length}</div>

                    {/* Status (aggregated) */}
                    <div className="text-center">{renderStatus(aggAudit, aggShelf)}</div>

                    {/* Actions - 3 visible + overflow */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <ActionButtons actions={getSpuActions(spu)} maxVisible={3} />
                    </div>
                  </div>

                  {/* SKU rows */}
                  {isExpanded && spu.skus.map((sku) => (
                    <div
                      key={sku.id}
                      className="grid items-center px-4 py-2.5 border-b transition-colors hover:bg-muted/30"
                      style={{
                        gridTemplateColumns: SKU_GRID,
                        borderColor: "hsl(var(--border) / 0.2)",
                        background: "hsl(var(--muted) / 0.12)",
                      }}
                    >
                      <div />

                      {/* SKU info */}
                      <div className="flex items-center gap-3 pl-4 min-w-0">
                        <div className="w-[3px] h-7 rounded-full shrink-0" style={{ background: "hsl(var(--border) / 0.6)" }} />
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted/30 shrink-0 border" style={{ borderColor: "hsl(var(--border) / 0.2)" }}>
                          <img src={sku.thumbnailUrl} alt={sku.productSkuName} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] text-foreground truncate">{sku.productSkuName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{sku.productSkuCode}</div>
                        </div>
                      </div>

                      <div />

                      {/* Params */}
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(sku.paramSnapshot).slice(0, 2).map(([, v]) => (
                          <span key={v} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "hsl(var(--muted) / 0.6)", color: "hsl(var(--muted-foreground))" }}>{v}</span>
                        ))}
                      </div>

                      {/* Price */}
                      <div className="text-[12px]">
                        <span className="font-medium text-foreground">{formatPrice(sku.price)}</span>
                        {sku.originalPrice && (
                          <span className="line-through ml-1 text-[10px]" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}>{formatPrice(sku.originalPrice)}</span>
                        )}
                      </div>

                      <div />

                      {/* Stock */}
                      <div className={`text-center text-[11px] ${sku.stockQuantity <= 10 ? "text-destructive font-medium" : "text-muted-foreground"}`}>{sku.stockQuantity}</div>

                      {/* Model link (SKU级, clickable) */}
                      <div className="text-center">
                        <button className="text-[10px] text-primary hover:underline truncate" onClick={(e) => { e.stopPropagation(); }}>
                          {sku.modelSpuName}
                        </button>
                      </div>

                      <div />

                      {/* Applied enterprises (SKU级, clickable) */}
                      <div className="text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEnterpriseDialogSku(sku)}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          <Building2 className="h-3 w-3" />{sku.appliedEnterprises.length}
                        </button>
                      </div>

                      {/* Status (SKU级) */}
                      <div className="text-center">{renderStatus(sku.auditStatus, sku.shelfStatus)}</div>

                      {/* SKU Actions - 3 visible + overflow */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <ActionButtons actions={getSkuActions(sku)} maxVisible={3} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground) / 0.3)" }} />
                <p className="text-[13px]">暂无匹配的商品数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pagination pinned to bottom ── */}
      <div className="sticky bottom-0 bg-background border-t mt-4" style={{ borderColor: "hsl(var(--border))" }}>
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
              {enterpriseDialogSku?.productSkuName} — 共 {enterpriseDialogSku?.appliedEnterprises.length} 家企业
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {enterpriseDialogSku?.appliedEnterprises.map((ent) => (
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
