import { useParams, useNavigate, Link } from "react-router-dom";
import { ruleData, capabilityData, skuData, packageData, STATUS_MAP, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function RuleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rule = ruleData.find((r) => r.id === id);
  if (!rule) return <div className="p-10 text-center text-muted-foreground">规则不存在</div>;

  const cap = capabilityData.find((c) => c.id === rule.capabilityId);
  const skus = skuData.filter((s) => s.ruleId === rule.id);
  const pkgs = packageData.filter((p) => p.skuIds?.some((sid) => skus.some((s) => s.id === sid)));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/rule")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 权益规则管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{rule.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{rule.name}</h2>
          <span className={STATUS_MAP[rule.status].className}>{STATUS_MAP[rule.status].label}</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">规则编码</span><div className="font-mono text-foreground mt-0.5">{rule.code}</div></div>
          <div><span className="text-muted-foreground">关联能力</span><div className="mt-0.5"><Link to={`/entitlement/capability/detail/${rule.capabilityId}`} className="text-primary hover:underline inline-flex items-center gap-1">{rule.capabilityName} <ExternalLink className="h-3 w-3" /></Link></div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="text-foreground mt-0.5">{rule.appName}</div></div>
          <div><span className="text-muted-foreground">额度</span><div className="text-foreground font-medium mt-0.5">{rule.quota.toLocaleString()} {cap?.unit || ""}</div></div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px] mt-4">
          <div><span className="text-muted-foreground">周期</span><div className="text-foreground mt-0.5">{PERIOD_TYPES.find((p) => p.value === rule.periodType)?.label}</div></div>
          <div><span className="text-muted-foreground">发放方式</span><div className="text-foreground mt-0.5">{GRANT_TYPES.find((g) => g.value === rule.grantType)?.label}</div></div>
          <div><span className="text-muted-foreground">过期策略</span><div className="text-foreground mt-0.5">{EXPIRE_POLICIES.find((e) => e.value === rule.expirePolicy)?.label}</div></div>
          <div><span className="text-muted-foreground">可累积</span><div className={`mt-0.5 font-medium ${rule.isCumulative ? "text-primary" : "text-muted-foreground"}`}>{rule.isCumulative ? "是" : "否"}</div></div>
        </div>
        {rule.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{rule.description}</p>}
      </div>

      {/* Related SKUs */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">引用此规则的商品 ({skus.length})</h3>
        <div className="space-y-2">
          {skus.map((s) => (
            <Link key={s.id} to={`/entitlement/sku/detail/${s.id}`} className="flex items-center justify-between px-4 py-3 rounded-lg border hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground text-[13px]">{s.name}</span>
                <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{s.code}</code>
              </div>
              <span className={`font-medium text-[13px] ${s.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{s.price > 0 ? `¥${s.price}` : "¥0"}</span>
            </Link>
          ))}
          {skus.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">暂无商品引用此规则</p>}
        </div>
      </div>

      {/* Related Packages */}
      {pkgs.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">涉及的权益包 ({pkgs.length})</h3>
          <div className="flex flex-wrap gap-2">
            {pkgs.map((p) => (
              <Link key={p.id} to={`/entitlement/package/detail/${p.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-primary/40 text-[12px]">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="text-muted-foreground">{p.price > 0 ? `¥${p.price}/月` : "免费"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
