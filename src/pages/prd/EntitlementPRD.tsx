import { useEffect, useRef, useState } from "react";
import {
  FileText, Layers, Database, GitBranch, Activity, Cpu, Workflow,
  Boxes, ShieldCheck, Zap, Target, Radio, Users, BarChart3, Network,
  Server, Cloud, Lock, Gauge, Rocket, BookOpen, Hash, Code2, ListTree,
  Sparkles, Package, Wallet, ShoppingCart, Tag as TagIcon, CircleDot,
} from "lucide-react";

/* ──────────────────────────────────────────────
   PRD · 权益管理系统 v1.0
   ────────────────────────────────────────────── */

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
}

const SECTIONS: Section[] = [
  { id: "overview",      title: "1. 文档信息",         icon: BookOpen },
  { id: "background",    title: "2. 业务背景与目标",   icon: Target },
  { id: "glossary",      title: "3. 术语与核心概念",   icon: Hash },
  { id: "blueprint",     title: "4. 系统蓝图 · 模式设计", icon: Network },
  { id: "architecture",  title: "5. 分层架构",         icon: Layers },
  { id: "datamodel",     title: "6. 数据结构 · ER",    icon: Database },
  { id: "capmap",        title: "7. 能力地图",         icon: Boxes },
  { id: "sop",           title: "8. 主链路 SOP",       icon: Workflow },
  { id: "dataasset",     title: "9. 数据资产分层",     icon: BarChart3 },
  { id: "portrait",      title: "10. 客户画像 · 特征工程", icon: Users },
  { id: "events",        title: "11. 事件总线 · 领域事件契约", icon: Radio },
  { id: "pages",         title: "12. 页面设计详情",    icon: FileText },
  { id: "datalogic",     title: "13. 数据逻辑与状态机", icon: GitBranch },
  { id: "tech",          title: "14. 技术架构",        icon: Cpu },
  { id: "api",           title: "15. 接口设计",        icon: Code2 },
  { id: "nfr",           title: "16. 非功能性需求",    icon: ShieldCheck },
  { id: "milestone",     title: "17. 里程碑与排期",    icon: Rocket },
];

/* ── 共用块 ───────────────────────────────────── */

