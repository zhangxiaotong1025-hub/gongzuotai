import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { generateDesigners, PACKAGES } from "@/data/customer";

const DESIGNERS = generateDesigners(40);

/* ── Usage Rate Distribution ── */
const usageBuckets = (() => {
  const buckets = { low: 0, mid: 0, high: 0 };
  DESIGNERS.forEach(d => {
    if (d.usageRate < 30) buckets.low++;
    else if (d.usageRate < 70) buckets.mid++;
    else buckets.high++;
  });
  return buckets;
})();

const avgUsage = Math.round(DESIGNERS.reduce((a, d) => a + d.usageRate, 0) / DESIGNERS.length);
const avgCvs = Math.round(DESIGNERS.reduce((a, d) => a + d.cvsScore, 0) / DESIGNERS.length);

/* ── Capability Usage Mock ── */
const CAPABILITY_USAGE = [
  { name: "AI设计生成", total: 1000000, used: 723000, trend: "up" as const },
  { name: "3D渲染", total: 500000, used: 312000, trend: "flat" as const },
  { name: "模型下载", total: 200000, used: 45000, trend: "down" as const },
  { name: "4K渲染", total: 50000, used: 8000, trend: "flat" as const },
  { name: "方案导出", total: 300000, used: 162000, trend: "up" as const },
];

/* ── Feature Preference Mock ── */
const FEATURE_PREFS = [
  { name: "AI设计生成", userPct: 89 },
  { name: "3D渲染", userPct: 71 },
  { name: "方案导出", userPct: 54 },
  { name: "模型库浏览", userPct: 38 },
  { name: "4K渲染", userPct: 19 },
  { name: "VR漫游", userPct: 12 },
];

/* ── CVS Distribution ── */
const cvsDistribution = (() => {
  const d = { high: 0, mid: 0, grow: 0, low: 0 };
  DESIGNERS.forEach(des => {
    if (des.cvsScore >= 80) d.high++;
    else if (des.cvsScore >= 50) d.mid++;
    else if (des.cvsScore >= 20) d.grow++;
    else d.low++;
  });
  return d;
})();

const TABS = ["权益使用分析", "功能偏好", "客户价值评分"];

export default function BehaviorAnalysis() {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <PageHeader title="行为分析" subtitle="用户权益使用与功能偏好洞察" />

      <div className="flex items-center gap-1 mb-5 border-b border-border/60">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t}</button>
        ))}
      </div>

      {/* Tab 0: Usage Analysis */}
      {tab === 0 && (
        <div className="space-y-6">
          {/* Usage Rate Distribution */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">权益使用率分布</h4>
            <div className="space-y-3">
              {[
                { label: "0-30%", value: usageBuckets.low, color: "bg-amber-500" },
                { label: "30-70%", value: usageBuckets.mid, color: "bg-primary" },
                { label: "70%+", value: usageBuckets.high, color: "bg-emerald-500" },
              ].map(b => {
                const pct = Math.round((b.value / DESIGNERS.length) * 100);
                return (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="text-sm min-w-[50px]">{b.label}</span>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${b.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium min-w-[35px] text-right">{pct}%</span>
                    <span className="text-xs text-muted-foreground min-w-[45px]">({b.value}人)</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 text-sm">
              平均使用率: <span className="font-bold text-primary">{avgUsage}%</span>
            </div>
          </div>

          {/* Per-capability usage */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">能力维度使用分析</h4>
            <div className="space-y-4">
              {CAPABILITY_USAGE.map(c => {
                const rate = Math.round((c.used / c.total) * 100);
                const trendIcon = c.trend === "up" ? "↑" : c.trend === "down" ? "↓" : "→";
                const trendColor = c.trend === "up" ? "text-emerald-600" : c.trend === "down" ? "text-red-500" : "text-muted-foreground";
                return (
                  <div key={c.name} className="flex items-center gap-4">
                    <span className="text-sm min-w-[90px]">{c.name}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                    <span className="text-sm font-medium min-w-[40px] text-right">{rate}%</span>
                    <span className="text-xs text-muted-foreground min-w-[120px]">{c.used.toLocaleString()}/{c.total.toLocaleString()}</span>
                    <span className={`text-sm ${trendColor}`}>{trendIcon}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Feature Preferences */}
      {tab === 1 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">功能使用频次 TOP 排行（近30天）</h4>
            <div className="space-y-4">
              {FEATURE_PREFS.map((f, i) => (
                <div key={f.name} className="flex items-center gap-4">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                  <span className="text-sm min-w-[90px] font-medium">{f.name}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${i < 3 ? "bg-primary" : "bg-primary/40"}`} style={{ width: `${f.userPct}%` }} />
                  </div>
                  <span className="text-sm font-medium min-w-[50px] text-right">{f.userPct}%</span>
                  <span className="text-xs text-muted-foreground">用户使用</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">功能组合分析</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div className="text-sm font-medium text-emerald-800">高频组合</div>
                <div className="text-lg font-bold text-emerald-700 mt-1">AI设计 + 3D渲染</div>
                <div className="text-xs text-emerald-600 mt-1">同时使用率 78%</div>
              </div>
              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                <div className="text-sm font-medium text-amber-800">低频组合</div>
                <div className="text-lg font-bold text-amber-700 mt-1">4K渲染 + 模型下载</div>
                <div className="text-xs text-amber-600 mt-1">同时使用率 12%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CVS Score */}
      {tab === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "🏆 高价值", range: "80-100", count: cvsDistribution.high, color: "border-emerald-200 bg-emerald-50/50", textColor: "text-emerald-700" },
              { label: "⭐ 中价值", range: "50-79", count: cvsDistribution.mid, color: "border-primary/20 bg-primary/5", textColor: "text-primary" },
              { label: "📈 待培育", range: "20-49", count: cvsDistribution.grow, color: "border-amber-200 bg-amber-50/50", textColor: "text-amber-700" },
              { label: "⚠️ 低价值", range: "0-19", count: cvsDistribution.low, color: "border-red-200 bg-red-50/50", textColor: "text-red-700" },
            ].map(g => (
              <div key={g.label} className={`rounded-xl border p-4 text-center ${g.color}`}>
                <div className="text-sm font-medium">{g.label}</div>
                <div className={`text-2xl font-bold mt-1 ${g.textColor}`}>{g.count}</div>
                <div className="text-xs text-muted-foreground mt-1">评分 {g.range}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">评分维度权重</h4>
            <div className="space-y-3">
              {[
                { dim: "权益使用率", weight: 30 },
                { dim: "登录活跃度", weight: 20 },
                { dim: "消费金额", weight: 25 },
                { dim: "续费次数", weight: 15 },
                { dim: "功能深度", weight: 10 },
              ].map(d => (
                <div key={d.dim} className="flex items-center gap-3">
                  <span className="text-sm min-w-[90px]">{d.dim}</span>
                  <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/60 rounded-full" style={{ width: `${d.weight}%` }} />
                  </div>
                  <span className="text-sm font-medium min-w-[35px] text-right">{d.weight}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border/40 text-sm">
              平均 CVS: <span className="font-bold text-primary">{avgCvs} 分</span>
            </div>
          </div>

          {/* Top 5 high-value designers */}
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">高价值客户 TOP 5</h4>
            <div className="space-y-3">
              {[...DESIGNERS].sort((a, b) => b.cvsScore - a.cvsScore).slice(0, 5).map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.currentPackage} · 消费 ¥{d.totalSpent.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{d.cvsScore}</div>
                    <div className="text-[10px] text-muted-foreground">CVS</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
