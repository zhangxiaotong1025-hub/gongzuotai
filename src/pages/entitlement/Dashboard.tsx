import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  accountData, orderData, appData, skuData, bundleData,
  getAccountStats, getAccountHealth,
  ORDER_STATUS, ORDER_TYPES,
} from "@/data/entitlement";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
  RadialBarChart, RadialBar,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, DollarSign, Heart, ShoppingCart,
  AlertTriangle, Clock, UserX, Zap, RefreshCw, Eye,
  Package, Activity, ArrowUpRight, Calendar, Filter,
  Target, Sparkles, Shield, Crown, BarChart3,
} from "lucide-react";

/* ═══ Animated Counter Hook ═══ */
function useAnimatedValue(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return value;
}

/* ═══ Sparkline Mini Chart ═══ */
function Sparkline({ data, color = "white", height = 32, className = "" }: { data: number[]; color?: string; height?: number; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={height} className={className} viewBox={`0 0 ${w} ${height}`}>
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${w},${height}`}
        fill={`url(#spark-${color.replace(/[^a-z]/gi, "")})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ═══ Gauge Component ═══ */
function Gauge({ value, max = 100, size = 80, label, color }: { value: number; max?: number; size?: number; label: string; color: string }) {
  const pct = Math.min(value / max, 1);
  const radius = (size - 10) / 2;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference - pct * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 10} className="overflow-visible">
        <path
          d={`M 5,${size / 2} A ${radius},${radius} 0 0 1 ${size - 5},${size / 2}`}
          fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeLinecap="round"
        />
        <path
          d={`M 5,${size / 2} A ${radius},${radius} 0 0 1 ${size - 5},${size / 2}`}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="text-[18px] font-bold text-foreground -mt-3">{value}%</span>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}

/* ═══ Mock Data ═══ */
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
  { day: "03-21", ai: 892, render: 198, guide: 234, leads: 67 },
  { day: "03-22", ai: 1024, render: 216, guide: 256, leads: 72 },
  { day: "03-23", ai: 756, render: 160, guide: 198, leads: 54 },
  { day: "03-24", ai: 1156, render: 253, guide: 278, leads: 81 },
  { day: "03-25", ai: 1289, render: 284, guide: 312, leads: 93 },
  { day: "03-26", ai: 1102, render: 237, guide: 267, leads: 78 },
  { day: "03-27", ai: 1345, render: 303, guide: 298, leads: 86 },
];

/* ═══ Computed Data ═══ */
function useComputedData(timeRange: string, appFilter: string) {
  return useMemo(() => {
    const sliceCount = timeRange === "quarter" ? 3 : timeRange === "half" ? 6 : 12;
    const monthlySlice = MONTHLY_DATA.slice(-sliceCount);
    const currentMonth = monthlySlice[monthlySlice.length - 1];
    const prevMonth = monthlySlice.length >= 2 ? monthlySlice[monthlySlice.length - 2] : currentMonth;
    const revenueGrowth = prevMonth.revenue > 0 ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100) : 0;

    const filteredAccounts = appFilter === "all" ? accountData : accountData.filter((a) => a.appIds.includes(appFilter));
    const totalCustomers = filteredAccounts.length;
    const activeCustomers = filteredAccounts.filter((a) => a.status === "active").length;
    const healths = filteredAccounts.map((a) => getAccountHealth(a.id));
    const avgHealth = healths.length > 0 ? Math.round(healths.reduce((s, h) => s + h.healthScore, 0) / healths.length) : 0;
    const avgRenewal = healths.length > 0 ? Math.round(healths.reduce((s, h) => s + h.renewalRate, 0) / healths.length * 10) / 10 : 0;
    const allStats = filteredAccounts.map((a) => getAccountStats(a));
    const avgUsage = allStats.length > 0 ? Math.round(allStats.reduce((s, st) => s + st.usageRate, 0) / allStats.length * 10) / 10 : 0;
    const totalActiveUsers = healths.reduce((s, h) => s + h.activeUsers, 0);
    const totalUsers = healths.reduce((s, h) => s + h.totalUsers, 0);

    const dist = { excellent: 0, good: 0, warning: 0, critical: 0 };
    filteredAccounts.forEach((a) => { dist[getAccountHealth(a.id).healthLevel]++; });
    const healthDist = [
      { name: "优秀", value: dist.excellent, fill: "hsl(158, 40%, 44%)" },
      { name: "良好", value: dist.good, fill: "hsl(222, 60%, 50%)" },
      { name: "预警", value: dist.warning, fill: "hsl(36, 60%, 50%)" },
      { name: "危险", value: dist.critical, fill: "hsl(0, 55%, 52%)" },
    ].filter((d) => d.value > 0);

    const productData = appData.filter((a) => a.status === "active").map((app) => {
      const customers = filteredAccounts.filter((a) => a.appIds.includes(app.id));
      const revenue = orderData.filter((o) => o.items.some((i) => {
        const sku = skuData.find((s) => s.id === i.itemId);
        const bun = bundleData.find((b) => b.id === i.itemId);
        return sku?.appId === app.id || bun?.appId === app.id;
      })).reduce((s, o) => s + o.totalAmount, 0);
      const stats = customers.map((c) => getAccountStats(c));
      const au = stats.length > 0 ? Math.round(stats.reduce((s, st) => s + st.usageRate, 0) / stats.length) : 0;
      return { id: app.id, name: app.name, customers: customers.length, revenue, avgUsage: au };
    });

    const alerts: { type: "danger" | "warning"; icon: typeof AlertTriangle; label: string; customer: string; accId: string; detail: string; urgency: number }[] = [];
    filteredAccounts.forEach((acc) => {
      const health = getAccountHealth(acc.id);
      const stats = getAccountStats(acc);
      if (stats.usageRate >= 80) alerts.push({ type: "danger", icon: Zap, label: "额度告急", customer: acc.customerName, accId: acc.id, detail: `使用率${stats.usageRate}%`, urgency: 3 });
      if (health.lastLoginDays >= 15) alerts.push({ type: "warning", icon: UserX, label: "沉默客户", customer: acc.customerName, accId: acc.id, detail: `${health.lastLoginDays}天未登录`, urgency: 2 });
      if (health.intentSignals.some((s) => s.label === "合同到期" && (s.value.includes("已过期") || parseInt(s.value) <= 90)))
        alerts.push({ type: "danger", icon: Clock, label: "合同到期", customer: acc.customerName, accId: acc.id, detail: health.intentSignals.find((s) => s.label === "合同到期")?.value || "", urgency: 3 });
      if (health.renewalRate < 70) alerts.push({ type: "warning", icon: RefreshCw, label: "续约风险", customer: acc.customerName, accId: acc.id, detail: `续订率${health.renewalRate}%`, urgency: 1 });
    });
    alerts.sort((a, b) => b.urgency - a.urgency);

    const skuFreq: Record<string, { name: string; count: number; revenue: number }> = {};
    orderData.forEach((o) => o.items.forEach((item) => {
      if (!skuFreq[item.itemId]) skuFreq[item.itemId] = { name: item.itemName, count: 0, revenue: 0 };
      skuFreq[item.itemId].count += item.quantity;
      skuFreq[item.itemId].revenue += item.unitPrice * item.quantity;
    }));
    const topSkus = Object.values(skuFreq).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
    const maxSkuRevenue = topSkus.length > 0 ? topSkus[0].revenue : 1;

    // revenue sparkline data
    const revSparkline = monthlySlice.map((m) => m.revenue / 10000);

    return {
      monthlySlice, currentMonth, revenueGrowth, revSparkline,
      totalCustomers, activeCustomers, avgHealth, avgRenewal, avgUsage,
      totalActiveUsers, totalUsers,
      healthDist, productData, alerts, topSkus, maxSkuRevenue,
      totalOrders: orderData.length,
      totalRevenue: monthlySlice.reduce((s, m) => s + m.revenue, 0),
    };
  }, [timeRange, appFilter]);
}

