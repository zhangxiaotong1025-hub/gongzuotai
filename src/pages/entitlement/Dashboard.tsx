import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  accountData, orderData, appData, skuData, bundleData,
  getAccountStats, getAccountHealth,
  ORDER_STATUS, ORDER_TYPES,
  type EntitlementAccount,
} from "@/data/entitlement";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Heart, ShoppingCart,
  AlertTriangle, Clock, UserX, Zap, Building2, RefreshCw, Eye,
  Package, Activity, ArrowUpRight,
} from "lucide-react";

/* ═══ Mock aggregated data ═══ */
const MONTHLY_REVENUE = [
  { month: "2025-04", revenue: 52000, orders: 8 },
  { month: "2025-05", revenue: 68000, orders: 12 },
  { month: "2025-06", revenue: 74000, orders: 10 },
  { month: "2025-07", revenue: 91000, orders: 15 },
  { month: "2025-08", revenue: 86000, orders: 13 },
  { month: "2025-09", revenue: 105000, orders: 18 },
  { month: "2025-10", revenue: 112000, orders: 16 },
  { month: "2025-11", revenue: 98000, orders: 14 },
  { month: "2025-12", revenue: 128000, orders: 22 },
  { month: "2026-01", revenue: 135000, orders: 19 },
  { month: "2026-02", revenue: 142000, orders: 21 },
  { month: "2026-03", revenue: 156000, orders: 24 },
];

const CUSTOMER_GROWTH = [
  { month: "2025-10", total: 28, newAdd: 5, churn: 1 },
  { month: "2025-11", total: 32, newAdd: 6, churn: 2 },
  { month: "2025-12", total: 35, newAdd: 4, churn: 1 },
  { month: "2026-01", total: 39, newAdd: 5, churn: 1 },
  { month: "2026-02", total: 42, newAdd: 4, churn: 1 },
  { month: "2026-03", total: 45, newAdd: 5, churn: 2 },
];

/* ═══ Helpers ═══ */
function computeKPIs() {
  const totalCustomers = accountData.length;
  const activeCustomers = accountData.filter((a) => a.status === "active").length;
  const totalRevenue = orderData.reduce((s, o) => s + o.totalAmount, 0);
  const thisMonthOrders = orderData.filter((o) => o.createdAt.startsWith("2026-03"));
  const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.totalAmount, 0);
  const lastMonthRevenue = 142000;
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0;

  const healths = accountData.map((a) => getAccountHealth(a.id));
  const avgHealth = Math.round(healths.reduce((s, h) => s + h.healthScore, 0) / healths.length);
  const avgRenewal = Math.round(healths.reduce((s, h) => s + h.renewalRate, 0) / healths.length * 10) / 10;

  const allStats = accountData.map((a) => getAccountStats(a));
  const avgUsage = Math.round(allStats.reduce((s, st) => s + st.usageRate, 0) / allStats.length * 10) / 10;

  return {
    totalCustomers, activeCustomers, totalRevenue, thisMonthRevenue,
    revenueGrowth, avgHealth, avgRenewal, avgUsage,
    totalOrders: orderData.length,
    thisMonthOrderCount: thisMonthOrders.length,
  };
}

