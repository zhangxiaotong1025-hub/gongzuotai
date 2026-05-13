import { Sparkles, Quote, Network, Layers3, Receipt, ArrowRight } from "lucide-react";

/**
 * 项目汇报 · 一页讲清楚（v5 · 讲设计本身）
 * 路由：/prd/pitch
 *
 * 三个结果 × 三个设计决策。不讲背景、不讲苦劳，只讲：
 *   做了什么设计 → 因此得到了什么结果。
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
              THREE RESULTS · THREE DESIGN CHOICES
            </span>
          </div>

          <h1 className="text-[32px] font-bold leading-[1.22] tracking-tight">
            过去半年，我们用 <span className="text-primary">三个设计决策</span>，
            <br />
            换来了三个看起来「不该同时成立」的结果。
          </h1>

          <p className="max-w-3xl text-[14px] leading-[1.95] text-foreground/85">
            一套系统，<b>同时支撑平台与企业两种视角</b>；新业务上线，从 <b>N 周降到 N 天</b>；
            任何一个业务事件，都能被<b>追溯到一行订单</b>——这三件事，靠的不是堆人堆模块，
            而是三个一开始就定下来的设计决策。
          </p>
        </div>
      </header>

      {/* ============== 三个结果 → 三个设计 ============== */}
      <section className="space-y-4">
        <ResultDesign
          n="01"
          icon={Network}
          result="一套系统,同时支撑平台与企业两种视角"
          oldWay="过去通常的做法:平台一套后台,企业一套后台,中间靠接口对齐——任何一次升级都要改两遍、对两次。"
          design="把平台当成一家「特殊的企业」。"
          designDetail={[
            "平台和所有企业,共用同一份组织、同一套权限模型、同一份数据结构",
            "差异不靠两套代码,靠「身份」区分——是平台还是企业,决定了能看到什么、能做什么",
            "代客操作、代客建号、代客下单 天然合法,不需要再开第二条通道",
          ]}
          why="一份代码、一个数据模型,养两类用户;以后再加分公司、子平台、海外站,都是「再加一种身份」,不是「再做一套系统」。"
        />

        <ResultDesign
          n="02"
          icon={Layers3}
          result="新业务上线,从 N 周降到 N 天"
          oldWay="过去通常的做法:每来一种新合作模式(聚合 / 分销 / 履约 / 供给),就要新做一个项目、改一轮表结构、谈一次集成。"
          design="把「业务关系」从代码里抽出来,做成一张可配置的关系图谱。"
          designDetail={[
            "品牌、卖场、装企、门店、设计工作室 之间允许什么关系,由配置说了算",
            "新增一种业务形态 ≈ 在关系图谱里加一条边,不需要动主流程代码",
            "新业务和老业务跑在同一副骨架上,不会互相打架、不会重复建设",
          ]}
          why="业务变化的速度,第一次追上了市场变化的速度——以前是产品等技术,现在是配置等业务想清楚。"
        />

        <ResultDesign
          n="03"
          icon={Receipt}
          result="任何业务事件,都能被追溯到一行订单"
          oldWay="过去通常的做法:开通在一处改、续费在另一处改、赠送又是第三处改——出问题时谁也说不清「这权益是怎么来的」。"
          design="规定一条铁律:所有权益变化,必须经过订单。"
          designDetail={[
            "采购、内部分配、体验赠送、续费、退款 全部走「订单」这一个入口",
            "权益账户里的每一格余额,都能反查到是哪一行订单写进来的",
            "审核、支付、生命周期 三件事彼此独立,不再有「全局状态」的黑箱",
          ]}
          why="对账、审计、客诉、复盘,第一次有了唯一可信的单据;任何一笔钱、任何一份权益、任何一次变动,都说得清来龙去脉。"
        />
      </section>

      {/* ============== 这三件事为什么必须放在一起 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-[15px] font-semibold">这三个设计,其实是同一个设计</h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">ONE SYSTEM · ONE BACKBONE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 items-stretch">
          <Brick tone="primary" tag="① 谁" title="同一个身份模型" desc="平台和企业,跑在同一份组织、权限、数据结构上。" />
          <Arrow />
          <Brick tone="emerald" tag="② 做什么" title="同一张关系图谱" desc="所有业务形态,是这张图上不同的边。" />
          <Arrow />
          <Brick tone="violet" tag="③ 怎么算" title="同一个订单入口" desc="所有权益、资金、配额变动,必经订单。" />
        </div>

        <p className="mt-5 text-[13px] text-foreground/85 leading-[1.9]">
          身份统一 → 视角才能切换;关系可配 → 业务才能快速接入;订单唯一 → 一切才能被追溯。
          <br />
          <b className="text-primary">三件事互为前提,缺一个都做不成;三件事一旦做齐,就成了一副可以长期演进的骨架。</b>
        </p>
      </section>

      {/* ============== 收尾 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-7">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-1.5" />
          <p className="text-[16px] leading-[1.85] text-foreground">
            真正花心思的,不是写出多少功能,
            <br />
            而是<b className="text-primary">用尽量少的设计决策,把尽量多的业务装进同一副骨架</b>——
            <br />
            这副骨架做完了,后面的每一项增长,都站在它上面长出来。
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ───────── 组件 ───────── */

function ResultDesign({
  n, icon: Icon, result, oldWay, design, designDetail, why,
}: {
  n: string; icon: any; result: string; oldWay: string; design: string; designDetail: string[]; why: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div className="absolute right-5 top-3 font-mono text-[64px] font-bold text-primary/8 leading-none select-none">{n}</div>

      <div className="relative px-6 pt-5 pb-4 border-b bg-primary/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">RESULT {n}</span>
        </div>
        <div className="text-[18px] font-semibold text-foreground leading-[1.4]">{result}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
        <div className="md:col-span-4 px-6 py-5 md:border-r border-b md:border-b-0 bg-muted/20">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">通常的做法</div>
          <div className="text-[12.5px] text-muted-foreground leading-[1.85]">{oldWay}</div>
        </div>

        <div className="md:col-span-5 px-6 py-5 md:border-r border-b md:border-b-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-primary mb-1.5">我们的设计</div>
          <div className="text-[14px] font-semibold text-foreground leading-[1.55] mb-2.5">{design}</div>
          <ul className="space-y-1.5">
            {designDetail.map((d) => (
              <li key={d} className="flex items-start gap-2 text-[12px] text-foreground/80 leading-[1.7]">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 px-6 py-5 bg-emerald-500/5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-500 mb-1.5">因此</div>
          <div className="text-[12.5px] text-foreground/85 leading-[1.85]">{why}</div>
        </div>
      </div>
    </div>
  );
}

function Brick({
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
      <div className="mt-1.5 text-[12px] text-muted-foreground leading-[1.8]">{desc}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