/* ═══ Styles ═══ */
const TT = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 32px hsl(222 20% 10% / 0.12)" };

const PRODUCT_COLORS = [
  "hsl(222, 60%, 50%)", "hsl(var(--benefit-teal))", "hsl(var(--benefit-violet))",
  "hsl(var(--benefit-amber))", "hsl(var(--benefit-rose))",
];

const PRODUCT_ICONS = [Crown, Sparkles, Target, Shield, Users];

/* ═══ Main ═══ */
export default function EntitlementDashboard() {
  const [timeRange, setTimeRange] = useState("year");
  const [appFilter, setAppFilter] = useState("all");
  const d = useComputedData(timeRange, appFilter);

  const animRevenue = useAnimatedValue(Math.round(d.currentMonth.revenue / 10000));
  const animCustomers = useAnimatedValue(d.totalCustomers);
  const animHealth = useAnimatedValue(d.avgHealth);
  const animOrders = useAnimatedValue(d.currentMonth.orders);

  const ALERT_S = {
    danger: { bg: "hsl(var(--destructive) / 0.04)", border: "hsl(var(--destructive) / 0.15)", color: "hsl(var(--destructive))" },
    warning: { bg: "hsl(var(--warning) / 0.04)", border: "hsl(var(--warning) / 0.15)", color: "hsl(var(--warning))" },
  };

  return (
    <div className="space-y-4 pb-8">
      {/* ═══════ HERO — Dark immersive header ═══════ */}
      <div className="rounded-2xl relative overflow-hidden" style={{
        background: "linear-gradient(145deg, hsl(222 45% 12%) 0%, hsl(240 35% 18%) 40%, hsl(260 30% 22%) 70%, hsl(280 25% 18%) 100%)",
      }}>
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, hsl(222 80% 60% / 0.08) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full" style={{ background: "radial-gradient(circle, hsl(280 60% 60% / 0.06) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, hsl(158 50% 50% / 0.05) 0%, transparent 70%)" }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10 p-6">
          {/* Title + Filters */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(222 80% 60%) 0%, hsl(260 60% 60%) 100%)" }}>
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-white tracking-tight">权益经营看板</h1>
                <p className="text-[12px] text-white/40 mt-0.5">实时经营洞察 · 客户健康监控 · 运营预警</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[
                { value: "quarter", label: "季度" },
                { value: "half", label: "半年" },
                { value: "year", label: "全年" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTimeRange(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    timeRange === t.value
                      ? "text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                  style={timeRange === t.value ? { background: "rgba(255,255,255,0.1)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" } : {}}
                >
                  {t.label}
                </button>
              ))}
              <div className="w-px h-5 bg-white/10 mx-1" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Filter className="h-3 w-3 text-white/40" />
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  className="bg-transparent text-white/80 text-[11px] font-medium outline-none cursor-pointer"
                >
                  <option value="all" className="text-foreground bg-card">全部应用</option>
                  {appData.filter((a) => a.status === "active").map((a) => (
                    <option key={a.id} value={a.id} className="text-foreground bg-card">{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* KPI Cards — dark glass */}
          <div className="grid grid-cols-4 gap-3">
            {/* Revenue */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style={{ background: "radial-gradient(circle, hsl(222 80% 60% / 0.1) 0%, transparent 70%)" }} />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-400/70" />
                  <span className="text-[11px] text-white/40 font-medium">本月收入</span>
                </div>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${d.revenueGrowth >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {d.revenueGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {d.revenueGrowth >= 0 ? "+" : ""}{d.revenueGrowth}%
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[28px] font-bold text-white tabular-nums">{animRevenue}</span>
                  <span className="text-[14px] text-white/30 ml-1">万</span>
                </div>
                <Sparkline data={d.revSparkline} color="rgba(96,165,250,0.6)" height={28} />
              </div>
              <div className="text-[10px] text-white/30 mt-2">累计 ¥{(d.totalRevenue / 10000).toFixed(0)}万 · {d.currentMonth.orders}单</div>
            </div>

            {/* Customers */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style={{ background: "radial-gradient(circle, hsl(158 60% 50% / 0.1) 0%, transparent 70%)" }} />
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-emerald-400/70" />
                <span className="text-[11px] text-white/40 font-medium">客户总览</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-white tabular-nums">{animCustomers}</span>
                <span className="text-[12px] text-white/30">家客户</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-white/30">活跃率</span>
                    <span className="text-emerald-400/80 font-medium">{d.totalCustomers > 0 ? Math.round((d.activeCustomers / d.totalCustomers) * 100) : 0}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-400/60 transition-all duration-1000" style={{ width: `${d.totalCustomers > 0 ? (d.activeCustomers / d.totalCustomers) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-white/50 font-medium">{d.totalActiveUsers}</div>
                  <div className="text-[9px] text-white/25">活跃用户</div>
                </div>
              </div>
            </div>

            {/* Health */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style={{ background: "radial-gradient(circle, hsl(260 60% 60% / 0.08) 0%, transparent 70%)" }} />
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-purple-400/70" />
                <span className="text-[11px] text-white/40 font-medium">平均健康度</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-[28px] font-bold text-white tabular-nums">{animHealth}</span>
                  <span className="text-[14px] text-white/30 ml-1">分</span>
                </div>
                <div className="flex gap-1 items-end">
                  {d.healthDist.map((h) => (
                    <div key={h.name} className="flex flex-col items-center gap-1">
                      <div className="w-3 rounded-t-sm transition-all" style={{ height: `${Math.max(h.value * 8, 4)}px`, background: h.fill, opacity: 0.7 }} />
                      <span className="text-[8px] text-white/25">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-white/30 mt-2">续订率 {d.avgRenewal}% · 使用率 {d.avgUsage}%</div>
            </div>

            {/* Orders */}
            <div className="rounded-xl p-4 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8" style={{ background: "radial-gradient(circle, hsl(36 60% 50% / 0.08) 0%, transparent 70%)" }} />
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="h-4 w-4 text-amber-400/70" />
                <span className="text-[11px] text-white/40 font-medium">本月订单</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-white tabular-nums">{animOrders}</span>
                <span className="text-[12px] text-white/30">单</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {ORDER_TYPES.map((t) => {
                  const c = orderData.filter((o) => o.orderType === t.value).length;
                  return (
                    <div key={t.value} className="text-center">
                      <div className="text-[13px] font-semibold text-white/70">{c}</div>
                      <div className="text-[9px] text-white/25">{t.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Row 2: Revenue Chart + Health Gauges + Capability Heatmap ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Revenue trend */}
        <div className="col-span-5 bg-card rounded-xl border p-5 group" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-semibold text-foreground">收入与订单走势</h3>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded bg-primary inline-block" /> 收入</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 rounded inline-block" style={{ background: "hsl(var(--benefit-violet))" }} /> 订单</span>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mb-3">
            累计 ¥{(d.totalRevenue / 10000).toFixed(0)}万
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={d.monthlySlice} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="rg3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(222, 60%, 50%)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(222, 60%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 10000}万`} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} formatter={(v: number, name: string) => [name === "revenue" ? `¥${v.toLocaleString()}` : `${v}单`, name === "revenue" ? "收入" : "订单"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(222, 60%, 50%)" strokeWidth={2} fill="url(#rg3)" dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "white" }} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--benefit-violet))" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Gauges + Distribution */}
        <div className="col-span-3 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-4">经营健康度</h3>
          <div className="flex justify-center gap-4 mb-4">
            <Gauge value={d.avgUsage} label="使用率" color={d.avgUsage >= 80 ? "hsl(var(--destructive))" : "hsl(var(--primary))"} size={78} />
            <Gauge value={d.avgRenewal} label="续订率" color={d.avgRenewal >= 80 ? "hsl(var(--success))" : "hsl(var(--warning))"} size={78} />
          </div>
          <div className="border-t pt-3 mt-1">
            <div className="text-[11px] text-muted-foreground mb-2">客户分布</div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex">
              {d.healthDist.map((h) => (
                <div key={h.name} className="h-full transition-all duration-700" style={{ width: `${(h.value / d.totalCustomers) * 100}%`, background: h.fill }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {d.healthDist.map((h) => (
                <div key={h.name} className="flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: h.fill }} />
                  <span className="text-muted-foreground">{h.name} {h.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Capability consumption */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13px] font-semibold text-foreground">能力消耗实况</h3>
            <span className="text-[10px] text-muted-foreground">近7天</span>
          </div>
          <div className="text-[11px] text-muted-foreground mb-3">日均调用 {Math.round(DAILY_USAGE.reduce((s, d) => s + d.ai + d.render + d.guide + d.leads, 0) / 7).toLocaleString()}次</div>
          <div className="h-[185px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_USAGE} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(222,60%,50%)" stopOpacity={0.1} /><stop offset="100%" stopColor="hsl(222,60%,50%)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} />
                <Area type="monotone" dataKey="ai" name="AI设计" stroke="hsl(222,60%,50%)" strokeWidth={2} fill="url(#aiG)" dot={false} />
                <Line type="monotone" dataKey="render" name="渲染" stroke="hsl(var(--benefit-teal))" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="guide" name="导购" stroke="hsl(var(--benefit-violet))" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="leads" name="客资" stroke="hsl(var(--benefit-amber))" strokeWidth={1.5} dot={false} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} iconType="circle" iconSize={6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ═══ Row 3: Product Cards + Top SKUs + Customer Growth ═══ */}
      <div className="grid grid-cols-12 gap-4">
        {/* Product cards — individual styled */}
        <div className="col-span-5 space-y-2.5">
          <h3 className="text-[13px] font-semibold text-foreground px-1">产品经营概览</h3>
          {d.productData.map((p, idx) => {
            const color = PRODUCT_COLORS[idx % PRODUCT_COLORS.length];
            const Icon = PRODUCT_ICONS[idx % PRODUCT_ICONS.length];
            return (
              <Link
                key={p.id}
                to={`/entitlement/app/detail/${p.id}`}
                className="flex items-center gap-3.5 bg-card rounded-xl border p-3.5 hover:border-primary/20 transition-all group"
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}10` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                    <span className="text-[13px] font-semibold text-foreground">¥{p.revenue > 0 ? (p.revenue / 10000).toFixed(1) + "万" : "0"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-muted-foreground">{p.customers}个客户</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-[4px] rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(p.avgUsage, 100)}%`, background: p.avgUsage >= 80 ? "hsl(var(--destructive))" : color }} />
                      </div>
                      <span className={`text-[10px] font-medium tabular-nums ${p.avgUsage >= 80 ? "text-destructive" : "text-muted-foreground"}`}>{p.avgUsage}%</span>
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* Top SKUs */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-foreground">热销商品排行</h3>
            <span className="text-[10px] text-muted-foreground">按收入</span>
          </div>
          <div className="space-y-3">
            {d.topSkus.map((sku, idx) => (
              <div key={sku.name} className="flex items-center gap-2.5">
                <span className={`w-[18px] h-[18px] rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  idx === 0 ? "bg-amber-500 text-white" : idx === 1 ? "bg-slate-400 text-white" : idx === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-foreground font-medium truncate">{sku.name}</span>
                    <span className="text-[11px] text-foreground font-semibold tabular-nums ml-2 shrink-0">¥{sku.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-[3px] rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{
                      width: `${(sku.revenue / d.maxSkuRevenue) * 100}%`,
                      background: idx === 0 ? "hsl(36, 70%, 50%)" : "hsl(var(--primary) / 0.4)",
                    }} />
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
          <div className="h-[175px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA.slice(-6)} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT} />
                <Bar dataKey="newCustomers" fill="hsl(158, 40%, 44%)" radius={[3, 3, 0, 0]} barSize={10} name="新增" />
                <Bar dataKey="churn" fill="hsl(0, 55%, 52%, 0.4)" radius={[3, 3, 0, 0]} barSize={10} name="流失" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-sm" style={{ background: "hsl(158, 40%, 44%)" }} /> 新增</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-sm" style={{ background: "hsl(0, 55%, 52%, 0.4)" }} /> 流失</span>
          </div>
        </div>
      </div>

      {/* ═══ Row 4: Alerts + Order Status ═══ */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" style={{ color: "hsl(var(--warning))" }} /> 运营预警
              {d.alerts.length > 0 && (
                <span className="relative flex h-5 min-w-[20px] items-center justify-center">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-destructive/20 animate-ping" />
                  <span className="relative inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground">{d.alerts.length}</span>
                </span>
              )}
            </h3>
            <Link to="/entitlement/account" className="text-[11px] text-primary hover:underline flex items-center gap-1">全部账户 <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-1.5">
            {d.alerts.slice(0, 6).map((alert, i) => {
              const s = ALERT_S[alert.type];
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border transition-all hover:translate-x-0.5" style={{ background: s.bg, borderColor: s.border }}>
                  <alert.icon className="h-3.5 w-3.5 shrink-0" style={{ color: s.color }} />
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0" style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)`, color: s.color }}>{alert.label}</span>
                  <Link to={`/entitlement/account/detail/${alert.accId}`} className="text-[12px] font-medium text-foreground hover:text-primary transition-colors truncate">{alert.customer}</Link>
                  <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{alert.detail}</span>
                  <Link to={`/entitlement/account/detail/${alert.accId}`} className="text-[11px] text-primary hover:underline shrink-0">处理</Link>
                </div>
              );
            })}
            {d.alerts.length === 0 && <div className="py-6 text-center text-[13px] text-muted-foreground">暂无预警 🎉</div>}
          </div>
        </div>

        {/* Order status */}
        <div className="col-span-4 bg-card rounded-xl border p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-4">订单状态分布</h3>
          <div className="space-y-2">
            {ORDER_STATUS.map((s) => {
              const count = orderData.filter((o) => o.orderStatus === s.value).length;
              const pct = d.totalOrders > 0 ? Math.round((count / d.totalOrders) * 100) : 0;
              return (
                <div key={s.value} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-muted-foreground w-[50px] shrink-0 text-right">{s.label}</span>
                  <div className="flex-1 h-[5px] rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/40 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground w-[24px] text-right tabular-nums">{count}</span>
                  <span className="text-[10px] text-muted-foreground w-[28px] tabular-nums">{pct}%</span>
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
                    <div className="text-[15px] font-bold text-foreground tabular-nums">{count}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">{t.label}</div>
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
