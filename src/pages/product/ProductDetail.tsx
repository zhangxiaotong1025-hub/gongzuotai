import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag, Tag, FileText, Image, Box, Plus, Package,
  MapPin, Shield, Clock, Truck, Award, BarChart3, Play,
  ChevronDown, ChevronRight, Link2, Building2, Eye,
} from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import {
  productSpuData, type ProductSpu, type ProductSku,
  type ProductAuditStatus, type ProductShelfStatus,
  auditLabel, auditBadge, shelfLabel, shelfBadge,
  getSpuPriceRange, getSpuTotalStock, getSpuRelatedModelCount,
  getSpuAggregatedAuditStatus, getSpuAggregatedShelfStatus,
  getSpuAppliedEnterprises, getSpuSpecSummary,
} from "@/data/product";

/* ── Constants ── */
const SCROLL_OFFSET = 72;

const floors = [
  { id: "overview", label: "商品概览", icon: ShoppingBag },
  { id: "skus", label: "SKU管理", icon: Tag },
  { id: "gallery", label: "商品展示", icon: Image },
  { id: "commercial", label: "商业属性", icon: FileText },
];

/* ══════════════════════════════════════════════════════
   Shared sub-components
   ══════════════════════════════════════════════════════ */

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

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border/40 p-4 flex items-start gap-3" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `hsl(var(--${color}) / 0.08)` }}>
        <Icon className="h-4 w-4" style={{ color: `hsl(var(--${color}))` }} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
        <div className="text-lg font-semibold text-foreground leading-tight truncate">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════ */

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState("overview");
  const [expandedSkus, setExpandedSkus] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState(0);
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
  const appliedEnts = getSpuAppliedEnterprises(spu);
  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  // Merge all display images for hero gallery
  const heroImages = spu.displayImages.length > 0 ? spu.displayImages : [spu.thumbnailUrl];

  return (
    <div>
      <DetailActionBar
        backLabel="商品管理"
        backPath="/product"
        currentName={spu.productSpuName}
        prevPath={curIdx > 0 ? `/product/detail/${allIds[curIdx - 1]}` : null}
        nextPath={curIdx < allIds.length - 1 ? `/product/detail/${allIds[curIdx + 1]}` : null}
        statusToggle={
          getSpuAggregatedAuditStatus(spu) === "APPROVED"
            ? { currentActive: getSpuAggregatedShelfStatus(spu) === "ON_SHELF", activeLabel: "已上架", inactiveLabel: "已下架", onToggle: () => {} }
            : undefined
        }
        onEdit={() => navigate(`/product/create?edit=${id}`)}
      />

      {/* ── Floor navigation ── */}
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
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-10 mt-6">
        {/* ═══════════════════════════════════════════
            Floor 1: 商品概览
            ═══════════════════════════════════════════ */}
        <section id="overview" ref={(el) => { sectionRefs.current["overview"] = el; }}>
          {/* Hero: Image gallery + Product info */}
          <div className="bg-card rounded-xl border border-border/40 overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="flex gap-0">
              {/* Left: Image gallery */}
              <div className="w-[360px] shrink-0 bg-muted/5 border-r border-border/20 p-5">
                <div className="rounded-xl overflow-hidden bg-muted/20 border border-border/20 mb-3 aspect-square">
                  <img
                    src={heroImages[selectedImage] || spu.thumbnailUrl}
                    alt={spu.productSpuName}
                    className="w-full h-full object-cover"
                  />
                </div>
                {heroImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {heroImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          selectedImage === i ? "border-primary shadow-sm" : "border-border/20 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product info */}
              <div className="flex-1 min-w-0 p-6 flex flex-col">
                {/* Title & status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1.5">{spu.productSpuName}</h2>
                    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span className="font-mono bg-muted/40 px-1.5 py-0.5 rounded">{spu.productSpuCode}</span>
                      <span className="text-border">·</span>
                      <span>{spu.ownerEnterpriseName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={auditBadge[getSpuAggregatedAuditStatus(spu)]}>{auditLabel[getSpuAggregatedAuditStatus(spu)]}</span>
                    {getSpuAggregatedAuditStatus(spu) === "APPROVED" && (
                      <span className={shelfBadge[getSpuAggregatedShelfStatus(spu)]}>{shelfLabel[getSpuAggregatedShelfStatus(spu)]}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 bg-muted/10 rounded-lg px-4 py-3 border border-border/10">
                  <span className="text-[11px] text-muted-foreground mr-2">参考价</span>
                  <span className="text-2xl font-bold text-primary">
                    {priceRange.min === priceRange.max ? formatPrice(priceRange.min) : `${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">{spu.description}</p>

                {/* Selling points */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {spu.sellingPoints.map((sp, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/6 text-primary border border-primary/10">{sp}</span>
                  ))}
                </div>

                {/* Quick specs grid */}
                <div className="mt-auto grid grid-cols-2 gap-x-8 gap-y-2 text-[12px] pt-4 border-t border-border/20">
                  <div className="flex"><span className="text-muted-foreground w-14 shrink-0">品牌</span><span className="text-foreground font-medium">{spu.brandName}</span></div>
                  <div className="flex"><span className="text-muted-foreground w-14 shrink-0">系列</span><span className="text-foreground">{spu.seriesName}</span></div>
                  <div className="flex"><span className="text-muted-foreground w-14 shrink-0">分类</span><span className="text-foreground">{spu.backendCategoryName} / {spu.frontendCategoryName}</span></div>
                  {spu.modelSpuName && (
                    <div className="flex"><span className="text-muted-foreground w-14 shrink-0">关联模型</span><span className="text-primary cursor-pointer hover:underline">{spu.modelSpuName}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard
              icon={Tag} color="primary" label="价格区间"
              value={priceRange.min === priceRange.max ? formatPrice(priceRange.min) : `${formatPrice(priceRange.min)}~${formatPrice(priceRange.max)}`}
              sub={`${spu.skus.length} 个SKU`}
            />
            <StatCard icon={Package} color="success" label="总库存" value={totalStock} sub="所有SKU合计" />
            <StatCard icon={Link2} color="info" label="关联模型" value={`${modelCount} 个`} sub="跨SKU去重" />
            <StatCard icon={Building2} color="warning" label="应用企业" value={`${appliedEnts.length} 家`} sub="SKU级汇总" />
            <StatCard icon={BarChart3} color="primary" label="规格维度" value={getSpuSpecSummary(spu)} sub="主要参数" />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            Floor 2: SKU管理
            ═══════════════════════════════════════════ */}
        <section id="skus" ref={(el) => { sectionRefs.current["skus"] = el; }}>
          <div className="bg-card rounded-xl border border-border/40 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
            <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
              <SectionTitle icon={Tag} title="SKU管理" badge={`${spu.skus.length} 个`} />
              <button className="btn-primary text-[12px] h-8 px-3 flex items-center gap-1">
                <Plus className="h-3 w-3" />新增SKU
              </button>
            </div>

            <div className="divide-y divide-border/20">
              {spu.skus.map((sku) => (
                <SkuRow
                  key={sku.id}
                  sku={sku}
                  isExpanded={expandedSkus.has(sku.id)}
                  onToggle={() => toggleSkuExpand(sku.id)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            Floor 3: 商品展示 (Gallery)
            ═══════════════════════════════════════════ */}
        <section id="gallery" ref={(el) => { sectionRefs.current["gallery"] = el; }}>
          <div className="bg-card rounded-xl border border-border/40 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <SectionTitle icon={Image} title="商品展示" badge={`${(spu.detailImages?.length || 0) + (spu.sceneImages?.length || 0) + (spu.videos?.length || 0)} 项素材`} />

            <div className="space-y-8">
              {/* Detail images */}
              {spu.detailImages && spu.detailImages.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Eye className="h-3 w-3" /> 细节特写
                  </h4>
                  <div className="grid grid-cols-4 gap-4">
                    {spu.detailImages.map((img, i) => (
                      <div key={i} className="group relative rounded-xl overflow-hidden border border-border/20 bg-muted/10 aspect-[4/3]">
                        <img src={img.url} alt={img.label || `细节图${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        {img.label && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                            <span className="text-[11px] text-white">{img.label}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scene images */}
              {spu.sceneImages && spu.sceneImages.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Image className="h-3 w-3" /> 场景效果图
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {spu.sceneImages.map((img, i) => (
                      <div key={i} className="group relative rounded-xl overflow-hidden border border-border/20 bg-muted/10 aspect-video">
                        <img src={img.url} alt={img.label || `场景图${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        {img.label && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2.5">
                            <span className="text-[12px] text-white font-medium">{img.label}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos placeholder */}
              {spu.videos && spu.videos.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Play className="h-3 w-3" /> 视频素材
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {spu.videos.map((v, i) => (
                      <div key={i} className="rounded-xl border border-border/20 bg-muted/10 aspect-video flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors">
                        <div className="text-center">
                          <Play className="h-8 w-8 text-muted-foreground/40 mx-auto mb-1" />
                          <span className="text-[11px] text-muted-foreground">{v.label || `视频${i + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!spu.detailImages || spu.detailImages.length === 0) &&
               (!spu.sceneImages || spu.sceneImages.length === 0) &&
               (!spu.videos || spu.videos.length === 0) && (
                <div className="text-center py-12 text-muted-foreground/40">
                  <Image className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-[13px]">暂无展示素材</p>
                  <p className="text-[11px] mt-1">点击编辑上传细节图、场景图或视频</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            Floor 4: 商业属性
            ═══════════════════════════════════════════ */}
        <section id="commercial" ref={(el) => { sectionRefs.current["commercial"] = el; }}>
          <div className="bg-card rounded-xl border border-border/40 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
            <SectionTitle icon={FileText} title="商业属性" />
            <div className="grid grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-0">
                <AttrRow icon={MapPin} label="产地" value={spu.commercialAttrs.origin} />
                <AttrRow icon={Shield} label="保修期" value={spu.commercialAttrs.warranty} />
                <AttrRow icon={Truck} label="交货周期" value={spu.commercialAttrs.deliveryCycle} />
                {spu.commercialAttrs.material && <AttrRow icon={Box} label="主要材质" value={spu.commercialAttrs.material} />}
                {spu.commercialAttrs.dimensions && <AttrRow icon={BarChart3} label="主要尺寸" value={spu.commercialAttrs.dimensions} />}
              </div>
              {/* Right column: certifications */}
              <div>
                <div className="flex items-start gap-2 py-2.5">
                  <Award className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5" />
                  <span className="text-[12px] text-muted-foreground w-16 shrink-0">认证</span>
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

/* ── AttrRow ── */
function AttrRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
      <span className="text-[12px] text-muted-foreground w-16 shrink-0">{label}</span>
      <span className="text-[13px] text-foreground">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SKU Row — expandable with model association
   ══════════════════════════════════════════════════════ */
function SkuRow({ sku, isExpanded, onToggle, formatPrice }: {
  sku: ProductSku;
  isExpanded: boolean;
  onToggle: () => void;
  formatPrice: (n: number) => string;
}) {
  return (
    <div className="group">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={onToggle}
      >
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
        <div className="px-5 pb-5 pt-1 ml-[72px] border-l-2 border-primary/10">
          <div className="grid grid-cols-3 gap-4 text-[12px]">
            {/* Model association card */}
            <div className="rounded-lg border border-border/20 overflow-hidden">
              <div className="px-3 py-2 bg-muted/10 border-b border-border/10 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Link2 className="h-3 w-3" /> 关联模型
              </div>
              <div className="p-3 space-y-2">
                {sku.modelSpuId ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Box className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-foreground font-medium">{sku.modelSpuName}</span>
                    </div>
                    <div className="text-muted-foreground/60 text-[11px] pl-5">{sku.modelSkuName}</div>
                  </>
                ) : (
                  <div className="text-muted-foreground/40 text-[11px]">未关联模型</div>
                )}
              </div>
            </div>

            {/* Price info card */}
            <div className="rounded-lg border border-border/20 overflow-hidden">
              <div className="px-3 py-2 bg-muted/10 border-b border-border/10 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> 价格信息
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">售价</span><span className="font-medium text-foreground">{formatPrice(sku.price)}</span></div>
                {sku.originalPrice && <div className="flex justify-between"><span className="text-muted-foreground">原价</span><span className="line-through text-muted-foreground/60">{formatPrice(sku.originalPrice)}</span></div>}
                {sku.costPrice && <div className="flex justify-between"><span className="text-muted-foreground">成本</span><span className="text-foreground">{formatPrice(sku.costPrice)}</span></div>}
              </div>
            </div>

            {/* Other info card */}
            <div className="rounded-lg border border-border/20 overflow-hidden">
              <div className="px-3 py-2 bg-muted/10 border-b border-border/10 text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> 应用企业 · {(sku.appliedEnterprises || []).length}家
              </div>
              <div className="p-3 space-y-1.5">
                {(sku.appliedEnterprises || []).slice(0, 3).map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-foreground truncate">{e.name}</span>
                    <span className="text-muted-foreground/50 shrink-0 ml-2">{e.type}</span>
                  </div>
                ))}
                {(sku.appliedEnterprises || []).length > 3 && (
                  <div className="text-[10px] text-primary cursor-pointer hover:underline">
                    +{(sku.appliedEnterprises || []).length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Extra details row */}
          <div className="flex items-center gap-6 mt-3 text-[11px] text-muted-foreground pt-3 border-t border-border/10">
            {sku.barcode && <span>条码: <span className="font-mono text-foreground">{sku.barcode}</span></span>}
            {sku.weight && <span>重量: <span className="text-foreground">{sku.weight}kg</span></span>}
            <span>更新: {sku.updatedAt}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getSpuSpecSummary(spu: ProductSpu): string {
  if (spu.skus.length === 0) return "—";
  const allKeys = new Set<string>();
  spu.skus.forEach((s) => Object.keys(s.paramSnapshot).forEach((k) => allKeys.add(k)));
  return Array.from(allKeys).slice(0, 3).join(" / ");
}
