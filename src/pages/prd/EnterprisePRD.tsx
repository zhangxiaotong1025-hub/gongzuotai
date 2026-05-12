import { useEffect, useState } from "react";
import {
  FileText,
  Network,
  Activity,
  Database,
  GitBranch,
  Rocket,
} from "lucide-react";
import { Card, H2, H3, H4, KV, Pre, Stat, Table, Tag, Code, SeqLine } from "./entitlement/parts";

/* ──────────────────────────────────────────────
   企业管理 PRD · 单页平铺
   关注「看不见」的逻辑：状态解耦、级联冻结、
   编辑期不可变字段、正向 / 逆向流、数据所有权迁移
   ────────────────────────────────────────────── */

const TOC: { id: string; label: string; icon: React.ElementType; children: { id: string; label: string }[] }[] = [
  { id: "overview", label: "01 · 设计总论", icon: FileText, children: [
    { id: "ov-why", label: "为什么单独成模" },
    { id: "ov-axiom", label: "5 条不可违反的公理" },
    { id: "ov-glossary", label: "术语校准" },
    { id: "ov-scope", label: "本模块边界与上下游" },
  ]},
  { id: "blueprint", label: "02 · 系统蓝图", icon: Network, children: [
    { id: "bp-types", label: "6 类企业 & 准入路径" },
    { id: "bp-tree", label: "3 级层级 & 角色关系" },
    { id: "bp-page", label: "页面地图与权限矩阵" },
    { id: "bp-rule", label: "架构层级约束" },
  ]},
  { id: "runtime", label: "03 · 准入与生命周期", icon: Activity, children: [
    { id: "rt-states", label: "三维状态解耦（审核·业务·所有权）" },
    { id: "rt-forward", label: "正向流：申请 → 审核 → 激活" },
    { id: "rt-reverse", label: "逆向流：驳回 / 停用 / 冻结" },
    { id: "rt-cascade", label: "级联冻结与解冻" },
    { id: "rt-matrix", label: "状态 × 操作可见性矩阵" },
  ]},
  { id: "data", label: "04 · 数据模型与归属", icon: Database, children: [
    { id: "dm-er", label: "ER 全景" },
    { id: "dm-ddl", label: "核心 DDL" },
    { id: "dm-own", label: "数据归属与租户隔离 RLS" },
    { id: "dm-audit", label: "审计轨迹（AuditRecord）" },
  ]},
  { id: "edit", label: "05 · 编辑与变更逻辑", icon: GitBranch, children: [
    { id: "ed-principle", label: "编辑即创建？不，要分级" },
    { id: "ed-fields", label: "字段三态：可变 / 弱可变 / 不可变" },
    { id: "ed-entitlement", label: "权益编辑：只读 + 订单驱动" },
    { id: "ed-hierarchy", label: "层级变更与归属迁移" },
    { id: "ed-side", label: "副作用与回滚补偿" },
  ]},
  { id: "delivery", label: "06 · 接口·事件·里程碑", icon: Rocket, children: [
    { id: "dl-api", label: "页面 → API 映射表" },
    { id: "dl-event", label: "领域事件" },
    { id: "dl-error", label: "幂等 / 异常 / SLO" },
    { id: "dl-gantt", label: "落地里程碑" },
  ]},
];

