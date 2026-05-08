import {
  FileText, GitBranch, Cpu, Code2, ShieldCheck, Rocket,
  Server, Cloud, Lock, Gauge, Sparkles, Database, Activity,
  AlertTriangle,
} from "lucide-react";
import { Floor, H2, H3, Card, Pre, Tag, Table, Code } from "./parts";

/* ────────────────────────────────
   12 · 页面设计详情
   ──────────────────────────────── */
const PAGES: Array<{
  p: string;
  t: string;
  layout: string;
  fields: string[];
  actions: string[];
  rules: string[];
}> = [
  {
    p: "/entitlement/dashboard",
    t: "数据看板",
    layout: "Hero KPI（4 卡）+ 收入趋势曲线 + 应用占比环 + 健康度热力 + 高价值客户 TOP10",
    fields: ["GMV / 订单数 / 活跃账户 / 健康分均值", "近30日趋势", "应用切片", "客户健康度颗粒图"],
    actions: ["切换时间窗", "下载报表", "穿透到客户列表"],
    rules: ["仅 platform 角色可见 GMV 财务数据", "数据延迟 ≤ 5min"],
  },
  {
    p: "/entitlement/app",
    t: "应用管理",
    layout: "PageHeader + AdminTable + 抽屉编辑",
    fields: ["code / name / 描述 / 状态 / 能力数 / 关联商品数"],
    actions: ["新建（弹窗）", "编辑（抽屉）", "上架/下架（确认）"],
    rules: ["code 唯一", "下架前需检查无在线商品"],
  },
  {
    p: "/entitlement/capability",
    t: "能力管理",
    layout: "FilterBar(应用/数据类型/状态) + AdminTable + 详情页",
    fields: ["编码 / 名称 / 数据类型 / 单位 / API 路径 / 消耗系数"],
    actions: ["新建", "编辑", "查看规则使用矩阵", "下线"],
    rules: ["数据类型与 BOOLEAN 互斥不能改 STORAGE", "下线前需检查无在线规则"],
  },
  {
    p: "/entitlement/rule",
    t: "权益规则",
    layout: "FilterBar + AdminTable，列：能力 / 额度 / 周期 / 派生策略 / 被引用产品数",
    fields: ["规则名 / 能力 / 额度 / periodType / 派生 grantType / 派生 expirePolicy / 被引用产品数"],
    actions: ["新建（仅选 periodType，策略自动派生）", "编辑", "下线（检查产品引用）"],
    rules: ["grantType / expirePolicy 由 periodType 自动派生（前端只读）", "已被产品引用的规则禁止删改额度，只能下线"],
  },
  {
    p: "/entitlement/product",
    t: "权益产品",
    layout: "Tabs(paid/credit/free) + AdminTable + 详情",
    fields: ["名称 / 兑换方式 / 关联规则数 / 被引用商品数 / 状态"],
    actions: ["新建（PickerDialog 多选规则）", "编辑（更新规则集）", "下线"],
    rules: ["paid 不能与 credit 互转", "下线前需检查 SKU 无在线引用"],
  },
  {
    p: "/entitlement/sku",
    t: "权益商品",
    layout: "FilterBar + AdminTable + 详情",
    fields: ["SKU 名 / 价格 / 计费周期 / 关联权益产品 / 销售状态"],
    actions: ["新建（PickerDialog 选权益产品，仅显示 paid+active）", "编辑", "上架/下架"],
    rules: ["商品创建时只允许选 paid + active 的权益产品", "上架后价格变更走审批"],
  },
  {
    p: "/entitlement/package",
    t: "套餐管理",
    layout: "AdminTable + BundleDialog（多 SKU + 数量 + 跨应用）",
    fields: ["套餐名 / 原价 / 折扣价 / 包含 SKU 列表（含权益产品 N 个 · 规则 N 条）"],
    actions: ["新建", "编辑（修改成员）", "上架/下架"],
    rules: ["折扣价 ≤ 原价；折扣 ≥ 5 折需审批"],
  },
  {
    p: "/entitlement/order",
    t: "订单管理",
    layout: "FilterBar(类型/三维状态/客户) + AdminTable + 详情（5 段生命周期图 + 6 模块）",
    fields: ["订单号 / 订单类型 / 三维状态 / 客户 / 金额 / 时间线"],
    actions: ["审核（pending_audit）", "退款（paid）", "关闭", "导出"],
    rules: ["三维状态独立流转；follow_enterprise 不可手动审"],
  },
  {
    p: "/entitlement/account",
    t: "权益账户",
    layout: "AdminTable（客户聚合） + 详情（应用维度切片 + 健康分 + 来源订单）",
    fields: ["客户 / 应用列表 / 总额度 / 已用 / 健康分 / 状态"],
    actions: ["冻结 / 解冻", "重置（仅平台 admin）", "导出消耗"],
    rules: ["≥ 80% 显示警示带；冻结需二次确认 + 备注"],
  },
];

