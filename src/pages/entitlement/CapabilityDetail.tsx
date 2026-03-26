import { useParams, useNavigate, Link } from "react-router-dom";
import { capabilityData, appData, ruleData, skuData, DATA_TYPES, STATUS_MAP, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES, getApp } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function CapabilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cap = capabilityData.find((c) => c.id === id);
  if (!cap) return <div className="p-10 text-center text-muted-foreground">能力不存在</div>;

  const app = getApp(cap.appId);
  const rules = ruleData.filter((r) => r.capabilityId === cap.id);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/capability")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 能力管理</button>
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
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline inline-flex items-center gap-1">{app.name} <ExternalLink className="h-3 w-3" /></Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">数据类型</span><div className="text-foreground mt-0.5">{DATA_TYPES.find((t) => t.value === cap.dataType)?.label}</div></div>
          <div><span className="text-muted-foreground">计量单位</span><div className="text-foreground mt-0.5">{cap.unit}</div></div>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px] mt-4 pt-4 border-t">
          <div><span className="text-muted-foreground">默认消耗</span><div className="text-foreground font-medium mt-0.5">{cap.consumePerUse} {cap.unit}/次</div></div>
          <div><span className="text-muted-foreground">调用接口</span><div className="font-mono text-[12px] text-muted-foreground mt-0.5">{cap.apiPath || "—"}</div></div>
          <div><span className="text-muted-foreground">关联规则数</span><div className="text-primary font-medium mt-0.5">{rules.length}条</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{cap.createdAt}</div></div>
        </div>
      </div>

      {/* Rules */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">权益规则 ({rules.length}) <span className="text-[12px] text-muted-foreground font-normal">— 基于此能力的额度配置</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">规则名称</th>
              <th className="text-right py-2 font-medium">额度</th>
              <th className="text-left py-2 font-medium">周期</th>
              <th className="text-left py-2 font-medium">发放方式</th>
              <th className="text-left py-2 font-medium">累积</th>
              <th className="text-left py-2 font-medium">过期策略</th>
              <th className="text-center py-2 font-medium">引用SKU</th>
              <th className="text-left py-2 font-medium">状态</th>
            </tr></thead>
            <tbody>
              {rules.map((r) => {
                const skuCount = skuData.filter((s) => s.ruleIds.includes(r.id)).length;
                return (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/rule/detail/${r.id}`} className="text-primary hover:underline font-medium">{r.name}</Link></td>
                    <td className="py-2 text-right font-medium">{r.quota.toLocaleString()}</td>
                    <td className="py-2 text-muted-foreground">{PERIOD_TYPES.find((p) => p.value === r.periodType)?.label}{r.periodValue > 0 ? `·${r.periodValue}` : ""}</td>
                    <td className="py-2 text-muted-foreground">{GRANT_TYPES.find((g) => g.value === r.grantType)?.label}</td>
                    <td className="py-2">{r.isCumulative ? <span className="text-primary">是</span> : <span className="text-muted-foreground">否</span>}</td>
                    <td className="py-2 text-muted-foreground">{EXPIRE_POLICIES.find((e) => e.value === r.expirePolicy)?.label}</td>
                    <td className="py-2 text-center"><span className={skuCount > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{skuCount}</span></td>
                    <td className="py-2"><span className={STATUS_MAP[r.status].className}>{STATUS_MAP[r.status].label}</span></td>
                  </tr>
                );
              })}
              {rules.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">暂无权益规则</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
