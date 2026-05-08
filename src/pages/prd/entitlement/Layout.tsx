import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FileText, Network, Activity, Database, Code2, Rocket } from "lucide-react";

const TABS = [
  { to: "/prd/entitlement",            label: "设计总论",           icon: FileText, end: true },
  { to: "/prd/entitlement/blueprint",  label: "系统蓝图",           icon: Network },
  { to: "/prd/entitlement/runtime",    label: "运行时与状态机",     icon: Activity },
  { to: "/prd/entitlement/data",       label: "数据模型与画像",     icon: Database },
  { to: "/prd/entitlement/contract",   label: "API · 事件 · SLO",  icon: Code2 },
  { to: "/prd/entitlement/delivery",   label: "落地三基石与里程碑", icon: Rocket },
];

export default function EntitlementPRDLayout() {
  const loc = useLocation();
  return (
    <div className="space-y-4">
      <nav className="rounded-xl border bg-card p-1.5 flex flex-wrap gap-1 sticky top-2 z-10 backdrop-blur-md" style={{ boxShadow: "var(--shadow-xs)" }}>
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] transition ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </NavLink>
          );
        })}
      </nav>
      <Outlet key={loc.pathname} />
    </div>
  );
}

export { TABS };
