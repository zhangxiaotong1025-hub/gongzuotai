import {
  ShieldAlert, Unplug, Sparkles, Rocket, Layers3, Globe2, Database,
  TrendingUp, Quote, ArrowRight, CheckCircle2, AlertTriangle, Calendar,
  Target, Cpu, Building2, LineChart, Grid3x3,
} from "lucide-react";

/**
 * 脱淘项目 · CEO 汇报（精简版）
 * 路由：/prd/ceo
 * 受众：CEO。原则：大字、短句、清晰结构，不展开技术细节。
 */
export default function CeoReport() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {/* ============== Hero ============== */}
      <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-card to-card p-10">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-[12px] text-primary">
            <Sparkles className="h-3.5 w-3.5" /> CEO 汇报 · 脱淘项目
          </span>
          <h1 className="text-[40px] font-bold leading-[1.2] tracking-tight">
            一次系统迁移，
            <br />
            一次<span className="text-primary">建立自主可控底座</span>的机会
          </h1>
          <p className="max-w-3xl text-[16px] leading-[1.9] text-foreground/85">
            短期：完成对阿里账号体系的依赖收敛，业务连续性可控。<br />
            中期：国内外、多产品线统一到一套架构上。<br />
            长期：在稳定底座上完成 AI 化与平台化演进。
          </p>
        </div>
      </header>

      {/* ============== 为什么是现在 ============== */}
      <section className="rounded-2xl border bg-card p-7">
        <SectionTitle eyebrow="WHY NOW" title="为什么必须现在做" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
          <RiskCard
            icon={Unplug}
            tag="外部依赖"
            title="账号体系依托阿里"
            desc="国内 B 端账号、企业创建仍接入阿里体系，存在不确定性，需在可控时间内迁移。"
          />
          <RiskCard
            icon={AlertTriangle}
            tag="历史债务"
            title="十年迭代积累待整理"
            desc="老代码改造空间有限，新业务在老逻辑上扩展成本较高，系统观测能力不足。"
          />
          <RiskCard
            icon={Layers3}
            tag="资源效率"
            title="国内外多套并行"
            desc="同一模块重复开发，研发投入产出比有较大优化空间。"
          />
        </div>
      </section>

      {/* ============== 核心设计：正交切面 ============== */}
      <section className="rounded-2xl border bg-gradient-to-br from-primary/8 via-card to-card p-7">
        <SectionTitle eyebrow="CORE DESIGN" title="产品设计核心 · 企业 × 产品 的正交坐标系" />
        <p className="mt-3 text-[14px] leading-[1.9] text-foreground/85">
          新架构的核心是<b className="text-primary">两个维度的正交</b>：水平方向是<b>企业关系图</b>（品牌商 / 卖场 / 经销商 / 门店 / 供应商），
          垂直方向是<b>产品矩阵</b>（国内 3D / 国际 3D / AI 设计家 / VR 全景 …）。
          两者垂直相交，<b className="text-primary">「企业 × 产品」成为一切权益、订单、人员、客户的最小坐标点</b>。
        </p>

        {/* 正交矩阵示意 */}
        <div className="mt-5 rounded-xl border bg-background/60 p-5">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <Grid3x3 className="h-3.5 w-3.5" /> Enterprise × Product Matrix
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2.5 px-3 text-muted-foreground font-medium w-[120px]">企业 ＼ 产品</th>
                  <th className="py-2.5 px-3 text-center text-primary font-semibold">国内 3D</th>
                  <th className="py-2.5 px-3 text-center text-primary font-semibold">国际 3D</th>
                  <th className="py-2.5 px-3 text-center text-primary font-semibold">AI 设计家</th>
                  <th className="py-2.5 px-3 text-center text-primary font-semibold">VR 全景</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["品牌商", "●", "●", "●", "○"],
                  ["卖场", "●", "●", "●", "●"],
                  ["经销商", "●", "—", "●", "—"],
                  ["门店", "●", "—", "○", "—"],
                ].map(([role, ...cells]) => (
                  <tr key={role} className="border-b last:border-0">
                    <td className="py-2.5 px-3 font-medium text-foreground">{role}</td>
                    {cells.map((c, i) => (
                      <td key={i} className={`py-2.5 px-3 text-center text-[15px] ${
                        c === "●" ? "text-emerald-500" : c === "○" ? "text-amber-500" : "text-muted-foreground/40"
                      }`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-muted-foreground">
            <span><span className="text-emerald-500">●</span> 已开通</span>
            <span><span className="text-amber-500">○</span> 可扩展</span>
            <span><span className="text-muted-foreground/60">—</span> 不适用</span>
            <span className="ml-auto">每个交叉点 = 一套独立的权益账户、人员授权、客户数据</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <ValueCard title="一套架构承接全部业务" desc="新增产品 / 新增企业形态，都是在同一张矩阵上扩展，无需新建系统。" />
          <ValueCard title="国内外天然统一" desc="国内 3D 与国际 3D 是同一矩阵的两列，差异通过配置承接，避免双套代码。" />
          <ValueCard title="数据天然可治理" desc="所有业务都落到「企业 × 产品」坐标，平台第一次具备跨企业、跨产品的统一数据视角。" />
        </div>
      </section>

      {/* ============== 三阶段收益 ============== */}
      <section className="rounded-2xl border bg-card p-7">
        <SectionTitle eyebrow="BENEFITS" title="三个阶段，三类收益" />

        <div className="mt-5 space-y-3">
          <StageRow
            tone="emerald"
            phase="短期"
            time="0 – 6 个月"
            head="完成依赖收敛，跑通样板链路"
            points={[
              "国内版账号体系完成自主化，存量用户迁移 ≥ 95%",
              "选取 3D 工具作为脱淘样板，全链路在新架构上跑通",
              "借契机系统性清理约 80% 的废旧功能，重构企业 / 资产 / 权益 / 权限",
            ]}
            outcome="建立业务自主性与连续性保障"
          />
          <StageRow
            tone="primary"
            phase="中期"
            time="6 – 12 个月"
            head="一套架构承接所有产品线"
            points={[
              "国内 3D / 国际 3D / AI 设计家 / 精准营销 逐步接入新架构",
              "支持品牌商 / 卖场 / 经销商 / 装企 等差异化企业形态",
              "新功能上线周期从 N 周 → N 天",
            ]}
            outcome="重复开发收敛，企业级业务可独立报价"
          />
          <StageRow
            tone="violet"
            phase="长期"
            time="12 – 24 个月"
            head="从工具型产品演进为 AI × 平台型产品"
            points={[
              "AI 辅助设计、智能推荐、数据预测落地",
              "平台具备完整资产管理能力，支持第三方与供应链生态接入",
              "基于统一权益与订单底座，灵活配置会员 / SaaS / 增值服务",
            ]}
            outcome="支撑未来 3–5 年多元收入结构"
          />
        </div>
      </section>

      {/* ============== 总结 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-8">
        <div className="flex items-start gap-4">
          <Target className="h-6 w-6 text-primary shrink-0 mt-1" />
          <div className="space-y-3">
            <p className="text-[18px] leading-[1.7] text-foreground font-medium">
              <span className="text-primary">短期</span>建立自主底座 ·
              <span className="text-primary"> 中期</span>优化成本结构 ·
              <span className="text-primary"> 长期</span>撬动新的增长曲线
            </p>
            <p className="text-[14px] leading-[1.9] text-foreground/80">
              脱淘并非一次性的迁移动作，而是<b>未来三年战略动作的前置条件</b>。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───────── 组件 ───────── */

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-2 border-b pb-3">
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</span>
    </div>
  );
}

function RiskCard({ icon: Icon, tag, title, desc }: { icon: any; tag: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-muted/15 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-md bg-red-500/15 flex items-center justify-center">
          <Icon className="h-4 w-4 text-red-500" />
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-red-500">{tag}</span>
      </div>
      <div className="text-[15px] font-semibold text-foreground leading-[1.4]">{title}</div>
      <div className="mt-2 text-[13px] text-muted-foreground leading-[1.85]">{desc}</div>
    </div>
  );
}

function ValueCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div>
          <div className="text-[13.5px] font-semibold text-foreground leading-[1.45]">{title}</div>
          <div className="mt-1 text-[12.5px] text-foreground/75 leading-[1.8]">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function StageRow({
  tone, phase, time, head, points, outcome,
}: {
  tone: "emerald" | "primary" | "violet";
  phase: string; time: string; head: string; points: string[]; outcome: string;
}) {
  const map = {
    emerald: { bar: "border-l-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10", dot: "bg-emerald-500" },
    primary: { bar: "border-l-primary", text: "text-primary", bg: "bg-primary/10", dot: "bg-primary" },
    violet: { bar: "border-l-violet-500", text: "text-violet-500", bg: "bg-violet-500/10", dot: "bg-violet-500" },
  }[tone];
  return (
    <div className={`rounded-xl border border-l-4 ${map.bar} bg-muted/10 p-5`}>
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5">
        <div>
          <div className={`inline-flex items-center gap-1.5 rounded-full ${map.bg} px-2.5 py-1`}>
            <Calendar className={`h-3 w-3 ${map.text}`} />
            <span className={`text-[12px] font-semibold ${map.text}`}>{phase}</span>
            <span className={`text-[11px] ${map.text}/80`}>{time}</span>
          </div>
          <div className="mt-3 text-[15px] font-semibold text-foreground leading-[1.45]">{head}</div>
        </div>
        <div>
          <ul className="space-y-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[13px] text-foreground/85 leading-[1.75]">
                <span className={`mt-2 h-1.5 w-1.5 rounded-full ${map.dot} shrink-0`} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className={`mt-3 flex items-center gap-1.5 text-[12.5px] ${map.text}`}>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="font-medium">{outcome}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
