import { Mermaid, DesignCard, PrdPageHeader, TriBox, H } from "@/components/prd/Mermaid";
import { useState } from "react";
import { Network, Layers, Shield, MousePointerClick, GitBranch } from "lucide-react";

type Key = "APP" | "CAP" | "RUL" | "PRD" | "SKU" | "ORD" | "ACC" | "EVT";
const NODES: Record<Key, { label: string; layer: string; role: string; inputs: string[]; outputs: string[]; forbidden: string }> = {
  APP: { label: "应用 App", layer: "L1 边界层", role: "权益隔离的最大边界，多租户切片的根",
    inputs: ["接入登记（域名 + 业务 API 列表）"], outputs: ["AppCreated 事件", "RLS tenant key"],
    forbidden: "禁止跨 App 共享额度账目；禁止用 App 表达「功能开关」" },
  CAP: { label: "能力 Capability", layer: "L2 技术层", role: "能力点 + API 绑定 + 数据类型 + 消耗系数",
    inputs: ["业务 API 路径", "数据类型 COUNTER/BOOLEAN/STORAGE/DURATION"], outputs: ["可被规则引用的能力句柄"],
    forbidden: "禁止把业务流程写在能力里；禁止持有客户状态" },
  RUL: { label: "规则 Rule", layer: "L2 业务层", role: "额度 + 周期 + 派生策略，最小可发放单元",
    inputs: ["能力 + 额度 + periodType"], outputs: ["派生 grantType / expirePolicy"],
    forbidden: "禁止用户单独覆盖派生策略（后端强制 deriveRulePolicy）" },
  PRD: { label: "权益产品 Product", layer: "L3 封装层", role: "面向交易的封装，关联多 Rule（N:M）",
    inputs: ["规则集合", "兑换方式 paid/credit/free"], outputs: ["ProductPublished 事件"],
    forbidden: "已被在售 SKU 引用时禁止删除规则关联" },
  SKU: { label: "商品 SKU / 套餐", layer: "L3 销售层", role: "可独立售卖单元，含价格 + 计费周期",
    inputs: ["权益产品（仅 paid+active）", "价格 / 计费周期"], outputs: ["SkuOnSale 事件"],
    forbidden: "在售商品价格变更走审批；禁止跳过权益产品直挂规则" },
  ORD: { label: "订单 Order", layer: "L4 履约层", role: "三维状态机：审核 / 支付 / 生命周期",
    inputs: ["客户 + 商品 + 幂等键"], outputs: ["Order* 事件族", "履约信号 Grant"],
    forbidden: "不允许跨域直写账户；状态变更必须通过状态机" },
  ACC: { label: "账户 Account", layer: "L4 履约层", role: "客户聚合视图，跨应用持有 account_capability",
    inputs: ["来自订单的发放信号"], outputs: ["AccountAggregated 事件", "可消耗额度"],
    forbidden: "禁止旁路状态机直写额度；禁止跳过 sourceOrderIds 写入" },
  EVT: { label: "事件总线 Kafka", layer: "L5 数据层", role: "Outbox + Relay 至少投递一次",
    inputs: ["业务事务 outbox 写入"], outputs: ["BI / 画像 / 风控 / CRM 消费"],
    forbidden: "禁止业务代码直发 Kafka，必须经 Outbox" },
};

