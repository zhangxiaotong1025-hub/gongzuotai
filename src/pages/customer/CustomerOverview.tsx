import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, CheckCircle2, Users, TrendingUp, AlertTriangle, BarChart3, Target, Gift, Send } from "lucide-react";
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

  const markHandled = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, handled: true } : a));
    toast.success("已标记处理");
  };

  return (
    <div>
      <PageHeader title="客户概览" subtitle="全局客户资产与运营数据" />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard icon={Users} label="设计师总数" value={DESIGNERS.length} onClick={() => navigate("/customer/designer")} />
        <KpiCard icon={Users} label="企业客户总数" value={END_CUSTOMERS.length} onClick={() => navigate("/customer/end-customer")} />
        <KpiCard icon={BarChart3} label="平均使用率" value={`${avgUsage}%`} color="text-primary" />
        <KpiCard icon={Target} label="平均CVS" value={avgCvs} color="text-primary" />
        <KpiCard icon={AlertTriangle} label="待处理预警" value={unhandledAlerts} color={unhandledAlerts > 0 ? "text-amber-600" : "text-emerald-600"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Designer Stage Distribution */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">设计师生命周期分布</h4>
            <button onClick={() => navigate("/customer/designer")} className="text-xs text-primary hover:underline">查看全部 →</button>
          </div>
          <div className="space-y-2.5">
            {Object.entries(DESIGNER_LIFECYCLE_MAP).map(([k, v]) => {
              const count = dStages[k] || 0;
              const pct = DESIGNERS.length > 0 ? Math.round((count / DESIGNERS.length) * 100) : 0;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium min-w-[56px] justify-center ${v.color}`}>{v.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium min-w-[28px] text-right">{count}</span>
                  <span className="text-xs text-muted-foreground min-w-[30px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* EC Stage Distribution */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">企业客户生命周期分布</h4>
            <button onClick={() => navigate("/customer/end-customer")} className="text-xs text-primary hover:underline">查看全部 →</button>
          </div>
          <div className="space-y-2.5">
            {Object.entries(END_CUSTOMER_LIFECYCLE_MAP).map(([k, v]) => {
              const count = ecStages[k] || 0;
              const pct = END_CUSTOMERS.length > 0 ? Math.round((count / END_CUSTOMERS.length) * 100) : 0;
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium min-w-[56px] justify-center ${v.color}`}>{v.label}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium min-w-[28px] text-right">{count}</span>
                  <span className="text-xs text-muted-foreground min-w-[30px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-xl border border-border/60 bg-card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            运营预警
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
                    onClick={() => navigate(a.type === "designer" ? `/customer/designer/detail/${a.id}` : `/customer/end-customer/detail/${a.id}`)}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAMPAIGNS.filter(c => c.status === "running" || c.status === "pending").map(c => {
            const rate = c.reachCount > 0 ? Math.round((c.convertCount / c.reachCount) * 100) : 0;
            return (
              <div key={c.id} className="p-4 rounded-lg border border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${CAMPAIGN_STATUS_MAP[c.status].color}`}>{CAMPAIGN_STATUS_MAP[c.status].label}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{CAMPAIGN_TYPE_MAP[c.type]} · {c.segmentName}</div>
                <div className="flex justify-between text-xs">
                  <span>触达 {c.reachCount}/{c.targetCount}</span>
                  <span className="font-medium text-primary">转化 {rate}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, onClick }: { icon: React.ElementType; label: string; value: React.ReactNode; color?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="rounded-xl border border-border/60 bg-card p-4 text-center hover:border-primary/40 transition-colors">
      <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
      <div className={`text-xl font-bold ${color || "text-foreground"}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </button>
  );
}
