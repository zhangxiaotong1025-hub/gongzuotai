import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, ChevronDown, Link2, Package, Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import {
  productSpuData, type ProductSpu, type ProductSku,
  type ProductAuditStatus, type ProductShelfStatus,
  getSpuPriceRange, getSpuTotalStock, getSpuRelatedModelCount, getSpuSpecSummary,
} from "@/data/product";

/* ── Label maps ── */
const auditLabel: Record<ProductAuditStatus, string> = { PENDING: "待审核", APPROVED: "审核通过", REJECTED: "审核未通过" };
const auditBadge: Record<ProductAuditStatus, string> = { PENDING: "badge-warning", APPROVED: "badge-active", REJECTED: "badge-danger" };
const shelfLabel: Record<ProductShelfStatus, string> = { PENDING_SHELF: "待上架", ON_SHELF: "已上架", OFF_SHELF: "已下架" };
const shelfBadge: Record<ProductShelfStatus, string> = { PENDING_SHELF: "badge-muted", ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };

const filterFields: FilterField[] = [
  { key: "keyword", label: "关键词", type: "input", placeholder: "商品名称/编码" },
  { key: "auditStatus", label: "审核状态", type: "select", options: [{ label: "待审核", value: "PENDING" }, { label: "审核通过", value: "APPROVED" }, { label: "审核未通过", value: "REJECTED" }] },
  { key: "shelfStatus", label: "业务状态", type: "select", options: [{ label: "待上架", value: "PENDING_SHELF" }, { label: "已上架", value: "ON_SHELF" }, { label: "已下架", value: "OFF_SHELF" }] },
  { key: "brand", label: "品牌", type: "input", placeholder: "品牌名称" },
];

