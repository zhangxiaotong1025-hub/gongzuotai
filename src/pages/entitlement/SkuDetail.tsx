import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { skuData, bundleData, STATUS_MAP, BILLING_CYCLES, getCapability, getApp, getProductsBySkuId, getRulesByProduct } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { SkuDialog } from "./dialogs/SkuDialog";
import { toast } from "sonner";
import { Tag } from "lucide-react";

export default function SkuDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const skuIndex = skuData.findIndex((s) => s.id === id);
  const sku = skuIndex >= 0 ? skuData[skuIndex] : null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitial, setDialogInitial] = useState(sku);

  if (!sku) return <div className="p-10 text-center text-muted-foreground">商品不存在</div>;

  const products = getProductsBySkuId(sku.id);
  const app = getApp(sku.appId);
  const bundles = bundleData.filter((b) => b.items.some((i) => i.skuId === sku.id));
  const prevSku = skuIndex > 0 ? skuData[skuIndex - 1] : null;
  const nextSku = skuIndex < skuData.length - 1 ? skuData[skuIndex + 1] : null;

  const handleEdit = () => { setDialogInitial(sku); setDialogOpen(true); };
  const handleCopy = () => { setDialogInitial({ ...sku, id: "", name: `${sku.name}（副本）`, code: `${sku.code}_COPY` }); setDialogOpen(true); };

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="商品SKU"
        backPath="/entitlement/sku"
        currentName={sku.name}
        prevPath={prevSku ? `/entitlement/sku/detail/${prevSku.id}` : null}
        nextPath={nextSku ? `/entitlement/sku/detail/${nextSku.id}` : null}
        onEdit={handleEdit}
        onCopy={handleCopy}
        statusToggle={{
          currentActive: sku.salesStatus === "on_sale",
          activeLabel: "上架",
          inactiveLabel: "下架",
          onToggle: () => toast.info(sku.salesStatus === "on_sale" ? "已下架" : "已上架"),
        }}
      />

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Tag className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-[16px] font-semibold text-foreground">{sku.name}</h2>
              <code className="text-[12px] text-muted-foreground font-mono">{sku.code}</code>
            </div>
          </div>
          <span className={STATUS_MAP[sku.salesStatus].className}>{STATUS_MAP[sku.salesStatus].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline">{app.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">价格</span><div className={`font-medium mt-0.5 ${sku.price > 0 ? "text-foreground" : "text-muted-foreground"}`}>{sku.price > 0 ? `¥${sku.price}` : "¥0"}</div></div>
          <div><span className="text-muted-foreground">计费周期</span><div className="text-foreground mt-0.5">{BILLING_CYCLES.find((b) => b.value === sku.billingCycle)?.label}</div></div>
          <div><span className="text-muted-foreground">关联权益产品</span><div className="text-primary font-medium mt-0.5">{products.length}个</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{sku.createdAt}</div></div>
        </div>
        {sku.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t leading-relaxed">{sku.description}</p>}
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联权益产品 ({products.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">产品名称</th>
              <th className="text-left py-2 font-medium">产品编码</th>
              <th className="text-left py-2 font-medium">能力覆盖</th>
              <th className="text-right py-2 font-medium">底层规则</th>
              <th className="text-left py-2 font-medium">说明</th>
            </tr></thead>
            <tbody>
              {products.map((p) => {
                const productRules = getRulesByProduct(p.id);
                const capNames = [...new Set(productRules.map((r) => getCapability(r.capabilityId)?.name).filter(Boolean))] as string[];
                return (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/product/detail/${p.id}`} className="text-primary hover:underline font-medium">{p.name}</Link></td>
                    <td className="py-2"><code className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{p.code}</code></td>
                    <td className="py-2"><div className="flex flex-wrap gap-1">{capNames.map((name) => <span key={name} className="badge-info">{name}</span>)}</div></td>
                    <td className="py-2 text-right text-primary font-medium">{productRules.length}条</td>
                    <td className="py-2 text-muted-foreground max-w-[320px]"><div className="truncate" title={p.description}>{p.description || "—"}</div></td>
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

      <SkuDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={(form) => { toast.success(dialogInitial?.id === sku.id ? "商品已更新" : "商品已创建（副本）"); setDialogOpen(false); }} initial={dialogInitial} />
    </div>
  );
}
