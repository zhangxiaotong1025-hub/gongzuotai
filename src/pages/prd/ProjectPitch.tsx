import { Sparkles, Layers, GitBranch, Grid3x3, Quote } from "lucide-react";

/**
 * 项目汇报 · 一页讲清楚（半年度全员汇报版 · v2）
 * 路由：/prd/pitch
 *
 * 风格对齐：企业管理 - 设计总论 · 顶层架构 的"既具象又有思想"。
 * 不堆数字、不展功能清单；用三个核心概念把"我们做了什么"讲清楚。
 */
export default function ProjectPitch() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {/* ============== Hero ============== */}
      <header className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-card to-card p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[11px] text-primary">
            <Sparkles className="h-3 w-3" /> 2026 H1 · 半年度汇报
          </span>
          <h1 className="text-[30px] font-bold leading-[1.25] tracking-tight">
            居然设计家不是一家公司的 SaaS，
            <br />
            而是一个 <span className="text-primary">多角色、多产品、多业务关系并存的产业互联网底座</span>。
          </h1>
          <p className="max-w-3xl text-[14px] leading-[1.9] text-muted-foreground">
            同一份 3D 设计能力，要同时服务：头部品牌商做全国分销、家居卖场做品牌聚合、装企做整装履约、独立设计师做末端落地。
            这些角色彼此既是 <b className="text-foreground">客户</b>、又是 <b className="text-foreground">渠道</b>、还可能是 <b className="text-foreground">供给</b>。
          </p>
          <p className="max-w-3xl text-[14px] leading-[1.9] text-foreground/85">
            过去半年我们做的事，<b>不是画一棵更大的组织树</b>，而是——
            <span className="text-primary font-semibold">用一张统一的关系图，把整个产业的角色和它们之间的派生 / 聚合 / 履约 / 供给关系，装进一个可治理、可隔离、可扩展的数据骨架。</span>
          </p>
        </div>
      </header>

      {/* ============== 三个支柱 ============== */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Pillar
          icon={Layers}
          n="01"
          tag="顶层公理"
          title="Platform as Enterprise"
          punch="平台本身，就是关系图里的一个节点。"
          body="不为「平台」单独建表、单独写一套接口。平台只是 enterprise 表里 type=平台 的一行虚拟根记录，和真实企业共享同一份字段、同一套权限规则。"
          benefit="数据模型零分支 · 视角切换零成本 · 权限模型可递归"
        />
        <Pillar
          icon={GitBranch}
          n="02"
          tag="关系语法"
          title="SUB_TYPE_MAP 即业务模型"
          punch="一张「父类型 → 子类型」的有向图，定义了整个产业。"
          body="品牌→经销→门店→工作室 是分销链；卖场聚合多个独立品牌；装企承接整装履约；供应商自成平行链。改一行 SUB_TYPE_MAP，业务形态就发生质变。"
          benefit="分销 / 聚合 / 履约 / 供给 四种关系一图装下"
        />
        <Pillar
          icon={Grid3x3}
          n="03"
          tag="正交切面"
          title="企业 × 产品 = 最小坐标"
          punch="关系图是横向骨架，产品是纵向切面，垂直相交。"
          body="同一家企业可绑多个产品，每个产品下持有独立的权益账户、人员授权、客户库。欧派可以「国内 3D 已激活、国际 3D 未开通」，两条线的对账与配额完全隔离。"
          benefit="一切权益、订单、营销动作的最小寻址单元"
        />
      </section>

      {/* ============== 这套设计带来了什么 ============== */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ValueBlock
          tone="primary"
          title="商业上"
          items={[
            ["一套系统三种生意", "分销 / 聚合 / 供应链协同 同时跑，平台多三条变现曲线"],
            ["业务扩展零重做", "改一行关系图就能容纳新形态，不再为新业务建新系统"],
            ["代客服务天然合法", "「平台即上帝视角」让客成、运营、审计的代操作不需要特殊接口"],
          ]}
        />
        <ValueBlock
          tone="emerald"
          title="技术上"
          items={[
            ["运维成本数量级下降", "单表 + 单套 RLS 同时支撑平台与企业视角，bug 面也跟着收敛"],
            ["完整业务空间有解析坐标", "关系图 × 产品矩阵 × 状态三维 = 任何业务点都能被定位"],
            ["下游模块零额外约定", "权益、订单、人员、客户只消费 enterprise_id × product_id 即可隔离"],
          ]}
        />
      </section>

      {/* ============== 7 公理 · 紧凑 ============== */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">7 条不可违反的公理</h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground">
            AXIOMS · 贯穿一切模块
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
          {AXIOMS.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-md border bg-muted/15 px-3 py-2">
              <span className="font-mono text-[10px] text-primary mt-0.5 shrink-0">{String(i).padStart(2, "0")}</span>
              <div>
                <div className="text-[12.5px] font-semibold text-foreground">{a.k}</div>
                <div className="text-[11.5px] text-muted-foreground leading-[1.7]">{a.v}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== 收尾 ============== */}
      <footer className="rounded-2xl border bg-gradient-to-r from-primary/10 via-card to-card p-6">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary/60 shrink-0 mt-1" />
          <p className="text-[15px] leading-[1.8] text-foreground/90">
            真正难的不是写出多少功能，而是<b className="text-primary">用一套最简的公理，解释完整个产业里所有的人、关系和生意</b>。
            <br />
            过去半年，我们把这件事做完了。剩下的，就是在这副骨架上长肉。
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ───────── 数据 ───────── */

const AXIOMS = [
  { k: "平台即上帝视角", v: "平台后台拥有全部能力；安全边界由角色 × 策略 × 数据范围三层兜底" },
  { k: "Platform as Enterprise", v: "平台是 enterprise 表里一条虚拟根，与真实企业共享一切" },
  { k: "关系语法即业务模型", v: "SUB_TYPE_MAP 是关系图唯一权威，绕过它的特例必须拒绝" },
  { k: "状态三维解耦", v: "审核 / 业务 / 所有权 三个维度独立，禁止合并为单一 status" },
  { k: "到期即自动停用", v: "expire_at ≤ now() 由定时任务自动停用，续期由订单事件回写" },
  { k: "编辑不创订单", v: "权益变更必须走订单留 sourceOrderId，编辑页禁止改权益" },
  { k: "退出而非删除", v: "企业、人员均不物理删除，退出即软冻结，审计与对账可追溯" },
  { k: "级联冻结，不级联停用", v: "冻结父企业 → 子企业级联冻结；停用是商务行为需逐个确认" },
];

/* ───────── 组件 ───────── */

function Pillar({
  icon: Icon, n, tag, title, punch, body, benefit,
}: {
  icon: any; n: string; tag: string; title: string; punch: string; body: string; benefit: string;
}) {
  return (
    <div className="relative rounded-xl border bg-card p-5 overflow-hidden">
      <div className="absolute right-3 top-2 font-mono text-[34px] font-bold text-primary/10 leading-none">{n}</div>
      <div className="relative flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{tag}</span>
      </div>
      <div className="mt-3 text-[15px] font-semibold text-foreground">{title}</div>
      <div className="mt-1.5 text-[12.5px] font-medium text-primary">{punch}</div>
      <p className="mt-2.5 text-[12px] leading-[1.85] text-foreground/75">{body}</p>
      <div className="mt-3 pt-3 border-t border-dashed text-[11px] text-emerald-600/90 leading-[1.7]">
        ✓ {benefit}
      </div>
    </div>
  );
}

function ValueBlock({
  tone, title, items,
}: {
  tone: "primary" | "emerald"; title: string; items: [string, string][];
}) {
  const map = {
    primary: { bar: "border-l-primary", text: "text-primary" },
    emerald: { bar: "border-l-emerald-500", text: "text-emerald-600" },
  }[tone];
  return (
    <div className={`rounded-xl border border-l-4 ${map.bar} bg-card p-5`}>
      <div className={`text-[14px] font-semibold ${map.text} mb-3`}>{title}</div>
      <ul className="space-y-2.5">
        {items.map(([t, s]) => (
          <li key={t} className="grid grid-cols-[140px_1fr] gap-3">
            <div className="text-[12.5px] font-semibold text-foreground">{t}</div>
            <div className="text-[12px] text-muted-foreground leading-[1.75]">{s}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
