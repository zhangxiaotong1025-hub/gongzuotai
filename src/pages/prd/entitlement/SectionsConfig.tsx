import {
  BookOpen, Target, Hash, Network, Layers, Database,
  Boxes, Workflow, BarChart3, Users, Radio, FileText,
  GitBranch, Cpu, Code2, ShieldCheck, Rocket, Zap,
  Package, ShoppingCart, Tag as TagIcon, Wallet, ListTree,
  Server, Cloud, Lock, Gauge, Sparkles, CircleDot, Activity,
  AlertTriangle, ArrowRightLeft, Check, X,
} from "lucide-react";
import { Floor, H2, H3, H4, Card, Pre, Tag, Table, KV, Stat, Code, SeqLine } from "./parts";

/* ────────────────────────────────
   01 · 文档信息
   ──────────────────────────────── */
export function S01() {
  return (
    <Floor id="overview">
      <H2 num="01" icon={BookOpen}>文档信息</H2>
      <Card>
        <KV items={[
          { k: "文档版本", v: <span className="font-mono">v1.0.0 · 2026-05-08</span> },
          { k: "文档状态", v: <Tag tone="success">Released · 可指导研发</Tag> },
          { k: "owner", v: "权益产品组（产品负责人 · 张三）" },
          { k: "技术对接", v: "后端：李四 / 数据：王五 / 前端：赵六 / QA：周七" },
          { k: "关联系统", v: "居然设计家、居然之家·门店端、AI设计家、智能导购、精准客资" },
          { k: "前置依赖", v: "企业管理 · 人员管理 · 权限管理 · 客户CRM · 订单中心 · 积分中心 · 支付中心" },
          { k: "Mock 蓝本", v: <><Code>src/data/entitlement.ts</Code> + 路由 <Code>/entitlement/*</Code></> },
          { k: "评审记录", v: "2026-04-22 业务评审 · 2026-04-29 架构评审 · 2026-05-06 安全评审" },
        ]}/>
      </Card>

      <Card>
        <H3>变更记录</H3>
        <Table
          headers={["版本", "日期", "作者", "变更摘要"]}
          cols={["80px", "110px", "80px", ""]}
          rows={[
            ["v0.1", "2026-04-15", "张三", "初稿，框定 8 层链路与 4 种交易模式"]as (string | React.ReactNode)[],
            ["v0.5", "2026-04-22", "张三", "补全 ER + 状态机；澄清 product 与 sku 的 N:M 关系"],
            ["v0.8", "2026-04-29", "张三/李四", "增加事件契约 / Saga 补偿 / Redis Lua 扣减"],
            ["v0.9", "2026-05-06", "张三/钱八", "安全评审：RLS、字段加密、审计日志"],
            ["v1.0", "2026-05-08", "张三", "Released · 提供 DDL / API 样例 / 容量估算 / 灰度方案"],
          ]}
        />
      </Card>

      <Card>
        <H3>RACI 责任矩阵</H3>
        <Table
          headers={["关键交付物", "产品 PO", "后端", "数据", "前端", "QA", "运维"]}
          cols={["", "70px", "70px", "70px", "70px", "70px", "70px"]}
          rows={[
            ["需求评审 / PRD",      "R/A", "C", "C", "C", "C", "I"]as (string | React.ReactNode)[],
            ["DDL / 迁移脚本",      "C",   "R/A", "C", "I", "I", "I"],
            ["核心服务编码",        "I",   "R/A", "I", "I", "C", "I"],
            ["事件契约 + Topic",    "C",   "R",   "A", "I", "C", "I"],
            ["数据资产 / 看板",     "C",   "C",   "R/A","I", "C", "I"],
            ["管理后台前端",        "C",   "C",   "I", "R/A","C", "I"],
            ["压测 / 灰度 / 上线",  "I",   "C",   "C", "C", "R", "A"],
          ]}
        />
        <div className="text-[11px] text-muted-foreground mt-2">R 执行 · A 审批 · C 咨询 · I 知会</div>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   02 · 业务背景与目标
   ──────────────────────────────── */
export function S02() {
  return (
    <Floor id="background">
      <H2 num="02" icon={Target}>业务背景与目标</H2>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <H3>业务现状（痛点）</H3>
          <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-4">
            <li>多端能力（3D工具 / AI / 导购 / 客资）权益规则散落，无统一定义</li>
            <li>同一能力被多商品共用，规则维护成本随 SKU 数量线性放大</li>
            <li>订单 / 积分 / 企业入驻三套发放路径无统一对账，财务月结靠人工拉表</li>
            <li>账户消耗无法回溯到 SKU/订单源，客成同学只能"猜"客户用了什么</li>
            <li>能力扩展强耦合代码，新能力上线需 2 周以上</li>
          </ul>
        </Card>
        <Card>
          <H3>核心目标（v1）</H3>
          <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-4">
            <li>一套数据模型贯穿 <b className="text-foreground">8 层链路</b>，做到"配一次、用全场"</li>
            <li>规则可复用、产品可拼装、商品可售卖；新能力上线 ≤ 1 工作日</li>
            <li>账户消耗可溯源到 <Code>order_id → sku_id → product_id → rule_id</Code></li>
            <li>领域事件 100% 外发 Kafka，支撑 BI / 画像 / 风控 / 客成 SOP</li>
            <li>财务对账 0 误差，T+1 自动出报表</li>
          </ul>
        </Card>
        <Card>
          <H3>北极星指标（NSM）</H3>
          <div className="space-y-2 text-[12.5px]">
            <div className="flex justify-between border-b pb-1.5"><span>配置效率</span><b>新能力上线 ≤ 1 工作日</b></div>
            <div className="flex justify-between border-b pb-1.5"><span>账户健康分</span><b>≥ 80% 客户 ≥ 70 分</b></div>
            <div className="flex justify-between border-b pb-1.5"><span>旗舰会员续费率</span><b>≥ 75%（年度）</b></div>
            <div className="flex justify-between border-b pb-1.5"><span>对账误差</span><b>0 异常 / 日</b></div>
            <div className="flex justify-between border-b pb-1.5"><span>消耗扣减 P99</span><b>≤ 30ms</b></div>
            <div className="flex justify-between"><span>核心链路 SLA</span><b>≥ 99.95%</b></div>
          </div>
        </Card>
      </div>

      <Card>
        <H3>业务 KPI 树（自上而下拆解）</H3>
        <Pre>{`            权益域营收（GMV）
                  │
        ┌─────────┼──────────────────────────┐
        ▼         ▼                          ▼
   新购 GMV    续费 GMV                    增购/升级 GMV
        │         │                          │
   ┌────┴───┐ ┌───┴───┐               ┌─────┴─────┐
   ▼        ▼ ▼       ▼               ▼           ▼
  曝光UV   付费率 续费率   流失挽回   套餐渗透率   人均SKU数
   │        │   │         │             │
  渠道CTR  落地  健康分    客成触达      推荐CTR
            转化  ≥70%      时机准确度

  📌 以"健康分 ≥ 70"作为续费率与流失率的中间桥变量`}</Pre>
      </Card>

      <Card>
        <H3>非目标（明确不做）</H3>
        <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
          <li>不在权益域内做"支付通道"，复用集团支付中心</li>
          <li>不在权益域内做"积分发放规则引擎"，仅消费积分中心账户</li>
          <li>v1 不支持"按使用量后付费"（pay-as-you-go），仅支持额度型预付费</li>
          <li>v1 不支持跨币种结算（仅 CNY）</li>
        </ul>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   03 · 术语
   ──────────────────────────────── */
export function S03() {
  return (
    <Floor id="glossary">
      <H2 num="03" icon={Hash}>术语与核心概念</H2>
      <Card>
        <Table
          headers={["术语", "Code", "定义", "示例 / 备注"]}
          cols={["110px", "150px", "", ""]}
          rows={[
            [<b>应用</b>, "Application / app", "业务前台单元，权益隔离的最大边界。一个客户在不同 App 拥有独立账户切片", "国内3D / AI设计家"]as (string | React.ReactNode)[],
            [<b>能力</b>, "Capability / cap", "技术能力点，绑定 API、数据类型、消耗系数", "AI设计 / 4K渲染"],
            [<b>数据类型</b>, "DataType", "能力的计量方式", "COUNTER / BOOLEAN / STORAGE / DURATION"],
            [<b>规则</b>, "EntitlementRule", "「额度 + 周期 + 发放策略」最小可发放单元", "AI设计 500 次/日"],
            [<b>权益产品</b>, "Product", "面向「交易」的权益封装，多 Rule 组合，兑换方式三选一", "旗舰会员权益包"],
            [<b>兑换方式</b>, "ExchangeType", "paid（付费） / credit（积分） / free（免费）", "决定能进入哪些 SKU 通道"],
            [<b>商品</b>, "SKU", "可独立售卖的对客单元，引用一个或多个权益产品", "旗舰会员·月卡"],
            [<b>计费周期</b>, "BillingCycle", "once / monthly / yearly", "决定订单到期时间"],
            [<b>套餐</b>, "Bundle", "多 SKU + 数量组合，可跨应用", "全球设计组合（国内+国际+AI）"],
            [<b>订单</b>, "Order", "购买/发放/兑换的事务单据。3 维状态解耦", "ORD202603120001"],
            [<b>订单类型</b>, "OrderType", "user_purchase / credit / internal_grant / enterprise_grant", "决定状态机起点"],
            [<b>账户</b>, "EntitlementAccount", "按客户聚合的权益持有视图，跨应用聚合", "欧派家居 · 权益账户"],
            [<b>账户能力</b>, "AccountCapability", "账户内某条规则的额度持有记录（核心账目）", "包含 totalQuota / used / sourceOrderIds[]"],
            [<b>发放快照</b>, "AllocationRecord", "订单生效时一次性写入的发放结果，便于事后稽核", "记录命中规则数 / 发放总额度"],
            [<b>消耗流水</b>, "UsageLog", "每次能力消耗的明细，写 ClickHouse", "用于风控 / BI / 画像"],
            [<b>跟随企业审核</b>, "follow_enterprise", "订单审核状态跟随企业入驻审核状态联动", "企业被驳回 → 订单自动关单"],
            [<b>幂等键</b>, "idempotency_key", "客户端生成的请求唯一性键", "防止重复下单"],
            [<b>溯源</b>, "Provenance", "从账户消耗反查订单的能力", "通过 sourceOrderIds 数组实现"],
            [<b>租户</b>, "Tenant", "PG RLS 隔离单位，对应 enterprise_id 或 platform", "platform 表示平台自营"],
            [<b>跨应用聚合</b>, "Cross-app Aggregation", "一个客户多个应用的权益统一视图", "账户列表使用"],
          ]}
        />
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   04 · 系统蓝图 · 模式设计
   ──────────────────────────────── */
export function S04() {
  return (
    <Floor id="blueprint">
      <H2 num="04" icon={Network}>系统蓝图 · 模式设计</H2>

      <Card>
        <H3>双视角分层模型</H3>
        <p className="text-[12.5px] text-muted-foreground mb-3">
          采用 <b className="text-foreground">「配置侧 / 履约侧」分层 + 「平台 / 企业」双视角</b>。
          配置侧负责供给（一次定义、多次使用），履约侧负责消费（一笔订单、一份额度、一段消耗）。
          二者通过 <b className="text-foreground">领域事件</b> 解耦，BI / 画像 / 风控均挂在事件下游。
        </p>
        <Pre>{`╔══════════════════════════════ 配置侧（供给） ══════════════════════════════╗
║                                                                            ║
║   应用  ──▶  能力  ──▶  规则  ──▶  权益产品  ──▶  商品 / 套餐              ║
║   App        Cap        Rule        Product         SKU / Bundle           ║
║                                                                            ║
║  关系：App(1)─<Cap(N)─<Rule(N)─N:M─Product(N)─N:M─SKU(N)─<BundleItem>Bundle║
╚══════════════════════════════════╤═════════════════════════════════════════╝
                                   │ 上架 / 发布 ConfigChanged
                                   ▼
╔══════════════════════════════ 履约侧（消费） ══════════════════════════════╗
║                                                                            ║
║   订单 ──▶ 审核 ──▶ 支付 ──▶ 履约 ──▶ 账户额度 ──▶ 消耗 ──▶ 续费/退费       ║
║   Order   Audit    Payment  Grant     Account      Usage    Renew/Refund   ║
║                                                                            ║
╚══════════════════════════════════╤═════════════════════════════════════════╝
                                   │ 领域事件（Kafka）
                                   ▼
╔══════════════════════════════ 数据 / 智能侧 ═══════════════════════════════╗
║                                                                            ║
║   ODS ─▶ DWD ─▶ DWS ─▶ ADS  +  Feature Store + 健康分模型 + 续费预测       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝`}</Pre>
      </Card>

      <Card>
        <H3>四种交易模式（订单类型）</H3>
        <Table
          headers={["订单类型", "Code", "审核策略", "支付策略", "适用场景"]}
          cols={["110px", "180px", "180px", "150px", ""]}
          rows={[
            ["付费售卖", <Code>user_purchase</Code>, <Tag tone="success">auto_approved</Tag>, <Tag tone="info">pending → paid</Tag>, "C/B 端用户自助下单，走支付"]as (string | React.ReactNode)[],
            ["积分兑换", <Code>credit</Code>, <Tag tone="success">auto_approved</Tag>, <Tag tone="muted">no_payment（扣积分）</Tag>, "用户/企业在积分商城兑换"],
            ["内部发放", <Code>internal_grant</Code>, <Tag tone="warning">pending_audit</Tag>, <Tag tone="muted">no_payment</Tag>, "运营人工签核（赠送 / 试用）"],
            ["企业入驻", <Code>enterprise_grant</Code>, <Tag tone="info">follow_enterprise</Tag>, <Tag tone="muted">no_payment</Tag>, "企业入驻流程联动放行"],
          ]}
        />
      </Card>

      <Card>
        <H3>双视角访问控制（平台 / 企业）</H3>
        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-3 bg-muted/20">
            <div className="font-semibold text-[13px] text-foreground mb-2">平台视角（运营 / 客成 / 财务）</div>
            <ul className="text-[12px] space-y-1 text-foreground/85 list-disc pl-4">
              <li>查看全部企业 / 客户的权益账户</li>
              <li>配置应用 / 能力 / 规则 / 产品 / SKU / 套餐</li>
              <li>审核 internal_grant 订单</li>
              <li>冻结 / 解冻账户</li>
              <li>对账与财务报表</li>
            </ul>
          </div>
          <div className="border rounded-lg p-3 bg-muted/20">
            <div className="font-semibold text-[13px] text-foreground mb-2">企业视角（企业管理员 / 自然人）</div>
            <ul className="text-[12px] space-y-1 text-foreground/85 list-disc pl-4">
              <li>仅看到本企业（含子级）的权益账户</li>
              <li>下单 / 付费 / 兑换</li>
              <li>查看本企业消耗明细</li>
              <li>不可见配置侧（除非被授予 platform.entitlement.* 权限）</li>
              <li>RLS 强制按 enterprise_id 隔离</li>
            </ul>
          </div>
        </div>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   05 · 分层架构
   ──────────────────────────────── */
export function S05() {
  return (
    <Floor id="architecture">
      <H2 num="05" icon={Layers}>分层架构</H2>

      <Card>
        <H3>整体部署拓扑</H3>
        <Pre>{`┌────────────────────────── 表现层（Web / APP / 小程序 / H5） ──────────────────────────┐
│   管理后台 · 商家工作台 · C 端商城 · 设计师端 · 门店导购                              │
└─────────────────────────────────────┬───────────────────────────────────────────────┘
                                      │ HTTPS / TLS1.3 · JWT(enterprise_id, role[], scope)
┌─────────────────────────────────────▼───────────────────────────────────────────────┐
│                  Spring Cloud Gateway / BFF（鉴权 · 限流 · 缓存 · 聚合）            │
└─────────────────────────────────────┬───────────────────────────────────────────────┘
                                      │ 内网 RPC（OpenFeign / gRPC）
┌──────────┬──────────┬──────────┬────┴───────┬──────────┬──────────┬──────────┐
│  应用域  │  能力域  │  规则域  │  权益产品域 │  交易域  │  账户域  │  事件域  │
│ AppSvc   │ CapSvc   │ RuleSvc  │ ProductSvc │ OrderSvc │ AcctSvc  │ EventSvc │
│ DictSvc  │ ApiBind  │ Policy   │ SkuSvc     │ AuditSvc │ UsageSvc │ Outbox   │
│          │ Consume  │ Derive   │ BundleSvc  │ PaySvc   │ GrantSvc │ Replay   │
└──────────┴──────────┴──────────┴────┬───────┴──────────┴──────────┴──────────┘
                                      │
   ┌──────────────────────────────────┴────────────────────────────────────┐
   ▼                                                                       ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│ PostgreSQL 16（主从 · RLS · JSONB）  │    │ Redis 7（cluster · Lua · stream）   │
│  • 配置 / 订单 / 账户 主表           │    │  • 额度热数据 / 限流 / 锁           │
└──────────────────────────────────────┘    └──────────────────────────────────────┘
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│ Kafka 3.6（事件总线 · 7 day retain）│    │ ClickHouse 24（usage / dwd_*）      │
└──────────────────────────────────────┘    └──────────────────────────────────────┘
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│ Flink 1.18（实时特征）              │    │ Elasticsearch 8（订单 / 产品检索）  │
└──────────────────────────────────────┘    └──────────────────────────────────────┘`}</Pre>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <H3>领域划分与边界</H3>
          <Table
            headers={["域", "职责", "对外输出"]}
            cols={["100px", "", "150px"]}
            rows={[
              ["应用域",     "App 元数据，是权益隔离边界", "AppCreated 事件"]as (string | React.ReactNode)[],
              ["能力域",     "能力定义、API 绑定、消耗系数", "CapChanged 事件"],
              ["规则/产品域","额度规则与权益封装；策略派生", "ProductPublished 事件"],
              ["交易域",     "订单状态机、审核、支付、对账",  "Order* 事件族"],
              ["账户域",     "发放、额度、消耗记账，行级幂等", "Grant/Usage 事件族"],
              ["事件域",     "Outbox + Kafka 投递、DLQ、重放", "对外统一总线"],
            ]}
          />
        </Card>
        <Card>
          <H3>关键架构约束（Inviolable）</H3>
          <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-4">
            <li>额度变更必须经过 <b>账户域</b>，不允许跨域直写 <Code>account_capability</Code></li>
            <li>所有发放/消耗以 <Code>order_id + trace_id</Code> 幂等，DB 唯一索引兜底</li>
            <li>RLS 按 <Code>enterprise_id</Code> 强制隔离，平台账号通过 <Code>has_role('platform_admin')</Code> 旁路</li>
            <li>领域事件统一通过 <b>Outbox 模式</b> 投递 Kafka，禁止业务代码直发 Kafka</li>
            <li>所有写接口必须支持 <Code>idempotency-key</Code> 头，60 分钟去重</li>
            <li>主库与 Redis 不允许出现"长事务"（&gt; 200ms），需做异步化</li>
          </ul>
        </Card>
      </div>

      <Card>
        <H3>六边形依赖（Hexagonal · 以 OrderSvc 为例）</H3>
        <Pre>{`                       ┌──────────────────────┐
                       │  Inbound Adapters    │
                       │  · REST Controller   │
                       │  · Kafka Consumer    │
                       │  · Scheduler         │
                       └──────────┬───────────┘
                                  │ Application Service
                                  ▼
       ┌──────────────────────────────────────────────────────┐
       │                  Domain Core                         │
       │  · Order Aggregate（含三维状态机）                    │
       │  · OrderItem · AuditPolicy · PaymentPolicy           │
       │  · DomainEvent (raised → outbox)                     │
       └──────────┬─────────────────────────────────┬─────────┘
                  │                                 │
        Outbound Ports                       Outbound Ports
                  ▼                                 ▼
   ┌──────────────────────┐         ┌──────────────────────┐
   │ Persistence Adapter  │         │ Integration Adapter  │
   │ · OrderRepoMyBatis   │         │ · PaymentClient      │
   │ · OutboxStore        │         │ · AuditClient        │
   └──────────────────────┘         │ · GrantClient (Acct) │
                                    └──────────────────────┘`}</Pre>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   06 · 数据结构 · 完整 DDL
   ──────────────────────────────── */
export function S06() {
  return (
    <Floor id="datamodel">
      <H2 num="06" icon={Database}>数据结构 · ER + DDL</H2>

      <Card>
        <H3>核心 ER 关系</H3>
        <Pre>{`Application(1) ───< Capability(N) ───< EntitlementRule(N)
                                              │
                                              │ N:M  product_rule_ref
                                              ▼
                                          Product(N)
                                              │
                                              │ N:M  sku_product_ref
                                              ▼
                                            SKU(N) ───< BundleItem >─── Bundle
                                              │
                                              │ 引用
                                              ▼
                                       OrderItem ──▶ Order(1) ──▶ Account(1)
                                                                    │
                                                                    │ 1:N
                                                                    ▼
                                                       AccountCapability(N)
                                                       (totalQuota / used /
                                                        sourceOrderIds[])
                                                                    │
                                                                    │ 1:N
                                                                    ▼
                                                          UsageLog(N · CK)`}</Pre>
      </Card>

      <Card>
        <H3>核心 DDL（PostgreSQL · 节选）</H3>
        <Pre>{`-- 应用
CREATE TABLE application (
  id            VARCHAR(32) PRIMARY KEY,
  code          VARCHAR(64) UNIQUE NOT NULL,
  name          VARCHAR(120) NOT NULL,
  description   TEXT,
  status        VARCHAR(16) NOT NULL DEFAULT 'active',  -- active / inactive
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 能力
CREATE TYPE capability_data_type AS ENUM ('COUNTER','BOOLEAN','STORAGE','DURATION');
CREATE TABLE capability (
  id                 VARCHAR(32) PRIMARY KEY,
  app_id             VARCHAR(32) NOT NULL REFERENCES application(id),
  code               VARCHAR(64) NOT NULL,
  name               VARCHAR(120) NOT NULL,
  data_type          capability_data_type NOT NULL,
  unit               VARCHAR(16),                   -- 次 / GB / 分钟
  api_path           VARCHAR(200),                  -- 绑定的业务 API
  consume_per_use    NUMERIC(10,2) DEFAULT 1.00,    -- 每次消耗系数
  status             VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE(app_id, code)
);
CREATE INDEX idx_cap_app ON capability(app_id);

-- 规则
CREATE TYPE rule_period AS ENUM ('DAY','MONTH','YEAR','PERMANENT');
CREATE TYPE rule_grant  AS ENUM ('DAILY_REFRESH','MONTHLY_GRANT','ONE_TIME');
CREATE TYPE rule_expire AS ENUM ('CLEAR_ON_EXPIRE','NEVER_EXPIRE');
CREATE TABLE entitlement_rule (
  id              VARCHAR(32) PRIMARY KEY,
  capability_id   VARCHAR(32) NOT NULL REFERENCES capability(id),
  name            VARCHAR(120) NOT NULL,
  quota           NUMERIC(14,2) NOT NULL,            -- BOOLEAN 用 1
  period_type     rule_period NOT NULL,
  grant_type      rule_grant  NOT NULL,
  expire_policy   rule_expire NOT NULL,
  status          VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rule_cap ON entitlement_rule(capability_id);

-- 权益产品
CREATE TYPE exchange_type AS ENUM ('paid','credit','free');
CREATE TABLE product (
  id              VARCHAR(32) PRIMARY KEY,
  app_id          VARCHAR(32) NOT NULL REFERENCES application(id),
  name            VARCHAR(160) NOT NULL,
  description     TEXT,
  exchange_type   exchange_type NOT NULL,
  credit_price    NUMERIC(12,2),                     -- 仅 credit 类型
  limit_per_user  INT DEFAULT 0,                     -- 0 不限
  status          VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_rule_ref (
  product_id      VARCHAR(32) NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  rule_id         VARCHAR(32) NOT NULL REFERENCES entitlement_rule(id),
  PRIMARY KEY (product_id, rule_id)
);

-- 商品
CREATE TYPE billing_cycle AS ENUM ('once','monthly','yearly');
CREATE TABLE sku (
  id              VARCHAR(32) PRIMARY KEY,
  app_id          VARCHAR(32) NOT NULL REFERENCES application(id),
  name            VARCHAR(160) NOT NULL,
  price           NUMERIC(12,2) NOT NULL,
  billing_cycle   billing_cycle NOT NULL,
  sales_status    VARCHAR(16) NOT NULL DEFAULT 'active',  -- active / draft / offline
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sku_product_ref (
  sku_id          VARCHAR(32) NOT NULL REFERENCES sku(id) ON DELETE CASCADE,
  product_id      VARCHAR(32) NOT NULL REFERENCES product(id),
  PRIMARY KEY (sku_id, product_id)
);

-- 套餐
CREATE TABLE bundle (
  id              VARCHAR(32) PRIMARY KEY,
  name            VARCHAR(160) NOT NULL,
  origin_price    NUMERIC(12,2) NOT NULL,
  sell_price      NUMERIC(12,2) NOT NULL,
  status          VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE bundle_item (
  bundle_id       VARCHAR(32) NOT NULL REFERENCES bundle(id) ON DELETE CASCADE,
  sku_id          VARCHAR(32) NOT NULL REFERENCES sku(id),
  quantity        INT NOT NULL DEFAULT 1,
  PRIMARY KEY (bundle_id, sku_id)
);

-- 订单（三维状态解耦）
CREATE TYPE order_type        AS ENUM ('user_purchase','credit','internal_grant','enterprise_grant');
CREATE TYPE audit_status      AS ENUM ('auto_approved','pending_audit','approved','rejected',
                                       'follow_enterprise','enterprise_approved','enterprise_rejected');
CREATE TYPE payment_status    AS ENUM ('no_payment','pending','paid','cancelled','refunded');
CREATE TYPE order_lifecycle   AS ENUM ('pending_effect','active','suspended','expired','cancelled','closed');
CREATE TABLE "order" (
  id                  VARCHAR(32) PRIMARY KEY,
  order_no            VARCHAR(40) UNIQUE NOT NULL,
  customer_type       CHAR(1) NOT NULL,             -- B / C
  customer_id         VARCHAR(32) NOT NULL,
  enterprise_id       VARCHAR(32),                  -- RLS 隔离键，null 表示平台
  linked_enterprise_id VARCHAR(32),                 -- enterprise_grant 跟随对象
  order_type          order_type NOT NULL,
  audit_status        audit_status NOT NULL,
  payment_status      payment_status NOT NULL,
  order_status        order_lifecycle NOT NULL,
  total_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_amount       NUMERIC(12,2) NOT NULL DEFAULT 0,
  effect_at           TIMESTAMPTZ,
  expire_at           TIMESTAMPTZ,
  idempotency_key     VARCHAR(64),
  trace_id            VARCHAR(64),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (customer_id, idempotency_key)
);
CREATE INDEX idx_ord_cust       ON "order"(customer_id);
CREATE INDEX idx_ord_ent        ON "order"(enterprise_id);
CREATE INDEX idx_ord_status     ON "order"(order_status, expire_at);

CREATE TABLE order_item (
  id                VARCHAR(32) PRIMARY KEY,
  order_id          VARCHAR(32) NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  ref_type          VARCHAR(16) NOT NULL,           -- sku / bundle / product
  ref_id            VARCHAR(32) NOT NULL,
  quantity          INT NOT NULL DEFAULT 1,
  unit_price        NUMERIC(12,2)
);

-- 账户与额度
CREATE TABLE entitlement_account (
  id              VARCHAR(32) PRIMARY KEY,
  customer_id     VARCHAR(32) UNIQUE NOT NULL,
  customer_type   CHAR(1) NOT NULL,
  enterprise_id   VARCHAR(32),
  app_ids         TEXT[] NOT NULL DEFAULT '{}',     -- 跨应用聚合
  status          VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE account_capability (
  id              BIGSERIAL PRIMARY KEY,
  account_id      VARCHAR(32) NOT NULL REFERENCES entitlement_account(id),
  capability_id   VARCHAR(32) NOT NULL REFERENCES capability(id),
  rule_id         VARCHAR(32) NOT NULL REFERENCES entitlement_rule(id),
  total_quota     NUMERIC(14,2) NOT NULL DEFAULT 0,
  used_quota      NUMERIC(14,2) NOT NULL DEFAULT 0,
  expire_at       TIMESTAMPTZ,
  source_order_ids TEXT[] NOT NULL DEFAULT '{}',
  version         BIGINT NOT NULL DEFAULT 0,        -- 乐观锁
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (account_id, capability_id, rule_id)
);
CREATE INDEX idx_ac_acct ON account_capability(account_id);
CREATE INDEX idx_ac_cap  ON account_capability(capability_id);

-- 发放快照
CREATE TABLE allocation_record (
  id                VARCHAR(32) PRIMARY KEY,
  order_id          VARCHAR(32) NOT NULL REFERENCES "order"(id),
  item_id           VARCHAR(32) NOT NULL,
  capability_count  INT NOT NULL,
  instance_count    INT NOT NULL,                   -- 实际发放份数
  usage_rate        NUMERIC(5,2),                   -- 历史使用率参考
  allocated_at      TIMESTAMPTZ DEFAULT now()
);

-- 消耗流水（写 ClickHouse 镜像；PG 仅留近 30 日热数据）
CREATE TABLE usage_log (
  id              BIGSERIAL PRIMARY KEY,
  account_id      VARCHAR(32) NOT NULL,
  capability_id   VARCHAR(32) NOT NULL,
  rule_id         VARCHAR(32),
  amount          NUMERIC(12,2) NOT NULL,
  biz_ref         VARCHAR(64),                      -- 业务侧回写 ID
  trace_id        VARCHAR(64),
  occurred_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Outbox（事件投递）
CREATE TABLE event_outbox (
  id              BIGSERIAL PRIMARY KEY,
  topic           VARCHAR(80)  NOT NULL,
  event_id        VARCHAR(64)  UNIQUE NOT NULL,
  partition_key   VARCHAR(64)  NOT NULL,
  payload         JSONB NOT NULL,
  status          VARCHAR(16)  NOT NULL DEFAULT 'PENDING', -- PENDING / SENT / FAILED
  retries         INT NOT NULL DEFAULT 0,
  next_try_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_outbox_status ON event_outbox(status, next_try_at);`}</Pre>
      </Card>

      <Card>
        <H3>RLS 与角色函数</H3>
        <Pre>{`-- 角色枚举
CREATE TYPE app_role AS ENUM ('platform_admin','platform_ops','enterprise_admin','enterprise_user');
CREATE TABLE user_roles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL,
  role      app_role NOT NULL,
  enterprise_id VARCHAR(32),
  UNIQUE (user_id, role, enterprise_id)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Security Definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_user_id AND role=_role);
$$;

-- 订单 RLS：企业人员只能看自己 enterprise_id 的订单；平台角色全开
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
CREATE POLICY p_order_tenant ON "order" FOR SELECT TO authenticated
  USING (
    enterprise_id = current_setting('app.tenant_id', TRUE)
    OR has_role(auth.uid(), 'platform_admin')
    OR has_role(auth.uid(), 'platform_ops')
  );`}</Pre>
      </Card>

      <Card>
        <H3>关键索引与容量估算</H3>
        <Table
          headers={["对象", "预估行数（1 年）", "热点索引", "备注"]}
          cols={["", "120px", "", "150px"]}
          rows={[
            ["order",              "≈ 6,000 万", "(customer_id), (enterprise_id), (status, expire_at)", "按月分区"]as (string | React.ReactNode)[],
            ["order_item",         "≈ 1.5 亿",  "(order_id)", ""],
            ["account_capability", "≈ 1,200 万","(account_id), (capability_id)", "热点行加 version 乐观锁"],
            ["usage_log (PG)",     "近 30 日 ≈ 3 亿", "(account_id, occurred_at)", "全量进 ClickHouse"],
            ["usage_log (CK)",     "全量 ≈ 36 亿", "ORDER BY (account_id, occurred_at)", "MergeTree TTL 18 个月"],
            ["event_outbox",       "≈ 1.5 亿",  "(status, next_try_at)", "已发送 7 日清理"],
          ]}
        />
      </Card>
    </Floor>
  );
}
