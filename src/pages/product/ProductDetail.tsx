import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag, Tag, Link2, FileText, Box, Plus, Package,
  MapPin, Shield, Clock, Truck, Award, BarChart3, Eye,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import {
  productSpuData, type ProductSpu, type ProductSku,
  type ProductAuditStatus, type ProductShelfStatus,
  getSpuPriceRange, getSpuTotalStock, getSpuRelatedModelCount,
} from "@/data/product";

const auditLabel: Record<ProductAuditStatus, string> = { PENDING: "待审核", APPROVED: "审核通过", REJECTED: "审核未通过" };
const auditBadge: Record<ProductAuditStatus, string> = { PENDING: "badge-warning", APPROVED: "badge-active", REJECTED: "badge-danger" };
const shelfLabel: Record<ProductShelfStatus, string> = { PENDING_SHELF: "待上架", ON_SHELF: "已上架", OFF_SHELF: "已下架" };
const shelfBadge: Record<ProductShelfStatus, string> = { PENDING_SHELF: "badge-muted", ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };

const SCROLL_OFFSET = 72;

const floors = [
  { id: "overview", label: "商品概览", icon: ShoppingBag },
  { id: "skus", label: "商品SKU", icon: Tag },
  { id: "models", label: "关联模型", icon: Link2 },
  { id: "commercial", label: "商业属性", icon: FileText },
];

