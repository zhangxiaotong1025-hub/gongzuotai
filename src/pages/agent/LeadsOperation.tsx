import { useState } from "react";
import {
  Users, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, Target,
  Zap, ChevronRight, Brain, BarChart3,
  Building2, ArrowRight, DollarSign, Phone,
  Bot, Sparkles, ArrowUpRight, AlertCircle,
  Layers, Eye, Shield,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateAcquisitionChannels, generateCleansingQueue,
  generateEnterpriseDistributions, generateFeedbackMetrics,
  generatePipelineStages,
  type AcquisitionChannel, type EnterpriseDistribution,
  type CleansingQueue, type FeedbackMetrics,
} from "@/data/agent-leads-pipeline";

const CHANNELS = generateAcquisitionChannels();
const CLEANSING = generateCleansingQueue();
const ENTERPRISES = generateEnterpriseDistributions();
const FEEDBACK = generateFeedbackMetrics();
const PIPELINE = generatePipelineStages();

const TABS = ["获客渠道", "清洗产线", "企业派发", "反馈闭环"] as const;

/* ── Channel Table ── */
const channelCols: TableColumn<AcquisitionChannel>[] = [
  { key: "channel", title: "渠道", width: 120, render: (v: string, r) => (
    <div>
      <div className="text-sm font-medium">{v}</div>
      <div className={`text-[10px] ${r.trend === "down" ? "text-red-500" : r.trend === "up" ? "text-emerald-600" : "text-muted-foreground"}`}>
        {r.trend === "down" ? "↓ 效果下降" : r.trend === "up" ? "↑ 持续增长" : "— 持平"}
      </div>
    </div>
  )},
  { key: "leads", title: "线索量", width: 70, render: (v: number) => <span className="text-sm font-medium">{v.toLocaleString()}</span> },
  { key: "cost", title: "投入", width: 90, render: (v: number) => <span className="text-xs">¥{v.toLocaleString()}</span> },
  { key: "cac", title: "CAC", width: 60, render: (v: number, r) => (
    <span className={`text-sm font-bold ${v > 250 ? "text-red-600" : v > 150 ? "text-amber-600" : "text-emerald-600"}`}>¥{v}</span>
  )},
  { key: "qualifiedRate", title: "合格率", width: 70, render: (v: number) => (
    <div className="flex items-center gap-1.5">
      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${v >= 70 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs">{v}%</span>
    </div>
  )},
  { key: "qualifiedCac", title: "合格CAC", width: 80, render: (v: number) => (
    <span className={`text-xs font-medium ${v > 400 ? "text-red-600" : v > 200 ? "text-amber-600" : "text-emerald-600"}`}>¥{v}</span>
  )},
  { key: "conversions", title: "转化", width: 55, render: (v: number) => <span className="text-sm">{v}</span> },
  { key: "roi", title: "ROI", width: 70, render: (v: number) => (
    <span className={`text-sm font-bold ${v > 150 ? "text-emerald-600" : v > 50 ? "text-foreground" : "text-red-600"}`}>{v}%</span>
  )},
];

const channelActions: ActionItem<AcquisitionChannel>[] = [
  { label: "AI优化", onClick: (r) => toast.info(r.aiSuggestion) },
  { label: "调整预算", onClick: () => toast.success("预算已调整") },
];

/* ── Enterprise Table ── */
const enterpriseCols: TableColumn<EnterpriseDistribution>[] = [
  { key: "name", title: "企业", width: 140, render: (_v, r) => (
    <div>
      <div className="text-sm font-medium">{r.name}</div>
      <div className="text-[10px] text-muted-foreground">{r.type} · {r.region}</div>
    </div>
  )},
  { key: "totalReceived", title: "收到/高意向", width: 90, render: (_v, r) => (
    <div className="text-xs"><span className="font-medium">{r.totalReceived}</span><span className="text-muted-foreground"> / {r.highIntent}</span></div>
  )},
  { key: "contactRate", title: "联系率", width: 65, render: (v: number) => (
    <span className={`text-xs font-medium ${v >= 85 ? "text-emerald-600" : v >= 70 ? "text-amber-600" : "text-red-600"}`}>{v}%</span>
  )},
  { key: "conversionRate", title: "转化率", width: 65, render: (v: number) => (
    <span className={`text-xs font-bold ${v >= 25 ? "text-emerald-600" : v >= 15 ? "text-foreground" : "text-red-600"}`}>{v}%</span>
  )},
  { key: "feedbackRate", title: "反馈率", width: 70, render: (v: number) => (
    <div className="flex items-center gap-1.5">
      <div className="w-10 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${v >= 60 ? "bg-emerald-500" : v >= 40 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${Math.min(100, v)}%` }} />
      </div>
      <span className={`text-xs ${v < 30 ? "text-red-600 font-medium" : ""}`}>{v}%</span>
    </div>
  )},
  { key: "avgResponseTime", title: "响应", width: 60, render: (v: string, r) => (
    <span className={`text-xs ${r.riskLevel === "high" ? "text-red-600 font-medium" : ""}`}>{v}</span>
  )},
  { key: "satisfaction", title: "满意度", width: 60, render: (v: number) => (
    <span className={`text-xs font-medium ${v >= 4 ? "text-emerald-600" : v >= 3 ? "text-amber-600" : "text-red-600"}`}>★ {v}</span>
  )},
  { key: "revenue", title: "贡献营收", width: 90, render: (v: number) => <span className="text-xs">¥{v.toLocaleString()}</span> },
  { key: "riskLevel", title: "风险", width: 50, render: (v: string) => (
    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
      v === "high" ? "bg-red-100 text-red-700" : v === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
    }`}>{v === "high" ? "高" : v === "中" ? "中" : "低"}</span>
  )},
];

const enterpriseActions: ActionItem<EnterpriseDistribution>[] = [
  { label: "AI诊断", onClick: (r) => toast.info(r.aiInsight) },
  { label: "调整配额", onClick: () => toast.success("已调整") },
  { label: "暂停派发", onClick: () => toast.warning("已暂停"), isDanger: true },
];

/* ── Cleansing Pipeline Viz ── */
function CleansingPipeline({ queue }: { queue: CleansingQueue[] }) {
  const total = queue.reduce((s, q) => s + q.count, 0);
  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="h-8 rounded-lg overflow-hidden flex">
        {queue.map(q => (
          <div key={q.status} className={`${q.color} relative group`} style={{ width: `${q.percentage}%` }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <span className="text-[10px] text-white font-medium whitespace-nowrap">{q.status} {q.count}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {queue.map(q => (
          <div key={q.status} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${q.color}`} />
            <span className="text-[11px] text-muted-foreground">{q.status}</span>
            <span className="text-[11px] font-medium">{q.count}</span>
            <span className="text-[10px] text-muted-foreground">({q.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadsOperation() {
  const [tab, setTab] = useState(0);

  // Summary KPIs
  const totalCost = CHANNELS.reduce((s, c) => s + c.cost, 0);
  const totalLeads = CHANNELS.reduce((s, c) => s + c.leads, 0);
  const totalQualified = CHANNELS.reduce((s, c) => s + c.qualified, 0);
  const avgCAC = Math.round(totalCost / totalLeads);
  const avgQualifiedCAC = Math.round(totalCost / totalQualified);
  const totalRevenue = CHANNELS.reduce((s, c) => s + c.revenue, 0);

  return (
    <div>
      <PageHeader title="精准客资运营" subtitle="平台客资管线全链路分析 — 从获取到反馈闭环" />

      {/* Pipeline Summary Bar */}
      <div className="flex items-center gap-0 mb-5 rounded-xl border border-border/60 bg-card overflow-hidden">
        {PIPELINE.map((s, i) => {
          const maxCount = PIPELINE[0].count;
          const pct = Math.round((s.count / maxCount) * 100);
          return (
            <div key={s.id} className={`flex-1 p-3 border-r border-border/40 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors ${tab === i && i < 4 ? "bg-primary/5" : ""}`}
              onClick={() => { if (i < 4) setTab(i); }}>
              <div className="text-[10px] text-muted-foreground mb-0.5">{s.stage}</div>
              <div className="text-lg font-bold">{s.count.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${s.automationLevel >= 30 ? "bg-primary" : s.automationLevel >= 15 ? "bg-amber-500" : "bg-red-400"}`}
                    style={{ width: `${s.automationLevel}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">AI {s.automationLevel}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-border/60">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      {/* ── Tab 0: Acquisition ── */}
      {tab === 0 && (
        <div className="space-y-5">
          {/* Cost Alert */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50/40">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-medium text-red-800">获客成本预警：</span>
              <span className="text-red-700">
                本月综合CAC ¥{avgCAC}（合格线索CAC ¥{avgQualifiedCAC}），较上月上升17.5%。
                「400电话」合格CAC高达¥697，建议立即用AI外呼替代。「小红书」ROI仅40.8%，建议暂停直投。
              </span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "总投入", value: `¥${totalCost.toLocaleString()}`, sub: `${CHANNELS.length}个渠道` },
              { label: "获取线索", value: totalLeads.toLocaleString(), sub: `合格${totalQualified}条` },
              { label: "综合CAC", value: `¥${avgCAC}`, sub: `合格CAC ¥${avgQualifiedCAC}` },
              { label: "客资营收", value: `¥${totalRevenue.toLocaleString()}`, sub: `毛利率${Math.round((1 - totalCost / totalRevenue) * 100)}%` },
            ].map(k => (
              <div key={k.label} className="rounded-lg border border-border/60 bg-card p-3">
                <div className="text-[10px] text-muted-foreground">{k.label}</div>
                <div className="text-lg font-bold">{k.value}</div>
                <div className="text-[10px] text-muted-foreground">{k.sub}</div>
              </div>
            ))}
          </div>

          <AdminTable columns={channelCols} data={CHANNELS} actions={channelActions} rowKey={r => r.channel} />
        </div>
      )}

      {/* ── Tab 1: Cleansing ── */}
      {tab === 1 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              清洗队列状态
            </h4>
            <CleansingPipeline queue={CLEANSING} />
          </div>

          {/* Bottleneck & AI Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-red-200 bg-red-50/30 p-5">
              <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                当前瓶颈
              </h4>
              <div className="space-y-3">
                {[
                  { issue: "客服团队8人，日均处理能力500条", detail: "当前日均获取142条，积压420条待清洗。旺季将严重不足。" },
                  { issue: "人工清洗合格率仅62.4%", detail: "主观判断标准不一致，不同客服的合格率差异达±18%。" },
                  { issue: "单条清洗成本约¥8.5", detail: "含客服工资、外呼话费、CRM工具费用。月均清洗成本¥36,380。" },
                ].map((b, i) => (
                  <div key={i} className="p-3 rounded-lg border border-red-200/60 bg-white/60">
                    <div className="text-xs font-medium text-red-800 mb-0.5">{b.issue}</div>
                    <div className="text-[10px] text-red-600">{b.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5">
              <h4 className="text-sm font-medium text-emerald-800 mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-600" />
                AI 解决方案
              </h4>
              <div className="space-y-3">
                {[
                  { solution: "AI外呼初筛（Phase 1）", detail: "AI自动拨打、确认号码有效性、初步意向判断。预计替代70%人工初筛。", saving: "节省¥12万/月", ready: true },
                  { solution: "智能意向评分（Phase 2）", detail: "基于用户行为、表单信息、对话内容多维度打分。标准化替代主观判断。", saving: "合格率提升至78%", ready: true },
                  { solution: "需求信息AI补全（Phase 3）", detail: "AI对话自动获取户型、预算、风格偏好等关键信息，减少人工回访。", saving: "信息完整度提升60%", ready: false },
                ].map((s, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${s.ready ? "border-emerald-300 bg-white/60" : "border-emerald-200/60"}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-emerald-800">{s.solution}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.ready ? "bg-emerald-200 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
                        {s.ready ? "可启用" : "规划中"}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-700 mb-1">{s.detail}</div>
                    <span className="text-[10px] font-bold text-emerald-600">{s.saving}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Enterprise Distribution ── */}
      {tab === 2 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/40">
            <Brain className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="flex-1 text-xs">
              <span className="font-medium text-amber-800">AI 派发建议：</span>
              <span className="text-amber-700">
                「好莱客」「志邦」反馈率低于25%，建议降级至B级或启动质量保障金。
                「尚品宅配」「城市之光」表现优异，建议增加配额并提升单价至¥250/条。
                启用智能匹配后，预计整体转化率可提升8-12%。
              </span>
            </div>
          </div>

          {/* Distribution Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "总派发量", value: ENTERPRISES.reduce((s, e) => s + e.totalReceived, 0).toLocaleString(), color: "" },
              { label: "平均联系率", value: `${Math.round(ENTERPRISES.reduce((s, e) => s + e.contactRate, 0) / ENTERPRISES.length)}%`, color: "" },
              { label: "平均转化率", value: `${Math.round(ENTERPRISES.reduce((s, e) => s + e.conversionRate, 0) / ENTERPRISES.length)}%`, color: "" },
              { label: "平均反馈率", value: `${Math.round(ENTERPRISES.reduce((s, e) => s + e.feedbackRate, 0) / ENTERPRISES.length)}%`, color: "text-red-600" },
            ].map(k => (
              <div key={k.label} className="rounded-lg border border-border/60 bg-card p-3">
                <div className="text-[10px] text-muted-foreground">{k.label}</div>
                <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>

          <AdminTable columns={enterpriseCols} data={ENTERPRISES} actions={enterpriseActions} rowKey={r => r.id} />
        </div>
      )}

      {/* ── Tab 3: Feedback Loop ── */}
      {tab === 3 && (
        <div className="space-y-5">
          {/* Core Problem */}
          <div className="rounded-xl border border-red-200 bg-red-50/30 p-5">
            <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              核心断裂点：客资派发后管线失控
            </h4>
            <p className="text-xs text-red-700 leading-relaxed mb-4">
              平台每月派发2,340条客资给企业，但仅收到34.2%的跟进反馈（800条）。
              这意味着65.8%的客资进入了"黑箱"——我们无法知道客户是否被联系、是否成交、客资质量到底如何。
              没有反馈数据，渠道优化、质量提升、定价策略全部无据可依。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {FEEDBACK.map(f => (
                <div key={f.metric} className={`p-3 rounded-lg border ${
                  f.status === "danger" ? "border-red-200 bg-white/60" : f.status === "warning" ? "border-amber-200 bg-amber-50/20" : "border-emerald-200 bg-emerald-50/20"
                }`}>
                  <div className="text-[10px] text-muted-foreground mb-1">{f.metric}</div>
                  <div className={`text-lg font-bold ${
                    f.status === "danger" ? "text-red-600" : f.status === "warning" ? "text-amber-600" : "text-emerald-600"
                  }`}>{f.value}</div>
                  <div className="text-[10px] text-muted-foreground">{f.benchmark}</div>
                  <div className="text-[10px] text-red-600 mt-1">{f.impact}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution: Incentive System */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5">
            <h4 className="text-sm font-medium text-emerald-800 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              解决方案：让企业「自愿」回传数据
            </h4>
            <p className="text-xs text-emerald-700 mb-4">
              企业不反馈的根因是「没有动力」。必须让反馈行为与客资质量、价格优惠直接挂钩，
              让企业感受到「反馈越多，拿到的客资越好越便宜」。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "💰 质量保障金机制",
                  desc: "预付10%保证金，每条回传跟进记录后退还。未回传自动扣除。",
                  detail: "例：¥200/条客资，企业预付¥20保证金。回传后退¥20，未回传扣除。",
                  targetEffect: "预计反馈率 34% → 65%",
                },
                {
                  title: "🎁 反馈积分兑客资",
                  desc: "回传1条跟进=5积分，100积分兑1条免费高意向客资。",
                  detail: "正向激励：越积极反馈，获得的免费客资越多。企业边省钱边贡献数据。",
                  targetEffect: "预计月增免费客资200条",
                },
                {
                  title: "📊 动态折扣挂钩",
                  desc: "反馈率≥80%享8折，≥60%享9折，<40%按标准+10%。",
                  detail: "用价格杠杆驱动行为改变。高反馈率企业获得成本优势。",
                  targetEffect: "预计复购率提升12%",
                },
                {
                  title: "🤖 AI自动催促",
                  desc: "客资派发48h后未回传，系统自动发送催促。72h仍未回传标记为风险。",
                  detail: "配合AI外呼自动询问跟进状态，降低人工催收成本。",
                  targetEffect: "预计回传延迟 4.2天 → 1.5天",
                },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-lg border border-emerald-300 bg-white/60">
                  <div className="text-sm font-medium mb-1.5">{s.title}</div>
                  <p className="text-xs text-muted-foreground mb-1">{s.desc}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{s.detail}</p>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-100 border border-emerald-200">
                    <Target className="h-3 w-3 text-emerald-600" />
                    <span className="text-[11px] font-medium text-emerald-700">{s.targetEffect}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-4 w-full" onClick={() => toast.success("已创建激励方案草案")}>
              <Zap className="h-4 w-4 mr-2" />
              一键生成激励方案配置
            </Button>
          </div>

          {/* Closed Loop Visualization */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              目标：数据飞轮闭环
            </h4>
            <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
              {[
                { label: "渠道投放", icon: "📡" },
                { label: "AI清洗", icon: "🤖" },
                { label: "智能派发", icon: "🎯" },
                { label: "企业跟进", icon: "👥" },
                { label: "数据回传", icon: "📊" },
                { label: "优化迭代", icon: "⚡" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg border border-border/60 bg-muted/20 min-w-[72px]">
                    <span className="text-lg">{step.icon}</span>
                    <span className="text-[10px] font-medium">{step.label}</span>
                  </div>
                  {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              回传数据驱动渠道/清洗/派发三环节持续优化 → 客资质量提升 → 企业更愿意反馈 → 正循环
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
