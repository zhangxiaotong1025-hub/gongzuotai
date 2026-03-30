import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, CheckCircle2, Users, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Target,
  Gift, Send, Repeat, UserPlus, DollarSign, Percent, ArrowUpRight, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP,
  ALERT_TYPE_MAP, CAMPAIGN_TYPE_MAP, CAMPAIGN_STATUS_MAP,
  generateDesigners, generateEndCustomers, generateAlerts, generateCampaigns,
} from "@/data/customer";

const DESIGNERS = generateDesigners(40);
const END_CUSTOMERS = generateEndCustomers(35);
const ALERTS = generateAlerts();
const CAMPAIGNS = generateCampaigns();

export default function CustomerOverview() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(ALERTS);

  const dStages = useMemo(() => {
    const m: Record<string, number> = {};
    DESIGNERS.forEach(d => { m[d.lifecycle] = (m[d.lifecycle] || 0) + 1; });
    return m;
  }, []);

  const ecStages = useMemo(() => {
    const m: Record<string, number> = {};
    END_CUSTOMERS.forEach(c => { m[c.lifecycle] = (m[c.lifecycle] || 0) + 1; });
    return m;
  }, []);

  const avgUsage = Math.round(DESIGNERS.reduce((a, d) => a + d.usageRate, 0) / DESIGNERS.length);
  const avgCvs = Math.round(DESIGNERS.reduce((a, d) => a + d.cvsScore, 0) / DESIGNERS.length);
  const unhandledAlerts = alerts.filter(a => !a.handled).length;

  // ── 转化率 / 复购率 / 带单率 模拟数据
  const conversionRate = 34; // 注册→付费转化率
  const repurchaseRate = 62; // 复购率
  const referralRate = 18;   // 带单率（推荐转化）
  const avgLtv = 24500;
  const monthlyRevenue = [12, 15, 18, 14, 22, 19, 25, 21, 28, 24, 30, 27]; // 万
  const conversionFunnel = [
    { stage: "访问注册", count: 1200, pct: 100 },
    { stage: "完成注册", count: 680, pct: 57 },
    { stage: "激活试用", count: 420, pct: 35 },
    { stage: "首次付费", count: 245, pct: 20 },
    { stage: "续费复购", count: 152, pct: 13 },
    { stage: "推荐他人", count: 44, pct: 4 },
  ];
  const ecConversionFunnel = [
    { stage: "新客录入", count: 350, pct: 100 },
    { stage: "有效跟进", count: 280, pct: 80 },
    { stage: "到店体验", count: 165, pct: 47 },
    { stage: "报价确认", count: 120, pct: 34 },
    { stage: "签约成交", count: 85, pct: 24 },
    { stage: "转介绍", count: 22, pct: 6 },
  ];

  const markHandled = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, handled: true } : a));
    toast.success("已标记处理");
  };

  return (
    <div>
      <PageHeader title="客户概览" subtitle="全局客户资产、转化漏斗与运营数据" />

      {/* ── 核心运营 KPI ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
        <KpiCard icon={Users} label="设计师总数" value={DESIGNERS.length} onClick={() => navigate("/customer/list")} />
        <KpiCard icon={Users} label="企业客户" value={END_CUSTOMERS.length} onClick={() => navigate("/customer/list")} />
        <KpiCard icon={Target} label="注册→付费转化" value={`${conversionRate}%`} color="text-primary" trend="+3.2%" trendUp />
        <KpiCard icon={Repeat} label="复购率" value={`${repurchaseRate}%`} color="text-emerald-600" trend="+5.8%" trendUp />
        <KpiCard icon={UserPlus} label="带单率" value={`${referralRate}%`} color="text-primary" trend="+1.2%" trendUp />
        <KpiCard icon={DollarSign} label="平均LTV" value={`¥${(avgLtv/10000).toFixed(1)}万`} />
        <KpiCard icon={BarChart3} label="平均CVS" value={avgCvs} color="text-primary" />
        <KpiCard icon={AlertTriangle} label="待处理预警" value={unhandledAlerts} color={unhandledAlerts > 0 ? "text-amber-600" : "text-emerald-600"} />
      </div>

      {/* ── 转化漏斗 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <FunnelCard title="设计师转化漏斗" subtitle="从访问到推荐的全链路" funnel={conversionFunnel} />
        <FunnelCard title="企业客户转化漏斗" subtitle="从录入到转介绍的销售漏斗" funnel={ecConversionFunnel} />
      </div>

      {/* ── 月度营收趋势 + 生命周期分布 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue Trend */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">月度营收趋势</h4>
            <span className="text-xs text-muted-foreground">近12个月 (万元)</span>
          </div>
          <div className="flex items-end gap-[3px] h-28">
            {monthlyRevenue.map((v, i) => {
              const max = Math.max(...monthlyRevenue);
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-primary/30 hover:bg-primary/60 rounded-t transition-colors cursor-default"
                    style={{ height: `${(v / max) * 100}%` }}
                    title={`${i + 1}月: ¥${v}万`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            {["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"].map(m => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>

        {/* Designer Stage Distribution */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">设计师生命周期</h4>
            <button onClick={() => navigate("/customer/list")} className="text-xs text-primary hover:underline">查看 →</button>
          </div>
          <div className="space-y-2">
            {Object.entries(DESIGNER_LIFECYCLE_MAP).map(([k, v]) => {
              const count = dStages[k] || 0;
              const pct = DESIGNERS.length > 0 ? Math.round((count / DESIGNERS.length) * 100) : 0;
              return (
                <div key={k} className="flex items-center gap-2">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[48px] justify-center ${v.color}`}>{v.label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium min-w-[20px] text-right">{count}</span>
                  <span className="text-[10px] text-muted-foreground min-w-[28px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* EC Stage Distribution */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">企业客户生命周期</h4>
            <button onClick={() => navigate("/customer/list")} className="text-xs text-primary hover:underline">查看 →</button>
          </div>
          <div className="space-y-2">
            {Object.entries(END_CUSTOMER_LIFECYCLE_MAP).map(([k, v]) => {
              const count = ecStages[k] || 0;
              const pct = END_CUSTOMERS.length > 0 ? Math.round((count / END_CUSTOMERS.length) * 100) : 0;
              return (
                <div key={k} className="flex items-center gap-2">
                  <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium min-w-[48px] justify-center ${v.color}`}>{v.label}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium min-w-[20px] text-right">{count}</span>
                  <span className="text-[10px] text-muted-foreground min-w-[28px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alerts + Active Campaigns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Alerts */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />运营预警
              {unhandledAlerts > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{unhandledAlerts}</span>}
            </h4>
          </div>
          <div className="space-y-2">
            {alerts.filter(a => !a.handled).slice(0, 5).map(a => {
              const info = ALERT_TYPE_MAP[a.alertType];
              return (
                <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${a.alertLevel === "red" ? "border-red-200 bg-red-50/30" : a.alertLevel === "orange" ? "border-orange-200 bg-orange-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                  <div className="flex items-center gap-3">
                    <span>{info?.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{a.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">{a.detail}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs"
                      onClick={() => navigate(`/customer/detail/${a.id}`)}>
                      <Eye className="h-3 w-3 mr-1" />查看
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => markHandled(a.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />处理
                    </Button>
                  </div>
                </div>
              );
            })}
            {unhandledAlerts === 0 && <p className="text-sm text-muted-foreground text-center py-4">🎉 所有预警已处理</p>}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium flex items-center gap-2"><Send className="h-4 w-4 text-muted-foreground" />活跃营销活动</h4>
            <button onClick={() => navigate("/customer/marketing")} className="text-xs text-primary hover:underline">管理活动 →</button>
          </div>
          <div className="space-y-3">
            {CAMPAIGNS.filter(c => c.status === "running" || c.status === "pending").map(c => {
              const rate = c.reachCount > 0 ? Math.round((c.convertCount / c.reachCount) * 100) : 0;
              return (
                <div key={c.id} className="p-3 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${CAMPAIGN_STATUS_MAP[c.status].color}`}>{CAMPAIGN_STATUS_MAP[c.status].label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{CAMPAIGN_TYPE_MAP[c.type]} · {c.segmentName}</div>
                  <div className="flex justify-between text-xs">
                    <span>触达 {c.reachCount}/{c.targetCount}</span>
                    <span>转化 {c.convertCount}人</span>
                    <span className="font-medium text-primary">ROI {rate}%</span>
                  </div>
                  <div className="flex gap-0.5 mt-2 h-1.5">
                    <div className="bg-blue-400 rounded-l" style={{ width: `${c.targetCount > 0 ? (c.reachCount / c.targetCount) * 100 : 0}%` }} />
                    <div className="bg-primary rounded-r" style={{ width: `${c.targetCount > 0 ? (c.convertCount / c.targetCount) * 100 : 0}%` }} />
                    <div className="flex-1 bg-muted rounded-r" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function KpiCard({ icon: Icon, label, value, color, onClick, trend, trendUp }: {
  icon: React.ElementType; label: string; value: React.ReactNode; color?: string; onClick?: () => void; trend?: string; trendUp?: boolean;
}) {
  return (
    <button onClick={onClick} className="rounded-xl border border-border/60 bg-card p-3 text-center hover:border-primary/40 transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
      <div className={`text-lg font-bold ${color || "text-foreground"}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      {trend && (
        <div className={`flex items-center justify-center gap-0.5 text-[10px] mt-0.5 ${trendUp ? "text-emerald-600" : "text-red-600"}`}>
          {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{trend}
        </div>
      )}
    </button>
  );
}

function FunnelCard({ title, subtitle, funnel }: { title: string; subtitle: string; funnel: { stage: string; count: number; pct: number }[] }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="mb-4">
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-2">
        {funnel.map((f, i) => {
          const prevPct = i > 0 ? funnel[i - 1].pct : 100;
          const dropRate = i > 0 ? Math.round(((prevPct - f.pct) / prevPct) * 100) : 0;
          return (
            <div key={f.stage}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</span>
                  <span className="text-xs font-medium">{f.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium">{f.count}</span>
                  <span className="text-[10px] text-muted-foreground min-w-[32px] text-right">{f.pct}%</span>
                  {i > 0 && <span className="text-[10px] text-red-500 min-w-[36px] text-right">↓{dropRate}%</span>}
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden ml-7">
                <div className={`h-full rounded-full transition-all ${i === funnel.length - 1 ? "bg-emerald-500" : "bg-primary/60"}`} style={{ width: `${f.pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border/40 flex justify-between text-xs text-muted-foreground">
        <span>总转化率: <strong className="text-primary">{funnel[funnel.length - 2]?.pct || 0}%</strong></span>
        <span>最大流失: <strong className="text-red-500">{funnel[1]?.stage} → {funnel[2]?.stage}</strong></span>
      </div>
    </div>
  );
}
