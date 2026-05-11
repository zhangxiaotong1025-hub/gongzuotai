import { useEffect, useState } from "react";
import { FileText, Network, Activity, Database, Code2, Rocket } from "lucide-react";
import Overview from "./Overview";
import Blueprint from "./Blueprint";
import Runtime from "./Runtime";
import DataModel from "./DataModel";
import Contract from "./Contract";
import Delivery from "./Delivery";

/**
 * 单页平铺 PRD：所有内容同时渲染，TOC 仅做锚点定位（不再使用 Tabs 控制显隐）。
 * 二级 = 模块（6 章），三级 = 模块内的小节锚点。
 */
const TOC: { id: string; label: string; icon: React.ElementType; children: { id: string; label: string }[] }[] = [
  { id: "overview",  label: "01 · 设计总论",            icon: FileText, children: [
    { id: "ov-why",      label: "为什么现在做" },
    { id: "ov-chain",    label: "8 层链路概念校准" },
    { id: "ov-pain",     label: "现状 5 个结构性痛点" },
    { id: "ov-target",   label: "目标蓝图 · 三件事" },
    { id: "ov-metaphor", label: "餐厅比喻" },
    { id: "ov-scale",    label: "已铺开规模" },
  ]},
  { id: "blueprint", label: "02 · 系统蓝图",            icon: Network, children: [
    { id: "bp-arch",     label: "5 层架构全景图" },
    { id: "bp-nodes",    label: "节点全表 · 输入/输出/禁区" },
    { id: "bp-trade",    label: "四种交易模式" },
    { id: "bp-view",     label: "双视角访问控制" },
    { id: "bp-rule",     label: "不可违反的架构约束" },
  ]},
  { id: "runtime",   label: "03 · 运行时与状态机",      icon: Activity, children: [
    { id: "rt-3d",       label: "三维订单状态机" },
    { id: "rt-sop",      label: "5 条主链路 SOP" },
    { id: "rt-cc",       label: "幂等 / 并发 / 一致性" },
    { id: "rt-fail",     label: "异常与回滚预案" },
  ]},
  { id: "data",      label: "04 · 数据模型与画像",      icon: Database, children: [
    { id: "dm-er",       label: "ER 关系图" },
    { id: "dm-ddl",      label: "核心 DDL" },
    { id: "dm-asset",    label: "数据资产 4 层" },
    { id: "dm-portrait", label: "客户画像 · 特征工程" },
    { id: "dm-rls",      label: "RLS 与多租户隔离" },
  ]},
  { id: "contract",  label: "05 · API · 事件 · SLO",   icon: Code2, children: [
    { id: "ct-http",     label: "HTTP 写接口样例" },
    { id: "ct-event",    label: "领域事件 · Avro" },
    { id: "ct-slo",      label: "SLO / SLI 工程承诺" },
    { id: "ct-stack",    label: "技术栈选型" },
  ]},
  { id: "delivery",  label: "06 · 落地与里程碑",        icon: Rocket, children: [
    { id: "dl-stone",    label: "上线三基石" },
    { id: "dl-gantt",    label: "12 周里程碑" },
    { id: "dl-rollout",  label: "灰度策略 · 双写对比" },
    { id: "dl-raci",     label: "RACI 协作矩阵" },
    { id: "dl-ga",       label: "GA 验收清单" },
  ]},
];

export default function EntitlementPRDLayout() {
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const ids = TOC.flatMap(t => [t.id, ...t.children.map(c => c.id)]);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex gap-8">
      {/* Left sticky TOC · 紧凑、仅锚点跳转 */}
      <aside className="w-[176px] shrink-0 hidden lg:block">
        <div className="sticky top-2">
          <div className="px-1">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-3 pl-2">
              Contents
            </div>
            <nav className="max-h-[calc(100vh-80px)] overflow-y-auto pr-1">
              {TOC.map(sec => {
                const secActive = active === sec.id || sec.children.some(c => c.id === active);
                return (
                  <div key={sec.id} className="mb-1.5">
                    <button
                      onClick={() => goto(sec.id)}
                      className={`w-full text-left pl-2 pr-1 py-1 text-[11.5px] flex items-center transition border-l-2 ${
                        secActive
                          ? "text-primary font-medium border-primary"
                          : "text-foreground/70 hover:text-foreground border-transparent"
                      }`}
                    >
                      <span className="truncate">{sec.label}</span>
                    </button>
                    {secActive && (
                      <div className="ml-2 border-l border-border/60">
                        {sec.children.map(c => {
                          const on = active === c.id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => goto(c.id)}
                              className={`w-full text-left pl-2.5 pr-1 py-[3px] text-[10.5px] truncate transition ${
                                on ? "text-primary" : "text-muted-foreground/80 hover:text-foreground"
                              }`}
                            >
                              {c.label}
                            </button>
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

      {/* Right · 全量平铺，章节间距加大 */}
      <main className="flex-1 min-w-0 space-y-20 max-w-[1080px]">
        <section id="overview"  className="scroll-mt-4"><Overview /></section>
        <section id="blueprint" className="scroll-mt-4"><Blueprint /></section>
        <section id="runtime"   className="scroll-mt-4"><Runtime /></section>
        <section id="data"      className="scroll-mt-4"><DataModel /></section>
        <section id="contract"  className="scroll-mt-4"><Contract /></section>
        <section id="delivery"  className="scroll-mt-4"><Delivery /></section>
        <div className="text-center text-[12px] text-muted-foreground py-8 border-t">
          — 文档结束 · 修改请走 Git PR · 重大变更需评审 —
        </div>
      </main>
    </div>
  );
}
