import { useParams, useNavigate, Link } from "react-router-dom";
import { skuData, ruleData, bundleData, STATUS_MAP, BILLING_CYCLES, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES, DATA_TYPES, getCapability, getApp, getRule } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";

export default function SkuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const skuIndex = skuData.findIndex((s) => s.id === id);
  const sku = skuIndex >= 0 ? skuData[skuIndex] : null;
  if (!sku) return <div className="p-10 text-center text-muted-foreground">商品不存在</div>;

  const rules = (sku.ruleIds || []).map((rid) => getRule(rid)).filter(Boolean);
  const app = getApp(sku.appId);
  const bundles = bundleData.filter((b) => b.items.some((i) => i.skuId === sku.id));
  const prevSku = skuIndex > 0 ? skuData[skuIndex - 1] : null;
  const nextSku = skuIndex < skuData.length - 1 ? skuData[skuIndex + 1] : null;

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="商品SKU"
        backPath="/entitlement/sku"
        currentName={sku.name}
        prevPath={prevSku ? `/entitlement/sku/detail/${prevSku.id}` : null}
        nextPath={nextSku ? `/entitlement/sku/detail/${nextSku.id}` : null}
        onEdit={() => toast.info("编辑功能开发中")}
        onCopy={() => toast.success("商品已复制（功能开发中）")}
        statusToggle={{
          currentActive: sku.salesStatus === "on_sale",
          activeLabel: "上架",
          inactiveLabel: "下架",
          onToggle: () => toast.info(sku.salesStatus === "on_sale" ? "已下架" : "已上架"),
        }}
      />

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{sku.name}</h2>
          <span className={STATUS_MAP[sku.salesStatus].className}>{STATUS_MAP[sku.salesStatus].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">商品编码</span><div className="font-mono text-foreground mt-0.5">{sku.code}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline">{app.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">价格</span><div className={`font-medium mt-0.5 ${sku.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{sku.price > 0 ? `¥${sku.price}` : "¥0"}</div></div>
          <div><span className="text-muted-foreground">计费周期</span><div className="text-foreground mt-0.5">{BILLING_CYCLES.find((b) => b.value === sku.billingCycle)?.label}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{sku.createdAt}</div></div>
        </div>
        {sku.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{sku.description}</p>}
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
                if (!r) return null;
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

      {bundles.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">包含此商品的套餐 ({bundles.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {bundles.map((b) => (
              <Link key={b.id} to={`/entitlement/package/detail/${b.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground text-[13px]">{b.name}</span>
                  <span className={STATUS_MAP[b.status].className}>{STATUS_MAP[b.status].label}</span>
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">{b.price > 0 ? `¥${b.price}/${BILLING_CYCLES.find((c) => c.value === b.billingCycle)?.label}` : "免费"} · {b.items.length}个商品</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
