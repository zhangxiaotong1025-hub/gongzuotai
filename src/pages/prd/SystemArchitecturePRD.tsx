import { Building2, Package, Zap, Boxes, ListTree, FileText, Wallet, Activity, Network, Workflow, Database, GitBranch, ShieldCheck, Layers } from "lucide-react";
import { Mermaid, PrdPageHeader, DesignCard, H } from "@/components/prd/Mermaid";
import { Card, Tag, KV, Table, H3, H4, Code, Floor } from "./entitlement/parts";

/* ─────────────────────── 顶层系统架构总览 PRD ─────────────────────── */

const ENTITY_REL = `
flowchart LR
  subgraph TENANT["租户域 · Tenant"]
    ENT[("企业 Enterprise<br/>租户唯一身份")]
    STAFF["人员 Staff<br/>多企业归属"]
    ROLE["角色 Role<br/>菜单·按钮·数据权限"]
  end

  subgraph CATALOG["产品目录域 · Catalog"]
    APP["应用 App<br/>权益挂载点"]
    CAP["能力 Capability<br/>apiPath + dataType"]
    RULE["规则 Rule<br/>quota·period·scope"]
    EPROD["权益产品 EProduct<br/>规则集合"]
    SKU["商品 SKU<br/>价格×期限"]
    PKG["套餐 Bundle<br/>SKU 组合"]
  end

  subgraph TXN["交易与运行域 · Runtime"]
    ORDER["订单 Order<br/>分发唯一入口"]
    ACCT["权益账户 Account<br/>customer × app 聚合"]
    USAGE["消耗事件 UsageEvent"]
  end

  ENT -- "归属" --> STAFF
  ENT -- "授予角色" --> ROLE
  ROLE -. "可见菜单/按钮/数据" .-> APP

  APP --> CAP
  CAP --> RULE
  RULE --> EPROD
  EPROD --> SKU
  SKU --> PKG

  ENT == "购买/被授予" ==> ORDER
  SKU == "商品行" ==> ORDER
  PKG == "套餐行" ==> ORDER
  ORDER == "落账·扇出额度" ==> ACCT
  ACCT == "扣减" ==> USAGE
  USAGE -. "回写余额/健康度" .-> ACCT

  classDef tenant fill:#eef2ff,stroke:#3b5bdb,color:#1e293b;
  classDef catalog fill:#f0fdf4,stroke:#10b981,color:#064e3b;
  classDef txn fill:#fef3c7,stroke:#d97706,color:#78350f;
  class ENT,STAFF,ROLE tenant
  class APP,CAP,RULE,EPROD,SKU,PKG catalog
  class ORDER,ACCT,USAGE txn
`;

const DATA_FLOW = `
flowchart TB
  A[运营配置应用/能力/规则] --> B[组装权益产品 EProduct]
  B --> C{选择售卖形态}
  C -->|单卖| D[发布 SKU]
  C -->|组合| E[发布 Bundle]
  D --> F[订单 Order]
  E --> F
  F -->|user_purchase| G1[用户购买]
  F -->|enterprise_grant| G2[平台授予企业]
  F -->|internal_grant| G3[企业内部分发]
  G1 --> H[落账到 Account]
  G2 --> H
  G3 --> H
  H --> I[运行时消费 UsageEvent]
  I --> J[健康度 / 续费提醒]
  I --> K[BI 事实表 fact_usage_daily]
  J -.续费.-> F
`;

const LIFECYCLE = `
flowchart LR
  CFG([配置态<br/>App/Cap/Rule/EProduct]) --> PUB([上架态<br/>SKU/Bundle])
  PUB --> ORD([交易态<br/>Order: audit×pay×lifecycle])
  ORD --> ACC([账户态<br/>Account 余额/期限])
  ACC --> EVT([运行态<br/>Usage 扣减/审计])
  EVT --> END([终态<br/>到期/退款/冻结])
  ENT([企业状态<br/>启用/禁用/审核]) -. 联动冻结 .-> ACC
  ENT -. 联动失效 .-> ORD
`;

