import { Sparkles, Quote, ShieldAlert, Database, Network, Layers3, Calendar, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * 项目汇报 · 一页讲清楚（CEO 视角 · v4）
 * 路由：/prd/pitch
 *
 * 关键叙事：
 *   1) 我们为什么必须做（阿里撤资 · 系统切割 · 自主可控）
 *   2) 我们做成了什么（平台资产池 + 关系图谱 + 产品矩阵）
 *   3) 业务上的回报（新业务从月到日 · 国内外统一 · 数据自控）
 *   4) 6 月里程碑（3D 能力搭建 + 数据资产迁移完成）
 */
export default function ProjectPitch() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 py-4">
      {/* ============== Hero ============== */}
      <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-card to-card p-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[11px] text-primary">
              <Sparkles className="h-3 w-3" /> 2026 H1 · 半年度汇报
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
              ONE PAGE · FOR LEADERSHIP
            </span>
          </div>

          <h1 className="text-[32px] font-bold leading-[1.25] tracking-tight">
            把<span className="text-primary">「寄人篱下」</span>的居然设计家，
            <br />
            重做成一座<span className="text-primary">自己能掌控、自己能经营</span>的产业平台。
          </h1>

          <p className="max-w-3xl text-[14px] leading-[1.95] text-foreground/85">
            过去半年最重要的事，不是上线了多少功能，而是——
            <b>我们第一次拥有了一套属于自己的底座</b>：
            企业、用户、商品、订单、权益、资金，全部沉淀在我们自己的库里、跑在我们自己的代码上、
            由我们自己定义业务规则。<b className="text-primary">阿里撤资之后，我们不再是「随时可能被拔网线」的状态。</b>
          </p>
        </div>
      </header>

      {/* ============== 紧迫性 · 我们为什么必须做 ============== */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-3 flex-1">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-amber-500">WHY NOW · 这件事不能晚</div>
              <h2 className="mt-1 text-[17px] font-semibold text-foreground">阿里撤资 → 系统切割 → 自主可控，是一道生存题</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <UrgencyItem
                tag="过去"
                tone="muted"
                title="连「自己开门」的权限都没有"
                desc="企业开通、登录注册、账号体系全部在阿里手里，我们连一个自有登录页都做不出来；任何一次政策调整，我们都是被动方。"
              />
              <UrgencyItem
                tag="今天"
                tone="primary"
                title="底座、数据、规则，全部回到自己手里"
                desc="企业 / 用户 / 订单 / 权益 / 营销 全链路跑在我们自有系统上；切割工作有节奏、有路径、有交付物。"
              />
              <UrgencyItem
                tag="6 月"
                tone="emerald"
                title="3D 能力搭建 + 数据资产迁移完成"
                desc="完成后，企业数据将完全自我掌控；只剩 3D 工具的渲染能力仍依赖阿里——可控、可替换、不再致命。"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============== 三大核心成果 ============== */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Pillar
          n="01"
          icon={Database}
          headline="形成了我们自己的「平台资产池」"
          subline="为后续平台供应链打地基"
          points={[
            "企业、门店、用户、商品、订单、权益 全部沉淀在自有数据资产里",
            "每一笔生意都在我们库里留下可追溯的轨迹，不再靠对方接口反查",
            "下一步做平台供应链 / 金融 / 流量分发，第一次有了「资产可调度」的前提",
          ]}
        />
        <Pillar
          n="02"
          icon={Network}
          headline="一张关系图谱，装下整个家居产业"
          subline="新业务接入：从「月」降到「日」"
          points={[
            "品牌、卖场、装企、门店、设计工作室 之间的关系一图共存",
            "新增一种业务形态（聚合 / 分销 / 履约 / 供给）≈ 加一行配置",
            "不再为每一种新合作模式重做一个项目、重谈一次集成",
          ]}
        />
        <Pillar
          n="03"
          icon={Layers3}
          headline="产品矩阵：国内外统一，业务线互不污染"
          subline="同一家客户，可以同时是几条不同的生意"
          points={[
            "同一家企业，可以并行接入「国内 3D」「国际 3D」「供应链」等多条产品线",
            "账户、配额、对账、权益 完全隔离，一条线出问题不会影响另一条",
            "客户 ARPU 上限：从单产品收入 → 产品矩阵叉乘",
          ]}
        />
      </section>

      {/* ============== 三层架构 · 轻提及 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-[15px] font-semibold">这三件事，长在同一副骨架上</h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
            ONE BACKBONE · THREE LAYERS
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <LayerCard
            tone="primary"
            tag="① 配置层"
            title="定义「我们做什么生意」"
            desc="企业类型、产品矩阵、业务关系图谱在这里被定义；改这一层，业务形态就跟着变。"
          />
          <LayerCard
            tone="emerald"
            tag="② 履约层"
            title="把生意「跑起来 + 收得上钱」"
            desc="订单、权益、账户、支付与对账在这里发生；任何一次变化都能被追溯到一行订单。"
          />
          <LayerCard
            tone="violet"
            tag="③ 运营层"
            title="把数据变成「下一步动作」"
            desc="客户健康、营销 ROI、商家工作台、智能助手在这里闭环；每一次动作又回流为新数据。"
          />
        </div>
        <p className="mt-4 text-[12.5px] text-muted-foreground leading-[1.85]">
          三层不是三个系统，是同一副骨架的三个剖面——
          <b className="text-foreground/85">这也是为什么我们能用一套底座，同时支撑平台、企业、商家、用户四种视角。</b>
        </p>
      </section>

      {/* ============== 6 月里程碑 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h2 className="text-[15px] font-semibold">6 月里程碑：完成「数据自控」的最后一公里</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <MilestoneItem
            done
            title="3D 工具能力搭建完成"
            desc="设计、出图、方案管理 等核心工具能力全部跑在自有体系上。"
          />
          <MilestoneItem
            done
            title="企业数据资产完成迁移"
            desc="企业 / 用户 / 订单 / 权益 全量切回自有库，企业数据完全自我掌控。"
          />
          <MilestoneItem
            warn
            title="渲染能力仍依赖阿里"
            desc="是当前唯一的外部依赖；已是「可控、可替换、可演进」的状态，不再致命。"
          />
          <MilestoneItem
            done
            title="切割路径清晰、节奏可控"
            desc="不再是「随时被拔网线」的被动方，而是「按自己的节奏走」的主动方。"
          />
        </div>
      </section>

      {/* ============== 收尾 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-7">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-1.5" />
          <div className="space-y-2">
            <p className="text-[16px] leading-[1.85] text-foreground">
              过去半年，我们把<b className="text-primary">「能不能活下去」</b>这件事做完了；
              <br />
              接下来，我们要把<b className="text-primary">「能不能长出来」</b>——
              用这副自己的骨架，去做平台供应链、做产业生态、做属于居然设计家自己的生意。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───────── 组件 ───────── */

function UrgencyItem({
  tag, tone, title, desc,
}: { tag: string; tone: "muted" | "primary" | "emerald"; title: string; desc: string }) {
  const map = {
    muted: "text-muted-foreground border-muted-foreground/30 bg-muted/30",
    primary: "text-primary border-primary/30 bg-primary/10",
    emerald: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  }[tone];
  return (
    <div className="rounded-lg border bg-background/40 p-4">
      <span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider border ${map}`}>{tag}</span>
      <div className="mt-2 text-[13.5px] font-semibold text-foreground leading-[1.5]">{title}</div>
      <div className="mt-1.5 text-[12px] text-muted-foreground leading-[1.8]">{desc}</div>
    </div>
  );
}

function Pillar({
  n, icon: Icon, headline, subline, points,
}: { n: string; icon: any; headline: string; subline: string; points: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5">
      <div className="absolute right-3 top-1 font-mono text-[44px] font-bold text-primary/10 leading-none">{n}</div>
      <div className="relative flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">CORE {n}</span>
      </div>
      <div className="mt-4 space-y-1">
        <div className="text-[14.5px] font-semibold text-foreground leading-[1.45]">{headline}</div>
        <div className="text-[11.5px] text-primary leading-[1.6]">{subline}</div>
      </div>
      <ul className="mt-3 pt-3 border-t border-dashed space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2 text-[12px] text-foreground/80 leading-[1.7]">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LayerCard({
  tone, tag, title, desc,
}: { tone: "primary" | "emerald" | "violet"; tag: string; title: string; desc: string }) {
  const map = {
    primary: { bar: "border-l-primary", text: "text-primary" },
    emerald: { bar: "border-l-emerald-500", text: "text-emerald-500" },
    violet: { bar: "border-l-violet-500", text: "text-violet-500" },
  }[tone];
  return (
    <div className={`rounded-lg border border-l-4 ${map.bar} bg-muted/15 p-4`}>
      <div className={`font-mono text-[10px] uppercase tracking-[0.2em] ${map.text}`}>{tag}</div>
      <div className="mt-1 text-[13.5px] font-semibold text-foreground">{title}</div>
      <div className="mt-2 text-[12px] text-muted-foreground leading-[1.8]">{desc}</div>
    </div>
  );
}

function MilestoneItem({
  done, warn, title, desc,
}: { done?: boolean; warn?: boolean; title: string; desc: string }) {
  const Icon = warn ? AlertTriangle : CheckCircle2;
  const color = warn ? "text-amber-500" : "text-emerald-500";
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/15 p-4">
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
      <div>
        <div className="text-[13px] font-semibold text-foreground leading-[1.5]">{title}</div>
        <div className="mt-1 text-[12px] text-muted-foreground leading-[1.8]">{desc}</div>
      </div>
    </div>
  );
}
