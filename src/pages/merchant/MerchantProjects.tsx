import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, Hammer, Paintbrush, Ruler } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { generateProjects, PROJECT_STAGE_MAP } from "@/data/merchant";

const PROJECTS = generateProjects(10);

const STAGE_TABS = [
  { key: "all", label: "全部" },
  { key: "designing", label: "设计中" },
  { key: "constructing", label: "施工中" },
  { key: "inspecting", label: "验收中" },
  { key: "completed", label: "已完工" },
];

export default function MerchantProjects() {
  const [tab, setTab] = useState("all");
  const filtered = PROJECTS.filter((p) => tab === "all" || p.stage === tab);

  return (
    <div className="space-y-4">
      <PageHeader title="项目交付" subtitle="设计→施工→验收全流程管控" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {STAGE_TABS.slice(1).map((t) => {
          const count = PROJECTS.filter((p) => p.stage === t.key).length;
          const overdue = PROJECTS.filter((p) => p.stage === t.key && p.overdue).length;
          return (
            <div key={t.key} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="text-[11px] text-muted-foreground">{t.label}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xl font-bold">{count}</span>
                {overdue > 0 && (
                  <span className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {overdue}个超期
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/40 pb-2">
        {STAGE_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-[12px] rounded-md transition-all ${tab === t.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60"}`}>
            {t.label} ({t.key === "all" ? PROJECTS.length : PROJECTS.filter((p) => p.stage === t.key).length})
          </button>
        ))}
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((p) => {
          const st = PROJECT_STAGE_MAP[p.stage];
          return (
            <div key={p.id} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{p.customerName}</h3>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {p.designer} {p.foreman && `· ${p.foreman}`} · ¥{(p.amount / 10000).toFixed(1)}万
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p.overdue && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500">超期</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                </div>
              </div>

              {/* Milestone timeline */}
              <div className="flex items-center gap-0.5">
                {p.milestones.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-0.5 flex-1">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${
                        m.status === "done" ? "bg-emerald-500/20 text-emerald-500"
                        : m.status === "current" ? "bg-primary/20 text-primary ring-2 ring-primary/30"
                        : m.status === "overdue" ? "bg-red-500/20 text-red-500 ring-2 ring-red-500/30"
                        : "bg-muted/30 text-muted-foreground"
                      }`}>
                        {m.status === "done" ? "✓" : i + 1}
                      </div>
                      <span className={`text-[8px] text-center leading-tight ${m.status === "overdue" ? "text-red-400" : "text-muted-foreground"}`}>{m.name}</span>
                    </div>
                    {i < p.milestones.length - 1 && (
                      <div className={`h-[1px] flex-1 mt-[-12px] ${m.status === "done" ? "bg-emerald-500/40" : "bg-muted/30"}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>开工：{p.startDate}</span>
                <span>预计完工：{p.expectedEnd}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
