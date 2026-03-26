import { useParams, useNavigate, Link } from "react-router-dom";
import { bundleData, skuData, entitlementProductData, capabilityData, STATUS_MAP, BILLING_CYCLES, PERIOD_TYPES } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bundle = bundleData.find((b) => b.id === id);
  if (!bundle) return <div className="p-10 text-center text-muted-foreground">套餐不存在</div>;

  const cycle = BILLING_CYCLES.find((b) => b.value === bundle.billingCycle)?.label || bundle.billingCycle;

  // Enrich items with full chain
  const enrichedItems = bundle.items.map((item) => {
    const sku = skuData.find((s) => s.id === item.skuId);
    const rule = sku ? entitlementProductData.find((p) => p.id === sku.productId) : null;
    const cap = rule ? capabilityData.find((c) => c.id === rule.capabilityId) : null;
    return { ...item, sku, rule, cap };
  });

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/package")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 商品套餐</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{bundle.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div><h2 className="text-[16px] font-semibold text-foreground">{bundle.name}</h2><p className="text-[13px] text-muted-foreground mt-0.5">{bundle.description}</p></div>
          <span className={STATUS_MAP[bundle.status].className}>{STATUS_MAP[bundle.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">编码</span><div className="font-mono text-foreground mt-0.5">{bundle.code}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5"><Link to={`/entitlement/app/detail/${bundle.appId}`} className="text-primary hover:underline inline-flex items-center gap-1">{bundle.appName} <ExternalLink className="h-3 w-3" /></Link></div></div>
          <div><span className="text-muted-foreground">价格</span><div className="font-medium text-foreground mt-0.5">{bundle.price > 0 ? `¥${bundle.price}/${cycle}` : "免费"}{bundle.originalPrice ? ` (原¥${bundle.originalPrice})` : ""}</div></div>
          <div><span className="text-muted-foreground">包含商品</span><div className="text-primary font-medium mt-0.5">{bundle.items.length}个</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{bundle.createdAt}</div></div>
        </div>
      </div>

      {/* Items with full relationship chain */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">套餐明细 ({enrichedItems.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">商品名称</th>
              <th className="text-center py-2 font-medium">数量</th>
              <th className="text-left py-2 font-medium">权益规则</th>
              <th className="text-left py-2 font-medium">能力</th>
              <th className="text-right py-2 font-medium">额度</th>
              <th className="text-left py-2 font-medium">周期</th>
              <th className="text-right py-2 font-medium">单价</th>
              <th className="text-left py-2 font-medium">操作</th>
            </tr></thead>
            <tbody>
              {enrichedItems.map(({ skuId, skuName, quantity, sku, rule, cap }) => (
                <tr key={skuId} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2 font-medium text-foreground">{skuName}</td>
                  <td className="py-2 text-center">{quantity > 1 ? <span className="text-primary font-medium">×{quantity}</span> : "1"}</td>
                  <td className="py-2">{rule ? <Link to={`/entitlement/rule/detail/${rule.id}`} className="text-primary hover:underline text-[12px]">{rule.name}</Link> : "—"}</td>
                  <td className="py-2">{cap ? <Link to={`/entitlement/capability/detail/${cap.id}`} className="text-muted-foreground hover:text-primary text-[12px]">{cap.name}</Link> : "—"}</td>
                  <td className="py-2 text-right font-medium">{rule ? `${rule.quota.toLocaleString()}` : "—"}</td>
                  <td className="py-2 text-muted-foreground">{rule ? PERIOD_TYPES.find((p) => p.value === rule.period)?.label : "—"}</td>
                  <td className="py-2 text-right">{sku && sku.price > 0 ? `¥${sku.price}` : "—"}</td>
                  <td className="py-2"><Link to={`/entitlement/sku/detail/${skuId}`} className="text-primary hover:underline text-[12px]">查看</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