function getHealthDistribution() {
  const dist = { excellent: 0, good: 0, warning: 0, critical: 0 };
  accountData.forEach((a) => { dist[getAccountHealth(a.id).healthLevel]++; });
  return [
    { name: "优秀", value: dist.excellent, color: "hsl(var(--success))" },
    { name: "良好", value: dist.good, color: "hsl(var(--primary))" },
    { name: "预警", value: dist.warning, color: "hsl(var(--warning))" },
    { name: "危险", value: dist.critical, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);
}

function getProductAnalysis() {
  return appData.filter((a) => a.status === "active").map((app) => {
    const customers = accountData.filter((a) => a.appIds.includes(app.id));
    const revenue = orderData
      .filter((o) => o.items.some((i) => {
        const sku = skuData.find((s) => s.id === i.itemId);
        const bun = bundleData.find((b) => b.id === i.itemId);
        return sku?.appId === app.id || bun?.appId === app.id;
      }))
      .reduce((s, o) => s + o.totalAmount, 0);

    const stats = customers.map((c) => getAccountStats(c));
    const avgUsage = stats.length > 0
      ? Math.round(stats.reduce((s, st) => s + st.usageRate, 0) / stats.length)
      : 0;

    return { name: app.name.replace("工具", "").slice(0, 4), fullName: app.name, customers: customers.length, revenue, avgUsage };
  });
}

function getAlerts() {
  const alerts: { type: "danger" | "warning" | "info"; icon: typeof AlertTriangle; label: string; customer: string; accId: string; detail: string }[] = [];

  accountData.forEach((acc) => {
    const health = getAccountHealth(acc.id);
    const stats = getAccountStats(acc);

    if (stats.usageRate >= 80) {
      alerts.push({ type: "danger", icon: Zap, label: "使用率过高", customer: acc.customerName, accId: acc.id, detail: `总使用率 ${stats.usageRate}%，需扩容` });
    }
    if (health.lastLoginDays >= 15) {
      alerts.push({ type: "warning", icon: UserX, label: "长期未登录", customer: acc.customerName, accId: acc.id, detail: `${health.lastLoginDays}天未登录，流失风险` });
    }
    if (health.intentSignals.some((s) => s.label === "合同到期" && (s.value.includes("已过期") || parseInt(s.value) <= 90))) {
      alerts.push({ type: "danger", icon: Clock, label: "合同即将到期", customer: acc.customerName, accId: acc.id, detail: health.intentSignals.find((s) => s.label === "合同到期")?.value || "" });
    }
    if (health.renewalRate < 70) {
      alerts.push({ type: "warning", icon: RefreshCw, label: "续约风险", customer: acc.customerName, accId: acc.id, detail: `续订率仅 ${health.renewalRate}%` });
    }
  });

  return alerts.sort((a, b) => (a.type === "danger" ? -1 : 1) - (b.type === "danger" ? -1 : 1));
}

/* ═══ Sub Components ═══ */
function KPICard({ icon: Icon, label, value, sub, trend, trendLabel }: {
  icon: typeof Users; label: string; value: string; sub?: string; trend?: number; trendLabel?: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4 flex items-start gap-3.5" style={{ boxShadow: "var(--shadow-xs)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "hsl(var(--primary) / 0.06)" }}>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-muted-foreground mb-0.5">{label}</div>
        <div className="text-[20px] font-bold text-foreground leading-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${trend >= 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend >= 0 ? "+" : ""}{trend}%
            </span>
          )}
          {sub && <span className="text-[11px] text-muted-foreground">{sub}</span>}
          {trendLabel && <span className="text-[11px] text-muted-foreground">{trendLabel}</span>}
        </div>
      </div>
    </div>
  );
}

const ALERT_STYLES = {
  danger: { bg: "hsl(var(--destructive) / 0.04)", border: "hsl(var(--destructive) / 0.15)", dot: "hsl(var(--destructive))" },
  warning: { bg: "hsl(var(--warning) / 0.04)", border: "hsl(var(--warning) / 0.15)", dot: "hsl(var(--warning))" },
  info: { bg: "hsl(var(--primary) / 0.04)", border: "hsl(var(--primary) / 0.15)", dot: "hsl(var(--primary))" },
};

