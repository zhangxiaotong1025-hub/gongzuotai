import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productData, skuData, EXCHANGE_TYPES, STATUS_MAP, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES, getCapability, getApp, getRulesByProduct } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { ProductDialog } from "./dialogs/ProductDialog";
import { toast } from "sonner";
import { Coins, Gift, Sparkles, Package } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idx = productData.findIndex((p) => p.id === id);
  const product = idx >= 0 ? productData[idx] : null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitial, setDialogInitial] = useState(product);

  if (!product) return <div className="p-10 text-center text-muted-foreground">权益产品不存在</div>;

  const rules = getRulesByProduct(product.id);
  const app = getApp(product.appId);
  const linkedSkus = skuData.filter((s) => (s as any).productId === product.id || s.ruleIds.some((rid) => product.ruleIds.includes(rid)));
  const exType = EXCHANGE_TYPES.find((e) => e.value === product.exchangeType);
  const prev = idx > 0 ? productData[idx - 1] : null;
  const next = idx < productData.length - 1 ? productData[idx + 1] : null;

  const ExIcon = product.exchangeType === "credit" ? Coins : product.exchangeType === "free" ? Gift : Package;

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="权益产品"
        backPath="/entitlement/product"
        currentName={product.name}
        prevPath={prev ? `/entitlement/product/detail/${prev.id}` : null}
        nextPath={next ? `/entitlement/product/detail/${next.id}` : null}
        onEdit={() => { setDialogInitial(product); setDialogOpen(true); }}
        onCopy={() => { setDialogInitial({ ...product, id: "", name: `${product.name}（副本）`, code: `${product.code}_COPY` }); setDialogOpen(true); }}
        statusToggle={{
          currentActive: product.status === "active",
          activeLabel: "启用",
          inactiveLabel: "停用",
          onToggle: () => toast.info(product.status === "active" ? "已停用" : "已启用"),
        }}
      />

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><ExIcon className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-[16px] font-semibold text-foreground">{product.name}</h2>
              <code className="text-[12px] text-muted-foreground font-mono">{product.code}</code>
            </div>
          </div>
          <span className={STATUS_MAP[product.status].className}>{STATUS_MAP[product.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline">{app.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">交易方式</span><div className="mt-0.5">{exType ? <span className={exType.className}>{exType.label}</span> : "—"}</div></div>
          {product.exchangeType === "credit" && (
            <div><span className="text-muted-foreground">所需积分</span><div className="font-medium text-foreground mt-0.5">{product.creditPrice?.toLocaleString() || 0}</div></div>
          )}
          <div><span className="text-muted-foreground">每人限领</span><div className="text-foreground mt-0.5">{product.limitPerUser && product.limitPerUser > 0 ? `${product.limitPerUser} 次` : "不限"}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{product.createdAt}</div></div>
        </div>
        {product.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t leading-relaxed">{product.description}</p>}
        {exType && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-[12px] text-muted-foreground leading-relaxed">{exType.desc}</div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联权益规则 ({rules.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">规则名称</th>
              <th className="text-left py-2 font-medium">能力</th>
              <th className="text-right py-2 font-medium">额度</th>
              <th className="text-left py-2 font-medium">周期</th>
              <th className="text-left py-2 font-medium">发放方式</th>
              <th className="text-left py-2 font-medium">累积</th>
              <th className="text-left py-2 font-medium">过期策略</th>
            </tr></thead>
            <tbody>
              {rules.map((r) => {
                const cap = getCapability(r.capabilityId);
                return (
                  <tr key={r.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/rule/detail/${r.id}`} className="text-primary hover:underline font-medium">{r.name}</Link></td>
                    <td className="py-2">{cap ? <Link to={`/entitlement/capability/detail/${cap.id}`} className="text-muted-foreground hover:text-primary">{cap.name}</Link> : "—"}</td>
                    <td className="py-2 text-right font-medium">{r.quota.toLocaleString()} {cap?.unit || ""}</td>
                    <td className="py-2 text-muted-foreground">{PERIOD_TYPES.find((p) => p.value === r.periodType)?.label}{r.periodValue > 0 ? `·${r.periodValue}` : ""}</td>
                    <td className="py-2 text-muted-foreground">{GRANT_TYPES.find((g) => g.value === r.grantType)?.label}</td>
                    <td className="py-2">{r.isCumulative ? <span className="text-primary font-medium">是</span> : <span className="text-muted-foreground">否</span>}</td>
                    <td className="py-2 text-muted-foreground">{EXPIRE_POLICIES.find((e) => e.value === r.expirePolicy)?.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {linkedSkus.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">引用此产品的商品SKU ({linkedSkus.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {linkedSkus.map((s) => (
              <Link key={s.id} to={`/entitlement/sku/detail/${s.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-[13px]">{s.name}</span>
                  <span className={STATUS_MAP[s.salesStatus].className}>{STATUS_MAP[s.salesStatus].label}</span>
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">{s.price > 0 ? `¥${s.price}` : "免费"} · {s.code}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={() => { toast.success("已保存"); setDialogOpen(false); }} initial={dialogInitial} />
    </div>
  );
}
