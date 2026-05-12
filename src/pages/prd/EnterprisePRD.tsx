import { useEffect, useState } from "react";
import {
  FileText,
  Network,
  Activity,
  Database,
  GitBranch,
  Rocket,
  Workflow,
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
  { id: "e2e", label: "07 · 端到端业务流", icon: Workflow, children: [
    { id: "e2e-ent", label: "企业创建全生命周期" },
    { id: "e2e-staff", label: "人员 × 应用全生命周期" },
    { id: "e2e-render", label: "一次请求穿透：菜单 → 数据" },
    { id: "e2e-write", label: "一次写入扩散：事件雪崩图" },
    { id: "e2e-decay", label: "失效 · 重算 · 缓存时序" },
    { id: "e2e-reverse", label: "全链路逆向流（退出 / 到期 / 冻结）" },
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
        <E2EFlow />
        <div className="text-center text-[12px] text-muted-foreground py-8 border-t">— 企业管理 PRD · v1.1 · 端到端版 · 变更走 PR 评审 —</div>
      </main>
    </div>
  );
}

/* ───────────────────────── 01 设计总论 ───────────────────────── */
function Overview() {
  return (
    <section id="overview" className="scroll-mt-4 space-y-5">
      <H2 icon={FileText} num="01">设计总论 · 顶层架构</H2>

      <div id="ov-why">
        <H3>这套体系到底在解决什么问题</H3>
        <Card>
          <p className="text-[13px] leading-7 text-foreground/85">
            居然设计家不是「一家公司的 SaaS」，而是一个<b>多角色、多产品、多业务关系并存的产业互联网底座</b>。同一份 3D 设计能力，要同时服务：
            头部品牌商（如欧派）做全国分销、家居卖场（如居然之家）做品牌聚合、装企做整装履约、独立设计师做末端落地。这些角色彼此既是
            <Tag tone="info">客户</Tag>、又是<Tag tone="success">渠道</Tag>、还可能是<Tag tone="warning">供给</Tag>。
          </p>
          <p className="text-[13px] leading-7 text-foreground/85 mt-2.5">
            因此本模块的核心命题不是「画一棵组织树」，而是<b>用一张统一的关系图，把所有商业角色和它们之间的派生 / 代理 / 聚合 / 供给关系，
            装进一个可治理、可隔离、可扩展的数据骨架</b>。所有下游模块（权益、订单、人员、客户、营销）的可见性、可操作性、对账归属，最终都从这张图导出。
          </p>
        </Card>
      </div>

      <div id="ov-philosophy">
        <H3>设计哲学 · 「Platform as Enterprise」</H3>
        <Card>
          <p className="text-[12.5px] leading-6 text-foreground/85">
            最关键的一条顶层设计原则：<b>平台本身被建模为一个虚拟企业节点</b>。在代码层面（<Code>EnterpriseList.tsx</Code> 的
            <Code>ROOT_CURRENT</Code>），「居然设计家平台」是 enterprise 表里的一行，<Code>type=&quot;平台&quot;</Code>、<Code>level=0</Code>、不可编辑。
            这条「等价」带来三个非线性收益：
          </p>
          <ul className="list-disc pl-5 mt-2 text-[12.5px] leading-6 text-foreground/85 space-y-1">
            <li><b>数据模型零分支</b> — 平台、品牌、卖场、门店共享同一张表、同一套字段、同一份 RLS 策略；不需要为「平台对象」单独建表。</li>
            <li><b>视角切换零成本</b> — 平台 / 企业后台只是 <Code>perspective</Code> + 当前 <Code>enterprise_id</Code> 的差异，前后端复用同一份接口。</li>
            <li><b>权限模型可递归</b> — 同一套「角色 × 策略 × 数据范围」可作用在任意企业节点上；平台只是这张图最顶端的一个特殊节点。</li>
          </ul>
          <Pre>{`概念上：
    enterprise（表）─┬─ 平台节点（虚拟根，type=平台）
                     ├─ 品牌商 · 卖场 · 装企 · 经销商 · 供应商（实际企业）
                     └─ … 派生出子企业、子子企业（按 SUB_TYPE_MAP 规则）

实际上：
    平台 = 一种特殊 type 的 enterprise + perspective=platform 的会话
            ↳ 权限上「越权读 + 代操作写」，业务规则仍受同一图约束`}</Pre>
        </Card>
      </div>

      <div id="ov-relationship">
        <H3>企业关系语法 · SUB_TYPE_MAP 才是真正的「层级」定义</H3>
        <Card>
          <p className="text-[12.5px] leading-6 text-foreground/85">
            很多人误以为这是一棵「Level 0/1/2」的树。其实代码里真正决定关系结构的是 <Code>SUB_TYPE_MAP</Code> ——
            一张「父类型 → 允许的子类型集合」的有向图。UI 限定最深渲染 3 层，但<b>关系语义本身是一张图</b>，UI 的 3 层只是工程化的可视上限。
          </p>
          <Pre>{`SUB_TYPE_MAP（节选自 EnterpriseList.tsx）：
    品牌商  → [经销商, 装修公司, 门店, 工作室]   ← 全渠道分销
    经销商  → [装修公司, 门店, 工作室]           ← 区域下沉
    装修公司→ [门店, 工作室]                     ← 整装落地
    门店    → [工作室]                           ← 末端服务点
    工作室  → [工作室]                           ← 协作扩展
    卖场    → [品牌商, 经销商, 装修公司, 门店]   ← 聚合型枢纽
    供应商  → [供应商]                           ← 平行供应链

→ 这张图同时表达了 4 种业务关系：
    分销链（brand→dealer→store→studio）、
    聚合关系（mall 把多个独立品牌纳入同一商业体）、
    履约关系（decoration→store），
    供给关系（supplier 自成体系）。`}</Pre>
          <p className="text-[12.5px] leading-6 text-foreground/85 mt-2.5">
            这意味着：「父企业类型」决定了「子企业可选类型集合」，决定了「品牌关系是否可 own」，决定了「人员 / 客户挂载语义」，决定了「权益是否可继承」。
            它是一切下游规则的源头 —— 改一行 SUB_TYPE_MAP，整个商业模型就发生质变。
          </p>
        </Card>
      </div>

      <div id="ov-roles">
        <H3>企业角色定位（4 种语义角色，跨越 7 类企业类型）</H3>
        <Table
          headers={["角色语义", "企业类型", "在关系图中的位置", "核心价值"]}
          cols={["110px", "150px", undefined, undefined]}
          rows={[
            ["主体型", "品牌商 / 装修公司", "图的源头节点，自营品牌、自有权益账户", "平台直接对接、合同主体、品牌资产持有者"],
            ["聚合型", "卖场", "多分支起点，可接入任意主体型 / 渠道型", "把分散的品牌方聚合为同一商业体（如居然之家模式）"],
            ["渠道型", "经销商 / 门店 / 工作室", "派生节点，必须挂在主体型或聚合型之下", "承接主体的销售/履约/服务，享受继承式权益"],
            ["供给型", "供应商", "独立平行链（supplier→supplier）", "面向 B2B 的供应链协同，与零售链解耦"],
          ]}
        />
        <div className="text-[11.5px] text-muted-foreground mt-2">
          注：「角色语义」是 PRD 抽象，「企业类型」是数据落地。前者解释为什么，后者驱动 UI 与 SUB_TYPE_MAP 规则。
        </div>
      </div>

      <div id="ov-product">
        <H3>正交切面 · 「产品维度」与关系图垂直相交</H3>
        <Card>
          <p className="text-[12.5px] leading-6 text-foreground/85">
            企业关系图是横向骨架，<b>产品（国内 3D / 国际 3D / 智能导购 / VR 全景 …）是纵向切面</b>。每个企业可绑定多个产品，
            每个产品下持有<b>独立的权益账户、独立的人员授权、独立的客户库</b>。同一家欧派可以「国内 3D 已激活、国际 3D 未开通」，
            两条业务线的对账、配额、用户在数据层完全隔离。
          </p>
          <Pre>{`           产品维度（垂直切面）
              │
              ▼
    ┌─────────────────────────┐
    │ 国内3D │ 国际3D │ 智能导购 │ VR全景 │ …
    ├────────┼────────┼─────────┼────────┤
品牌│   ●    │   ●    │    ●    │   ○    │   ← 同一企业 × 不同产品 = 独立权益账户
卖场│   ●    │   ●    │    ●    │   ●    │
门店│   ●    │   —    │    ●    │   —    │
    └────────┴────────┴─────────┴────────┘
              ▲
              │
        企业关系图（水平骨架）

「企业 × 产品」是一切权益、订单、人员授权、营销动作的最小坐标点。`}</Pre>
        </Card>
      </div>

      <div id="ov-value">
        <H3>这套顶层设计的商业 & 技术价值</H3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card><H4>商业价值</H4>
            <ul className="list-disc pl-5 text-[12.5px] leading-6 text-foreground/85 space-y-1">
              <li>同一套系统承载「分销 / 聚合 / 供应」三种产业关系，平台可同时变现 B 端 SaaS、卖场聚合、供应链协同三条收入线。</li>
              <li>关系图改一行（SUB_TYPE_MAP）即可扩展新业务形态，无需新建产品线 / 不再造系统。</li>
              <li>「Platform as Enterprise」让平台拥有「代任意企业操作」的合法身份 —— 客成、运营、审计的代客服务都不需要特殊接口。</li>
            </ul>
          </Card>
          <Card><H4>技术价值</H4>
            <ul className="list-disc pl-5 text-[12.5px] leading-6 text-foreground/85 space-y-1">
              <li>单表 + 单套 RLS 同时支持平台 / 企业视角，运维成本与 bug 面积都下降一个数量级。</li>
              <li>关系图（SUB_TYPE_MAP）+ 产品矩阵（PRODUCTS）+ 状态三维（audit/business/ownership）= 完整业务空间的解析坐标系。</li>
              <li>下游模块（权益、订单、人员、客户）只需消费 enterprise_id × product_id 两个坐标即可完成租户隔离，零额外约定。</li>
            </ul>
          </Card>
        </div>
      </div>

      <div id="ov-axiom">
        <H3>7 条不可违反的公理</H3>
        <div className="grid grid-cols-1 gap-2.5">
          {[
            { k: "公理 0 · 平台即上帝视角", v: "平台后台（perspective=platform）拥有全部能力 —— 可代任意企业创建子企业 / 人员 / 商品 / 模型资产 / 调整组织树。安全边界不由「能不能点」收口，而由「权限管理」的角色 × 策略 × 数据范围三层兜底。" },
            { k: "公理 1 · Platform as Enterprise", v: "平台节点是 enterprise 表里一条虚拟根记录（type=平台），与真实企业共享同一份数据模型、字段、RLS。不允许为「平台」单独建表或字段。" },
            { k: "公理 2 · 关系语法即业务模型", v: "SUB_TYPE_MAP 是企业关系图的唯一权威定义；任何 type → 子 type 的可派生性，必须以它为准。绕过该图的「特例」必须拒绝。" },
            { k: "公理 3 · 状态三维解耦", v: "审核（pending/approved/rejected）、业务（active/disabled）、所有权（normal/frozen）三个维度相互独立，禁止合并为单一 status 字段。" },
            { k: "公理 4 · 到期即自动停用", v: "expire_at ≤ now() 由定时任务把 business_status 自动置 disabled，权益账户 quota.frozen=true；续期成功后由订单事件回写为 active。写 AuditRecord(action=auto_disable)。" },
            { k: "公理 5 · 编辑不创订单", v: "企业编辑页面禁止修改权益数量、套餐、到期时间。所有权益变更（增购、续期、回收、赠送）必须通过权益订单，留下 sourceOrderId 溯源。" },
            { k: "公理 6 · 退出而非删除", v: "企业、人员均不支持物理删除。退出（exit）即解除归属 + 软冻结历史数据，保证审计与对账可追溯。" },
            { k: "公理 7 · 级联冻结，不级联停用", v: "冻结父企业 → 子企业级联冻结；停用父企业不级联停用子企业（业务停用是商务行为，需逐个确认）。" },
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
            ["企业（Enterprise）", "平台租户主体，持有唯一 enterprise_id", "包含「平台」虚拟节点，是图的一个特殊行"],
            ["平台节点", "type=平台 的虚拟企业（ROOT_CURRENT）", "在 UI 列表中作为置顶首条；不可编辑、不可停用"],
            ["主体 / 聚合 / 渠道 / 供给", "企业的 4 种语义角色", "和 type 是 1:N 关系，决定可派生哪些子类型"],
            ["SUB_TYPE_MAP", "「父 type → 子 type 集合」有向图", "是关系语义本体，UI 的 3 层只是渲染上限"],
            ["视角 perspective", "platform / enterprise", "platform 全权代操作；enterprise 仅限自身子树"],
            ["产品（Product）", "国内 3D / 国际 3D / 智能导购 / VR 全景 …", "与企业关系图正交；权益账户以「企业 × 产品」为单位"],
            ["审核状态", "pending / approved / rejected", "驳回可再次提交，无 final-reject 终态"],
            ["业务状态", "active / disabled", "可人工切换；可由到期自动 disable"],
            ["所有权状态", "normal / frozen", "仅审计、合规、级联可触发"],
            ["品牌关系", "own（自营）/ agent（代理）", "由企业 type 决定可 own 还是仅可 agent"],
          ]}
        />
      </div>

      <div id="ov-scope">
        <H3>本模块边界与上下游</H3>
        <Pre>{`            ┌─────────────────────────────────────┐
   上游 ──▶ │  入驻申请 (ApplicationList)         │ ──▶ 创建企业（落入关系图）
            └─────────────────────────────────────┘
                            │
            ┌───────────────▼────────────────────┐
   本模块   │  企业管理 EnterpriseList / Detail  │
            │   ├─ 企业关系图（SUB_TYPE_MAP 驱动）│
            │   ├─ 组织树（OrgNode，企业内部）    │
            │   ├─ 人员归属（Staff）              │
            │   ├─ 品牌关系（BrandRelation）      │
            │   ├─ 产品绑定（products[]）         │
            │   └─ 审计轨迹（AuditRecord）        │
            └───────────────┬────────────────────┘
                            │
            ┌───────────────▼────────────────────┐
   下游 ◀── │ 权益账户(企业×产品) · 订单 · 客户   │
            │            · 营销 · 权限             │
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
        <H3>7 类企业 × 4 种角色语义</H3>
        <Table
          headers={["type", "中文", "角色语义", "可派生子类型（SUB_TYPE_MAP）", "准入路径"]}
          cols={["90px", "90px", "80px", undefined, "180px"]}
          rows={[
            ["brand", "品牌商", <Tag tone="info">主体型</Tag>, "经销商 · 装修公司 · 门店 · 工作室", "平台审核（线下尽调 + 资质）"],
            ["mall", "卖场", <Tag tone="warning">聚合型</Tag>, "品牌商 · 经销商 · 装修公司 · 门店", "平台直签"],
            ["decoration", "装修公司", <Tag tone="info">主体型</Tag>, "门店 · 工作室", "平台审核"],
            ["dealer", "经销商", <Tag tone="success">渠道型</Tag>, "装修公司 · 门店 · 工作室", "平台审核 或 品牌邀请"],
            ["store", "门店", <Tag tone="success">渠道型</Tag>, "工作室", "由 brand / dealer / mall 创建"],
            ["studio", "工作室", <Tag tone="success">渠道型</Tag>, "工作室（协作扩展）", "由 store / studio / decoration 创建"],
            ["supplier", "供应商", <Tag tone="muted">供给型</Tag>, "供应商（自成平行链）", "平台审核（独立通道）"],
          ]}
        />
        <div className="text-[11.5px] text-muted-foreground mt-2">
          特别说明：<b>卖场</b>是关系图里唯一的「聚合型」节点 —— 它能接入主体型的品牌商进来，使「居然之家入驻欧派门店」这种现实业务有干净的数据建模。
        </div>
      </div>

      <div id="bp-graph">
        <H3>企业关系图（有向图，不是树）</H3>
        <Pre>{`                    ┌─────────────────────────────────┐
                    │  Platform（虚拟根，type=平台）   │
                    └──────────────────┬──────────────┘
                                       │ 准入审核
              ┌────────────┬───────────┼─────────────┬──────────────┐
              ▼            ▼           ▼             ▼              ▼
        ┌─────────┐  ┌───────────┐ ┌──────┐  ┌─────────────┐  ┌──────────┐
        │ brand   │  │ decoration│ │ mall │  │  dealer*    │  │ supplier │
        │ 主体    │  │ 主体      │ │ 聚合 │  │  渠道(可直签)│  │ 供给    │
        └────┬────┘  └─────┬─────┘ └──┬───┘  └──────┬──────┘  └────┬─────┘
             │              │          │             │              │
             │派生           │派生      │聚合         │派生           │自派生
             ▼              ▼          ▼             ▼              ▼
         dealer           store     brand        decoration      supplier
         decoration       studio    dealer       store           （平行链
         store                      decoration   studio            独立成体系）
         studio                     store
                                    │
                                    ▼
                                  store
                                  studio

* dealer 既可由平台直签准入，也可由 brand 派生。

水平：商业关系（分销 / 聚合 / 履约 / 供给）
垂直：产品维度（国内3D · 国际3D · 智能导购 · VR全景）正交其上`}</Pre>
      </div>

      <div id="bp-tree">
        <H3>实例化层级（UI 渲染上限 3 层 + 平台虚拟根）</H3>
        <Pre>{`UI 视图：
  平台（虚拟根，置顶 1 行）
    │
    ├─ Level 0 · 真实企业（HQ / 总部）       ← 由平台审核准入
    │    │
    │    ├─ Level 1 · 子企业                 ← 由 HQ 或平台代建
    │    │    │
    │    │    └─ Level 2 · 末级企业          ← 不可再建下级
    │    │
    │    └─ … （平铺，按 SUB_TYPE_MAP 校验 type 兼容）
    │
    └─ … 其他 HQ

注 1：「Level」是 UI 渲染层数，不是关系语义。关系语义由 SUB_TYPE_MAP 表达。
注 2：平台节点不计入 Level 计数，仅作为入口和数据围栏的逻辑顶点。
注 3：当 enterprise.parent.type → child.type 在 SUB_TYPE_MAP 中不存在时，
      创建被拒绝；这是关系图被强制执行的唯一点。`}</Pre>
      </div>

      <div id="bp-page">
        <H3>页面地图与权限矩阵</H3>
        <Table
          headers={["页面", "路由", "平台后台", "企业后台", "关键逻辑"]}
          cols={[undefined, undefined, "100px", "100px", undefined]}
          rows={[
            ["企业列表", "/enterprise", <Tag tone="info">全量 + 平台节点置顶</Tag>, <Tag tone="success">自树 + 自身置顶</Tag>, "Platform-as-Enterprise 的 UI 落地：root 行结构相同，操作集不同"],
            ["企业详情", "/enterprise/detail/:id", <Tag tone="info">读写 + 代操作</Tag>, <Tag tone="success">受限</Tag>, "企业方仅可编辑联系信息、组织树；权益只读"],
            ["新建 / 编辑", "/enterprise/create", <Tag tone="info">读写</Tag>, <Tag tone="warning">仅编辑</Tag>, "create 时校验 parent.type → type ∈ SUB_TYPE_MAP；edit 时锁权益"],
            ["入驻申请", "/enterprise/apply", <Tag tone="info">审核</Tag>, <Tag tone="muted">不可见</Tag>, "驳回可再次提交，无 final reject"],
            ["人员列表", "/enterprise/staff", <Tag tone="info">需选企业作用域</Tag>, <Tag tone="success">自树</Tag>, "Staff 必须挂载到具体企业节点，不能挂在平台虚拟根"],
          ]}
        />
      </div>

      <div id="bp-rule">
        <H3>架构层级约束</H3>
        <Pre>{`R1  enterprise.level ∈ {0,1,2}，UI 渲染最深 3 层
R2  Level=0 仅平台创建；Level=1 由 HQ 或平台代建；Level=2 由 Level≤1 或平台代建
R3  ★ 关系合法性：child.type ∈ SUB_TYPE_MAP[parent.type]
       —— 这是「关系图」被强制执行的唯一点，违反即创建失败
R4  子企业 expire_at ≤ 父企业 expire_at（trigger 校验）
R5  Staff 必须挂载到具体企业节点（不能挂到「平台虚拟根」）；
       平台后台操作 Staff 列表时，前端强制选定一个企业作用域
R6  enterprise_id 一经创建不可变更；归属迁移走 ownership_event
R7  「企业 × 产品」是权益账户、订单、人员授权的最小坐标点；
       同一企业可在不同 product 上有完全独立的账户与配额
R8  平台视角对以上规则有「越权读 + 代操作写」能力，
       但仍受 R1–R7 业务规则约束（不能绕过 Type/Level/到期校验）`}</Pre>
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
            <Pre>{`所有真实企业（Level 0/1/2）均可停用，仅虚拟「平台根」无此入口
business: active → disabled
  · 不影响审核状态、不影响所有权
  · 不级联到子企业（避免误伤）
  · 已发放权益保留但暂停消耗（quota.frozen=true）
  · 在用人员不可登录该企业作用域（其他企业身份仍可用）
触发来源：
  · 人工：企业管理员 / 平台代操作（按角色权限）
  · 自动：expire_at ≤ now() 定时任务 → AuditRecord(action=auto_disable)
启用回滚：disabled → active，恢复 quota.frozen=false，发送 enterprise.reactivated
  · 若由到期自动停用，需先续期（订单驱动）使 expire_at > now() 方可启用`}</Pre>
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
            ["审核 / 再审核", <Tag tone="info">✓</Tag>, <Tag tone="muted">—</Tag>, <Tag tone="muted">—</Tag>, "audit ∈ {pending,rejected}；仅平台视角"],
            ["停用 / 启用", <Tag tone="success">✓</Tag>, <Tag tone="success">✓</Tag>, <Tag tone="success">✓</Tag>, "audit=approved & ownership=normal；总部停用需二次确认"],
            ["到期自动停用", <Tag tone="warning">系统</Tag>, <Tag tone="warning">系统</Tag>, <Tag tone="warning">系统</Tag>, "expire_at ≤ now() 由定时任务触发"],
            ["冻结 / 解冻", <Tag tone="warning">✓</Tag>, <Tag tone="muted">级联</Tag>, <Tag tone="muted">级联</Tag>, "平台审计/合规角色"],
            ["创建子企业", <Tag tone="success">✓</Tag>, <Tag tone="success">✓</Tag>, <Tag tone="danger">禁止</Tag>, "level < 2 & ownership=normal；平台可代任意企业创建"],
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
