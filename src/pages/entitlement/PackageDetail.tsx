import { useParams, useNavigate, Link } from "react-router-dom";
import { bundleData, skuData, STATUS_MAP, BILLING_CYCLES, getCapability, getRulesBySkuId } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bundleIndex = bundleData.findIndex((b) => b.id === id);
  const bundle = bundleIndex >= 0 ? bundleData[bundleIndex] : null;
  if (!bundle) return <div className="p-10 text-center text-muted-foreground">套餐不存在</div>;

  const cycle = BILLING_CYCLES.find((b) => b.value === bundle.billingCycle)?.label || bundle.billingCycle;
  const prevBundle = bundleIndex > 0 ? bundleData[bundleIndex - 1] : null;
  const nextBundle = bundleIndex < bundleData.length - 1 ? bundleData[bundleIndex + 1] : null;

  const enrichedItems = bundle.items.map((item) => {
    const sku = skuData.find((s) => s.id === item.skuId);
    const rules = sku ? getRulesBySkuId(sku.id) : [];
    return { ...item, sku, rules };
  });

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="商品套餐"
        backPath="/entitlement/package"
        currentName={bundle.name}
        prevPath={prevBundle ? `/entitlement/package/detail/${prevBundle.id}` : null}
        nextPath={nextBundle ? `/entitlement/package/detail/${nextBundle.id}` : null}
        onEdit={() => toast.info("编辑功能开发中")}
        onCopy={() => toast.success("套餐已复制（功能开发中）")}
        statusToggle={{
          currentActive: bundle.status === "on_sale",
          activeLabel: "上架",
          inactiveLabel: "下架",
          onToggle: () => toast.info(bundle.status === "on_sale" ? "已下架" : "已上架"),
        }}
      />

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <div><h2 className="text-[16px] font-semibold text-foreground">{bundle.name}</h2><p className="text-[13px] text-muted-foreground mt-0.5">{bundle.description}</p></div>
          <span className={STATUS_MAP[bundle.status].className}>{STATUS_MAP[bundle.status].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">编码</span><div className="font-mono text-foreground mt-0.5">{bundle.code}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5"><Link to={`/entitlement/app/detail/${bundle.appId}`} className="text-primary hover:underline">{bundle.appName}</Link></div></div>
          <div><span className="text-muted-foreground">价格</span><div className="font-medium text-foreground mt-0.5">{bundle.price > 0 ? `¥${bundle.price}/${cycle}` : "免费"}{bundle.originalPrice ? ` (原¥${bundle.originalPrice})` : ""}</div></div>
          <div><span className="text-muted-foreground">包含商品</span><div className="text-primary font-medium mt-0.5">{bundle.items.length}个</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{bundle.createdAt}</div></div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">套餐明细 ({enrichedItems.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">商品名称</th>
              <th className="text-center py-2 font-medium">数量</th>
              <th className="text-left py-2 font-medium">包含规则</th>
              <th className="text-right py-2 font-medium">单价</th>
              <th className="text-left py-2 font-medium">操作</th>
            </tr></thead>
            <tbody>
              {enrichedItems.map(({ skuId, skuName, quantity, sku, rules }) => (
                <tr key={skuId} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2 font-medium text-foreground">{skuName}</td>
                  <td className="py-2 text-center">{quantity > 1 ? <span className="text-primary font-medium">×{quantity}</span> : "1"}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {rules.map((r) => (
                        <Link key={r.id} to={`/entitlement/rule/detail/${r.id}`} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground hover:text-primary">{r.name}</Link>
                      ))}
                      {rules.length === 0 && <span className="text-muted-foreground">—</span>}
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
    </div>
  );
}