function SectionTitle({ icon: Icon, title, badge, action }: { icon: any; title: string; badge?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pb-3 mb-5 border-b border-border/30">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-[14px] font-semibold text-foreground">{title}</h3>
        {badge && <span className="text-[11px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60">{badge}</span>}
      </div>
      {action}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-muted-foreground text-[12px] shrink-0 w-20 text-right">{label}</span>
      <span className={`text-foreground text-[13px] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border/40 p-4 flex items-start gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0`} style={{ background: `hsl(var(--${color}) / 0.08)` }}>
        <Icon className="h-4 w-4" style={{ color: `hsl(var(--${color}))` }} />
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
        <div className="text-lg font-semibold text-foreground leading-tight">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState("overview");
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const spu = productSpuData.find((s) => s.id === id);

  const scrollToFloor = useCallback((floorId: string) => {
    const el = sectionRefs.current[floorId];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveFloor(entry.target.id);
        }
      },
      { rootMargin: `-${SCROLL_OFFSET}px 0px -60% 0px`, threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleSkuExpand = useCallback((skuId: string) => {
    setExpandedSkus((prev) => {
      const next = new Set(prev);
      next.has(skuId) ? next.delete(skuId) : next.add(skuId);
      return next;
    });
  }, []);

  if (!spu) return <div className="p-8 text-center text-muted-foreground">商品不存在</div>;

  const allIds = productSpuData.map((s) => s.id);
  const curIdx = allIds.indexOf(id!);
  const priceRange = getSpuPriceRange(spu);
  const totalStock = getSpuTotalStock(spu);
  const modelCount = getSpuRelatedModelCount(spu);
  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  // Group SKUs by model SPU
  const modelGroups = new Map<string, { modelSpuName: string; modelSpuId: string; skus: ProductSku[] }>();
  for (const sku of spu.skus) {
    if (!modelGroups.has(sku.modelSpuId)) {
      modelGroups.set(sku.modelSpuId, { modelSpuName: sku.modelSpuName, modelSpuId: sku.modelSpuId, skus: [] });
    }
    modelGroups.get(sku.modelSpuId)!.skus.push(sku);
  }

  return (
    <div>
      <DetailActionBar
        backLabel="商品管理"
        backPath="/product"
        currentName={spu.productSpuName}
        prevPath={curIdx > 0 ? `/product/detail/${allIds[curIdx - 1]}` : null}
        nextPath={curIdx < allIds.length - 1 ? `/product/detail/${allIds[curIdx + 1]}` : null}
        statusToggle={
          spu.auditStatus === "APPROVED"
            ? {
                currentActive: spu.shelfStatus === "ON_SHELF",
                activeLabel: "已上架",
                inactiveLabel: "已下架",
                onToggle: () => {},
              }
            : undefined
        }
        onEdit={() => navigate(`/product/create?edit=${id}`)}
      />

      {/* Floor navigation */}
      <div className="sticky top-14 z-20 bg-background/80 backdrop-blur-md border-b border-border/40 -mx-2 px-2 mt-4">
        <div className="flex gap-0">
          {floors.map((f) => (
            <button
              key={f.id}
              onClick={() => scrollToFloor(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] border-b-2 transition-all ${
                activeFloor === f.id
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <f.icon className="h-3.5 w-3.5" />
              {f.label}
              {f.id === "skus" && <span className="text-[10px] text-muted-foreground ml-0.5">({spu.skus.length})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 mt-6">
        {/* ═══ Floor 1: Overview ═══ */}
        <section id="overview" ref={(el: HTMLElement | null) => { sectionRefs.current["overview"] = el; }}>
          {/* Hero card */}
          <div className="bg-card rounded-xl border border-border/40 overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex gap-6 p-6">
              {/* Thumbnail */}
              <div className="w-36 h-36 rounded-xl overflow-hidden bg-muted/30 shrink-0 border border-border/20">
                <img src={spu.thumbnailUrl} alt={spu.productSpuName} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">{spu.productSpuName}</h2>
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span className="font-mono">{spu.productSpuCode}</span>
                      <span className="text-border">·</span>
                      <span>{spu.ownerEnterpriseName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={auditBadge[spu.auditStatus]}>{auditLabel[spu.auditStatus]}</span>
                    {spu.auditStatus === "APPROVED" && (
                      <span className={shelfBadge[spu.shelfStatus]}>{shelfLabel[spu.shelfStatus]}</span>
                    )}
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground mb-3 line-clamp-2">{spu.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {spu.sellingPoints.map((sp, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/6 text-primary border border-primary/10">{sp}</span>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-[12px]">
                  <div><span className="text-muted-foreground">品牌：</span><span className="text-foreground font-medium">{spu.brandName}</span></div>
                  <div><span className="text-muted-foreground">系列：</span><span className="text-foreground">{spu.seriesName}</span></div>
                  <div><span className="text-muted-foreground">分类：</span><span className="text-foreground">{spu.backendCategoryName} / {spu.frontendCategoryName}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={Tag} color="primary"
              label="价格区间"
              value={priceRange.min === priceRange.max ? formatPrice(priceRange.min) : `${formatPrice(priceRange.min)} ~ ${formatPrice(priceRange.max)}`}
              sub={`${spu.skus.length} 个SKU`}
            />
            <StatCard icon={Package} color="success" label="总库存" value={totalStock} sub="所有SKU库存之和" />
            <StatCard icon={Link2} color="info" label="关联模型" value={`${modelCount} 个模型SPU`} sub="跨SKU去重" />
            <StatCard icon={BarChart3} color="warning" label="规格维度" value={getSpuSpecSummary(spu)} sub="主要参数" />
          </div>
        </section>

        {/* ═══ Floor 2: SKUs ═══ */}
        <section id="skus" ref={(el: HTMLElement | null) => { sectionRefs.current["skus"] = el; }}>
          <div className="bg-card rounded-xl border border-border/40 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <SectionTitle icon={Tag} title="商品SKU" badge={`${spu.skus.length} 个`} />
              <button className="btn-primary text-[12px] h-8 px-3">
                <Plus className="h-3 w-3" />新增SKU
              </button>
            </div>

            <div className="divide-y divide-border/20">
              {spu.skus.map((sku) => {
                const isExpanded = expandedSkus.has(sku.id);
                return (
                  <div key={sku.id} className="group">
                    {/* SKU summary row */}
                    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleSkuExpand(sku.id)}>
                      <button className="p-0.5 rounded text-muted-foreground">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>

                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/20">
                        <img src={sku.thumbnailUrl} alt={sku.productSkuName} className="w-full h-full object-cover" loading="lazy" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-medium text-foreground truncate">{sku.productSkuName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{sku.productSkuCode}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(sku.paramSnapshot).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{k}: {v}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-[12px]">
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{formatPrice(sku.price)}</div>
                          {sku.originalPrice && <div className="text-muted-foreground/40 line-through text-[10px]">{formatPrice(sku.originalPrice)}</div>}
                        </div>
                        <div className="text-right w-12">
                          <div className={sku.stockQuantity <= 10 ? "text-destructive font-medium" : "text-foreground"}>{sku.stockQuantity}</div>
                          <div className="text-[10px] text-muted-foreground">库存</div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className={`${auditBadge[sku.auditStatus]} text-[10px]`}>{auditLabel[sku.auditStatus]}</span>
                          {sku.auditStatus === "APPROVED" && (
                            <span className={`${shelfBadge[sku.shelfStatus]} text-[10px]`}>{shelfLabel[sku.shelfStatus]}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 ml-[72px] border-l-2 border-primary/10">
                        <div className="grid grid-cols-3 gap-4 text-[12px]">
                          <div className="space-y-2 bg-muted/10 rounded-lg p-3">
                            <div className="text-[11px] font-medium text-muted-foreground mb-2">关联模型</div>
                            <div className="flex items-center gap-2">
                              <Box className="h-3.5 w-3.5 text-muted-foreground/60" />
                              <span className="text-foreground">{sku.modelSpuName}</span>
                            </div>
                            <div className="text-muted-foreground/60 text-[11px]">{sku.modelSkuName}</div>
                          </div>
                          <div className="space-y-2 bg-muted/10 rounded-lg p-3">
                            <div className="text-[11px] font-medium text-muted-foreground mb-2">价格信息</div>
                            <div className="flex justify-between"><span className="text-muted-foreground">售价</span><span className="font-medium">{formatPrice(sku.price)}</span></div>
                            {sku.originalPrice && <div className="flex justify-between"><span className="text-muted-foreground">原价</span><span className="line-through">{formatPrice(sku.originalPrice)}</span></div>}
                            {sku.costPrice && <div className="flex justify-between"><span className="text-muted-foreground">成本</span><span>{formatPrice(sku.costPrice)}</span></div>}
                          </div>
                          <div className="space-y-2 bg-muted/10 rounded-lg p-3">
                            <div className="text-[11px] font-medium text-muted-foreground mb-2">其他信息</div>
                            {sku.barcode && <div className="flex justify-between"><span className="text-muted-foreground">条码</span><span className="font-mono text-[11px]">{sku.barcode}</span></div>}
                            {sku.weight && <div className="flex justify-between"><span className="text-muted-foreground">重量</span><span>{sku.weight}kg</span></div>}
                            <div className="flex justify-between"><span className="text-muted-foreground">更新</span><span>{sku.updatedAt}</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ Floor 3: Models ═══ */}
        <section id="models" ref={(el: HTMLElement | null) => { sectionRefs.current["models"] = el; }}>
          <div className="bg-card rounded-xl border border-border/40 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <SectionTitle icon={Link2} title="关联模型" badge={`${modelCount} 个模型SPU`} />
            <div className="space-y-4">
              {Array.from(modelGroups.values()).map((group) => (
                <div key={group.modelSpuId} className="rounded-lg border border-border/30 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-muted/10 border-b border-border/20">
                    <Box className="h-4 w-4 text-primary/60" />
                    <span className="text-[13px] font-medium text-foreground">{group.modelSpuName}</span>
                    <span className="text-[11px] text-muted-foreground">· {group.skus.length} 个SKU引用</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-4">
                    {group.skus.map((sku) => (
                      <div key={sku.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/5 border border-border/10">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/30 shrink-0">
                          <img src={sku.thumbnailUrl} alt={sku.modelSkuName} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-medium text-foreground truncate">{sku.modelSkuName}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.values(sku.paramSnapshot).slice(0, 2).map((v) => (
                              <span key={v} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{v}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Floor 4: Commercial ═══ */}
        <section id="commercial" ref={(el: HTMLElement | null) => { sectionRefs.current["commercial"] = el; }}>
          <div className="bg-card rounded-xl border border-border/40 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <SectionTitle icon={FileText} title="商业属性" />
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 py-2.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-[12px] text-muted-foreground w-16">产地</span>
                  <span className="text-[13px] text-foreground">{spu.commercialAttrs.origin}</span>
                </div>
                <div className="flex items-center gap-2 py-2.5">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-[12px] text-muted-foreground w-16">保修期</span>
                  <span className="text-[13px] text-foreground">{spu.commercialAttrs.warranty}</span>
                </div>
                <div className="flex items-center gap-2 py-2.5">
                  <Truck className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <span className="text-[12px] text-muted-foreground w-16">交货周期</span>
                  <span className="text-[13px] text-foreground">{spu.commercialAttrs.deliveryCycle}</span>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2 py-2.5">
                  <Award className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5" />
                  <span className="text-[12px] text-muted-foreground w-16">认证</span>
                  <div className="flex flex-wrap gap-1.5">
                    {spu.commercialAttrs.certifications.map((c, i) => (
                      <span key={i} className="badge-active text-[10px]">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6 pt-4 border-t border-border/20">
              <div className="flex items-center gap-6 text-[12px]">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" /> 创建：{spu.createdAt}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" /> 更新：{spu.updatedAt}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function getSpuSpecSummary(spu: ProductSpu): string {
  if (spu.skus.length === 0) return "—";
  const allKeys = new Set<string>();
  spu.skus.forEach((s) => Object.keys(s.paramSnapshot).forEach((k) => allKeys.add(k)));
  return Array.from(allKeys).slice(0, 3).join(" / ");
}
