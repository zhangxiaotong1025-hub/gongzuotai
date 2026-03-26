import { useParams, useNavigate, Link } from "react-router-dom";
import { capabilityData, appData, entitlementProductData, meteringRuleData, skuData, STATUS_MAP, PERIOD_TYPES, getAppNames } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function CapabilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cap = capabilityData.find((c) => c.id === id);
  if (!cap) return <div className="p-10 text-center text-muted-foreground">能力不存在</div>;

  const apps = cap.appIds.map((aid) => appData.find((a) => a.id === aid)).filter(Boolean);
  const rules = meteringRuleData.filter((r) => r.capabilityId === cap.id);
  const products = entitlementProductData.filter((p) => p.capabilityId === cap.id);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/capability")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 权益能力管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{cap.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div><h2 className="text-[16px] font-semibold text-foreground">{cap.name}</h2><p className="text-[13px] text-muted-foreground mt-0.5">{cap.description}</p></div>
          <span className={STATUS_MAP[cap.status].className}>{STATUS_MAP[cap.status].label}</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">能力编码</span><div className="font-mono text-foreground mt-0.5">{cap.code}</div></div>
          <div><span className="text-muted-foreground">能力类型</span><div className="text-foreground mt-0.5">{cap.type}</div></div>
          <div>
            <span className="text-muted-foreground">适用应用（{apps.length}个）</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {apps.map((a) => a && <Link key={a.id} to={`/entitlement/app/detail/${a.id}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-primary/10 text-primary hover:bg-primary/20">{a.name}</Link>)}
            </div>
          </div>
          <div><span className="text-muted-foreground">计量规则</span><div className="text-primary font-medium mt-0.5">{rules.length}条</div></div>
        </div>
      </div>

      {/* Metering Rules */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">计量规则 ({rules.length})</h3>
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3 rounded-lg border">
              <div className="flex items-center gap-3 text-[13px]">
                <span className="font-medium text-foreground">{r.name}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{r.meterType}</span>
                <span className="text-muted-foreground">单位: {r.unit}</span>
              </div>
              <span className={STATUS_MAP[r.status].className}>{STATUS_MAP[r.status].label}</span>
            </div>
          ))}
          {rules.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">暂无计量规则</p>}
        </div>
      </div>

      {/* Entitlement Products */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">权益产品 ({products.length}) <span className="text-[12px] text-muted-foreground font-normal">— 基于此能力的额度配置</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">产品名称</th>
              <th className="text-left py-2 font-medium">所属应用</th>
              <th className="text-right py-2 font-medium">额度</th>
              <th className="text-left py-2 font-medium">周期</th>
              <th className="text-center py-2 font-medium">引用商品</th>
              <th className="text-left py-2 font-medium">状态</th>
            </tr></thead>
            <tbody>
              {products.map((p) => {
                const refCount = skuData.filter((s) => s.productId === p.id).length;
                return (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2 font-medium text-foreground">{p.name}</td>
                    <td className="py-2"><Link to={`/entitlement/app/detail/${p.appId}`} className="text-primary hover:underline text-[12px]">{p.appName}</Link></td>
                    <td className="py-2 text-right font-medium">{p.quota.toLocaleString()}</td>
                    <td className="py-2 text-muted-foreground">{PERIOD_TYPES.find((t) => t.value === p.period)?.label}</td>
                    <td className="py-2 text-center"><span className={refCount > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{refCount}</span></td>
                    <td className="py-2"><span className={STATUS_MAP[p.status].className}>{STATUS_MAP[p.status].label}</span></td>
                  </tr>
                );
              })}
              {products.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">暂无权益产品</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
