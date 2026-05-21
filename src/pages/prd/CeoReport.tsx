import {
  ShieldAlert, Unplug, Sparkles, Rocket, Layers3, Globe2, Database,
  TrendingUp, Quote, ArrowRight, CheckCircle2, AlertTriangle, Calendar,
  Target, Cpu, Building2, LineChart,
} from "lucide-react";

/**
 * 脱淘项目 · CEO 汇报
 * 路由：/prd/ceo
 *
 * 一页讲清楚：为什么必须做、短期能拿到什么、长期能撬动什么。
 * 受众：CEO。要求：先讲风险与回报，再讲打法，不讲技术细节。
 */
export default function CeoReport() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 py-4">
      {/* ============== Hero ============== */}
      <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-card to-card p-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[11px] text-primary">
              <Sparkles className="h-3 w-3" /> CEO 汇报 · 脱淘项目
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
              SHORT-TERM SURVIVAL · LONG-TERM LEVERAGE
            </span>
          </div>

          <h1 className="text-[32px] font-bold leading-[1.22] tracking-tight">
            脱淘不只是一次系统迁移，
            <br />
            更是一次<span className="text-primary">建立自主可控底座</span>的机会。
          </h1>

          <p className="max-w-3xl text-[14px] leading-[1.95] text-foreground/85">
            短期看，这是一次<b>必要的外部依赖收敛</b>——账号、资产、系统监控目前仍依托阿里体系；
            长期看，这是十年来<b>第一次有机会从底座重新规划系统</b>，
            将国内外、多产品线与企业级业务统一到同一套架构上。
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <Pill icon={ShieldAlert} tone="danger" text="外部依赖待收敛" />
            <Pill icon={AlertTriangle} tone="warn" text="历史债务待清理" />
            <Pill icon={Cpu} tone="primary" text="AI 化基础准备" />
            <Pill icon={Globe2} tone="success" text="国内外统一契机" />
          </div>
        </div>
      </header>

      {/* ============== 为什么是现在 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <SectionTitle eyebrow="WHY NOW" title="为什么这件事必须现在做" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <RiskCard
            icon={Unplug}
            tag="外部依赖"
            title="账号体系依托阿里"
            desc="国内版 B 端账号、注册、企业创建仍接入阿里体系。考虑到阿里已在收敛边缘业务，相关链路存在不确定性，需要在可控时间内完成迁移。"
          />
          <RiskCard
            icon={AlertTriangle}
            tag="历史债务"
            title="十年迭代积累待整理"
            desc="历史功能层层叠加，新业务在老逻辑上扩展成本较高；部分旧代码缺乏改造空间，系统观测能力也较为有限。"
          />
          <RiskCard
            icon={Layers3}
            tag="资源效率"
            title="国内外多套并行"
            desc="国内、国际两套体系叠加多个工作台，同一模块往往需要重复开发，研发投入产出比有较大优化空间。"
          />
        </div>
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Quote className="h-4 w-4 text-primary mt-1 shrink-0" />
            <p className="text-[13px] leading-[1.9] text-foreground/90">
              <b>结论：</b>这三类问题难以通过"再迭代一版"逐步消化。
              脱淘是<b className="text-primary">一次较为合适的、可以从底座系统性重构的窗口期</b>，
              越早推进，整体成本和协同代价越低。
            </p>
          </div>
        </div>
      </section>

      {/* ============== 短期收益 ============== */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-emerald-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 flex items-center justify-center">
              <Rocket className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-500">SHORT-TERM · 0–6 个月</span>
          </div>
          <div className="text-[18px] font-semibold text-foreground leading-[1.4]">短期收益 · 完成依赖收敛、跑通样板链路</div>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-[1.85]">
            短期不追求规模，聚焦三件事：<b className="text-foreground">迁移彻底、链路跑通、模式可复用</b>。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          <BenefitBlock
            n="01"
            title="依赖收敛"
            head="国内版完成账号体系自主化"
            bullets={[
              "建立独立的账号、权限与企业体系",
              "存量用户平滑迁移 ≥ 95%，业务保持连续",
              "对外部账号体系的依赖降到可控范围",
            ]}
            kpi="脱淘完成率 100% · 用户迁移率 ≥ 95%"
          />
          <BenefitBlock
            n="02"
            title="样板跑通"
            head="智能导购全链路在新架构上跑通"
            bullets={[
              "从企业入驻 → 资产分配 → 导购展示 全链路验证",
              "证明新架构「装得下真实业务」",
              "成为其他产品脱淘的统一样板",
            ]}
            kpi="智能导购脱淘上线 · 后续产品复用率 ≥ 80%"
          />
          <BenefitBlock
            n="03"
            title="架构清理"
            head="借脱淘契机系统性清理历史债务"
            bullets={[
              "梳理并下线约 80% 的废旧功能，保留核心",
              "企业 / 资产 / 权益 / 权限 模型统一重构",
              "形成可支撑 3–5 年演进的稳定底座",
            ]}
            kpi="核心模块重构完成 · 系统可观测性恢复"
          />
        </div>

        <div className="px-6 py-4 bg-emerald-500/5 border-t flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-[12.5px] text-foreground/85 leading-[1.85]">
            <b className="text-foreground">短期不直接带来新增收入，但建立的是业务自主性与连续性保障。</b>
            它的价值更多体现在风险出现前的稳定性，
            也是中长期收益能够顺利落地的<b className="text-emerald-500">前提条件</b>。
          </p>
        </div>
      </section>

      {/* ============== 中期收益 ============== */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">MID-TERM · 6–12 个月</span>
          </div>
          <div className="text-[18px] font-semibold text-foreground leading-[1.4]">中期收益 · 一套架构，承接所有产品线</div>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-[1.85]">
            样板跑通后，将<b className="text-foreground">国内 3D、国际 3D、精准营销、AI 设计家</b>逐步接入，
            把多年并行开发的投入逐步收敛到统一主干上。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-y md:divide-y-0">
          <MidBlock
            icon={Globe2}
            title="国内外统一"
            points={[
              "国内 3D 与国际 3D 作为同一架构下的两个产品",
              "差异通过配置承接，避免双套代码维护",
              "研发投入从维护双系统转向新业务建设",
            ]}
            outcome="重复开发成本下降 · 海外扩张底座近乎零额外成本"
          />
          <MidBlock
            icon={Building2}
            title="企业级业务真正跑起来"
            points={[
              "支持品牌商 / 经销商 / 卖场 / 装企等差异化形态",
              "企业组织结构（总部 → 区域 → 门店）权限可配",
              "客单价与客户粘性同时抬升",
            ]}
            outcome="B 端续约率提升 · 企业级解决方案可独立报价"
          />
          <MidBlock
            icon={Database}
            title="数据资产开始可被治理"
            points={[
              "资产、权益、订单 全链路可追溯",
              "平台第一次具备跨企业、跨产品的数据视角",
              "为后面的 BI、风控、客成提供唯一可信上游",
            ]}
            outcome="数据驱动运营 · 不再依赖人肉拉表对账"
          />
          <MidBlock
            icon={LineChart}
            title="新业务上线效率显著提升"
            points={[
              "新增业务形态以配置为主，开发改动量降低",
              "新能力 / 套餐 / 权益的扩展路径标准化",
              "产品节奏更贴近市场节奏",
            ]}
            outcome="新功能上线周期从 N 周 → N 天"
          />
        </div>
      </section>

      {/* ============== 长期收益 ============== */}
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-md bg-violet-500/15 flex items-center justify-center">
              <Cpu className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500">LONG-TERM · 12–24 个月</span>
          </div>
          <div className="text-[18px] font-semibold text-foreground leading-[1.4]">长期收益 · 从工具型产品演进为 AI × 平台型产品</div>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground leading-[1.85]">
            底座稳定、数据贯通、业务可配置之后，<b className="text-foreground">AI 化与平台化才具备落地基础</b>，
            脱淘与重构是这条路径的必要前置。
          </p>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <LongCard
            icon={Sparkles}
            tag="AI 化升级"
            title="AI 辅助设计 · 智能推荐 · 数据预测"
            desc="高质量、可追溯的数据是 AI 能力落地的基础。脱淘后形成的数据底座，能够支撑 AI 设计家由工具向生产力平台的演进。"
          />
          <LongCard
            icon={Layers3}
            tag="平台化演进"
            title="从工具平台 → 生态平台"
            desc="第三方接入、供应链建设与平台治理，都需要平台具备完整的资产管理能力。脱淘后这一基础得以建立。"
          />
          <LongCard
            icon={TrendingUp}
            tag="商业模式扩展"
            title="权益化运营 · 多元变现"
            desc="基于统一的权益与订单底座，可以灵活配置会员、套餐、SaaS 订阅、增值服务，支撑未来 3–5 年的多元收入结构。"
          />
        </div>

        <div className="mx-6 mb-6 rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
          <p className="text-[13px] leading-[1.9] text-foreground/90">
            <b className="text-violet-500">CTO 视角：</b>
            旧代码改造空间有限；重新设计一套架构，国内外统一为一套体系，
            <b className="text-foreground">后续迭代和维护效率会显著提升</b>，这是长期价值复利的起点。
          </p>
        </div>
      </section>

      {/* ============== 时间线 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <SectionTitle eyebrow="ROADMAP" title="一条时间线看完所有节奏" />
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Phase
            tone="emerald"
            phase="Phase 1"
            time="0 – 6 个月"
            title="脱淘 + 样板"
            items={["完成账号体系切换", "智能导购全链路上线", "企业/资产/权益/权限 重构完成"]}
          />
          <Phase
            tone="primary"
            phase="Phase 2"
            time="6 – 12 个月"
            title="产品接入 + 国内外统一"
            items={["国内 3D / 国际 3D / 精准营销 / AI 设计家 接入新架构", "一套架构承接差异化", "数据资产开始治理"]}
          />
          <Phase
            tone="violet"
            phase="Phase 3"
            time="12 – 24 个月"
            title="AI 化 + 平台化"
            items={["AI 辅助设计与智能推荐", "第三方生态接入", "权益化 / 多元变现落地"]}
          />
        </div>
      </section>

      {/* ============== 总结 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-7">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 text-primary shrink-0 mt-1.5" />
          <div className="space-y-3">
            <p className="text-[16px] leading-[1.85] text-foreground">
              <b className="text-primary">短期</b>——建立自主可控的业务底座；
              <b className="text-primary"> 中期</b>——优化整体成本结构；
              <b className="text-primary"> 长期</b>——支撑新的增长曲线。
            </p>
            <p className="text-[13px] leading-[1.95] text-foreground/85">
              脱淘并非一次性的迁移动作，而是<b>未来三年战略动作的前置条件</b>。
              完成这一步之后，公司在产品与技术层面将具备更完整的自主能力。
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
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</span>
    </div>
  );
}

function Pill({ icon: Icon, tone, text }: { icon: any; tone: "danger" | "warn" | "primary" | "success"; text: string }) {
  const map = {
    danger: "bg-red-500/15 text-red-500 border-red-500/30",
    warn: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    primary: "bg-primary/15 text-primary border-primary/30",
    success: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] ${map}`}>
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}

function RiskCard({ icon: Icon, tag, title, desc }: { icon: any; tag: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-muted/15 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-md bg-red-500/15 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-red-500" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-500">{tag}</span>
      </div>
      <div className="text-[13.5px] font-semibold text-foreground leading-[1.5]">{title}</div>
      <div className="mt-1.5 text-[12px] text-muted-foreground leading-[1.85]">{desc}</div>
    </div>
  );
}

function BenefitBlock({
  n, title, head, bullets, kpi,
}: { n: string; title: string; head: string; bullets: string[]; kpi: string }) {
  return (
    <div className="relative px-6 py-5">
      <div className="absolute right-4 top-2 font-mono text-[44px] font-bold text-emerald-500/10 leading-none select-none">{n}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-500 mb-1.5">{title}</div>
      <div className="text-[13.5px] font-semibold text-foreground leading-[1.5] mb-2">{head}</div>
      <ul className="space-y-1.5 mb-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12px] text-foreground/80 leading-[1.7]">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-md bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-600 leading-[1.6]">
        <span className="font-mono uppercase tracking-wider text-[9.5px] mr-1">KPI</span>{kpi}
      </div>
    </div>
  );
}

function MidBlock({ icon: Icon, title, points, outcome }: { icon: any; title: string; points: string[]; outcome: string }) {
  return (
    <div className="px-6 py-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="text-[13.5px] font-semibold text-foreground">{title}</div>
      </div>
      <ul className="space-y-1.5 mb-3">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[12px] text-foreground/80 leading-[1.7]">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-1.5 text-[11.5px] text-primary">
        <ArrowRight className="h-3 w-3" />
        <span>{outcome}</span>
      </div>
    </div>
  );
}

function LongCard({ icon: Icon, tag, title, desc }: { icon: any; tag: string; title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-l-4 border-l-violet-500 bg-muted/15 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-violet-500" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-violet-500">{tag}</span>
      </div>
      <div className="text-[13.5px] font-semibold text-foreground leading-[1.5]">{title}</div>
      <div className="mt-1.5 text-[12px] text-muted-foreground leading-[1.85]">{desc}</div>
    </div>
  );
}

function Phase({
  tone, phase, time, title, items,
}: { tone: "emerald" | "primary" | "violet"; phase: string; time: string; title: string; items: string[] }) {
  const map = {
    emerald: { bar: "border-l-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500" },
    primary: { bar: "border-l-primary", text: "text-primary", dot: "bg-primary" },
    violet: { bar: "border-l-violet-500", text: "text-violet-500", dot: "bg-violet-500" },
  }[tone];
  return (
    <div className={`rounded-lg border border-l-4 ${map.bar} bg-muted/15 p-4`}>
      <div className="flex items-center gap-2 mb-1">
        <Calendar className={`h-3.5 w-3.5 ${map.text}`} />
        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${map.text}`}>{phase} · {time}</span>
      </div>
      <div className="text-[14px] font-semibold text-foreground mb-2">{title}</div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-[12px] text-foreground/80 leading-[1.7]">
            <span className={`mt-1.5 h-1 w-1 rounded-full ${map.dot} shrink-0`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
