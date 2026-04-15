import { useState } from "react";
import {
  Users, ArrowRight, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, Clock, Target,
  Zap, Filter, ChevronRight, Brain, BarChart3,
  UserCheck, UserX, Phone, ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateLeadsFunnel, generateDesignerPerformance,
  generateChannelPerformance, generateLeadRecords,
  type LeadsFunnelStage, type DesignerPerformance,
  type ChannelPerformance, type LeadRecord,
} from "@/data/agent-business";

const FUNNEL = generateLeadsFunnel();
const DESIGNERS = generateDesignerPerformance();
const CHANNELS = generateChannelPerformance();
const LEADS = generateLeadRecords();

const TABS = ["转化漏斗", "客资明细", "设计师效能", "渠道分析"];

/* ── Funnel Visualization ── */
function FunnelChart({ stages }: { stages: LeadsFunnelStage[] }) {
  const maxCount = stages[0].count;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const width = Math.max(20, (s.count / maxCount) * 100);
        const statusColor = s.status === "critical" ? "bg-red-500" : s.status === "warning" ? "bg-amber-500" : "bg-primary";
        const statusBg = s.status === "critical" ? "bg-red-50" : s.status === "warning" ? "bg-amber-50" : "bg-emerald-50";
        return (
          <div key={s.stage} className="flex items-center gap-4">
            <div className="w-20 text-right text-xs text-muted-foreground shrink-0">{s.stage}</div>
            <div className="flex-1 relative">
              <div className={`h-10 rounded-lg ${statusBg} relative overflow-hidden`} style={{ width: `${width}%` }}>
                <div className={`absolute inset-0 ${statusColor} opacity-20`} />
                <div className="absolute inset-0 flex items-center px-3 gap-3">
                  <span className="text-sm font-bold">{s.count}</span>
                  {i > 0 && (
                    <span className={`text-[11px] font-medium ${
                      s.status === "critical" ? "text-red-700" : s.status === "warning" ? "text-amber-700" : "text-emerald-700"
                    }`}>
                      转化率 {s.conversionRate}%
                      {s.conversionRate < s.benchmark && ` (基准${s.benchmark}%)`}
                    </span>
                  )}
                </div>
              </div>
              {s.status !== "healthy" && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <AlertTriangle className={`h-4 w-4 ${s.status === "critical" ? "text-red-500" : "text-amber-500"}`} />
                </div>
              )}
            </div>
            <div className="w-16 text-xs text-muted-foreground shrink-0 text-right">{s.avgTime}</div>
          </div>
        );
      })}
      <div className="flex items-center gap-4 mt-1">
        <div className="w-20" />
        <div className="flex-1 flex justify-between text-[10px] text-muted-foreground px-1">
          <span>← 漏斗宽度 = 客资数量</span>
          <span>平均耗时 →</span>
        </div>
        <div className="w-16" />
      </div>
    </div>
  );
}

/* ── Lead Table Columns ── */
const leadCols: TableColumn<LeadRecord>[] = [
  { key: "customerName", title: "客户", width: 120, render: (_v, r) => (
    <div>
      <div className="text-sm font-medium">{r.customerName}</div>
      <div className="text-[11px] text-muted-foreground">{r.phone}</div>
    </div>
  )},
  { key: "channel", title: "来源", width: 100, render: (v: string) => <span className="text-xs">{v}</span> },
  { key: "intentLevel", title: "意向", width: 60, render: (v: string) => (
    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
      v === "high" ? "bg-red-100 text-red-700" : v === "medium" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
    }`}>{v === "high" ? "高" : v === "medium" ? "中" : "低"}</span>
  )},
  { key: "assignedTo", title: "跟进人", width: 80 },
  { key: "stage", title: "阶段", width: 80, render: (v: string) => <span className="text-xs">{v}</span> },
  { key: "responseTime", title: "响应时效", width: 80, render: (v: string, r) => (
    <span className={`text-xs font-medium ${r.riskFlag ? "text-red-600" : "text-foreground"}`}>{v}</span>
  )},
  { key: "followCount", title: "跟进次数", width: 70, render: (v: number) => <span className="text-sm">{v}</span> },
  { key: "estimatedValue", title: "预估价值", width: 90, render: (v: number) => <span className="text-sm">¥{v.toLocaleString()}</span> },
  { key: "riskFlag", title: "风险", width: 90, render: (v?: string) => v ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
      <AlertTriangle className="h-3 w-3" />{v}
    </span>
  ) : <span className="text-xs text-muted-foreground">-</span> },
];

const leadActions: ActionItem<LeadRecord>[] = [
  { label: "重新分配", onClick: () => toast.success("已重新分配") },
  { label: "AI分析", onClick: () => toast.info("正在分析客资画像...") },
];

/* ── Designer Performance Columns ── */
const designerCols: TableColumn<DesignerPerformance>[] = [
  { key: "name", title: "设计师", width: 100, render: (_v, r) => (
    <div>
      <div className="text-sm font-medium">{r.name}</div>
      <div className="text-[11px] text-muted-foreground">{r.enterprise}</div>
    </div>
  )},
  { key: "activeLeads", title: "在跟/容量", width: 90, render: (_v, r) => {
    const ratio = r.activeLeads / r.capacity;
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${ratio > 1 ? "text-red-600" : ""}`}>{r.activeLeads}/{r.capacity}</span>
        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${ratio > 1 ? "bg-red-500" : ratio > 0.8 ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${Math.min(100, ratio * 100)}%` }} />
        </div>
      </div>
    );
  }},
  { key: "conversionRate", title: "转化率", width: 80, render: (v: number) => (
    <span className={`text-sm font-bold ${v >= 35 ? "text-emerald-600" : v >= 25 ? "text-foreground" : "text-red-600"}`}>{v}%</span>
  )},
  { key: "avgResponseTime", title: "平均响应", width: 80, render: (v: string, r) => (
    <span className={`text-xs ${r.riskLevel === "high" ? "text-red-600 font-medium" : ""}`}>{v}</span>
  )},
  { key: "revenue30d", title: "30天营收", width: 100, render: (v: number) => <span className="text-sm">¥{v.toLocaleString()}</span> },
  { key: "trend", title: "趋势", width: 50, render: (v: string) =>
    v === "up" ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : v === "down" ? <TrendingDown className="h-4 w-4 text-red-600" /> : <span className="text-xs text-muted-foreground">—</span>
  },
  { key: "riskLevel", title: "风险", width: 60, render: (v: string) => (
    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
      v === "high" ? "bg-red-100 text-red-700" : v === "medium" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
    }`}>{v === "high" ? "高" : v === "medium" ? "中" : "低"}</span>
  )},
];

