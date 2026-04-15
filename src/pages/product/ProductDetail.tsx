import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag, Tag, FileText, Image, Box, Plus, Package,
  MapPin, Shield, Clock, Truck, Award, BarChart3, Play,
  ChevronDown, ChevronRight, Link2, Building2, Eye, Edit,
  Camera, Video, Layers, Info, ExternalLink, Ruler,
} from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import ModuleAgentButton from "@/components/agent/ModuleAgentButton";
import {
  productSpuData, type ProductSpu, type ProductSku,
  auditLabel, auditBadge, shelfLabel, shelfBadge,
  getSpuPriceRange, getSpuTotalStock, getSpuRelatedModelCount,
  getSpuAggregatedAuditStatus, getSpuAggregatedShelfStatus,
  getSpuAppliedEnterprises, getSpuSpecSummary,
} from "@/data/product";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ── Constants ── */
const SCROLL_OFFSET = 72;

const floors = [
  { id: "overview", label: "商品概览", icon: ShoppingBag },
  { id: "skus", label: "SKU管理", icon: Tag },
  { id: "media", label: "商品素材", icon: Image },
  { id: "commercial", label: "商业属性", icon: FileText },
];

/* ══════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════ */

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
  const cssVar = `--${color}`;
  return (
    <div className="bg-card rounded-xl border border-border/40 p-4 flex items-start gap-3 hover:shadow-md transition-shadow" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `hsl(var(${cssVar}) / 0.08)` }}>
        <Icon className="h-4 w-4" style={{ color: `hsl(var(${cssVar}))` }} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground mb-0.5">{label}</div>
        <div className="text-lg font-semibold text-foreground leading-tight truncate">{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function InfoItem({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: boolean }) {
  return (
    <div className="flex items-center text-[12px] py-1.5">
      <span className="text-muted-foreground w-[72px] shrink-0">{label}</span>
      <span className={`text-foreground ${mono ? "font-mono bg-muted/40 px-1.5 py-0.5 rounded text-[11px]" : ""} ${link ? "text-primary cursor-pointer hover:underline" : ""}`}>{value}</span>
    </div>
  );
}

/* ── Media Section (reusable) ── */
function MediaGrid({ title, icon: Icon, items, cols, aspect, emptyLabel, onAdd }: {
  title: string; icon: any; items: { url: string; label?: string }[]; cols: string; aspect: string; emptyLabel: string; onAdd?: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
          <Icon className="h-3 w-3" /> {title}
          <span className="text-[10px] text-muted-foreground/50 ml-1">{items.length} 张</span>
        </h4>
        {onAdd && (
          <button onClick={onAdd} className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1">
            <Plus className="h-3 w-3" />上传
          </button>
        )}
      </div>
      {items.length > 0 ? (
        <div className={`grid ${cols} gap-3`}>
          {items.map((img, i) => (
            <div key={i} className={`group relative rounded-xl overflow-hidden border border-border/20 bg-muted/10 ${aspect} cursor-pointer`}>
              <img src={img.url} alt={img.label || ""} className="w-full h-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {img.label && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <span className="text-[11px] text-white">{img.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border/30 bg-muted/5 py-8 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/3 transition-colors" onClick={onAdd}>
          <Icon className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1.5" />
          <p className="text-[12px] text-muted-foreground/50">{emptyLabel}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════ */

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
  const fmt = (n: number) => `¥${n.toLocaleString()}`;

  const heroImages = spu.displayImages && spu.displayImages.length > 0 ? spu.displayImages : [spu.thumbnailUrl];

  return (
    <TooltipProvider>
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
          extraActions={
            <ModuleAgentButton
              domain="supply_chain"
              label="AI 生成详情页"
              relatedModule="product"
              relatedResourceId={id!}
              context={{
                productName: spu.productSpuName,
                brand: spu.brandName,
                series: spu.seriesName,
                category: spu.category,
                skuCount: spu.skus.length,
                skus: spu.skus.map(s => ({ name: s.productSkuName, price: s.price })),
              }}
              prompt={`请为以下商品生成一个专业的详情页内容：\n商品名称：${spu.productSpuName}\n品牌：${spu.brandName}\n系列：${spu.seriesName}\n品类：${spu.category}\nSKU数量：${spu.skus.length}个\n\n请生成完整的详情页结构，包括：卖点提炼、场景描述、参数排版、展示策略建议。`}
            />
          }
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
          <section id="overview" ref={(el) => { if (el) sectionRefs.current["overview"] = el; }}>
            {/* Hero Card */}
            <div className="bg-card rounded-xl border border-border/40 overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex gap-0">
                {/* Left: Gallery */}
                <div className="w-[380px] shrink-0 bg-muted/5 border-r border-border/20 p-5">
                  <div className="rounded-xl overflow-hidden bg-muted/20 border border-border/20 mb-3 aspect-square relative group">
                    <img
                      src={heroImages[selectedImage] || spu.thumbnailUrl}
                      alt={spu.productSpuName}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] text-white/70 bg-black/30 px-1.5 py-0.5 rounded">
                      {selectedImage + 1} / {heroImages.length}
                    </div>
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
                      {/* Add more button */}
                      <button className="w-14 h-14 rounded-lg border-2 border-dashed border-border/30 flex items-center justify-center shrink-0 hover:border-primary/40 transition-colors">
                        <Plus className="h-4 w-4 text-muted-foreground/40" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground mb-1.5">{spu.productSpuName}</h2>
                      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                        <span className="font-mono bg-muted/40 px-1.5 py-0.5 rounded text-[11px]">{spu.productSpuCode}</span>
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

                  {/* Price highlight */}
                  <div className="mb-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg px-4 py-3 border border-primary/10">
                    <span className="text-[11px] text-muted-foreground mr-2">参考价</span>
                    <span className="text-2xl font-bold text-primary">
                      {priceRange.min === priceRange.max ? fmt(priceRange.min) : `${fmt(priceRange.min)} - ${fmt(priceRange.max)}`}
                    </span>
                    {priceRange.min !== priceRange.max && (
                      <span className="text-[11px] text-muted-foreground ml-2">({spu.skus.length}个SKU)</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{spu.description}</p>

                  {/* Selling points */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {spu.sellingPoints.map((sp, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/6 text-primary border border-primary/10">{sp}</span>
                    ))}
                  </div>

                  {/* Quick specs - 2 columns compact */}
                  <div className="mt-auto grid grid-cols-2 gap-x-6 pt-3 border-t border-border/20">
                    <InfoItem label="品牌" value={spu.brandName} />
                    <InfoItem label="系列" value={spu.seriesName} />
                    <InfoItem label="前台分类" value={spu.frontendCategoryName} />
                    <InfoItem label="后台分类" value={spu.backendCategoryName} />
                    {spu.modelSpuName && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-[12px] py-1.5 col-span-2">
                            <span className="text-muted-foreground w-[72px] shrink-0">关联模型</span>
                            <span className="text-primary cursor-pointer hover:underline flex items-center gap-1">
                              <Link2 className="h-3 w-3" />{spu.modelSpuName}
                              <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-[11px]">SPU级关联模型，用于SKU快速设置属性</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-5 gap-4">
              <StatCard icon={Tag} color="primary" label="价格区间"
                value={priceRange.min === priceRange.max ? fmt(priceRange.min) : `${fmt(priceRange.min)}~${fmt(priceRange.max)}`}
                sub={`${spu.skus.length} 个SKU`} />
              <StatCard icon={Package} color="success" label="总库存" value={totalStock} sub="所有SKU合计" />
              <StatCard icon={Link2} color="info" label="关联模型" value={`${modelCount} 个`} sub="跨SKU去重" />
              <StatCard icon={Building2} color="warning" label="应用企业" value={`${appliedEnts.length} 家`} sub="SKU级汇总" />
              <StatCard icon={BarChart3} color="primary" label="规格维度" value={getSpuSpecSummary(spu)} sub="主要参数" />
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              Floor 2: SKU管理
              ═══════════════════════════════════════════ */}
          <section id="skus" ref={(el) => { if (el) sectionRefs.current["skus"] = el; }}>
            <div className="bg-card rounded-xl border border-border/40 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                <SectionTitle icon={Tag} title="SKU管理" badge={`${spu.skus.length} 个`} />
                <button className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors">
                  <Plus className="h-3 w-3" />新增SKU
                </button>
              </div>

              {/* SKU table header */}
              <div className="grid px-5 py-2.5 bg-muted/20 border-b border-border/20 text-[11px] text-muted-foreground font-medium"
                style={{ gridTemplateColumns: "28px 48px 1fr 120px 80px 80px 100px 120px" }}>
                <span />
                <span>缩略图</span>
                <span>SKU名称 / 编码</span>
                <span>关联模型</span>
                <span className="text-right">售价</span>
                <span className="text-right">库存</span>
                <span className="text-center">应用企业</span>
                <span className="text-center">状态</span>
              </div>

              <div className="divide-y divide-border/20">
                {spu.skus.map((sku) => (
                  <SkuRow
                    key={sku.id}
                    sku={sku}
                    isExpanded={expandedSkus.has(sku.id)}
                    onToggle={() => toggleSkuExpand(sku.id)}
                    fmt={fmt}
                  />
                ))}
              </div>

              {spu.skus.length === 0 && (
                <div className="py-12 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground/40">暂无SKU</p>
                  <button className="mt-2 text-[12px] text-primary hover:underline">+ 添加第一个SKU</button>
                </div>
              )}
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              Floor 3: 商品素材
              ═══════════════════════════════════════════ */}
          <section id="media" ref={(el) => { if (el) sectionRefs.current["media"] = el; }}>
            <div className="bg-card rounded-xl border border-border/40 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <SectionTitle icon={Image} title="商品素材"
                badge={`${(spu.displayImages?.length || 0) + (spu.detailImages?.length || 0) + (spu.sceneImages?.length || 0) + (spu.videos?.length || 0)} 项`}
                action={
                  <button className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1">
                    <Edit className="h-3 w-3" />管理素材
                  </button>
                }
              />

              <div className="space-y-8">
                {/* Display images (主图) */}
                <MediaGrid
                  title="商品展示图"
                  icon={Camera}
                  items={(spu.displayImages || []).map(url => ({ url }))}
                  cols="grid-cols-5"
                  aspect="aspect-square"
                  emptyLabel="上传商品展示图（建议 5-8 张）"
                  onAdd={() => {}}
                />

                {/* Detail images */}
                <MediaGrid
                  title="细节特写"
                  icon={Eye}
                  items={spu.detailImages || []}
                  cols="grid-cols-4"
                  aspect="aspect-[4/3]"
                  emptyLabel="上传细节特写（面料、工艺等）"
                  onAdd={() => {}}
                />

                {/* Scene images */}
                <MediaGrid
                  title="场景效果图"
                  icon={Layers}
                  items={spu.sceneImages || []}
                  cols="grid-cols-3"
                  aspect="aspect-video"
                  emptyLabel="上传场景效果图（空间搭配、生活场景）"
                  onAdd={() => {}}
                />

                {/* Videos */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[12px] font-medium text-muted-foreground flex items-center gap-1.5">
                      <Video className="h-3 w-3" /> 视频素材
                      <span className="text-[10px] text-muted-foreground/50 ml-1">{(spu.videos || []).length} 个</span>
                    </h4>
                    <button className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1">
                      <Plus className="h-3 w-3" />上传
                    </button>
                  </div>
                  {(spu.videos || []).length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {(spu.videos || []).map((v, i) => (
                        <div key={i} className="rounded-xl border border-border/20 bg-muted/10 aspect-video flex items-center justify-center cursor-pointer hover:bg-muted/20 transition-colors group relative">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur flex items-center justify-center mx-auto mb-1.5 group-hover:bg-primary/20 transition-colors">
                              <Play className="h-5 w-5 text-white ml-0.5" />
                            </div>
                            <span className="text-[11px] text-muted-foreground">{v.label || `视频${i + 1}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-border/30 bg-muted/5 py-8 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/3 transition-colors">
                      <Video className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1.5" />
                      <p className="text-[12px] text-muted-foreground/50">上传产品视频（支持 MP4, MOV）</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              Floor 4: 商业属性
              ═══════════════════════════════════════════ */}
          <section id="commercial" ref={(el) => { if (el) sectionRefs.current["commercial"] = el; }}>
            <div className="bg-card rounded-xl border border-border/40 p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <SectionTitle icon={FileText} title="商业属性"
                action={
                  <button className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1">
                    <Edit className="h-3 w-3" />编辑
                  </button>
                }
              />
              <div className="grid grid-cols-3 gap-x-8 gap-y-0">
                <AttrRow icon={MapPin} label="产地" value={spu.commercialAttrs.origin} />
                <AttrRow icon={Shield} label="保修期" value={spu.commercialAttrs.warranty} />
                <AttrRow icon={Truck} label="交货周期" value={spu.commercialAttrs.deliveryCycle} />
                {spu.commercialAttrs.material && <AttrRow icon={Box} label="主要材质" value={spu.commercialAttrs.material} />}
                {spu.commercialAttrs.dimensions && <AttrRow icon={Ruler} label="尺寸" value={spu.commercialAttrs.dimensions} />}
                <div className="flex items-start gap-2 py-2.5">
                  <Award className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5" />
                  <span className="text-[12px] text-muted-foreground w-14 shrink-0">认证</span>
                  <div className="flex flex-wrap gap-1.5">
                    {spu.commercialAttrs.certifications.map((c, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/6 text-primary border border-primary/10">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5 pt-4 border-t border-border/20">
                <h4 className="text-[12px] font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> 商品说明
                </h4>
                <div className="text-[12px] text-foreground/80 leading-relaxed bg-muted/10 rounded-lg p-4 border border-border/10 min-h-[60px]">
                  {spu.description || <span className="text-muted-foreground/40 italic">暂无商品说明，点击编辑添加</span>}
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-5 pt-4 border-t border-border/20">
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
    </TooltipProvider>
  );
}

/* ── AttrRow ── */
function AttrRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 py-2.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
      <span className="text-[12px] text-muted-foreground w-14 shrink-0">{label}</span>
      <span className="text-[13px] text-foreground">{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SKU Row — structured table row with expandable detail
   ══════════════════════════════════════════════════════ */
function SkuRow({ sku, isExpanded, onToggle, fmt }: {
  sku: ProductSku;
  isExpanded: boolean;
  onToggle: () => void;
  fmt: (n: number) => string;
}) {
  return (
    <div className="group">
      {/* Grid row */}
      <div
        className="grid items-center px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer"
        style={{ gridTemplateColumns: "28px 48px 1fr 120px 80px 80px 100px 120px" }}
        onClick={onToggle}
      >
        <button className="p-0.5 rounded text-muted-foreground">
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/30 shrink-0 border border-border/20">
          <img src={sku.thumbnailUrl} alt={sku.productSkuName} className="w-full h-full object-cover" loading="lazy" />
        </div>

        <div className="min-w-0 pl-3">
          <div className="text-[12px] font-medium text-foreground truncate">{sku.productSkuName}</div>
          <div className="text-[10px] text-muted-foreground font-mono">{sku.productSkuCode}</div>
        </div>

        {/* Model association */}
        <div className="min-w-0">
          {sku.modelSpuId ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[11px] text-primary cursor-pointer hover:underline flex items-center gap-1 truncate">
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{sku.modelSkuName}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-[11px]">
                  <div className="font-medium">模型SPU: {sku.modelSpuName}</div>
                  <div className="text-muted-foreground">SKU: {sku.modelSkuName}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-[11px] text-muted-foreground/40">未关联</span>
          )}
        </div>

        <div className="text-right">
          <div className="text-[12px] font-semibold text-foreground">{fmt(sku.price)}</div>
          {sku.originalPrice && <div className="text-[10px] text-muted-foreground/40 line-through">{fmt(sku.originalPrice)}</div>}
        </div>

        <div className="text-right">
          <div className={`text-[12px] ${sku.stockQuantity <= 10 ? "text-destructive font-medium" : "text-foreground"}`}>{sku.stockQuantity}</div>
        </div>

        <div className="text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-[11px] text-primary cursor-pointer hover:underline">
                {(sku.appliedEnterprises || []).length} 家
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-[11px] space-y-0.5">
                {(sku.appliedEnterprises || []).map(e => (
                  <div key={e.id}>{e.name} <span className="text-muted-foreground">({e.type})</span></div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className={`${auditBadge[sku.auditStatus]} text-[10px]`}>{auditLabel[sku.auditStatus]}</span>
          {sku.auditStatus === "APPROVED" && (
            <span className={`${shelfBadge[sku.shelfStatus]} text-[10px]`}>{shelfLabel[sku.shelfStatus]}</span>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 ml-[76px]">
          <div className="rounded-lg border border-border/20 overflow-hidden bg-muted/5">
            {/* Params */}
            <div className="px-4 py-3 border-b border-border/10">
              <div className="text-[11px] text-muted-foreground font-medium mb-2">规格参数</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(sku.paramSnapshot).map(([k, v]) => (
                  <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/10">
                    {k}: <span className="text-foreground">{v}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 3-column detail grid */}
            <div className="grid grid-cols-3 divide-x divide-border/10">
              {/* Model detail */}
              <div className="p-4">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5">
                  <Link2 className="h-3 w-3" /> 关联模型
                </div>
                {sku.modelSpuId ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[12px]">
                      <Box className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-primary font-medium cursor-pointer hover:underline">{sku.modelSpuName}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground pl-5">SKU: {sku.modelSkuName}</div>
                    <button className="text-[10px] text-primary/70 hover:text-primary pl-5">查看模型详情 →</button>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <Link2 className="h-5 w-5 text-muted-foreground/20 mx-auto mb-1" />
                    <p className="text-[11px] text-muted-foreground/40">未关联模型</p>
                    <button className="text-[10px] text-primary mt-1">+ 关联模型</button>
                  </div>
                )}
              </div>

              {/* Price detail */}
              <div className="p-4">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5">
                  <Tag className="h-3 w-3" /> 价格信息
                </div>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-muted-foreground">售价</span><span className="font-semibold text-foreground">{fmt(sku.price)}</span></div>
                  {sku.originalPrice && <div className="flex justify-between"><span className="text-muted-foreground">原价</span><span className="line-through text-muted-foreground/50">{fmt(sku.originalPrice)}</span></div>}
                  {sku.costPrice && <div className="flex justify-between"><span className="text-muted-foreground">成本</span><span className="text-foreground">{fmt(sku.costPrice)}</span></div>}
                  {sku.barcode && <div className="flex justify-between"><span className="text-muted-foreground">条码</span><span className="font-mono text-[11px] text-foreground">{sku.barcode}</span></div>}
                </div>
              </div>

              {/* Applied enterprises */}
              <div className="p-4">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mb-2.5">
                  <Building2 className="h-3 w-3" /> 应用企业 · {(sku.appliedEnterprises || []).length}家
                </div>
                <div className="space-y-1.5">
                  {(sku.appliedEnterprises || []).slice(0, 4).map((e) => (
                    <div key={e.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground truncate">{e.name}</span>
                      <span className="text-muted-foreground/50 shrink-0 ml-2 text-[10px]">{e.type}</span>
                    </div>
                  ))}
                  {(sku.appliedEnterprises || []).length > 4 && (
                    <button className="text-[10px] text-primary cursor-pointer hover:underline">
                      +{(sku.appliedEnterprises || []).length - 4} 更多
                    </button>
                  )}
                  {(sku.appliedEnterprises || []).length === 0 && (
                    <div className="text-[11px] text-muted-foreground/40 text-center py-2">暂无应用企业</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-6 px-4 py-2.5 bg-muted/10 border-t border-border/10 text-[11px] text-muted-foreground">
              {sku.weight && <span>重量: <span className="text-foreground">{sku.weight}kg</span></span>}
              <span>创建: {sku.createdAt}</span>
              <span>更新: {sku.updatedAt}</span>
              <div className="ml-auto flex items-center gap-2">
                <button className="text-primary hover:underline text-[11px]">编辑</button>
                <span className="text-border">·</span>
                <button className="text-primary hover:underline text-[11px]">审核</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
