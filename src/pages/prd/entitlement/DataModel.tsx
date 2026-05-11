import { Mermaid, DesignCard, PrdPageHeader, H } from "@/components/prd/Mermaid";
import { Database, Layers, Users, BarChart3 } from "lucide-react";

const DDL = `-- ============================================================
-- 1. 配置侧（应用 / 能力 / 规则 / 产品 / SKU / 套餐）
-- ============================================================
CREATE TABLE entitlement_app (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(64) UNIQUE NOT NULL,
  name          VARCHAR(128) NOT NULL,
  domain        VARCHAR(255),
  status        VARCHAR(16) DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE entitlement_capability (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id        UUID NOT NULL REFERENCES entitlement_app(id),
  code          VARCHAR(64) NOT NULL,
  name          VARCHAR(128) NOT NULL,
  data_type     VARCHAR(16) NOT NULL,  -- COUNTER / BOOLEAN / STORAGE / DURATION
  unit          VARCHAR(16),
  api_paths     TEXT[],
  ratio         NUMERIC(10,4) DEFAULT 1,
  status        VARCHAR(16) DEFAULT 'active',
  UNIQUE(app_id, code)
);
CREATE INDEX idx_cap_app ON entitlement_capability(app_id);

CREATE TABLE entitlement_rule (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES entitlement_capability(id),
  name          VARCHAR(128) NOT NULL,
  quota         BIGINT NOT NULL,
  period_type   VARCHAR(16) NOT NULL,  -- ONCE / DAILY / MONTHLY / YEARLY / FOREVER
  grant_type    VARCHAR(16) NOT NULL,  -- 派生：renewable / oneoff / cumulative
  expire_policy VARCHAR(16) NOT NULL,  -- 派生：rolling / fixed / never
  status        VARCHAR(16) DEFAULT 'active'
);

CREATE TABLE entitlement_product (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(64) UNIQUE NOT NULL,
  name          VARCHAR(128) NOT NULL,
  redeem_type   VARCHAR(16) NOT NULL,  -- paid / credit / free
  status        VARCHAR(16) DEFAULT 'draft'
);

CREATE TABLE entitlement_product_rule (
  product_id    UUID REFERENCES entitlement_product(id) ON DELETE CASCADE,
  rule_id       UUID REFERENCES entitlement_rule(id),
  PRIMARY KEY(product_id, rule_id)
);

CREATE TABLE entitlement_sku (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES entitlement_product(id),
  code          VARCHAR(64) UNIQUE NOT NULL,
  price_cents   BIGINT NOT NULL,
  billing_cycle VARCHAR(16) NOT NULL,
  status        VARCHAR(16) DEFAULT 'draft',
  CHECK (price_cents >= 0)
);

CREATE TABLE entitlement_bundle (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          VARCHAR(64) UNIQUE NOT NULL,
  name          VARCHAR(128) NOT NULL,
  price_cents   BIGINT NOT NULL,
  status        VARCHAR(16) DEFAULT 'draft'
);
CREATE TABLE entitlement_bundle_sku (
  bundle_id     UUID REFERENCES entitlement_bundle(id) ON DELETE CASCADE,
  sku_id        UUID REFERENCES entitlement_sku(id),
  qty           INT DEFAULT 1,
  PRIMARY KEY(bundle_id, sku_id)
);

-- ============================================================
-- 2. 履约侧（订单 / 账户 / 消耗）
-- ============================================================
CREATE TABLE entitlement_order (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id   UUID NOT NULL,
  customer_id     UUID NOT NULL,
  sku_id          UUID,
  bundle_id       UUID,
  order_type      VARCHAR(24) NOT NULL,  -- user_purchase / credit / internal_grant / enterprise_grant
  audit_status    VARCHAR(24) NOT NULL,
  payment_status  VARCHAR(24) NOT NULL,
  order_status    VARCHAR(24) NOT NULL,
  amount_cents    BIGINT NOT NULL DEFAULT 0,
  parent_order_id UUID,
  idem_key        VARCHAR(64),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, idem_key)
);
CREATE INDEX idx_ord_ent ON entitlement_order(enterprise_id, created_at DESC);
ALTER TABLE entitlement_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY ord_tenant_iso ON entitlement_order
  USING (enterprise_id = current_setting('app.enterprise_id')::uuid
         OR has_role(auth.uid(),'platform_admin'));

CREATE TABLE account_capability (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id   UUID NOT NULL,
  customer_id     UUID NOT NULL,
  capability_id   UUID NOT NULL,
  total_quota     BIGINT NOT NULL DEFAULT 0,
  used_quota      BIGINT NOT NULL DEFAULT 0,
  reset_at        TIMESTAMPTZ,
  expire_at       TIMESTAMPTZ,
  source_order_ids UUID[] DEFAULT '{}',
  version         BIGINT NOT NULL DEFAULT 0,
  UNIQUE(customer_id, capability_id)
);
CREATE INDEX idx_acc_ent ON account_capability(enterprise_id);

CREATE TABLE usage_log (
  id              BIGSERIAL PRIMARY KEY,
  account_cap_id  UUID NOT NULL,
  order_id        UUID,
  amount          BIGINT NOT NULL,
  trace_id        VARCHAR(64),
  occurred_at     TIMESTAMPTZ DEFAULT now()
) PARTITION BY RANGE (occurred_at);

-- ============================================================
-- 3. 集成（Outbox + 审计）
-- ============================================================
CREATE TABLE outbox_event (
  id            BIGSERIAL PRIMARY KEY,
  aggregate     VARCHAR(32),
  event_type    VARCHAR(64),
  payload       JSONB,
  created_at    TIMESTAMPTZ DEFAULT now(),
  published_at  TIMESTAMPTZ
);
CREATE INDEX idx_outbox_unpub ON outbox_event(id) WHERE published_at IS NULL;`;