/* ═══ Main Dashboard ═══ */
export default function EntitlementDashboard() {
  const kpis = computeKPIs();
  const healthDist = getHealthDistribution();
  const productData = getProductAnalysis();
  const alerts = getAlerts();

  // Top SKUs by order frequency
  const skuFrequency: Record<string, { name: string; count: number }> = {};
  orderData.forEach((o) => {
    o.items.forEach((item) => {
      if (!skuFrequency[item.itemId]) skuFrequency[item.itemId] = { name: item.itemName, count: 0 };
      skuFrequency[item.itemId].count += item.quantity;
    });
  });
  const topSkus = Object.values(skuFrequency).sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <div className="space-y-5 pb-6">
      <PageHeader
        title="数据看板"
        subtitle="权益管理全局经营分析与运营预警"
        actions={
          <button className="btn-secondary"><RefreshCw className="h-4 w-4" /> 刷新数据</button>
        }
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard icon={Users} label="总客户数" value={`${kpis.totalCustomers}`} sub={`活跃 ${kpis.activeCustomers}`} />
        <KPICard icon={DollarSign} label="本月收入" value={`¥${(kpis.thisMonthRevenue / 10000).toFixed(1)}万`} trend={kpis.revenueGrowth} trendLabel="环比" />
        <KPICard icon={Heart} label="平均健康度" value={`${kpis.avgHealth}分`} sub={kpis.avgHealth >= 65 ? "良好" : "需关注"} />
        <KPICard icon={RefreshCw} label="平均续订率" value={`${kpis.avgRenewal}%`} sub={kpis.avgRenewal >= 80 ? "健康" : "偏低"} />
        <KPICard icon={Activity} label="平均使用率" value={`${kpis.avgUsage}%`} sub={`${kpis.totalOrders}个订单`} />
      </div>

      {/* ── Row 2: Revenue Trend + Health Distribution ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* 收入趋势 */}
        <div className="col-span-8 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 月度收入趋势
            </h3>
            <span className="text-[12px] text-muted-foreground">近12个月</span>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 10000}万`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`¥${v.toLocaleString()}`, "收入"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 健康分布 */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-primary" /> 客户健康分布
          </h3>
          <div className="h-[160px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthDist}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {healthDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v}个客户`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-1">
            {healthDist.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Product Analysis + Customer Growth ── */}
      <div className="grid grid-cols-12 gap-4">
        {/* 产品分析 */}
        <div className="col-span-5 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-primary" /> 产品维度分析
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [name === "customers" ? `${v}个` : `${v}%`, name === "customers" ? "客户数" : "平均使用率"]}
                />
                <Bar dataKey="customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} name="客户数" />
                <Bar dataKey="avgUsage" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} barSize={20} name="平均使用率%" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Product list */}
          <div className="mt-4 pt-3 border-t space-y-2">
            {productData.map((p) => (
              <div key={p.fullName} className="flex items-center justify-between text-[12px]">
                <span className="text-foreground font-medium">{p.fullName}</span>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{p.customers}个客户</span>
                  <span className="text-muted-foreground">使用率 {p.avgUsage}%</span>
                  <span className="text-foreground font-medium">¥{p.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 客户增长 */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-primary" /> 客户增长趋势
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CUSTOMER_GROWTH} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="newAdd" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} barSize={14} name="新增" />
                <Bar dataKey="churn" fill="hsl(var(--destructive) / 0.6)" radius={[4, 4, 0, 0]} barSize={14} name="流失" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 热销商品 */}
        <div className="col-span-3 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <ShoppingCart className="h-4 w-4 text-primary" /> 热销商品 TOP
          </h3>
          <div className="space-y-3">
            {topSkus.map((sku, idx) => (
              <div key={sku.name} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold ${
                  idx < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-foreground truncate">{sku.name}</div>
                </div>
                <span className="text-[12px] text-muted-foreground font-mono">{sku.count}次</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 4: Operational Alerts ── */}
      <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: "hsl(var(--warning))" }} /> 运营预警
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-destructive/10 text-destructive">
              {alerts.length}
            </span>
          </h3>
          <Link to="/entitlement/account" className="text-[12px] text-primary hover:underline flex items-center gap-1">
            查看全部账户 <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {alerts.map((alert, i) => {
            const style = ALERT_STYLES[alert.type];
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{ background: style.bg, borderColor: style.border }}
              >
                <alert.icon className="h-4 w-4 shrink-0" style={{ color: style.dot }} />
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: `${style.dot}15`, color: style.dot }}>
                    {alert.label}
                  </span>
                  <Link
                    to={`/entitlement/account/detail/${alert.accId}`}
                    className="text-[13px] font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {alert.customer}
                  </Link>
                  <span className="text-[12px] text-muted-foreground">{alert.detail}</span>
                </div>
                <Link
                  to={`/entitlement/account/detail/${alert.accId}`}
                  className="text-[12px] text-primary hover:underline flex items-center gap-1 shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" /> 查看
                </Link>
              </div>
            );
          })}
          {alerts.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-[13px]">暂无预警</div>
          )}
        </div>
      </div>

      {/* ── Row 5: Order Status Distribution ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* 订单类型分布 */}
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <ShoppingCart className="h-4 w-4 text-primary" /> 订单类型分布
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ORDER_TYPES.map((t) => {
              const count = orderData.filter((o) => o.orderType === t.value).length;
              const amount = orderData.filter((o) => o.orderType === t.value).reduce((s, o) => s + o.totalAmount, 0);
              return (
                <div key={t.value} className="rounded-lg border p-3" style={{ background: "hsl(var(--muted) / 0.3)" }}>
                  <div className="text-[11px] text-muted-foreground mb-1">{t.label}</div>
                  <div className="text-[18px] font-bold text-foreground">{count}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">¥{amount.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 订单状态漏斗 */}
        <div className="bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <h3 className="text-[14px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" /> 订单状态分布
          </h3>
          <div className="flex items-end gap-3 h-[80px]">
            {ORDER_STATUS.map((s) => {
              const count = orderData.filter((o) => o.orderStatus === s.value).length;
              const maxCount = Math.max(...ORDER_STATUS.map((st) => orderData.filter((o) => o.orderStatus === st.value).length), 1);
              const height = Math.max((count / maxCount) * 100, 8);
              return (
                <div key={s.value} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[12px] font-semibold text-foreground">{count}</span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${height}%`,
                      background: "hsl(var(--primary) / 0.15)",
                      borderTop: "2px solid hsl(var(--primary))",
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
