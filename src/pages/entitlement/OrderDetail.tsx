import { useParams, Link } from "react-router-dom";
import { orderData, accountData, ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, skuData, bundleData, getOrderApps, getRule, getCapability, type EntitlementOrder } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams();
  const orderIndex = orderData.findIndex((o) => o.id === id);
  const order = orderIndex >= 0 ? orderData[orderIndex] : null;

  if (!order) return <div className="p-10 text-center text-muted-foreground">订单不存在</div>;

  const apps = getOrderApps(order);
  const prevOrder = orderIndex > 0 ? orderData[orderIndex - 1] : null;
  const nextOrder = orderIndex < orderData.length - 1 ? orderData[orderIndex + 1] : null;
  const statusCfg = ORDER_STATUS.find((s) => s.value === order.orderStatus);
  const typeCfg = ORDER_TYPES.find((t) => t.value === order.orderType);
  const payCfg = PAYMENT_STATUS.find((p) => p.value === order.paymentStatus);

  // Find related accounts (could be multiple, one per app)
  const relatedAccounts = accountData.filter((a) => a.customerId === order.customerId && a.orderIds.includes(order.id));

  // Resolve items to rules, grouped by app
  const resolvedItems = order.items.map((item) => {
    if (item.type === "sku") {
      const sku = skuData.find((s) => s.id === item.itemId);
      const rules = sku ? sku.ruleIds.map((rid) => getRule(rid)).filter(Boolean) : [];
      return { ...item, sku, bundle: undefined, rules, appName: sku ? (apps.find((a) => a.id === sku.appId)?.name || "") : "" };
    } else {
      const bundle = bundleData.find((b) => b.id === item.itemId);
      const allRules = bundle ? bundle.items.flatMap((bi) => {
        const sku = skuData.find((s) => s.id === bi.skuId);
        return sku ? sku.ruleIds.map((rid) => getRule(rid)).filter(Boolean) : [];
      }) : [];
      return { ...item, sku: undefined, bundle, rules: allRules, appName: bundle ? (apps.find((a) => a.id === bundle.appId)?.name || "") : "" };
    }
  });

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="订单管理"
        backPath="/entitlement/order"
        currentName={order.orderNo}
        prevPath={prevOrder ? `/entitlement/order/detail/${prevOrder.id}` : null}
        nextPath={nextOrder ? `/entitlement/order/detail/${nextOrder.id}` : null}
        extraActions={
          <>
            {order.paymentStatus === "pending" && (
              <button onClick={() => toast.info("已标记支付")} className="btn-secondary text-[12px] py-1.5 px-3 gap-1.5 text-primary border-primary/30 hover:bg-primary/10">
                标记已支付
              </button>
            )}
            {order.orderStatus === "completed" && order.paymentStatus === "paid" && (
              <button onClick={() => toast.info("退款")} className="btn-secondary text-[12px] py-1.5 px-3 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                退款
              </button>
            )}
            {order.orderStatus === "pending" && (
              <button onClick={() => toast.info("关闭")} className="btn-secondary text-[12px] py-1.5 px-3 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10">
                关闭
              </button>
            )}
          </>
        }
      />

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">基本信息</h3>
        <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-[13px]">
          <div><span className="text-muted-foreground">订单号</span><div className="font-medium text-foreground mt-0.5 font-mono text-[12px]">{order.orderNo}</div></div>
          <div><span className="text-muted-foreground">账户类型</span><div className="mt-0.5"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${order.customerType === "B" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"}`}>{order.customerType === "B" ? "B端企业" : "C端用户"}</span></div></div>
          <div><span className="text-muted-foreground">客户名称</span><div className="font-medium text-foreground mt-0.5">{order.customerName}</div></div>
          <div>
            <span className="text-muted-foreground">所属应用</span>
            <div className="mt-0.5 flex flex-wrap gap-1">
              {apps.map((app) => (
                <Link key={app.id} to={`/entitlement/app/detail/${app.id}`} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary hover:bg-primary/20">
                  {app.name}
                </Link>
              ))}
            </div>
          </div>
          <div><span className="text-muted-foreground">订单类型</span><div className={`mt-0.5 font-medium ${typeCfg?.className || ""}`}>{typeCfg?.label}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{order.createdAt}</div></div>
          <div><span className="text-muted-foreground">备注</span><div className="text-foreground mt-0.5">{order.remark || "—"}</div></div>
        </div>
      </div>

      {/* 商品信息 — 按应用分组 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">商品信息</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">商品名称</th>
              <th className="text-left py-2 font-medium">类型</th>
              <th className="text-left py-2 font-medium">应用</th>
              <th className="text-right py-2 font-medium">单价</th>
              <th className="text-right py-2 font-medium">数量</th>
              <th className="text-right py-2 font-medium">小计</th>
            </tr></thead>
            <tbody>
              {resolvedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2.5">
                    <Link to={item.type === "bundle" ? `/entitlement/package/detail/${item.itemId}` : `/entitlement/sku/detail/${item.itemId}`} className="text-primary hover:underline font-medium">{item.itemName}</Link>
                  </td>
                  <td className="py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.type === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>{item.type === "bundle" ? "商品套餐" : "商品SKU"}</span></td>
                  <td className="py-2.5 text-muted-foreground">{item.appName}</td>
                  <td className="py-2.5 text-right">{item.unitPrice > 0 ? `¥${item.unitPrice.toFixed(2)}` : "¥0.00"}</td>
                  <td className="py-2.5 text-right">{item.quantity}</td>
                  <td className="py-2.5 text-right font-medium text-destructive">{(item.unitPrice * item.quantity) > 0 ? `¥${(item.unitPrice * item.quantity).toFixed(2)}` : "¥0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 支付信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">支付信息</h3>
        <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-[13px]">
          <div><span className="text-muted-foreground">订单金额</span><div className={`font-semibold mt-0.5 text-[16px] ${order.totalAmount > 0 ? "text-destructive" : "text-muted-foreground"}`}>¥{order.totalAmount.toFixed(2)}</div></div>
          <div><span className="text-muted-foreground">支付状态</span><div className="mt-0.5"><span className={payCfg?.className || ""}>{payCfg?.label}</span></div></div>
          {order.paidAt && <div><span className="text-muted-foreground">支付时间</span><div className="text-foreground mt-0.5">{order.paidAt}</div></div>}
          {order.expireAt && <div><span className="text-muted-foreground">到期时间</span><div className="text-foreground mt-0.5">{order.expireAt}</div></div>}
        </div>
      </div>

      {/* 订单状态 + 时间线 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">订单状态</h3>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[13px] text-muted-foreground">当前状态：</span>
          <span className={statusCfg?.className || ""}>{statusCfg?.label}</span>
        </div>

        {order.statusHistory.length > 0 && (
          <div>
            <p className="text-[13px] text-muted-foreground mb-3">状态变更历史：</p>
            <div className="relative ml-2">
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {order.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex gap-3 relative">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-background mt-1 shrink-0 relative z-10" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-foreground">{entry.label}</div>
                      <div className="text-[12px] text-muted-foreground mt-0.5">{entry.time}</div>
                      {entry.remark && <div className="text-[12px] text-muted-foreground">{entry.remark}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 权益规则明细 */}
      {resolvedItems.some((i) => i.rules.length > 0) && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">订单权益规则明细</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">来源商品</th>
                <th className="text-left py-2 font-medium">应用</th>
                <th className="text-left py-2 font-medium">规则名称</th>
                <th className="text-left py-2 font-medium">能力</th>
                <th className="text-right py-2 font-medium">额度</th>
                <th className="text-left py-2 font-medium">周期</th>
                <th className="text-left py-2 font-medium">发放方式</th>
              </tr></thead>
              <tbody>
                {resolvedItems.flatMap((item) =>
                  item.rules.map((rule, ri) => {
                    if (!rule) return null;
                    const cap = getCapability(rule.capabilityId);
                    return (
                      <tr key={`${item.itemId}-${ri}`} className="border-b border-border/40 hover:bg-muted/30">
                        {ri === 0 ? <td className="py-2 font-medium" rowSpan={item.rules.length}>{item.itemName}</td> : null}
                        {ri === 0 ? <td className="py-2 text-muted-foreground" rowSpan={item.rules.length}>{item.appName}</td> : null}
                        <td className="py-2"><Link to={`/entitlement/rule/detail/${rule.id}`} className="text-primary hover:underline">{rule.name}</Link></td>
                        <td className="py-2 text-muted-foreground">{cap?.name || "—"}</td>
                        <td className="py-2 text-right font-medium">{rule.quota.toLocaleString()} {cap?.unit || ""}</td>
                        <td className="py-2 text-muted-foreground">{rule.periodType === "PERMANENT" ? "永久" : `${rule.periodValue}${rule.periodType === "DAY" ? "天" : rule.periodType === "MONTH" ? "月" : "年"}`}</td>
                        <td className="py-2 text-muted-foreground">{rule.grantType === "DAILY_REFRESH" ? "每日刷新" : rule.grantType === "MONTHLY_GRANT" ? "每月发放" : "一次性"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 关联账户 — 可能跨多个应用 */}
      {relatedAccounts.length > 0 && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">关联权益账户 ({relatedAccounts.length})</h3>
          <div className="space-y-2">
            {relatedAccounts.map((acc) => (
              <Link key={acc.id} to={`/entitlement/account/detail/${acc.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-[13px]">{acc.customerName}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary">{acc.appName}</span>
                  </div>
                  <span className="badge-active">活跃</span>
                </div>
                <div className="text-[12px] text-muted-foreground mt-1">{acc.capabilities.length}项能力 · {acc.orderIds.length}个关联订单</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
