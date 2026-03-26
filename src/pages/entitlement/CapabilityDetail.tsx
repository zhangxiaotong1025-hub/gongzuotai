import { useParams, useNavigate, Link } from "react-router-dom";
import { capabilityData, appData, ruleData, skuData, STATUS_MAP, DATA_TYPE_MAP } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function CapabilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cap = capabilityData.find((c) => c.id === id);
  if (!cap) return <div className="p-10 text-center text-muted-foreground">能力不存在</div>;

  const app = appData.find((a) => a.id === cap.appId);
  const rules = ruleData.filter((r) => r.capabilityId === cap.id);
  const skus = skuData.filter((s) => rules.some((r) => r.id === s.ruleId));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/capability")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 权益能力管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{cap.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{cap.name}</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">{cap.description}</p>
          </div>
          <span className={STATUS_MAP[cap.status].className}>{STATUS_MAP[cap.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">能力编码</span><div className="font-mono text-foreground mt-0.5">{cap.code}</div></div>
          <div>
            <span className="text-muted-foreground">所属应用</span>
            <div className="mt-0.5"><Link to={`/entitlement/app/detail/${cap.appId}`} className="text-primary hover:underline inline-flex items-center gap-1">{app?.name} <ExternalLink className="h-3 w-3" /></Link></div>
          </div>
          <div><span className="text-muted-foreground">数据类型</span><div className="text-foreground mt-0.5">{DATA_TYPE_MAP[cap.dataType]}</div></div>
          <div><span className="text-muted-foreground">计量单位</span><div className="text-foreground mt-0.5">{cap.unit}</div></div>
          <div><span className="text-muted-foreground">接口路径</span><div className="font-mono text-foreground mt-0.5 text-[12px]">{cap.apiPath}</div></div>
        </div>
      </div>

      {/* Rules */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">基于此能力的规则 ({rules.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">规则名称</th>
              <th className="text-left py-2 font-medium">编码</th>
              <th className="text-right py-2 font-medium">额度</th>
              <th className="text-left py-2 font-medium">周期</th>
              <th className="text-left py-2 font-medium">发放方式</th>
              <th className="text-left py-2 font-medium">状态</th>
              <th className="text-left py-2 font-medium">操作</th>
            </tr></thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2 font-medium text-foreground">{r.name}</td>
                  <td className="py-2"><code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{r.code}</code></td>
                  <td className="py-2 text-right font-medium">{r.quota.toLocaleString()}</td>
                  <td className="py-2 text-muted-foreground">{r.periodType === "DAY" ? "天" : r.periodType === "PERMANENT" ? "永久" : r.periodType}</td>
                  <td className="py-2 text-muted-foreground">{r.grantType === "DAILY_REFRESH" ? "每日刷新" : r.grantType === "ONE_TIME" ? "一次性" : r.grantType}</td>
                  <td className="py-2"><span className={STATUS_MAP[r.status].className}>{STATUS_MAP[r.status].label}</span></td>
                  <td className="py-2"><Link to={`/entitlement/rule/detail/${r.id}`} className="text-primary hover:underline text-[12px]">查看</Link></td>
                </tr>
              ))}
              {rules.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">暂无关联规则</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related SKUs */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联商品 ({skus.length})</h3>
        <div className="flex flex-wrap gap-2">
          {skus.map((s) => (
            <Link key={s.id} to={`/entitlement/sku/detail/${s.id}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:border-primary/40 hover:bg-primary/5 transition-all text-[12px]">
              <span className="font-medium text-foreground">{s.name}</span>
              <span className="text-muted-foreground">← {s.ruleName}</span>
              {s.price > 0 && <span className="text-primary font-medium">¥{s.price}</span>}
            </Link>
          ))}
          {skus.length === 0 && <span className="text-[13px] text-muted-foreground">暂无关联商品</span>}
        </div>
      </div>
    </div>
  );
}
