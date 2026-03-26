import { useParams, useNavigate, Link } from "react-router-dom";
import { skuData, ruleData, capabilityData, packageData, STATUS_MAP } from "@/data/entitlement";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function SkuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sku = skuData.find((s) => s.id === id);
  if (!sku) return <div className="p-10 text-center text-muted-foreground">商品不存在</div>;

  const rule = ruleData.find((r) => r.id === sku.ruleId);
  const cap = rule ? capabilityData.find((c) => c.id === rule.capabilityId) : null;
  const pkgs = packageData.filter((p) => p.skuIds?.includes(sku.id));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => navigate("/entitlement/sku")} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ArrowLeft className="h-3.5 w-3.5" /> 权益商品</button>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground font-medium">{sku.name}</span>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{sku.name}</h2>
          <span className={STATUS_MAP[sku.salesStatus].className}>{STATUS_MAP[sku.salesStatus].label}</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">商品编码</span><div className="font-mono text-foreground mt-0.5">{sku.code}</div></div>
          <div><span className="text-muted-foreground">价格</span><div className={`font-medium mt-0.5 ${sku.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{sku.price > 0 ? `¥${sku.price}` : "¥0"}</div></div>
          <div><span className="text-muted-foreground">排序</span><div className="text-foreground mt-0.5">{sku.sortOrder}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{sku.createdAt}</div></div>
        </div>
        {sku.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{sku.description}</p>}
      </div>

      {/* Relationship chain */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">关联关系链</h3>
        <div className="flex items-center gap-3 text-[13px]">
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">应用</div>
            <Link to={`/entitlement/app/detail/${cap?.appId}`} className="text-primary hover:underline font-medium">{sku.appName}</Link>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">能力</div>
            <Link to={`/entitlement/capability/detail/${cap?.id}`} className="text-primary hover:underline font-medium">{sku.capabilityName}</Link>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border bg-muted/30 text-center">
            <div className="text-[11px] text-muted-foreground mb-1">规则</div>
            <Link to={`/entitlement/rule/detail/${sku.ruleId}`} className="text-primary hover:underline font-medium">{sku.ruleName}</Link>
          </div>
          <span className="text-muted-foreground">→</span>
          <div className="px-4 py-3 rounded-lg border border-primary/40 bg-primary/5 text-center">
            <div className="text-[11px] text-primary mb-1">当前商品</div>
            <span className="font-semibold text-foreground">{sku.name}</span>
          </div>
        </div>
      </div>

      {/* Packages */}
      {pkgs.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">包含此商品的权益包 ({pkgs.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {pkgs.map((p) => (
              <Link key={p.id} to={`/entitlement/package/detail/${p.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-[13px]">{p.name}</span>
                  <span className={STATUS_MAP[p.status].className}>{STATUS_MAP[p.status].label}</span>
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">{p.price > 0 ? `¥${p.price}/月` : "免费"} · {p.skuList.length}个商品</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
