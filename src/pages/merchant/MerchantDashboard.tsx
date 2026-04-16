import { useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Target, Phone, Star,
  ArrowRight, AlertCircle, CheckCircle2, Clock, Zap,
  ChevronRight, Award, BarChart3, Briefcase, Heart,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { generateMerchantStats, generateMerchantLeads, generateDeals, generateProjects } from "@/data/merchant";

const STATS = generateMerchantStats();
const LEADS = generateMerchantLeads(30);
const DEALS = generateDeals(15);
const PROJECTS = generateProjects(10);

const urgentLeads = LEADS.filter((l) => l.status === "pending_contact").slice(0, 5);
const todayTasks = [
  { label: "待首次联系", count: LEADS.filter((l) => l.status === "pending_contact").length, color: "text-red-500", icon: Phone },
  { label: "待跟进", count: LEADS.filter((l) => l.status === "contacted" || l.status === "interested").length, color: "text-amber-500", icon: Clock },
  { label: "今日约见", count: 3, color: "text-blue-500", icon: Users },
  { label: "待发报价", count: 2, color: "text-purple-500", icon: Briefcase },
];

const funnel = [
  { stage: "派发线索", count: STATS.totalLeads, color: "bg-blue-500/60" },
  { stage: "已联系", count: Math.round(STATS.totalLeads * STATS.contactRate / 100), color: "bg-cyan-500/60" },
  { stage: "意向中", count: Math.round(STATS.totalLeads * 0.45), color: "bg-purple-500/60" },
  { stage: "已约见", count: Math.round(STATS.totalLeads * 0.3), color: "bg-amber-500/60" },
  { stage: "已签单", count: Math.round(STATS.totalLeads * STATS.conversionRate / 100), color: "bg-emerald-500/60" },
];

export default function MerchantDashboard() {
  const nav = useNavigate();

  return (
    <div className="space-y-5">
      <PageHeader title="商家工作台" subtitle="今日经营概览 · 让每条线索都有结果" />

      {/* Credit + KPI row */}
      <div className="grid grid-cols-12 gap-3">
        {/* Credit badge */}
        <div className="col-span-2 rounded-xl border border-border/60 bg-card p-4 flex flex-col items-center justify-center gap-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-black text-primary">{STATS.creditLevel}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">平台信用等级</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="col-span-10 grid grid-cols-5 gap-3">
          {[
            { label: "本月线索", value: STATS.totalLeads, sub: `联系率 ${STATS.contactRate}%`, trend: "up" as const, trendVal: "+12%" },
            { label: "转化率", value: `${STATS.conversionRate}%`, sub: `行业均值 18%`, trend: "up" as const, trendVal: "+3.2%" },
            { label: "平均客单价", value: `¥${(STATS.avgDealAmount / 10000).toFixed(1)}万`, sub: "签约金额", trend: "up" as const, trendVal: "+8%" },
            { label: "本月营收", value: `¥${(STATS.monthlyRevenue / 10000).toFixed(1)}万`, sub: `${STATS.activeProjects}个在建项目`, trend: "up" as const, trendVal: "+15%" },
            { label: "客户满意度", value: STATS.avgSatisfaction.toFixed(1), sub: `${STATS.referralLeads}个转介绍`, trend: "up" as const, trendVal: "+0.2" },
          ].map((k) => (
            <div key={k.label} className="rounded-xl border border-border/60 bg-card p-4 space-y-1.5">
              <div className="text-[11px] text-muted-foreground">{k.label}</div>
              <div className="text-xl font-bold">{k.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{k.sub}</span>
                <div className="flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-500 font-medium">{k.trendVal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Today's tasks */}
        <div className="col-span-4 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> 今日待办
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {todayTasks.map((t) => (
              <div key={t.label} className="rounded-lg border border-border/40 p-3 flex items-center gap-3 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => nav("/merchant/leads")}>
                <t.icon className={`h-5 w-5 ${t.color}`} />
                <div>
                  <div className="text-lg font-bold">{t.count}</div>
                  <div className="text-[10px] text-muted-foreground">{t.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Urgent leads */}
          <div className="mt-4 space-y-2">
            <div className="text-[11px] font-medium text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> 紧急待联系
            </div>
            {urgentLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10">
                <div>
                  <span className="text-[12px] font-medium">{l.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{l.category} · AI{l.aiScore}分</span>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => nav("/merchant/leads")}>
                  跟进 <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div className="col-span-5 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> 本月转化漏斗
          </h3>
          <div className="space-y-2.5">
            {funnel.map((f, i) => (
              <div key={f.stage} className="flex items-center gap-3">
                <div className="w-16 text-[11px] text-muted-foreground text-right shrink-0">{f.stage}</div>
                <div className="flex-1 relative h-7 rounded-md bg-muted/30 overflow-hidden">
                  <div className={`h-full rounded-md ${f.color} transition-all`} style={{ width: `${(f.count / funnel[0].count) * 100}%` }} />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-[11px] font-bold">{f.count}</span>
                  </div>
                </div>
                {i < funnel.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-[11px] font-medium text-primary flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> AI建议
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              您的"已联系→意向中"转化偏低(52%)，建议：① 首次联系后24h内发送案例图册 ② 对AI评分≥80的线索优先安排上门量房
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="col-span-3 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> 快捷入口
          </h3>
          <div className="space-y-2">
            {[
              { label: "我的客资", path: "/merchant/leads", icon: Users, desc: `${STATS.totalLeads}条线索` },
              { label: "签单管理", path: "/merchant/deals", icon: Briefcase, desc: `${DEALS.filter((d) => d.stage === "signed").length}单进行中` },
              { label: "项目交付", path: "/merchant/projects", icon: Target, desc: `${STATS.activeProjects}个在建` },
              { label: "客户评价", path: "/merchant/reviews", icon: Star, desc: `${STATS.avgSatisfaction}分好评` },
              { label: "老客运营", path: "/merchant/retention", icon: Heart, desc: `${STATS.referralLeads}个转介绍` },
            ].map((item) => (
              <button key={item.path} onClick={() => nav(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group">
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium group-hover:text-primary">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Coach banner */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI经营教练</div>
            <div className="text-[11px] text-muted-foreground">
              本月表现优于<span className="text-primary font-medium"> 78% </span>同行商家 · 转化率提升空间约 <span className="text-primary font-medium">5%</span>
            </div>
          </div>
        </div>
        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10">
          查看提升方案 <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
