import { useParams, Link } from "react-router-dom";
import { accountData, orderData, ORDER_STATUS, ORDER_TYPES, PAYMENT_STATUS, PERIOD_TYPES, GRANT_TYPES, getApp, type EntitlementAccount } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Progress } from "@/components/ui/progress";

export default function AccountDetail() {
  const { id } = useParams();
  const accIndex = accountData.findIndex((a) => a.id === id);
  const acc = accIndex >= 0 ? accountData[accIndex] : null;

  if (!acc) return <div className="p-10 text-center text-muted-foreground">账户不存在</div>;

  const app = getApp(acc.appId);
  const prevAcc = accIndex > 0 ? accountData[accIndex - 1] : null;
  const nextAcc = accIndex < accountData.length - 1 ? accountData[accIndex + 1] : null;
  const relatedOrders = orderData.filter((o) => acc.orderIds.includes(o.id));

  // Group capabilities by capabilityId
  const grouped = acc.capabilities.reduce((map, cap) => {
    if (!map[cap.capabilityId]) map[cap.capabilityId] = [];
    map[cap.capabilityId].push(cap);
    return map;
  }, {} as Record<string, typeof acc.capabilities>);

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="权益账户"
        backPath="/entitlement/account"
        currentName={`${acc.customerName} · ${acc.appName}`}
        prevPath={prevAcc ? `/entitlement/account/detail/${prevAcc.id}` : null}
        nextPath={nextAcc ? `/entitlement/account/detail/${nextAcc.id}` : null}
      />

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground">{acc.customerName}</h2>
          <span className="badge-active">活跃</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline">{app.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">能力项数</span><div className="font-medium text-foreground mt-0.5">{acc.capabilities.length}项</div></div>
          <div><span className="text-muted-foreground">关联订单</span><div className="font-medium text-foreground mt-0.5">{acc.orderIds.length}个</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{acc.createdAt}</div></div>
          <div><span className="text-muted-foreground">更新时间</span><div className="text-foreground mt-0.5">{acc.updatedAt}</div></div>
        </div>
      </div>

      {/* 权益能力明细 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">权益能力明细</h3>
        <div className="space-y-4">
          {Object.entries(grouped).map(([capId, caps]) => {
            const capName = caps[0].capabilityName;
            return (
              <div key={capId} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link to={`/entitlement/capability/detail/${capId}`} className="text-[13px] font-semibold text-primary hover:underline">{capName}</Link>
                  <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{caps.length}条规则</span>
                </div>
                <div className="space-y-3">
                  {caps.map((cap, idx) => {
                    const usagePercent = cap.totalQuota > 0 ? Math.round((cap.usedQuota / cap.totalQuota) * 100) : 0;
                    const isBoolean = cap.unit === "布尔";
                    return (
                      <div key={idx} className="flex items-center gap-4 text-[13px]">
                        <Link to={`/entitlement/rule/detail/${cap.ruleId}`} className="w-[180px] text-foreground hover:text-primary shrink-0 font-medium">{cap.ruleName}</Link>
                        {isBoolean ? (
                          <div className="flex-1 flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary">已开通</span>
                            <span className="text-muted-foreground text-[12px]">{cap.grantType === "ONE_TIME" ? "永久" : GRANT_TYPES.find((g) => g.value === cap.grantType)?.label}</span>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1 max-w-[200px]">
                              <Progress value={usagePercent} className="h-2" />
                            </div>
                            <span className="text-muted-foreground whitespace-nowrap">
                              {cap.usedQuota.toLocaleString()}/{cap.totalQuota.toLocaleString()} {cap.unit}
                            </span>
                            <span className="text-[12px] text-muted-foreground">
                              {cap.periodType === "PERMANENT" ? "" : cap.periodType === "DAY" ? "每日刷新" : "每月"}
                            </span>
                          </div>
                        )}
                        <span className="text-[11px] text-muted-foreground shrink-0">来源: {cap.sourceOrderIds.length}个订单</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 关联订单 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">关联订单 ({relatedOrders.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">订单号</th>
              <th className="text-left py-2 font-medium">商品/套餐</th>
              <th className="text-right py-2 font-medium">金额</th>
              <th className="text-left py-2 font-medium">来源</th>
              <th className="text-left py-2 font-medium">状态</th>
              <th className="text-left py-2 font-medium">时间</th>
            </tr></thead>
            <tbody>
              {relatedOrders.map((order) => {
                const statusCfg = ORDER_STATUS.find((s) => s.value === order.status);
                return (
                  <tr key={order.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/order/detail/${order.id}`} className="text-primary hover:underline font-mono text-[12px]">{order.orderNo}</Link></td>
                    <td className="py-2">{order.items.map((i) => i.itemName).join("、")}</td>
                    <td className="py-2 text-right font-medium">{order.totalAmount > 0 ? `¥${order.totalAmount}` : "¥0"}</td>
                    <td className="py-2 text-muted-foreground">{ORDER_SOURCES.find((s) => s.value === order.source)?.label}</td>
                    <td className="py-2"><span className={statusCfg?.className}>{statusCfg?.label}</span></td>
                    <td className="py-2 text-muted-foreground">{order.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
