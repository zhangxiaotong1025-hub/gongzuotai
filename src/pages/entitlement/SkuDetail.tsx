import { useParams, useNavigate, Link } from "react-router-dom";
import { skuData, entitlementProductData, capabilityData, appData, bundleData, STATUS_MAP, BILLING_CYCLES, PERIOD_TYPES } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function SkuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sku = skuData.find((s) => s.id === id);
  if (!sku) return <div className="p-10 text-center text-muted-foreground">商品不存在</div>;

  const product = entitlementProductData.find((p) => p.id === sku.productId);
  const cap = product ? capabilityData.find((c) => c.id === product.capabilityId) : null;
  const bundles = bundleData.filter((b) => b.items.some((i) => i.skuId === sku.id));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/sku")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 商品SKU</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{sku.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{sku.name}</h2>
          <span className={STATUS_MAP[sku.salesStatus].className}>{STATUS_MAP[sku.salesStatus].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">商品编码</span><div className="font-mono text-foreground mt-0.5">{sku.code}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5"><Link to={`/entitlement/app/detail/${sku.appId}`} className="text-primary hover:underline">{sku.appName}</Link></div></div>
          <div><span className="text-muted-foreground">价格</span><div className={`font-medium mt-0.5 ${sku.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{sku.price > 0 ? `¥${sku.price}` : "¥0"}</div></div>
          <div><span className="text-muted-foreground">计费周期</span><div className="text-foreground mt-0.5">{BILLING_CYCLES.find((b) => b.value === sku.billingCycle)?.label}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{sku.createdAt}</div></div>
        </div>
        {sku.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{sku.description}</p>}
      </div>

      {/* Full relationship chain */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">完整关联链路</h3>
        <div className="flex items-center gap-3 text-[13px] flex-wrap">
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">应用</div>
            <Link to={`/entitlement/app/detail/${sku.appId}`} className="text-primary hover:underline font-medium">{sku.appName}</Link>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">能力</div>
            {cap ? <Link to={`/entitlement/capability/detail/${cap.id}`} className="text-primary hover:underline font-medium">{cap.name}</Link> : <span>—</span>}
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">权益产品</div>
            {product ? <Link to={`/entitlement/rule/detail/${product.id}`} className="text-primary hover:underline font-medium">{product.name}</Link> : <span>—</span>}
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border border-primary/40 bg-primary/5 text-center">
            <div className="text-[11px] text-primary mb-1">当前商品</div>
            <span className="font-semibold text-foreground">{sku.name}</span>
          </div>
          {bundles.length > 0 && <>
            <span className="text-muted-foreground">→</span>
            <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
              <div className="text-[11px] text-muted-foreground mb-1">套餐</div>
              <span className="text-primary font-medium">{bundles.length}个</span>
            </div>
          </>}
        </div>
      </div>

      {/* Product detail */}
      {product && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">关联权益产品</h3>
          <div className="grid grid-cols-4 gap-4 text-[13px]">
            <div><span className="text-muted-foreground">产品名称</span><div className="mt-0.5"><Link to={`/entitlement/rule/detail/${product.id}`} className="text-primary hover:underline font-medium">{product.name}</Link></div></div>
            <div><span className="text-muted-foreground">额度</span><div className="font-medium text-foreground mt-0.5">{product.quota.toLocaleString()}</div></div>
            <div><span className="text-muted-foreground">周期</span><div className="text-foreground mt-0.5">{PERIOD_TYPES.find((p) => p.value === product.period)?.label}</div></div>
            <div><span className="text-muted-foreground">有效期</span><div className="text-foreground mt-0.5">{product.validDays > 0 ? `${product.validDays}天` : "永久"}</div></div>
          </div>
        </div>
      )}

      {/* Bundles */}
      {bundles.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">包含此商品的套餐 ({bundles.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {bundles.map((b) => (
              <Link key={b.id} to={`/entitlement/package/detail/${b.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-[13px]">{b.name}</span>
                  <span className={STATUS_MAP[b.status].className}>{STATUS_MAP[b.status].label}</span>
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">{b.price > 0 ? `¥${b.price}/月` : "免费"} · {b.items.length}个商品</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
