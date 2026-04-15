import { useState } from "react";
import {
  Brain, TrendingUp, TrendingDown, Minus,
  ArrowRight, Zap, Target, ChevronRight, Activity,
  Sparkles, Building2, Layers, Eye, Bot,
  AlertCircle, CheckCircle2, Clock, ArrowUpRight,
  DollarSign, Users, Phone, BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  generatePlatformKPIs, generatePlatformHealth,
  generatePipelineStages, generateAutomationRoadmap,
  generateEnterpriseKPIs,
  type PipelineKPI, type PipelineStage, type AutomationItem,
} from "@/data/agent-leads-pipeline";
import {
  generateInsights, generateRecommendations,
  type AgentInsight, type AIRecommendation,
} from "@/data/agent-business";

const PLATFORM_KPIS = generatePlatformKPIs();
const ENTERPRISE_KPIS = generateEnterpriseKPIs();
const PIPELINE = generatePipelineStages();
const HEALTH = generatePlatformHealth();
const AUTOMATION = generateAutomationRoadmap();
const INSIGHTS = generateInsights();
const RECOMMENDATIONS = generateRecommendations();

type Perspective = "platform" | "enterprise";

const TrendIcon = ({ trend, size = 14 }: { trend: "up" | "down" | "flat"; size?: number }) =>
  trend === "up" ? <TrendingUp style={{ width: size, height: size }} className="text-emerald-600" />
    : trend === "down" ? <TrendingDown style={{ width: size, height: size }} className="text-red-500" />
    : <Minus style={{ width: size, height: size }} className="text-muted-foreground" />;

/* ── Health Ring ── */
function HealthRing({ score, size = 48 }: { score: number; size?: number }) {
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
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="fill-foreground text-xs font-bold">{score}</text>
    </svg>
  );
}

