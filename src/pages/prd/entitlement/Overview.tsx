import { Link } from "react-router-dom";
import { Mermaid, DesignCard, PrdPageHeader, H } from "@/components/prd/Mermaid";
import { TABS } from "./Layout";
import {
  Layers, AlertTriangle, Sparkles, Target, ArrowRight, Workflow, Boxes,
} from "lucide-react";

export default function Overview() {
  const subDocs = TABS.slice(1);
  return (
    <div className="space-y-6">
      <PrdPageHeader
        eyebrow="PRD · ENTITLEMENT · v1"
        title="权益管理系统 · 一套模型贯通 8 层链路"
        subtitle="平台过去把「能力规则」「商品定价」「订单履约」「账户消耗」当作 4 个孤岛在维护：能力一改，规则也要改、SKU 也要改、对账也要查；账户消耗看不到来源订单，客成只能凭直觉。本 PRD 把这些撕裂的链路收拢成一条主干 — 应用 → 能力 → 规则 → 权益产品 → 商品 → 套餐 → 订单 → 账户，所有变更通过领域事件外发，可追溯、可演进。"
        meta={<span>SDS-2026.05 · v1 · Released</span>}
      />

      {/* 0. 一句话定调 */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DesignCard code="WHY" title="为什么现在要做" tone="primary">
          5 个应用、30+ 能力、70+ 规则、14 个 SKU 已铺开。再不收口，<b className="text-foreground">每加一个新能力，要改 4 张表 + 5 段代码 + 1 张对账模板</b>，研发吞吐 50% 都用在维护性工作上。
        </DesignCard>
        <DesignCard code="HOW" title="本次怎么解" tone="accent">
          以 <b className="text-foreground">「配置侧 / 履约侧」分层 + 三维订单状态机 + 共享账户额度</b> 为底层范式；规则与策略派生强约束、账户消耗以 <code className="text-primary font-mono text-[11.5px]">order_id</code> 全程溯源；外发领域事件作为 BI / 画像 / 风控的唯一上游。
        </DesignCard>
        <DesignCard code="GAIN" title="切换后预期收益" tone="success">
          新能力上线 ≤ 1 天（原 ≥ 2 周）· 单条消耗扣减 P99 ≤ 30 ms · 财务对账 0 误差 / 日 · 80% 客户健康分 ≥ 70 · 续费率 ≥ 75%。
        </DesignCard>
      </section>

      {/* 1. 概念校准 · 8 层链路是什么 */}
      <section>
        <H icon={Layers}>第 1 章 · 概念校准 · 8 层链路是什么</H>
        <p className="text-[12.5px] text-muted-foreground mb-3">
          先把术语钉死。一笔权益从「定义」到「消耗」走 8 层，每一层职责单一、向下不可越级。
        </p>
        <Mermaid
          caption="8 层链路 · 配置侧（蓝）→ 履约侧（绿）→ 数据侧（紫）"
          chart={`graph LR
  subgraph CFG["配置侧（一次定义、多次使用）"]
    APP["应用 App<br/>权益隔离边界"]
    CAP["能力 Capability<br/>技术绑定 + 数据类型"]
    RUL["规则 Rule<br/>额度 + 周期 + 策略"]
    PRD["权益产品 Product<br/>面向交易的封装"]
    SKU["商品 SKU<br/>可独立售卖"]
    BUN["套餐 Bundle<br/>跨应用组合"]
  end
  subgraph FUL["履约侧（一笔订单、一份账目）"]
    ORD["订单 Order<br/>三维状态机"]
    ACC["账户 Account<br/>跨应用聚合"]
  end
  subgraph DATA["数据侧（事件驱动）"]
    EVT["事件总线 Kafka"]
    BI["BI · 画像 · 风控"]
  end
  APP --> CAP --> RUL
  RUL -.N:M.-> PRD
  PRD -.N:M.-> SKU
  SKU --> BUN
  SKU --> ORD
  BUN --> ORD
  PRD --> ORD
  ORD --> ACC
  ORD --> EVT
  ACC --> EVT
  EVT --> BI
  classDef cfg  fill:#eef2ff,stroke:#3b5bdb,color:#1e3a8a
  classDef ful  fill:#ecfdf5,stroke:#10b981,color:#065f46
  classDef data fill:#faf5ff,stroke:#a855f7,color:#581c87
  class APP,CAP,RUL,PRD,SKU,BUN cfg
  class ORD,ACC ful
  class EVT,BI data`}
        />
      </section>

      {/* 2. 现状痛点 */}
      <section>
        <H icon={AlertTriangle}>第 2 章 · 现状的 5 个结构性痛点</H>
        <p className="text-[12.5px] text-muted-foreground mb-3">
          这些不是哪个业务做错了，而是<b className="text-foreground">"按 SKU 维度直挂规则"的旧模型本身的扩展上限</b>。
        </p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {[
            { n: 1, t: "能力规则散落在多端", s: "国内/国际/AI/导购/客资 5 端各写各的额度判断，同一能力跑不通跨端复用" },
            { n: 2, t: "商品换装代价巨大",   s: "想做"旗舰会员"组合包，要新建 1 套规则 + 1 个 SKU + 1 张对账表" },
            { n: 3, t: "三套发放路径无统一对账", s: "付费、积分、企业入驻三条路独立结账，月底人工拉表对账" },
            { n: 4, t: "账户消耗无溯源",   s: "客户一个月用掉 500 次 AI 设计，但说不出哪 200 次来自旗舰、哪 300 次来自老客赠送" },
            { n: 5, t: "BI 与风控吃二手数据", s: "数据组从 DB 直读 + 自己拼接，与业务真实意图存在偏差" },
          ].map(x => (
            <div key={x.n} className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-3 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-[12.5px] font-semibold text-foreground">痛点 {x.n} · {x.t}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{x.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 目标蓝图 */}
      <section>
        <H icon={Target}>第 3 章 · 目标蓝图 · 三件事讲清楚 v1</H>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <DesignCard code="A · 配置可拼装" title="能力 → 规则 → 产品 → 商品 全 N:M" tone="primary">
            规则可被多产品引用，产品可被多商品引用。「旗舰会员·月卡」与「年卡」共享同一份"AI 500 次/日"规则。新能力上线只需登记 + 派生 1 条规则，下游商品自动可见。
          </DesignCard>
          <DesignCard code="B · 履约三维解耦" title="审核 / 支付 / 生命周期 三条独立轴" tone="accent">
            付费、积分、内部、企业入驻 4 种交易模式，全部映射到同一组三维状态机。<code className="text-primary font-mono text-[11.5px]">follow_enterprise</code> 让企业入驻自动联动权益放行。
          </DesignCard>
          <DesignCard code="C · 账户全程溯源" title="account_capability 持有 sourceOrderIds[]" tone="success">
            每条额度记录回指来源订单数组。客成可一键反查："客户上月 500 次 AI 设计，300 次来自 ord_xxx 旗舰，200 次来自 ord_yyy 赠送"。
          </DesignCard>
        </div>
      </section>

      {/* 4. AI 外呼比喻 → 这里换成"双视角"比喻 */}
      <section>
        <H icon={Workflow}>第 4 章 · 用一个比喻讲明白 · 配置侧像菜单、履约侧像后厨</H>
        <div className="rounded-xl border bg-card p-5" style={{ boxShadow: "var(--shadow-xs)" }}>
          <p className="text-[12.5px] leading-relaxed text-foreground/90">
            把权益系统想成<b className="text-primary">餐厅</b>：
          </p>
          <ul className="mt-2 space-y-1.5 text-[12.5px] text-foreground/85 list-disc pl-5">
            <li><b>应用</b> = 不同的餐厅门店（国内 3D / 国际 3D / AI 设计家）</li>
            <li><b>能力</b> = 后厨的灶台（AI 设计、4K 渲染、云存储），数据类型 = 灶台计量方式（按份 / 按克 / 按时长）</li>
            <li><b>规则</b> = 配方卡（"AI 设计 · 500 份/日"）</li>
            <li><b>权益产品</b> = 菜单上的菜（一道菜 = 多张配方卡组合）</li>
            <li><b>商品 / 套餐</b> = 套餐组合（双人套餐 = N 道菜 + N 个配菜）</li>
            <li><b>订单</b> = 一桌客人下的单（三维状态：审核到岗 / 付款 / 厨房进度）</li>
            <li><b>账户</b> = 每桌客人剩余可点的菜数（同一客人在所有店共享一张积分卡）</li>
          </ul>
          <p className="mt-3 text-[12.5px] leading-relaxed text-foreground/90">
            <b>关键约束</b>：菜单由总厨统一编（配置侧），后厨只按订单做菜（履约侧）。<br />
            后厨永远不能跳过订单直接给客人加菜（不允许跨域直写账户）。
          </p>
        </div>
      </section>

      {/* 5. 子文档 */}
      <section>
        <H icon={Boxes}>第 5 章 · 子文档导航</H>
        <p className="text-[12.5px] text-muted-foreground mb-3">本 PRD 共 6 册分卷，按职能切分。点击进入查看具体设计。</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {subDocs.map(t => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="group flex items-center justify-between rounded-xl border bg-card p-4 transition hover:border-primary/60 hover:shadow"
                style={{ boxShadow: "var(--shadow-xs)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-medium text-foreground">{t.label}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">点击进入 →</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. 数据规模 */}
      <section>
        <H icon={Sparkles}>第 6 章 · 已铺开的规模（截至 2026-05）</H>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
          {[
            { l: "应用", v: 5 }, { l: "能力", v: 30 }, { l: "规则", v: 70 }, { l: "权益产品", v: 30 },
            { l: "商品", v: 14 }, { l: "套餐", v: 8 }, { l: "订单", v: 11 }, { l: "账户", v: 5 },
          ].map(k => (
            <div key={k.l} className="rounded-lg border bg-card p-3 text-center">
              <div className="text-[10.5px] text-muted-foreground">{k.l}</div>
              <div className="text-[20px] font-bold text-primary mt-0.5">{k.v}<span className="text-[11px] text-muted-foreground ml-0.5">+</span></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
