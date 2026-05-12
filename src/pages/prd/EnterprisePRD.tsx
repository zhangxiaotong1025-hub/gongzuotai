import { useEffect, useState } from "react";
import {
  FileText,
  Network,
  Activity,
  Database,
  GitBranch,
  Rocket,
  Workflow,
  Layers,
} from "lucide-react";
import { Card, H2, H3, H4, KV, Pre, Stat, Table, Tag, Code, SeqLine } from "./entitlement/parts";
import { Mermaid } from "@/components/prd/Mermaid";

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
  { id: "atlas", label: "08 · 数据生命周期图谱", icon: Layers, children: [
    { id: "atlas-dag", label: "总依赖 DAG · 一图看全" },
    { id: "atlas-matrix", label: "数据契约 · 上下游消费矩阵" },
    { id: "atlas-cards", label: "每个实体的状态机 + 上下游" },
    { id: "atlas-emerge", label: "一次入驻的「数据涌现」时序" },
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
        <DataLifecycleAtlas />
        <div className="text-center text-[12px] text-muted-foreground py-8 border-t">— 企业管理 PRD · v1.2 · 数据生命周期图谱 · 变更走 PR 评审 —</div>
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

/* ───────────────────────── 07 端到端业务流 ───────────────────────── */
function E2EFlow() {
  return (
    <section id="e2e" className="scroll-mt-4 space-y-5">
      <H2 icon={Workflow} num="07">端到端业务流 · 跨域全链路</H2>
      <p className="text-[13px] text-muted-foreground max-w-[68ch] leading-[1.85]">
        前 6 章按「领域」纵切，本章按「时间」横切。一个对象（企业 / 人员 / 应用）从被创建到退出，
        会穿越 <Code>权限 · 菜单 · 策略 · 角色 · 企业 · 人员 · 权益</Code> 七个域，
        每一次状态翻转都会同时引起<strong>菜单可见性、按钮可点击、数据可见行、可写入字段、可消费配额</strong>五个维度的重算。
        这一章把这条「看不见的链路」画出来。
      </p>

      {/* ───── 7.1 企业创建全生命周期 ───── */}
      <div id="e2e-ent" className="space-y-4">
        <H3>7.1 企业创建全生命周期（13 个里程碑）</H3>
        <Pre>{`┌─ 阶段 ─┬─ 里程碑 ──────────┬─ 触发者 ──┬─ 主写表 ───────────────┬─ 衍生效应（看不见的部分） ────────────────────┐
│        │                    │           │                        │                                                  │
│ 萌芽   │ M1 招商线索        │ 平台 BD   │ application(intent)    │ 客户域写入潜客；营销域开始追踪触点                │
│        │ M2 资料提交        │ 申请人    │ application(submitted) │ AuditRecord 起点；上传材料进对象存储 + 病毒扫描   │
│        │                    │           │                        │                                                  │
│ 准入   │ M3 平台审核        │ 平台审核员│ application(approved)  │ 触发 application.approved → 创建 enterprise 行   │
│        │ M4 企业落库        │ 系统      │ enterprise(new)        │ 自动派发 enterprise_id；RLS 立即生效              │
│        │ M5 默认角色生成    │ 系统      │ role(super_admin)      │ 拷贝角色模板（按 type 不同）；写 role_menu        │
│        │ M6 首任管理员绑定  │ 系统      │ staff + user_role      │ 短信下发临时密码；user.phone 必填且唯一           │
│        │                    │           │                        │                                                  │
│ 激活   │ M7 权益账户开户    │ 权益域    │ entitlement_account    │ 消费 enterprise.application.approved 事件         │
│        │ M8 首单（试用/赠送）│ 平台运营 │ order(internal_grant)  │ 写入配额，account.quota 由 0 变正                 │
│        │ M9 应用授权点亮    │ 权益域    │ account_app_binding    │ 决定 sidebar 哪些「应用入口」可见                 │
│        │                    │           │                        │                                                  │
│ 运营   │ M10 子企业创建     │ HQ / 平台 │ enterprise(level=1/2)  │ parent_id + SUB_TYPE_MAP 校验；继承部分权益       │
│        │ M11 人员扩充       │ 企业管理员│ staff + user_role      │ 角色 → 菜单 → 策略 → 数据范围 四级生效            │
│        │ M12 续费 / 加购    │ 销售     │ order(renewal/upsell)  │ 配额合并，expire_at 后推                          │
│        │                    │           │                        │                                                  │
│ 终态   │ M13 到期 / 退出    │ 系统/HQ  │ enterprise(disabled)   │ 见 7.6 全链路逆向流；数据保留但不可写             │
└────────┴────────────────────┴───────────┴────────────────────────┴──────────────────────────────────────────────────┘`}</Pre>
        <KV items={[
          { k: "为什么 M5 在 M6 之前", v: "角色必须先存在，绑管理员时才能写 user_role；否则会出现「有人无权」的真空 5 秒。" },
          { k: "为什么 M7 走事件而非同步", v: "权益域是独立服务，同步调用会让企业创建被权益故障拖垮；事件 + 补偿任务即可。" },
          { k: "M8 为何必须存在", v: "无订单 = 无配额 = 应用可见但点开报「未授权」，体验崩塌。试用单是默认兜底。" },
          { k: "M10 的隐含约束", v: "子企业不能继承「父级独有」的应用授权（例如平台代运营工具），需重新开单。" },
        ]} />
      </div>

      {/* ───── 7.2 人员 × 应用全生命周期 ───── */}
      <div id="e2e-staff" className="space-y-4">
        <H3>7.2 人员 × 应用全生命周期</H3>
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/5 p-4 text-[12.5px] leading-[1.8] text-foreground/85">
          <div className="mb-1 font-semibold text-amber-600">与企业不同：人员无「申请期」</div>
          人员侧没有 C 端用户自助申请加入企业的入口。<b>由后台管理员（平台超管 / 企业管理员）单向创建</b>：
          填写资料 → 系统注册账号 + 分配角色 + 直接挂载企业组织节点 → 短信告知（含登录地址、账号、初始密码）。
          人员从被创建那一刻起即 <Code>active</Code>，无 pending / 待审核态。这与企业入驻（带 audit 时间线）形成对照。
        </div>
        <Pre>{`            ┌────────────── 人员域（管理员单向写） ──────────────┐   ┌───── 权益/应用域 ─────┐
 创建 →     │ 后台填写资料 → 注册账号 → 加入企业 → 绑定角色      │   │ 按角色含应用 → 占座   │
            └────────────────────┬────────────────────────────────┘   └───────────┬───────────┘
                                 ▼                                                 ▼
 通知 →     短信下发（登录地址 + 手机号 + 初始密码 / 验证码）    account_user_binding(seat +1)
                                 │                                                 │
                                 ▼                                                 ▼
 工作 →     菜单/按钮/数据：随 role + enterprise 计算            应用内行为：受 capability_rule 约束
                                 │                                                 │
        ┌────────────────────────┼────────────────────────┐                        │
        ▼                        ▼                        ▼                        ▼
    调岗(改 role)        换企业(改 enterprise_id)   离职(staff.exit)         应用回收(seat -1)
        │                        │                        │                        │
        ▼                        ▼                        ▼                        ▼
    重算菜单缓存            重算 RLS 行可见              冻结登录                 配额释放回池`}</Pre>
        <Table
          headers={["阶段", "触发者", "人员域写", "权限/权益域", "对前端的可视影响"]}
          cols={["80px", "110px", undefined, undefined, undefined]}
          rows={[
            ["创建", "平台超管 / 企业管理员", "user(created) + staff(active) + user_role 一次性写入", "role → menu → policy 缓存预热；按角色含应用 → account_user_binding 占座", "组织树即时出现新节点；无「待入职」中间态"],
            ["通知", "系统（事件驱动）", "—", "短信网关下发：登录地址 + 账号（手机号）+ 初始密码", "本人未登录前，列表仍为 active；短信失败有重发入口"],
            ["首次登录", "本人", "user.first_login_at 写入；强制改密", "—", "改密后进入正常工作态"],
            ["调岗", "管理员", "user_role 更新", "失效 role 缓存，下次请求重算；新角色不含某应用 → 释放座位", "当前页若失去访问权 → 401 拦截跳首页"],
            ["跨企业", "管理员", "新增一行 staff（同 user_id，不同 enterprise_id）", "X-Enterprise-Id 切换；新企业账户内重新占座", "登录后可切换企业入口；切换后 layout reload"],
            ["离职 / 退出", "管理员", "staff.status = exited（不删 user，不删历史）", "user_role 软删；登录态作废；座位 -1", "登录被拒；历史数据仅审计角色可见"],
          ]}
        />
        <KV items={[
          { k: "为什么没有「申请期」", v: "B 端后台用户身份必须由企业方授予，不允许 C 端自助申请入伙——避免越权挂靠、数据归属混乱。所有人员入口都是「后台管理员代建」。" },
          { k: "为什么人员不真删", v: "签过的订单 / 审核 / 客户跟进记录需要保留可追溯，删除会让历史报表出现幽灵主键，因此只做 exit（软冻结）。" },
          { k: "座位（seat）的语义", v: "应用授权的最小可消费单位。座位归账户所有，绑定到人；人离职解绑后座位回到账户池，由企业管理员再分配。" },
          { k: "创建短信 ≠ 登录验证码", v: "两条独立通路。① 创建短信：管理员代建人员时一次性下发「登录地址 + 账号 + 初始密码」，是「分发凭据」用途；② 登录验证码（OTP）：用户在登录页主动请求的即用即弃 6 位短信码，是「鉴权方式」用途，不会预生成、不会塞进创建短信。" },
          { k: "短信失败的兜底", v: "短信网关回调失败 → 列表标红「通知未送达」+ 重发按钮；初始密码可由管理员重置后再次下发，不阻塞 staff 已生效的事实。" },
          { k: "调岗与「越权访问历史页」", v: "前端不主动踢出；下一次 API 请求 401 时统一拦截跳首页 + Toast「权限已变更」。" },
        ]} />
      </div>

      {/* ───── 7.3 一次请求穿透 ───── */}
      <div id="e2e-render" className="space-y-4">
        <H3>7.3 一次请求穿透：从「点击菜单」到「拿到数据」</H3>
        <p className="text-[12.5px] text-muted-foreground leading-[1.85]">
          示例：企业管理员点击侧边栏「人员管理 → 列表」。这一次点击会触达<strong>七个域</strong>，
          任何一层失败都意味着用户看到「空 / 报错 / 越权」。
        </p>
        <Pre>{`Step  Domain        Action                                            Cache  Latency
────  ──────────  ────────────────────────────────────────────────  ─────  ───────
 1    Auth        校验 JWT → 解出 user_id, enterprise_id, role_id    L1     ~3ms
 2    Permission  load_role(role_id) → menu_ids[]                    L1     ~5ms
 3    Permission  当前 path ∈ menu.path？否则 403                     —      ~1ms
 4    Permission  load_policy(menu_id, type=API) → 允许的 API 列表    L1     ~4ms
 5    Enterprise  load_enterprise(enterprise_id) → audit/business    L1     ~3ms
                  ├─ audit ≠ approved   → 灰屏 + 引导补资料
                  └─ business = disabled → 只读 + 顶部红条
 6    Permission  load_policy(menu_id, type=DATA) → RLS scope        L1     ~2ms
                  scope ∈ {self, dept, enterprise, tree, all}
 7    Staff/Data  SELECT * FROM staff WHERE <RLS by scope>            DB    ~30ms
 8    Entitlement 对返回列每行 check capability_rule（如「导出按钮」）  L2    ~10ms
 9    Frontend    渲染：菜单高亮 + 按钮显隐 + 行数据 + 列脱敏           —      ~50ms
                                                                    ─────────
                                                              合计  ≈ 110ms`}</Pre>
        <KV items={[
          { k: "数据可见 ≠ 按钮可见", v: "第 7 步控制「能看哪些行」，第 8 步控制「这一行上哪些按钮亮」；两套策略独立存储。" },
          { k: "为什么 audit 校验放第 5 步而不是第 1 步", v: "审核未过的企业用户仍可登录看「补资料引导页」，所以校验必须晚于菜单解析。" },
          { k: "平台视角的差异", v: "Step 5 的 enterprise_id 来自 URL（?enterprise_id=…）而非 JWT；Step 6 的 scope 强制为 all。" },
        ]} />
      </div>

      {/* ───── 7.4 一次写入扩散 ───── */}
      <div id="e2e-write" className="space-y-4">
        <H3>7.4 一次写入扩散：关键写操作的事件传播图</H3>
        <p className="text-[12.5px] text-muted-foreground leading-[1.85]">
          下列四张图覆盖企业 / 人员域最高频、最易踩坑的写操作。<strong>实线 = 同事务必须成功</strong>，
          <strong>虚线 = 事件总线异步 fan-out（可重试、最终一致）</strong>。事务边界故意收得很窄 ——
          只保证「主体表 + 审计表」原子，其他域全部异步消费，避免一次停用把数仓也拖回滚。
        </p>

        <H4>① 停用企业（手动 · 后台触发）</H4>
        <Mermaid
          caption="POST /enterprise/{id}:business → disabled · 7 路 fan-out"
          chart={`flowchart LR
  A["管理员<br/>POST /enterprise/E001:business<br/>{to: disabled}"]:::trigger
  subgraph TX["同事务（强一致）"]
    direction TB
    B["enterprise<br/>business_status = disabled"]
    C["AuditRecord<br/>action=business_change<br/>operator / reason"]
  end
  BUS(("event bus<br/>enterprise.business.changed")):::bus
  A --> B --> C --> BUS

  BUS -.->|① 权益域| Q["account.quota.frozen=true<br/>余额保留 · 不扣减"]
  BUS -.->|② 菜单域| M["失效 role:E001:*<br/>下次请求重算"]
  BUS -.->|③ 人员域| U["登录态打标<br/>next-request 提示停用"]
  BUS -.->|④ 客户域| L["线索池移除 E001<br/>停止新分发"]
  BUS -.->|⑤ 营销域| K["暂停 campaign<br/>重算 ROI 基数"]
  BUS -.->|⑥ 子企业| S["按 cascade 配置<br/>逆向流递归"]
  BUS -.->|⑦ BI / 数仓| W["维表 SCD2<br/>历史报表不被篡改"]

  classDef trigger fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef bus fill:#1e293b,stroke:#0f172a,color:#fff;
`}
        />

        <H4>② 到期自动停用（系统 · 定时任务触发）</H4>
        <Mermaid
          caption="cron 扫到 expire_at < now() · 与手动停用共用 fan-out 通道"
          chart={`flowchart LR
  T["cron @ 03:00<br/>SELECT * WHERE expire_at < now()"]:::trigger --> J["job: auto_disable<br/>批量游标"]
  J --> B["enterprise<br/>business_status=disabled<br/>disable_reason=expired"]
  B --> C["AuditRecord<br/>operator=SYSTEM<br/>action=auto_disable"]
  C --> BUS(("event bus<br/>enterprise.business.changed")):::bus
  BUS -.->|与手动停用共用消费者| FANOUT["① 权益冻结<br/>② 菜单失效<br/>③ 登录打标<br/>④ 线索剔除<br/>⑤ 营销暂停<br/>⑥ 子企业级联<br/>⑦ BI SCD2"]
  J -.->|预警 T-7 / T-1| N["站内信 + 短信<br/>给企业管理员"]

  classDef trigger fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef bus fill:#1e293b,stroke:#0f172a,color:#fff;
`}
        />

        <H4>③ 创建人员（后台单向写 · 含短信下发）</H4>
        <Mermaid
          caption="管理员代建人员 · 无申请期 · 一次性激活"
          chart={`flowchart LR
  A["管理员<br/>POST /staff"]:::trigger
  subgraph TX["同事务"]
    direction TB
    U["user<br/>created · phone 唯一"]
    S["staff<br/>active · enterprise_id"]
    R["user_role<br/>角色绑定"]
    AR["AuditRecord<br/>action=staff_create"]
  end
  A --> U --> S --> R --> AR
  AR --> BUS(("event bus<br/>staff.created")):::bus

  BUS -.->|短信网关| SMS["发送登录链接 + 初始密码 / 验证码"]
  BUS -.->|权益域| SEAT["按角色含应用<br/>account_user_binding seat+1"]
  BUS -.->|菜单域| MC["预热 user:{id}:context"]
  BUS -.->|客户域| CR["分配可见客户范围（RLS 重算）"]
  SMS -.->|失败回调| FB["列表标红「通知未送达」<br/>+ 重发按钮"]

  classDef trigger fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef bus fill:#1e293b,stroke:#0f172a,color:#fff;
`}
        />

        <H4>④ 人员离职（exit · 软冻结）</H4>
        <Mermaid
          caption="staff.exit · 历史数据保留 · 座位回池"
          chart={`flowchart LR
  A["管理员<br/>POST /staff/{id}:exit"]:::trigger
  subgraph TX["同事务"]
    direction TB
    S["staff.status = exited<br/>不删 user · 不删历史"]
    UR["user_role 软删<br/>deleted_at = now()"]
    AR["AuditRecord<br/>action=staff_exit"]
  end
  A --> S --> UR --> AR
  AR --> BUS(("event bus<br/>staff.exited")):::bus

  BUS -.->|登录态| TOK["JWT 黑名单<br/>下次请求 401"]
  BUS -.->|权益域| SEAT["account_user_binding seat-1<br/>30 天后清理行为数据"]
  BUS -.->|菜单域| MC["清除 user:{id}:context"]
  BUS -.->|客户域| CR["其名下客户回归企业池<br/>等待重新分配"]
  BUS -.->|审计可见| AV["历史订单 / 跟进记录<br/>仅审计角色可读"]

  classDef trigger fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef bus fill:#1e293b,stroke:#0f172a,color:#fff;
`}
        />

        <KV items={[
          { k: "为什么不把所有写入塞进一个事务", v: "事务越大失败面越大；菜单缓存重建、SMS 下发、BI 写入失败都可独立重试，不该让停用企业整体回滚。" },
          { k: "「冻结而非清零」", v: "保留余额是为了「误操作复活」时不让客户白丢配额；30 天后才走清算结算。" },
          { k: "SCD2（维表慢变）", v: "「2024Q3 北京区 GMV」必须用当时的归属，不能被今天的停用动作改写历史 —— 数仓维表保留版本快照。" },
          { k: "事件总线的可靠性", v: "至少一次投递 + 消费者幂等（以 event_id + consumer 做去重表），允许重复消费、不允许丢消息。" },
        ]} />
      </div>

      {/* ───── 7.5 缓存与失效时序 ───── */}
      <div id="e2e-decay" className="space-y-4">
        <H3>7.5 失效 · 重算 · 缓存时序（看不见的一致性）</H3>
        <Table
          headers={["缓存键", "层级", "TTL", "失效触发", "重算成本"]}
          cols={["220px", "60px", "70px", undefined, undefined]}
          rows={[
            ["role:{id}:menus", "L1 Redis", "1h", "menu / role_menu 写", "低（一次 JOIN）"],
            ["role:{id}:policies", "L1 Redis", "1h", "policy 写", "低"],
            ["user:{id}:context", "L1 Redis", "15min", "user_role / enterprise 切换", "中（聚合 4 表）"],
            ["enterprise:{id}:meta", "L1 Redis", "10min", "enterprise 写 / 审核流转", "低"],
            ["account:{ent}:quota", "L2 本地", "30s", "订单写入 / 消费 webhook", "高（汇总配额 + 已用）"],
            ["列表查询（人员/客户）", "—", "不缓存", "—", "依赖 DB 索引 + RLS 函数"],
          ]}
        />
        <p className="text-[12.5px] text-muted-foreground leading-[1.85]">
          原则：<strong>权限类强一致（写后立即清缓存）</strong>；<strong>配额类弱一致（30s 内可超用，月底走对账补偿）</strong>；
          <strong>列表类不缓存</strong>（依赖数据库自身的索引和 RLS 函数即可）。
        </p>
      </div>

      {/* ───── 7.6 逆向流 ───── */}
      <div id="e2e-reverse" className="space-y-4">
        <H3>7.6 全链路逆向流：到期 · 退出 · 冻结的差异</H3>
        <Table
          headers={["路径", "触发者", "可逆性", "权益处理", "人员处理", "数据可见性"]}
          cols={["100px", undefined, "70px", undefined, undefined, undefined]}
          rows={[
            ["到期自动停用", "Cron（expire_at）", "可逆", "quota.frozen=true，余额保留 30 天", "登录态保留，写操作 403", "本企业可读不可写"],
            ["主动退出（HQ申请）", "HQ → 平台审批", "不可逆", "结算未消费余额，account 关闭", "全员降级为 archived", "30 天后只对审计角色可见"],
            ["平台冻结（合规）", "平台审计", "可逆", "quota.frozen=true，订单挂起", "登录被拒，提示「联系平台」", "对企业全员不可见，平台可见"],
            ["合并/迁移", "平台运营 + saga", "可逆", "余额按比例迁出，原账户归档", "员工 enterprise_id 变更", "历史数据双向可读（30 天过渡）"],
          ]}
        />
        <KV items={[
          { k: "为什么主动退出比平台冻结更重", v: "前者意味着商业关系终止，结算 + 数据归档需要走法务流程；后者只是合规挂起。" },
          { k: "「可逆」的真实含义", v: "可逆 = 状态字段反向写即可恢复；不可逆 = 已经写过结算单 / 归档了历史数据，恢复需要走「重新申请」整套 7.1 流程。" },
          { k: "退出 vs 删除", v: "本系统不存在物理删除企业。所有「删除」语义都映射到上表中的一种。" },
        ]} />

        <div className="rounded-lg border-l-2 border-primary/60 bg-primary/5 px-4 py-3 text-[12.5px] leading-[1.85]">
          <strong>设计哲学回扣：</strong>本章 6 个小节回答的不是「怎么做」，而是「做了之后看不见的地方会发生什么」。
          一个合格的企业管理模块，<strong>评判标准不是创建表单字段多全，而是停用一个企业时系统能否优雅地告诉所有下游</strong>。
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 08 数据生命周期图谱 ─────────────────────────
   讲清楚每个数据实体的：状态机 / 谁能写它（上游）/ 谁会消费它（下游）/
   它消失时谁会受伤。所有耦合都显式画出来，不留「看不见的隐式依赖」。
*/

/** 单实体生命周期卡 */
function LifecycleCard({
  code, name, table, owner, states, upstream, downstream, rule,
}: {
  code: string;
  name: string;
  table: string;
  owner: string;
  states: string;             // mermaid stateDiagram-v2
  upstream: { who: string; when: string }[];
  downstream: { who: string; when: string }[];
  rule: string;
}) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-baseline gap-3 border-b bg-muted/30 px-4 py-2.5">
        <span className="font-mono text-[10px] tracking-[0.18em] text-primary">{code}</span>
        <div className="text-[13.5px] font-semibold text-foreground">{name}</div>
        <span className="font-mono text-[10.5px] text-muted-foreground">{table}</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">owner · {owner}</span>
      </div>
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-0 md:divide-x">
        <div className="p-3">
          <div className="text-[10.5px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">状态机</div>
          <Mermaid chart={states} />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-emerald-600 mb-1.5">↑ 上游（谁会写它）</div>
            <ul className="text-[11.5px] leading-[1.85] text-foreground/85 space-y-0.5">
              {upstream.map((u, i) => (
                <li key={i}><b className="text-foreground">{u.who}</b> · <span className="text-muted-foreground">{u.when}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-widest text-violet-500 mb-1.5">↓ 下游（谁会消费它）</div>
            <ul className="text-[11.5px] leading-[1.85] text-foreground/85 space-y-0.5">
              {downstream.map((d, i) => (
                <li key={i}><b className="text-foreground">{d.who}</b> · <span className="text-muted-foreground">{d.when}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded border-l-2 border-amber-400/60 bg-amber-400/5 px-2.5 py-1.5 text-[11px] leading-[1.7] text-foreground/85">
            <b className="text-amber-600">关键规则 · </b>{rule}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataLifecycleAtlas() {
  return (
    <section id="atlas" className="scroll-mt-4 space-y-6">
      <H2 icon={Layers} num="08">数据生命周期图谱 · Data Lifecycle Atlas</H2>
      <p className="text-[13px] leading-7 text-foreground/85">
        前 7 章把流程讲透了，但<b>「数据」本身的视角</b>还没正面回答：每一张表都有它独立的状态机、独立的上游写入方、独立的下游消费方。
        本章把 11 个核心实体逐一拆开，让你能像查字典一样：<b>看见任何一张表，立即知道「谁会改它 / 改了之后谁会感知到 / 它消失时谁会断电」</b>。
      </p>

      {/* ───── 8.1 总依赖 DAG ───── */}
      <div id="atlas-dag" className="space-y-3">
        <H3>8.1 总依赖 DAG · 一图看全</H3>
        <p className="text-[12.5px] text-muted-foreground leading-[1.8]">
          自上而下分四层：<b>权限基座层 → 主体身份层 → 业务实体层 → 行为/资产层</b>。
          箭头方向 = <b>「被依赖」方向</b>（A → B 表示 B 的可用性依赖 A 存在且有效）。
          虚线 = 弱依赖（缺失不致命，只影响渲染）。
        </p>
        <Mermaid
          caption="数据实体依赖 DAG · 4 层 11 实体"
          chart={`flowchart TB
  subgraph L1["① 权限基座层（系统级 · 跨企业共享）"]
    direction LR
    MENU["Menu 菜单<br/>menu"]:::base
    POLICY["Policy 策略<br/>policy"]:::base
    ROLE["Role 角色<br/>role + role_menu + role_policy"]:::base
    APP["Application 应用<br/>app"]:::base
    CAP["Capability 能力<br/>capability + capability_rule"]:::base
    SKU["SKU / Package<br/>sku · bundle"]:::base
  end

  subgraph L2["② 主体身份层（多租户骨架）"]
    direction LR
    ENT["Enterprise 企业<br/>enterprise"]:::ent
    BRAND["Brand 品牌<br/>brand + brand_relation"]:::ent
    APPLY["EnterpriseApplication<br/>enterprise_application"]:::ent
    AUDIT["AuditRecord 审计<br/>audit_record"]:::ent
  end

  subgraph L3["③ 业务实体层（人与权益）"]
    direction LR
    USER["User 用户<br/>user"]:::biz
    STAFF["Staff 人员<br/>staff + user_role"]:::biz
    ACCT["EntitlementAccount<br/>account + account_user_binding"]:::biz
    ORDER["Order 订单<br/>order + order_item"]:::biz
  end

  subgraph L4["④ 行为/资产层（消费 & 履约）"]
    direction LR
    CUST["Customer / Lead<br/>customer · lead"]:::act
    PROD["Product / Model<br/>product · spu · sku · model"]:::act
  end

  MENU --> ROLE
  POLICY --> ROLE
  APP --> CAP
  CAP --> SKU
  ROLE --> STAFF
  SKU --> ORDER

  APPLY --> ENT
  ENT --> BRAND
  ENT --> STAFF
  ENT --> ACCT
  ENT --> ORDER
  ENT --> CUST
  ENT --> PROD
  ENT --> AUDIT
  STAFF --> AUDIT
  ORDER --> AUDIT

  USER --> STAFF
  STAFF --> ACCT
  ORDER --> ACCT
  ACCT --> CUST

  STAFF -.->|分配| CUST
  BRAND -.->|own/agent| PROD
  CAP -.->|约束| PROD

  classDef base fill:#eef2ff,stroke:#6366f1,color:#312e81;
  classDef ent  fill:#fef3c7,stroke:#d97706,color:#78350f;
  classDef biz  fill:#dcfce7,stroke:#16a34a,color:#14532d;
  classDef act  fill:#fae8ff,stroke:#a855f7,color:#581c87;
`}
        />
        <KV items={[
          { k: "为什么权限基座最上层", v: "Menu / Policy / Role 是「系统出厂资产」，不随某个企业生灭。企业被停用，菜单本身依然存在 —— 反之菜单被下线，所有企业立即失去入口。" },
          { k: "为什么 Enterprise 是中转中心", v: "几乎所有业务表都带 enterprise_id（RLS 行隔离的根字段）。它不是「最高」，但是「最热」—— 任何业务查询都会先过它。" },
          { k: "弱依赖为何用虚线", v: "Staff 没有客户 → 列表为空，不报错；Brand 没有 Product → 商品库为空，不报错。这些缺失只影响渲染而非系统功能。" },
        ]} />
      </div>

      {/* ───── 8.2 上下游消费矩阵 ───── */}
      <div id="atlas-matrix" className="space-y-3">
        <H3>8.2 数据契约 · 上下游消费矩阵</H3>
        <p className="text-[12.5px] text-muted-foreground leading-[1.8]">
          行 = 数据生产者（写入方），列 = 数据消费者（读取方）。<Code>●</Code> = 强消费（缺失则功能不可用），
          <Code>○</Code> = 弱消费（仅影响渲染或排序）。<b>读这张表的方式：先看竖列 —— 当我做这个功能时，我需要谁的数据。</b>
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-[11px]">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 sticky left-0 bg-muted/40 z-10">生产者 ↓ / 消费者 →</th>
                {["Role 鉴权","Staff 列表","Account 配额","Order 下单","Customer 分配","Product 可见","BI 数仓","审计追溯"].map(h => (
                  <th key={h} className="px-2 py-2 font-normal text-center whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr]:border-t [&_td]:px-2 [&_td]:py-1.5">
              {[
                ["Menu",        "●","○","—","—","—","○","—","—"],
                ["Policy",      "●","●","○","●","●","●","—","—"],
                ["Role",        "●","●","○","●","●","●","—","○"],
                ["Application", "—","—","—","—","—","—","○","●"],
                ["Enterprise",  "●","●","●","●","●","●","●","●"],
                ["Brand",       "—","—","—","●","—","●","○","○"],
                ["User",        "●","●","—","○","—","—","—","○"],
                ["Staff",       "●","●","●","●","●","○","○","●"],
                ["Account",     "—","○","●","●","○","○","●","○"],
                ["Order",       "—","—","●","●","—","○","●","●"],
                ["SKU/Capability","—","—","●","●","—","●","○","—"],
              ].map(row => (
                <tr key={row[0]} className="hover:bg-muted/20">
                  <td className="font-medium text-foreground sticky left-0 bg-card">{row[0]}</td>
                  {row.slice(1).map((v, i) => (
                    <td key={i} className={`text-center font-mono ${v === "●" ? "text-primary font-bold" : v === "○" ? "text-muted-foreground" : "text-muted-foreground/30"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── 8.3 实体生命周期卡片 ───── */}
      <div id="atlas-cards" className="space-y-4">
        <H3>8.3 每个实体的状态机 + 上下游</H3>

        <LifecycleCard
          code="ENT-01" name="Enterprise · 企业" table="enterprise" owner="平台运营"
          states={`stateDiagram-v2
  [*] --> pending: 提交申请
  pending --> active: 平台通过
  pending --> pending: 驳回再交
  active --> frozen: 平台冻结
  frozen --> active: 解冻
  active --> disabled: 到期/手动停用
  disabled --> active: 续期/恢复
  disabled --> exited: 主动退出审批通过
  exited --> [*]: 30 天后仅审计可见`}
          upstream={[
            { who: "EnterpriseApplication", when: "申请通过 → 落表" },
            { who: "平台运营", when: "手动停用 / 冻结 / 调整层级" },
            { who: "Cron · auto_disable", when: "expire_at < now() 批量停用" },
          ]}
          downstream={[
            { who: "RLS 函数", when: "几乎所有业务查询的根过滤字段" },
            { who: "Staff / Customer / Order / Product", when: "外键 enterprise_id" },
            { who: "BI 数仓", when: "维表 SCD2 保留版本" },
          ]}
          rule="不存在物理删除。所有「删除」语义必须映射到 frozen / disabled / exited 三态之一，否则审计断链。"
        />

        <LifecycleCard
          code="APP-01" name="EnterpriseApplication · 入驻申请" table="enterprise_application" owner="平台审核"
          states={`stateDiagram-v2
  [*] --> submitted: 提交
  submitted --> pending: 受理（自动）
  pending --> approved: 通过 → 生成 Enterprise
  pending --> rejected: 驳回（可再提交）
  rejected --> submitted: 修改后再交
  approved --> [*]: 归档`}
          upstream={[
            { who: "申请人 / 平台代提", when: "/enterprise/apply 表单提交" },
            { who: "平台审核员", when: "审核动作（通过 / 驳回）" },
          ]}
          downstream={[
            { who: "Enterprise", when: "approved 时 1:1 物化新企业" },
            { who: "AuditRecord", when: "每次状态流转产生一条" },
            { who: "通知中心", when: "短信 / 站内信告知申请人" },
          ]}
          rule="approved 是一次性事件，不可回退；回退路径是「先停用新企业 → 再让申请人重交」。无 final reject。"
        />

        <LifecycleCard
          code="USR-01" name="User × Staff · 用户与人员" table="user / staff / user_role" owner="后台管理员"
          states={`stateDiagram-v2
  [*] --> created: 管理员代建
  created --> active: 写入即激活（无申请期）
  active --> active: 调岗/换企业
  active --> exited: 离职
  exited --> [*]: user 保留 · staff 软冻结
  note right of active
    user_role 失效会让
    本企业 staff 立即变只读
  end note`}
          upstream={[
            { who: "平台超管 / 企业管理员", when: "POST /staff 一次性写入 user + staff + user_role" },
            { who: "SMS 网关", when: "下发登录链接 + 初始凭据（异步）" },
          ]}
          downstream={[
            { who: "Role 鉴权链", when: "登录后计算菜单 / 按钮 / RLS" },
            { who: "Account.seat", when: "按角色含应用自动 +1 / -1" },
            { who: "Customer 分配", when: "线索按 staff_id 落到名下" },
            { who: "Order / Audit", when: "operator_id 永久引用" },
          ]}
          rule="phone 是 user 主键，跨企业唯一。同一 user 可被多个 staff 行引用（多企业身份），离职只标 staff.exited，user 永不删。"
        />

        <LifecycleCard
          code="ROLE-01" name="Role · 角色" table="role + role_menu + role_policy" owner="平台 / 企业管理员"
          states={`stateDiagram-v2
  [*] --> draft: 创建（向导第 1 步）
  draft --> active: 完成向导（菜单+策略已绑）
  active --> active: 增减菜单/策略
  active --> archived: 归档（不再分配新人员）
  archived --> active: 恢复
  archived --> [*]: 无人员引用时可删`}
          upstream={[
            { who: "Permission 模块向导", when: "Role/Menu 创建向导（参见权限 PRD）" },
            { who: "管理员", when: "调整菜单 / 策略组合" },
          ]}
          downstream={[
            { who: "user_role", when: "人员引用 → 决定身份" },
            { who: "登录鉴权链", when: "user → role → menu → policy 四级解析" },
            { who: "缓存 role:{id}:*", when: "Redis 强一致写后即清" },
          ]}
          rule="有 user_role 引用的角色不可删，只能 archived。改菜单/策略立即清缓存，下一次请求即生效。"
        />

        <LifecycleCard
          code="ACCT-01" name="EntitlementAccount · 权益账户" table="account + account_user_binding" owner="权益域"
          states={`stateDiagram-v2
  [*] --> created: 首张订单生效时创建
  created --> active: 配额到账
  active --> active: 续费/扩容/绑定座位
  active --> frozen: 企业停用 → quota.frozen=true
  frozen --> active: 企业恢复
  active --> closed: 企业退出审批通过
  closed --> [*]: 30 天后归档`}
          upstream={[
            { who: "Order 履约", when: "订单 active 触发账户开户 / 加额度" },
            { who: "Staff 绑定", when: "account_user_binding 占座 / 释放" },
            { who: "事件 enterprise.business.changed", when: "停用 → frozen，恢复 → active" },
          ]}
          downstream={[
            { who: "应用运行时", when: "每次调用扣减配额（弱一致 30s）" },
            { who: "BI 数仓", when: "GMV / 续费率 / 健康度" },
            { who: "客户线索分发", when: "账户健康度影响分发权重" },
          ]}
          rule="frozen 只冻结写入，不清零余额（30 天观察期），避免误操作让客户白丢配额。座位归账户所有，人离职座位回池。"
        />

        <LifecycleCard
          code="ORD-01" name="Order · 订单" table="order + order_item" owner="权益 / 销售"
          states={`stateDiagram-v2
  [*] --> created: 下单
  created --> audit_pending: 需审核（企业授予 / 内部授予）
  audit_pending --> audit_passed: 审核通过
  audit_pending --> audit_rejected: 驳回 → 终态
  created --> paying: 直购（user_purchase）
  audit_passed --> paying: 进入支付
  paying --> paid: 收款确认
  paid --> active: 配额下发到账户
  active --> ended: 周期到期 / 退订
  ended --> [*]
  audit_rejected --> [*]`}
          upstream={[
            { who: "OrderCreate 表单", when: "三类来源：enterprise_grant / internal_grant / user_purchase" },
            { who: "支付网关 webhook", when: "paying → paid" },
            { who: "履约 job", when: "paid → active，写 Account 配额" },
          ]}
          downstream={[
            { who: "Account", when: "active 时增配额，ended 时减配额" },
            { who: "AuditRecord", when: "每次状态流转留痕" },
            { who: "BI 数仓", when: "收入确认 / 续费分析" },
          ]}
          rule="状态三维解耦（审核 × 支付 × 生命周期），互不阻塞。退款不改原订单，开新的反向单（sourceOrderIds 追溯）。"
        />

        <LifecycleCard
          code="BRD-01" name="Brand · 品牌关系" table="brand + brand_relation" owner="品牌方 / 平台"
          states={`stateDiagram-v2
  [*] --> active: 创建品牌（4 步向导）
  active --> active: 调整 own/agent 关系
  active --> suspended: 关系暂停
  suspended --> active: 恢复
  active --> archived: 品牌方退出 → 归档`}
          upstream={[
            { who: "BrandCreate 向导", when: "独立品牌创建" },
            { who: "Enterprise 入驻", when: "品牌商类型企业自动绑定其品牌" },
          ]}
          downstream={[
            { who: "Product · own/agent", when: "权限决定企业能上架哪些品牌的商品" },
            { who: "营销结算", when: "品牌方对应渠道的分润" },
          ]}
          rule="own = 自有品牌（一对一），agent = 代理关系（多对多）。Enterprise 类型决定可建立哪种关系。"
        />

        <LifecycleCard
          code="CUST-01" name="Customer / Lead · 客户与线索" table="customer + lead + assignment" owner="平台分发 / 企业销售"
          states={`stateDiagram-v2
  [*] --> raw: 线索接入（多渠道）
  raw --> cleansed: 平台清洗去重
  cleansed --> assigned: 分发到企业
  assigned --> following: 企业销售跟进
  following --> deal: 成交
  following --> dead: 战败
  deal --> [*]
  dead --> [*]
  assigned --> reclaim: 长时间未动作 → 回收池
  reclaim --> assigned: 重新分发`}
          upstream={[
            { who: "广告 / 表单 / API", when: "raw 线索入池" },
            { who: "平台运营 · 清洗规则", when: "raw → cleansed" },
            { who: "分发引擎", when: "按企业健康度 + 配额分配" },
          ]}
          downstream={[
            { who: "Staff 销售工作台", when: "「我的客户」列表" },
            { who: "Marketing ROI", when: "归因到渠道 / 活动" },
            { who: "Account 健康度", when: "成交转化率反哺权重" },
          ]}
          rule="平台视角看「全量线索」，企业视角看「分配给我的」—— 同一份数据两套 RLS 视图。回收池避免线索沉睡。"
        />

        <LifecycleCard
          code="PROD-01" name="Product / Model · 商品与模型" table="spu + sku + model + product_distribution" owner="供给方 / 企业"
          states={`stateDiagram-v2
  [*] --> draft: 创建（SPU + SKU 双层）
  draft --> reviewing: 提审
  reviewing --> published: 通过 → 可分发
  reviewing --> rejected: 驳回回 draft
  published --> distributed: 分发到 N 家企业
  distributed --> offshelf: 下架
  offshelf --> published: 重新上架`}
          upstream={[
            { who: "Supply 供给方", when: "上传 SPU/SKU/Model 资产" },
            { who: "Enterprise 私有库", when: "企业自建商品" },
            { who: "分发动作", when: "供给方 1:N 分发给企业" },
          ]}
          downstream={[
            { who: "Order 下单可选范围", when: "已分发到本企业的商品才可售" },
            { who: "3D 设计应用", when: "Model 资产被画图工具消费" },
            { who: "Brand 权限校验", when: "own/agent 决定可上架范围" },
          ]}
          rule="SPU/SKU 严格两层，Model 是 SKU 的可视化资产。供给库 vs 企业库 vs 私有库三层 Tab，对应不同的归属与可见性。"
        />

        <LifecycleCard
          code="AUD-01" name="AuditRecord · 审计追溯" table="audit_record" owner="系统（不可手工写）"
          states={`stateDiagram-v2
  [*] --> created: 任意写操作触发
  created --> [*]: 仅追加不可改`}
          upstream={[
            { who: "所有写操作", when: "trigger / 事件订阅自动落表" },
          ]}
          downstream={[
            { who: "企业详情时间线", when: "可视化审计轨迹" },
            { who: "合规 / 法务", when: "对账与追责" },
            { who: "BI", when: "操作频次 / 异常检测" },
          ]}
          rule="append-only。永远不更新、不删除。退出企业 30 天后只对审计角色可见 —— 但 audit_record 永远保留。"
        />
      </div>

      {/* ───── 8.4 数据涌现时序 ───── */}
      <div id="atlas-emerge" className="space-y-3">
        <H3>8.4 一次入驻的「数据涌现」时序</H3>
        <p className="text-[12.5px] text-muted-foreground leading-[1.8]">
          展示<b>从一行 EnterpriseApplication 开始，到一个企业能正常下单为止，N 张表是按什么顺序「涌现」的</b>。
          这张时序图回答了一个常被忽视的问题：<b>新企业第一次登录时，背后已经悄悄写过多少张表？</b>
        </p>
        <Mermaid
          caption="入驻数据涌现 · T0 提交 → T7 首单可下"
          chart={`sequenceDiagram
  autonumber
  participant U as 申请人
  participant APP as enterprise_application
  participant ENT as enterprise
  participant ROLE as role + role_menu
  participant USR as user + staff + user_role
  participant ACCT as account
  participant ORD as order
  participant AUD as audit_record

  U->>APP: T0 提交申请 (submitted)
  APP->>AUD: 写入审计 · action=apply_submit
  Note over APP: 审核流转（pending → approved）
  APP->>ENT: T1 approved 触发物化新企业
  APP->>AUD: action=apply_approved
  ENT->>ROLE: T2 注入企业级默认角色（克隆模板）
  ENT->>USR: T3 创建超管 user + staff + 绑定角色
  USR->>AUD: action=staff_create
  Note over USR: 短信网关异步下发登录凭据
  USR->>ENT: T4 首次登录 · 强制改密
  ENT->>ORD: T5 平台授予首单 (enterprise_grant)
  ORD->>ACCT: T6 履约 · 开账户 + 配额下发
  ORD->>AUD: action=order_active
  ACCT->>USR: T7 按角色含应用占座（seat+1）
  Note over ACCT,USR: 此时企业才真正「上线可用」`}
        />
        <KV items={[
          { k: "为什么 Role 必须先于 Staff", v: "Staff 创建时需要立即绑定 user_role；若没有角色可选，就会产生「裸员工」 —— 能登录但看不见任何菜单。" },
          { k: "为什么 Account 不在 T1 一起建", v: "权益账户由订单驱动 —— 没有第一张订单（哪怕是 0 元授予），就没有账户。这避免了「空账户漂移」。" },
          { k: "为什么 AuditRecord 反复出现", v: "它是横切的追溯层 —— 每一个关键写操作都必须留痕，否则事后无法回答「谁在 T3 创建了这个超管」。" },
          { k: "T0 → T7 通常多久", v: "理想路径 ≤ 2 个工作日（T0-T1 审核 1 日，T2-T7 同步完成）。任何一步卡住都会在企业详情时间线醒目显示。" },
        ]} />

        <div className="rounded-lg border-l-2 border-primary/60 bg-primary/5 px-4 py-3 text-[12.5px] leading-[1.85]">
          <strong>本章回扣：</strong>读完前 7 章，你知道「流程怎么走」；读完本章，你知道<strong>「每一条数据的来龙去脉」</strong>。
          两者结合，才构成一个可被工程团队真正落地的 PRD —— <strong>设计的关键不在于眼前看得见的，而在于一眼看不见的逻辑</strong>。
        </div>
      </div>
    </section>
  );
}
