import { useState } from "react";
import {
  Search, Filter, CheckCircle2, XCircle, Clock,
  Phone, ArrowRight, Brain, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateLeads, LEAD_STATUS_MAP, INTENT_LEVEL_MAP,
  type Lead, type LeadStatus,
} from "@/data/marketing";

const LEADS = generateLeads();

const STATUS_COUNTS: Record<string, number> = {};
LEADS.forEach((l) => { STATUS_COUNTS[l.status] = (STATUS_COUNTS[l.status] || 0) + 1; });

const columns: TableColumn<Lead>[] = [
  { key: "name", title: "线索", width: 130, render: (v: string, r) => (
    <div>
      <div className="text-sm font-medium">{v}</div>
      <div className="text-[10px] text-muted-foreground">{r.phone}</div>
    </div>
  )},
  { key: "source", title: "来源", width: 100, render: (v: string, r) => (
    <div>
      <div className="text-[11px]">{v}</div>
      {r.campaignName && <div className="text-[10px] text-muted-foreground">{r.campaignName}</div>}
    </div>
  )},
  { key: "status", title: "状态", width: 80, render: (v: LeadStatus) => {
    const s = LEAD_STATUS_MAP[v];
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px]">
        <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
        {s.label}
      </span>
    );
  }},
  { key: "intentScore", title: "意向评分", width: 90, render: (v: number, r) => (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg width={32} height={32}>
          <circle cx={16} cy={16} r={13} fill="none" strokeWidth={2} className="stroke-muted/30" />
          <circle cx={16} cy={16} r={13} fill="none" strokeWidth={2}
            className={v >= 80 ? "stroke-emerald-500" : v >= 50 ? "stroke-amber-500" : "stroke-red-400"}
            strokeDasharray={2 * Math.PI * 13} strokeDashoffset={2 * Math.PI * 13 * (1 - v / 100)}
            strokeLinecap="round" transform="rotate(-90 16 16)" />
          <text x="50%" y="50%" textAnchor="middle" dy=".35em" className="fill-foreground text-[9px] font-bold">{v}</text>
        </svg>
      </div>
      <span className={`text-[10px] font-medium ${INTENT_LEVEL_MAP[r.intentLevel].color}`}>
        {INTENT_LEVEL_MAP[r.intentLevel].label}
      </span>
    </div>
  )},
  { key: "region", title: "区域", width: 90, render: (v: string) => <span className="text-[11px]">{v}</span> },
  { key: "houseType", title: "房型", width: 120, render: (v: string) => <span className="text-[11px]">{v}</span> },
  { key: "stage", title: "阶段", width: 80, render: (v: string) => <span className="text-[11px]">{v}</span> },
  { key: "assignedTo", title: "派发企业", width: 100, render: (v?: string) => v ? <span className="text-[11px] text-primary">{v}</span> : <span className="text-[10px] text-muted-foreground">未派发</span> },
  { key: "createdAt", title: "创建时间", width: 120, render: (v: string) => <span className="text-[10px] text-muted-foreground">{v}</span> },
];

const actions: ActionItem<Lead>[] = [
  { label: "查看详情", onClick: () => toast.info("线索详情（规划中）") },
  { label: "手动派发", onClick: (r) => toast.info(`派发${r.name}（规划中）`) },
];

// Status pipeline visual
function StatusPipeline() {
  const stages: { key: LeadStatus; label: string }[] = [
    { key: "raw", label: "原始" },
    { key: "pending_cleanse", label: "待清洗" },
    { key: "cleansing", label: "清洗中" },
    { key: "qualified", label: "合格" },
    { key: "pending_distribute", label: "待派发" },
    { key: "distributed", label: "已派发" },
    { key: "contacted", label: "已联系" },
    { key: "converted", label: "已转化" },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {stages.map((s, i) => {
        const count = LEADS.filter((l) => l.status === s.key).length;
        return (
          <div key={s.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center px-3 py-2 rounded-lg border border-border/40 bg-card min-w-[80px]">
              <span className={`w-2 h-2 rounded-full ${LEAD_STATUS_MAP[s.key].color} mb-1`} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
              <span className="text-sm font-bold">{count}</span>
            </div>
            {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

export default function LeadPool() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all" ? LEADS : LEADS.filter((l) => l.status === statusFilter);

  return (
    <div className="space-y-5">
      <PageHeader
        title="线索池"
        description="全量线索管理 · 清洗 · 评分 · 派发"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.info("批量清洗（规划中）")}>
              <Brain className="h-3.5 w-3.5 mr-1" /> AI批量清洗
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("智能派发（规划中）")}>
              <Zap className="h-3.5 w-3.5 mr-1" /> 智能派发
            </Button>
          </div>
        }
      />

      <StatusPipeline />

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")} className="text-xs h-7">
          全部 ({LEADS.length})
        </Button>
        {Object.entries(LEAD_STATUS_MAP).map(([key, val]) => {
          const count = LEADS.filter((l) => l.status === key).length;
          if (count === 0) return null;
          return (
            <Button key={key} size="sm" variant={statusFilter === key ? "default" : "outline"} onClick={() => setStatusFilter(key)} className="text-xs h-7">
              {val.label} ({count})
            </Button>
          );
        })}
      </div>

      <AdminTable columns={columns} data={filtered} actions={actions} rowKey="id" />
    </div>
  );
}