/* ── Pipeline Flow Visualization ── */
function PipelineFlow({ stages }: { stages: PipelineStage[] }) {
  const maxCount = stages[0].count;
  return (
    <div className="relative">
      <div className="flex items-stretch gap-0">
        {stages.map((s, i) => {
          const height = Math.max(30, (s.count / maxCount) * 100);
          const autoColor = s.automationLevel >= 30 ? "bg-primary" : s.automationLevel >= 15 ? "bg-amber-500" : "bg-red-400";
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5 group relative">
              {/* Bar */}
              <div className="w-full px-1">
                <div className="relative mx-auto max-w-[80px] rounded-t-lg bg-muted/40 overflow-hidden"
                  style={{ height: `${height}px` }}>
                  <div className="absolute bottom-0 inset-x-0 bg-primary/20 transition-all" style={{ height: `${height}px` }} />
                  <div className="absolute bottom-0 inset-x-0 bg-primary/40 transition-all" style={{ height: `${s.automationLevel}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{s.count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className="text-center px-0.5">
                <div className="text-[11px] font-medium leading-tight">{s.stage}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.description}</div>
              </div>
              {/* Automation indicator */}
              <div className="flex items-center gap-1">
                <div className={`h-1.5 rounded-full ${autoColor}`} style={{ width: `${Math.max(8, s.automationLevel * 0.4)}px` }} />
                <span className="text-[9px] text-muted-foreground">AI {s.automationLevel}%</span>
              </div>
              {/* Bottleneck */}
              {s.bottleneck && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[120px] text-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="text-[9px] text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 whitespace-nowrap">
                    ⚠ {s.bottleneck}
                  </div>
                </div>
              )}
              {/* Arrow */}
              {i < stages.length - 1 && (
                <div className="absolute right-0 top-[40%] translate-x-1/2 z-10 text-muted-foreground/40">
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-2">
        <span>深色区域 = AI自动化覆盖率</span>
        <span>悬停查看瓶颈</span>
      </div>
    </div>
  );
}

/* ── KPI Card ── */
function KPICard({ kpi }: { kpi: PipelineKPI }) {
  const statusColor = kpi.status === "good" ? "text-emerald-600" : kpi.status === "warning" ? "text-amber-600" : "text-red-600";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3.5">
      <div className="text-[11px] text-muted-foreground mb-1">{kpi.label}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-xl font-bold ${statusColor}`}>{kpi.value}</span>
        {kpi.trend && kpi.trendValue && (
          <span className="flex items-center gap-0.5 text-[10px]">
            <TrendIcon trend={kpi.trend} size={10} />
            <span className={kpi.trend === "down" ? "text-red-500" : kpi.trend === "up" && kpi.status === "danger" ? "text-red-500" : "text-emerald-600"}>{kpi.trendValue}</span>
          </span>
        )}
      </div>
      {kpi.subValue && <div className="text-[10px] text-muted-foreground mt-0.5">{kpi.subValue}</div>}
    </div>
  );
}

export default function AgentCommandCenter() {
  const navigate = useNavigate();
  const [perspective, setPerspective] = useState<Perspective>("platform");
  const kpis = perspective === "platform" ? PLATFORM_KPIS : ENTERPRISE_KPIS;

  const overallScore = Math.round(HEALTH.reduce((sum, h) => sum + h.score, 0) / HEALTH.length);
  const p0Ready = AUTOMATION.filter(a => a.priority === "P0" && a.status === "ready").length;

  return (
    <div>
      <PageHeader
        title="智能经营中心"
        subtitle="从线索获取到成交闭环 — AI驱动的客资管线经营"
      />

      {/* ── Perspective Toggle ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex rounded-lg border border-border/60 bg-card p-0.5">
          {([
            { key: "platform" as const, label: "平台视角", icon: Layers, desc: "线索获取·清洗·派发·经营" },
            { key: "enterprise" as const, label: "企业视角", icon: Building2, desc: "客资接收·跟进·转化·反馈" },
          ]).map(p => (
            <button key={p.key} onClick={() => setPerspective(p.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                perspective === p.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}>
              <p.icon className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">{p.label}</div>
                <div className={`text-[10px] ${perspective === p.key ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {p0Ready > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 bg-primary/5">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-xs text-foreground">{p0Ready} 个AI能力已就绪，可立即开启</span>
            <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => toast.success("已开启AI能力")}>
              一键启用
            </Button>
          </div>
        )}
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        {kpis.map(k => <KPICard key={k.label} kpi={k} />)}
      </div>

      {perspective === "platform" ? (
        <>
          {/* ── Pipeline Flow ── */}
          <div className="rounded-xl border border-border/60 bg-card p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                客资管线全景
                <span className="text-[10px] font-normal text-muted-foreground">实时数据 · 本月累计</span>
              </h3>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate("/agent/leads")}>
                详细分析 <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <PipelineFlow stages={PIPELINE} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-5">
            {/* ── Health Scores ── */}
            <div className="xl:col-span-2 rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  经营健康度
                </h3>
                <div className="flex items-center gap-2">
                  <HealthRing score={overallScore} size={40} />
                  <span className="text-[10px] text-muted-foreground">综合</span>
                </div>
              </div>
              <div className="space-y-3">
                {HEALTH.map(h => (
                  <div key={h.dimension} className="flex items-center gap-3">
                    <HealthRing score={h.score} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{h.dimension}</span>
                        <TrendIcon trend={h.trend} size={12} />
                      </div>
                      <div className="text-[10px] text-muted-foreground leading-relaxed">{h.details}</div>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 shrink-0 text-primary"
                      onClick={() => toast.info(h.keyAction)}>
                      优化 <ArrowUpRight className="h-2.5 w-2.5 ml-0.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── AI Automation Roadmap ── */}
            <div className="xl:col-span-3 rounded-xl border border-border/60 bg-card p-5">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                AI 自动化路线图
                <span className="text-[10px] font-normal text-muted-foreground">让机器替代重复劳动</span>
              </h3>

              <div className="space-y-2">
                {AUTOMATION.filter(a => a.priority === "P0").map(a => {
                  const statusStyle = a.status === "ready"
                    ? { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "可启用" }
                    : a.status === "in_progress"
                    ? { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", label: "进行中" }
                    : { bg: "bg-muted/40", border: "border-border/60", text: "text-muted-foreground", label: "规划中" };
                  return (
                    <div key={a.id} className={`p-3 rounded-lg border ${statusStyle.border} ${statusStyle.bg}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">{a.priority}</span>
                          <span className="text-[10px] text-muted-foreground">{a.stage}</span>
                          <span className="text-xs font-medium">{a.capability}</span>
                        </div>
                        <span className={`text-[10px] font-medium ${statusStyle.text}`}>{statusStyle.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                          <span>现状：{a.currentState}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-medium text-foreground">目标：{a.targetState}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">{a.impact}</span>
                      </div>
                      {a.status === "ready" && (
                        <Button size="sm" className="h-6 text-[10px] mt-2 w-full" onClick={() => toast.success(`已启用「${a.capability}」`)}>
                          <Zap className="h-3 w-3 mr-1" />立即启用
                        </Button>
                      )}
                    </div>
                  );
                })}

                {/* P1 collapsed */}
                <div className="pt-2 border-t border-border/40">
                  <div className="text-[10px] text-muted-foreground mb-2">P1 · 下一优先级（{AUTOMATION.filter(a => a.priority === "P1").length} 项）</div>
                  <div className="grid grid-cols-2 gap-2">
                    {AUTOMATION.filter(a => a.priority === "P1").map(a => (
                      <div key={a.id} className="p-2 rounded border border-border/40 bg-muted/20">
                        <div className="text-[11px] font-medium">{a.capability}</div>
                        <div className="text-[10px] text-muted-foreground">{a.stage} · {a.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Critical Alerts ── */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-red-500" />
              需要立即处理
              <span className="text-[10px] font-normal text-muted-foreground">基于管线数据实时检测</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: "420条线索积压待清洗", desc: "清洗队列积压超24h，平均等待时间18h。客服团队满负荷运转，需立即启用AI初筛分流。", action: "启用AI初筛", color: "red" },
                { title: "2家企业反馈率<20%", desc: "「好莱客」25%、「志邦」18%，大量客资派出后失联。建议启动质量保障金机制。", action: "设置保障金", color: "red" },
                { title: "抖音渠道CAC突破¥300", desc: "本周抖音信息流CPL从¥170跳升至¥310，竞品加大投放所致。建议临时缩减预算并优化素材。", action: "调整预算", color: "amber" },
              ].map((alert, i) => (
                <div key={i} className={`p-4 rounded-lg border ${alert.color === "red" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/40"}`}>
                  <div className={`text-sm font-medium mb-1.5 ${alert.color === "red" ? "text-red-800" : "text-amber-800"}`}>{alert.title}</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">{alert.desc}</p>
                  <Button size="sm" variant="outline" className={`h-7 text-xs w-full ${
                    alert.color === "red" ? "border-red-300 text-red-700 hover:bg-red-100" : "border-amber-300 text-amber-700 hover:bg-amber-100"
                  }`} onClick={() => toast.success("已处理")}>
                    <Zap className="h-3 w-3 mr-1" />{alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ── Enterprise Perspective ── */
        <div className="space-y-5">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">企业视角说明</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              此视角模拟企业用户看到的客资经营数据。企业购买平台「精准客资」产品后，通过本平台接收线索、跟进客户、回传结果。
              平台通过企业反馈数据优化线索质量，形成「质量越好→反馈越多→优化越准→质量更好」的正循环。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Enterprise: What they see */}
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                企业经营驾驶舱（预览）
              </h3>
              <div className="space-y-3">
                {[
                  { label: "本月客资", value: "186条", sub: "高意向82条 · 中意向72条 · 低意向32条" },
                  { label: "跟进进度", value: "已联系133 / 待联系53", sub: "24h首联率71.5% · 目标≥90%" },
                  { label: "成交转化", value: "44单 · ¥554,400", sub: "转化率23.8% · 客均¥12,600" },
                  { label: "AI建议", value: "3条待处理", sub: "优化跟进话术 · 调整客资偏好 · 提升响应速度" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-bold">{item.value}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise: Incentive Design */}
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                反馈激励机制设计
              </h3>
              <div className="space-y-3">
                {[
                  { mechanism: "质量保障金", desc: "企业预付10%保证金，每条客资跟进回传后退还。未回传则扣除用于补偿平台清洗成本。", impact: "预计反馈率提升至65%", status: "ready" },
                  { mechanism: "反馈积分换客资", desc: "每回传1条跟进记录获5积分，100积分免费兑换1条高意向客资。回传越多，免费客资越多。", impact: "正向激励客资回传", status: "ready" },
                  { mechanism: "动态定价挂钩", desc: "反馈率≥80%的企业享受8折优惠，≥60%享9折，<40%按标准价+10%。让价格驱动行为。", impact: "预计复购率提升12%", status: "planned" },
                  { mechanism: "AI质量评分透明化", desc: "向企业展示每条客资的AI评分依据，让企业理解定价逻辑，建立信任。", impact: "降低质量投诉率", status: "planned" },
                ].map((m, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${m.status === "ready" ? "border-emerald-200 bg-emerald-50/30" : "border-border/40"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{m.mechanism}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        m.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                      }`}>{m.status === "ready" ? "可实施" : "规划中"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mb-1">{m.desc}</p>
                    <span className="text-[10px] text-emerald-600 font-medium">{m.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