export function S12() {
  return (
    <Floor id="pages">
      <H2 num="12" icon={FileText}>页面设计详情</H2>

      {PAGES.map((pg) => (
        <Card key={pg.p}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-semibold text-foreground">{pg.t}</h4>
              <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{pg.p}</code>
            </div>
            <Tag tone="success">已实现</Tag>
          </div>
          <div className="grid grid-cols-1 gap-2 text-[12.5px]">
            <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">布局</span><span className="text-foreground/85">{pg.layout}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">字段</span><span className="text-foreground/85">{pg.fields.join(" · ")}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">操作</span><span className="text-foreground/85">{pg.actions.join(" · ")}</span></div>
            <div className="flex gap-2"><span className="text-muted-foreground w-20 shrink-0">业务规则</span><span className="text-amber-500/90">{pg.rules.join(" · ")}</span></div>
          </div>
        </Card>
      ))}

      <Card>
        <H3>统一交互规范</H3>
        <ul className="text-[12.5px] space-y-1.5 text-foreground/85 list-disc pl-4">
          <li>列表：<b>FilterBar + AdminTable + Pagination + PageHeader</b> 标准三件套</li>
          <li>列表行操作：最多 3 个内联，其余收纳；危险操作必须二次确认（含备注）</li>
          <li>表单：分组卡片布局，标签 100px 右对齐（复杂场景 120px）</li>
          <li>徽章：rounded-full 胶囊 + 1.5h 实心圆点（info/success/warning/danger）</li>
          <li>详情页：DetailActionBar 操作中枢 + 楼层导航 Scroll-Spy</li>
          <li>大数据选择：2 级 PickerDialog（上下文 + 详情）</li>
          <li>额度 ≥ 80% 显示警示带；≥ 100% 阻断扣减</li>
        </ul>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   13 · 数据逻辑与状态机
   ──────────────────────────────── */
export function S13() {
  return (
    <Floor id="datalogic">
      <H2 num="13" icon={GitBranch}>数据逻辑与状态机</H2>

      <Card>
        <H3>订单三维状态机</H3>
        <Pre>{`auditStatus      ┬─ auto_approved（user_purchase / credit）
                 ├─ pending_audit  ─▶ approved / rejected      （internal_grant）
                 └─ follow_enterprise ─▶ enterprise_approved
                                       └─▶ enterprise_rejected （enterprise_grant）

paymentStatus    ┬─ no_payment（免费 / 内部 / 企业 / 积分）
                 ├─ pending ─▶ paid / cancelled
                 └─ refunded（terminal）

orderStatus      ┬─ pending_effect（已成单未生效）
                 ├─ active（生效中）
                 ├─ suspended（账户冻结联动）
                 ├─ expired
                 ├─ cancelled
                 └─ closed`}</Pre>
      </Card>

      <Card>
        <H3>状态转移表（核心场景）</H3>
        <Table
          headers={["事件", "audit", "payment", "lifecycle", "动作"]}
          cols={["", "180px", "150px", "150px", ""]}
          rows={[
            ["下单（user_purchase）",            "auto_approved",      "pending → paid",   "pending_effect → active", "支付回调后履约"]as (string | React.ReactNode)[],
            ["下单（credit）",                    "auto_approved",      "no_payment",       "active",                  "扣积分 + 即时履约"],
            ["下单（internal_grant）",            "pending_audit→approved","no_payment",     "pending_effect → active", "审核通过即履约"],
            ["下单（enterprise_grant）",          "follow_enterprise→enterprise_approved","no_payment","pending_effect → active","随企业入驻通过自动履约"],
            ["支付超时",                          "auto_approved",      "pending → cancelled","cancelled",              "释放预占"],
            ["退款",                              "—",                  "paid → refunded",  "active → closed",         "回收账户额度（按规则）"],
            ["到期",                              "—",                  "—",                "active → expired",        "CLEAR_ON_EXPIRE 清零"],
            ["企业冻结",                          "—",                  "—",                "active → suspended",      "联动账户冻结，禁止消耗"],
          ]}
        />
      </Card>

      <Card>
        <H3>规则策略派生（再次强调）</H3>
        <Pre>{`后端 deriveRulePolicy(periodType):
  case DAY:        grantType = DAILY_REFRESH,  expirePolicy = CLEAR_ON_EXPIRE
  case MONTH:      grantType = MONTHLY_GRANT,  expirePolicy = CLEAR_ON_EXPIRE
  case YEAR:       grantType = MONTHLY_GRANT,  expirePolicy = CLEAR_ON_EXPIRE
  case PERMANENT:  grantType = ONE_TIME,       expirePolicy = NEVER_EXPIRE

⚠ 入库前必须用此函数覆盖前端值，禁止用户单独覆盖`}</Pre>
      </Card>

      <Card>
        <H3>账户额度合并算法</H3>
        <Pre>{`function grant(account, rule, quota, orderId):
  key = (account.id, rule.capability_id, rule.id)
  ac  = account_capability.findOrInit(key)

  // 同 (capability, rule) 累加
  ac.total_quota   += quota
  ac.expire_at      = max(ac.expire_at, computeExpire(rule, now))
  ac.source_order_ids ∪= [orderId]
  ac.version       += 1

  // 不同 rule 即使能力一致：独立持有（一条规则即一份"账目"）
  upsert(ac)

消耗顺序（默认）：
  1. 先扣即将到期（expire_at 升序）
  2. 同到期时间：先扣周期型（DAY → MONTH → YEAR）
  3. 最后扣永久型（PERMANENT）

并发：account_capability.version CAS；冲突 3 次回退到 Redis 排队`}</Pre>
      </Card>

      <Card>
        <H3>Redis 扣减脚本（Lua · 简化版）</H3>
        <Pre>{`-- KEYS[1] = quota:{account_id}:{cap_id}:{rule_id}
-- ARGV[1] = amount
local left = tonumber(redis.call('GET', KEYS[1]) or '0')
local need = tonumber(ARGV[1])
if left < need then
  return -1   -- 余额不足
end
local rest = redis.call('DECRBY', KEYS[1], need)
return rest  -- 剩余额度`}</Pre>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   14 · 技术架构
   ──────────────────────────────── */
export function S14() {
  return (
    <Floor id="tech">
      <H2 num="14" icon={Cpu}>技术架构</H2>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <H3><Server className="inline h-3.5 w-3.5 mr-1" />后端</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>Spring Boot 3.2 · Java 21 (Virtual Thread)</li>
            <li>Spring Cloud Gateway（BFF）</li>
            <li>MyBatis-Plus + Flyway 迁移</li>
            <li>Sentinel 限流 / 熔断</li>
            <li>Spring Statemachine（订单）</li>
            <li>OpenFeign / gRPC（域间调用）</li>
          </ul>
        </Card>
        <Card>
          <H3><Database className="inline h-3.5 w-3.5 mr-1" />存储</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>PostgreSQL 16（RLS · 分区 · JSONB）</li>
            <li>Redis 7 集群（额度 / 限流 / 锁）</li>
            <li>ClickHouse 24（usage + DWD）</li>
            <li>Elasticsearch 8（订单 / 产品检索）</li>
            <li>OSS（合同 / 凭证 / 对账）</li>
          </ul>
        </Card>
        <Card>
          <H3><Cloud className="inline h-3.5 w-3.5 mr-1" />中间件</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>Kafka 3.6（事件总线）</li>
            <li>Debezium（CDC → Kafka）</li>
            <li>Flink 1.18（实时特征）</li>
            <li>Apollo / Nacos（配置 + 注册）</li>
            <li>SkyWalking（APM · trace）</li>
            <li>Confluent Schema Registry</li>
          </ul>
        </Card>
      </div>

      <Card>
        <H3>关键设计决策</H3>
        <Table
          headers={["决策点", "方案", "理由", "替代方案"]}
          rows={[
            ["额度扣减并发", "Redis Lua 原子脚本 + DB 异步对账", "高并发 / 强一致替代",     "PG SELECT ... FOR UPDATE（吞吐 ↓ 70%）"]as (string | React.ReactNode)[],
            ["订单幂等",     "客户端 idempotency_key + DB 唯一索引",   "防重复支付/重复发放",     "纯服务端 token（前端集成成本高）"],
            ["跨域事务",     "本地事务 + Outbox + Saga 补偿",     "避免 2PC / XA",         "Seata（额外组件）"],
            ["数据隔离",     "PG RLS + has_role()",  "云原生 / 兼并平台/企业双视角",       "应用层 where 过滤（容易漏写）"],
            ["大额度账户",   "Hot/Cold 分桶 + 批量同步",        "减少热点行锁",            "MQ 序列化（牺牲实时性）"],
            ["事件可靠投递", "Outbox + Relay",                  "解耦业务事务与外发",       "事务消息（Kafka 限制多）"],
            ["消耗日志查询", "ClickHouse + 客户Id 排序键",      "高压缩 + 高并发分析",      "PG 分区（大数据慢）"],
          ]}
        />
      </Card>

      <Card>
        <H3>容量估算（v1 · 单地域）</H3>
        <Table
          headers={["指标", "目标", "依据"]}
          cols={["", "200px", ""]}
          rows={[
            ["订单写入峰值",    "1,500 TPS",  "促销活动峰值 5x，常态 300 TPS"]as (string | React.ReactNode)[],
            ["发放峰值",        "5,000 TPS",  "1 单平均 3-5 条规则发放"],
            ["消耗扣减峰值",    "20,000 QPS", "AI 设计连发 + 渲染队列"],
            ["事件出口",        "30,000 EPS", "上述 3x 放大（多事件）"],
            ["DB 主库",         "8C 32G x 2 主从 + 读副本 x 2", "按月分区，预留 30% 冗余"],
            ["Redis",           "6 主 6 从 集群 64GB",          "热数据驻留 + Lua"],
            ["ClickHouse",      "3 节点 16C 64G + 4TB SSD",    "按时间分片"],
            ["Kafka",           "3 broker · 64GB · 200GB SSD/节点", "保留 7d"],
          ]}
        />
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   15 · 接口设计（含样例）
   ──────────────────────────────── */
export function S15() {
  return (
    <Floor id="api">
      <H2 num="15" icon={Code2}>接口设计（含请求/响应样例）</H2>

      <Card>
        <H3>API 总览</H3>
        <Table
          headers={["Method", "Path", "说明", "权限"]}
          rows={[
            ["GET",  "/api/v1/entitlement/apps",                    "应用列表",                      "platform.entitlement.app:read"]as (string | React.ReactNode)[],
            ["POST", "/api/v1/entitlement/capabilities",            "创建能力",                      "platform.entitlement.cap:write"],
            ["GET",  "/api/v1/entitlement/rules?capId=&period=",    "规则查询",                      "platform.entitlement.rule:read"],
            ["POST", "/api/v1/entitlement/products",                "创建权益产品（N:M 关联规则）",  "platform.entitlement.product:write"],
            ["POST", "/api/v1/entitlement/skus",                    "创建商品",                      "platform.entitlement.sku:write"],
            ["POST", "/api/v1/entitlement/orders",                  "下单（Idempotency-Key 必填）",  "tenant.order:write"],
            ["POST", "/api/v1/entitlement/orders/{id}:audit",       "审核",                          "platform.audit:approve"],
            ["POST", "/api/v1/entitlement/orders/{id}:refund",      "退款",                          "platform.order:refund"],
            ["POST", "/api/v1/entitlement/usage:consume",           "消耗扣减",                      "internal.bff"],
            ["GET",  "/api/v1/entitlement/accounts/{customerId}",   "账户聚合视图",                  "tenant.self / platform.read"],
            ["POST", "/api/v1/entitlement/accounts/{id}:freeze",    "账户冻结",                      "platform.account:admin"],
          ]}
        />
      </Card>

      <Card>
        <H3>统一返回结构</H3>
        <Pre>{`{
  "code": 0,                 // 0 成功，4xxx 业务，5xxx 系统
  "message": "ok",
  "data": { ... },
  "trace_id": "5b9c..."
}`}</Pre>
      </Card>

      <Card>
        <H3>样例 1：创建订单（user_purchase）</H3>
        <Pre>{`POST /api/v1/entitlement/orders
Headers:
  Authorization: Bearer eyJhbGciOi...
  Idempotency-Key: 9f4d3e2c-0a1b-4d59-9c8b-f6c3a2b1e0e7
  X-Trace-Id: 5b9c2f1a...

Request:
{
  "order_type": "user_purchase",
  "customer_id": "cust_891",
  "items": [
    { "ref_type": "sku",    "ref_id": "sku_1001", "quantity": 1 },
    { "ref_type": "bundle", "ref_id": "bun_8",    "quantity": 1 }
  ],
  "remark": "618 大促"
}

Response 201:
{
  "code": 0,
  "data": {
    "order_id": "ord_2026051200001",
    "order_no": "ORD202605120001",
    "audit_status":   "auto_approved",
    "payment_status": "pending",
    "order_status":   "pending_effect",
    "total_amount":   1280.00,
    "pay_url":        "https://pay.example.com/checkout?ord=...",
    "expire_at_for_payment": 1715499600000
  },
  "trace_id": "5b9c2f1a..."
}

Errors:
  4002 重复下单（Idempotency-Key 命中已存在订单）
  4003 风控拦截
  4010 商品不在售 / 套餐已下架
  4020 客户被冻结`}</Pre>
      </Card>

      <Card>
        <H3>样例 2：消耗扣减</H3>
        <Pre>{`POST /api/v1/entitlement/usage:consume
Headers:
  X-Internal-Token: ...
  X-Trace-Id: 5b9c2f1a...

Request:
{
  "customer_id":   "cust_891",
  "app_id":        "app1",
  "capability_id": "cap_ai_design",
  "amount":        1,
  "biz_ref":       "render_job_77821"
}

Response 200:
{
  "code": 0,
  "data": {
    "consumed":  1,
    "remaining": 487,
    "rule_id":   "rule_ai_500_per_day",
    "warn":      false
  },
  "trace_id": "5b9c2f1a..."
}

Errors:
  4001 余额不足
  4030 账户已冻结
  4040 规则已过期 / 能力已下线`}</Pre>
      </Card>

      <Card>
        <H3>样例 3：订单审核</H3>
        <Pre>{`POST /api/v1/entitlement/orders/ord_2026051200002:audit

Request:
{
  "decision": "approved",   // approved / rejected
  "reason":   "试用 30 天，已与客户确认"
}

Response 200:
{
  "code": 0,
  "data": {
    "order_id":       "ord_2026051200002",
    "audit_status":   "approved",
    "next_actions":   ["GRANT"]
  }
}`}</Pre>
      </Card>

      <Card>
        <H3>错误码段</H3>
        <Table
          headers={["段位", "类别", "示例"]}
          cols={["100px", "150px", ""]}
          rows={[
            ["4001-4099", "余额/规则",   "4001 余额不足 · 4040 规则过期"]as (string | React.ReactNode)[],
            ["4100-4199", "订单",       "4002 重复下单 · 4101 状态非法"],
            ["4200-4299", "审核/支付",  "4201 审核超时 · 4210 支付通道异常"],
            ["4300-4399", "权限/隔离",  "4301 越权访问 · 4302 RLS 拦截"],
            ["4400-4499", "幂等/参数",  "4400 参数校验 · 4401 缺幂等键"],
            ["5000-5099", "系统",       "5001 内部异常 · 5002 依赖超时"],
          ]}
        />
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   16 · 非功能性需求
   ──────────────────────────────── */
export function S16() {
  return (
    <Floor id="nfr">
      <H2 num="16" icon={ShieldCheck}>非功能性需求（SLO / SLI）</H2>

      <Card>
        <H3>SLO 表</H3>
        <Table
          headers={["指标", "SLO", "测量窗口", "告警阈值"]}
          rows={[
            ["核心链路可用性",     "≥ 99.95%",       "30 d 滚动",    "< 99.9% 触发 P1"]as (string | React.ReactNode)[],
            ["消耗扣减 P99",       "≤ 30 ms",         "5 min",        "> 50 ms 持续 5min"],
            ["订单创建 P99",       "≤ 200 ms",        "5 min",        "> 400 ms"],
            ["事件端到端延迟",     "≤ 1 s",           "5 min",        "> 3 s"],
            ["发放成功率",         "≥ 99.99%",        "1 d",          "< 99.9%"],
            ["对账误差",           "= 0",             "1 d",          "≥ 1 笔"],
            ["DLQ 死信积压",       "= 0",             "实时",         "> 100"],
          ]}
        />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <H3><Gauge className="inline h-3.5 w-3.5 mr-1" />性能</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>消耗扣减 P99 ≤ 30 ms（Redis Lua）</li>
            <li>账户查询 P99 ≤ 80 ms（Redis Cache → DB Fallback）</li>
            <li>发放峰值 ≥ 5,000 TPS（含事件外发）</li>
            <li>事件投递端到端 ≤ 1 s</li>
            <li>看板查询 P95 ≤ 500 ms</li>
          </ul>
        </Card>
        <Card>
          <H3><Lock className="inline h-3.5 w-3.5 mr-1" />安全</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>JWT 含 enterprise_id；PG RLS 强制隔离</li>
            <li>用户角色独立表 user_roles + has_role()</li>
            <li>敏感字段加密（手机号、身份证 · AES-256）</li>
            <li>所有写操作埋审计日志（actor / before / after）</li>
            <li>API Gateway 限流 + DDoS 防护</li>
            <li>密钥统一 KMS 托管，定期轮换</li>
          </ul>
        </Card>
        <Card>
          <H3><Activity className="inline h-3.5 w-3.5 mr-1" />可观测</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>全链路 trace_id；APM SkyWalking</li>
            <li>Prometheus + Grafana 指标（RED / USE）</li>
            <li>JSON 结构化日志 → ELK，保留 30d</li>
            <li>对账日报：T+1 自动产出 + 邮件 + IM 告警</li>
            <li>SLO 大盘 + 错误预算可视化</li>
          </ul>
        </Card>
        <Card>
          <H3><Sparkles className="inline h-3.5 w-3.5 mr-1" />可用性 / 容灾</H3>
          <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
            <li>核心链路 SLA 99.95%</li>
            <li>多 AZ 部署 + 主备切换 RTO ≤ 5 min</li>
            <li>Chaos Engineering 月度演练</li>
            <li>降级开关：消耗扣减异常 → 快速通行 + 后置补扣</li>
            <li>Kafka 不可用 → Outbox 持久缓冲；DLQ + 重放</li>
            <li>跨域容灾：异地冷备份 + RPO ≤ 5 min</li>
          </ul>
        </Card>
      </div>

      <Card>
        <H3><AlertTriangle className="inline h-3.5 w-3.5 mr-1" />合规与风控</H3>
        <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
          <li>满足《个保法》：用户数据采集需明确同意；提供一键导出/删除</li>
          <li>支付链路通过 PCI-DSS 评估（仅经支付中心）</li>
          <li>风控规则：单客户 24h 下单数量、下单金额、设备指纹、IP 风险等</li>
          <li>退款金额超 ¥10,000 走双人审批</li>
          <li>促销活动需评审最高赠送额度，避免羊毛党</li>
        </ul>
      </Card>
    </Floor>
  );
}

/* ────────────────────────────────
   17 · 里程碑 + 灰度
   ──────────────────────────────── */
export function S17() {
  return (
    <Floor id="milestone">
      <H2 num="17" icon={Rocket}>里程碑与灰度方案</H2>
      <Card>
        <H3>里程碑（11 周）</H3>
        <Table
          headers={["阶段", "周期", "交付物", "DoD（完成定义）"]}
          rows={[
            ["M1 · 数据建模",    "T0 + 1w",   "DDL + Flyway 迁移 + 单元测试",                "迁移可重复执行 / 单测覆盖率 ≥ 80%"]as (string | React.ReactNode)[],
            ["M2 · 配置侧域",    "T0 + 3w",   "App / Cap / Rule / Product / SKU / Bundle 服务 + API",  "前端 Mock 接管 / 接口契约测试通过"],
            ["M3 · 交易侧域",    "T0 + 5w",   "Order 状态机 + 支付/审核/履约 + 幂等 + Outbox", "三维状态联调通过 / 幂等压测通过"],
            ["M4 · 账户侧域",    "T0 + 7w",   "AccountSvc + UsageSvc + Redis Lua + 对账",     "压测达标（30ms / 5000TPS）/ 0 误差"],
            ["M5 · 事件 + BI",   "T0 + 9w",   "Kafka 契约 + Flink 实时特征 + 健康分模型",    "事件覆盖率 100% / 健康分 AUC ≥ 0.78"],
            ["M6 · 灰度上线",    "T0 + 11w",  "灰度名单 + 双写对账 + 一键回滚",              "对账误差 0 / SLA 达标 / 灰度 7d 无 P1"],
          ]}
        />
      </Card>

      <Card>
        <H3>灰度策略（M6）</H3>
        <Pre>{`阶段 1（D1-D3）  内部企业（< 10 家）   功能开关 + 双写校验
                                       通过率 100% → 进入阶段 2

阶段 2（D4-D7）  10% 流量灰度          按 enterprise_id 哈希
                                       SLO 合规 7d → 进入阶段 3

阶段 3（D8-D14） 50% 流量灰度          高峰值压力测试
                                       事件链路全覆盖 → 进入阶段 4

阶段 4（D15+）   全量切换 + 老系统只读  保留 30d 兜底
                                       30d 后下线老链路`}</Pre>
      </Card>

      <Card>
        <H3>回滚预案</H3>
        <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
          <li>功能层：Apollo 配置开关瞬时切回老链路（&lt; 30 s）</li>
          <li>数据层：双写期间老库为权威；新库异常自动停写</li>
          <li>账户层：account_capability 保留 v0 列，必要时一键还原</li>
          <li>事件层：Kafka topic 启停由 Apollo 控制；停发不影响主交易</li>
          <li>恢复演练：每月 1 次，要求 RTO ≤ 5 min</li>
        </ul>
      </Card>

      <Card>
        <H3>验收标准（功能 / 性能 / 数据）</H3>
        <Table
          headers={["类别", "项", "标准"]}
          rows={[
            ["功能",   "8 层链路全跑通",     "配置 → 上架 → 下单 → 履约 → 消耗 → 续费 → 退款 → 对账"]as (string | React.ReactNode)[],
            ["功能",   "三维状态机",         "9 种状态转移 100% 覆盖单测 + 集成测试"],
            ["性能",   "消耗扣减 P99",       "≤ 30 ms（5,000 QPS 持续 1h）"],
            ["性能",   "发放 TPS",           "≥ 5,000（峰值 5min）"],
            ["数据",   "对账误差",           "= 0（连续 7d）"],
            ["数据",   "事件投递成功率",     "≥ 99.99%（连续 7d）"],
            ["安全",   "RLS 渗透测试",       "0 越权访问"],
            ["安全",   "幂等性",             "重复请求 1,000 次结果一致"],
          ]}
        />
      </Card>
    </Floor>
  );
}
