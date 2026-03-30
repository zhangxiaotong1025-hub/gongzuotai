import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ProductList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "ALL">("ALL");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [statFilter, setStatFilter] = useState<{ key: string; value: string } | null>(null);
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  /* ── Action menu ── */
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  /* ── Applied enterprises dialog ── */
  const [enterpriseDialogSpu, setEnterpriseDialogSpu] = useState<ProductSpu | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

      // Stat filter
      if (statFilter) {
        if (statFilter.key === "audit") {
          if (spu.auditStatus !== statFilter.value) return false;
        } else if (statFilter.key === "shelf") {
          if (spu.shelfStatus !== statFilter.value) return false;
        }
      }
      return true;
    });
  }, [categoryFiltered, filters, statFilter]);

  /* ── Stats ── */
  const stats = useMemo((): StatCard[] => {
    const total = categoryFiltered.length;
    const approved = categoryFiltered.filter((s) => s.auditStatus === "APPROVED").length;
    const pending = categoryFiltered.filter((s) => s.auditStatus === "PENDING").length;
    const rejected = categoryFiltered.filter((s) => s.auditStatus === "REJECTED").length;
    const onShelf = categoryFiltered.filter((s) => s.shelfStatus === "ON_SHELF").length;
    const pendingShelf = categoryFiltered.filter((s) => s.auditStatus === "APPROVED" && s.shelfStatus === "PENDING_SHELF").length;
    const offShelf = categoryFiltered.filter((s) => s.shelfStatus === "OFF_SHELF").length;
    return [
      { label: "商品总数", value: total, color: "var(--primary)", },
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
    if (!stat.filterKey) {
      setStatFilter(null);
    } else if (statFilter?.key === stat.filterKey && statFilter?.value === stat.filterValue) {
      setStatFilter(null);
    } else {
      setStatFilter({ key: stat.filterKey, value: stat.filterValue! });
    }
    setPage(1);
  };

  const openActionMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 152 });
    setOpenMenuId(openMenuId === id ? null : id);
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

  return (
    <div>
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

      {/* ── Active stat filter indicator ── */}
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
        <span className="text-[12px] text-muted-foreground">
          筛选结果：{filtered.length} 个SPU
        </span>
      </div>

      {/* ── Table ── */}
      <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Header */}
        <div
          className="grid text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-4 py-2.5 border-b"
          style={{
            background: "hsl(var(--table-header))",
            gridTemplateColumns: "44px minmax(220px,2fr) 90px 100px 130px 70px 80px 70px 100px 100px 80px 70px",
          }}
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
        {filtered.map((spu) => {
          const isExpanded = expandedKeys.has(spu.id);
          const priceRange = getSpuPriceRange(spu);
          const totalStock = getSpuTotalStock(spu);
          const modelCount = getSpuRelatedModelCount(spu);

          return (
            <div key={spu.id}>
              {/* SPU Row */}
              <div
                className="grid items-center px-4 py-3 border-b transition-colors cursor-pointer group"
                style={{
                  gridTemplateColumns: "44px minmax(220px,2fr) 90px 100px 130px 70px 80px 70px 100px 100px 80px 70px",
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

                {/* Brand */}
                <div className="text-[12px] text-foreground truncate">{spu.brandName}</div>

                {/* Series */}
                <div className="text-[11px] text-muted-foreground truncate">{spu.seriesName}</div>

                {/* Price range */}
                <div className="text-[12px]">
                  <span className="font-medium text-foreground">{formatPrice(priceRange.min)}</span>
                  {priceRange.min !== priceRange.max && (
                    <span className="text-muted-foreground text-[11px]"> ~ {formatPrice(priceRange.max)}</span>
                  )}
                </div>

                {/* SKU count */}
                <div className="text-center text-[12px] text-foreground">{spu.skus.length}</div>

                {/* Total stock */}
                <div className={`text-center text-[12px] ${totalStock <= 20 ? "text-destructive font-medium" : "text-foreground"}`}>{totalStock}</div>

                {/* Related models */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                    <Link2 className="h-3 w-3" />{modelCount}
                  </span>
                </div>

                {/* Owner enterprise */}
                <div className="text-[12px] text-foreground truncate">{spu.ownerEnterpriseName}</div>

                {/* Applied enterprises */}
                <div className="text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setEnterpriseDialogSpu(spu)}
                    className="inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
                  >
                    <Building2 className="h-3 w-3" />
                    {spu.appliedEnterprises.length}
                  </button>
                </div>

                {/* Status (unified) */}
                <div className="text-center">
                  {renderStatus(spu.auditStatus, spu.shelfStatus)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => openActionMenu(e, spu.id)}
                    className="admin-action-trigger"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* SKU rows */}
              {isExpanded && spu.skus.map((sku) => (
                <div
                  key={sku.id}
                  className="grid items-center px-4 py-2.5 border-b transition-colors hover:bg-muted/30"
                  style={{
                    gridTemplateColumns: "44px minmax(220px,2fr) 90px 100px 130px 70px 80px 70px 100px 100px 80px 70px",
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

                  {/* Model link */}
                  <div className="text-center text-[10px] text-muted-foreground truncate">{sku.modelSpuName}</div>

                  <div />
                  <div />

                  {/* Status */}
                  <div className="text-center">
                    {renderStatus(sku.auditStatus, sku.shelfStatus)}
                  </div>

                  {/* SKU actions */}
                  <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openActionMenu(e, sku.id)}
                      className="admin-action-trigger"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
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

      <Pagination current={page} total={filtered.length} pageSize={10} onPageChange={setPage} onPageSizeChange={() => {}} />

      {/* ── Action Menu (Portal) ── */}
      {openMenuId && (
        <div
          ref={menuRef}
          className="admin-action-menu"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          {/* Determine if SPU or SKU */}
          {openMenuId.startsWith("pspu") ? (
            <>
              <button className="admin-action-menu-item" onClick={() => { navigate(`/product/detail/${openMenuId}`); setOpenMenuId(null); }}>
                <Eye className="h-3.5 w-3.5" />查看
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <Pencil className="h-3.5 w-3.5" />编辑
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <PlusCircle className="h-3.5 w-3.5" />添加 SKU
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <ClipboardCheck className="h-3.5 w-3.5" />审核
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <Copy className="h-3.5 w-3.5" />复制
              </button>
              <div className="my-1 border-t" style={{ borderColor: "hsl(var(--border))" }} />
              <button className="admin-action-menu-item admin-action-menu-item-danger" onClick={() => setOpenMenuId(null)}>
                <Trash2 className="h-3.5 w-3.5" />删除
              </button>
            </>
          ) : (
            <>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <Eye className="h-3.5 w-3.5" />查看
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <Pencil className="h-3.5 w-3.5" />编辑
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <ClipboardCheck className="h-3.5 w-3.5" />审核
              </button>
              <button className="admin-action-menu-item" onClick={() => setOpenMenuId(null)}>
                <Copy className="h-3.5 w-3.5" />复制
              </button>
              <div className="my-1 border-t" style={{ borderColor: "hsl(var(--border))" }} />
              <button className="admin-action-menu-item admin-action-menu-item-danger" onClick={() => setOpenMenuId(null)}>
                <Trash2 className="h-3.5 w-3.5" />删除
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Applied Enterprises Dialog ── */}
      <Dialog open={!!enterpriseDialogSpu} onOpenChange={(open) => !open && setEnterpriseDialogSpu(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">应用企业列表</DialogTitle>
            <DialogDescription className="text-[12px]">
              {enterpriseDialogSpu?.productSpuName} — 共 {enterpriseDialogSpu?.appliedEnterprises.length} 家企业
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {enterpriseDialogSpu?.appliedEnterprises.map((ent) => (
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
            <button className="btn-secondary text-[13px]" onClick={() => setEnterpriseDialogSpu(null)}>关闭</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
