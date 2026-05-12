import { useEffect, useState } from "react";
import {
  FileText, Network, Activity, GitBranch, Database,
  Rocket, Workflow, Layers,
} from "lucide-react";
import { H2, H3, H4, Card, KV, Pre, Table, Tag, Code, SeqLine } from "./parts";
import { Mermaid } from "@/components/prd/Mermaid";

/* ──────────────────────────────────────────────────────────────
   权益管理 PRD · 单页平铺版
   严格基于现有代码与设计反推：
   - src/data/entitlement.ts（4 层 + Product + Order + Account）
   - src/pages/entitlement/*（页面行为）
   - mem://features/entitlement-* / order-* （决策记录）
   关注「看不见的逻辑」：状态三维解耦、账户反向追溯、池归属语义、
   编辑期不可变字段、订单驱动履约、跨企业额度合并
   ────────────────────────────────────────────────────────────── */

const TOC: { id: string; label: string; icon: React.ElementType; children: { id: string; label: string }[] }[] = [
  { id: "overview", label: "01 · 设计总论", icon: FileText, children: [
    { id: "ov-why",     label: "为什么权益要独立成模" },
    { id: "ov-axiom",   label: "7 条不可违反的公理" },
    { id: "ov-glossary",label: "术语校准" },
    { id: "ov-scope",   label: "模块边界与上下游" },
  ]},
  { id: "blueprint", label: "02 · 系统蓝图", icon: Network, children: [
    { id: "bp-4layer",  label: "4 层配置 + 交易 + 履约" },
    { id: "bp-apps",    label: "5 应用 × 30 能力地图" },
    { id: "bp-pages",   label: "页面地图与权限视角" },
    { id: "bp-rule",    label: "架构层级约束" },
  ]},
  { id: "config", label: "03 · 配置链路", icon: Layers, children: [
    { id: "cf-app",     label: "App · 应用" },
    { id: "cf-cap",     label: "Capability · 能力（含 dataType / consumePerUse）" },
    { id: "cf-rule",    label: "Rule · 规则（quota × period × scope）" },
    { id: "cf-product", label: "Product · 权益产品（exchangeType）" },
    { id: "cf-sku",     label: "SKU · 商品" },
    { id: "cf-bundle",  label: "Bundle · 套餐" },
    { id: "cf-derive",  label: "可派生字段：grantType / expirePolicy / quotaScope" },
  ]},
  { id: "trade", label: "04 · 交易与履约", icon: Activity, children: [
    { id: "td-3d",      label: "订单状态三维解耦（审核 · 支付 · 生命周期）" },
    { id: "td-5stage",  label: "5 阶段生命周期：创建 → 审核 → 支付 → 生效 → 结束" },
    { id: "td-types",   label: "4 类订单的差异（含 enterprise_grant 联动）" },
    { id: "td-items",   label: "OrderItem · 三类条目（product/sku/bundle）" },
    { id: "td-pay",     label: "支付与积分（totalAmount × creditAmount 互斥）" },
    { id: "td-matrix",  label: "状态 × 操作可见性矩阵" },
  ]},
  { id: "account", label: "05 · 账户与消耗", icon: GitBranch, children: [
    { id: "ac-agg",     label: "Account 按客户维度聚合" },
    { id: "ac-trace",   label: "sourceOrderIds · 反向追溯" },
    { id: "ac-scope",   label: "QuotaScope · 企业池 vs 个人池" },
    { id: "ac-health",  label: "健康度 · 80% 预警 / 休眠预警" },
    { id: "ac-allocation", label: "AllocationRecord · 分配记录展开行" },
  ]},
  { id: "data", label: "06 · 数据模型与归属", icon: Database, children: [
    { id: "dm-er",      label: "ER 全景" },
    { id: "dm-fields",  label: "字段三态：可变 / 弱可变 / 不可变" },
    { id: "dm-edit",    label: "编辑期：什么能改 / 什么必须开新单" },
    { id: "dm-rls",     label: "企业 × 应用 × 客户 三维 RLS" },
  ]},
  { id: "e2e", label: "07 · 端到端业务流", icon: Workflow, children: [
    { id: "e2e-purchase",   label: "用户购买：下单 → 账户开户" },
    { id: "e2e-enterprise", label: "企业入驻：跟随企业生效" },
    { id: "e2e-internal",   label: "内部发放：人工审核 → 履约" },
    { id: "e2e-consume",    label: "运行时消耗：扣减 → 回写余额" },
    { id: "e2e-refund",     label: "退款 / 暂停 / 恢复 / 关闭的差异" },
  ]},
  { id: "atlas", label: "08 · 数据生命周期图谱", icon: Rocket, children: [
    { id: "atlas-dag",    label: "总依赖 DAG" },
    { id: "atlas-state",  label: "每个实体的状态机" },
    { id: "atlas-emerge", label: "数据涌现时序：从下单到余额可用" },
    { id: "atlas-event",  label: "事件传播：消耗 fan-out" },
  ]},
];

