import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bundleData, skuData, STATUS_MAP, BILLING_CYCLES, getProductsBySkuId } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { BundleDialog } from "./dialogs/BundleDialog";
import { toast } from "sonner";
import { Layers } from "lucide-react";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bundleIndex = bundleData.findIndex((b) => b.id === id);
  const bundle = bundleIndex >= 0 ? bundleData[bundleIndex] : null;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogInitial, setDialogInitial] = useState(bundle);

  if (!bundle) return <div className="p-10 text-center text-muted-foreground">套餐不存在</div>;

  const cycle = BILLING_CYCLES.find((b) => b.value === bundle.billingCycle)?.label || bundle.billingCycle;
  const prevBundle = bundleIndex > 0 ? bundleData[bundleIndex - 1] : null;
  const nextBundle = bundleIndex < bundleData.length - 1 ? bundleData[bundleIndex + 1] : null;

  const enrichedItems = bundle.items.map((item) => {
    const sku = skuData.find((s) => s.id === item.skuId);
    const products = sku ? getProductsBySkuId(sku.id) : [];
    return { ...item, sku, products };
  });

  const handleEdit = () => { setDialogInitial(bundle); setDialogOpen(true); };
  const handleCopy = () => { setDialogInitial({ ...bundle, id: "", name: `${bundle.name}（副本）`, code: `${bundle.code}_COPY` }); setDialogOpen(true); };

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="商品套餐"
        backPath="/entitlement/package"
        currentName={bundle.name}
        prevPath={prevBundle ? `/entitlement/package/detail/${prevBundle.id}` : null}
        nextPath={nextBundle ? `/entitlement/package/detail/${nextBundle.id}` : null}
        onEdit={handleEdit}
        onCopy={handleCopy}
        statusToggle={{
          currentActive: bundle.status === "on_sale",
          activeLabel: "上架",
          inactiveLabel: "下架",
          onToggle: () => toast.info(bundle.status === "on_sale" ? "已下架" : "已上架"),
        }}
      />

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Layers className="h-5 w-5 text-primary" /></div>
            <div>
              <h2 className="text-[16px] font-semibold text-foreground">{bundle.name}</h2>
              <code className="text-[12px] text-muted-foreground font-mono">{bundle.code}</code>
            </div>
          </div>
          <span className={STATUS_MAP[bundle.status].className}>{STATUS_MAP[bundle.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5"><Link to={`/entitlement/app/detail/${bundle.appId}`} className="text-primary hover:underline">{bundle.appName}</Link></div></div>
          <div><span className="text-muted-foreground">价格</span><div className="font-medium text-foreground mt-0.5">{bundle.price > 0 ? `¥${bundle.price}/${cycle}` : "免费"}</div></div>
          {bundle.originalPrice ? <div><span className="text-muted-foreground">原价</span><div className="text-muted-foreground mt-0.5 line-through">¥{bundle.originalPrice}</div></div> : <div><span className="text-muted-foreground">计费周期</span><div className="text-foreground mt-0.5">{cycle}</div></div>}
          <div><span className="text-muted-foreground">包含商品</span><div className="text-primary font-medium mt-0.5">{bundle.items.length}个</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{bundle.createdAt}</div></div>
        </div>
        {bundle.description && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t leading-relaxed">{bundle.description}</p>}
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-foreground">套餐明细 ({enrichedItems.length})</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">人员授权时按下列商品维度拆分逐项配置</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">商品名称</th>
              <th className="text-center py-2 font-medium">数量</th>
              <th className="text-left py-2 font-medium">关联权益产品</th>
              <th className="text-right py-2 font-medium">单价</th>
              <th className="text-left py-2 font-medium">操作</th>
            </tr></thead>
            <tbody>
              {enrichedItems.map(({ skuId, skuName, quantity, sku, products }) => (
                <tr key={skuId} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2 font-medium text-foreground">{skuName}</td>
                  <td className="py-2 text-center">{quantity > 1 ? <span className="text-primary font-medium">×{quantity}</span> : "1"}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {products.map((p) => (
                        <Link key={p.id} to={`/entitlement/product/detail/${p.id}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground hover:text-primary">{p.name}</Link>
                      ))}
                      {products.length === 0 && <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="py-2 text-right">{sku && sku.price > 0 ? `¥${sku.price}` : "—"}</td>
                  <td className="py-2"><Link to={`/entitlement/sku/detail/${skuId}`} className="text-primary hover:underline text-[12px]">查看</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BundleDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={(form) => { toast.success(dialogInitial?.id === bundle.id ? "套餐已更新" : "套餐已创建（副本）"); setDialogOpen(false); }} initial={dialogInitial} />
    </div>
  );
}
