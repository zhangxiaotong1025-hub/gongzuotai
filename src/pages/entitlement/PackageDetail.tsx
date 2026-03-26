import { useParams, useNavigate, Link } from "react-router-dom";
import { packageData, skuData, ruleData, capabilityData, STATUS_MAP, BILLING_CYCLES } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = packageData.find((p) => p.id === id);
  if (!pkg) return <div className="p-10 text-center text-muted-foreground">权益包不存在</div>;

  const cycle = BILLING_CYCLES.find((b) => b.value === pkg.billingCycle)?.label || pkg.billingCycle;

  // Build enriched SKU list with full chain
  const enrichedSkus = pkg.skuIds.map((skuId) => {
    const sku = skuData.find((s) => s.id === skuId);
    const rule = sku ? ruleData.find((r) => r.id === sku.ruleId) : null;
    const cap = rule ? capabilityData.find((c) => c.id === rule.capabilityId) : null;
    return { sku, rule, cap, isCore: pkg.skuList.find((s) => s.id === skuId)?.isCore || false };
  }).filter((e) => e.sku);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/package")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 权益包</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{pkg.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{pkg.name}</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">{pkg.description}</p>
          </div>
          <span className={STATUS_MAP[pkg.status].className}>{STATUS_MAP[pkg.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">编码</span><div className="font-mono text-foreground mt-0.5">{pkg.code}</div></div>
          <div><span className="text-muted-foreground">适用应用</span><div className="mt-0.5"><Link to={`/entitlement/app/detail/${pkg.appId}`} className="text-primary hover:underline inline-flex items-center gap-1">{pkg.appName} <ExternalLink className="h-3 w-3" /></Link></div></div>
          <div><span className="text-muted-foreground">价格</span><div className="font-medium text-foreground mt-0.5">{pkg.price > 0 ? `¥${pkg.price}/${cycle}` : "免费"}{pkg.originalPrice ? ` (原¥${pkg.originalPrice})` : ""}</div></div>
          <div><span className="text-muted-foreground">包含商品</span><div className="text-primary font-medium mt-0.5">{pkg.skuList.length}个</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{pkg.createdAt}</div></div>
        </div>
      </div>

      {/* SKU detail table with full chain */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">包含商品明细 ({enrichedSkus.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">商品名称</th>
              <th className="text-left py-2 font-medium">关联规则</th>
              <th className="text-left py-2 font-medium">能力</th>
              <th className="text-right py-2 font-medium">额度</th>
              <th className="text-left py-2 font-medium">周期</th>
              <th className="text-right py-2 font-medium">价格</th>
              <th className="text-left py-2 font-medium">操作</th>
            </tr></thead>
            <tbody>
              {enrichedSkus.map(({ sku, rule, cap, isCore }) => (
                <tr key={sku!.id} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      {isCore && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                      <span className="font-medium text-foreground">{sku!.name}</span>
                    </div>
                  </td>
                  <td className="py-2"><Link to={`/entitlement/rule/detail/${rule?.id}`} className="text-primary hover:underline text-[12px]">{rule?.name}</Link></td>
                  <td className="py-2"><Link to={`/entitlement/capability/detail/${cap?.id}`} className="text-muted-foreground hover:text-primary text-[12px]">{cap?.name}</Link></td>
                  <td className="py-2 text-right font-medium">{rule?.quota.toLocaleString()} {cap?.unit}</td>
                  <td className="py-2 text-muted-foreground">{rule?.periodType === "DAY" ? "天" : rule?.periodType === "PERMANENT" ? "永久" : rule?.periodType}</td>
                  <td className="py-2 text-right">{sku!.price > 0 ? `¥${sku!.price}` : "—"}</td>
                  <td className="py-2"><Link to={`/entitlement/sku/detail/${sku!.id}`} className="text-primary hover:underline text-[12px]">查看</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
