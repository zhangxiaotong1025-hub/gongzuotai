import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { accountData, orderData, appData, skuData, bundleData, ORDER_STATUS, ORDER_TYPES, GRANT_TYPES, getAccountStats, getRule, getCapability, type EntitlementAccount, type OrderItem } from "@/data/entitlement";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/admin/Pagination";
import { Building2, User, Plus, Eye } from "lucide-react";
import { OrderDialog } from "./dialogs/OrderDialog";
import { toast } from "sonner";

export default function AccountDetail() {
  const { id } = useParams();
  const accIndex = accountData.findIndex((a) => a.id === id);
  const acc = accIndex >= 0 ? accountData[accIndex] : null;

  const [appFilter, setAppFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [allocPage, setAllocPage] = useState(1);
  const [allocPageSize, setAllocPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAllocate = useCallback((_form: any) => {
    toast.success("权益已分配，订单已自动生成");
    setDialogOpen(false);
  }, []);

  if (!acc) return <div className="p-10 text-center text-muted-foreground">账户不存在</div>;

  const prevAcc = accIndex > 0 ? accountData[accIndex - 1] : null;
  const nextAcc = accIndex < accountData.length - 1 ? accountData[accIndex + 1] : null;
  const stats = getAccountStats(acc);

  // Filtered allocations
  const filteredAllocs = acc.allocations.filter((a) => {
    if (appFilter !== "all" && a.appId !== appFilter) return false;
    if (typeFilter !== "all" && a.itemType !== typeFilter) return false;
    return true;
  });
  const pagedAllocs = filteredAllocs.slice((allocPage - 1) * allocPageSize, allocPage * allocPageSize);

  // Group capabilities by capabilityId
  const grouped = acc.capabilities.reduce((map, cap) => {
    if (!map[cap.capabilityId]) map[cap.capabilityId] = [];
    map[cap.capabilityId].push(cap);
    return map;
  }, {} as Record<string, typeof acc.capabilities>);

  const relatedOrders = orderData.filter((o) => acc.orderIds.includes(o.id));

  const handleAllocate = useCallback((form: any) => {
    toast.success("权益已分配，订单已自动生成");
    setDialogOpen(false);
  }, []);

  return (
    <div className="space-y-5 pb-6">
      <DetailActionBar
        backLabel="权益账户"
        backPath="/entitlement/account"
        currentName={`${acc.customerName} - 权益详情`}
        prevPath={prevAcc ? `/entitlement/account/detail/${prevAcc.id}` : null}
        nextPath={nextAcc ? `/entitlement/account/detail/${nextAcc.id}` : null}
      />

      {/* 概览头部 — 渐变卡片 */}
      <div className="rounded-xl p-6 text-white" style={{
        background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(260 60% 55%) 50%, hsl(280 55% 50%) 100%)",
      }}>
        <div className="flex items-center gap-3 mb-1">
          {acc.customerType === "B" ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
          <h2 className="text-[18px] font-bold">{acc.customerName}</h2>
        </div>
        <p className="text-white/70 text-[13px] mb-5">
          企业ID: {acc.customerId}
        </p>
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="text-white/60 text-[12px]">分配记录数</div>
            <div className="text-[20px] font-bold mt-0.5">{acc.allocations.length}条记录</div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">总权益数</div>
            <div className="text-[20px] font-bold mt-0.5">{stats.capCount}项权益</div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">有效实例数</div>
            <div className="text-[20px] font-bold mt-0.5">{stats.instanceCount}个实例</div>
          </div>
          <div>
            <div className="text-white/60 text-[12px]">最近分配时间</div>
            <div className="text-[20px] font-bold mt-0.5">
              {acc.allocations.length > 0
                ? acc.allocations.reduce((a, b) => (a.allocatedAt > b.allocatedAt ? a : b)).allocatedAt.slice(0, 16)
                : "—"
              }
            </div>
          </div>
        </div>
      </div>

      {/* 权益分配记录 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">权益分配记录</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">（按商品/套餐维度分配，点击查看每条记录包含的权益明细和实例）</p>
          </div>
          <button className="btn-primary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> 分配权益
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">所属应用：</span>
            <Select value={appFilter} onValueChange={setAppFilter}>
              <SelectTrigger className="h-8 w-[130px] text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                {acc.appIds.map((id, i) => <SelectItem key={id} value={id}>{acc.appNames[i]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-muted-foreground">商品类型：</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-[100px] text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="sku">商品SKU</SelectItem>
                <SelectItem value="bundle">商品套餐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Allocation table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2.5 font-medium">分配记录ID</th>
                <th className="text-left py-2.5 font-medium">分配时间</th>
                <th className="text-left py-2.5 font-medium">商品/套餐名称</th>
                <th className="text-left py-2.5 font-medium">商品类型</th>
                <th className="text-left py-2.5 font-medium">所属应用</th>
                <th className="text-center py-2.5 font-medium">包含权益数</th>
                <th className="text-center py-2.5 font-medium">有效实例数</th>
                <th className="text-right py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedAllocs.map((alloc) => (
                <tr key={alloc.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5">
                    <Link to={`/entitlement/order/detail/${alloc.orderId}`} className="text-primary hover:underline font-mono text-[12px]">
                      {alloc.id.toUpperCase().replace("ALLOC", "ALLOC_")}
                    </Link>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{alloc.allocatedAt}</td>
                  <td className="py-2.5 font-medium">{alloc.itemName}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${alloc.itemType === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                      {alloc.itemType === "bundle" ? "商品套餐" : "商品SKU"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <Link
                      to={`/entitlement/app/detail/${alloc.appId}`}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {alloc.appName}
                    </Link>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                      {alloc.capabilityCount}
                    </span>
                  </td>
                  <td className="py-2.5 text-center font-medium">{alloc.instanceCount}个</td>
                  <td className="py-2.5 text-right">
                    <Link to={`/entitlement/order/detail/${alloc.orderId}`} className="inline-flex items-center gap-1 text-primary hover:underline text-[12px]">
                      <Eye className="h-3 w-3" /> 查看权益明细
                    </Link>
                  </td>
                </tr>
              ))}
              {pagedAllocs.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">暂无分配记录</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredAllocs.length > 0 && (
          <div className="mt-3">
            <Pagination
              current={allocPage}
              total={filteredAllocs.length}
              pageSize={allocPageSize}
              onPageChange={setAllocPage}
              onPageSizeChange={(s) => { setAllocPageSize(s); setAllocPage(1); }}
            />
          </div>
        )}
      </div>

      {/* 权益能力明细 */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <h3 className="text-[14px] font-semibold text-foreground mb-4">权益能力明细（聚合视图）</h3>
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
                              <Progress value={usagePercent} className={`h-2 ${usagePercent >= 80 ? "[&>div]:bg-destructive" : ""}`} />
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
              <th className="text-left py-2 font-medium">订单类型</th>
              <th className="text-left py-2 font-medium">订单状态</th>
              <th className="text-left py-2 font-medium">时间</th>
            </tr></thead>
            <tbody>
              {relatedOrders.map((order) => {
                const statusCfg = ORDER_STATUS.find((s) => s.value === order.orderStatus);
                const typeCfg = ORDER_TYPES.find((t) => t.value === order.orderType);
                return (
                  <tr key={order.id} className="border-b border-border/40 hover:bg-muted/30">
                    <td className="py-2"><Link to={`/entitlement/order/detail/${order.id}`} className="text-primary hover:underline font-mono text-[12px]">{order.orderNo}</Link></td>
                    <td className="py-2">{order.items.map((i) => i.itemName).join("、")}</td>
                    <td className="py-2 text-right font-medium">{order.totalAmount > 0 ? `¥${order.totalAmount}` : "¥0"}</td>
                    <td className="py-2"><span className={`text-[12px] font-medium ${typeCfg?.className || ""}`}>{typeCfg?.label}</span></td>
                    <td className="py-2"><span className={statusCfg?.className}>{statusCfg?.label}</span></td>
                    <td className="py-2 text-muted-foreground">{order.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分配权益弹窗 — 复用 OrderDialog，自动关联当前客户 */}
      <OrderDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAllocate}
        initial={{
          customerType: acc.customerType,
          customerId: acc.customerId,
          customerName: acc.customerName,
          orderType: "internal_grant",
        } as any}
      />
    </div>
  );
}
