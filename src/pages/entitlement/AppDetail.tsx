import { useParams, useNavigate, Link } from "react-router-dom";
import { appData, capabilityData, ruleData, skuData, bundleData, STATUS_MAP, DATA_TYPES, PERIOD_TYPES, GRANT_TYPES, getCapabilitiesByApp, getRulesByApp } from "@/data/entitlement";
import { ArrowLeft } from "lucide-react";

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = appData.find((a) => a.id === id);
  if (!app) return <div className="p-10 text-center text-muted-foreground">应用不存在</div>;

  const caps = getCapabilitiesByApp(app.id);
  const rules = getRulesByApp(app.id);
  const skus = skuData.filter((s) => s.appId === app.id);
  const bundles = bundleData.filter((b) => b.appId === app.id);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/app")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 应用管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{app.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div><h2 className="text-[16px] font-semibold text-foreground">{app.name}</h2><p className="text-[13px] text-muted-foreground mt-0.5">{app.description}</p></div>
          <span className={STATUS_MAP[app.status].className}>{STATUS_MAP[app.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">应用编码</span><div className="font-mono text-foreground mt-0.5">{app.code}</div></div>
          <div><span className="text-muted-foreground">能力</span><div className="text-primary font-medium mt-0.5">{caps.length}个</div></div>
          <div><span className="text-muted-foreground">规则</span><div className="text-primary font-medium mt-0.5">{rules.length}条</div></div>
          <div><span className="text-muted-foreground">商品SKU</span><div className="text-primary font-medium mt-0.5">{skus.length}个</div></div>
          <div><span className="text-muted-foreground">套餐</span><div className="text-primary font-medium mt-0.5">{bundles.length}个</div></div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">能力 ({caps.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">能力名称</th>
              <th className="text-left py-2 font-medium">编码</th>
              <th className="text-left py-2 font-medium">数据类型</th>
              <th className="text-left py-2 font-medium">单位</th>
              <th className="text-center py-2 font-medium">规则数</th>
              <th className="text-left py-2 font-medium">状态</th>
            </tr></thead>
            <tbody>
              {caps.map((c) => {
                const ruleCount = ruleData.filter((r) => r.capabilityId === c.id).length;
                return (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/capability/detail/${c.id}`} className="text-primary hover:underline font-medium">{c.name}</Link></td>
                    <td className="py-2"><code className="text-[11px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono">{c.code}</code></td>
                    <td className="py-2 text-muted-foreground">{DATA_TYPES.find((t) => t.value === c.dataType)?.label.split("（")[0]}</td>
                    <td className="py-2 text-muted-foreground">{c.unit}</td>
                    <td className="py-2 text-center"><span className={ruleCount > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{ruleCount}</span></td>
                    <td className="py-2"><span className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bundles */}
      {bundles.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">套餐 ({bundles.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {bundles.map((b) => (
              <Link key={b.id} to={`/entitlement/package/detail/${b.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground text-[13px]">{b.name}</span>
                  <span className={STATUS_MAP[b.status].className}>{STATUS_MAP[b.status].label}</span>
                </div>
                <div className="text-[12px] text-muted-foreground">{b.price > 0 ? `¥${b.price}/月` : "免费"} · {b.items.length}个商品</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
