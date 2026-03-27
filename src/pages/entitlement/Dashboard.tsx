import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  accountData, orderData, appData, skuData, bundleData,
  getAccountStats, getAccountHealth,
  ORDER_STATUS, ORDER_TYPES,
} from "@/data/entitlement";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Heart, ShoppingCart,
  AlertTriangle, Clock, UserX, Zap, RefreshCw, Eye,
  Package, Activity, ArrowUpRight, Calendar, Filter, ChevronDown,
  Target, BarChart3, Layers,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ═══════════════════════════════════════════
   MOCK DATA — richer & more realistic
   ═══════════════════════════════════════════ */

const MONTHLY_DATA = [
  { month: "2025-04", revenue: 523800, orders: 38, newCustomers: 4, churn: 1, avgUsage: 42 },
  { month: "2025-05", revenue: 618200, orders: 45, newCustomers: 6, churn: 1, avgUsage: 45 },
  { month: "2025-06", revenue: 742500, orders: 52, newCustomers: 5, churn: 2, avgUsage: 48 },
  { month: "2025-07", revenue: 891300, orders: 61, newCustomers: 8, churn: 1, avgUsage: 51 },
  { month: "2025-08", revenue: 856000, orders: 58, newCustomers: 5, churn: 3, avgUsage: 49 },
  { month: "2025-09", revenue: 1052000, orders: 72, newCustomers: 9, churn: 2, avgUsage: 53 },
  { month: "2025-10", revenue: 1124000, orders: 78, newCustomers: 7, churn: 2, avgUsage: 55 },
  { month: "2025-11", revenue: 986500, orders: 68, newCustomers: 6, churn: 3, avgUsage: 52 },
  { month: "2025-12", revenue: 1283000, orders: 89, newCustomers: 11, churn: 2, avgUsage: 58 },
  { month: "2026-01", revenue: 1356000, orders: 94, newCustomers: 8, churn: 1, avgUsage: 61 },
  { month: "2026-02", revenue: 1428000, orders: 98, newCustomers: 7, churn: 2, avgUsage: 63 },
  { month: "2026-03", revenue: 1562000, orders: 108, newCustomers: 9, churn: 1, avgUsage: 66 },
];

const DAILY_USAGE = [
  { day: "03-21", ai: 892, render4k: 156, render8k: 42, guide: 234, leads: 67 },
  { day: "03-22", ai: 1024, render4k: 178, render8k: 38, guide: 256, leads: 72 },
  { day: "03-23", ai: 756, render4k: 132, render8k: 28, guide: 198, leads: 54 },
  { day: "03-24", ai: 1156, render4k: 201, render8k: 52, guide: 278, leads: 81 },
  { day: "03-25", ai: 1289, render4k: 223, render8k: 61, guide: 312, leads: 93 },
  { day: "03-26", ai: 1102, render4k: 189, render8k: 48, guide: 267, leads: 78 },
  { day: "03-27", ai: 1345, render4k: 245, render8k: 58, guide: 298, leads: 86 },
];