const RLS_MATRIX: (string | React.ReactNode)[][] = [
  ["平台管理员", "全域读写", "全部企业", "全部订单", "全部账户", "全部消费"],
  ["企业管理员", "本企业读写", <Code>enterprise_id = self</Code>, <Code>buyer_enterprise_id = self</Code>, <Code>customer.enterprise_id = self</Code>, "本企业账户的消费"],
  ["企业员工",   "本人/本部门",   "—",                "本人订单",          "本人账户",          "本人消费"],
  ["C 端用户",   "本人",         "—",                "本人订单",          "本人账户",          "本人消费"],
];

export default function SystemArchitecturePRD() {
  return (
    <div className="space-y-8 max-w-[1180px] mx-auto">
      <PrdPageHeader
        eyebrow="System · Top-level Architecture"
        title="系统顶层架构总览"
        subtitle={<>把<b className="text-foreground">企业 · 产品 · 能力 · 规则 · 订单 · 账户</b>放在一张图里——讲清楚每个域的职责、它们的耦合方式、以及数据如何在域之间流动。本页是阅读所有下游 PRD 的前置说明。</>}
        meta="v1.0 · 2026-05-12"
      />

      {/* —— 1. 设计公理 —— */}
      <Floor id="axioms">
        <H icon={ShieldCheck}>一、七条设计公理</H>
        <div className="grid md:grid-cols-2 gap-3">
          <DesignCard code="AX-01" title="企业是唯一租户身份" tone="primary">
            所有业务数据必须带 <Code>enterprise_id</Code>。"平台" 也是一个企业（<Code>ent-platform</Code>），从而把"平台 vs 企业"统一在一套数据模型里。
          </DesignCard>
          <DesignCard code="AX-02" title="产品是第一权限维度" tone="primary">
            权限不是按"模块"切，而是按"应用/产品"切。一家企业开通了什么应用 + 拥有什么权益账户，决定了它看得见什么、能做什么。
          </DesignCard>
          <DesignCard code="AX-03" title="订单是分发唯一入口" tone="accent">
            任何权益变更（购买、赠送、平台授予、内部分配）都必须走订单。没有"绕开订单的直接发放"。
          </DesignCard>
          <DesignCard code="AX-04" title="账户按 customer × app 聚合" tone="accent">
            同一用户在同一应用下的所有订单合并为一个账户，<Code>sourceOrderIds[]</Code> 反向溯源；解决"一人多单"的余额混乱。
          </DesignCard>
          <DesignCard code="AX-05" title="状态三维解耦" tone="warning">
            订单状态 = <Code>auditStatus × paymentStatus × orderStatus</Code>，互不替代。一个枚举说不清的事，就用三个枚举。
          </DesignCard>
          <DesignCard code="AX-06" title="配置 / 交易 / 运行三层隔离" tone="warning">
            配置层（App/Cap/Rule）可改不可删；交易层（Order）写一次永不改；运行层（Account/Usage）只追加事件。三层用快照而非引用耦合。
          </DesignCard>
          <DesignCard code="AX-07" title="企业状态联动一切" tone="success">
            企业被禁用/冻结/解散时，下游订单、账户、人员、品牌按既定级联策略冻结，不会出现"企业没了但账户还在扣"的孤儿数据。
          </DesignCard>
        </div>
      </Floor>

      {/* —— 2. 实体关系全景 —— */}
      <Floor id="entity">
        <H icon={Network}>二、实体关系全景图</H>
        <p className="text-[13px] text-muted-foreground leading-[1.85]">
          九个核心实体被划入三个域：<b className="text-foreground">租户域</b>（谁来用）、<b className="text-foreground">产品目录域</b>（卖什么）、<b className="text-foreground">交易与运行域</b>（怎么用）。
          域内强耦合（设计/发布同步），域间通过订单与事件弱耦合（异步、可重放）。
        </p>
        <Mermaid chart={ENTITY_REL} caption="Three Domains · Nine Entities" />

        <div className="grid md:grid-cols-3 gap-3 mt-2">
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2"><Building2 className="h-4 w-4 text-primary" /><b className="text-[13.5px]">租户域</b></div>
            <div className="text-[12px] text-muted-foreground leading-[1.8]">企业 / 人员 / 角色。回答"<b className="text-foreground">谁</b>"。<br/>核心约束：人员可属多企业，角色仅在单企业内有效。</div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2"><Boxes className="h-4 w-4 text-emerald-500" /><b className="text-[13.5px]">产品目录域</b></div>
            <div className="text-[12px] text-muted-foreground leading-[1.8]">应用 / 能力 / 规则 / 权益产品 / SKU / 套餐。回答"<b className="text-foreground">卖什么</b>"。<br/>核心约束：能力的 <Code>dataType</Code> 不可变，规则的额度可变但需版本化。</div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2"><Wallet className="h-4 w-4 text-amber-500" /><b className="text-[13.5px]">交易与运行域</b></div>
            <div className="text-[12px] text-muted-foreground leading-[1.8]">订单 / 权益账户 / 消耗事件。回答"<b className="text-foreground">怎么用</b>"。<br/>核心约束：订单不可改、账户只增余额事件、消耗仅追加。</div>
          </Card>
        </div>
      </Floor>

      {/* —— 3. 数据流：从配置到消费 —— */}
      <Floor id="flow">
        <H icon={Workflow}>三、数据流：从配置到消费</H>
        <p className="text-[13px] text-muted-foreground leading-[1.85]">
          一条权益从被"想出来"到被"用掉"，要穿越 5 个阶段。每个阶段的数据形态、写入方、消费方都不同。
        </p>
        <Mermaid chart={DATA_FLOW} caption="Config → Catalog → Order → Account → Usage" />

        <H3>5 阶段流转表</H3>
        <Table
          headers={["阶段", "形态", "操作主体", "下游消费方", "可逆性"]}
          rows={[
            ["① 配置", "App / Cap / Rule", "平台运营", "权益产品装配", "可改（版本化）"],
            ["② 上架", "SKU / Bundle", "平台运营", "订单选品", "可下架不可删"],
            ["③ 交易", "Order（三维状态）", "用户/平台/企业管理员", "落账逻辑", <span><b className="text-foreground">不可改</b>，只能退款/作废生成新单</span>],
            ["④ 落账", "Account 余额/期限", "系统自动", "运行时校验", "随订单状态联动"],
            ["⑤ 消费", "UsageEvent（追加）", "终端调用", "BI 事实表 / 健康度", <span><b className="text-foreground">仅追加</b>，撤销靠补偿事件</span>],
          ]}
        />
      </Floor>

      {/* —— 4. 生命周期联动 —— */}
      <Floor id="lifecycle">
        <H icon={GitBranch}>四、生命周期联动</H>
        <p className="text-[13px] text-muted-foreground leading-[1.85]">
          所有实体并非独立死活——企业状态会沿订单向下游级联：企业被禁用 → 该企业作为 buyer 的订单被标记 <Code>frozen</Code> → 关联账户停止扣减 → 但<b className="text-foreground">不删除历史数据</b>，仅冻结写入。
        </p>
        <Mermaid chart={LIFECYCLE} caption="Cascade Freezing across Domains" />

        <div className="grid md:grid-cols-2 gap-3 mt-2">
          <Card className="!p-4">
            <H4>正向流（创建/激活）</H4>
            <KV items={[
              { k: "企业入驻", v: <>审核通过 → 自动开通基础应用 → 初始化空账户</> },
              { k: "运营配置", v: <>能力上架 → 规则版本化 → 权益产品装配</> },
              { k: "用户下单", v: <>订单创建 → 审核+支付双通过 → 账户扇出额度</> },
              { k: "运行消费", v: <>调用 API → 扣减 Account → 落 UsageEvent</> },
            ]} />
          </Card>
          <Card className="!p-4">
            <H4>逆向流（冻结/终止）</H4>
            <KV items={[
              { k: "企业禁用", v: <>buyer 订单冻结 → 账户停扣 → 人员标记离职</> },
              { k: "订单退款", v: <>原单状态变更 → 生成补偿订单 → 账户回滚</> },
              { k: "账户到期", v: <>余额归零 → 不删除 → 续费时合并 sourceOrderIds</> },
              { k: "能力下线", v: <>停止新规则引用 → 存量账户继续消费至到期</> },
            ]} />
          </Card>
        </div>
      </Floor>

      {/* —— 5. 数据安全与隔离 —— */}
      <Floor id="rls">
        <H icon={ShieldCheck}>五、租户隔离矩阵（RLS）</H>
        <p className="text-[13px] text-muted-foreground leading-[1.85]">
          所有跨表查询都强制带租户上下文。下表为 4 类主体的可见范围；Postgres 层通过 <Code>SECURITY DEFINER</Code> 函数 + 行级策略实现。
        </p>
        <Table
          headers={["主体", "本企业数据", "企业表", "订单表", "账户表", "消费事件"]}
          rows={RLS_MATRIX}
          cols={["120px", "auto", "auto", "auto", "auto", "auto"]}
        />
      </Floor>

      {/* —— 6. 三层独立演进 —— */}
      <Floor id="layers">
        <H icon={Layers}>六、为什么坚持三层隔离</H>
        <div className="grid md:grid-cols-3 gap-3">
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2"><Tag tone="info">配置层</Tag></div>
            <div className="text-[12.5px] text-foreground/90 leading-[1.85]">
              <b>可变性最高</b>：运营每天都在调规则、改文案、上下架 SKU。<br/>
              <b>策略</b>：所有引用走快照（订单写入时拷贝规则 JSON），配置变更不影响历史订单。
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2"><Tag tone="warning">交易层</Tag></div>
            <div className="text-[12.5px] text-foreground/90 leading-[1.85]">
              <b>不可变</b>：订单一旦创建，字段不允许任何修改，只能通过<b className="text-foreground">补偿订单</b>纠正。<br/>
              <b>策略</b>：三维状态机解耦，审计可追，财务可对账。
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex items-center gap-2 mb-2"><Tag tone="success">运行层</Tag></div>
            <div className="text-[12.5px] text-foreground/90 leading-[1.85]">
              <b>高 QPS</b>：消费事件每秒上千次写入。<br/>
              <b>策略</b>：30s L2 弱一致缓存校验额度，月度 BI 对账兜底；事件仅追加，删除靠补偿。
            </div>
          </Card>
        </div>
      </Floor>

      {/* —— 7. 阅读地图 —— */}
      <Floor id="map">
        <H icon={FileText}>七、阅读地图</H>
        <p className="text-[13px] text-muted-foreground leading-[1.85]">
          本页是<b className="text-foreground">总览</b>，每个域有自己的详细 PRD：
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <Card className="!p-4">
            <H4>租户域</H4>
            <ul className="text-[12.5px] text-foreground/90 leading-[1.9] list-disc pl-5">
              <li><a href="/prd/enterprise" className="text-primary hover:underline">企业管理 PRD</a> — 6 类企业、入驻审核、级联冻结</li>
              <li>人员管理（后台创建+短信下发，不走申请期）</li>
              <li>权限管理（菜单 / 角色 / 策略三件套）</li>
            </ul>
          </Card>
          <Card className="!p-4">
            <H4>产品目录 + 交易运行域</H4>
            <ul className="text-[12.5px] text-foreground/90 leading-[1.9] list-disc pl-5">
              <li><a href="/prd/entitlement" className="text-primary hover:underline">权益管理 PRD</a> — 8 大模块，配置→订单→账户→消费</li>
              <li>订单三维状态矩阵、账户跨应用聚合</li>
              <li>消费事件扇出 / BI 事实表沉淀</li>
            </ul>
          </Card>
        </div>
      </Floor>

      <div className="text-center text-[12px] text-muted-foreground py-6 border-t mt-6">
        — 顶层总览 · 任何下游 PRD 变更需先回到此页校验是否破坏公理 —
      </div>
    </div>
  );
}
