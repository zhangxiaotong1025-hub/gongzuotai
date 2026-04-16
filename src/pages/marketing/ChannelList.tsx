import { useState } from "react";
import {
  TrendingUp, TrendingDown, Minus, BarChart3,
  DollarSign, Users, Zap, PauseCircle, Play,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateChannels, type Channel } from "@/data/marketing";

const CHANNELS = generateChannels();

const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) =>
  trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-600" />
    : trend === "down" ? <TrendingDown className="h-3 w-3 text-red-500" />
    : <Minus className="h-3 w-3 text-muted-foreground" />;

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const columns: TableColumn<Channel>[] = [
  { key: "name", title: "渠道", width: 140, render: (v: string, r) => (
    <div>
      <div className="text-sm font-medium">{v}</div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.status === "active" ? "bg-emerald-500" : r.status === "paused" ? "bg-amber-500" : "bg-muted-foreground"}`} />
        <span className="text-[10px] text-muted-foreground">{r.status === "active" ? "投放中" : r.status === "paused" ? "已暂停" : "已归档"}</span>
      </div>
    </div>
  )},
  { key: "dailyLeads", title: "趋势", width: 90, render: (v: number[]) => <MiniChart data={v} /> },
  { key: "leads", title: "线索量", width: 70, render: (v: number) => <span className="text-sm font-bold">{v.toLocaleString()}</span> },
  { key: "spent", title: "投入", width: 90, render: (v: number) => <span className="text-xs">¥{v.toLocaleString()}</span> },
  { key: "cac", title: "CAC", width: 60, render: (v: number) => (
    <span className={`text-sm font-bold ${v > 250 ? "text-red-600" : v > 150 ? "text-amber-600" : "text-emerald-600"}`}>¥{v}</span>
  )},
  { key: "qualifiedRate", title: "合格率", width: 80, render: (v: number) => (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${v >= 70 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[11px]">{v}%</span>
    </div>
  )},
  { key: "conversions", title: "转化", width: 55, render: (v: number) => <span className="text-sm font-medium">{v}</span> },
  { key: "roi", title: "ROI", width: 70, render: (v: number, r) => (
    <div className="flex items-center gap-1">
      <span className={`text-sm font-bold ${v > 100 ? "text-emerald-600" : v > 50 ? "text-amber-600" : "text-red-500"}`}>{v}%</span>
      <TrendIcon trend={r.trend} />
    </div>
  )},
];

const actions: ActionItem<Channel>[] = [
  { label: "查看详情", onClick: () => toast.info("渠道详情（规划中）") },
  { label: "调整预算", onClick: () => toast.info("预算调整（规划中）") },
];

export default function ChannelList() {
  return (
    <div className="space-y-6">
      <PageHeader title="渠道管理" subtitle="多渠道投放效果监控与ROI优化" />

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Users, label: "总线索", value: CHANNELS.reduce((s, c) => s + c.leads, 0).toLocaleString(), color: "text-blue-500" },
          { icon: DollarSign, label: "总投入", value: `¥${(CHANNELS.reduce((s, c) => s + c.spent, 0) / 10000).toFixed(1)}万`, color: "text-amber-500" },
          { icon: BarChart3, label: "综合ROI", value: `${(CHANNELS.reduce((s, c) => s + c.revenue, 0) / CHANNELS.reduce((s, c) => s + c.spent, 0) * 100).toFixed(1)}%`, color: "text-emerald-500" },
          { icon: Zap, label: "最佳渠道", value: "官网自然流量", color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/60 bg-card p-4 flex items-center gap-3">
            <s.icon className={`h-5 w-5 ${s.color}`} />
            <div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
              <div className="text-lg font-bold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={CHANNELS}
        actions={actions}
        rowKey="id"
      />
    </div>
  );
}