/* ═══ Computed data ═══ */
function useComputedData(timeRange: string, appFilter: string) {
  return useMemo(() => {
    const sliceCount = timeRange === "quarter" ? 3 : timeRange === "half" ? 6 : 12;
    const monthlySlice = MONTHLY_DATA.slice(-sliceCount);

    const currentMonth = monthlySlice[monthlySlice.length - 1];
    const prevMonth = monthlySlice.length >= 2 ? monthlySlice[monthlySlice.length - 2] : currentMonth;
    const revenueGrowth = prevMonth.revenue > 0
      ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
      : 0;

    const filteredAccounts = appFilter === "all"
      ? accountData
      : accountData.filter((a) => a.appIds.includes(appFilter));

    const totalCustomers = filteredAccounts.length;
    const activeCustomers = filteredAccounts.filter((a) => a.status === "active").length;
    const healths = filteredAccounts.map((a) => getAccountHealth(a.id));
    const avgHealth = healths.length > 0 ? Math.round(healths.reduce((s, h) => s + h.healthScore, 0) / healths.length) : 0;
    const avgRenewal = healths.length > 0 ? Math.round(healths.reduce((s, h) => s + h.renewalRate, 0) / healths.length * 10) / 10 : 0;
    const allStats = filteredAccounts.map((a) => getAccountStats(a));
    const avgUsage = allStats.length > 0 ? Math.round(allStats.reduce((s, st) => s + st.usageRate, 0) / allStats.length * 10) / 10 : 0;
    const totalActiveUsers = healths.reduce((s, h) => s + h.activeUsers, 0);
    const totalUsers = healths.reduce((s, h) => s + h.totalUsers, 0);

    // Health distribution
    const dist = { excellent: 0, good: 0, warning: 0, critical: 0 };
    filteredAccounts.forEach((a) => { dist[getAccountHealth(a.id).healthLevel]++; });
    const healthDist = [
      { name: "优秀", value: dist.excellent, color: "hsl(158, 40%, 44%)" },
      { name: "良好", value: dist.good, color: "hsl(222, 60%, 50%)" },
      { name: "预警", value: dist.warning, color: "hsl(36, 60%, 50%)" },
      { name: "危险", value: dist.critical, color: "hsl(0, 55%, 52%)" },
    ].filter((d) => d.value > 0);

    // Product analysis
    const productData = appData.filter((a) => a.status === "active").map((app) => {
      const customers = filteredAccounts.filter((a) => a.appIds.includes(app.id));
      const revenue = orderData
        .filter((o) => o.items.some((i) => {
          const sku = skuData.find((s) => s.id === i.itemId);
          const bun = bundleData.find((b) => b.id === i.itemId);
          return sku?.appId === app.id || bun?.appId === app.id;
        }))
        .reduce((s, o) => s + o.totalAmount, 0);
      const stats = customers.map((c) => getAccountStats(c));
      const au = stats.length > 0 ? Math.round(stats.reduce((s, st) => s + st.usageRate, 0) / stats.length) : 0;
      return { id: app.id, name: app.name, shortName: app.name.slice(0, 4), customers: customers.length, revenue, avgUsage: au };
    });

    // Alerts
    const alerts: { type: "danger" | "warning"; icon: typeof AlertTriangle; label: string; customer: string; accId: string; detail: string; urgency: number }[] = [];
    filteredAccounts.forEach((acc) => {
      const health = getAccountHealth(acc.id);
      const stats = getAccountStats(acc);
      if (stats.usageRate >= 80) alerts.push({ type: "danger", icon: Zap, label: "额度告急", customer: acc.customerName, accId: acc.id, detail: `使用率${stats.usageRate}%，需扩容`, urgency: 3 });
      if (health.lastLoginDays >= 15) alerts.push({ type: "warning", icon: UserX, label: "沉默客户", customer: acc.customerName, accId: acc.id, detail: `${health.lastLoginDays}天未登录`, urgency: 2 });
      if (health.intentSignals.some((s) => s.label === "合同到期" && (s.value.includes("已过期") || parseInt(s.value) <= 90)))
        alerts.push({ type: "danger", icon: Clock, label: "合同到期", customer: acc.customerName, accId: acc.id, detail: health.intentSignals.find((s) => s.label === "合同到期")?.value || "", urgency: 3 });
      if (health.renewalRate < 70) alerts.push({ type: "warning", icon: RefreshCw, label: "续约风险", customer: acc.customerName, accId: acc.id, detail: `续订率${health.renewalRate}%`, urgency: 1 });
    });
    alerts.sort((a, b) => b.urgency - a.urgency);

    // Top SKUs
    const skuFreq: Record<string, { name: string; count: number; revenue: number }> = {};
    orderData.forEach((o) => o.items.forEach((item) => {
      if (!skuFreq[item.itemId]) skuFreq[item.itemId] = { name: item.itemName, count: 0, revenue: 0 };
      skuFreq[item.itemId].count += item.quantity;
      skuFreq[item.itemId].revenue += item.unitPrice * item.quantity;
    }));
    const topSkus = Object.values(skuFreq).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
    const maxSkuRevenue = topSkus.length > 0 ? topSkus[0].revenue : 1;

    return {
      monthlySlice, currentMonth, revenueGrowth,
      totalCustomers, activeCustomers, avgHealth, avgRenewal, avgUsage,
      totalActiveUsers, totalUsers,
      healthDist, productData, alerts, topSkus, maxSkuRevenue,
      totalOrders: orderData.length,
    };
  }, [timeRange, appFilter]);
}

