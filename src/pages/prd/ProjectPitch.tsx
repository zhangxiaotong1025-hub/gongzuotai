import { Sparkles, Quote, ArrowRight, Zap, Network, Layers3, Infinity as InfinityIcon } from "lucide-react";

/**
 * 项目汇报 · 一页讲清楚（CEO / CTO 双视角版 · v3）
 * 路由：/prd/pitch
 *
 * 目标：一页之内，让 CEO 看到"生意",让 CTO 看到"骨架",让两人同时觉得"这事做得真漂亮"。
 * 设计语言：黑底高对比 + 单一主色 + 等宽序号 + 大留白；像一份董事会一页纸。
 */
export default function ProjectPitch() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 py-4">
      {/* ============== Hero ============== */}
      <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-card to-card p-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 font-mono text-[11px] text-primary">
              <Sparkles className="h-3 w-3" /> 2026 H1 · 半年度汇报
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
              FOR CEO &amp; CTO · ONE PAGE
            </span>
          </div>

          <h1 className="text-[34px] font-bold leading-[1.2] tracking-tight">
            我们没有做一套更大的后台。
            <br />
            我们用 <span className="text-primary">三条公理</span>，重新定义了
            <span className="text-primary">「居然设计家是一门什么生意」</span>。
          </h1>

          <p className="max-w-3xl text-[14px] leading-[1.95] text-foreground/85">
            过去半年，最值得讲的不是上线了多少模块，而是——
            <b>整个产业里所有的角色、关系、收费方式、数据流向，第一次被装进了同一套最简语法里。</b>
            从此，加一种新生意 ≈ 加一行配置；不再是加一个新系统。
          </p>
        </div>
      </header>

      {/* ============== 三条公理 · 主视觉 ============== */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Axiom
          n="01"
          icon={Network}
          forCEO="平台不是甲方，是生态里的一员"
          forCTO="Platform as Enterprise"
          oneLine="平台 = enterprise 表里 type=平台 的一行虚拟根。"
          why="代客操作天然合法，权限模型可递归，未来分公司 / 子平台 / 海外站零改造。"
          metric="数据模型分支数：1（不是 2）"
        />
        <Axiom
          n="02"
          icon={Layers3}
          forCEO="一张关系图，装下整个家居产业"
          forCTO="SUB_TYPE_MAP 即业务模型"
          oneLine="父类型→子类型 的有向图，是关系图唯一权威。"
          why="品牌分销、卖场聚合、装企履约、供应链协同 四种生意一图共存；新形态改一行配置。"
          metric="新业务接入成本：从「一个项目」降到「一个 PR」"
        />
        <Axiom
          n="03"
          icon={InfinityIcon}
          forCEO="同一家客户，可以同时是三门生意"
          forCTO="企业 × 产品 = 最小寻址坐标"
          oneLine="enterprise_id × product_id 唯一定位一切权益、订单、营销动作。"
          why="欧派可以「国内 3D 已激活、国际 3D 未开通」，账户、配额、对账完全隔离，互不污染。"
          metric="客户 ARPU 上限：从单产品 → 产品矩阵叉乘"
        />
      </section>

      {/* ============== 一图看懂：从公理到生意 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">从三条公理，长出整套业务</h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
            ARCHITECTURE · ONE GLANCE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <FlowCol
            tone="primary"
            tag="① 配置层"
            title="关系语法"
            items={["enterprise（含平台虚拟根）", "SUB_TYPE_MAP 关系图", "product / capability / rule"]}
            note="改这一层 = 改业务形态"
          />
          <FlowArrow />
          <FlowCol
            tone="emerald"
            tag="② 履约层"
            title="订单 = 唯一变更入口"
            items={["order（采购 / 内部分配 / 体验）", "权益账户（按 enterprise×product 隔离）", "状态三维：审核 / 支付 / 生命周期"]}
            note="编辑不创订单，订单写一切"
          />
          <FlowArrow />
          <FlowCol
            tone="violet"
            tag="③ 运营层"
            title="数据 → 决策 → 动作"
            items={["客户健康分 + 营销 ROI + Agent 建议", "商家工作台（端到端经营闭环）", "代客服务、审计、对账 同一套接口"]}
            note="一切动作回流为新事件"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <KPI label="单表 + 单套 RLS" value="同时支撑平台与企业视角" />
          <KPI label="新业务上线" value="从 N 周 → N 天" />
          <KPI label="可解释性" value="任何业务事件都能被追溯到一行订单" />
        </div>
      </section>

      {/* ============== CEO / CTO 双视角收益 ============== */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <RoleView
          role="给 CEO"
          tagline="把卖软件，做成了经营产业"
          items={[
            ["三条变现曲线并跑", "分销分润 / 聚合抽佣 / 供应链协同 同一套系统"],
            ["客户生命周期闭环", "从线索→签约→续费→交叉销售，全部可量化"],
            ["扩张几乎零边际成本", "新业态、新区域、新子品牌，复用同一副骨架"],
          ]}
        />
        <RoleView
          role="给 CTO"
          tagline="把复杂度，关进了三条公理"
          items={[
            ["架构分支收敛为 1", "平台/企业、内/外、自营/代客 都走同一份代码路径"],
            ["状态机可验证", "审核·支付·生命周期 三维独立，没有「全局 status 黑洞」"],
            ["可演进的最小核", "公理不变，模块可换；十年内不需要再做一次大重构"],
          ]}
        />
      </section>

      {/* ============== 收尾 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-7">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-1.5" />
          <div className="space-y-2">
            <p className="text-[16px] leading-[1.8] text-foreground">
              真正难的，不是写出多少功能，
              <br />
              而是<b className="text-primary">用一套最简的公理，解释完整个产业里所有的人、关系和生意</b>。
            </p>
            <p className="text-[13px] leading-[1.85] text-muted-foreground">
              过去半年，我们把这件事做完了。<b className="text-foreground/90">剩下的所有增长，都是在这副骨架上长肉。</b>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ───────── 组件 ───────── */

function Axiom({
  n, icon: Icon, forCEO, forCTO, oneLine, why, metric,
}: {
  n: string; icon: any; forCEO: string; forCTO: string; oneLine: string; why: string; metric: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5">
      <div className="absolute right-3 top-1 font-mono text-[44px] font-bold text-primary/10 leading-none">{n}</div>

      <div className="relative flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">AXIOM {n}</span>
      </div>

      <div className="mt-4 space-y-2.5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-primary/70 mb-0.5">FOR CEO</div>
          <div className="text-[14px] font-semibold text-foreground leading-[1.45]">{forCEO}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-500/80 mb-0.5">FOR CTO</div>
          <div className="text-[13px] font-semibold text-emerald-400/95 font-mono leading-[1.45]">{forCTO}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dashed space-y-2">
        <div className="text-[12px] text-foreground/85 leading-[1.75]">
          <span className="text-muted-foreground">机制：</span>{oneLine}
        </div>
        <div className="text-[11.5px] text-muted-foreground leading-[1.8]">
          <span className="text-foreground/70">为什么牛：</span>{why}
        </div>
        <div className="flex items-start gap-1.5 text-[11px] text-emerald-500/95">
          <Zap className="h-3 w-3 mt-0.5 shrink-0" /> {metric}
        </div>
      </div>
    </div>
  );
}

function FlowCol({
  tone, tag, title, items, note,
}: {
  tone: "primary" | "emerald" | "violet"; tag: string; title: string; items: string[]; note: string;
}) {
  const map = {
    primary: { bar: "border-l-primary", text: "text-primary", dot: "bg-primary" },
    emerald: { bar: "border-l-emerald-500", text: "text-emerald-500", dot: "bg-emerald-500" },
    violet: { bar: "border-l-violet-500", text: "text-violet-500", dot: "bg-violet-500" },
  }[tone];
  return (
    <div className={`rounded-lg border border-l-4 ${map.bar} bg-muted/15 p-4`}>
      <div className={`font-mono text-[10px] uppercase tracking-[0.2em] ${map.text}`}>{tag}</div>
      <div className="mt-1 text-[13.5px] font-semibold text-foreground">{title}</div>
      <ul className="mt-3 space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-[11.5px] text-foreground/80 leading-[1.65]">
            <span className={`mt-1.5 h-1 w-1 rounded-full ${map.dot} shrink-0`} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-3 pt-2.5 border-t border-dashed text-[11px] ${map.text}`}>{note}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/15 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-foreground leading-[1.55]">{value}</div>
    </div>
  );
}

function RoleView({
  role, tagline, items,
}: {
  role: string; tagline: string; items: [string, string][];
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[13px] font-mono uppercase tracking-[0.2em] text-primary">{role}</div>
        <div className="text-[12px] text-muted-foreground">{tagline}</div>
      </div>
      <ul className="space-y-2.5">
        {items.map(([t, s]) => (
          <li key={t} className="grid grid-cols-[140px_1fr] gap-3">
            <div className="text-[12.5px] font-semibold text-foreground">{t}</div>
            <div className="text-[12px] text-muted-foreground leading-[1.75]">{s}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