export default function Blueprint() {
  const [active, setActive] = useState<Key>("ORD");
  const node = NODES[active];

  return (
    <div className="space-y-6">
      <PrdPageHeader
        eyebrow="PRD · ENTITLEMENT · BLUEPRINT · v1"
        title="系统蓝图 · 5 层架构 + 双视角 + 四种交易模式"
        subtitle="把权益域的全量系统视图一张图讲清楚。L1 边界 → L2 能力/规则 → L3 产品/商品 → L4 订单/账户 → L5 事件/数据，配合「平台 vs 企业」双视角，承载「付费/积分/内部/企业入驻」四种交易模式。"
        meta={<span>SDS-2026.05 · v1</span>}
      />

      <section>
        <H icon={Network}>全量架构图 · 5 层 + 双视角</H>
        <Mermaid
          caption="配置侧（蓝）→ 履约侧（绿）→ 数据侧（紫）；横向虚线为双视角访问边界"
          chart={`graph TB
  BOSS["👤 平台运营 / 客成 / 财务<br/>配置 · 审核 · 对账"]
  TENANT["🏢 企业管理员 / 自然人<br/>下单 · 兑换 · 查账"]

  subgraph L1["L1 · 边界层"]
    APP["应用 App<br/>多租户隔离根"]
  end
  subgraph L2["L2 · 配置侧 · 能力 / 规则"]
    CAP["能力 Capability<br/>API 绑定"]
    RUL["规则 Rule<br/>额度 + 周期 + 派生"]
  end
  subgraph L3["L3 · 配置侧 · 产品 / 商品"]
    PRD["权益产品 Product<br/>N:M 引用规则"]
    SKU["商品 SKU"]
    BUN["套餐 Bundle"]
  end
  subgraph L4["L4 · 履约侧 · 订单 / 账户"]
    ORD["订单 Order<br/>三维状态机"]
    ACC["账户 Account<br/>跨应用聚合"]
    LOG["消耗 Usage Log"]
  end
  subgraph L5["L5 · 数据侧 · 事件 / 智能"]
    EVT["事件总线 Kafka<br/>Outbox"]
    BI["BI · 画像 · 风控"]
  end

  BOSS -->|平台视角全开| L2
  BOSS -->|审核 / 对账| ORD
  TENANT -->|RLS 限本企业| ORD
  TENANT -->|RLS 限本企业| ACC

  APP --> CAP --> RUL
  RUL -.N:M.-> PRD
  PRD -.N:M.-> SKU
  SKU --> BUN
  SKU --> ORD
  BUN --> ORD
  ORD --> ACC
  ACC --> LOG
  ORD --> EVT
  ACC --> EVT
  LOG --> EVT
  EVT --> BI

  classDef cfg  fill:#eef2ff,stroke:#3b5bdb,color:#1e3a8a
  classDef ful  fill:#ecfdf5,stroke:#10b981,color:#065f46
  classDef data fill:#faf5ff,stroke:#a855f7,color:#581c87
  class APP,CAP,RUL,PRD,SKU,BUN cfg
  class ORD,ACC,LOG ful
  class EVT,BI data`}
        />
      </section>

      <section>
        <H icon={MousePointerClick}>节点导览 · 点击查看输入 / 输出 / 禁区</H>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {(Object.keys(NODES) as Key[]).map(k => {
            const n = NODES[k];
            const on = active === k;
            return (
              <button key={k} onClick={() => setActive(k)}
                className={`text-left rounded-md p-2.5 transition border ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/80 hover:bg-muted/40"}`}>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{n.layer}</div>
                <div className={`text-[12px] font-semibold mt-0.5 ${on ? "text-primary" : "text-foreground"}`}>{n.label}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-3 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-baseline gap-3 flex-wrap mb-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{node.layer}</span>
            <span className="text-[15px] font-semibold text-primary">{node.label}</span>
            <span className="text-[12px] text-foreground/85">— {node.role}</span>
          </div>
          <TriBox inputs={node.inputs} outputs={node.outputs} forbidden={node.forbidden} />
        </div>
      </section>

      <section>
        <H icon={Shield}>四种交易模式 · 同一组三维状态机的 4 种入口</H>
        <Mermaid
          caption="付费 / 积分 / 内部 / 企业入驻 → 三维状态机分支"
          chart={`flowchart LR
  P["💳 user_purchase<br/>用户付费"] -->|auto_approved| AS
  C["🎁 credit<br/>积分兑换"] -->|auto_approved| AS
  I["🛠 internal_grant<br/>内部赠送"] -->|pending_audit| AS
  E["🏢 enterprise_grant<br/>企业入驻"] -->|follow_enterprise| AS
  AS["audit"] --> PS["payment"]
  PS --> LS["lifecycle<br/>pending_effect → active → expired"]
  LS --> G["GrantSvc 写 account_capability"]
  G --> EV["Kafka EntitlementGranted"]
  classDef p fill:#eef2ff,stroke:#3b5bdb,color:#1e3a8a
  classDef c fill:#fef3c7,stroke:#d97706,color:#78350f
  classDef i fill:#ffedd5,stroke:#ea580c,color:#7c2d12
  classDef e fill:#ecfdf5,stroke:#10b981,color:#065f46
  class P p
  class C c
  class I i
  class E e`}
        />
      </section>

      <section>
        <H icon={Layers}>双视角访问控制（平台 / 企业）</H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DesignCard code="PLATFORM" title="平台视角（运营 / 客成 / 财务）" tone="primary">
            • 全量看：所有企业 / 客户的账户、消耗、对账<br />
            • 全量配：应用 / 能力 / 规则 / 产品 / SKU / 套餐<br />
            • 关键操作：审核 internal_grant、冻结/解冻账户、退款<br />
            • 通过 has_role(auth.uid(),'platform_admin') 旁路 RLS
          </DesignCard>
          <DesignCard code="TENANT" title="企业视角（企业管理员 / 自然人）" tone="success">
            • 仅看本企业（含子级）的账户与订单<br />
            • 不可见配置侧（除非被授予 platform.entitlement.* 权限）<br />
            • PG RLS 强制按 enterprise_id 过滤<br />
            • 下单 / 付费 / 兑换 / 查消耗 / 导出本企业明细
          </DesignCard>
        </div>
      </section>

      <section>
        <H icon={GitBranch}>关键架构约束（Inviolable Rules）</H>
        <div className="rounded-xl border bg-amber-50/60 border-amber-200 p-4">
          <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-5">
            <li>额度变更必须经过<b>账户域</b>，禁止跨域直写 account_capability</li>
            <li>所有发放/消耗以 <code className="font-mono text-primary">order_id + trace_id</code> 幂等，DB 唯一索引兜底</li>
            <li>RLS 按 <code className="font-mono text-primary">enterprise_id</code> 强制隔离；平台账号通过 has_role 旁路</li>
            <li>领域事件统一通过 <b>Outbox 模式</b> 投递 Kafka，禁止业务代码直发</li>
            <li>所有写接口必须支持 <code className="font-mono text-primary">Idempotency-Key</code> 头，60 分钟去重</li>
            <li>主库与 Redis 不允许出现长事务（&gt; 200 ms），需异步化</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