/* ═══ Tooltip style ═══ */
const TT_STYLE = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12, boxShadow: "var(--shadow-md)" };

/* ═══ Main Dashboard ═══ */
export default function EntitlementDashboard() {
  const [timeRange, setTimeRange] = useState("year");
  const [appFilter, setAppFilter] = useState("all");

  const d = useComputedData(timeRange, appFilter);

  const ALERT_STYLES = {
    danger: { bg: "hsl(var(--destructive) / 0.03)", border: "hsl(var(--destructive) / 0.12)", color: "hsl(var(--destructive))" },
    warning: { bg: "hsl(var(--warning) / 0.03)", border: "hsl(var(--warning) / 0.12)", color: "hsl(var(--warning))" },
  };

  return (
    <div className="space-y-5 pb-8">
      {/* ═══ Hero Header with gradient ═══ */}
      <div className="rounded-2xl p-6 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, hsl(222 60% 48%) 0%, hsl(250 50% 52%) 40%, hsl(280 45% 48%) 100%)",
      }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.06]" style={{ background: "white" }} />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.04]" style={{ background: "white" }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[22px] font-bold text-white tracking-tight">权益经营看板</h1>
              <p className="text-white/60 text-[13px] mt-0.5">实时监控权益运营核心指标与客户健康状况</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-white/80" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <Calendar className="h-3.5 w-3.5" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent text-white/90 text-[12px] font-medium outline-none cursor-pointer"
                >
                  <option value="quarter" className="text-foreground bg-card">近3个月</option>
                  <option value="half" className="text-foreground bg-card">近6个月</option>
                  <option value="year" className="text-foreground bg-card">近12个月</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-white/80" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <Filter className="h-3.5 w-3.5" />
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  className="bg-transparent text-white/90 text-[12px] font-medium outline-none cursor-pointer"
                >
                  <option value="all" className="text-foreground bg-card">全部应用</option>
                  {appData.filter((a) => a.status === "active").map((a) => (
                    <option key={a.id} value={a.id} className="text-foreground bg-card">{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* KPI Row — glass cards */}
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: "总客户数", value: d.totalCustomers.toString(), unit: "家", sub: `活跃 ${d.activeCustomers}`, icon: Users },
              { label: "本月收入", value: `¥${(d.currentMonth.revenue / 10000).toFixed(1)}`, unit: "万", sub: `${d.revenueGrowth >= 0 ? "+" : ""}${d.revenueGrowth}% 环比`, icon: DollarSign, trend: d.revenueGrowth },
              { label: "平均健康度", value: d.avgHealth.toString(), unit: "分", sub: d.avgHealth >= 65 ? "良好" : "需关注", icon: Heart },
              { label: "平均续订率", value: d.avgRenewal.toString(), unit: "%", sub: d.avgRenewal >= 80 ? "健康" : "偏低", icon: RefreshCw },
              { label: "平均使用率", value: d.avgUsage.toString(), unit: "%", sub: `${d.totalOrders}个订单`, icon: Activity },
              { label: "活跃用户", value: d.totalActiveUsers.toString(), unit: `/${d.totalUsers}人`, sub: `${d.totalUsers > 0 ? Math.round((d.totalActiveUsers / d.totalUsers) * 100) : 0}% 活跃`, icon: Target },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <kpi.icon className="h-3.5 w-3.5 text-white/50" />
                  <span className="text-[11px] text-white/50 font-medium">{kpi.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[22px] font-bold text-white leading-none">{kpi.value}</span>
                  <span className="text-[12px] text-white/40">{kpi.unit}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  {kpi.trend !== undefined && (
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${kpi.trend >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                      {kpi.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    </span>
                  )}
                  <span className="text-[11px] text-white/40">{kpi.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Row 2: Revenue + Health + Usage Heatmap ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Revenue trend — dual axis */}
        <div className="col-span-5 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-semibold text-foreground">收入与订单趋势</h3>
            <span className="text-[11px] text-muted-foreground">{timeRange === "quarter" ? "近3月" : timeRange === "half" ? "近6月" : "近12月"}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mb-3">累计收入 ¥{(d.monthlySlice.reduce((s, m) => s + m.revenue, 0) / 10000).toFixed(1)}万</div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.monthlySlice} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(222, 60%, 50%)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(222, 60%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 10000}万`} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} formatter={(v: number, name: string) => [name === "revenue" ? `¥${v.toLocaleString()}` : `${v}单`, name === "revenue" ? "收入" : "订单数"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(222, 60%, 50%)" strokeWidth={2} fill="url(#revGrad2)" dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "white" }} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--benefit-violet))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} yAxisId={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health distribution — donut + stats */}
        <div className="col-span-3 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-3">客户健康分布</h3>
          <div className="h-[140px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={d.healthDist} cx="50%" cy="50%" innerRadius={40} outerRadius={58} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {d.healthDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} formatter={(v: number, name: string) => [`${v}家`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[20px] font-bold text-foreground">{d.totalCustomers}</span>
              <span className="text-[10px] text-muted-foreground">客户总数</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {d.healthDist.map((h) => (
              <div key={h.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: h.color }} />
                <span className="text-[11px] text-muted-foreground">{h.name}</span>
                <span className="text-[11px] font-semibold text-foreground ml-auto">{h.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily capability consumption */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-1">能力消耗趋势</h3>
          <div className="text-[11px] text-muted-foreground mb-3">近7天各能力调用量</div>
          <div className="h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_USAGE} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(222, 60%, 50%)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(222, 60%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Area type="monotone" dataKey="ai" name="AI设计" stroke="hsl(222, 60%, 50%)" strokeWidth={2} fill="url(#aiGrad)" dot={false} />
                <Line type="monotone" dataKey="render4k" name="4K渲染" stroke="hsl(var(--benefit-teal))" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="guide" name="导购" stroke="hsl(var(--benefit-violet))" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="leads" name="客资" stroke="hsl(var(--benefit-amber))" strokeWidth={1.5} dot={false} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} iconType="circle" iconSize={6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Product + Top SKUs + Customer Growth ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Product cards */}
        <div className="col-span-5 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-4">产品经营概览</h3>
          <div className="space-y-3">
            {d.productData.map((p) => (
              <div key={p.id} className="rounded-lg border p-3 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Link to={`/entitlement/app/detail/${p.id}`} className="text-[13px] font-medium text-foreground hover:text-primary transition-colors">{p.name}</Link>
                  <span className="text-[13px] font-semibold text-foreground">¥{p.revenue > 0 ? (p.revenue / 10000).toFixed(1) + "万" : "0"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3" /> {p.customers}个客户
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[5px] rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${p.avgUsage >= 80 ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${Math.min(p.avgUsage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-medium tabular-nums ${p.avgUsage >= 80 ? "text-destructive" : "text-muted-foreground"}`}>{p.avgUsage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top SKUs — horizontal bars */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-foreground">热销商品排行</h3>
            <span className="text-[11px] text-muted-foreground">按收入排序</span>
          </div>
          <div className="space-y-2.5">
            {d.topSkus.map((sku, idx) => (
              <div key={sku.name} className="flex items-center gap-2.5">
                <span className={`w-[18px] h-[18px] rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  idx < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-foreground font-medium truncate">{sku.name}</span>
                    <span className="text-[11px] text-muted-foreground ml-2 shrink-0">¥{sku.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-[4px] rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all"
                      style={{ width: `${(sku.revenue / d.maxSkuRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer growth */}
        <div className="col-span-3 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-1">客户增长</h3>
          <div className="text-[11px] text-muted-foreground mb-3">新增 vs 流失</div>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA.slice(-6)} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Bar dataKey="newCustomers" fill="hsl(158, 40%, 44%)" radius={[3, 3, 0, 0]} barSize={12} name="新增" />
                <Bar dataKey="churn" fill="hsl(0, 55%, 52%, 0.5)" radius={[3, 3, 0, 0]} barSize={12} name="流失" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2 h-2 rounded-sm" style={{ background: "hsl(158, 40%, 44%)" }} />
              <span className="text-muted-foreground">新增</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2 h-2 rounded-sm" style={{ background: "hsl(0, 55%, 52%, 0.5)" }} />
              <span className="text-muted-foreground">流失</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Row 4: Alerts + Order Status ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Alerts */}
        <div className="col-span-8 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" style={{ color: "hsl(var(--warning))" }} /> 运营预警
              {d.alerts.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground">
                  {d.alerts.length}
                </span>
              )}
            </h3>
            <Link to="/entitlement/account" className="text-[12px] text-primary hover:underline flex items-center gap-1">
              全部账户 <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {d.alerts.slice(0, 6).map((alert, i) => {
              const s = ALERT_STYLES[alert.type];
              return (
                <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-colors hover:border-primary/15" style={{ background: s.bg, borderColor: s.border }}>
                  <alert.icon className="h-3.5 w-3.5 shrink-0" style={{ color: s.color }} />
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0" style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)`, color: s.color }}>{alert.label}</span>
                  <Link to={`/entitlement/account/detail/${alert.accId}`} className="text-[12px] font-medium text-foreground hover:text-primary transition-colors truncate">{alert.customer}</Link>
                  <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{alert.detail}</span>
                  <Link to={`/entitlement/account/detail/${alert.accId}`} className="text-[11px] text-primary hover:underline shrink-0 flex items-center gap-0.5">
                    <Eye className="h-3 w-3" /> 处理
                  </Link>
                </div>
              );
            })}
            {d.alerts.length === 0 && <div className="py-6 text-center text-[13px] text-muted-foreground">暂无预警 🎉</div>}
          </div>
        </div>

        {/* Order funnel */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-4">订单状态概览</h3>
          <div className="space-y-2.5">
            {ORDER_STATUS.map((s) => {
              const count = orderData.filter((o) => o.orderStatus === s.value).length;
              const pct = d.totalOrders > 0 ? Math.round((count / d.totalOrders) * 100) : 0;
              return (
                <div key={s.value} className="flex items-center gap-3">
                  <span className="text-[12px] text-muted-foreground w-[56px] shrink-0 text-right">{s.label}</span>
                  <div className="flex-1 h-[6px] rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/50 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground w-[28px] text-right">{count}</span>
                  <span className="text-[10px] text-muted-foreground w-[32px]">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="border-t mt-4 pt-3">
            <div className="text-[11px] text-muted-foreground mb-2">订单类型</div>
            <div className="grid grid-cols-3 gap-2">
              {ORDER_TYPES.map((t) => {
                const count = orderData.filter((o) => o.orderType === t.value).length;
                return (
                  <div key={t.value} className="text-center rounded-lg p-2" style={{ background: "hsl(var(--muted) / 0.4)" }}>
                    <div className="text-[16px] font-bold text-foreground">{count}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