function Floor({ id, children }: { id: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-[72px] space-y-4">{children}</section>;
}

function H2({ icon: Icon, num, children }: { icon: React.ElementType; num: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-2 mt-8">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[11px] text-muted-foreground font-mono">{num}</div>
        <h2 className="text-[18px] font-semibold text-foreground leading-tight">{children}</h2>
      </div>
    </div>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-semibold text-foreground mt-5 mb-2 flex items-center gap-2 before:content-[''] before:w-1 before:h-3.5 before:bg-primary before:rounded-sm">{children}</h3>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-card border rounded-xl p-5 ${className}`} style={{ boxShadow: "var(--shadow-xs)" }}>{children}</div>;
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-muted/40 border rounded-lg p-3.5 text-[12px] leading-[1.7] overflow-x-auto font-mono text-foreground/90 whitespace-pre">
      {children}
    </pre>
  );
}

function Tag({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "success" | "warning" | "danger" | "muted" }) {
  const map: Record<string, string> = {
    info:    "bg-primary/10 text-primary border-primary/20",
    success: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    danger:  "bg-destructive/10 text-destructive border-destructive/20",
    muted:   "bg-muted text-muted-foreground border-border",
  };
  return <span className={`inline-flex items-center gap-1 px-2 h-5 rounded-full border text-[11px] font-medium ${map[tone]}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{children}</span>;
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="bg-muted/40">
            {headers.map((h, i) => <th key={i} className="text-left px-3 py-2 font-medium text-muted-foreground border-b">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20 border-b last:border-b-0">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 align-top text-foreground/90">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────
   主页面
   ────────────────────────────────────────────── */

export default function EntitlementPRD() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-72px 0px -65% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) { refs.current[s.id] = el; obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);

  const goto = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-4">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag tone="info">PRD</Tag>
              <Tag tone="success">v1.0 · Released</Tag>
              <Tag tone="muted">作者：权益产品组</Tag>
              <Tag tone="muted">2026-05-08</Tag>
            </div>
            <h1 className="text-[26px] font-bold text-foreground leading-tight">权益管理系统 · 完整产品 PRD</h1>
            <p className="text-[13.5px] text-muted-foreground max-w-3xl">
              面向 居然设计家 SaaS 平台，覆盖 <b className="text-foreground">应用 → 能力 → 规则 → 权益产品 → 权益商品 → 套餐 → 订单 → 账户</b> 全链路。
              本文档作为前后端联调、数据建仓、运营落地的统一蓝本，要求逻辑自洽、可观测、可演进。
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 min-w-[420px]">
            {[
              { label: "应用", v: 5,  icon: Zap },
              { label: "能力", v: 30, icon: Boxes },
              { label: "规则", v: 70, icon: ListTree },
              { label: "权益产品", v: 30, icon: Package },
              { label: "商品", v: 14, icon: ShoppingCart },
              { label: "套餐", v: 8,  icon: TagIcon },
              { label: "订单", v: 11, icon: FileText },
              { label: "账户", v: 5,  icon: Wallet },
            ].map((k) => (
              <div key={k.label} className="bg-background/60 border rounded-lg p-2.5 backdrop-blur">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]"><k.icon className="h-3 w-3" />{k.label}</div>
                <div className="text-[18px] font-bold text-primary mt-0.5">{k.v}<span className="text-[11px] text-muted-foreground ml-0.5">+</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {/* 主体内容 */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 1. 文档信息 */}
          <Floor id="overview">
            <H2 num="01" icon={BookOpen}>文档信息</H2>
            <Card>
              <Table
                headers={["项", "内容"]}
                rows={[
                  ["文档版本", <span className="font-mono">v1.0.0</span>],
                  ["关联系统", "居然设计家 / 居然之家·门店端 / AI设计家 / 智能导购 / 精准客资"],
                  ["前置依赖", "企业管理、人员管理、权限管理、客户CRM、订单中心"],
                  ["目标读者", "后端工程师 · 数据工程师 · 客户端工程师 · 产品运营 · QA"],
                  ["阅读约定", "Mock 数据见 src/data/entitlement.ts；前端蓝本对应路由 /entitlement/*"],
                ]}
              />
            </Card>
          </Floor>

          {/* 2. 业务背景 */}
          <Floor id="background">
            <H2 num="02" icon={Target}>业务背景与目标</H2>
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <H3>业务现状</H3>
                <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                  <li>多端能力（3D工具、AI、导购、客资）权益规则散落</li>
                  <li>同一能力被多商品共用，规则维护成本高</li>
                  <li>订单、积分、企业入驻三套发放路径无统一对账</li>
                  <li>账户消耗无法回溯到 SKU/订单源</li>
                </ul>
              </Card>
              <Card>
                <H3>核心目标</H3>
                <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                  <li>一套数据模型贯穿 8 层链路</li>
                  <li>规则可复用、产品可拼装、商品可售卖</li>
                  <li>账户消耗可溯源到订单 / 商品 / 规则</li>
                  <li>领域事件外发，支撑 BI、画像、风控</li>
                </ul>
              </Card>
              <Card>
                <H3>北极星指标</H3>
                <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                  <li><b className="text-foreground">配置效率</b>：新能力上线 ≤ 1 工作日</li>
                  <li><b className="text-foreground">账户健康度</b>：≥ 80% 客户健康分 ≥ 70</li>
                  <li><b className="text-foreground">续费率</b>：旗舰会员年度续费 ≥ 75%</li>
                  <li><b className="text-foreground">对账误差</b>：日终订单/账户对账 0 异常</li>
                </ul>
              </Card>
            </div>
          </Floor>

          {/* 3. 术语 */}
          <Floor id="glossary">
            <H2 num="03" icon={Hash}>术语与核心概念</H2>
            <Card>
              <Table
                headers={["术语", "英文 / Code", "定义", "示例"]}
                rows={[
                  [<b>应用</b>, "Application", "业务前台单元，是权益隔离的最大边界", "国内3D工具 / AI设计家"],
                  [<b>能力</b>, "Capability", "技术能力点，绑定 API 与数据类型（计数/布尔/存储）", "AI设计 / 4K渲染 / 云存储"],
                  [<b>规则</b>, "EntitlementRule", "额度 + 周期 + 发放策略的最小可发放单元", "AI设计 500 次/日"],
                  [<b>权益产品</b>, "Product", "面向「交易」的最小权益封装（付费 / 积分 / 免费）", "旗舰会员权益包"],
                  [<b>商品</b>, "SKU", "可独立售卖的对客单元，引用权益产品", "旗舰会员·月卡"],
                  [<b>套餐</b>, "Bundle", "多 SKU 组合，可跨应用", "全球设计组合（国内+国际+AI）"],
                  [<b>订单</b>, "Order", "购买/发放/兑换的事务单据", "ORD202603120001"],
                  [<b>账户</b>, "Account", "按客户聚合的权益持有视图", "欧派家居 · 权益账户"],
                ]}
              />
            </Card>
          </Floor>

          {/* 4. 系统蓝图 */}
          <Floor id="blueprint">
            <H2 num="04" icon={Network}>系统蓝图 · 模式设计</H2>
            <Card>
              <H3>双视角模型</H3>
              <p className="text-[13px] text-muted-foreground mb-3">
                平台采用 <b className="text-foreground">「配置侧 / 履约侧」分层 + 「平台 / 企业」双视角</b> 的模式。
                配置侧负责供给（应用/能力/规则/产品/商品/套餐），履约侧负责消费（订单/账户/事件）。
              </p>
              <Pre>{`┌─────────────────────────────────────────────────────────────┐
│                       配置侧（供给层）                       │
│                                                              │
│   应用  ──▶  能力  ──▶  规则  ──▶  权益产品  ──▶  商品 / 套餐 │
│   (App)     (Cap)      (Rule)      (Product)      (SKU/Bun) │
└──────────────────────────────────┬──────────────────────────┘
                                    │  上架 / 发布
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                       履约侧（消费层）                       │
│                                                              │
│   订单 ──▶ 发放 ──▶ 账户额度 ──▶ 消耗 ──▶ 计费/结算 ──▶ 续费  │
│   (Order)  (Grant) (Account)   (Usage)   (Settle)  (Renew)  │
└──────────────────────────────────┬──────────────────────────┘
                                    │  事件总线
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│           数据资产 · 客户画像 · 风控 · BI · 运营             │
└─────────────────────────────────────────────────────────────┘`}</Pre>
            </Card>

            <Card>
              <H3>四种交易模式</H3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { t: "付费售卖", c: "user_purchase", d: "用户/企业自购，走支付", tone: "info" as const },
                  { t: "积分兑换", c: "credit", d: "积分 → 权益产品，扣减积分账户", tone: "warning" as const },
                  { t: "内部发放", c: "internal_grant", d: "运营人工签核发放", tone: "success" as const },
                  { t: "企业入驻", c: "enterprise_grant", d: "随企业审核状态联动放行", tone: "muted" as const },
                ].map((m) => (
                  <div key={m.c} className="border rounded-lg p-3 bg-muted/20">
                    <Tag tone={m.tone}>{m.t}</Tag>
                    <div className="font-mono text-[11px] text-muted-foreground mt-2">{m.c}</div>
                    <div className="text-[12.5px] text-foreground/85 mt-1.5">{m.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </Floor>

          {/* 5. 分层架构 */}
          <Floor id="architecture">
            <H2 num="05" icon={Layers}>分层架构</H2>
            <Card>
              <Pre>{`┌──────────────────────── 表现层（Web/APP/小程序） ────────────────────────┐
│   管理后台 · 商家工作台 · C端商城 · 设计师端 · 门店导购                  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTPS · JWT(enterprise_id, role)
┌────────────────────────────────────▼─────────────────────────────────────┐
│                       BFF / Gateway（鉴权 · 限流 · 缓存）                │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
┌────────────────┬────────────────┬──┴─────────────┬─────────────┬────────┐
│  应用域         │  能力域         │  规则/产品域    │  交易域      │ 账户域 │
│ AppService     │ CapService     │ RuleService    │ OrderSvc     │ AcctSvc│
│ CapMapping     │ ApiBinding     │ ProductSvc     │ PaymentSvc   │ UsageSvc│
│                │ ConsumePolicy  │ SkuSvc/Bundle  │ AuditSvc     │ GrantSvc│
└──────┬─────────┴──────┬─────────┴──────┬─────────┴──────┬──────┴────┬───┘
       │                │                │                │           │
       ▼                ▼                ▼                ▼           ▼
┌────────────────────────────────────────────────────────────────────────┐
│   PostgreSQL（主库 · RLS）  ·  Redis（额度/积分热数据）  · Kafka(事件)│
│   ClickHouse（行为/消耗）   ·  OSS（凭证/对账）          · ES（检索）│
└────────────────────────────────────────────────────────────────────────┘`}</Pre>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <H3>领域划分原则</H3>
                <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                  <li><b>应用域</b>：管理 App 元数据，是权益隔离边界</li>
                  <li><b>能力域</b>：能力定义 + API 绑定 + 消耗策略</li>
                  <li><b>规则/产品域</b>：可复用的额度规则与权益封装</li>
                  <li><b>交易域</b>：订单状态机、审核、支付、对账</li>
                  <li><b>账户域</b>：发放、额度、消耗记账（行级幂等）</li>
                </ul>
              </Card>
              <Card>
                <H3>关键约束</H3>
                <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                  <li>额度变更必须经过账户域，不允许跨域直写</li>
                  <li>所有发放/消耗以 <code className="text-primary font-mono text-[11.5px]">order_id</code> + <code className="text-primary font-mono text-[11.5px]">trace_id</code> 幂等</li>
                  <li>RLS 强制按 <code className="text-primary font-mono text-[11.5px]">enterprise_id</code> 隔离</li>
                  <li>领域事件统一通过 Kafka 外发</li>
                </ul>
              </Card>
            </div>
          </Floor>

          {/* 6. 数据结构 */}
          <Floor id="datamodel">
            <H2 num="06" icon={Database}>数据结构 · ER</H2>
            <Card>
              <H3>核心 ER 关系</H3>
              <Pre>{`Application(1) ───< Capability(N) ───< EntitlementRule(N)
                                              │
                                              │ N:M (product_rule_ref)
                                              ▼
                                         Product(N)
                                              │
                                              │ N:M (sku_product_ref)
                                              ▼
                                          SKU(N) ───< BundleItem >─── Bundle
                                              │
                                              │ 引用
                                              ▼
                                      OrderItem ──▶ Order(1) ──▶ Account
                                                                    │
                                                                    │ 1:N
                                                                    ▼
                                                         AccountCapability
                                                         (totalQuota / used /
                                                          sourceOrderIds[])`}</Pre>
            </Card>

            <Card>
              <H3>关键表字段（节选）</H3>
              <Table
                headers={["表名", "关键字段", "说明"]}
                rows={[
                  ["application",        "id, code, name, status",                                      "应用元数据"],
                  ["capability",         "id, app_id, code, data_type(COUNTER/BOOLEAN/STORAGE/DURATION), unit, api_path, consume_per_use", "能力 = 技术绑定"],
                  ["entitlement_rule",   "id, capability_id, quota, period_type(DAY/MONTH/YEAR/PERMANENT), grant_type, expire_policy", "额度+周期+策略"],
                  ["product",            "id, app_id, exchange_type(paid/credit/free), credit_price, limit_per_user, status", "权益封装"],
                  ["product_rule_ref",   "product_id, rule_id (PK 复合)",                              "N:M"],
                  ["sku",                "id, app_id, price, billing_cycle(once/monthly/yearly), sales_status, sort_order", "面向交易"],
                  ["sku_product_ref",    "sku_id, product_id (PK 复合)",                               "N:M"],
                  ["bundle / bundle_item","bundle_id, sku_id, quantity",                               "套餐组合"],
                  ["order",              "id, order_no, customer_type, customer_id, order_type, audit_status, payment_status, order_status, total_amount, credit_amount, expire_at, linked_enterprise_id", "三维状态解耦"],
                  ["order_item",         "order_id, type(sku/bundle/product), item_id, quantity, unit_price", "订单行"],
                  ["entitlement_account","id, customer_id, customer_type, app_ids[], status",         "客户聚合"],
                  ["account_capability", "account_id, capability_id, rule_id, total_quota, used_quota, expire_at, source_order_ids[]", "额度持有 + 溯源"],
                  ["allocation_record",  "order_id, item_id, capability_count, instance_count, usage_rate, allocated_at", "发放快照"],
                  ["usage_log",          "id, account_id, capability_id, amount, biz_ref, created_at", "ClickHouse · 消耗流水"],
                ]}
              />
            </Card>
          </Floor>

          {/* 7. 能力地图 */}
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
              <H3>能力数据类型</H3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { t: "COUNTER", d: "计数型，按次扣减", e: "AI设计·次", tone: "info" as const },
                  { t: "BOOLEAN", d: "布尔开关，授权即可用", e: "全屋模型库", tone: "success" as const },
                  { t: "STORAGE", d: "存储型，按 MB 计量", e: "云存储 4GB", tone: "warning" as const },
                  { t: "DURATION", d: "时长型，按秒/分钟", e: "实时渲染时长", tone: "muted" as const },
                ].map((d) => (
                  <div key={d.t} className="border rounded-lg p-3 bg-muted/20">
                    <Tag tone={d.tone}>{d.t}</Tag>
                    <div className="text-[12.5px] text-foreground/85 mt-2">{d.d}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">例：{d.e}</div>
                  </div>
                ))}
              </div>
            </Card>
          </Floor>

          {/* 8. SOP */}
          <Floor id="sop">
            <H2 num="08" icon={Workflow}>主链路 SOP（5 条核心链路）</H2>

            {[
              {
                t: "SOP-1 · 配置上架",
                steps: ["登记应用", "定义能力 + API 绑定", "创建规则（额度+周期+策略）", "封装权益产品（选规则 N:M）", "建立商品 SKU（选权益产品 N:M）", "可选：组合套餐", "上架发布"],
                actor: "权益运营",
              },
              {
                t: "SOP-2 · 用户购买（含支付）",
                steps: ["用户加购 SKU/Bundle", "提交订单 → 自动审核（auto_approved）", "唤起支付 → paid", "履约引擎按 SKU→Product→Rule 发放", "写入 account_capability", "外发 ENTITLEMENT_GRANTED 事件"],
                actor: "C/B 端用户",
              },
              {
                t: "SOP-3 · 内部发放（含审核）",
                steps: ["运营创建 internal_grant 订单", "提交 → pending_audit", "主管审核：approve / reject", "通过即发放，外发事件"],
                actor: "权益运营 · 主管",
              },
              {
                t: "SOP-4 · 企业入驻联动",
                steps: ["企业入驻申请 → 同步生成 enterprise_grant 订单", "审核状态 follow_enterprise（跟随企业）", "企业审核通过 → 订单 enterprise_approved → 自动发放", "企业被冻结 → 联动冻结订单/账户"],
                actor: "企业管理 + 权益域",
              },
              {
                t: "SOP-5 · 消耗扣减",
                steps: ["业务前台调用能力 API（携带 customer_id）", "BFF 调 UsageSvc 预扣", "Redis 原子 DECRBY 校验额度", "落库 usage_log（CK）+ 更新 account_capability.used", "异常触发补偿：回滚预扣"],
                actor: "业务系统",
              },
            ].map((sop, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between mb-3">
                  <H3>{sop.t}</H3>
                  <Tag tone="muted">参与方：{sop.actor}</Tag>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sop.steps.map((s, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[12px] text-primary font-medium flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">{j + 1}</span>
                        {s}
                      </div>
                      {j < sop.steps.length - 1 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </Floor>

          {/* 9. 数据资产 */}
          <Floor id="dataasset">
            <H2 num="09" icon={BarChart3}>数据资产分层</H2>
            <Card>
              <Pre>{`ADS  ── 应用层 ─── 客户健康分 / 续费预测 / ROI / 高价值客户名单 / 风险预警
DWS  ── 汇总层 ─── 客户·应用·日 消耗汇总 / 订单·企业·月 收入汇总
DWD  ── 明细层 ─── order_fact / usage_fact / grant_fact / refund_fact
ODS  ── 贴源层 ─── order_cdc / account_cdc / usage_kafka_log / app_log
                    （Debezium CDC + Kafka）
SRC  ── 源系统 ─── PostgreSQL · Redis · ClickHouse · 业务网关日志`}</Pre>
            </Card>
            <Card>
              <H3>数据资产清单</H3>
              <Table
                headers={["资产", "粒度", "用途", "归属"]}
                rows={[
                  ["dwd_order_fact",       "订单+订单行",     "收入分析、对账",         "数据组"],
                  ["dwd_usage_fact",       "客户+能力+小时",  "消耗趋势、风控",         "数据组"],
                  ["dws_customer_da",      "客户+应用+日",    "健康分、续费预测",       "数据组"],
                  ["ads_health_score",     "客户",           "BI驾驶舱、画像主表",     "增长组"],
                  ["ads_renewal_alert",    "客户",           "运营预警、客成 SOP",     "客成组"],
                  ["ads_revenue_segment",  "企业类型+应用+月", "营销分群、定价",        "运营组"],
                ]}
              />
            </Card>
          </Floor>

          {/* 10. 客户画像 */}
          <Floor id="portrait">
            <H2 num="10" icon={Users}>客户画像 + 特征工程管道</H2>
            <Card>
              <H3>四维特征体系</H3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { t: "基础属性", e: ["企业类型", "规模", "城市", "入驻时长"] },
                  { t: "持有特征", e: ["应用数", "活跃SKU", "套餐组合", "总额度"] },
                  { t: "行为特征", e: ["日均使用", "周活率", "高峰能力", "登录间隔"] },
                  { t: "价值特征", e: ["LTV", "续费历史", "升级路径", "投诉次数"] },
                ].map((f) => (
                  <div key={f.t} className="border rounded-lg p-3 bg-muted/20">
                    <div className="font-semibold text-[13px] text-foreground mb-2">{f.t}</div>
                    {f.e.map((x) => <div key={x} className="text-[12px] text-muted-foreground py-0.5 flex items-center gap-1.5"><CircleDot className="h-3 w-3 text-primary" />{x}</div>)}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <H3>特征工程管道</H3>
              <Pre>{`原始事件 (Kafka) ──▶ Flink 实时聚合 ──▶ Feature Store (Redis + ClickHouse)
                                              │
                ┌─────────────────────────────┴────────────────────────────┐
                ▼                                                          ▼
        实时特征（秒级）                                            离线特征（T+1）
        · 当前已用额度比                                          · 30/60/90 日活跃
        · 最近1小时调用频次                                       · 续费概率
        · 实时风险信号                                            · 客户分群标签
                                                                  
        ──▶ 健康分模型（XGBoost）─▶ 健康度 + 风险因子 + 机会清单 ─▶ ads_health_score
        ──▶ 续费预测模型 ─▶ 续费概率 + 推荐升级路径 ─▶ ads_renewal_alert
        ──▶ 关联推荐 ─▶ "买了 sku8 的客户也常买 sku51" ─▶ 推荐位`}</Pre>
            </Card>
            <Card>
              <H3>健康分算法（v1）</H3>
              <Pre>{`HealthScore = 0.30 × 使用活跃度
            + 0.25 × 额度健康（避免 ≥80% 长期透支）
            + 0.20 × 续费历史
            + 0.15 × 升级意向信号
            + 0.10 × 客诉负向

等级：≥85 优秀 · 70-84 良好 · 50-69 警示 · <50 危险`}</Pre>
            </Card>
          </Floor>

          {/* 11. 事件 */}
          <Floor id="events">
            <H2 num="11" icon={Radio}>事件总线 · 领域事件契约</H2>
            <Card>
              <H3>Topic 与事件清单</H3>
              <Table
                headers={["Topic", "事件名", "触发", "下游消费"]}
                rows={[
                  ["entitlement.config",   "AppCreated / CapCreated / RuleChanged / ProductPublished / SkuOnSale", "配置变更", "搜索ES、缓存刷新、BI"],
                  ["entitlement.order",    "OrderCreated / OrderAuditPassed / OrderPaid / OrderCancelled / OrderRefunded", "订单状态机迁移", "履约、对账、画像"],
                  ["entitlement.grant",    "EntitlementGranted / EntitlementRevoked / EntitlementExpired",          "发放/回收/过期",     "账户、积分、CRM"],
                  ["entitlement.usage",    "CapabilityConsumed / QuotaWarned (≥80%) / QuotaExhausted",              "实时消耗",           "风控、健康分、提醒"],
                  ["entitlement.account",  "AccountAggregated / AccountFrozen / AccountResumed",                    "账户级状态",         "BI、企业管理"],
                ]}
              />
            </Card>
            <Card>
              <H3>事件 Schema（Avro 风格）</H3>
              <Pre>{`{
  "namespace": "platform.entitlement",
  "name": "EntitlementGranted",
  "fields": [
    { "name": "event_id",        "type": "string",  "doc": "雪花ID" },
    { "name": "occurred_at",     "type": "long",    "doc": "ms 时间戳" },
    { "name": "trace_id",        "type": "string" },
    { "name": "tenant",          "type": "string",  "doc": "enterprise_id 或 platform" },
    { "name": "order_id",        "type": "string" },
    { "name": "customer_id",     "type": "string" },
    { "name": "customer_type",   "type": "enum",    "symbols": ["B", "C"] },
    { "name": "app_id",          "type": "string" },
    { "name": "grants",          "type": { "type": "array", "items": {
        "type": "record", "name": "GrantItem", "fields": [
          { "name": "rule_id", "type": "string" },
          { "name": "capability_id", "type": "string" },
          { "name": "quota", "type": "double" },
          { "name": "period_type", "type": "string" },
          { "name": "expire_at", "type": ["null", "long"] }
        ]
      }}
    },
    { "name": "source",          "type": "enum",    "symbols": ["PURCHASE","INTERNAL","ENTERPRISE","CREDIT","SYSTEM"] }
  ]
}`}</Pre>
            </Card>
            <Card>
              <H3>事件传输保证</H3>
              <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                <li><b>顺序</b>：按 <code className="font-mono text-[11.5px] text-primary">customer_id</code> 哈希分区</li>
                <li><b>幂等</b>：消费方按 <code className="font-mono text-[11.5px] text-primary">event_id</code> 去重，至少投递一次</li>
                <li><b>追踪</b>：全链路 <code className="font-mono text-[11.5px] text-primary">trace_id</code> 透传</li>
                <li><b>容灾</b>：DLQ 死信队列 + 7 天保留 + 重放工具</li>
              </ul>
            </Card>
          </Floor>

          {/* 12. 页面设计 */}
          <Floor id="pages">
            <H2 num="12" icon={FileText}>页面设计详情</H2>
            {[
              { p: "/entitlement/dashboard", t: "数据看板",   k: "KPI 卡 · 收入趋势 · 应用占比 · 健康度热力 · 高价值客户 TOP10" },
              { p: "/entitlement/app",       t: "应用管理",   k: "列表 + 抽屉编辑；详情：能力数 · 关联商品 · 状态切换" },
              { p: "/entitlement/capability",t: "能力管理",   k: "FilterBar(应用/数据类型) · 列：编码/API/消耗系数 · 详情含规则使用矩阵" },
              { p: "/entitlement/rule",      t: "权益规则",   k: "策略派生（grantType + expirePolicy 由 periodType 自动派生） · 被引用产品数" },
              { p: "/entitlement/product",   t: "权益产品",   k: "三类 ExchangeType · 关联规则 N:M · 列：规则数 / 被引用商品数" },
              { p: "/entitlement/sku",       t: "权益商品",   k: "选品弹窗：仅显示 paid+active 权益产品 · 列：关联权益产品 / 计费周期" },
              { p: "/entitlement/package",   t: "套餐管理",   k: "多 SKU + 数量 + 跨应用 · 原价/折扣价" },
              { p: "/entitlement/order",     t: "订单管理",   k: "三维状态：审核/支付/生命周期 · 时间线 · 跟随企业审核" },
              { p: "/entitlement/account",   t: "权益账户",   k: "客户聚合 · 应用维度切片 · 健康分 · 来源订单溯源 sourceOrderIds" },
            ].map((pg) => (
              <Card key={pg.p}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-[14px] font-semibold text-foreground">{pg.t}</h4>
                      <code className="text-[11px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{pg.p}</code>
                    </div>
                    <p className="text-[12.5px] text-foreground/80">{pg.k}</p>
                  </div>
                  <Tag tone="success">已实现</Tag>
                </div>
              </Card>
            ))}
            <Card>
              <H3>统一交互规范</H3>
              <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                <li>列表：<b>FilterBar + AdminTable + Pagination + PageHeader</b> 标准三件套</li>
                <li>列表行操作：最多 3 个内联，其余收纳；危险操作必须二次确认</li>
                <li>表单：分组卡片布局，标签 100px 右对齐（复杂场景 120px）</li>
                <li>徽章：rounded-full 胶囊 + 1.5h 实心圆点（info/success/warning/danger）</li>
                <li>详情页：DetailActionBar 操作中枢 + 楼层导航 Scroll-Spy</li>
              </ul>
            </Card>
          </Floor>

          {/* 13. 数据逻辑 */}
          <Floor id="datalogic">
            <H2 num="13" icon={GitBranch}>数据逻辑与状态机</H2>
            <Card>
              <H3>订单三维状态解耦</H3>
              <Pre>{`auditStatus      ┬─ auto_approved（用户购买）
                 ├─ pending_audit  ─▶ approved / rejected （内部发放）
                 └─ follow_enterprise ─▶ enterprise_approved / enterprise_rejected

paymentStatus    ┬─ no_payment（免费/内部/企业）
                 ├─ pending ─▶ paid / cancelled
                 └─ refunded

orderStatus      ┬─ pending_effect（待生效）
                 ├─ active（生效中）
                 ├─ suspended / expired / cancelled / closed`}</Pre>
            </Card>
            <Card>
              <H3>规则策略派生（重要）</H3>
              <Pre>{`periodType   ─▶  grantType         ─▶  expirePolicy
─────────────────────────────────────────────────
DAY            DAILY_REFRESH         CLEAR_ON_EXPIRE
MONTH          MONTHLY_GRANT         CLEAR_ON_EXPIRE
YEAR           MONTHLY_GRANT         CLEAR_ON_EXPIRE
PERMANENT      ONE_TIME              NEVER_EXPIRE

deriveRulePolicy(periodType) -> 仅展示，禁止用户单独覆盖`}</Pre>
            </Card>
            <Card>
              <H3>账户额度合并规则</H3>
              <ul className="text-[13px] space-y-1.5 text-foreground/85 list-disc pl-4">
                <li>同 (capability_id, rule_id) 多次发放：<b>累加 totalQuota</b>，sourceOrderIds 追加</li>
                <li>不同 rule 即使能力一致：<b>独立持有</b>（规则即"账目"）</li>
                <li>过期：DAILY 每日 00:00 重置 used；ONE_TIME + CLEAR_ON_EXPIRE 到期清零</li>
                <li>消耗顺序：<b>先扣即将到期 → 再扣周期型 → 最后扣永久型</b></li>
              </ul>
            </Card>
          </Floor>

          {/* 14. 技术架构 */}
          <Floor id="tech">
            <H2 num="14" icon={Cpu}>技术架构</H2>
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <H3 ><Server className="inline h-3.5 w-3.5 mr-1" />后端</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>Spring Boot 3.x · Java 21</li>
                  <li>Spring Cloud Gateway（BFF）</li>
                  <li>MyBatis-Plus + Flyway 迁移</li>
                  <li>Sentinel 限流 / 熔断</li>
                  <li>Spring Statemachine（订单状态机）</li>
                </ul>
              </Card>
              <Card>
                <H3><Database className="inline h-3.5 w-3.5 mr-1" />存储</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>PostgreSQL 主库（RLS + JSONB）</li>
                  <li>Redis 7 集群（额度/积分/限流）</li>
                  <li>ClickHouse（usage 流水 + BI）</li>
                  <li>Elasticsearch（订单/产品检索）</li>
                  <li>OSS（合同/凭证/对账文件）</li>
                </ul>
              </Card>
              <Card>
                <H3><Cloud className="inline h-3.5 w-3.5 mr-1" />中间件</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>Kafka（事件总线）</li>
                  <li>Debezium（CDC → Kafka）</li>
                  <li>Flink（实时特征）</li>
                  <li>Apollo / Nacos（配置中心）</li>
                  <li>SkyWalking（APM）</li>
                </ul>
              </Card>
            </div>
            <Card>
              <H3>关键设计决策</H3>
              <Table
                headers={["决策点", "方案", "理由"]}
                rows={[
                  ["额度扣减并发", "Redis Lua 原子脚本 + DB 异步对账", "高并发 / 强一致替代方案"],
                  ["订单幂等",     "客户端 idempotency_key + 唯一索引",   "防止重复支付/重复发放"],
                  ["跨域事务",     "本地事务 + 事件驱动 + Saga 补偿",     "避免分布式事务"],
                  ["数据隔离",     "PG Row-Level Security + has_role()",  "企业租户安全"],
                  ["大额度账户",   "分桶（hot / cold）+ 批量同步",        "减少热点行锁"],
                ]}
              />
            </Card>
          </Floor>

          {/* 15. 接口 */}
          <Floor id="api">
            <H2 num="15" icon={Code2}>接口设计（节选）</H2>
            <Card>
              <Table
                headers={["Method", "Path", "说明", "权限"]}
                rows={[
                  ["GET",  "/api/v1/entitlement/apps",                    "应用列表",         "platform.entitlement.app:read"],
                  ["POST", "/api/v1/entitlement/capabilities",            "创建能力",         "platform.entitlement.cap:write"],
                  ["GET",  "/api/v1/entitlement/rules?capId=&period=",    "规则查询",         "platform.entitlement.rule:read"],
                  ["POST", "/api/v1/entitlement/products",                "创建权益产品（N:M）", "platform.entitlement.product:write"],
                  ["POST", "/api/v1/entitlement/skus",                    "创建商品（含权益产品引用）", "platform.entitlement.sku:write"],
                  ["POST", "/api/v1/entitlement/orders",                  "下单（idempotency-key）", "tenant.order:write"],
                  ["POST", "/api/v1/entitlement/orders/{id}/audit",       "审核（pass/reject）", "platform.audit:approve"],
                  ["POST", "/api/v1/entitlement/usage:consume",           "消耗扣减（Redis Lua）", "internal.bff"],
                  ["GET",  "/api/v1/entitlement/accounts/{customerId}",   "账户聚合视图",     "tenant.self / platform.read"],
                  ["POST", "/api/v1/entitlement/accounts/{id}:freeze",    "账户冻结",         "platform.account:admin"],
                ]}
              />
            </Card>
            <Card>
              <H3>统一返回结构</H3>
              <Pre>{`{
  "code": 0,
  "message": "ok",
  "data": { ... },
  "trace_id": "5b9c..."
}

错误码段：
  0       成功
  4xx     业务错误（4001 余额不足 / 4002 重复下单 / 4003 风控拦截）
  5xx     系统错误`}</Pre>
            </Card>
          </Floor>

          {/* 16. NFR */}
          <Floor id="nfr">
            <H2 num="16" icon={ShieldCheck}>非功能性需求</H2>
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <H3><Gauge className="inline h-3.5 w-3.5 mr-1" />性能</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>消耗扣减 P99 ≤ 30ms（Redis Lua）</li>
                  <li>账户查询 P99 ≤ 80ms</li>
                  <li>发放峰值 ≥ 5000 TPS（含事件外发）</li>
                  <li>事件投递端到端 ≤ 1s</li>
                </ul>
              </Card>
              <Card>
                <H3><Lock className="inline h-3.5 w-3.5 mr-1" />安全</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>JWT 含 enterprise_id；PG RLS 强制隔离</li>
                  <li>用户角色独立表 user_roles + has_role()</li>
                  <li>敏感字段加密（手机号、身份证）</li>
                  <li>所有写操作埋审计日志</li>
                </ul>
              </Card>
              <Card>
                <H3><Activity className="inline h-3.5 w-3.5 mr-1" />可观测</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>全链路 trace_id；APM SkyWalking</li>
                  <li>Prometheus + Grafana 指标</li>
                  <li>日志：JSON 结构化 → ELK</li>
                  <li>对账日报：T+1 自动产出 + 邮件告警</li>
                </ul>
              </Card>
              <Card>
                <H3><Sparkles className="inline h-3.5 w-3.5 mr-1" />可用性</H3>
                <ul className="text-[12.5px] space-y-1 text-foreground/85 list-disc pl-4">
                  <li>核心链路 SLA 99.95%</li>
                  <li>多 AZ + 主备切换 RTO ≤ 5min</li>
                  <li>Chaos Engineering 月度演练</li>
                  <li>降级开关：消耗扣减异常时快速通行 + 后置补扣</li>
                </ul>
              </Card>
            </div>
          </Floor>

          {/* 17. 里程碑 */}
          <Floor id="milestone">
            <H2 num="17" icon={Rocket}>里程碑与排期</H2>
            <Card>
              <Table
                headers={["阶段", "周期", "交付物", "DoD"]}
                rows={[
                  ["M1 · 数据建模",    "T0 + 1w",   "DDL + 迁移脚本 + 单测",                 "迁移可重复执行 / 覆盖率 ≥ 80%"],
                  ["M2 · 配置侧域",    "T0 + 3w",   "App/Cap/Rule/Product/SKU/Bundle 服务 + API", "通过前端 Mock 接管"],
                  ["M3 · 交易侧域",    "T0 + 5w",   "Order 状态机 + 支付/审核/履约 + 幂等",  "三维状态解耦联调通过"],
                  ["M4 · 账户侧域",    "T0 + 7w",   "AccountSvc + UsageSvc + Redis Lua",     "压测达标（30ms / 5000TPS）"],
                  ["M5 · 事件 + BI",   "T0 + 9w",   "Kafka 事件契约 + Flink 实时特征",       "健康分跑通 + 看板上线"],
                  ["M6 · 灰度上线",    "T0 + 11w",  "灰度名单 + 双写对账 + 一键回滚",        "对账误差 0 / SLA 达标"],
                ]}
              />
            </Card>
          </Floor>

          <div className="text-center text-[12px] text-muted-foreground py-8 border-t mt-10">
            — 文档结束 · 修改请走 Git PR 流程，重大变更需评审 —
          </div>
        </div>

        {/* 右侧楼层导航 */}
        <aside className="w-[220px] shrink-0 hidden lg:block">
          <div className="sticky top-[72px]">
            <Card className="!p-3">
              <div className="text-[11px] text-muted-foreground font-mono mb-2 px-1.5">大纲 · TOC</div>
              <nav className="space-y-0.5 max-h-[calc(100vh-160px)] overflow-y-auto">
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  const isActive = active === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => goto(s.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-[12px] flex items-center gap-2 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-muted-foreground hover:bg-muted/60 border-l-2 border-transparent"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