export default function EntitlementPRDLayout() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const ids = TOC.flatMap(t => [t.id, ...t.children.map(c => c.id)]);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex gap-8">
      <aside className="w-[200px] shrink-0 hidden lg:block">
        <div className="sticky top-2">
          <div className="px-1">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-3 pl-2">Entitlement PRD</div>
            <nav className="max-h-[calc(100vh-80px)] overflow-y-auto pr-1">
              {TOC.map(sec => {
                const secActive = active === sec.id || sec.children.some(c => c.id === active);
                return (
                  <div key={sec.id} className="mb-1.5">
                    <button
                      onClick={() => goto(sec.id)}
                      className={`w-full text-left pl-2 pr-1 py-1 text-[11.5px] flex items-center transition border-l-2 ${
                        secActive ? "text-primary font-medium border-primary" : "text-foreground/70 hover:text-foreground border-transparent"
                      }`}
                    >
                      <span className="truncate">{sec.label}</span>
                    </button>
                    {secActive && (
                      <div className="ml-2 border-l border-border/60">
                        {sec.children.map(c => (
                          <button key={c.id} onClick={() => goto(c.id)}
                            className={`w-full text-left pl-2.5 pr-1 py-[3px] text-[10.5px] truncate transition ${
                              active === c.id ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
                            }`}>{c.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 space-y-20 max-w-[1080px]">
        <Overview />
        <Blueprint />
        <ConfigChain />
        <Trade />
        <AccountChapter />
        <DataModel />
        <E2EFlow />
        <Atlas />
        <div className="text-center text-[12px] text-muted-foreground py-8 border-t">
          — 权益管理 PRD · v2.0 · 设计反推版 · 变更走 PR 评审 —
        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────── 01 · 设计总论 ─────────────────────────── */
function Overview() {
  return (
    <section id="overview" className="scroll-mt-4 space-y-5">
      <H2 icon={FileText} num="01">设计总论 · 顶层架构</H2>

      <div id="ov-why">
        <H3>为什么权益要独立成模</H3>
        <Card>
          <p className="text-[13px] leading-7 text-foreground/85">
            「权益」是把<b>抽象的产品价值（什么功能能用 / 用多少 / 用多久）</b>从「企业」「人员」「订单」「商品」中剥离出来的一层结算货币。
            它解决一个非显而易见的问题：<b>同一个能力（例如「8K 渲染 1 次」）会同时被「会员套餐内含」「积分兑换」「企业入驻赠送」「客诉补偿」四种方式发放</b>，
            如果没有一层中间表达，每加一个发放渠道都要在订单 / 账户 / 应用三处同时改代码。
          </p>
          <p className="text-[13px] leading-7 text-foreground/85 mt-2.5">
            本模块通过 <b>4 层配置（App → Capability → Rule → Product / SKU / Bundle）+ 1 层交易（Order）+ 1 层履约（Account）</b>
            把「定义价值」、「售卖价值」、「兑现价值」三件事彻底解耦。任何下游业务（应用运行时、BI、营销结算、企业管理、客户健康度）
            都只消费 <Code>account.capabilities[*]</Code> 这一份语义稳定的余额表。
          </p>
        </Card>
      </div>

      <div id="ov-axiom">
        <H3>7 条不可违反的公理</H3>
        <div className="space-y-2">
          {[
            { k: "公理 1 · 4 层配置严格分层", v: "App → Capability → Rule → Product → SKU → Bundle。下层只能引用上层，上层不感知下层。Capability 不知道自己被哪个 SKU 售卖；Rule 不知道自己绑定了几个 Product。" },
            { k: "公理 2 · 订单是权益分发的唯一入口", v: "所有「客户拥有什么权益」必须能追溯到一张 Order。免费发放、系统赠送、企业入驻同样落 Order（金额为 0 / 走 creditAmount）。无单进账 = 黑账。" },
            { k: "公理 3 · 状态三维解耦", v: "auditStatus × paymentStatus × orderStatus 三套独立状态机，互不阻塞。审核驳回不影响支付记录；退款不改订单本体。" },
            { k: "公理 4 · 账户按客户聚合", v: "EntitlementAccount 以 (customerId × appId) 为主键聚合。多张订单的同一条 Rule 在账户里合并为一行 capability，通过 sourceOrderIds[] 反向追溯每一笔来源。" },
            { k: "公理 5 · 编辑即创建（部分例外）", v: "Rule / Product / SKU 的额度配置一旦被订单引用即冻结，要改额度只能开新版本 + 老版本停售。但 status / description 等元数据可热改。" },
            { k: "公理 6 · 池归属是数据语义不是 UI 选项", v: "QuotaScope（enterprise / user）决定额度记到企业账还是个人画像。BOOLEAN/STORAGE 默认企业池，COUNTER/DURATION 默认个人池；可显式覆盖。" },
            { k: "公理 7 · 派生优先于显式", v: "grantType / expirePolicy 由 periodType 自动派生；exchangeType=credit 时 totalAmount 必须为 0 且 creditAmount > 0；不再保留可手填的冗余字段（即使数据库列还在，UI 不暴露）。" },
          ].map((it, i) => (
            <div key={i} className="rounded-lg border bg-card pl-4 pr-4 py-3">
              <div className="text-[12px] font-mono text-primary mb-0.5">{it.k}</div>
              <div className="text-[12.5px] leading-[1.75] text-foreground/80">{it.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="ov-glossary">
        <H3>术语校准（容易混淆的 6 组）</H3>
        <Table
          headers={["术语 A", "术语 B", "区分点", "代码字段"]}
          cols={["120px","120px",undefined,"180px"]}
          rows={[
            ["Capability 能力","Rule 规则","能力 = 技术接入点 (apiPath + dataType + consumePerUse)；规则 = 商业打包 (quota + period)。一条能力可派生 N 条规则。","Capability.id / Rule.capabilityId"],
            ["Product 权益产品","SKU 商品","产品 = 权益的最小打包（多条 Rule 组成）；SKU = 售卖单元（绑定 Product + 价格 + 计费周期）。","Product.ruleIds[] / Sku.productIds[]"],
            ["SKU","Bundle 套餐","SKU = 单一打包售卖；Bundle = 多 SKU 组合促销，可带原价划线。","Sku / Bundle.items[]"],
            ["exchangeType","OrderType","前者是权益产品定性（paid/credit/free）；后者是订单触发渠道（user_purchase/internal_grant/system_grant/enterprise_grant）。","Product.exchangeType / Order.orderType"],
            ["totalAmount","creditAmount","现金金额与积分金额互斥。积分订单 totalAmount = 0，避免「¥0 是免费还是积分兑换」歧义。","Order.totalAmount / Order.creditAmount"],
            ["企业池","个人池","额度归属于谁。企业池不计入个人画像；个人池写个人账。","EntitlementRule.quotaScope"],
          ]}
        />
      </div>

      <div id="ov-scope">
        <H3>模块边界与上下游</H3>
        <Card>
          <Pre>{`         ┌── 客户管理（B端企业 / C端用户）
上游 ◀──┼── 企业管理（提供 enterprise_id、expireDate）
         └── 营销中心（积分余额 / 活动配置）
                       │
                       ▼
        ┌────────────────────────────────┐
        │     权益管理 · 本模块          │
        │  4层配置 + 订单 + 账户 + 看板   │
        └────────────────────────────────┘
                       │
         ┌── 应用运行时（凭 capability.apiPath 扣减 account 余额）
下游 ◀──┼── BI 数仓（营收 / 续费 / 健康度）
         └── 财务对账（订单流水 → 收入确认）`}</Pre>
          <KV items={[
            { k: "本模块负责", v: "权益定义、订单受理、配额履约、账户聚合、健康度计算" },
            { k: "本模块不负责", v: "应用内具体功能实现、积分发放规则、企业层级、客户画像（提供消耗源数据）" },
            { k: "提供给运行时的接口", v: "/account/{custId}/check（鉴权）、/account/{custId}/consume（扣减）、/account/{custId}/balance（查询）" },
          ]} />
        </Card>
      </div>
    </section>
  );
}

/* ─────────────────────────── 02 · 系统蓝图 ─────────────────────────── */
function Blueprint() {
  return (
    <section id="blueprint" className="scroll-mt-4 space-y-5">
      <H2 icon={Network} num="02">系统蓝图</H2>

      <div id="bp-4layer">
        <H3>4 层配置 + 交易 + 履约 总览</H3>
        <Mermaid
          caption="权益管理 · 4 层配置 + 交易 + 履约"
          chart={`flowchart TB
  subgraph CFG["① 配置层 · 系统级（5 实体）"]
    direction LR
    APP["App 应用<br/>5 个：CN_3D / INTL_3D / GUIDE / AI / LEADS"]:::cfg
    CAP["Capability 能力<br/>dataType + consumePerUse + apiPath"]:::cfg
    RULE["EntitlementRule<br/>quota × periodType × quotaScope"]:::cfg
    PROD["Product 权益产品<br/>exchangeType: paid/credit/free"]:::cfg
    SKU["SKU 商品<br/>price × billingCycle"]:::cfg
    BUN["Bundle 套餐<br/>多 SKU 组合 + 原价划线"]:::cfg
  end

  subgraph TRD["② 交易层 · 客户级"]
    direction LR
    ORD["Order 订单<br/>OrderType × 三维状态"]:::trd
    ITEM["OrderItem<br/>type: product/sku/bundle"]:::trd
  end

  subgraph FUL["③ 履约层 · 余额"]
    direction LR
    ACCT["Account 权益账户<br/>customerId × appId 聚合"]:::ful
    ACAP["AccountCapability<br/>totalQuota / usedQuota / sourceOrderIds[]"]:::ful
    ALLOC["AllocationRecord<br/>分配明细（展开行）"]:::ful
  end

  APP --> CAP --> RULE
  RULE --> PROD --> SKU
  SKU --> BUN
  RULE -. 兼容直连 .-> SKU

  SKU --> ITEM
  BUN --> ITEM
  PROD --> ITEM
  ITEM --> ORD
  ORD -->|active 时履约| ACCT
  ORD --> ALLOC
  ACCT --> ACAP
  ACAP -.->|追溯| ORD

  classDef cfg fill:#eef2ff,stroke:#6366f1,color:#312e81;
  classDef trd fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef ful fill:#dcfce7,stroke:#16a34a,color:#14532d;
`}
        />
        <KV items={[
          { k: "为什么 Product 而非直接 Rule→SKU", v: "Product 承载 exchangeType（付费/积分/免费），让「同一组 Rule 通过不同方式发放」零成本：新人礼包 ≠ 售卖包，但底层 Rule 可以相同。" },
          { k: "Rule 与 SKU 兼容旧字段", v: "Sku.ruleIds[] 为早期数据保留，新建一律走 Sku.productIds[]。OrderItem 也保留 sku/bundle/product 三种条目类型。" },
          { k: "为什么订单不绑定单一应用", v: "OrderItem 来自不同 SKU / Bundle 可能跨应用（如「全球设计组合」含 国内 + 国际 + AI 设计家三应用），订单的 appIds 是 items 推导出来的。" },
        ]} />
      </div>

      <div id="bp-apps">
        <H3>5 应用 × 30 能力地图</H3>
        <Table
          headers={["应用","Code","能力数","典型 Capability","主流 dataType"]}
          cols={["140px","140px","60px",undefined,"110px"]}
          rows={[
            ["国内 3D 工具", "CN_3D_TOOL",     "21", "AI 设计 / 4K · 8K 渲染 / 全景导出 / 各类素材库 / 云存储", "COUNTER + BOOLEAN + STORAGE"],
            ["国际 3D 工具", "INTL_3D_TOOL",   "4",  "AI · 国际 / 4K · 国际 / 全景 · 国际 / 海外素材库", "COUNTER + BOOLEAN"],
            ["智能导购",     "SMART_GUIDE",    "2",  "导购推荐 / 客户画像", "COUNTER + BOOLEAN"],
            ["AI 设计家",    "AI_DESIGNER",    "2",  "AI 方案生成 / AI 风格迁移", "COUNTER"],
            ["精准客资",     "PRECISE_LEADS",  "1",  "线索获取（条）", "COUNTER"],
          ]}
        />
        <p className="text-[12px] text-muted-foreground leading-[1.85] mt-2">
          dataType 的取值直接决定<b>默认池归属</b>：<Code>BOOLEAN</Code>（开关，如全屋模型库访问）、<Code>STORAGE</Code>（容量，如云存储 MB）默认走<Tag tone="info">企业池</Tag>；
          <Code>COUNTER</Code>（次数）、<Code>DURATION</Code>（时长）默认走<Tag tone="success">个人池</Tag>。可在 Rule 上显式覆盖。
        </p>
      </div>

      <div id="bp-pages">
        <H3>页面地图与权限视角</H3>
        <Table
          headers={["页面","路径","用途","平台视角","企业视角"]}
          cols={["140px","210px",undefined,"100px","100px"]}
          rows={[
            ["权益看板","/entitlement/dashboard","KPI · 营收双轴 · 健康度 · 风险预警", <Tag tone="success">全量</Tag>, <Tag tone="info">仅本企业</Tag>],
            ["应用 / 能力 / 规则","/entitlement/{app,capability,rule}","配置层维护", <Tag tone="success">读写</Tag>, <Tag tone="muted">不可见</Tag>],
            ["权益产品","/entitlement/product","Product 维护（exchangeType）", <Tag tone="success">读写</Tag>, <Tag tone="muted">不可见</Tag>],
            ["商品 / 套餐","/entitlement/{sku,package}","SKU + Bundle 售卖配置", <Tag tone="success">读写</Tag>, <Tag tone="muted">不可见</Tag>],
            ["订单","/entitlement/order","订单受理与流转", <Tag tone="success">全量</Tag>, <Tag tone="info">本企业关联</Tag>],
            ["权益账户","/entitlement/account","客户维度余额", <Tag tone="success">全量</Tag>, <Tag tone="info">仅本企业账户</Tag>],
          ]}
        />
      </div>

      <div id="bp-rule">
        <H3>架构层级约束（不可违反）</H3>
        <Pre>{`R1  配置层（App→Capability→Rule→Product→SKU→Bundle）只能向下引用，不可反向耦合。
R2  Rule 与 Product 多对多（Product.ruleIds[]）；Product 与 SKU 多对多（Sku.productIds[]）。
R3  Bundle 不直接绑 Rule / Product，必须通过 SKU 组合。
R4  Order 的 items 三种类型互斥独立结算，但都能履约到同一 Account。
R5  Order 一旦履约（orderStatus=active），其引用的 Rule 配置即对该订单视为「快照锁定」—— 后续 Rule 改额度不溯及历史订单。
R6  Account 只能由系统通过订单履约创建，不存在手工新建账户的 UI 入口。
R7  Product.exchangeType=credit 必须 totalAmount=0 且 creditAmount>0；反之亦然，二者互斥。`}</Pre>
      </div>
    </section>
  );
}

/* ─────────────────────────── 03 · 配置链路 ─────────────────────────── */
function ConfigChain() {
  return (
    <section id="config" className="scroll-mt-4 space-y-5">
      <H2 icon={Layers} num="03">配置链路 · 6 实体逐一拆解</H2>

      <div id="cf-app">
        <H3>App · 应用（最顶层）</H3>
        <Card>
          <KV items={[
            { k: "字段", v: <span>id · name · <Code>code</Code> · description · status · timestamps</span> },
            { k: "状态", v: "active / inactive。inactive 会让其下所有 Capability 同步停售（订单仍可履约老约定）" },
            { k: "为什么没有 owner_enterprise_id", v: "应用是系统资产，跨企业共享，不绑定某一家。「哪家企业有权使用」由订单驱动。" },
          ]} />
        </Card>
      </div>

      <div id="cf-cap">
        <H3>Capability · 能力（技术接入点）</H3>
        <Card>
          <KV items={[
            { k: "核心字段", v: <span><Code>appId</Code> · <Code>dataType</Code> · <Code>unit</Code> · <Code>apiPath</Code> · <Code>consumePerUse</Code></span> },
            { k: "dataType 4 种", v: "COUNTER（次数）/ BOOLEAN（开关，0 或 1）/ STORAGE（容量，MB）/ DURATION（时长，秒）" },
            { k: "consumePerUse", v: "每次调用消耗多少。绝大多数为 1，但「8K 渲染消耗 = 4K 渲染 × 4」这种业务可设为大于 1 的整数。" },
            { k: "apiPath", v: "应用运行时按此 path 调本模块的 /account/{custId}/consume，鉴权命中此 capability 即扣减。" },
            { k: "为什么不直接卖 Capability", v: "能力是「技术能力」不是「商业打包」。同一个 AI 设计能力可包装出「100 次/日」「300 次/日」「2000 次永久」等多个规则。" },
          ]} />
        </Card>
      </div>

      <div id="cf-rule">
        <H3>Rule · 权益规则（quota × period × scope）</H3>
        <Card>
          <KV items={[
            { k: "必填", v: <span><Code>capabilityId</Code> · <Code>quota</Code> · <Code>periodType</Code> · <Code>quotaScope</Code></span> },
            { k: "periodType", v: "DAY / MONTH / YEAR / PERMANENT。PERMANENT 表示一次性发放，不刷新、不过期。" },
            { k: "quotaScope", v: <span><Tag tone="info">企业池</Tag>整个企业共享一份额度；<Tag tone="success">个人池</Tag>每员工独立一份。</span> },
            { k: "perUserCap", v: "仅 quotaScope=enterprise 时生效。企业池下单人单周期消耗上限（避免一人吃光配额），0 = 不限。" },
            { k: "派生策略", v: <span>grantType / expirePolicy 由 periodType 自动派生（参见 <a className="text-primary underline" href="#cf-derive">3.7</a>），UI 不再暴露。</span> },
          ]} />
          <Pre>{`示例 · "AI 设计 500 次/日"（rule3）
  capabilityId: cap1（AI 设计 · COUNTER）
  quota: 500
  periodType: DAY → derived: DAILY_REFRESH / CLEAR_ON_EXPIRE
  quotaScope: user      ← 每位员工独立 500 次
  perUserCap: 0         ← 个人池下不生效

示例 · "云存储 4GB"（rule26）
  capabilityId: cap21（云存储 · STORAGE）
  quota: 4096 (MB)
  periodType: PERMANENT → derived: ONE_TIME / NEVER_EXPIRE
  quotaScope: enterprise  ← 企业共享 4GB
  perUserCap: 500         ← 单人最多占 500MB`}</Pre>
        </Card>
      </div>

      <div id="cf-product">
        <H3>Product · 权益产品（exchangeType 定性）</H3>
        <Card>
          <KV items={[
            { k: "本质", v: "把一组 Rule 打包成「可以被发放的最小单元」。是「售卖」与「赠送」的统一抽象。" },
            { k: "exchangeType", v: <span><Tag tone="info">paid</Tag>付费售卖（必须通过 SKU 流转，不可直接下单）<br/><Tag tone="warning">credit</Tag>积分兑换（creditPrice 必填，OrderItem 直接引用 Product）<br/><Tag tone="muted">free</Tag>免费发放（用于新人礼包、补偿包、试用、内部赠送）</span> },
            { k: "limitPerUser", v: "限领次数，0 = 不限。例如「新人大礼包」limitPerUser=1，签到包 limitPerUser=0。" },
            { k: "为什么内部发放不在此枚举", v: "「内部发放」是订单的触发渠道，不是产品的定性。同一个 free 产品既可由系统自动赠送、也可由管理员手动发放。" },
          ]} />
        </Card>
      </div>

      <div id="cf-sku">
        <H3>SKU · 商品（付费售卖载体）</H3>
        <Card>
          <KV items={[
            { k: "字段", v: <span><Code>productIds[]</Code> · <Code>price</Code> · <Code>billingCycle</Code>(once/monthly/yearly) · <Code>salesStatus</Code></span> },
            { k: "推荐绑定", v: "Sku.productIds[]（N:M）。一个 SKU 可包含多个 Product；一个 Product 可被多个 SKU 引用（如「AI 100 次」既出现在新人礼包，也出现在 9.9 元加油包）。" },
            { k: "salesStatus", v: "on_sale / off_sale。off_sale 后老订单仍可履约 / 续费，但新订单不可下。" },
            { k: "为什么 billingCycle 在 SKU 而非 Rule", v: "Rule 表达「额度规模」（500 次/日），SKU 表达「计费节奏」（按月 / 按年付）。月卡与年卡可绑同一个 Rule，价格不同。" },
          ]} />
        </Card>
      </div>

      <div id="cf-bundle">
        <H3>Bundle · 套餐（多 SKU 组合促销）</H3>
        <Card>
          <KV items={[
            { k: "字段", v: <span><Code>items: BundleItem[]</Code>{"{ skuId, quantity }"} · <Code>price</Code> · <Code>originalPrice</Code>(可选划线价)</span> },
            { k: "性质", v: "Bundle 只是「打折券」—— 履约时仍逐个 SKU 拆开走履约流水。Bundle 本身不进 Account。" },
            { k: "原价划线", v: "originalPrice 用于前台展示「划线价 → 优惠价」。设计上不强制等于 SKU 累加，允许营销侧灵活定价。" },
          ]} />
        </Card>
      </div>

      <div id="cf-derive">
        <H3>可派生字段（不再暴露给用户）</H3>
        <Table
          headers={["字段","派生源","派生规则"]}
          cols={["140px","160px",undefined]}
          rows={[
            [<Code>grantType</Code>, "Rule.periodType", "PERMANENT → ONE_TIME；DAY → DAILY_REFRESH；MONTH/YEAR → MONTHLY_GRANT"],
            [<Code>expirePolicy</Code>, "Rule.periodType", "PERMANENT → NEVER_EXPIRE；其余 → CLEAR_ON_EXPIRE"],
            [<Code>quotaScope</Code>, "Capability.dataType（可被显式覆盖）", "BOOLEAN / STORAGE → enterprise；COUNTER / DURATION → user"],
            [<Code>isCumulative</Code>, "—", "平台统一不累积。剩余到期回收，新周期发放当周期额度。"],
            ["订单涉及的 appIds", "Order.items[]", "从 items 中的 sku / bundle / product 反查 app 并去重"],
          ]}
        />
        <p className="text-[12px] text-muted-foreground leading-[1.85] mt-2">
          这些字段在数据库里仍保留为列（兼容老数据），但 UI 一律隐藏，提交时由后端依据派生规则强制覆写。避免运营手填造成不一致。
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────── 04 · 交易与履约 ─────────────────────────── */
function Trade() {
  return (
    <section id="trade" className="scroll-mt-4 space-y-5">
      <H2 icon={Activity} num="04">交易 · Order 三维状态机</H2>

      <div id="td-3d">
        <H3>状态三维解耦</H3>
        <Card>
          <p className="text-[12.5px] leading-[1.85] text-foreground/85">
            权益订单不存在「草稿态」，所有新订单初始 orderStatus = <Code>pending_effect</Code>。
            真正决定订单走向的是<b>三个互相独立的状态机</b>，任何组合都被允许（例如 <Code>已驳回 × 已支付 × 已暂停</Code>，
            对应「先付款后审核驳回，等待退款挂起」的真实场景）。
          </p>
          <Pre>{`auditStatus（审核维度）         paymentStatus（支付维度）          orderStatus（生命周期维度）
─────────────────────       ─────────────────────       ─────────────────────
auto_approved 自动通过        no_payment   无需支付         pending_effect 待生效
pending_audit 待审核           pending      待支付            active         生效中
approved      审核通过        paid         已支付            expired        已到期
rejected      审核驳回        refunded     已退款            suspended      已暂停
follow_enterprise 跟随企业                                  cancelled      已取消
                                                            closed         已关闭`}</Pre>
          <KV items={[
            { k: "为什么解耦", v: "现实业务里「人工审核」和「财务支付」是不同岗位 / 不同节奏。强行耦合会导致：审核员卡在等付款、财务卡在等审核。" },
            { k: "为什么不存在草稿", v: "草稿 = 拒绝承担状态。一旦运营点击「新建订单」，就已经是「待生效」—— 哪怕信息没填全，系统也清楚这是「卡在审核或支付」中。" },
            { k: "互斥校验", v: "totalAmount × creditAmount 互斥；exchangeType=credit 的 OrderItem 不可与 paid 类 SKU 同单。" },
          ]} />
        </Card>
      </div>

      <div id="td-5stage">
        <H3>5 阶段生命周期</H3>
        <Mermaid
          caption="订单详情页顶部生命周期 · 创建 → 审核 → 支付 → 生效 → 结束"
          chart={`flowchart LR
  C["① Created<br/>创建（pending_effect）"] --> A["② Audit<br/>审核（按订单类型分支）"]
  A -->|approved / auto_approved / follow_enterprise=passed| P["③ Payment<br/>支付（按 paymentStatus）"]
  A -->|rejected| ER["End · 已驳回"]:::end
  P -->|paid / no_payment| AC["④ Active<br/>生效（履约入账户）"]
  P -.->|长时间未支付| CN["End · 已取消"]:::end
  AC --> E["⑤ End<br/>结束（expired / cancelled / closed）"]:::end
  AC -.->|暂停权益| SU["Active · 已暂停"]
  SU -.->|恢复权益| AC

  classDef end fill:#f1f5f9,stroke:#94a3b8,color:#475569;
`}
        />
        <KV items={[
          { k: "审核阶段标签动态化", v: "internal_grant 显示「人工审核」；user_purchase / system_grant 显示「自动审核」；enterprise_grant 显示「跟随企业」并禁用单独审核按钮。" },
          { k: "支付阶段可跳过", v: "免费产品 / 内部发放可设 paymentStatus=no_payment，直接进入生效阶段。" },
          { k: "暂停 / 恢复", v: "active 状态下的订单可被管理员暂停（suspended），暂停期间 Account 的相关 capability 标记冻结但不清零，恢复后立即可用。" },
        ]} />
      </div>

      <div id="td-types">
        <H3>4 类订单的差异（关键差异在审核与支付）</H3>
        <Table
          headers={["OrderType", "触发场景", "初始 auditStatus", "支付要求", "金额可改", "履约时机"]}
          cols={["140px",undefined,"140px","110px","80px",undefined]}
          rows={[
            ["user_purchase 用户购买", "C端用户在商城下单", <Tag tone="success">auto_approved</Tag>, "必须 paid", "❌", "paid 后立即"],
            ["internal_grant 内部发放", "运营 / 客服赠送、补偿、试用", <Tag tone="warning">pending_audit</Tag>, "可 no_payment / paid", "✅ 审核前", "审核通过 + 支付状态满足"],
            ["system_grant 系统发放", "新人礼包、签到、活动自动赠送", <Tag tone="success">auto_approved</Tag>, "no_payment", "❌", "事件触发即时"],
            ["enterprise_grant 企业入驻", "企业审核通过时自动开单", <Tag tone="info">follow_enterprise</Tag>, "no_payment / pending", "✅ 在企业详情页", "企业审核通过 → 联动 active"],
          ]}
        />
        <Card className="!p-4">
          <H4>enterprise_grant 与企业入驻的联动（最容易踩坑）</H4>
          <ul className="text-[12.5px] leading-[1.8] text-foreground/85 list-disc pl-5 space-y-1">
            <li>企业入驻审核通过的瞬间，由企业模块发布事件 <Code>enterprise.application.approved</Code>，本模块订阅后自动 <b>开一张 enterprise_grant 订单</b>。</li>
            <li>订单 <Code>auditStatus = follow_enterprise</Code>，UI 上不显示「审核 / 驳回」按钮——它的命运绑定企业本身。</li>
            <li>订单 <b>金额与支付编辑入口集成在「企业详情页 · 权益快照」中</b>，而非订单详情页。运营在企业页改数额，会同步回写到这张订单。</li>
            <li>企业被停用时（enterprise.business.changed=disabled），对应订单 <Code>orderStatus → suspended</Code>，Account 配额冻结；企业恢复时联动 active。</li>
          </ul>
        </Card>
      </div>

      <div id="td-items">
        <H3>OrderItem · 三类条目</H3>
        <Table
          headers={["type","引用","典型来源","applyMode","dateRange"]}
          cols={["80px","120px",undefined,"120px",undefined]}
          rows={[
            ["product", "productId", "积分兑换、免费发放、内部赠送", "可选", "可选"],
            ["sku",     "skuId",     "C 端用户购买", "—", "—"],
            ["bundle",  "bundleId",  "促销组合", "—", "—"],
          ]}
        />
        <KV items={[
          { k: "B 端订单专属字段", v: <span><Code>applyMode</Code> = 指定人员 / 全部人员；<Code>applyCount</Code> = 指定人员时的人数；<Code>dateRange</Code> = 授权时间区间</span> },
          { k: "dateRange 上限约束", v: <span>必须 ≤ 该企业 <Code>BEnterprise.expireDate</Code>。订单创建时校验，企业到期日变更时回查所有未完成订单。</span> },
          { k: "bundle 履约展开", v: "下单后系统按 BundleItem 拆成 N 条 sku 的履约记录写入 Account，OrderItem 本身不直接进账户。" },
        ]} />
      </div>

      <div id="td-pay">
        <H3>支付与积分（互斥校验）</H3>
        <Pre>{`if (Product.exchangeType === "credit") {
  assert(order.totalAmount === 0);
  assert(order.creditAmount > 0);
  order.paymentStatus = "no_payment";   // 积分订单不进财务支付流水
} else if (Product.exchangeType === "paid") {
  assert(order.totalAmount > 0);
  assert(order.creditAmount == null);
  order.paymentStatus ∈ {pending, paid, refunded};
} else if (Product.exchangeType === "free") {
  assert(order.totalAmount === 0 && order.creditAmount == null);
  order.paymentStatus = "no_payment";
}`}</Pre>
        <p className="text-[12px] text-muted-foreground leading-[1.8] mt-2">
          这套互斥规则在前端 OrderCreate 表单与后端 service 双重校验，避免「¥0 订单到底是免费还是积分兑换」的歧义在数仓里炸开。
        </p>
      </div>

      <div id="td-matrix">
        <H3>状态 × 操作可见性矩阵</H3>
        <Table
          headers={["操作","触发条件","隐藏条件"]}
          cols={["140px",undefined,undefined]}
          rows={[
            ["标记已支付", "paymentStatus=pending 且 orderType ∈ {internal_grant, enterprise_grant}", "user_purchase（必须真实支付）/ 已是 paid"],
            ["退款",       "paymentStatus=paid 且 orderStatus ∈ {active, suspended}", "orderType=enterprise_grant（走企业整体退出）"],
            ["暂停权益",   "orderStatus=active",                                  "已暂停 / 未生效"],
            ["恢复权益",   "orderStatus=suspended",                               "active / 已关闭"],
            ["关闭订单",   "orderStatus ∈ {pending_effect, suspended}",          "已 active / 已 closed"],
            ["审核通过/驳回", "auditStatus=pending_audit",                       "auto_approved / follow_enterprise / 已审核"],
          ]}
        />
      </div>
    </section>
  );
}

/* ─────────────────────────── 05 · 账户与消耗 ─────────────────────────── */
function AccountChapter() {
  return (
    <section id="account" className="scroll-mt-4 space-y-5">
      <H2 icon={GitBranch} num="05">账户 · 配额履约</H2>

      <div id="ac-agg">
        <H3>Account 按客户维度聚合</H3>
        <Card>
          <p className="text-[12.5px] leading-[1.85] text-foreground/85">
            EntitlementAccount 是「客户在某些应用下持有的所有权益」的<b>聚合视图</b>，
            主键为 <Code>(customerId × customerType)</Code>，<Code>appIds[]</Code> 列出涉及的应用。
            这张表的设计目标是：<b>不管订单来自哪里、走了哪种路径，最终在「我能用什么」这一面只表达为一行 capability</b>。
          </p>
          <Pre>{`Account
├── id, customerId, customerType (B/C), customerName
├── appIds[], appNames[]
├── allocations[]   ← 分配明细（按订单 × item 展开，UI 展开行）
├── capabilities[]  ← 聚合后的余额（按 capabilityId × ruleId 聚合）
│       └── totalQuota / usedQuota / unit / periodType / grantType
│           └── sourceOrderIds[] ← 反向追溯
└── orderIds[]      ← 涉及订单引用`}</Pre>
        </Card>
      </div>

      <div id="ac-trace">
        <H3>sourceOrderIds · 反向追溯</H3>
        <Card>
          <p className="text-[12.5px] leading-[1.85] text-foreground/85">
            同一个客户的同一条 Rule（如 AI 设计 500 次/日）<b>可能来自多张订单</b>（旗舰会员 + 运营补偿 + 加油包）。
            在 Account 里我们把它们合并成一行 capability，但保留 <Code>sourceOrderIds: [ord1, ord6, ord12]</Code>。
            点击账户详情的 capability 行可展开查看每张订单贡献的额度与剩余。
          </p>
          <Pre>{`// 实际数据示例（acc1 · 欧派）
{
  capabilityId: "cap1",     // AI 设计
  ruleId: "rule3",          // AI 设计 500 次/日
  totalQuota: 500,
  usedQuota: 128,
  unit: "次",
  periodType: "DAY",
  sourceOrderIds: ["ord1", "ord6"]   // 来自旗舰会员 + 加油包合并
}`}</Pre>
          <KV items={[
            { k: "聚合主键", v: "(capabilityId × ruleId)。不同 Rule 即使能力相同也分行（例如「AI 100 次/日」和「AI 500 次/日」并存）。" },
            { k: "为什么不按 Rule 完全合并", v: "运营需要看「这个客户的高额度是临时补偿还是永久套餐」—— 来源决定续费策略。" },
            { k: "余额到账实时性", v: "订单 orderStatus → active 触发履约 job，写入 Account 通常 < 1s。运行时扣减走 30s 弱一致缓存，月底走对账补偿。" },
          ]} />
        </Card>
      </div>

      <div id="ac-scope">
        <H3>QuotaScope · 企业池 vs 个人池</H3>
        <Table
          headers={["维度","企业池（enterprise）","个人池（user）"]}
          cols={["120px",undefined,undefined]}
          rows={[
            ["语义",       "整个企业共享一份额度，谁先用谁先扣",                "每位员工独立一份额度"],
            ["典型 dataType", "BOOLEAN（开关 · 全屋模型库）/ STORAGE（云存储）", "COUNTER（AI 次数）/ DURATION（在线时长）"],
            ["写入位置",   "company_quota_ledger（企业账）",                  "user_quota_ledger（个人账）"],
            ["计入个人画像","❌ 不计入（避免共享资源拉偏个人能效）",            "✅ 计入（AI 调用次数、设计产能）"],
            ["perUserCap","✅ 生效（防止一人吃光配额）",                       "—（个人池本身就是独立的）"],
            ["UI 标识",    <Tag tone="info">企业池</Tag>,                       <Tag tone="success">个人池</Tag>],
          ]}
        />
        <p className="text-[12px] text-muted-foreground leading-[1.85] mt-2">
          UI 在「权益规则编辑」表单里通过 <Code>QUOTA_SCOPES</Code> 给出选择 + 智能建议（按 Capability.dataType 自动联想），
          但允许显式覆盖。运行时无论池归属如何，<b>消耗日志 usage_log 始终记录 actor_user_id 用于审计</b>，与额度归属解耦。
        </p>
      </div>

      <div id="ac-health">
        <H3>健康度 · 80% 预警 / 休眠预警</H3>
        <Card>
          <p className="text-[12.5px] leading-[1.85] text-foreground/85">
            「健康度」是给运营看的<b>主动续费风险信号</b>。在多个页面被复用：账户列表的进度条、看板的风险预警面板、企业详情页的权益快照。
          </p>
          <Table
            headers={["指标","阈值","UI 表现","出现位置"]}
            cols={["140px","160px",undefined,undefined]}
            rows={[
              ["使用率",     "≥ 80%",     <span>进度条由 <Tag tone="info">蓝</Tag> 切换为 <Tag tone="danger">红</Tag></span>, "账户列表 / 概览 / 看板热力图"],
              ["休眠天数",   "> 15 天未消耗", <Tag tone="warning">休眠预警</Tag>, "看板风险面板"],
              ["健康度分级", "excellent / good / warning / critical", "AccountDetail 顶部环形健康分", "权益账户详情页"],
              ["续费率",     "—",         "AccountHealthMetrics.renewalRate", "账户详情 + 看板"],
            ]}
          />
          <KV items={[
            { k: "为什么挑 80%", v: "经验值：80% 之后 7 天内见底的概率 > 60%，是续费推广 / 加油包推荐的最佳触达窗口。" },
            { k: "为什么不放在余额本身", v: "余额是事实数据，健康度是衍生指标。两者分离便于调整阈值不影响事实。" },
          ]} />
        </Card>
      </div>

      <div id="ac-allocation">
        <H3>AllocationRecord · 分配记录（展开行）</H3>
        <Pre>{`AllocationRecord 在 AccountList 中作为可展开行存在：
─────────────────────────────────────────────────────
▶ 欧派家居集团                  3 应用  15 项能力  85%
  ├ ▶ 旗舰会员（国内 3D）        ord1   3 项  使用率 15.2%
  ├ ▶ 4K 普通图 × 1             ord4   1 项  使用率 0%
  └ ▶ 8K 普通图 × 1             ord4   1 项  使用率 0%
─────────────────────────────────────────────────────
点击一行即可跳转该 Allocation 对应的源订单（OrderDetail）。`}</Pre>
        <p className="text-[12px] text-muted-foreground leading-[1.85] mt-2">
          AllocationRecord 与 capabilities 是两个视角看同一份履约数据：
          allocations 按「订单 × item」展开（运营关心来源），capabilities 按「能力 × 规则」聚合（应用关心余额）。
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────── 06 · 数据模型与归属 ─────────────────────────── */
function DataModel() {
  return (
    <section id="data" className="scroll-mt-4 space-y-5">
      <H2 icon={Database} num="06">数据模型与归属</H2>

      <div id="dm-er">
        <H3>ER 全景</H3>
        <Mermaid
          caption="权益管理 ER · 配置 + 交易 + 履约 三层"
          chart={`erDiagram
  APP ||--o{ CAPABILITY : "1:N"
  CAPABILITY ||--o{ RULE : "1:N"
  RULE }o--o{ PRODUCT : "N:M (product_rules)"
  PRODUCT }o--o{ SKU : "N:M (sku_products)"
  SKU }o--o{ BUNDLE : "via BundleItem"

  ORDER ||--|{ ORDER_ITEM : "1:N"
  ORDER_ITEM }o--|| PRODUCT : "type=product"
  ORDER_ITEM }o--|| SKU     : "type=sku"
  ORDER_ITEM }o--|| BUNDLE  : "type=bundle"

  CUSTOMER ||--o{ ORDER : "1:N"
  CUSTOMER ||--o| ACCOUNT : "1:1 per appId"
  ORDER ||--o{ ALLOCATION : "履约展开"
  ACCOUNT ||--|{ ACCOUNT_CAPABILITY : "聚合余额"
  ACCOUNT_CAPABILITY }o--o{ ORDER : "sourceOrderIds[]"

  ENTERPRISE ||--o{ ORDER : "enterprise_grant 联动"
`}
        />
      </div>

      <div id="dm-fields">
        <H3>字段三态：可变 / 弱可变 / 不可变</H3>
        <Table
          headers={["实体","可变（热改）","弱可变（需新版本）","不可变（必须开新单）"]}
          cols={["140px",undefined,undefined,undefined]}
          rows={[
            ["Capability", "name / description / status", "consumePerUse（影响所有规则）", "appId / code / dataType / apiPath"],
            ["Rule",       "name / description / status",  "quotaScope / perUserCap", "capabilityId / quota / periodType（已被订单引用后）"],
            ["Product",    "name / description / limitPerUser / status", "ruleIds[]（影响发放内容）", "code / exchangeType / appId"],
            ["SKU",        "name / sortOrder / salesStatus", "productIds[] / price（仅未售出时）", "code / appId / billingCycle（已有订阅后）"],
            ["Order",      "remark", "items（仅 internal_grant 审核前）/ totalAmount（enterprise_grant 在企业页改）", "orderType / customerId / 履约后任何字段"],
          ]}
        />
      </div>

      <div id="dm-edit">
        <H3>编辑期：什么能改 / 什么必须开新单</H3>
        <Card>
          <p className="text-[12.5px] leading-[1.85] text-foreground/85">
            权益模块最微妙的规则之一：<b>「编辑配置 vs 开新版本」的分界线</b>。
            原则：<b>影响已发放权益数额的字段一律不可热改，必须停售老版本 + 新建版本。</b>
          </p>
          <Pre>{`✅ 可以热改（不影响已生效订单）
  - Capability.name / description / status=inactive（仅禁止新订单引用）
  - Rule.name / description / status=inactive
  - Product.limitPerUser（仅影响未来发放）
  - SKU.salesStatus=off_sale（老订单仍可续费）

⚠️ 需要新版本（保留老规则 + 创建新规则）
  - Rule.quota / periodType / quotaScope（额度本身）
  - Product.ruleIds[]（产品组成变化）
  - SKU.productIds[]（商品打包变化）

❌ 必须开新订单（不可改老订单）
  - Order.items[] 增减（履约后）
  - Order.customerId（错单只能撤 + 重开）
  - Order.totalAmount（普通订单；enterprise_grant 例外，在企业详情页改）`}</Pre>
        </Card>
      </div>

      <div id="dm-rls">
        <H3>企业 × 应用 × 客户 三维 RLS</H3>
        <Table
          headers={["视角","Order 可见性","Account 可见性","Rule / Product 可见性"]}
          cols={["120px",undefined,undefined,undefined]}
          rows={[
            ["平台视角",   "全量",                                "全量",                        "全量读写"],
            ["企业视角（B端管理员）", "本企业 customerId 关联的订单 + enterprise_grant", "本企业 customerId 关联的 account", "只读（配置层不可写）"],
            ["C 端用户",   "本人 customerId（user_purchase）",     "本人 account",                "不可见"],
            ["应用运行时", "—",                                    "凭 customerId 校验余额 + 扣减", "凭 capabilityId 校验"],
          ]}
        />
      </div>
    </section>
  );
}

/* ─────────────────────────── 07 · 端到端业务流 ─────────────────────────── */
function E2EFlow() {
  return (
    <section id="e2e" className="scroll-mt-4 space-y-5">
      <H2 icon={Workflow} num="07">端到端业务流</H2>

      <div id="e2e-purchase">
        <H3>7.1 用户购买（user_purchase）</H3>
        <Card>
          <SeqLine from="C 端用户" to="商城" msg="选择 Bundle/SKU + 下单" kind="req" />
          <SeqLine from="商城" to="权益模块" msg="POST /orders {orderType: user_purchase}" kind="req" />
          <SeqLine from="权益模块" to="DB" msg="写 order(pending_effect, auto_approved, paymentStatus=pending)" kind="req" />
          <SeqLine from="权益模块" to="支付网关" msg="发起支付" kind="req" />
          <SeqLine from="支付网关" to="权益模块" msg="webhook · paymentStatus=paid" kind="evt" />
          <SeqLine from="履约 Job" to="DB" msg="按 items[] 展开 → 写 AccountCapability + AllocationRecord" kind="req" />
          <SeqLine from="履约 Job" to="事件总线" msg="emit entitlement.granted" kind="evt" />
          <SeqLine from="权益模块" to="DB" msg="orderStatus = active" kind="req" />
        </Card>
      </div>

      <div id="e2e-enterprise">
        <H3>7.2 企业入驻（enterprise_grant）</H3>
        <Card>
          <SeqLine from="企业模块" to="事件总线" msg="emit enterprise.application.approved" kind="evt" />
          <SeqLine from="权益模块（订阅）" to="DB" msg="自动开单 order(orderType=enterprise_grant, auditStatus=follow_enterprise)" kind="req" />
          <SeqLine from="运营" to="企业详情页 · 权益快照" msg="调整金额 / items（不在订单页改）" kind="req" />
          <SeqLine from="企业模块" to="事件总线" msg="emit enterprise.business.changed=active" kind="evt" />
          <SeqLine from="权益模块" to="DB" msg="orderStatus=active + 履约 Account" kind="req" />
          <SeqLine from="企业模块" to="事件总线" msg="emit enterprise.business.changed=disabled" kind="evt" />
          <SeqLine from="权益模块" to="DB" msg="orderStatus=suspended + Account 冻结（不清零）" kind="req" />
        </Card>
      </div>

      <div id="e2e-internal">
        <H3>7.3 内部发放（internal_grant）</H3>
        <Card>
          <SeqLine from="运营 / 客服" to="OrderCreate" msg="选 Product(exchangeType=free)，applyMode + dateRange" kind="req" />
          <SeqLine from="权益模块" to="DB" msg="写 order(pending_audit, no_payment, pending_effect)" kind="req" />
          <SeqLine from="审核员" to="OrderDetail" msg="审核通过 → auditStatus=approved" kind="req" />
          <SeqLine from="履约 Job" to="DB" msg="按 applyMode 展开到指定人员的 Account" kind="req" />
        </Card>
      </div>

      <div id="e2e-consume">
        <H3>7.4 运行时消耗：扣减 → 回写余额</H3>
        <Mermaid
          caption="应用调用 → 鉴权 → 扣减 → 余额更新"
          chart={`sequenceDiagram
  autonumber
  participant APP as 应用运行时
  participant ENT as 权益网关
  participant CACHE as L2 配额缓存(30s)
  participant DB as account_capability
  participant LOG as usage_log

  APP->>ENT: POST /account/{custId}/consume<br/>{capabilityId, actorUserId, n}
  ENT->>CACHE: 读余额 (capabilityId)
  alt 缓存命中
    ENT->>ENT: 本地扣减 + 写回缓存
  else 缓存未命中
    ENT->>DB: SELECT FOR UPDATE
    ENT->>DB: UPDATE used_quota += n*consumePerUse
    ENT->>CACHE: 回填
  end
  ENT->>LOG: append (actorUserId, capabilityId, n, ts)
  ENT-->>APP: 200 OK · 剩余余额
  Note over ENT,DB: 月底对账 job 用 usage_log 校准 cache 漂移
`}
        />
        <KV items={[
          { k: "为什么允许 30s 弱一致", v: "应用调用 QPS 极高，强一致会让 DB 成瓶颈。30s 内可能超用一两次，由月底对账补偿。" },
          { k: "actorUserId 的作用", v: "无论池归属如何，永远记录是谁调用的，用于审计、个人画像、能效分析。与额度归属完全解耦。" },
          { k: "consumePerUse 的乘法", v: "8K 渲染 consumePerUse=4 意味着调用 1 次扣 4 单位余额。Rule.quota 已是「单位数」而非「调用次数」。" },
        ]} />
      </div>

      <div id="e2e-refund">
        <H3>7.5 退款 / 暂停 / 恢复 / 关闭的差异</H3>
        <Table
          headers={["操作","对 Order","对 Account","可逆","典型场景"]}
          cols={["80px",undefined,undefined,"60px",undefined]}
          rows={[
            ["退款",   "paymentStatus=refunded，orderStatus=closed（开反向单，不改原单）", "对应 capability 减额；本期已消耗保留", "❌", "用户购买后申请退款"],
            ["暂停",   "orderStatus=suspended",                          "capability.frozen=true，不清零", "✅", "企业被冻结 / 客诉调查中"],
            ["恢复",   "orderStatus=active",                              "capability.frozen=false",       "—", "调查结束 / 企业恢复"],
            ["关闭",   "orderStatus=closed（仅 pending_effect/suspended 可关）", "未履约则不动；已履约则不可关", "❌", "未支付超时 / 录入错误"],
          ]}
        />
        <KV items={[
          { k: "为什么退款不改原单", v: "原订单是事实凭证，必须保留。退款走反向单（type=refund，amount<0，sourceOrderId 指向原单）。" },
          { k: "暂停 vs 关闭", v: "暂停只冻结余额（可恢复），关闭表示订单生命周期已结束（不可恢复，只能重新下单）。" },
        ]} />
      </div>
    </section>
  );
}

/* ─────────────────────────── 08 · 数据生命周期图谱 ─────────────────────────── */
function Atlas() {
  return (
    <section id="atlas" className="scroll-mt-4 space-y-5">
      <H2 icon={Rocket} num="08">数据生命周期图谱</H2>

      <div id="atlas-dag">
        <H3>总依赖 DAG</H3>
        <Mermaid
          caption="权益域 · 实体依赖 DAG"
          chart={`flowchart TB
  subgraph L1["① 配置层"]
    APP["App"]:::cfg --> CAP["Capability"]:::cfg --> RULE["Rule"]:::cfg
    RULE --> PROD["Product"]:::cfg --> SKU["SKU"]:::cfg --> BUN["Bundle"]:::cfg
  end
  subgraph L2["② 交易层"]
    ORD["Order"]:::trd --> ITEM["OrderItem"]:::trd
  end
  subgraph L3["③ 履约层"]
    ACCT["Account"]:::ful --> ACAP["AccountCapability"]:::ful
    ALLOC["AllocationRecord"]:::ful
  end
  subgraph L4["④ 数据资产"]
    LOG["usage_log"]:::ast
    LEDGER["company / user quota ledger"]:::ast
    BI["BI 维表（SCD2）"]:::ast
  end

  ITEM --> PROD
  ITEM --> SKU
  ITEM --> BUN
  ORD --> ALLOC
  ALLOC --> ACCT
  RULE -.->|被引用| ACAP
  ACAP -.->|sourceOrderIds| ORD
  ACAP --> LOG
  LOG --> LEDGER
  ORD --> BI
  ACAP --> BI

  classDef cfg fill:#eef2ff,stroke:#6366f1,color:#312e81;
  classDef trd fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef ful fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef ast fill:#fae8ff,stroke:#a855f7,color:#581c87;
`}
        />
      </div>

      <div id="atlas-state">
        <H3>每个实体的状态机（核心 6 个）</H3>
        <div className="grid md:grid-cols-2 gap-4">
          <Mermaid caption="Rule · 权益规则" chart={`stateDiagram-v2
  [*] --> active: 创建
  active --> active: 改 name / description
  active --> inactive: 停用（不影响已有订单）
  inactive --> active: 启用
  inactive --> [*]: 无引用时可删
`}/>
          <Mermaid caption="Product · 权益产品" chart={`stateDiagram-v2
  [*] --> active: 创建（绑 Rule）
  active --> active: 改 limitPerUser
  active --> inactive: 停用
  inactive --> active: 启用
`}/>
          <Mermaid caption="SKU · 商品" chart={`stateDiagram-v2
  [*] --> on_sale: 上架
  on_sale --> off_sale: 下架（老订单仍续费）
  off_sale --> on_sale: 重新上架
`}/>
          <Mermaid caption="Order · 订单（生命周期维度）" chart={`stateDiagram-v2
  [*] --> pending_effect: 创建
  pending_effect --> active: 审核通过 + 支付满足
  pending_effect --> cancelled: 超时未支付 / 主动取消
  active --> suspended: 暂停
  suspended --> active: 恢复
  active --> expired: 周期到期
  pending_effect --> closed: 主动关闭
  suspended --> closed: 关闭
  active --> closed: 退款 / 终止
`}/>
          <Mermaid caption="Account · 权益账户" chart={`stateDiagram-v2
  [*] --> active: 首张订单履约时创建
  active --> active: 新订单合并 capability
  active --> frozen: 企业停用 / 全部订单 suspended
  frozen --> active: 恢复
  active --> archived: 客户长期无活跃（>180天）
`}/>
          <Mermaid caption="AccountCapability · 余额行" chart={`stateDiagram-v2
  [*] --> fresh: 履约创建
  fresh --> consuming: 首次扣减
  consuming --> refresh: 周期边界（DAY/MONTH）
  refresh --> consuming: 重置 usedQuota=0
  consuming --> exhausted: usedQuota=totalQuota
  exhausted --> refresh: 下周期
  consuming --> expired: 周期到期 + CLEAR_ON_EXPIRE
  expired --> [*]
`}/>
        </div>
      </div>

      <div id="atlas-emerge">
        <H3>数据涌现时序：从下单到余额可用</H3>
        <Mermaid
          caption="一次「旗舰会员」购买的数据涌现 · T0 下单 → T6 余额可用"
          chart={`sequenceDiagram
  autonumber
  participant U as 用户
  participant ORD as order
  participant ITEM as order_item
  participant ALLOC as allocation
  participant ACCT as account
  participant ACAP as account_capability
  participant CACHE as 配额缓存
  participant BI as 数仓

  U->>ORD: T0 创建 order(pending_effect)
  ORD->>ITEM: T0 写 items[bundle=旗舰会员]
  Note over ORD: 支付网关 webhook → paymentStatus=paid
  ORD->>ALLOC: T1 履约 job 拆 Bundle→SKU→Rule
  ALLOC->>ACCT: T2 若 account 不存在则创建（客户×应用首单）
  ALLOC->>ACAP: T3 按 (capabilityId×ruleId) 聚合或新增
  ACAP->>ACAP: T4 sourceOrderIds += [ord]
  ORD->>ORD: T5 orderStatus=active
  ACAP->>CACHE: T5 预热余额缓存（30s）
  ACAP->>BI: T6 维表写入 SCD2（保留版本）
  Note over CACHE: T6 应用运行时可立即扣减
`}
        />
        <KV items={[
          { k: "为什么 Account 不预创建", v: "「客户×应用」第一次有订单时才创建 Account，避免空账户漂移。" },
          { k: "为什么 Bundle 要在履约 job 拆", v: "Bundle 是促销结构，履约必须按 SKU → Rule 粒度入账，才能让 Account 看到原子能力。" },
          { k: "T6 才到 BI 的原因", v: "BI 走异步消息，不阻塞用户感知；维表使用 SCD2 保留历史，停用 / 退款不会篡改老报表。" },
        ]} />
      </div>

      <div id="atlas-event">
        <H3>事件传播：消耗 fan-out</H3>
        <Mermaid
          caption="一次 capability 消耗的事件扩散"
          chart={`flowchart LR
  A["应用运行时<br/>POST /account/{id}/consume"]:::trigger
  subgraph TX["同事务"]
    direction TB
    B["account_capability<br/>used_quota += n"]
    C["usage_log<br/>append (actor, ts)"]
  end
  BUS(("event bus<br/>entitlement.consumed")):::bus
  A --> B --> C --> BUS
  BUS -.->|① 健康度| H["重算客户健康分<br/>使用率 ≥ 80% 触发预警"]
  BUS -.->|② 个人画像| P["如 quotaScope=user → 写个人能效"]
  BUS -.->|③ 看板| D["热力图 + KPI 增量"]
  BUS -.->|④ 续费触达| R["≥80% 且周期临近 → 推加油包"]
  BUS -.->|⑤ BI| BI["事实表 fact_entitlement_usage"]

  classDef trigger fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef bus fill:#1e293b,stroke:#0f172a,color:#fff;
`}
        />
      </div>

      <div className="rounded-lg border-l-2 border-primary/60 bg-primary/5 px-4 py-3 text-[12.5px] leading-[1.85]">
        <strong>设计哲学回扣：</strong>本 PRD 8 章从「为什么」→「是什么」→「怎么动」逐层推导。
        权益管理的关键不在于看得见的「订单 / 商品 / 套餐」，而在于看不见的<strong>「同一个能力如何通过四种渠道发放、五个状态机协作、三层聚合追溯，最终在客户那里表达为一行余额」</strong>。
        所有上下游模块（应用、企业、客户、营销、BI）都只消费 <Code>account.capabilities[*]</Code> 这一份语义稳定的事实表 —— 这是整套体系最重要、也最容易被忽视的设计意图。
      </div>
    </section>
  );
}
