import { useParams, useNavigate, Link } from "react-router-dom";
import { entitlementProductData, capabilityData, appData, skuData, bundleData, meteringRuleData, STATUS_MAP, PERIOD_TYPES, BILLING_CYCLES } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function RuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = entitlementProductData.find((p) => p.id === id);
  if (!product) return <div className="p-10 text-center text-muted-foreground">权益产品不存在</div>;

  const cap = capabilityData.find((c) => c.id === product.capabilityId);
  const rule = meteringRuleData.find((r) => r.id === product.meteringRuleId);
  const skus = skuData.filter((s) => s.productId === product.id);
  const bundles = bundleData.filter((b) => b.items.some((i) => skus.some((s) => s.id === i.skuId)));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/rule")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 权益产品管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{product.name}</h2>
          <span className={STATUS_MAP[product.status].className}>{STATUS_MAP[product.status].label}</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">产品编码</span><div className="font-mono text-foreground mt-0.5">{product.code}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5"><Link to={`/entitlement/app/detail/${product.appId}`} className="text-primary hover:underline inline-flex items-center gap-1">{product.appName} <ExternalLink className="h-3 w-3" /></Link></div></div>
          <div><span className="text-muted-foreground">关联能力</span><div className="mt-0.5"><Link to={`/entitlement/capability/detail/${product.capabilityId}`} className="text-primary hover:underline inline-flex items-center gap-1">{product.capabilityName} <ExternalLink className="h-3 w-3" /></Link></div></div>
          <div><span className="text-muted-foreground">计量规则</span><div className="text-foreground mt-0.5">{rule?.name} ({rule?.unit})</div></div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px] mt-4 pt-4 border-t">
          <div><span className="text-muted-foreground">额度</span><div className="text-foreground font-medium mt-0.5">{product.quota.toLocaleString()} {rule?.unit}</div></div>
          <div><span className="text-muted-foreground">周期</span><div className="text-foreground mt-0.5">{PERIOD_TYPES.find((p) => p.value === product.period)?.label}</div></div>
          <div><span className="text-muted-foreground">有效期</span><div className="text-foreground mt-0.5">{product.validDays > 0 ? `${product.validDays}天` : "永久"}</div></div>
          <div><span className="text-muted-foreground">引用商品数</span><div className={`font-medium mt-0.5 ${skus.length > 0 ? "text-primary" : "text-muted-foreground"}`}>{skus.length}</div></div>
        </div>
        {product.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{product.description}</p>}
      </div>

      {/* Relationship chain */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">关联关系链</h3>
        <div className="flex items-center gap-3 text-[13px]">
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">应用</div>
            <Link to={`/entitlement/app/detail/${product.appId}`} className="text-primary hover:underline font-medium">{product.appName}</Link>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">能力</div>
            <Link to={`/entitlement/capability/detail/${product.capabilityId}`} className="text-primary hover:underline font-medium">{product.capabilityName}</Link>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border border-primary/40 bg-primary/5 text-center">
            <div className="text-[11px] text-primary mb-1">当前产品</div>
            <span className="font-semibold text-foreground">{product.name}</span>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">商品SKU</div>
            <span className="text-primary font-medium">{skus.length}个</span>
          </div>
        </div>
      </div>

      {/* Referenced SKUs */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">引用此产品的商品 ({skus.length})</h3>
        <div className="space-y-2">
          {skus.map((s) => (
            <Link key={s.id} to={`/entitlement/sku/detail/${s.id}`} className="flex items-center justify-between px-4 py-3 rounded-lg border hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground text-[13px]">{s.name}</span>
                <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{s.code}</code>
                <span className="text-[12px] text-muted-foreground">{BILLING_CYCLES.find((b) => b.value === s.billingCycle)?.label}</span>
              </div>
              <span className={`font-medium text-[13px] ${s.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{s.price > 0 ? `¥${s.price}` : "¥0"}</span>
            </Link>
          ))}
          {skus.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">暂无商品引用此产品</p>}
        </div>
      </div>

      {/* Related Bundles */}
      {bundles.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">涉及的套餐 ({bundles.length})</h3>
          <div className="flex flex-wrap gap-2">
            {bundles.map((b) => (
              <Link key={b.id} to={`/entitlement/package/detail/${b.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-primary/40 text-[12px]">
                <span className="font-medium text-foreground">{b.name}</span>
                <span className="text-muted-foreground">{b.price > 0 ? `¥${b.price}/月` : "免费"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