export default function DataModel() {
  return (
    <div className="space-y-10">
      <PrdPageHeader
        eyebrow="PRD · ENTITLEMENT · DATA · v1"
        title="数据模型 · ER + DDL + 资产分层 + 客户画像"
        subtitle="13 张核心表分 3 组：配置侧（6）、履约侧（3）、集成侧（4）。所有租户表强制 RLS by enterprise_id；账户与订单以 sourceOrderIds 双向追溯；BI 仅消费 ODS → DWD → DWS → ADS 四层。"
        meta={<span>SDS-2026.05 · v1</span>}
      />

      <section id="dm-er" className="scroll-mt-4">
        <H icon={Database}>领域 ER · 13 张核心表</H>
        <Mermaid
          caption="蓝=配置侧 · 绿=履约侧 · 紫=集成侧"
          chart={`erDiagram
  APP ||--o{ CAP : has
  CAP ||--o{ RUL : owns
  RUL }o--o{ PRD : "N:M"
  PRD ||--o{ SKU : sells
  SKU }o--o{ BUN : packs
  SKU ||--o{ ORD : ordered_in
  BUN ||--o{ ORD : ordered_in
  ORD ||--o{ ACC : grants
  ACC ||--o{ LOG : consumes
  ORD ||--o{ OUT : emits
  ACC ||--o{ OUT : emits
  APP { uuid id PK }
  CAP { uuid id PK; uuid app_id FK; string data_type }
  RUL { uuid id PK; uuid cap_id FK; bigint quota; string period }
  PRD { uuid id PK; string redeem_type }
  SKU { uuid id PK; uuid product_id FK; bigint price_cents }
  BUN { uuid id PK }
  ORD { uuid id PK; string audit; string payment; string lifecycle }
  ACC { uuid id PK; bigint total; bigint used; bigint version }
  LOG { bigint id PK; uuid acc_cap_id FK }
  OUT { bigint id PK; jsonb payload }`}
        />
      </section>

      <section id="dm-ddl" className="scroll-mt-4">
        <H icon={Database}>核心 DDL（节选）</H>
        <pre className="rounded-xl border bg-muted/30 p-4 text-[11.5px] font-mono leading-relaxed overflow-x-auto whitespace-pre">{DDL}</pre>
      </section>

      <section id="dm-asset" className="scroll-mt-4">
        <H icon={Layers}>数据资产 4 层 · ODS → DWD → DWS → ADS</H>
        <Mermaid
          caption="贴源 → 明细 → 汇总 → 应用，画像与 BI 只能消费 ADS"
          chart={`graph LR
  ODS["ODS<br/>贴源 · 全量同步<br/>orders · accounts · usage_log"]
  DWD["DWD<br/>明细宽表<br/>fct_order · fct_grant · fct_usage"]
  DWS["DWS<br/>主题汇总<br/>agg_customer_daily · agg_app_health"]
  ADS["ADS<br/>应用层<br/>customer_health · ops_alert · roi_view"]
  ODS --> DWD --> DWS --> ADS
  ADS --> BI["BI / 画像 / 风控"]`}
        />
      </section>

      <section id="dm-portrait" className="scroll-mt-4">
        <H icon={Users}>客户画像 · 特征工程管道</H>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DesignCard code="F1" title="基础特征 · 静态档案" tone="primary">
            企业类型 / 规模 / 行业 / 入驻天数 / 续费次数 / 主营产品集
          </DesignCard>
          <DesignCard code="F2" title="行为特征 · 滚动窗口" tone="accent">
            7d/30d/90d 消耗强度、能力多样性、登录频次、API 错误率
          </DesignCard>
          <DesignCard code="F3" title="价值特征 · 派生指标" tone="success">
            ARR · LTV · 健康分（综合 5 因子加权）· 流失风险概率
          </DesignCard>
        </div>
        <div className="mt-3 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">健康分公式</div>
          <pre className="font-mono text-[11.5px] text-foreground/85 leading-relaxed">{`health = 0.30 * usage_intensity        // 30d 消耗 / 配额
        + 0.20 * capability_breadth      // 用到的能力数 / 总能力数
        + 0.20 * payment_health          // 续费 + 准时支付
        + 0.15 * support_satisfaction    // 工单 NPS
        + 0.15 * api_success_rate        // 错误率反向

风险闸值: < 50 红 · 50~70 黄 · ≥ 70 绿`}</pre>
        </div>
      </section>

      <section id="dm-rls" className="scroll-mt-4">
        <H icon={BarChart3}>RLS 与多租户隔离</H>
        <div className="rounded-xl border bg-amber-50/60 border-amber-200 p-4 text-[12.5px] text-foreground/85 space-y-1.5">
          <p>• 所有 <code className="font-mono text-primary">enterprise_id</code> 列表强制 RLS，租户上下文写入 <code className="font-mono text-primary">app.enterprise_id</code> session 变量</p>
          <p>• 平台管理员通过 <code className="font-mono text-primary">has_role(auth.uid(),'platform_admin')</code> 旁路 RLS</p>
          <p>• 配置侧表（app/cap/rule/product/sku/bundle）仅平台读写，企业只读视图</p>
          <p>• 离线数仓同步走 Debezium → Kafka → ClickHouse，不读主库</p>
        </div>
      </section>
    </div>
  );
}
