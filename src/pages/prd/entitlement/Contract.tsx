import { Mermaid, DesignCard, PrdPageHeader, H } from "@/components/prd/Mermaid";
import { Code2, Radio, ShieldCheck, Cpu } from "lucide-react";

const ORDER_API = `POST /api/v1/orders
Headers:
  Authorization: Bearer <jwt>
  Idempotency-Key: 4f3c7b2a-...      # 60 分钟内幂等
  X-Enterprise-Id: ent_xxx
Body:
{
  "orderType": "user_purchase",      // user_purchase | credit | internal_grant | enterprise_grant
  "customerId": "cust_001",
  "skuId": "sku_pro_month",          // 二选一：skuId / bundleId
  "qty": 1,
  "couponCode": null
}
→ 201 Created
{
  "orderId": "ord_a1b2",
  "auditStatus": "auto_approved",
  "paymentStatus": "pending",
  "orderStatus": "pending_effect",
  "amountCents": 19900,
  "payUrl": "https://pay.../pay/ord_a1b2",
  "expiredAt": "2026-05-09T12:00:00Z"
}
→ 409 Conflict (幂等命中)
{ "code": "IDEM_HIT", "orderId": "ord_a1b2" }`;

const USAGE_API = `POST /api/v1/usage:consume
Headers: Authorization, Idempotency-Key, X-Trace-Id
Body:
{
  "accountId": "acc_001",
  "capabilityCode": "model.render",
  "amount": 3,
  "occurredAt": "2026-05-09T03:21:00Z",
  "context": { "scene": "preview", "modelId": "m_3344" }
}
→ 200 OK
{ "remaining": 197, "resetAt": "2026-06-01T00:00:00Z", "version": 84 }
→ 429 Too Many Requests
{ "code": "QUOTA_EXCEEDED", "remaining": 0 }`;

const GRANTED_AVRO = `{
  "type": "record",
  "name": "EntitlementGranted",
  "namespace": "com.platform.entitlement.v1",
  "fields": [
    { "name": "eventId",      "type": "string" },
    { "name": "occurredAt",   "type": { "type": "long", "logicalType": "timestamp-millis" } },
    { "name": "orderId",      "type": "string" },
    { "name": "enterpriseId", "type": "string" },
    { "name": "customerId",   "type": "string" },
    { "name": "capabilityCode","type":"string" },
    { "name": "deltaQuota",   "type": "long" },
    { "name": "expireAt",     "type": ["null", { "type": "long", "logicalType": "timestamp-millis" }], "default": null },
    { "name": "sourceOrderIds","type": { "type": "array", "items": "string" } },
    { "name": "traceId",      "type": "string" }
  ]
}`;

