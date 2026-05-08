import { useEffect, useRef, useState } from "react";
import {
  FileText, BookOpen, Target, Hash, Network, Layers, Database,
  Boxes, Workflow, BarChart3, Users, Radio, GitBranch, Cpu,
  Code2, ShieldCheck, Rocket, Zap, Package, ShoppingCart,
  Tag as TagIcon, Wallet, ListTree,
} from "lucide-react";
import { Tag, Card } from "./entitlement/parts";
import { S01, S02, S03, S04, S05, S06 } from "./entitlement/SectionsConfig";
import { S07, S08, S09, S10, S11 } from "./entitlement/SectionsDomain";
import { S12, S13, S14, S15, S16, S17 } from "./entitlement/SectionsDelivery";

interface Section { id: string; title: string; icon: React.ElementType; }

const SECTIONS: Section[] = [
  { id: "overview",     title: "1. 文档信息",                icon: BookOpen },
  { id: "background",   title: "2. 业务背景与目标",          icon: Target },
  { id: "glossary",     title: "3. 术语与核心概念",          icon: Hash },
  { id: "blueprint",    title: "4. 系统蓝图 · 模式设计",     icon: Network },
  { id: "architecture", title: "5. 分层架构",                icon: Layers },
  { id: "datamodel",    title: "6. 数据结构 · ER + DDL",     icon: Database },
  { id: "capmap",       title: "7. 能力地图",                icon: Boxes },
  { id: "sop",          title: "8. 主链路 SOP",              icon: Workflow },
  { id: "dataasset",    title: "9. 数据资产分层",            icon: BarChart3 },
  { id: "portrait",     title: "10. 客户画像 + 特征工程",    icon: Users },
  { id: "events",       title: "11. 事件总线 · 领域事件契约", icon: Radio },
  { id: "pages",        title: "12. 页面设计详情",           icon: FileText },
  { id: "datalogic",    title: "13. 数据逻辑与状态机",       icon: GitBranch },
  { id: "tech",         title: "14. 技术架构",               icon: Cpu },
  { id: "api",          title: "15. 接口设计（含样例）",     icon: Code2 },
  { id: "nfr",          title: "16. 非功能性需求 SLO",       icon: ShieldCheck },
  { id: "milestone",    title: "17. 里程碑 + 灰度",          icon: Rocket },
];

export default function EntitlementPRD() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-72px 0px -65% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) { refs.current[s.id] = el; obs.observe(el); }
    });
    return () => obs.disconnect();
  }, []);

  const goto = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag tone="info">PRD</Tag>
              <Tag tone="success">v1.0 · Released</Tag>
              <Tag tone="muted">权益产品组</Tag>
              <Tag tone="muted">2026-05-08</Tag>
            </div>
            <h1 className="text-[26px] font-bold text-foreground leading-tight">权益管理系统 · 完整产品 PRD</h1>
            <p className="text-[13.5px] text-muted-foreground max-w-3xl">
              覆盖 <b className="text-foreground">应用 → 能力 → 规则 → 权益产品 → 商品 → 套餐 → 订单 → 账户</b> 全链路。
              本文档作为前后端联调、数据建仓、运营落地的统一蓝本，要求逻辑自洽、可观测、可演进。
              含 DDL / 状态机 / API 样例 / 时序图 / 容量估算 / 灰度方案 / SLO 表。
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
        <div className="flex-1 min-w-0 space-y-4">
          <S01 /><S02 /><S03 /><S04 /><S05 /><S06 />
          <S07 /><S08 /><S09 /><S10 /><S11 />
          <S12 /><S13 /><S14 /><S15 /><S16 /><S17 />
          <div className="text-center text-[12px] text-muted-foreground py-8 border-t mt-10">
            — 文档结束 · 修改请走 Git PR 流程，重大变更需评审 —
          </div>
        </div>

        {/* TOC */}
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
