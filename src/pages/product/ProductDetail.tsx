import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag, Tag, Layers, Link2, Building2, FileText, Box } from "lucide-react";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { productSpuData, type ProductSpu, type ProductShelfStatus, type ProductAuditStatus } from "@/data/product";

const shelfLabel: Record<ProductShelfStatus, string> = { ON_SHELF: "已上架", OFF_SHELF: "已下架" };
const shelfBadge: Record<ProductShelfStatus, string> = { ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };
const auditLabel: Record<ProductAuditStatus, string> = { PENDING: "待审核", APPROVED: "已通过", REJECTED: "已拒绝", NONE: "—" };

const tabs = [
  { key: "basic", label: "基本信息", icon: ShoppingBag },
  { key: "model", label: "关联模型", icon: Link2 },
  { key: "sku", label: "商品SKU", icon: Tag },
  { key: "commercial", label: "商业属性", icon: FileText },
  { key: "sub", label: "子数据引用", icon: Building2 },
];

function InfoRow({ label, value, mono }: { label: string; value: string | React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-border/20 last:border-0">
      <span className="text-muted-foreground text-[13px] shrink-0 w-24 text-right">{label}</span>
      <span className={`text-foreground text-[13px] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "basic";
  const [activeTab, setActiveTab] = useState(initialTab);

  const spu = productSpuData.find((s) => s.id === id);
  if (!spu) return <div className="p-8 text-center text-muted-foreground">商品不存在</div>;

  const allIds = productSpuData.map((s) => s.id);
  const curIdx = allIds.indexOf(id!);
  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  return (
    <div>
      <DetailActionBar
        backLabel="商品管理"
        backPath="/product"
        currentName={spu.productSpuName}
        prevPath={curIdx > 0 ? `/product/detail/${allIds[curIdx - 1]}` : null}
        nextPath={curIdx < allIds.length - 1 ? `/product/detail/${allIds[curIdx + 1]}` : null}
        statusToggle={{
          currentActive: spu.status === "ON_SHELF",
          activeLabel: "已上架",
          inactiveLabel: "已下架",
          onToggle: () => {},
        }}
        onEdit={() => navigate(`/product/create?edit=${id}`)}
      />

      {/* Tab nav */}
      <div className="mt-4 mb-6 border-b border-border/60">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 transition-all ${
                activeTab === tab.key
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              {tab.key === "sku" && <span className="ml-1 text-[11px] text-muted-foreground">({spu.skuCount})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "basic" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
            <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary/8 flex items-center justify-center"><ShoppingBag className="h-3 w-3 text-primary" /></div>
              商品信息
            </h3>
            <InfoRow label="商品名称" value={spu.productSpuName} />
            <InfoRow label="商品编码" value={spu.productSpuCode} mono />
            <InfoRow label="数据类型" value={<span className={spu.dataType === "MASTER" ? "badge-info" : "badge-muted"}>{spu.dataType === "MASTER" ? "主数据" : "子数据"}</span>} />
            <InfoRow label="库类型" value={spu.usageScope === "PUBLIC" ? "公有库" : "私有库"} />
            <InfoRow label="品牌" value={spu.brandName} />
            <InfoRow label="后台分类" value={spu.backendCategoryName} />
            <InfoRow label="前台分类" value={spu.frontendCategoryName} />
            <InfoRow label="描述" value={spu.description || "—"} />
          </div>
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/8 flex items-center justify-center"><Tag className="h-3 w-3 text-primary" /></div>
                价格 & 库存
              </h3>
              <InfoRow label="价格区间" value={`${formatPrice(spu.priceMin)} ~ ${formatPrice(spu.priceMax)}`} />
              <InfoRow label="SKU数量" value={`${spu.skuCount} 个`} />
              <InfoRow label="关联模型" value={`${spu.relatedModelCount} 个模型SPU`} />
            </div>
            <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-semibold mb-4 flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary/8 flex items-center justify-center"><Layers className="h-3 w-3 text-primary" /></div>
                状态信息
              </h3>
              <div className="flex items-start gap-2 py-2.5 border-b border-border/20">
                <span className="text-muted-foreground text-[13px] shrink-0 w-24 text-right">上架状态</span>
                <span className={shelfBadge[spu.status]}>{shelfLabel[spu.status]}</span>
              </div>
              {spu.publicStatus !== "NONE" && (
                <InfoRow label="审核状态" value={auditLabel[spu.publicStatus]} />
              )}
              <InfoRow label="创建时间" value={spu.createdAt} />
              <InfoRow label="更新时间" value={spu.updatedAt} />
            </div>
            {spu.sellingPoints.length > 0 && (
              <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
                <h3 className="text-[14px] font-semibold mb-3">商品卖点</h3>
                <div className="flex flex-wrap gap-2">
                  {spu.sellingPoints.map((sp, i) => (
                    <span key={i} className="badge-product">{sp}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "model" && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
            <Link2 className="h-4 w-4 text-primary" />
            <h3 className="text-[14px] font-semibold">关联模型</h3>
            <span className="text-[12px] text-muted-foreground ml-2">商品与模型的关系通过商品SKU建立，以下为派生展示</span>
          </div>
          {/* Group by model SPU */}
          {(() => {
            const modelGroups = new Map<string, { modelSpuName: string; skus: typeof spu.skus }>();
            for (const sku of spu.skus) {
              if (!modelGroups.has(sku.modelSpuName)) {
                modelGroups.set(sku.modelSpuName, { modelSpuName: sku.modelSpuName, skus: [] });
              }
              modelGroups.get(sku.modelSpuName)!.skus.push(sku);
            }
            return Array.from(modelGroups.values()).map((group) => (
              <div key={group.modelSpuName} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-[13px]">{group.modelSpuName}</span>
                  <span className="text-[11px] text-muted-foreground">· {group.skus.length} 个SKU</span>
                </div>
                <div className="grid grid-cols-3 gap-3 pl-6">
                  {group.skus.map((sku) => (
                    <div key={sku.id} className="border rounded-lg p-3 bg-muted/10">
                      <div className="text-[13px] font-medium mb-1">{sku.modelSkuName}</div>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(sku.paramSnapshot).map(([k, v]) => (
                          <span key={k} className="badge-product text-[10px]">{v}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {activeTab === "sku" && (
        <div className="bg-card rounded-xl border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
            <span className="text-[13px] text-muted-foreground">共 {spu.skus.length} 个商品SKU</span>
            {spu.dataType === "MASTER" && (
              <button className="btn-primary text-[12px] h-8 px-3">新增SKU</button>
            )}
          </div>
          <div className="divide-y divide-border/30">
            {spu.skus.map((sku) => (
              <div key={sku.id} className="flex">
                {/* Upper: inherited from model (read-only) */}
                <div className="w-[45%] p-4 bg-muted/10 border-r border-border/20">
                  <div className="text-[10px] text-muted-foreground/60 mb-2 uppercase tracking-wider">继承自工具数据层</div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                      <Box className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{sku.modelSkuName}</div>
                      <div className="text-[11px] text-muted-foreground">{sku.modelSpuName}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(sku.paramSnapshot).map(([k, v]) => (
                          <span key={k} className="badge-product text-[10px]">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Lower: commercial info (editable) */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{sku.productSkuCode}</span>
                    <span className={shelfBadge[sku.status]}>{shelfLabel[sku.status]}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[13px]">
                    <div>
                      <div className="text-[11px] text-muted-foreground mb-0.5">售价</div>
                      <div className="font-semibold text-foreground">{formatPrice(sku.price)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground mb-0.5">原价</div>
                      <div className="text-muted-foreground line-through">{sku.originalPrice ? formatPrice(sku.originalPrice) : "—"}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground mb-0.5">库存</div>
                      <div className={sku.stockQuantity <= 10 ? "text-destructive font-medium" : ""}>{sku.stockQuantity}</div>
                    </div>
                  </div>
                  {spu.dataType === "MASTER" && (
                    <div className="flex gap-1 mt-3 pt-2 border-t border-border/20">
                      <button className="btn-text text-primary-action text-[12px]">编辑</button>
                      <button className="btn-text text-primary-action text-[12px]">{sku.status === "ON_SHELF" ? "下架" : "上架"}</button>
                      <button className="btn-text text-danger-action text-[12px]">删除</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "commercial" && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-[14px] font-semibold">商业属性</h3>
            <span className="text-[12px] text-muted-foreground ml-2">商业属性不影响3D渲染效果，仅用于商品信息展示和交易履约</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8">
            <InfoRow label="产地" value={spu.commercialAttrs.origin} />
            <InfoRow label="保修期" value={spu.commercialAttrs.warranty} />
            <InfoRow label="交货周期" value={spu.commercialAttrs.deliveryCycle} />
            <InfoRow label="认证信息" value={
              <div className="flex flex-wrap gap-1">
                {spu.commercialAttrs.certifications.map((c, i) => (
                  <span key={i} className="badge-active">{c}</span>
                ))}
              </div>
            } />
          </div>
        </div>
      )}

      {activeTab === "sub" && (
        <div className="bg-card rounded-xl border p-8 text-center" style={{ boxShadow: "var(--shadow-sm)" }}>
          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground mb-1">展示引用该商品的子数据企业列表</p>
          <p className="text-[12px] text-muted-foreground/60">如需管理子数据，请在授权管理模块操作</p>
        </div>
      )}
    </div>
  );
}
