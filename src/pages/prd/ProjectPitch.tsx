import { ArrowRight, Sparkles } from "lucide-react";

/**
 * 项目汇报 · 一页讲清楚（半年度全员汇报版）
 * 路由：/prd/pitch
 *
 * 设计意图：不堆数字、不列问题清单、不展开模块；
 * 一句话定义、一张图比喻、三段话讲清"我们做了什么、为什么重要"。
 */
export default function ProjectPitch() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-4">
      {/* ============== Hero · 一句话定义 ============== */}
      <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-10">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[11px] text-primary">
            <Sparkles className="h-3 w-3" /> 2026 H1 · 半年度汇报
          </span>
          <h1 className="text-[34px] font-bold leading-[1.2] tracking-tight">
            我们把「卖软件的后台」，
            <br />
            重做成了一座 <span className="text-primary">能经营家居生态的中台</span>。
          </h1>
          <p className="max-w-3xl text-[15px] leading-[1.9] text-muted-foreground">
            过去：一套只服务于「3D 设计软件」的旧后台。
            <br />
            现在：一套既能卖软件、也能跑客资、还能托起整个家居生态的<b className="text-foreground">底座</b>。
          </p>
        </div>
      </header>

      {/* ============== 一张图比喻 ============== */}
      <section className="rounded-2xl border bg-card p-8">
        <div className="mb-6 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            ONE PICTURE
          </div>
          <h2 className="mt-1 text-[20px] font-semibold">如果用一句话比喻——</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            我们搭了一条"<b className="text-foreground">家居生意的高速公路</b>"。
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {/* 入口 */}
          <Lane
            tone="blue"
            tag="入口"
            title="谁可以上路"
            desc="企业、品牌商、装企、设计师、消费者——全部按「企业」统一管，权限清晰、互不打架。"
          />
          <Arrow />
          {/* 通行 */}
          <Lane
            tone="emerald"
            tag="通行"
            title="按什么规则走"
            desc="一套权益体系：什么人、买了什么、能用多少、用到哪儿——全程可追溯、可计费、可对账。"
          />
          <Arrow />
          {/* 出口 */}
          <Lane
            tone="purple"
            tag="出口"
            title="路上跑什么生意"
            desc="客资从平台流向商家，商家把单子做成，平台拿到经营数据，再反哺下一轮分发。"
          />
        </div>
      </section>

      {/* ============== 我们做了什么 · 三段话 ============== */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ValueCard
          n="01"
          title="把「散的」做成了「通的」"
          body="原本散落在各端的企业、权限、权益、客户、营销、商家——现在跑在同一套底座上，数据天然连通、规则天然一致。"
        />
        <ValueCard
          n="02"
          title="把「卖软件」扩成了「做生意」"
          body="平台不再只靠卖席位赚钱：客资分发、营销服务、商家运营、生态分润，多了好几条收入曲线。"
        />
        <ValueCard
          n="03"
          title="把「拍脑袋」换成了「看数据」"
          body="客户健康分、商家分级、续费风险、营销 ROI，每一个经营动作都有事实支撑，Agent 还能主动给出建议。"
        />
      </section>

      {/* ============== 收尾 · 一句话 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-card p-8 text-center">
        <p className="text-[18px] font-semibold leading-[1.6] text-foreground">
          这套底座，<span className="text-primary">未必能让今天立刻变得不一样</span>，
          <br />
          但能让接下来的<span className="text-primary">每一步</span>，都<span className="text-primary">站得住、跑得快、传得下去</span>。
        </p>
      </footer>
    </div>
  );
}

/* ───────── 内部小组件 ───────── */

function Lane({
  tone, tag, title, desc,
}: {
  tone: "blue" | "emerald" | "purple";
  tag: string; title: string; desc: string;
}) {
  const map = {
    blue:    { border: "border-blue-500/40",    bg: "bg-blue-500/5",    text: "text-blue-600" },
    emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/5", text: "text-emerald-600" },
    purple:  { border: "border-purple-500/40",  bg: "bg-purple-500/5",  text: "text-purple-600" },
  }[tone];
  return (
    <div className={`rounded-xl border-2 border-dashed ${map.border} ${map.bg} p-5`}>
      <div className={`font-mono text-[10.5px] uppercase tracking-[0.2em] ${map.text}`}>{tag}</div>
      <div className="mt-2 text-[15px] font-semibold text-foreground">{title}</div>
      <p className="mt-2 text-[12.5px] leading-[1.85] text-foreground/75">{desc}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <ArrowRight className="h-5 w-5 text-muted-foreground/60" />
    </div>
  );
}

function ValueCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="relative rounded-xl border bg-card p-5">
      <div className="absolute right-4 top-3 font-mono text-[28px] font-bold text-primary/15">{n}</div>
      <div className="text-[15px] font-semibold text-foreground">{title}</div>
      <p className="mt-2 text-[12.5px] leading-[1.85] text-muted-foreground">{body}</p>
    </div>
  );
}