export default function Contract() {
  return (
    <div className="space-y-6">
      <PrdPageHeader
        eyebrow="PRD · ENTITLEMENT · CONTRACT · v1"
        title="API · 领域事件 · SLO 契约"
        subtitle="对外两类契约：HTTP 写接口（订单/消耗/退款）与 Kafka 领域事件（Outbox 投递）。本节给出可直接 mock 的样例与 Avro Schema，并冻结 SLO/SLI 指标。"
        meta={<span>SDS-2026.05 · v1</span>}
      />

      <section>
        <H icon={Code2}>HTTP API · 关键写接口样例</H>
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">POST /orders · 下单</div>
            <pre className="font-mono text-[11.5px] leading-relaxed overflow-x-auto whitespace-pre">{ORDER_API}</pre>
          </div>
          <div className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">POST /usage:consume · 消耗扣减</div>
            <pre className="font-mono text-[11.5px] leading-relaxed overflow-x-auto whitespace-pre">{USAGE_API}</pre>
          </div>
        </div>
      </section>

      <section>
        <H icon={Radio}>领域事件 · Avro Schema · Topic 规划</H>
        <Mermaid
          caption="Outbox → Relay → Kafka → 下游消费者各自维护 offset"
          chart={`graph LR
  TX[(业务事务)] -->|insert outbox_event| OB[outbox_event]
  REL[Outbox Relay] -->|批拉 + 标记 published_at| OB
  REL --> K[(Kafka<br/>entitlement.order.v1<br/>entitlement.account.v1<br/>entitlement.usage.v1)]
  K --> BI[BI 数仓]
  K --> PRT[画像]
  K --> RSK[风控]
  K --> CRM[CRM]`}
        />
        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">EntitlementGranted · v1</div>
            <pre className="font-mono text-[11.5px] leading-relaxed overflow-x-auto whitespace-pre">{GRANTED_AVRO}</pre>
          </div>
          <div className="rounded-xl border bg-card p-4 text-[12.5px] text-foreground/85 space-y-2" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">事件清单</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>OrderCreated · OrderAuditPassed · OrderPaid · OrderCancelled · OrderRefunded</li>
              <li>EntitlementGranted · EntitlementRevoked · EntitlementExpired</li>
              <li>UsageConsumed · QuotaExceeded · AccountSuspended</li>
              <li>SkuPublished · BundlePublished · RuleVersioned</li>
            </ul>
            <div className="text-[11.5px] text-muted-foreground">所有事件 schema 进 Schema Registry，BACKWARD 兼容；major 变更走新 topic（v2）。</div>
          </div>
        </div>
      </section>

      <section>
        <H icon={ShieldCheck}>SLO / SLI · 工程承诺</H>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40 text-foreground/80">
              <tr>
                <th className="text-left px-3 py-2 font-medium">域</th>
                <th className="text-left px-3 py-2 font-medium">SLI</th>
                <th className="text-left px-3 py-2 font-medium">SLO</th>
                <th className="text-left px-3 py-2 font-medium">告警阈值</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-3 [&_td]:py-2 [&_tr]:border-t">
              <tr><td>下单</td><td>POST /orders P99</td><td>≤ 300 ms</td><td>P99 &gt; 500 ms 持续 3 min</td></tr>
              <tr><td>消耗</td><td>consume P99</td><td>≤ 30 ms</td><td>P99 &gt; 80 ms 持续 1 min</td></tr>
              <tr><td>事件投递</td><td>Outbox→Kafka 时延</td><td>P99 ≤ 5 s</td><td>积压 &gt; 10 k 条</td></tr>
              <tr><td>账户一致性</td><td>对账日终差异</td><td>= 0</td><td>任意差异即 P0</td></tr>
              <tr><td>可用性</td><td>订单服务 30d</td><td>≥ 99.95%</td><td>错误率 &gt; 0.5% / 5min</td></tr>
              <tr><td>容量</td><td>下单 TPS / 消耗 QPS</td><td>1500 / 20000</td><td>水位 &gt; 70%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <H icon={Cpu}>技术栈 · 选型理由（一句话）</H>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <DesignCard code="API" title="Spring Boot 3 · Java 21" tone="primary">虚拟线程承接高并发同步路径，团队栈对齐</DesignCard>
          <DesignCard code="DB" title="PostgreSQL 16" tone="accent">RLS 原生多租户、JSONB 灵活、CDC 成熟</DesignCard>
          <DesignCard code="CACHE" title="Redis 7 · Lua" tone="warning">原子扣减 + 限流 + 滑动窗口</DesignCard>
          <DesignCard code="OLAP" title="ClickHouse" tone="success">usage_log 高吞吐写入 + 实时分析</DesignCard>
          <DesignCard code="MQ" title="Kafka + Schema Registry" tone="primary">Outbox 至少一次投递，下游解耦</DesignCard>
          <DesignCard code="OBS" title="OpenTelemetry · Loki · Tempo" tone="secondary">trace_id 贯穿订单 → 发放 → 消耗</DesignCard>
          <DesignCard code="CDC" title="Debezium" tone="accent">PG → Kafka → CH 数仓同步</DesignCard>
          <DesignCard code="SEC" title="OAuth2 + JWT · enterprise_id claim" tone="warning">RLS session var 注入</DesignCard>
        </div>
      </section>
    </div>
  );
}