export default function EnterprisePRD() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const ids = TOC.flatMap((t) => [t.id, ...t.children.map((c) => c.id)]);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex gap-8">
      <aside className="w-[200px] shrink-0 hidden lg:block">
        <div className="sticky top-2">
          <div className="px-1">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-3 pl-2">Enterprise PRD</div>
            <nav className="max-h-[calc(100vh-80px)] overflow-y-auto pr-1">
              {TOC.map((sec) => {
                const secActive = active === sec.id || sec.children.some((c) => c.id === active);
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
                        {sec.children.map((c) => {
                          const on = active === c.id;
                          return (
                            <button key={c.id} onClick={() => goto(c.id)} className={`w-full text-left pl-2.5 pr-1 py-[3px] text-[10.5px] truncate transition ${on ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"}`}>{c.label}</button>
                          );
                        })}
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
        <Runtime />
        <DataModel />
        <EditFlow />
        <Delivery />
        <div className="text-center text-[12px] text-muted-foreground py-8 border-t">— 企业管理 PRD · v1.0 · 变更走 PR 评审 —</div>
      </main>
    </div>
  );
}

/* ───────────────────────── 01 设计总论 ───────────────────────── */
function Overview() {
  return (
    <section id="overview" className="scroll-mt-4 space-y-5">
      <H2 icon={FileText} num="01">设计总论</H2>

      <div id="ov-why">
        <H3>为什么单独成模</H3>
        <Card>
          <p className="text-[13px] leading-7 text-foreground/85">
            企业是平台的<span className="text-primary font-medium">第一租户实体</span>，承载组织结构、人员归属、品牌关系、权益账户、订单结算、客户数据等全部业务上下文。「企业 = 租户 = 数据围栏」，
            一旦企业实体的状态机被破坏，下游所有模块（权益、客户、人员、营销）都会出现数据穿透、归属错乱、对账失败。本模块的关键不在于「列表 / 表单」这些看得见的元素，
            而在于：状态解耦、级联规则、字段可变性、归属迁移、订单驱动的变更链路。
          </p>
        </Card>
      </div>

      <div id="ov-axiom">
        <H3>6 条不可违反的公理</H3>
        <div className="grid grid-cols-1 gap-2.5">
          {[
            { k: "公理 0 · 平台即上帝视角", v: "平台后台（perspective=platform）拥有全部能力 —— 可代任意企业创建子企业 / 人员 / 商品 / 模型资产 / 调整组织树。安全边界不由「能不能点」收口，而由「权限管理」的角色 × 策略 × 数据范围三层兜底。企业后台（perspective=enterprise）只能在自己企业子树内操作。" },
            { k: "公理 1 · 状态三维解耦", v: "审核状态（pending/approved/rejected）、业务状态（active/disabled）、所有权状态（normal/frozen）相互独立，禁止用单一 status 字段表达。" },
            { k: "公理 2 · 所有真实企业均可停用", v: "停用入口对 Level 0/1/2 全部开放（仅虚拟「平台根节点」除外），由角色权限决定谁能按；总部停用属高危操作，需二次确认 + 审计留痕。" },
            { k: "公理 3 · 到期即自动停用", v: "expire_at ≤ now() 由定时任务把 business_status 自动置 disabled，权益账户 quota.frozen=true；续期成功后由订单事件回写为 active。该流程不经过人工，但会写 AuditRecord(action=auto_disable)。" },
            { k: "公理 4 · 编辑不创订单", v: "企业编辑页面禁止修改权益数量、套餐、到期时间。所有权益变更（增购、续期、回收、赠送）必须通过权益订单，留下 sourceOrderId 溯源。" },
            { k: "公理 5 · 退出而非删除", v: "企业、人员均不支持物理删除。退出（exit）即解除归属 + 软冻结历史数据，保证审计与对账可追溯。" },
            { k: "公理 6 · 级联冻结，不级联停用", v: "冻结父企业 → 子企业级联冻结；停用父企业不级联停用子企业（业务停用是商务行为，需逐个确认）。" },
          ].map((it, i) => (
            <div key={i} className="flex gap-3 border rounded-lg px-3.5 py-2.5 bg-muted/15">
              <div className="text-[12px] font-semibold text-primary w-[160px] shrink-0">{it.k}</div>
              <div className="text-[12.5px] text-foreground/85 leading-6">{it.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="ov-glossary">
        <H3>术语校准</H3>
        <Table
          headers={["术语", "定义", "易混淆点"]}
          rows={[
            ["企业（Enterprise）", "平台租户主体，持有唯一 enterprise_id", "≠ 品牌（Brand），一个企业可代理多个品牌"],
            ["总部（HQ）", "Level=0 的根企业，由平台审核准入", "总部不可被停用，仅可冻结"],
            ["子企业（Child）", "Level=1，由 HQ 创建", "权益可独立配置或继承"],
            ["末级企业（Grandchild）", "Level=2，最大层级，不可再建子级", "支持停用，不支持再创建下级"],
            ["审核状态", "pending / approved / rejected", "驳回（rejected）后允许再次提交审核"],
            ["业务状态", "active / disabled", "由企业管理员或平台手动切换"],
            ["所有权状态", "normal / frozen", "由审计、合规或上级冻结触发，级联生效"],
            ["归属（Ownership）", "人员 / 客户 / 订单与企业之间的多对一关系", "迁移会触发权益重算与审计记录"],
          ]}
        />
      </div>

      <div id="ov-scope">
        <H3>本模块边界与上下游</H3>
        <Pre>{`            ┌─────────────────────────────────────┐
   上游 ──▶ │  入驻申请 (ApplicationList)         │ ──▶ 创建企业
            └─────────────────────────────────────┘
                            │
            ┌───────────────▼────────────────────┐
   本模块   │  企业管理 EnterpriseList / Detail  │
            │   ├─ 组织树（OrgNode）              │
            │   ├─ 人员归属（Staff）              │
            │   ├─ 品牌关系（BrandRelation）      │
            │   └─ 审计轨迹（AuditRecord）        │
            └───────────────┬────────────────────┘
                            │
            ┌───────────────▼────────────────────┐
   下游 ◀── │ 权益账户 · 订单 · 客户 · 营销 · 权限 │
            └─────────────────────────────────────┘`}</Pre>
      </div>
    </section>
  );
}

/* ───────────────────────── 02 系统蓝图 ───────────────────────── */
function Blueprint() {
  return (
    <section id="blueprint" className="scroll-mt-4 space-y-5">
      <H2 icon={Network} num="02">系统蓝图</H2>

      <div id="bp-types">
        <H3>6 类企业 & 准入路径</H3>
        <Table
          headers={["type", "名称", "默认层级", "准入方式", "典型场景"]}
          cols={["80px", "120px", "80px", "180px", undefined]}
          rows={[
            ["brand", "品牌商", "Level 0", "平台审核（线下尽调 + 资质）", "欧派、索菲亚等头部品牌"],
            ["dealer", "经销商", "Level 0/1", "平台审核 或 品牌邀请", "区域代理、城市加盟商"],
            ["decoration", "装企", "Level 0", "平台审核", "整装公司、设计工作室"],
            ["mall", "卖场", "Level 0", "平台直签", "居然之家门店"],
            ["store", "门店", "Level 1/2", "由 dealer/brand 创建", "终端销售网点"],
            ["studio", "工作室", "Level 2", "由 dealer/store 创建", "末级落地团队"],
          ]}
        />
        <div className="text-[11.5px] text-muted-foreground mt-2">
          注：<Code>type</Code> 决定可创建的<span className="text-foreground">子企业类型集合（SUB_TYPE_MAP）</span>，前端按 type 渲染表单字段差异。
        </div>
      </div>

      <div id="bp-tree">
        <H3>3 级层级 & 角色关系</H3>
        <Pre>{`Level 0 · HQ 总部       ╱── 持有所有平台关系（权益、品牌、合同主体）
   │                    ╲── 仅平台可审核 / 冻结，禁止停用
   │
   ├── Level 1 · 子企业  ╱── 由 HQ 创建，可继承或独立配置权益
   │   │                ╲── 支持停用、冻结，被冻结时子级级联冻结
   │   │
   │   └── Level 2 · 末级 ── 不可再建下级；可作为人员、客户挂载点
   │
   └── 最多 3 层；任意层都可挂载 Staff / Customer / Brand 关系`}</Pre>
        <Card className="mt-2">
          <H4>品牌关系（BrandRelation）</H4>
          <div className="text-[12.5px] leading-6 text-foreground/85">
            企业与品牌的关系分两种：<Tag tone="info">自营 own</Tag><Tag tone="success">代理 agent</Tag>。
            <ul className="list-disc pl-5 mt-1.5 space-y-1">
              <li><Code>brand</Code> 类型企业默认 own 自己的品牌，可额外 agent 其他品牌；</li>
              <li><Code>dealer / store / studio</Code> 仅可 agent，不可 own；</li>
              <li>关系变更需经品牌方授权（授权流走「品牌管理」模块）。</li>
            </ul>
          </div>
        </Card>
      </div>

      <div id="bp-page">
        <H3>页面地图与权限矩阵</H3>
        <Table
          headers={["页面", "路由", "平台后台", "企业后台", "关键逻辑"]}
          cols={[undefined, undefined, "80px", "80px", undefined]}
          rows={[
            ["企业列表", "/enterprise", <Tag tone="info">全量</Tag>, <Tag tone="success">自树</Tag>, "平台看全部 + 子树展开；企业仅看自身 + 子级"],
            ["企业详情", "/enterprise/detail/:id", <Tag tone="info">读写</Tag>, <Tag tone="success">受限</Tag>, "企业方仅可编辑联系信息、组织树；权益只读"],
            ["新建/编辑企业", "/enterprise/create", <Tag tone="info">读写</Tag>, <Tag tone="warning">仅编辑</Tag>, "edit 模式：权益、到期时间锁定为只读"],
            ["入驻申请", "/enterprise/apply", <Tag tone="info">审核</Tag>, <Tag tone="muted">不可见</Tag>, "驳回支持再次审核（无 final reject 状态）"],
            ["人员列表", "/enterprise/staff", <Tag tone="info">需选企业</Tag>, <Tag tone="success">自树</Tag>, "平台需强制选中一个企业作用域"],
          ]}
        />
      </div>

      <div id="bp-rule">
        <H3>架构层级约束</H3>
        <Pre>{`R1  企业 Level ∈ {0,1,2}，最深 3 层
R2  Level=0 仅由平台创建；Level=1 由 HQ 创建；Level=2 由 Level≤1 创建
R3  子企业的 type ∈ SUB_TYPE_MAP[parent.type]
R4  子企业的到期时间 ≤ 父企业到期时间（trigger 校验）
R5  人员（Staff）必须挂载到某个具体企业节点（不能挂在「平台」上）
R6  企业 enterprise_id 一经创建不可变更；归属迁移走 ownership_event 记录`}</Pre>
      </div>
    </section>
  );
}

/* ───────────────────────── 03 准入与生命周期 ───────────────────────── */
function Runtime() {
  return (
    <section id="runtime" className="scroll-mt-4 space-y-5">
      <H2 icon={Activity} num="03">准入与生命周期</H2>

      <div id="rt-states">
        <H3>三维状态解耦（审核 · 业务 · 所有权）</H3>
        <Pre>{`┌─────────────┬───────────────┬─────────────────────────┐
│ audit       │ business      │ ownership                │
├─────────────┼───────────────┼─────────────────────────┤
│ pending     │ disabled      │ normal                   │
│ approved    │ active        │ frozen (由审计/合规触发) │
│ rejected    │               │                         │
└─────────────┴───────────────┴─────────────────────────┘
  ↑ 平台触发     ↑ 商务触发      ↑ 合规/级联触发

「显示出来的状态徽标 = f(audit, business, ownership)」
任何一个维度变更都不应污染其他维度的字段。`}</Pre>
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <Stat label="审核维度" value="3" unit="态" tone="info" />
          <Stat label="业务维度" value="2" unit="态" tone="success" />
          <Stat label="所有权维度" value="2" unit="态" tone="warning" />
        </div>
      </div>

      <div id="rt-forward">
        <H3>正向流：申请 → 审核 → 激活</H3>
        <Card>
          <Pre>{`(企业方)        (平台)            (系统)
   │             │                │
   │ 1.提交申请  │                │
   ├────────────▶│                │
   │             │ 2.审核(通过)   │
   │             ├───────────────▶│ 创建企业(audit=approved, business=disabled)
   │             │                │ 派发初始权益配置(随订单 enterprise_grant)
   │             │ 3.激活         │
   │             ├───────────────▶│ business=active, 发送 enterprise.activated 事件
   │ 4.接收激活  │                │
   │◀────────────────────────────-┤
   │ 5.创建人员/组织/绑定品牌      │
   └─────────────────────────────-▶`}</Pre>
          <div className="text-[12px] text-muted-foreground mt-2">
            关键：<b>审核通过 ≠ 业务启用</b>。审核只生成主体，业务激活才发权益；二者解耦让财务可独立把控生效时点。
          </div>
        </Card>
      </div>

      <div id="rt-reverse">
        <H3>逆向流：驳回 / 停用 / 冻结</H3>
        <div className="space-y-2.5">
          <Card>
            <H4>逆向流 A · 审核驳回 → 再次提交</H4>
            <div className="space-y-0.5">
              <SeqLine from="申请人" to="平台" msg="提交申请（audit=pending）" kind="req" />
              <SeqLine from="平台" to="系统" msg="驳回，写 reason（audit=rejected）" kind="evt" />
              <SeqLine from="申请人" to="平台" msg="修改资料后再次提交 → audit 回到 pending" kind="req" />
              <SeqLine from="系统" to="审计" msg="AuditRecord 追加一条记录（不覆盖历史）" kind="evt" />
            </div>
            <div className="text-[11.5px] text-muted-foreground mt-1">禁止「final rejected」终态：rejected 始终可以转回 pending，避免误驳无法挽回。</div>
          </Card>

          <Card>
            <H4>逆向流 B · 业务停用 → 启用</H4>
            <Pre>{`仅 Level≥1 且 audit=approved 的企业可停用
business: active → disabled
  · 不影响审核状态、不影响所有权
  · 不级联到子企业（避免误伤）
  · 已发放权益保留但暂停消耗（quota.frozen=true）
  · 在用人员不可登录该企业作用域（其他企业身份仍可用）
启用回滚：disabled → active，恢复 quota.frozen=false，发送 enterprise.reactivated`}</Pre>
          </Card>

          <Card>
            <H4>逆向流 C · 合规冻结 → 解冻</H4>
            <Pre>{`ownership: normal → frozen （由平台审计 / 合规触发）
  · 级联：子企业 ownership 同步置 frozen
  · 所有权益账户立即停用（quota.frozen=true）
  · 人员只读：可登录查看，不可写
  · 平台保留全部历史数据，不删除
解冻：frozen → normal，子级同步解冻；二次冻结需重新走审计`}</Pre>
          </Card>
        </div>
      </div>

      <div id="rt-cascade">
        <H3>级联冻结与解冻</H3>
        <Pre>{`             ┌────── HQ.ownership = frozen
             │             │
             ▼             ▼ 触发递归
        Level 1 子企业 → frozen
             │
             ▼
        Level 2 末级    → frozen
              │
              ▼
     ┌─ Staff(只读) ─ Customer(只读) ─ Entitlement(暂停) ─┐
     └─────────────── 审计记录贯穿 ──────────────────────┘

解冻必须从 HQ 解，禁止单独解冻子级（避免绕过审计）。`}</Pre>
      </div>

      <div id="rt-matrix">
        <H3>状态 × 操作可见性矩阵</H3>
        <Table
          headers={["操作", "Level0 HQ", "Level1 子", "Level2 末级", "前置条件"]}
          cols={[undefined, "100px", "100px", "100px", undefined]}
          rows={[
            ["审核 / 再审核", <Tag tone="info">✓</Tag>, <Tag tone="muted">—</Tag>, <Tag tone="muted">—</Tag>, "audit ∈ {pending,rejected}"],
            ["停用 / 启用", <Tag tone="danger">禁止</Tag>, <Tag tone="success">✓</Tag>, <Tag tone="success">✓</Tag>, "audit=approved & ownership=normal"],
            ["冻结 / 解冻", <Tag tone="warning">✓</Tag>, <Tag tone="muted">级联</Tag>, <Tag tone="muted">级联</Tag>, "平台审计/合规角色"],
            ["创建子企业", <Tag tone="success">✓</Tag>, <Tag tone="success">✓</Tag>, <Tag tone="danger">禁止</Tag>, "level < 2 & ownership=normal"],
            ["编辑权益配置", <Tag tone="warning">只读</Tag>, <Tag tone="warning">只读</Tag>, <Tag tone="warning">只读</Tag>, "编辑模式锁定，走订单调整"],
          ]}
        />
      </div>
    </section>
  );
}

/* ───────────────────────── 04 数据模型 ───────────────────────── */
function DataModel() {
  return (
    <section id="data" className="scroll-mt-4 space-y-5">
      <H2 icon={Database} num="04">数据模型与归属</H2>

      <div id="dm-er">
        <H3>ER 全景</H3>
        <Pre>{`enterprise (id PK, parent_id FK→self, level, type, audit, business, ownership)
   1                                            1                       1
   │ owns                                        │ has                   │ has
   N                                            N                       N
enterprise_admin              audit_record       org_node               brand_relation
(enterprise_id, user_id,      (enterprise_id,    (id, enterprise_id,    (enterprise_id,
 role, primary)                actor, action,     parent_node_id,        brand_id,
                              from, to, reason,   name, type)            relation_type:
                              created_at)                                  own | agent)
   │ login bind
   N
auth_user (id PK, phone)        staff (id, enterprise_id, org_node_id, user_id)
                                  │
                                  └── 多归属：同一 user_id 可属多个 staff（不同企业）`}</Pre>
      </div>

      <div id="dm-ddl">
        <H3>核心 DDL（节选）</H3>
        <Pre>{`CREATE TABLE enterprise (
  id              UUID PRIMARY KEY,
  parent_id       UUID REFERENCES enterprise(id) ON DELETE RESTRICT,
  level           SMALLINT NOT NULL CHECK (level BETWEEN 0 AND 2),
  type            TEXT NOT NULL CHECK (type IN
                    ('brand','dealer','decoration','mall','store','studio')),
  name            TEXT NOT NULL,
  short_name      TEXT,
  audit_status    TEXT NOT NULL DEFAULT 'pending'
                    CHECK (audit_status IN ('pending','approved','rejected')),
  business_status TEXT NOT NULL DEFAULT 'disabled'
                    CHECK (business_status IN ('active','disabled')),
  ownership_state TEXT NOT NULL DEFAULT 'normal'
                    CHECK (ownership_state IN ('normal','frozen')),
  expire_at       TIMESTAMPTZ,           -- 由订单驱动，编辑页只读
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 触发器：子企业 expire_at 不可超过父企业（不可用 CHECK，时间相关用 trigger）
CREATE OR REPLACE FUNCTION trg_enterprise_expire_check() RETURNS trigger AS $$
DECLARE p_expire TIMESTAMPTZ;
BEGIN
  IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;
  SELECT expire_at INTO p_expire FROM enterprise WHERE id = NEW.parent_id;
  IF NEW.expire_at IS NOT NULL AND p_expire IS NOT NULL AND NEW.expire_at > p_expire THEN
    RAISE EXCEPTION 'child expire_at must not exceed parent';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

-- 触发器：冻结父级时自动级联
CREATE OR REPLACE FUNCTION trg_cascade_freeze() RETURNS trigger AS $$
BEGIN
  IF NEW.ownership_state = 'frozen' AND OLD.ownership_state <> 'frozen' THEN
    UPDATE enterprise SET ownership_state='frozen'
      WHERE parent_id = NEW.id AND ownership_state <> 'frozen';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;`}</Pre>
      </div>

      <div id="dm-own">
        <H3>数据归属与租户隔离 RLS</H3>
        <Card>
          <p className="text-[12.5px] leading-6 text-foreground/85">
            所有挂载到企业的数据表（staff、customer、entitlement_account、order）必须携带 <Code>enterprise_id</Code>，由 RLS 在 PG 层强制隔离。
            JWT 中携带当前作用域的 <Code>enterprise_id</Code> 与 <Code>perspective ∈ &#123;platform, enterprise&#125;</Code>。
          </p>
          <Pre>{`-- 角色感知策略：平台视角可越权读，企业视角仅本树
CREATE POLICY p_enterprise_read ON staff
FOR SELECT USING (
  current_setting('app.perspective') = 'platform'
  OR enterprise_id IN (
    SELECT id FROM enterprise_subtree(current_setting('app.enterprise_id')::uuid)
  )
);

-- 写策略更严：必须落在自己企业树内
CREATE POLICY p_enterprise_write ON staff
FOR INSERT WITH CHECK (
  enterprise_id IN (SELECT id FROM enterprise_subtree(current_setting('app.enterprise_id')::uuid))
);`}</Pre>
        </Card>
      </div>

      <div id="dm-audit">
        <H3>审计轨迹（AuditRecord）</H3>
        <KV
          items={[
            { k: "用途", v: "记录企业生命周期所有状态变更，提供合规追溯" },
            { k: "字段", v: <Code>id, enterprise_id, actor_user_id, action, dim, from_value, to_value, reason, created_at</Code> },
            { k: "action 枚举", v: "submit / approve / reject / activate / disable / enable / freeze / unfreeze / transfer / exit" },
            { k: "dim 维度", v: "audit | business | ownership | hierarchy | admin" },
            { k: "约束", v: "只追加不修改；删除企业时连带审计记录归档而非删除" },
          ]}
        />
      </div>
    </section>
  );
}

/* ───────────────────────── 05 编辑与变更逻辑 ───────────────────────── */
function EditFlow() {
  return (
    <section id="edit" className="scroll-mt-4 space-y-5">
      <H2 icon={GitBranch} num="05">编辑与变更逻辑</H2>

      <div id="ed-principle">
        <H3>「编辑即创建」？不，要分级</H3>
        <Card>
          <p className="text-[12.5px] leading-6 text-foreground/85">
            其他模块（如人员、客户）遵循「编辑即创建」原则（前后端共用同一表单）。但企业不同 —— 企业是租户实体，
            创建与编辑承担不同语义：<br />
            <Tag tone="info">创建</Tag> 写入企业主体 + 初始化权益（来自首单）+ 建立审计起点；<br />
            <Tag tone="warning">编辑</Tag> 只允许变更「描述类」字段，<b>禁止</b>变更影响下游账目的字段。<br />
            这是「公理 3」在前端的具体落地。
          </p>
        </Card>
      </div>

      <div id="ed-fields">
        <H3>字段三态：可变 / 弱可变 / 不可变</H3>
        <Table
          headers={["字段", "可变性", "约束", "审计维度"]}
          rows={[
            ["name / short_name / logo", <Tag tone="success">可变</Tag>, "随时可改", "—"],
            ["contact / address / industry", <Tag tone="success">可变</Tag>, "随时可改", "—"],
            ["legal_person / license / 资质文件", <Tag tone="warning">弱可变</Tag>, "需重新触发审核（audit 回 pending）", "audit"],
            ["type / level / parent_id", <Tag tone="danger">不可变</Tag>, "决定层级与子类约束，禁止 UI 修改", "hierarchy"],
            ["enterprise_id", <Tag tone="danger">不可变</Tag>, "全平台主键，迁移走 ownership_event", "—"],
            ["expire_at / 权益数量 / 套餐", <Tag tone="danger">不可变（仅订单）</Tag>, "前端 fieldset disabled；后端校验 source=order", "business"],
            ["audit_status / business_status / ownership_state", <Tag tone="danger">不可直改</Tag>, "通过专门的 action 接口流转", "audit / business / ownership"],
          ]}
        />
      </div>

      <div id="ed-entitlement">
        <H3>权益编辑：只读 + 订单驱动（本模块的关键）</H3>
        <Pre>{`编辑页（mode=edit）的「权益配置」步骤：
   ┌─────────────────────────────────────────────────┐
   │  [Banner 提示] 权益已生效，编辑模式仅供查看     │
   │  [按钮]        ▶ 去增购权益（跳订单创建页）     │
   │                                                  │
   │  <fieldset disabled>                            │
   │    • 开通产品 chips（不可勾选）                  │
   │    • 套餐 / SKU 列表（不可增删）                 │
   │    • 应用方式 select（不可改）                   │
   │    • 到期时间 / 子企业上限（不可改）             │
   │  </fieldset>                                    │
   └─────────────────────────────────────────────────┘

后端兜底：PATCH /enterprise/:id 显式 reject 任何权益相关字段
  → 必须走 POST /entitlement/order  生成 enterprise_grant / internal_grant 订单
  → 订单审核 + 支付 + 激活 后才落入 entitlement_account
  → 每条 entitlement_account.sourceOrderIds 形成完整溯源链`}</Pre>
        <Card>
          <H4>为什么不允许直接编辑？</H4>
          <ul className="list-disc pl-5 text-[12.5px] leading-6 text-foreground/85 space-y-1 mt-1">
            <li><b>对账</b>：直接编辑无订单凭证，财务无法对账；</li>
            <li><b>溯源</b>：违反 <Code>sourceOrderIds</Code> 不可断链原则；</li>
            <li><b>快照</b>：权益的计费规则、周期、配额是「订单生效时的快照」，无法靠表单回填；</li>
            <li><b>合规</b>：赠送 / 补偿 / 回收都是商务行为，需独立审批留痕。</li>
          </ul>
        </Card>
      </div>

      <div id="ed-hierarchy">
        <H3>层级变更与归属迁移（高危操作）</H3>
        <Pre>{`层级变更 = 改 parent_id？❌ 不允许直接 UPDATE
正确做法：
  1. 创建 ownership_event(from_parent, to_parent, reason, operator)
  2. 平台审批 → 触发：
       a) 校验目标父企业 expire_at ≥ 当前企业 expire_at
       b) 校验目标父企业的 type 允许接管本 type
       c) 迁移当前企业及其全部子树（递归）
       d) 重算所有挂载数据的 RLS 可见性
       e) 写入 AuditRecord(dim=hierarchy)
  3. 失败回滚：未成功提交前不修改 parent_id

→ 前端：不提供「移动企业」按钮；归属变更走专用工单。`}</Pre>
      </div>

      <div id="ed-side">
        <H3>副作用与回滚补偿</H3>
        <Table
          headers={["操作", "副作用（下游）", "失败补偿"]}
          rows={[
            ["审核通过", "创建 entitlement_account 占位 + 发送 enterprise.approved", "回滚账户，重置 audit=pending"],
            ["业务停用", "权益账户 quota.frozen=true + 人员 token revoke", "启用时恢复 quota + token"],
            ["合规冻结", "级联子树 + 暂停所有订单消耗 + 客户标记 frozen_owner", "解冻按相同顺序逆向恢复"],
            ["管理员变更", "旧管理员降级为普通成员，新管理员 grant 全权限", "操作未完成前保留旧管理员 token"],
            ["归属迁移", "RLS 视图刷新 + 权益账户重新挂载 + 客户归属事件", "事务级 saga，每步失败回滚前序"],
          ]}
        />
      </div>
    </section>
  );
}

/* ───────────────────────── 06 接口·事件·里程碑 ───────────────────────── */
function Delivery() {
  return (
    <section id="delivery" className="scroll-mt-4 space-y-5">
      <H2 icon={Rocket} num="06">接口 · 事件 · 里程碑</H2>

      <div id="dl-api">
        <H3>页面 → API 映射表</H3>
        <Table
          headers={["页面 / 动作", "Method · 路径", "幂等", "关键校验"]}
          cols={[undefined, undefined, "60px", undefined]}
          rows={[
            ["列表查询（带树）", "GET /enterprise?perspective={...}&parent_id=", "—", "RLS 自动过滤"],
            ["创建企业（HQ）", "POST /enterprise", "X-Idempotency-Key", "type/level 校验 + 资质完整"],
            ["创建子企业", "POST /enterprise (parent_id)", "X-Idempotency-Key", "level<2 + type ∈ SUB_TYPE_MAP[parent.type]"],
            ["编辑（描述类）", "PATCH /enterprise/:id", "—", "reject 权益相关字段 / 层级字段"],
            ["编辑（资质类）", "PATCH /enterprise/:id/qualification", "—", "触发 audit→pending"],
            ["审核通过 / 驳回", "POST /enterprise/:id:audit", "—", "actor 角色 = 平台审核员"],
            ["停用 / 启用", "POST /enterprise/:id:business {to}", "—", "level≥1 & audit=approved"],
            ["冻结 / 解冻", "POST /enterprise/:id:ownership {to}", "—", "actor 角色 = 平台审计"],
            ["归属迁移工单", "POST /enterprise/:id/ownership-events", "X-Idempotency-Key", "事务 + saga"],
          ]}
        />
      </div>

      <div id="dl-event">
        <H3>领域事件（Kafka topic：enterprise.*）</H3>
        <Pre>{`enterprise.application.submitted   { application_id, applicant_user_id }
enterprise.application.approved    { enterprise_id, level, type }
enterprise.application.rejected    { application_id, reason }
enterprise.business.changed        { enterprise_id, from, to, operator }
enterprise.ownership.changed       { enterprise_id, from, to, cascade_ids[] }
enterprise.hierarchy.transferred   { enterprise_id, from_parent, to_parent }
enterprise.admin.changed           { enterprise_id, from_user_id, to_user_id }`}</Pre>
        <div className="text-[11.5px] text-muted-foreground mt-1.5">
          下游消费者：权益（创建账户）、客户（更新归属可见性）、营销（重算可分配池）、权限（清缓存）。
        </div>
      </div>

      <div id="dl-error">
        <H3>幂等 / 异常 / SLO</H3>
        <Table
          headers={["类别", "策略"]}
          cols={["160px", undefined]}
          rows={[
            ["写幂等", "所有 POST 携带 X-Idempotency-Key，服务端缓存 7 天结果"],
            ["事务边界", "企业 + 初始管理员 + 审计起点 同事务；权益账户走事件最终一致"],
            ["级联失败", "冻结级联走 saga：任一子级失败立即停止并整体回滚为 normal"],
            ["SLO（P99）", "列表 < 400ms · 详情 < 300ms · 状态切换 < 600ms · 级联冻结 < 2s（10 子企业内）"],
            ["补偿任务", "每日 0 点对比 enterprise / entitlement_account / staff 的 ownership 一致性，差异告警"],
          ]}
        />
      </div>

      <div id="dl-gantt">
        <H3>落地里程碑（建议 8 周）</H3>
        <Pre>{`W1-W2  · 数据模型 + 触发器 + RLS 函数      [后端]
W2-W3  · 列表 / 详情 / 创建向导（前端）      [前端]
W3-W4  · 审核流 + AuditRecord                [后端 + 前端]
W4-W5  · 停用 / 启用 / 冻结 + 级联           [后端]
W5-W6  · 编辑只读策略（权益、层级、资质）    [前端 + 后端契约]
W6-W7  · 归属迁移 saga + 工单                [后端]
W7-W8  · 灰度上线 · 双写对比 · 一致性校验     [SRE + QA]`}</Pre>
      </div>
    </section>
  );
}
