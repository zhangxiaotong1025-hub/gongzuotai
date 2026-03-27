import { useState, useMemo } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Eye, MessageSquare, Gift, Filter } from "lucide-react";
import {
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP,
  generateDesigners, generateEndCustomers, generateAlerts,
  ALERT_TYPE_MAP, type AlertCustomer,
} from "@/data/customer";

const DESIGNERS = generateDesigners(40);
const END_CUSTOMERS = generateEndCustomers(35);
const ALERTS = generateAlerts();

/* ── Stage distribution ── */
function StageDistribution({ title, data, map }: { title: string; data: Record<string, number>; map: Record<string, { label: string; color: string }> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h4 className="text-sm font-medium mb-4">{title}</h4>
      <div className="space-y-3">
        {Object.entries(data).map(([k, v]) => {
          const info = map[k];
          if (!info) return null;
          const pct = total > 0 ? Math.round((v / total) * 100) : 0;
          return (
            <div key={k} className="flex items-center gap-3">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium min-w-[60px] justify-center ${info.color}`}>{info.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm font-medium min-w-[40px] text-right">{v}</span>
              <span className="text-xs text-muted-foreground min-w-[35px]">{pct}%</span>
            </div>
          );
        })}
      </div>
      <div className="text-right text-xs text-muted-foreground mt-2">总计 {total} 人</div>
    </div>
  );
}

/* ── Kanban Card ── */
function KanbanCard({ name, detail, onClick }: { name: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left p-3 rounded-lg border border-border/40 bg-card hover:border-primary/40 transition-colors">
      <div className="text-sm font-medium truncate">{name}</div>
      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{detail}</div>
    </button>
  );
}

/* ── Kanban Lane ── */
function KanbanLane({ label, color, items, onItemClick }: { label: string; color: string; items: { id: string; name: string; detail: string }[]; onItemClick: (id: string) => void }) {
  return (
    <div className="min-w-[180px] flex-1">
      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${color}`}>{label}</span>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {items.slice(0, 8).map(item => (
          <KanbanCard key={item.id} name={item.name} detail={item.detail} onClick={() => onItemClick(item.id)} />
        ))}
        {items.length > 8 && <div className="text-center text-xs text-muted-foreground py-2">还有 {items.length - 8} 条...</div>}
      </div>
    </div>
  );
}

const TABS = ["阶段总览", "设计师泳道", "企业客户泳道", "预警客户"];

export default function LifecycleDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [alertFilter, setAlertFilter] = useState("");
  const [alerts, setAlerts] = useState(ALERTS);

  // Designer stage distribution
  const dStages = useMemo(() => {
    const map: Record<string, number> = {};
    DESIGNERS.forEach(d => { map[d.lifecycle] = (map[d.lifecycle] || 0) + 1; });
    return map;
  }, []);

  // EC stage distribution
  const ecStages = useMemo(() => {
    const map: Record<string, number> = {};
    END_CUSTOMERS.forEach(c => { map[c.lifecycle] = (map[c.lifecycle] || 0) + 1; });
    return map;
  }, []);

  // Designer kanban items
  const dKanban = useMemo(() => {
    const lanes: Record<string, { id: string; name: string; detail: string }[]> = {};
    Object.keys(DESIGNER_LIFECYCLE_MAP).forEach(k => { lanes[k] = []; });
    DESIGNERS.forEach(d => {
      lanes[d.lifecycle]?.push({ id: d.id, name: d.name, detail: `${d.currentPackage} · 使用率 ${d.usageRate}% · 最近 ${d.lastLoginAt}` });
    });
    return lanes;
  }, []);

  const ecKanban = useMemo(() => {
    const lanes: Record<string, { id: string; name: string; detail: string }[]> = {};
    Object.keys(END_CUSTOMER_LIFECYCLE_MAP).forEach(k => { lanes[k] = []; });
    END_CUSTOMERS.forEach(c => {
      lanes[c.lifecycle]?.push({ id: c.id, name: c.name, detail: `${c.sourceEnterprise} · ${c.assignedStaff} · 最近 ${c.lastFollowAt}` });
    });
    return lanes;
  }, []);

  const filteredAlerts = alertFilter ? alerts.filter(a => a.alertType === alertFilter) : alerts;

  const markHandled = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, handled: true } : a));
    toast.success("已标记为已处理");
  };

  return (
    <div>
      <PageHeader title="生命周期看板" subtitle="客户全链路追踪与预警" />

      <div className="flex items-center gap-1 mb-5 border-b border-border/60">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{t}{i === 3 && <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{alerts.filter(a => !a.handled).length}</span>}</button>
        ))}
      </div>

      {/* Tab 0: Overview */}
      {tab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StageDistribution title="个人设计师 — 阶段分布" data={dStages} map={DESIGNER_LIFECYCLE_MAP} />
          <StageDistribution title="企业下游客户 — 阶段分布" data={ecStages} map={END_CUSTOMER_LIFECYCLE_MAP} />

          {/* Conversion Funnel */}
          <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5">
            <h4 className="text-sm font-medium mb-4">设计师转化漏斗</h4>
            <div className="flex items-end gap-4 h-40">
              {[
                { label: "注册", value: dStages.registered || 0, total: DESIGNERS.length },
                { label: "激活", value: dStages.activated || 0, total: DESIGNERS.length },
                { label: "成长", value: dStages.growing || 0, total: DESIGNERS.length },
                { label: "成熟", value: dStages.mature || 0, total: DESIGNERS.length },
              ].map((s, i) => {
                const pct = DESIGNERS.length > 0 ? Math.max((s.value / DESIGNERS.length) * 100, 5) : 5;
                return (
                  <div key={s.label} className="flex-1 flex flex-col items-center">
                    <div className="text-sm font-bold text-primary mb-1">{s.value}</div>
                    <div className="w-full bg-primary/20 rounded-t relative" style={{ height: `${pct}%` }}>
                      <div className="absolute inset-0 bg-primary/60 rounded-t" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{s.label}</div>
                    {i > 0 && <div className="text-[10px] text-muted-foreground">↓ {DESIGNERS.length > 0 ? Math.round((s.value / DESIGNERS.length) * 100) : 0}%</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Designer Kanban */}
      {tab === 1 && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(DESIGNER_LIFECYCLE_MAP).map(([k, v]) => (
            <KanbanLane key={k} label={v.label} color={v.color} items={dKanban[k] || []}
              onItemClick={(id) => navigate(`/customer/designer/detail/${id}`)} />
          ))}
        </div>
      )}

      {/* Tab 2: EC Kanban */}
      {tab === 2 && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(END_CUSTOMER_LIFECYCLE_MAP).map(([k, v]) => (
            <KanbanLane key={k} label={v.label} color={v.color} items={ecKanban[k] || []}
              onItemClick={(id) => navigate(`/customer/end-customer/detail/${id}`)} />
          ))}
        </div>
      )}

      {/* Tab 3: Alerts */}
      {tab === 3 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAlertFilter("")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!alertFilter ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
            >全部</button>
            {Object.entries(ALERT_TYPE_MAP).map(([k, v]) => (
              <button key={k} onClick={() => setAlertFilter(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${alertFilter === k ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"}`}
              >{v.icon} {v.label}</button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredAlerts.map(a => {
              const alertInfo = ALERT_TYPE_MAP[a.alertType];
              return (
                <div key={a.id} className={`flex items-center justify-between p-4 rounded-xl border bg-card ${a.handled ? "opacity-50 border-border/30" : a.alertLevel === "red" ? "border-red-200" : a.alertLevel === "orange" ? "border-orange-200" : "border-amber-200"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{alertInfo?.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{a.phone}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{a.type === "designer" ? "设计师" : "企业客户"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.detail} · {a.lifecycle}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!a.handled && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => navigate(a.type === "designer" ? `/customer/designer/detail/${a.id}` : `/customer/end-customer/detail/${a.id}`)}>
                          <Eye className="h-3.5 w-3.5 mr-1" />查看
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => markHandled(a.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />已处理
                        </Button>
                      </>
                    )}
                    {a.handled && <span className="text-xs text-muted-foreground">已处理</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
