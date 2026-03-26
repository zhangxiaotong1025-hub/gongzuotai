import { useParams, useNavigate, Link } from "react-router-dom";
import { appData, capabilityData, ruleData, skuData, packageData, STATUS_MAP, DATA_TYPE_MAP } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = appData.find((a) => a.id === id);
  if (!app) return <div className="p-10 text-center text-muted-foreground">应用不存在</div>;

  const caps = capabilityData.filter((c) => c.appId === app.id);
  const rules = ruleData.filter((r) => caps.some((c) => c.id === r.capabilityId));
  const skus = skuData.filter((s) => rules.some((r) => r.id === s.ruleId));
  const pkgs = packageData.filter((p) => p.appId === app.id);

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/app")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 应用管理</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{app.name}</span>
      </div>

      {/* Basic info */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">{app.name}</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">{app.description}</p>
          </div>
          <span className={STATUS_MAP[app.status].className}>{STATUS_MAP[app.status].label}</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">应用编码</span><div className="font-mono text-foreground mt-0.5">{app.code}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{app.createdAt}</div></div>
          <div><span className="text-muted-foreground">更新时间</span><div className="text-foreground mt-0.5">{app.updatedAt}</div></div>
          <div><span className="text-muted-foreground">能力数</span><div className="text-primary font-medium mt-0.5">{caps.length}个</div></div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联能力 ({caps.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">能力名称</th>
              <th className="text-left py-2 font-medium">编码</th>
              <th className="text-left py-2 font-medium">类型</th>
              <th className="text-left py-2 font-medium">单位</th>
              <th className="text-center py-2 font-medium">规则数</th>
              <th className="text-left py-2 font-medium">状态</th>
              <th className="text-left py-2 font-medium">操作</th>
            </tr></thead>
            <tbody>
              {caps.map((c) => {
                const ruleCount = ruleData.filter((r) => r.capabilityId === c.id).length;
                return (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2 font-medium text-foreground">{c.name}</td>
                    <td className="py-2"><code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{c.code}</code></td>
                    <td className="py-2"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{DATA_TYPE_MAP[c.dataType]}</span></td>
                    <td className="py-2 text-muted-foreground">{c.unit}</td>
                    <td className="py-2 text-center text-primary font-medium">{ruleCount}</td>
                    <td className="py-2"><span className={STATUS_MAP[c.status].className}>{STATUS_MAP[c.status].label}</span></td>
                    <td className="py-2"><Link to={`/entitlement/capability/detail/${c.id}`} className="text-primary hover:underline text-[12px] inline-flex items-center gap-1">查看 <ExternalLink className="h-3 w-3" /></Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Related Rules summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">关联规则 ({rules.length})</h3>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {rules.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-[12px] py-1.5 px-2 rounded hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">{r.name}</span>
                  <span className="text-muted-foreground">← {r.capabilityName}</span>
                </div>
                <Link to={`/entitlement/rule/detail/${r.id}`} className="text-primary hover:underline">查看</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">关联商品 ({skus.length})</h3>
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {skus.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-[12px] py-1.5 px-2 rounded hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">{s.name}</span>
                  <span className="text-muted-foreground">← {s.ruleName}</span>
                </div>
                <Link to={`/entitlement/sku/detail/${s.id}`} className="text-primary hover:underline">查看</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联权益包 ({pkgs.length})</h3>
        <div className="grid grid-cols-3 gap-3">
          {pkgs.map((p) => (
            <Link key={p.id} to={`/entitlement/package/detail/${p.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-[13px]">{p.name}</span>
                <span className={STATUS_MAP[p.status].className}>{STATUS_MAP[p.status].label}</span>
              </div>
              <div className="text-[12px] text-muted-foreground">
                {p.price > 0 ? `¥${p.price}/月` : "免费"} · {p.skuList.length}个商品
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {p.skuList.slice(0, 4).map((s) => (
                  <span key={s.id} className={`text-[11px] px-1.5 py-0.5 rounded ${s.isCore ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{s.name}</span>
                ))}
                {p.skuList.length > 4 && <span className="text-[11px] text-muted-foreground">+{p.skuList.length - 4}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
