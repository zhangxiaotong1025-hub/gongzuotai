import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { orderData, accountData, ORDER_STATUS, ORDER_SOURCES, BILLING_CYCLES, skuData, bundleData, getApp, getRule, getCapability, type EntitlementOrder } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { toast } from "sonner";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderIndex = orderData.findIndex((o) => o.id === id);
  const order = orderIndex >= 0 ? orderData[orderIndex] : null;

  if (!order) return <div className="p-10 text-center text-muted-foreground">订单不存在</div>;

  const app = getApp(order.appId);
  const prevOrder = orderIndex > 0 ? orderData[orderIndex - 1] : null;
  const nextOrder = orderIndex < orderData.length - 1 ? orderData[orderIndex + 1] : null;
  const statusCfg = ORDER_STATUS.find((s) => s.value === order.status);
  const sourceCfg = ORDER_SOURCES.find((s) => s.value === order.source);

  // Find related account
  const relatedAccount = accountData.find((a) => a.customerId === order.customerId && a.appId === order.appId);

  // Resolve items to their rules
  const resolvedItems = order.items.map((item) => {
    if (item.type === "sku") {
      const sku = skuData.find((s) => s.id === item.itemId);
      const rules = sku ? sku.ruleIds.map((rid) => getRule(rid)).filter(Boolean) : [];
      return { ...item, sku, rules };
    } else {
      const bundle = bundleData.find((b) => b.id === item.itemId);
      const allRules = bundle ? bundle.items.flatMap((bi) => {
        const sku = skuData.find((s) => s.id === bi.skuId);
        return sku ? sku.ruleIds.map((rid) => getRule(rid)).filter(Boolean) : [];
      }) : [];
      return { ...item, bundle, rules: allRules };
    }
  });

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="权益订单"
        backPath="/entitlement/order"
        currentName={order.orderNo}
        prevPath={prevOrder ? `/entitlement/order/detail/${prevOrder.id}` : null}
        nextPath={nextOrder ? `/entitlement/order/detail/${nextOrder.id}` : null}
        statusToggle={order.status === "pending" ? {
          currentActive: true,
          activeLabel: "标记已支付",
          inactiveLabel: "取消订单",
          onToggle: () => toast.info("已标记支付"),
        } : undefined}
      />

      {/* 基本信息 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-foreground font-mono">{order.orderNo}</h2>
          <span className={statusCfg?.className || ""}>{statusCfg?.label}</span>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px]">
          <div><span className="text-muted-foreground">客户名称</span><div className="font-medium text-foreground mt-0.5">{order.customerName}</div></div>
          <div><span className="text-muted-foreground">所属应用</span><div className="mt-0.5">{app ? <Link to={`/entitlement/app/detail/${app.id}`} className="text-primary hover:underline">{app.name}</Link> : "—"}</div></div>
          <div><span className="text-muted-foreground">订单金额</span><div className={`font-medium mt-0.5 ${order.totalAmount > 0 ? "text-foreground" : "text-muted-foreground"}`}>{order.totalAmount > 0 ? `¥${order.totalAmount}` : "¥0"}</div></div>
          <div><span className="text-muted-foreground">来源</span><div className="text-foreground mt-0.5">{sourceCfg?.label}</div></div>
          <div><span className="text-muted-foreground">创建时间</span><div className="text-foreground mt-0.5">{order.createdAt}</div></div>
        </div>
        <div className="grid grid-cols-5 gap-4 text-[13px] mt-3">
          {order.paidAt && <div><span className="text-muted-foreground">支付时间</span><div className="text-foreground mt-0.5">{order.paidAt}</div></div>}
          {order.expireAt && <div><span className="text-muted-foreground">到期时间</span><div className="text-foreground mt-0.5">{order.expireAt}</div></div>}
        </div>
        {order.remark && <p className="text-[13px] text-muted-foreground mt-4 pt-4 border-t">{order.remark}</p>}
      </div>

      {/* 订单商品 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">订单商品 ({order.items.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">类型</th>
              <th className="text-left py-2 font-medium">商品名称</th>
              <th className="text-right py-2 font-medium">数量</th>
              <th className="text-right py-2 font-medium">单价</th>
              <th className="text-right py-2 font-medium">小计</th>
            </tr></thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-border/40 hover:bg-muted/30">
                  <td className="py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.type === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>{item.type === "bundle" ? "套餐" : "SKU"}</span></td>
                  <td className="py-2">
                    <Link to={item.type === "bundle" ? `/entitlement/package/detail/${item.itemId}` : `/entitlement/sku/detail/${item.itemId}`} className="text-primary hover:underline font-medium">{item.itemName}</Link>
                  </td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">{item.unitPrice > 0 ? `¥${item.unitPrice}` : "¥0"}</td>
                  <td className="py-2 text-right font-medium">{item.unitPrice * item.quantity > 0 ? `¥${item.unitPrice * item.quantity}` : "¥0"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t-2">
              <td colSpan={4} className="py-2 text-right font-medium">合计</td>
              <td className="py-2 text-right font-semibold text-foreground">{order.totalAmount > 0 ? `¥${order.totalAmount}` : "¥0"}</td>
            </tr></tfoot>
          </table>
        </div>
      </div>

      {/* 权益规则明细 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-3">订单权益规则明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b text-muted-foreground">
              <th className="text-left py-2 font-medium">来源商品</th>
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

      {/* 关联账户 */}
      {relatedAccount && (
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground mb-3">关联权益账户</h3>
          <Link to={`/entitlement/account/detail/${relatedAccount.id}`} className="block border rounded-lg p-4 hover:border-primary/40 hover:bg-primary/5 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground text-[13px]">{relatedAccount.customerName} · {relatedAccount.appName}</span>
              <span className="badge-active">活跃</span>
            </div>
            <div className="text-[12px] text-muted-foreground mt-1">{relatedAccount.capabilities.length}项能力 · {relatedAccount.orderIds.length}个关联订单</div>
          </Link>
        </div>
      )}
    </div>
  );
}
