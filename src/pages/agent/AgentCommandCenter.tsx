import { useState } from "react";
import {
  Brain, AlertTriangle, TrendingUp, TrendingDown, Minus,
  ArrowRight, Zap, Target, ShieldAlert, Lightbulb, Clock,
  CheckCircle2, ChevronRight, Activity, Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import {
  generateInsights, generateBusinessHealth, generateRecommendations,
  type AgentInsight, type BusinessHealthModule, type AIRecommendation,
} from "@/data/agent-business";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const INSIGHTS = generateInsights();
const HEALTH = generateBusinessHealth();
const RECOMMENDATIONS = generateRecommendations();

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  critical: { bg: "bg-red-50/60", border: "border-red-200", icon: <ShieldAlert className="h-4 w-4 text-red-600" />, label: "严重" },
  warning: { bg: "bg-amber-50/60", border: "border-amber-200", icon: <AlertTriangle className="h-4 w-4 text-amber-600" />, label: "警告" },
  opportunity: { bg: "bg-emerald-50/60", border: "border-emerald-200", icon: <Lightbulb className="h-4 w-4 text-emerald-600" />, label: "机会" },
  info: { bg: "bg-blue-50/60", border: "border-blue-200", icon: <Clock className="h-4 w-4 text-blue-600" />, label: "提醒" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "bg-red-100", text: "text-red-700" },
  high: { bg: "bg-amber-100", text: "text-amber-700" },
  medium: { bg: "bg-blue-100", text: "text-blue-700" },
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) =>
  trend === "up" ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
    : trend === "down" ? <TrendingDown className="h-3.5 w-3.5 text-red-600" />
    : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;

function HealthScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - score / 100);
  const color = score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-red-500";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className="stroke-muted/40" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={4} className={color}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground text-sm font-bold">{score}</text>
    </svg>
  );
}

export default function AgentCommandCenter() {
  const navigate = useNavigate();
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  const activeInsights = INSIGHTS.filter(i => !dismissedInsights.has(i.id));
  const criticalCount = activeInsights.filter(i => i.severity === "critical").length;
  const warningCount = activeInsights.filter(i => i.severity === "warning").length;

  return (
    <div>
      <PageHeader
        title="智能经营中心"
        subtitle="AI 驱动的业务洞察与行动建议 — 帮你做好每一笔生意"
      />

      {/* ── Top: Overall Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {HEALTH.map(h => (
          <div key={h.module} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <HealthScoreRing score={h.score} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{h.module}</span>
                  <TrendIcon trend={h.trend} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {h.keyMetric.label}: <span className="font-medium text-foreground">{h.keyMetric.value}</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {h.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <span className="shrink-0 mt-0.5">•</span>
                  <span className="leading-relaxed">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Alert Banner ── */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 p-3 mb-5 rounded-xl border border-red-200 bg-red-50/40">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100">
            <Zap className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-red-800">
              {criticalCount} 个严重问题需要立即处理
            </span>
            <span className="text-xs text-red-600 ml-2">
              {warningCount > 0 && `另有 ${warningCount} 个警告`}
            </span>
          </div>
          <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => {
            const el = document.getElementById("insights-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}>
            查看详情 <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── Left: Proactive Insights ── */}
        <div className="xl:col-span-3 space-y-4" id="insights-section">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI 实时洞察
              <span className="text-[11px] font-normal text-muted-foreground">
                基于业务数据自动分析
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">{activeInsights.length} 条待处理</span>
          </div>

          <div className="space-y-3">
            {activeInsights.map(insight => {
              const s = SEVERITY_STYLES[insight.severity];
              return (
                <div key={insight.id} className={`rounded-xl border ${s.border} ${s.bg} p-4 transition-all hover:shadow-sm`}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{insight.title}</span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          insight.severity === "critical" ? "bg-red-100 text-red-700"
                            : insight.severity === "warning" ? "bg-amber-100 text-amber-700"
                            : insight.severity === "opportunity" ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>{s.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{insight.summary}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {insight.metric && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/80 border border-border/40">
                              <span className="text-[11px] text-muted-foreground">{insight.metric.label}</span>
                              <span className="text-sm font-bold">{insight.metric.value}</span>
                              {insight.metric.trend && <TrendIcon trend={insight.metric.trend} />}
                              {insight.metric.change && (
                                <span className={`text-[10px] font-medium ${
                                  insight.metric.trend === "down" ? "text-red-600" : "text-emerald-600"
                                }`}>{insight.metric.change}</span>
                              )}
                            </div>
                          )}
                          <span className="text-[11px] text-muted-foreground">{insight.timestamp}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground"
                            onClick={() => { setDismissedInsights(prev => new Set([...prev, insight.id])); toast.success("已忽略"); }}>
                            忽略
                          </Button>
                          <Button size="sm" className="h-7 text-xs"
                            onClick={() => insight.action.route ? navigate(insight.action.route) : toast.info("功能开发中")}>
                            {insight.action.label} <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: AI Recommendations ── */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI 行动建议
            <span className="text-[11px] font-normal text-muted-foreground">按优先级排序</span>
          </h3>

          <div className="space-y-3">
            {RECOMMENDATIONS.map(rec => {
              const ps = PRIORITY_STYLES[rec.priority];
              return (
                <div key={rec.id} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${ps.bg} ${ps.text}`}>
                        {rec.priority === "urgent" ? "紧急" : rec.priority === "high" ? "高优" : "建议"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{rec.domain}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      rec.effort === "low" ? "bg-emerald-100 text-emerald-700"
                        : rec.effort === "medium" ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {rec.effort === "low" ? "低成本" : rec.effort === "medium" ? "中等投入" : "高投入"}
                    </span>
                  </div>

                  <h4 className="text-sm font-medium mb-1">{rec.title}</h4>
                  <p className="text-[11px] text-muted-foreground mb-2">{rec.reason}</p>

                  <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60">
                    <Target className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="text-[11px] text-emerald-700 font-medium">{rec.expectedImpact}</span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {rec.actions.map((a, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-primary/60" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>

                  <Button size="sm" variant="outline" className="w-full h-7 text-xs"
                    onClick={() => toast.success("已加入执行队列")}>
                    <Zap className="h-3 w-3 mr-1" />
                    一键执行
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