export default function ProductList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const expandAll = () => setExpandedKeys(new Set(productSpuData.map((s) => s.id)));
  const collapseAll = () => setExpandedKeys(new Set());

  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  /* ── Filtered data ── */
  const filtered = useMemo(() => {
    return productSpuData.filter((spu) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!spu.productSpuName.toLowerCase().includes(kw) && !spu.productSpuCode.toLowerCase().includes(kw)) return false;
      }
      if (filters.auditStatus && spu.auditStatus !== filters.auditStatus) return false;
      if (filters.shelfStatus && spu.shelfStatus !== filters.shelfStatus) return false;
      if (filters.brand && !spu.brandName.includes(filters.brand)) return false;
      return true;
    });
  }, [filters]);

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

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onSearch={() => setPage(1)}
        onReset={() => { setFilters({}); setPage(1); }}
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

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Header */}
        <div className="grid grid-cols-[52px_minmax(280px,2fr)_100px_120px_140px_80px_90px_90px_90px_100px] text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-4 py-2.5 border-b" style={{ background: "hsl(var(--table-header))" }}>
          <div />
          <div>商品信息</div>
          <div>品牌</div>
          <div>系列</div>
          <div>参考价</div>
          <div className="text-center">SKU</div>
          <div className="text-center">库存</div>
          <div className="text-center">关联模型</div>
          <div className="text-center">审核</div>
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
                className="grid grid-cols-[52px_minmax(280px,2fr)_100px_120px_140px_80px_90px_90px_90px_100px] items-center px-4 py-3 border-b border-border/40 transition-colors cursor-pointer group"
                style={{ background: isExpanded ? "hsl(var(--table-row-hover))" : undefined }}
                onClick={() => navigate(`/product/detail/${spu.id}`)}
              >
                {/* Expand toggle */}
                <div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(spu.id); }}
                    className="p-1 rounded hover:bg-muted text-muted-foreground transition-all"
                  >
                    {isExpanded
                      ? <ChevronDown className="h-3.5 w-3.5" />
                      : <ChevronRight className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>

                {/* Product info with thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted/40 shrink-0 border border-border/30">
                    <img src={spu.thumbnailUrl} alt={spu.productSpuName} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {spu.productSpuName}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">{spu.productSpuCode}</div>
                  </div>
                </div>

                {/* Brand */}
                <div className="text-[13px] text-foreground">{spu.brandName}</div>

                {/* Series */}
                <div className="text-[12px] text-muted-foreground truncate">{spu.seriesName}</div>

                {/* Price range */}
                <div className="text-[13px]">
                  <span className="font-medium text-foreground">{formatPrice(priceRange.min)}</span>
                  {priceRange.min !== priceRange.max && (
                    <span className="text-muted-foreground"> ~ {formatPrice(priceRange.max)}</span>
                  )}
                </div>

                {/* SKU count */}
                <div className="text-center text-[13px] text-foreground">{spu.skus.length}</div>

                {/* Total stock */}
                <div className={`text-center text-[13px] ${totalStock <= 20 ? "text-destructive font-medium" : "text-foreground"}`}>
                  {totalStock}
                </div>

                {/* Related models */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-[12px] text-primary">
                    <Link2 className="h-3 w-3" />{modelCount}
                  </span>
                </div>

                {/* Audit + Shelf status */}
                <div className="text-center space-y-1">
                  <div><span className={`${auditBadge[spu.auditStatus]} text-[10px]`}>{auditLabel[spu.auditStatus]}</span></div>
                  {spu.auditStatus === "APPROVED" && (
                    <div><span className={`${shelfBadge[spu.shelfStatus]} text-[10px]`}>{shelfLabel[spu.shelfStatus]}</span></div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/product/detail/${spu.id}`)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    title="查看详情"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* SKU rows (expanded) */}
              {isExpanded && spu.skus.map((sku) => (
                <div
                  key={sku.id}
                  className="grid grid-cols-[52px_minmax(280px,2fr)_100px_120px_140px_80px_90px_90px_90px_100px] items-center px-4 py-2.5 border-b border-border/20 transition-colors hover:bg-muted/30"
                  style={{ background: "hsl(var(--muted) / 0.15)" }}
                >
                  {/* Indent */}
                  <div />

                  {/* SKU info with thumbnail */}
                  <div className="flex items-center gap-3 pl-4 min-w-0">
                    <div className="w-[3px] h-8 rounded-full bg-border/60 shrink-0" />
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/20">
                      <img src={sku.thumbnailUrl} alt={sku.productSkuName} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] text-foreground truncate">{sku.productSkuName}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground font-mono">{sku.productSkuCode}</span>
                        <span className="text-border">·</span>
                        <span className="text-[10px] text-muted-foreground/60">{sku.modelSpuName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand — empty for SKU */}
                  <div />

                  {/* Params summary */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(sku.paramSnapshot).slice(0, 2).map(([, v]) => (
                      <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{v}</span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="text-[12px]">
                    <span className="font-medium text-foreground">{formatPrice(sku.price)}</span>
                    {sku.originalPrice && (
                      <span className="text-muted-foreground/40 line-through ml-1 text-[10px]">{formatPrice(sku.originalPrice)}</span>
                    )}
                  </div>

                  {/* SKU count — empty */}
                  <div />

                  {/* Stock */}
                  <div className={`text-center text-[12px] ${sku.stockQuantity <= 10 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {sku.stockQuantity}
                  </div>

                  {/* Model link */}
                  <div className="text-center text-[11px] text-muted-foreground">{sku.modelSkuName.split("·")[0]}</div>

                  {/* Audit + shelf */}
                  <div className="text-center space-y-1">
                    <div><span className={`${auditBadge[sku.auditStatus]} text-[10px]`}>{auditLabel[sku.auditStatus]}</span></div>
                    {sku.auditStatus === "APPROVED" && (
                      <div><span className={`${shelfBadge[sku.shelfStatus]} text-[10px]`}>{shelfLabel[sku.shelfStatus]}</span></div>
                    )}
                  </div>

                  {/* Actions */}
                  <div />
                </div>
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-[13px]">暂无匹配的商品数据</p>
          </div>
        )}
      </div>

      <Pagination current={page} total={filtered.length} pageSize={10} onPageChange={setPage} onPageSizeChange={() => {}} />
    </div>
  );
}
