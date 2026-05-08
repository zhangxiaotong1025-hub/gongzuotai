import {
  Boxes, Workflow, BarChart3, Users, Radio, FileText, CircleDot,
} from "lucide-react";
import { Floor, H2, H3, Card, Pre, Tag, Table, Code, SeqLine } from "./parts";

/* ────────────────────────────────
   07 · 能力地图
   ──────────────────────────────── */
export function S07() {
  return (
    <Floor id="capmap">
      <H2 num="07" icon={Boxes}>能力地图</H2>

      <Card>
        <H3>应用 × 能力族</H3>
        <Pre>{`国内3D工具 (app1) ┬─ 创作族：AI设计 / 4K渲染 / 8K渲染 / 全景导出 / 2D导出
                  ├─ 素材族：全屋/单品/贴图/软装/产品/灯光/外景/装饰画/精选套餐
                  ├─ 协作族：批量导入 / 批量替换 / 人视图 / 大文件
                  └─ 资源族：实时渲染 / 云存储 / 水印
国际3D工具 (app2) ┬─ AI设计·国际 / 4K·国际 / 全景·国际 / 海外素材库
AI设计家   (app4) ┬─ AI方案生成 / AI风格迁移
智能导购   (app3) ┬─ 导购推荐 / 客户画像
精准客资   (app5) └─ 线索获取`}</Pre>
      </Card>

      <Card>
        <H3>能力数据类型 · 计量与扣减</H3>
        <Table
          headers={["数据类型", "Code", "含义", "示例", "扣减语义"]}
          cols={["110px", "110px", "", "", ""]}
          rows={[
            ["计数型", <Code>COUNTER</Code>, "按次扣减整数额度", "AI设计 500 次/日", "INCRBY -1（Lua 校验余额）"]as (string | React.ReactNode)[],
            ["布尔型", <Code>BOOLEAN</Code>, "授权即可用，不扣减", "全屋模型库", "GET 校验存在"],
            ["存储型", <Code>STORAGE</Code>, "按 MB / GB 计量", "云存储 4GB", "INCRBY +/- delta"],
            ["时长型", <Code>DURATION</Code>, "按秒/分钟扣减", "实时渲染时长", "INCRBY -seconds"],
          ]}
        />
      </Card>

      <Card>
        <H3>规则策略派生（Auto Derive · 重要）</H3>
        <Pre>{`periodType    →  grantType         →  expirePolicy        说明
─────────────────────────────────────────────────────────────────────────
DAY              DAILY_REFRESH         CLEAR_ON_EXPIRE     每日 00:00 重置 used
MONTH            MONTHLY_GRANT         CLEAR_ON_EXPIRE     每月发放，月底清零未用部分
YEAR             MONTHLY_GRANT         CLEAR_ON_EXPIRE     按月发放共 12 期
PERMANENT        ONE_TIME              NEVER_EXPIRE        一次性，永不过期

⚠ 派生在前端只读展示，后端通过 deriveRulePolicy(periodType) 强制覆盖
   防止 grantType / expirePolicy 与 periodType 失配`}</Pre>
      </Card>

      <Card>
        <H3>能力消耗策略（ConsumePolicy）</H3>
        <Table
          headers={["策略", "顺序", "适用"]}
          rows={[
            ["先到期优先", "expire_at 升序", "默认策略，规避到期作废"]as (string | React.ReactNode)[],
            ["周期型优先", "DAY → MONTH → YEAR → PERMANENT", "鼓励使用周期赠送"],
            ["指定来源",   "按 sourceOrderId 顺序", "活动赠送指定先扣"],
          ]}
        />
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   08 · 主链路 SOP
   ──────────────────────────────── */
export function S08() {
  const sops = [
    {
      t: "SOP-1 · 配置上架",
      actor: "权益运营",
      pre: "已具备应用接入信息（前端域名 + 业务 API）",
      steps: ["登记应用", "定义能力 + API 绑定", "创建规则（额度+周期）", "封装权益产品（关联规则 N:M）", "建立商品 SKU（关联权益产品 N:M）", "可选：组合套餐", "上架发布"],
      post: "ConfigChanged 事件外发；前台缓存刷新；BI 任务重建维表",
      err: "API 绑定不通过 → 阻断上架；规则与能力数据类型不匹配 → 校验失败",
    },
    {
      t: "SOP-2 · 用户购买（含支付）",
      actor: "C/B 端用户 + 支付域 + 履约引擎",
      pre: "客户已登录，SKU/Bundle 在售",
      steps: ["加购", "提交订单 idempotency-key", "审核 auto_approved", "唤起支付", "支付回调 paid", "履约：SKU→Product→Rule 发放", "写 account_capability + AllocationRecord", "发 ENTITLEMENT_GRANTED"],
      post: "账户额度可用；订单 active；事件流推送 BI/画像",
      err: "支付超时 → 自动 cancelled；履约失败 → Saga 回滚（退款 / 重试 3 次）",
    },
    {
      t: "SOP-3 · 内部发放（含审核）",
      actor: "权益运营 + 主管",
      pre: "运营具有 platform.entitlement.grant:create 权限",
      steps: ["创建 internal_grant 订单", "提交 → pending_audit", "主管 approve / reject", "approved → 履约发放", "发 ENTITLEMENT_GRANTED"],
      post: "审计日志记录 actor / reason",
      err: "rejected → 订单关单；超时 72h 未审 → 自动 cancelled + 告警",
    },
    {
      t: "SOP-4 · 企业入驻联动",
      actor: "企业管理域 + 权益域",
      pre: "企业入驻申请已提交",
      steps: ["企业入驻 → 同步生成 enterprise_grant 订单", "审核 follow_enterprise", "企业审核通过 → 订单 enterprise_approved → 自动履约", "企业冻结 → 订单 + 账户联动 suspended"],
      post: "企业账户首次激活；事件外发",
      err: "企业 rejected → 订单 enterprise_rejected + 关单",
    },
    {
      t: "SOP-5 · 消耗扣减（高频核心）",
      actor: "业务 BFF + 账户域 + Redis",
      pre: "账户 active，规则未过期",
      steps: ["业务侧调能力 API（携 customer_id + biz_ref）", "BFF 调 UsageSvc.consume", "Redis Lua 原子校验 + 扣减", "异步落 PG（version CAS）+ CK", "失败补偿：回滚 Redis"],
      post: "返回 200 + 剩余额度；触发 QuotaWarned ≥80%",
      err: "余额不足 → 4001 + 推荐升级 SKU；Redis 不可用 → 降级直查 PG（限流）",
    },
  ];
  return (
    <Floor id="sop">
      <H2 num="08" icon={Workflow}>主链路 SOP（5 条核心链路）</H2>
      {sops.map((s, i) => (
        <Card key={i}>
          <div className="flex items-center justify-between mb-3">
            <H3>{s.t}</H3>
            <Tag tone="muted">{s.actor}</Tag>
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[12px] mb-3">
            <div className="flex gap-2"><span className="text-muted-foreground w-16 shrink-0">前置</span><span>{s.pre}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-16 shrink-0">后置</span><span>{s.post}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-16 shrink-0">异常</span><span className="text-amber-500">{s.err}</span></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.steps.map((step, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[12px] text-primary font-medium flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">{j + 1}</span>
                  {step}
                </div>
                {j < s.steps.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Card>
        <H3>关键时序：SOP-2 用户购买 + 履约</H3>
        <div className="space-y-0.5 mt-2">
          <SeqLine from="Web" to="Gateway" msg="POST /orders { sku_id, idempotency-key }" />
          <SeqLine from="Gateway" to="OrderSvc" msg="createOrder (auto_approved, payment=pending)" />
          <SeqLine from="OrderSvc" to="DB" msg="INSERT order + order_item + outbox(OrderCreated)" />
          <SeqLine from="OrderSvc" to="Web" msg="201 { order_id, pay_url }" kind="resp" />
          <SeqLine from="Web" to="支付中心" msg="redirect → 支付" />
          <SeqLine from="支付中心" to="OrderSvc" msg="POST /orders/{id}/pay-callback (paid)" />
          <SeqLine from="OrderSvc" to="DB" msg="UPDATE payment=paid + outbox(OrderPaid)" />
          <SeqLine from="Outbox-Relay" to="Kafka" msg="OrderPaid 事件" kind="evt" />
          <SeqLine from="GrantSvc" to="DB+Redis" msg="按 SKU→Product→Rule 写 account_capability + Redis 预热" />
          <SeqLine from="GrantSvc" to="Kafka" msg="EntitlementGranted" kind="evt" />
          <SeqLine from="OrderSvc" to="DB" msg="UPDATE order_status=active" />
        </div>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   09 · 数据资产
   ──────────────────────────────── */
export function S09() {
  return (
    <Floor id="dataasset">
      <H2 num="09" icon={BarChart3}>数据资产分层</H2>
      <Card>
        <Pre>{`ADS  ── 应用层 ─── 客户健康分 / 续费预测 / ROI / 高价值客户 TOP / 风险预警
DWS  ── 汇总层 ─── 客户·应用·日 消耗汇总 / 订单·企业·月 收入汇总
DWD  ── 明细层 ─── order_fact / usage_fact / grant_fact / refund_fact
ODS  ── 贴源层 ─── order_cdc / account_cdc / usage_kafka_log / app_log
                    （Debezium CDC + Kafka 实时入仓）
SRC  ── 源系统 ─── PostgreSQL · Redis · ClickHouse · 业务网关日志`}</Pre>
      </Card>

      <Card>
        <H3>核心数据资产清单</H3>
        <Table
          headers={["资产", "粒度", "更新", "用途", "归属"]}
          rows={[
            ["dwd_order_fact",       "订单+订单行",     "T+1 + 实时CDC", "收入分析、对账",       "数据组"]as (string | React.ReactNode)[],
            ["dwd_usage_fact",       "客户+能力+小时",  "实时（CK）",    "消耗趋势、风控",       "数据组"],
            ["dwd_grant_fact",       "发放快照",        "实时（CDC）",   "发放健康度",           "数据组"],
            ["dws_customer_da",      "客户+应用+日",    "T+1",           "健康分、续费预测",     "数据组"],
            ["dws_revenue_em",       "企业+应用+月",    "T+1",           "BI驾驶舱",             "运营组"],
            ["ads_health_score",     "客户",           "T+1",           "BI驾驶舱、画像主表",   "增长组"],
            ["ads_renewal_alert",    "客户",           "T+1",           "运营预警、客成 SOP",   "客成组"],
            ["ads_revenue_segment",  "企业类型+应用+月", "T+1",          "营销分群、定价",      "运营组"],
            ["ads_top_customer",     "客户",           "T+1",           "高价值客户名单",       "客成组"],
          ]}
        />
      </Card>

      <Card>
        <H3>血缘示例（Lineage · health_score）</H3>
        <Pre>{`source → ods_order_cdc, ods_account_cdc, kafka.entitlement.usage
  └─▶ dwd_usage_fact, dwd_order_fact
        └─▶ dws_customer_da（客户·应用·日）
              └─▶ ads_health_score
                    └─▶ 服务接口 /api/v1/customer/{id}/health
                          └─▶ CRM 仪表板 / 续费预警邮件 / 客成 SOP 触发器`}</Pre>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   10 · 客户画像 + 特征工程
   ──────────────────────────────── */
export function S10() {
  return (
    <Floor id="portrait">
      <H2 num="10" icon={Users}>客户画像 + 特征工程管道</H2>

      <Card>
        <H3>四维特征体系</H3>
        <div className="grid grid-cols-4 gap-3">
          {[
            { t: "基础属性", e: ["企业类型", "规模", "城市", "入驻时长", "行业", "认证状态"] },
            { t: "持有特征", e: ["应用数", "活跃SKU", "套餐组合", "总额度", "未用额度", "到期临近天数"] },
            { t: "行为特征", e: ["日均使用", "周活率", "高峰能力", "登录间隔", "API 失败率", "移动端占比"] },
            { t: "价值特征", e: ["LTV", "续费历史", "升级路径", "投诉次数", "NPS", "回款及时率"] },
          ].map((f) => (
            <div key={f.t} className="border rounded-lg p-3 bg-muted/20">
              <div className="font-semibold text-[13px] text-foreground mb-2">{f.t}</div>
              {f.e.map((x) => (
                <div key={x} className="text-[12px] text-muted-foreground py-0.5 flex items-center gap-1.5">
                  <CircleDot className="h-3 w-3 text-primary" />{x}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <H3>特征定义表（节选）</H3>
        <Table
          headers={["特征 ID", "中文", "口径", "类型", "新鲜度"]}
          rows={[
            ["f_quota_used_ratio_1d",  "1日额度用尽比", "sum(used)/sum(total) by day",          "实时", "1 min"]as (string | React.ReactNode)[],
            ["f_active_days_30d",      "30日活跃天数",  "count(distinct day with usage>0)",     "离线", "T+1"],
            ["f_renewal_history",      "续费次数",     "count(order where type=renew & paid)",  "离线", "T+1"],
            ["f_top_capability",       "高峰能力",     "argmax(sum(used)) over caps",          "离线", "T+1"],
            ["f_complaint_30d",        "30日投诉数",   "count(complaint events)",              "离线", "T+1"],
            ["f_health_score_v1",      "健康分 v1",    "线性加权（见公式）",                   "离线", "T+1"],
          ]}
        />
      </Card>

      <Card>
        <H3>特征工程管道</H3>
        <Pre>{`原始事件 (Kafka) ──▶ Flink 实时聚合 ──▶ Feature Store
                                          ├─ Redis（实时特征 / 秒级）
                                          └─ ClickHouse（离线特征 / T+1）
                                              │
              ┌───────────────────────────────┴──────────────────────────────┐
              ▼                                                              ▼
      实时特征（秒级）                                                离线特征（T+1）
      · f_quota_used_ratio_1d                                       · f_active_days_30d
      · f_recent_call_freq_1h                                       · f_renewal_history
      · f_realtime_risk_signal                                      · f_top_capability

      ──▶ XGBoost 健康分模型 ──▶ ads_health_score
      ──▶ LightGBM 续费预测  ──▶ ads_renewal_alert
      ──▶ 协同过滤 推荐       ──▶ "买了 sku8 也常买 sku51"`}</Pre>
      </Card>

      <Card>
        <H3>健康分算法（v1 · 线性加权）</H3>
        <Pre>{`HealthScore = 0.30 × ActivityScore       // 使用活跃度（30日活跃天数 / 调用 SLI）
            + 0.25 × QuotaHealth         // 1 - max(0, used/total - 0.8) × 5
            + 0.20 × RenewalHistory      // 续费次数 / 应续次数
            + 0.15 × UpgradeIntent       // 升级行为信号（询价、试用、Demo）
            + 0.10 × NegativeFeedback    // 1 - 投诉/退款负向

等级映射：
  ≥ 85   优秀 (A)
  70-84  良好 (B)
  50-69  警示 (C)
  <  50  危险 (D) → 触发客成 SOP

模型评估：AUC ≥ 0.78（v1 离线评估），月度回放 + Drift 监控`}</Pre>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   11 · 事件总线 · 领域事件契约
   ──────────────────────────────── */
export function S11() {
  return (
    <Floor id="events">
      <H2 num="11" icon={Radio}>事件总线 · 领域事件契约</H2>

      <Card>
        <H3>Topic 总览</H3>
        <Table
          headers={["Topic", "分区键", "保留期", "事件名", "下游消费"]}
          rows={[
            ["entitlement.config",  "app_id",      "30 d", "AppCreated · CapChanged · RuleChanged · ProductPublished · SkuOnSale",  "搜索ES、缓存刷新、BI维表"]as (string | React.ReactNode)[],
            ["entitlement.order",   "customer_id", "30 d", "OrderCreated · OrderAuditPassed · OrderAuditRejected · OrderPaid · OrderCancelled · OrderRefunded · OrderExpired", "履约、对账、画像、CRM"],
            ["entitlement.grant",   "customer_id", "30 d", "EntitlementGranted · EntitlementRevoked · EntitlementExpired",         "账户、积分、CRM"],
            ["entitlement.usage",   "customer_id", "7 d",  "CapabilityConsumed · QuotaWarned (≥80%) · QuotaExhausted",            "风控、健康分、提醒"],
            ["entitlement.account", "customer_id", "30 d", "AccountAggregated · AccountFrozen · AccountResumed",                  "BI、企业管理"],
          ]}
        />
      </Card>

      <Card>
        <H3>事件 Schema · EntitlementGranted（Avro）</H3>
        <Pre>{`{
  "namespace": "platform.entitlement",
  "name": "EntitlementGranted",
  "type": "record",
  "fields": [
    { "name": "event_id",     "type": "string",  "doc": "雪花ID（消费方去重键）" },
    { "name": "occurred_at",  "type": "long",    "doc": "ms 时间戳" },
    { "name": "trace_id",     "type": "string" },
    { "name": "tenant",       "type": "string",  "doc": "enterprise_id 或 'platform'" },
    { "name": "order_id",     "type": "string" },
    { "name": "customer_id",  "type": "string" },
    { "name": "customer_type","type": { "type": "enum", "symbols": ["B","C"] } },
    { "name": "app_id",       "type": "string" },
    { "name": "grants",       "type": {
        "type": "array", "items": {
          "type": "record", "name": "GrantItem",
          "fields": [
            { "name": "rule_id",       "type": "string" },
            { "name": "capability_id", "type": "string" },
            { "name": "quota",         "type": "double" },
            { "name": "period_type",   "type": { "type": "enum", "symbols": ["DAY","MONTH","YEAR","PERMANENT"] } },
            { "name": "expire_at",     "type": ["null","long"], "default": null }
          ]
        }
    }},
    { "name": "source",       "type": { "type": "enum", "symbols": ["PURCHASE","INTERNAL","ENTERPRISE","CREDIT","SYSTEM"] } },
    { "name": "schema_version", "type": "int", "default": 1 }
  ]
}`}</Pre>
      </Card>

      <Card>
        <H3>事件 Schema · CapabilityConsumed（Avro）</H3>
        <Pre>{`{
  "namespace": "platform.entitlement",
  "name": "CapabilityConsumed",
  "type": "record",
  "fields": [
    { "name": "event_id",       "type": "string" },
    { "name": "occurred_at",    "type": "long" },
    { "name": "trace_id",       "type": "string" },
    { "name": "tenant",         "type": "string" },
    { "name": "customer_id",    "type": "string" },
    { "name": "account_id",     "type": "string" },
    { "name": "app_id",         "type": "string" },
    { "name": "capability_id",  "type": "string" },
    { "name": "rule_id",        "type": "string" },
    { "name": "amount",         "type": "double" },
    { "name": "remaining",      "type": "double" },
    { "name": "biz_ref",        "type": ["null","string"], "default": null },
    { "name": "schema_version", "type": "int", "default": 1 }
  ]
}`}</Pre>
      </Card>

      <Card>
        <H3>事件传输保证</H3>
        <Table
          headers={["维度", "策略"]}
          cols={["120px", ""]}
          rows={[
            ["顺序",    <span>按 <Code>partition_key</Code>（customer_id / app_id）哈希分区，单分区严格有序</span>]as (string | React.ReactNode)[],
            ["可靠性",  <span>Outbox + Relay，至少投递一次（at-least-once）</span>],
            ["幂等",    <span>消费方按 <Code>event_id</Code> 去重，建议 Redis Set + 7d TTL</span>],
            ["追踪",    <span>全链路 <Code>trace_id</Code> 透传（W3C TraceContext）</span>],
            ["容灾",    <span>DLQ 死信队列 + 7d 保留 + 重放工具（按 trace_id / 时间区间）</span>],
            ["演进",    <span>Schema Registry（Confluent 兼容）+ <Code>schema_version</Code> 字段</span>],
          ]}
        />
      </Card>
    </Floor>
  );
}
