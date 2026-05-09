import { Mermaid, DesignCard, PrdPageHeader, TriBox, H } from "@/components/prd/Mermaid";
import { Activity, GitBranch, Workflow, ShieldAlert, Repeat } from "lucide-react";

export default function Runtime() {
  return (
    <div className="space-y-6">
      <PrdPageHeader
        eyebrow="PRD · ENTITLEMENT · RUNTIME · v1"
        title="运行时与状态机 · 三维订单 + 主链路 SOP"
        subtitle="把订单从「下单 → 审核 → 支付 → 生效 → 消耗 → 失效」拆成 3 个互不耦合的维度，分别解决「能不能做、付没付钱、现在啥状态」三个独立问题；再以 5 条 SOP 描述跨域协作。"
        meta={<span>SDS-2026.05 · v1</span>}
      />

      <section id="rt-3d" className="scroll-mt-4">
        <H icon={GitBranch}>三维订单状态机 · 互不耦合 · 各自演进</H>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          <DesignCard code="D1" title="维度一 · 审核 auditStatus" tone="primary">
            <div className="font-mono text-[11.5px] leading-6">
              auto_approved（付费/积分自动放行）<br/>
              pending_audit（内部赠送待审）<br/>
              approved / rejected<br/>
              follow_enterprise（跟随母单）
            </div>
            <div className="mt-1 text-[12px]">回答：<b>能不能做</b></div>
          </DesignCard>
          <DesignCard code="D2" title="维度二 · 支付 paymentStatus" tone="warning">
            <div className="font-mono text-[11.5px] leading-6">
              no_payment（赠送 / 积分）<br/>
              pending → paid → refunded / failed<br/>
              partial_refunded
            </div>
            <div className="mt-1 text-[12px]">回答：<b>钱付没付</b></div>
          </DesignCard>
          <DesignCard code="D3" title="维度三 · 生命周期 orderStatus" tone="success">
            <div className="font-mono text-[11.5px] leading-6">
              pending_effect（已审已付未生效）<br/>
              active → suspended → expired<br/>
              cancelled / closed
            </div>
            <div className="mt-1 text-[12px]">回答：<b>现在啥状态</b></div>
          </DesignCard>
        </div>
        <Mermaid
          caption="三个维度各自独立流转，仅在「均就绪」时才触发 GrantSvc 写账户"
          chart={`stateDiagram-v2
  direction LR
  state Audit {
    [*] --> auto_approved
    [*] --> pending_audit
    pending_audit --> approved: 平台审核通过
    pending_audit --> rejected: 驳回
    [*] --> follow_enterprise
  }
  state Payment {
    [*] --> no_payment
    [*] --> pending
    pending --> paid: 支付成功
    pending --> failed: 超时/失败
    paid --> refunded: 退款
    paid --> partial_refunded: 部分退款
  }
  state Lifecycle {
    [*] --> pending_effect
    pending_effect --> active: 审核+支付双就绪
    active --> suspended: 风控/欠费
    active --> expired: 到期
    active --> cancelled: 取消
  }`}
        />
      </section>

      <section id="rt-sop" className="scroll-mt-4">
        <H icon={Workflow}>主链路 SOP · 5 条端到端流程</H>
        <Mermaid
          caption="SOP-1 用户付费购买 SKU"
          chart={`sequenceDiagram
  autonumber
  participant U as 用户
  participant FE as 前端
  participant ORD as 订单服务
  participant PAY as 支付网关
  participant GRT as Grant 服务
  participant ACC as 账户服务
  participant MQ as Kafka(Outbox)
  U->>FE: 选 SKU + 下单
  FE->>ORD: POST /orders (Idempotency-Key)
  ORD->>ORD: 校验 SKU active + 价格快照
  ORD->>ORD: 写 orders(audit=auto_approved, pay=pending, life=pending_effect)
  ORD-->>FE: 201 + payUrl
  U->>PAY: 完成支付
  PAY->>ORD: 异步回调 paid
  ORD->>ORD: pay→paid; life→active
  ORD->>GRT: GrantRequested(order_id)
  GRT->>ACC: upsert account_capability(+quota, sourceOrderIds+=)
  ACC-->>GRT: ok(version+1)
  GRT->>MQ: Outbox: EntitlementGranted
  MQ-->>BI/画像: 消费`}
        />
        <Mermaid
          caption="SOP-2 内部赠送（需审核）"
          chart={`sequenceDiagram
  autonumber
  participant OP as 运营
  participant ORD as 订单
  participant AUD as 审核
  participant GRT as Grant
  participant ACC as 账户
  OP->>ORD: 创建 internal_grant 订单
  ORD->>ORD: audit=pending_audit, pay=no_payment, life=pending_effect
  ORD->>AUD: 推送待审
  AUD->>ORD: 审批通过 → audit=approved
  ORD->>ORD: life→active
  ORD->>GRT: GrantRequested
  GRT->>ACC: 写额度`}
        />
        <Mermaid
          caption="SOP-3 企业入驻 enterprise_grant（跟随母单）"
          chart={`sequenceDiagram
  autonumber
  participant ENT as 企业入驻
  participant PORD as 母订单(平台审批)
  participant CORD as 子订单(各成员)
  ENT->>PORD: 入驻申请通过 → 母单 active
  PORD->>CORD: 派生子单 audit=follow_enterprise
  CORD->>CORD: 母单变更 → 子单同步`}
        />
        <Mermaid
          caption="SOP-4 消耗扣减（高频热路径）"
          chart={`sequenceDiagram
  autonumber
  participant APP as 应用 API
  participant USG as Usage 服务
  participant RDS as Redis(Lua)
  participant DB as PG(account_capability)
  participant CH as ClickHouse
  APP->>USG: consume(account_id, cap, amount, trace_id)
  USG->>RDS: EVAL Lua: 原子扣减 + 限流
  RDS-->>USG: ok / quota_exceeded
  USG->>DB: 异步 CAS 落账(version)
  USG->>CH: 异步写 usage_log
  USG-->>APP: 200 / 429`}
        />
        <Mermaid
          caption="SOP-5 退款 / 撤销发放"
          chart={`sequenceDiagram
  autonumber
  participant FIN as 财务
  participant ORD as 订单
  participant GRT as Grant
  participant ACC as 账户
  FIN->>ORD: refund(order_id)
  ORD->>ORD: pay→refunded; life→cancelled
  ORD->>GRT: RevokeRequested
  GRT->>ACC: 回滚额度(若已消耗→记账负债)
  GRT->>MQ: EntitlementRevoked`}
        />
      </section>

      <section id="rt-cc" className="scroll-mt-4">
        <H icon={Repeat}>幂等 · 并发 · 一致性</H>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DesignCard code="IDEM" title="幂等三件套" tone="primary">
            • 写接口必带 <code className="font-mono text-primary">Idempotency-Key</code>，60 分钟去重<br/>
            • 订单去重键：<code className="font-mono text-primary">(customer_id, sku_id, idem_key)</code> 唯一索引<br/>
            • 发放去重键：<code className="font-mono text-primary">(order_id, capability_id)</code> 唯一索引
          </DesignCard>
          <DesignCard code="CC" title="并发与一致性" tone="warning">
            • 热路径：Redis Lua 原子扣减 + 限流<br/>
            • 落账：DB 行级 <code className="font-mono text-primary">version</code> CAS 乐观锁<br/>
            • 跨域：Outbox + Relay，Kafka 至少投递一次，下游去重
          </DesignCard>
        </div>
        <div className="mt-3 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <TriBox
            inputs={["订单事件（GrantRequested / RevokeRequested）", "消耗请求（cap, amount, trace_id）"]}
            outputs={["account_capability 变更", "usage_log 行", "Kafka 领域事件"]}
            forbidden="禁止跨域直写账户表；禁止旁路 Outbox 直发 Kafka；禁止热路径写主库长事务"
          />
        </div>
      </section>

      <section id="rt-fail" className="scroll-mt-4">
        <H icon={ShieldAlert}>异常与回滚</H>
        <div className="rounded-xl border bg-amber-50/60 border-amber-200 p-4">
          <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-5">
            <li>支付回调超时：T+24h 自动 cancel；冲正机制由对账日终触发</li>
            <li>Grant 失败：进 DLQ 重试 3 次 → 人工介入工单；订单进入 grant_failed 子状态</li>
            <li>退款时已消耗超出余额：写 negative_balance 负债账，财务月结追扣</li>
            <li>母单变更未同步子单：补偿任务每 5 min 扫描 follow_enterprise 漂移并修复</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
