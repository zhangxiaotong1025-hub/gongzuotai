import { useState } from "react";
import {
  TrendingUp, TrendingDown, Minus, AlertCircle, Zap,
  ArrowRight, Brain, BarChart3, Target, Activity,
  Eye, Bot, ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  generateMarketingKPIs, generateFunnel,
  type MarketingKPI, type FunnelStage,
} from "@/data/marketing";
import {
  generatePlatformHealth, generateAutomationRoadmap,
  generatePipelineStages,
  type PipelineStage, type AutomationItem, type BusinessHealthScore,
} from "@/data/agent-leads-pipeline";

const KPIS = generateMarketingKPIs();
const FUNNEL = generateFunnel();
const HEALTH = generatePlatformHealth();
const AUTOMATION = generateAutomationRoadmap();
const PIPELINE = generatePipelineStages();

const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) =>
  trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
    : trend === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;

function HealthRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 70 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="stroke-muted/30" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className={color}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" textAnchor="middle" dy=".35em" className="fill-foreground text-[11px] font-bold">{score}</text>
    </svg>
  );
}

export default function MarketingDashboard() {
  const nav = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="营销驾驶舱"
        subtitle="精准客资全链路监控 · 从流量到成交的闭环管理"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-6 gap-3">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
            <div className="text-[11px] text-muted-foreground">{k.label}</div>
            <div className="text-xl font-bold">{k.value}</div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{k.subValue}</span>
              {k.trend && (
                <div className="flex items-center gap-1">
                  <TrendIcon trend={k.trend} />
                  <span className={`text-[10px] font-medium ${k.trend === "up" && k.status === "danger" ? "text-red-500" : k.trend === "up" ? "text-emerald-600" : k.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                    {k.trendValue}
                  </span>
                </div>
              )}
            </div>
            {k.status && (
              <div className={`h-1 rounded-full ${k.status === "good" ? "bg-emerald-500" : k.status === "warning" ? "bg-amber-500" : "bg-red-500"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Pipeline Funnel */}
        <div className="col-span-7 rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> 管线漏斗
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => nav("/marketing/leads")}>
              查看线索池 <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {FUNNEL.map((f, i) => (
              <div key={f.stage} className="flex items-center gap-3">
                <div className="w-20 text-[11px] text-muted-foreground text-right shrink-0">{f.stage}</div>
                <div className="flex-1 relative h-7 rounded-md bg-muted/30 overflow-hidden">
                  <div
                    className={`h-full rounded-md ${f.color} transition-all duration-500`}
                    style={{ width: `${(f.count / FUNNEL[0].count) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 justify-between">
                    <span className="text-[11px] font-bold text-foreground">{f.count.toLocaleString()}</span>
                    {f.rate !== undefined && (
                      <span className={`text-[10px] font-medium ${f.rate < (f.benchmark || 0) ? "text-red-400" : "text-emerald-400"}`}>
                        {f.rate}% {f.benchmark && `(目标${f.benchmark}%)`}
                      </span>
                    )}
                  </div>
                </div>
                {i < FUNNEL.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Health Scores */}
        <div className="col-span-5 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" /> 经营健康度
          </h3>
          <div className="space-y-3">
            {HEALTH.map((h) => (
              <div key={h.dimension} className="flex items-center gap-3">
                <HealthRing score={h.score} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium">{h.dimension}</span>
                    <TrendIcon trend={h.trend} />
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{h.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Flow + AI Automation */}
      <div className="grid grid-cols-12 gap-4">
        {/* Pipeline stages */}
        <div className="col-span-8 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-primary" /> 管线阶段 · AI自动化进度
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {PIPELINE.map((p) => (
              <div key={p.id} className="rounded-lg border border-border/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold">{p.stage}</span>
                  <span className="text-sm font-bold text-primary">{p.count.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{p.description}</div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">AI覆盖率</span>
                    <span className="text-[10px] font-medium">{p.automationLevel}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/80 transition-all" style={{ width: `${p.automationLevel}%` }} />
                  </div>
                </div>
                {p.bottleneck && (
                  <div className="flex items-start gap-1.5 p-2 rounded-md bg-red-500/5 border border-red-500/10">
                    <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-red-400">{p.bottleneck}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div className="col-span-4 rounded-xl border border-border/60 bg-card p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <Brain className="h-4 w-4 text-primary" /> 快捷导航
          </h3>
          <div className="space-y-2">
            {[
              { label: "渠道ROI分析", path: "/marketing/channels", icon: BarChart3, desc: "6个渠道投放效果对比" },
              { label: "线索池管理", path: "/marketing/leads", icon: Eye, desc: "4,280条待处理线索" },
              { label: "呼叫中心", path: "/marketing/call-center", icon: Bot, desc: "AI+人工坐席工作台" },
              { label: "智能派发", path: "/marketing/distribution", icon: Target, desc: "多维匹配引擎" },
              { label: "跟进追踪", path: "/marketing/tracking", icon: Activity, desc: "Kanban看板+超时预警" },
              { label: "结算中心", path: "/marketing/settlement", icon: Zap, desc: "CPA/CPS对账结算" },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => nav(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
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

      {/* AI Automation Roadmap */}
      <div className="rounded-xl border border-border/60 bg-card p-5">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Bot className="h-4 w-4 text-primary" /> AI自动化路线图
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {AUTOMATION.map((a) => (
            <div key={a.id} className="rounded-lg border border-border/40 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.priority === "P0" ? "bg-red-500/10 text-red-500" : a.priority === "P1" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                  {a.priority}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.status === "ready" ? "bg-emerald-500/10 text-emerald-600" : a.status === "in_progress" ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"}`}>
                  {a.status === "ready" ? "可启动" : a.status === "in_progress" ? "进行中" : "规划中"}
                </span>
              </div>
              <div className="text-[12px] font-medium">{a.capability}</div>
              <div className="text-[10px] text-muted-foreground">{a.stage} · {a.currentState}</div>
              <div className="text-[10px] text-primary/80">→ {a.targetState}</div>
              <div className="text-[10px] text-emerald-600 font-medium">{a.impact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