const designerActions: ActionItem<DesignerPerformance>[] = [
  { label: "调整容量", onClick: () => toast.success("容量已调整") },
  { label: "查看客资", onClick: () => toast.info("跳转客资列表") },
];

export default function LeadsOperation() {
  const [tab, setTab] = useState(0);

  // KPI summary
  const totalLeads = FUNNEL[0].count;
  const totalConversions = FUNNEL[FUNNEL.length - 1].count;
  const overallRate = Math.round((totalConversions / totalLeads) * 100 * 10) / 10;
  const riskLeads = LEADS.filter(l => l.riskFlag).length;
  const overloadedDesigners = DESIGNERS.filter(d => d.activeLeads > d.capacity).length;

  return (
    <div>
      <PageHeader title="精准客资运营" subtitle="AI 驱动的客资全链路管理 — 从获客到签约的智能闭环" />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {[
          { label: "本月客资", value: totalLeads.toLocaleString(), icon: Users, color: "text-primary" },
          { label: "签约成交", value: totalConversions.toLocaleString(), icon: CheckCircle2, color: "text-emerald-600" },
          { label: "整体转化率", value: `${overallRate}%`, icon: Target, color: "text-primary" },
          { label: "风险客资", value: `${riskLeads}条`, icon: AlertTriangle, color: "text-red-600" },
          { label: "超载设计师", value: `${overloadedDesigners}人`, icon: UserX, color: "text-amber-600" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border/60 bg-card p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </div>
            <div>
              <div className={`text-lg font-bold ${k.color}`}>{k.value}</div>
              <div className="text-[11px] text-muted-foreground">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insight Banner */}
      {riskLeads > 0 && (
        <div className="flex items-center gap-3 p-3 mb-5 rounded-xl border border-amber-200 bg-amber-50/40">
          <Brain className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-medium text-amber-800">AI 建议：</span>
            <span className="text-amber-700">
              {riskLeads} 条客资存在超时风险，建议将「王浩然」「周文」的超载客资转移给空闲的Top设计师「吴建国」「张明」，预计可挽回 ¥{(riskLeads * 35000).toLocaleString()} 潜在营收
            </span>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs border-amber-300 text-amber-700 shrink-0"
            onClick={() => toast.success("已执行智能重分配")}>
            <Zap className="h-3 w-3 mr-1" />一键重分配
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-border/60">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      {/* Tab 0: Funnel */}
      {tab === 0 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              客资转化漏斗
              <span className="text-[11px] text-muted-foreground font-normal">红色/黄色阶段表示低于行业基准</span>
            </h4>
            <FunnelChart stages={FUNNEL} />
          </div>

          {/* AI Diagnosis */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI 漏斗诊断
            </h4>
            <div className="space-y-3">
              {[
                { stage: "首次联系", status: "critical" as const, diagnosis: "平均首次联系时效18.5h，远超4h最佳窗口期。主要原因：3位设计师负荷超标，导致新客资无法及时响应。", action: "优化分配算法 + 设置4h超时自动转移", impact: "预计转化率提升8-12%" },
                { stage: "智能分配", status: "warning" as const, diagnosis: "分配流失率4.8%，主因：部分区域无匹配设计师。建议引入跨区域/跨企业调配机制。", action: "启用跨企业客资共享池", impact: "预计减少60条/月流失" },
                { stage: "方案推荐→签约", status: "healthy" as const, diagnosis: "该阶段转化率65%，高于行业基准55%，优势明显。3D方案演示环节转化贡献最大。", action: "推广方案演示标准流程至所有设计师", impact: "维持优势并标准化复制" },
              ].map(d => (
                <div key={d.stage} className={`p-4 rounded-lg border ${
                  d.status === "critical" ? "border-red-200 bg-red-50/30" : d.status === "warning" ? "border-amber-200 bg-amber-50/30" : "border-emerald-200 bg-emerald-50/30"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      d.status === "critical" ? "bg-red-100 text-red-700" : d.status === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>{d.stage}</span>
                    <span className={`text-[10px] ${d.status === "critical" ? "text-red-600" : d.status === "warning" ? "text-amber-600" : "text-emerald-600"}`}>
                      {d.status === "critical" ? "需立即优化" : d.status === "warning" ? "可改善" : "表现良好"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{d.diagnosis}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">建议：</span>
                      <span className="text-[11px] font-medium">{d.action}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">{d.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Lead Records */}
      {tab === 1 && (
        <AdminTable columns={leadCols} data={LEADS} actions={leadActions} rowKey={r => r.id} />
      )}

      {/* Tab 2: Designer Performance */}
      {tab === 2 && (
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="rounded-xl border border-border/60 bg-card p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              设计师效能分析
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <UserCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-800">Top 表现</span>
                </div>
                <p className="text-[11px] text-emerald-700">「吴建国」转化率45%，响应0.8h，且仅承载5/15客资。建议优先增加其客资分配。</p>
              </div>
              <div className="p-3 rounded-lg border border-red-200 bg-red-50/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <UserX className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium text-red-800">严重超载</span>
                </div>
                <p className="text-[11px] text-red-700">「王浩然」14/10超载40%，响应26h，转化率仅18%。建议立即暂停新客资分配并转移4条至空闲设计师。</p>
              </div>
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-800">响应偏慢</span>
                </div>
                <p className="text-[11px] text-amber-700">「周文」平均响应32h，建议开启4h未响应自动提醒，8h未响应自动转移机制。</p>
              </div>
            </div>
          </div>

          <AdminTable columns={designerCols} data={DESIGNERS} actions={designerActions} rowKey={r => r.id} />
        </div>
      )}

      {/* Tab 3: Channel Analysis */}
      {tab === 3 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              渠道效果对比
            </h4>
            <div className="space-y-3">
              {CHANNELS.map(ch => {
                const maxRevenue = Math.max(...CHANNELS.map(c => c.revenue));
                return (
                  <div key={ch.channel} className="p-4 rounded-lg border border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{ch.channel}</span>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          ch.quality === "high" ? "bg-emerald-100 text-emerald-700" : ch.quality === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                        }`}>{ch.quality === "high" ? "优质" : ch.quality === "medium" ? "一般" : "待优化"}</span>
                      </div>
                      <span className={`text-sm font-bold ${ch.roi > 500 ? "text-emerald-600" : ch.roi > 200 ? "text-foreground" : "text-amber-600"}`}>
                        ROI {ch.roi}%
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3 text-center mb-2">
                      <div><div className="text-sm font-medium">{ch.leads}</div><div className="text-[10px] text-muted-foreground">线索数</div></div>
                      <div><div className="text-sm font-medium">¥{ch.cost.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">投入</div></div>
                      <div><div className="text-sm font-medium">{ch.conversions}</div><div className="text-[10px] text-muted-foreground">转化</div></div>
                      <div><div className="text-sm font-medium">¥{ch.revenue.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">营收</div></div>
                      <div><div className="text-sm font-medium">¥{ch.cac.toLocaleString()}</div><div className="text-[10px] text-muted-foreground">CAC</div></div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${ch.quality === "high" ? "bg-emerald-500" : ch.quality === "medium" ? "bg-amber-500" : "bg-red-400"}`}
                        style={{ width: `${(ch.revenue / maxRevenue) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Channel Insights */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI 渠道优化建议
            </h4>
            <div className="space-y-2">
              {[
                { insight: "「3D方案分享」零成本获客且转化率最高(37.8%)，建议将其升级为核心获客策略，设计师每分享一个方案奖励50积分", type: "positive" },
                { insight: "「抖音信息流」获客量最大但CAC偏高(¥1,349)，建议优化落地页并增加3D效果展示，预计可降低CAC 20-30%", type: "action" },
                { insight: "「小红书种草」ROI仅104%，投入产出比最低，建议暂停直接投放，转为KOL合作+方案分享组合策略", type: "warning" },
                { insight: "「线下活动」虽然获客量少但客单价最高(¥5,000)，建议增加频次并与3D现场体验结合", type: "positive" },
              ].map((ins, i) => (
                <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${
                  ins.type === "positive" ? "border-emerald-200 bg-emerald-50/30" : ins.type === "warning" ? "border-amber-200 bg-amber-50/30" : "border-blue-200 bg-blue-50/30"
                }`}>
                  <span className="shrink-0 mt-0.5">{ins.type === "positive" ? "✅" : ins.type === "warning" ? "⚠️" : "🎯"}</span>
                  <span className="text-xs leading-relaxed">{ins.insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
