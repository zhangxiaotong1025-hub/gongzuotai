import { useState } from "react";
import {
  Phone, Bot, User, Clock, CheckCircle2,
  XCircle, PhoneForwarded, PhoneOff, Headphones,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  generateCallRecords, generateAgents,
  type CallRecord, type Agent,
} from "@/data/marketing";

const CALLS = generateCallRecords();
const AGENTS = generateAgents();

const CALL_TYPE_MAP: Record<string, { label: string; icon: typeof Bot }> = {
  ai_outbound: { label: "AI外呼", icon: Bot },
  manual_outbound: { label: "人工外呼", icon: Headphones },
  inbound: { label: "来电", icon: Phone },
};

const CALL_STATUS_MAP: Record<string, { label: string; color: string }> = {
  connected: { label: "已接通", color: "text-emerald-600" },
  no_answer: { label: "未接通", color: "text-amber-600" },
  busy: { label: "忙碌", color: "text-amber-500" },
  callback: { label: "待回拨", color: "text-blue-500" },
  invalid: { label: "无效号码", color: "text-red-500" },
};

const RESULT_MAP: Record<string, { label: string; color: string }> = {
  qualified: { label: "合格", color: "text-emerald-600" },
  unqualified: { label: "不合格", color: "text-red-500" },
  follow_up: { label: "需跟进", color: "text-amber-600" },
  callback: { label: "待回拨", color: "text-blue-500" },
  none: { label: "—", color: "text-muted-foreground" },
};

const callColumns: TableColumn<CallRecord>[] = [
  { key: "leadName", title: "线索", width: 100, render: (v: string, r) => (
    <div>
      <div className="text-sm font-medium">{v}</div>
      <div className="text-[10px] text-muted-foreground">{r.phone}</div>
    </div>
  )},
  { key: "type", title: "类型", width: 90, render: (v: string) => {
    const t = CALL_TYPE_MAP[v];
    const Icon = t.icon;
    return <span className="inline-flex items-center gap-1 text-[11px]"><Icon className="h-3 w-3" />{t.label}</span>;
  }},
  { key: "status", title: "状态", width: 70, render: (v: string) => {
    const s = CALL_STATUS_MAP[v];
    return <span className={`text-[11px] font-medium ${s.color}`}>{s.label}</span>;
  }},
  { key: "duration", title: "时长", width: 60, render: (v: number) => <span className="text-[11px]">{v > 0 ? `${Math.floor(v / 60)}分${v % 60}秒` : "—"}</span> },
  { key: "result", title: "判定", width: 70, render: (v: string) => {
    const r = RESULT_MAP[v];
    return <span className={`text-[11px] font-medium ${r.color}`}>{r.label}</span>;
  }},
  { key: "agent", title: "坐席", width: 80, render: (v: string) => (
    <span className={`text-[11px] ${v.startsWith("AI") ? "text-primary" : ""}`}>{v}</span>
  )},
  { key: "summary", title: "通话摘要", width: 250, render: (v?: string) => (
    <span className="text-[10px] text-muted-foreground line-clamp-2">{v || "—"}</span>
  )},
  { key: "createdAt", title: "时间", width: 120, render: (v: string) => <span className="text-[10px] text-muted-foreground">{v}</span> },
];

const agentColumns: TableColumn<Agent>[] = [
  { key: "name", title: "坐席", width: 100, render: (v: string, r) => (
    <div className="flex items-center gap-2">
      {r.type === "ai" ? <Bot className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-muted-foreground" />}
      <div>
        <div className="text-sm font-medium">{v}</div>
        <div className="text-[10px] text-muted-foreground">{r.type === "ai" ? "AI坐席" : "人工坐席"}</div>
      </div>
    </div>
  )},
  { key: "status", title: "状态", width: 70, render: (v: string) => (
    <span className={`inline-flex items-center gap-1 text-[11px] ${v === "online" ? "text-emerald-600" : v === "busy" ? "text-amber-600" : "text-muted-foreground"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${v === "online" ? "bg-emerald-500" : v === "busy" ? "bg-amber-500" : "bg-muted-foreground"}`} />
      {v === "online" ? "在线" : v === "busy" ? "忙碌" : "离线"}
    </span>
  )},
  { key: "todayCompleted", title: "今日完成", width: 100, render: (v: number, r) => (
    <div>
      <span className="text-sm font-bold">{v}</span>
      <span className="text-[10px] text-muted-foreground"> / {r.todayTasks}</span>
      <div className="w-full h-1 rounded-full bg-muted mt-1 overflow-hidden">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(v / r.todayTasks) * 100}%` }} />
      </div>
    </div>
  )},
  { key: "connectRate", title: "接通率", width: 70, render: (v: number) => (
    <span className={`text-sm font-medium ${v >= 70 ? "text-emerald-600" : v >= 50 ? "text-amber-600" : "text-red-500"}`}>{v}%</span>
  )},
  { key: "qualifiedRate", title: "合格率", width: 70, render: (v: number) => (
    <span className={`text-sm font-medium ${v >= 50 ? "text-emerald-600" : v >= 40 ? "text-amber-600" : "text-red-500"}`}>{v}%</span>
  )},
  { key: "avgDuration", title: "平均时长", width: 80, render: (v: number) => (
    <span className="text-[11px]">{Math.floor(v / 60)}分{v % 60}秒</span>
  )},
];

export default function CallCenter() {
  const aiCalls = CALLS.filter((c) => c.type === "ai_outbound").length;
  const humanCalls = CALLS.filter((c) => c.type === "manual_outbound").length;
  const aiQualified = CALLS.filter((c) => c.type === "ai_outbound" && c.result === "qualified").length;
  const humanQualified = CALLS.filter((c) => c.type === "manual_outbound" && c.result === "qualified").length;

  return (
    <div className="space-y-5">
      <PageHeader title="呼叫中心" subtitle="AI外呼 + 人工坐席 · 线索初筛工作台" />

      {/* AI vs Human comparison */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">AI外呼</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground">今日外呼</div>
              <div className="text-xl font-bold">{AGENTS.filter((a) => a.type === "ai").reduce((s, a) => s + a.todayCompleted, 0)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">合格率</div>
              <div className="text-xl font-bold text-emerald-600">{aiCalls > 0 ? Math.round((aiQualified / aiCalls) * 100) : 0}%</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">单次成本</div>
              <div className="text-xl font-bold text-primary">¥0.8</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Headphones className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-semibold">人工坐席</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-muted-foreground">今日外呼</div>
              <div className="text-xl font-bold">{AGENTS.filter((a) => a.type === "human").reduce((s, a) => s + a.todayCompleted, 0)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">合格率</div>
              <div className="text-xl font-bold text-emerald-600">{humanCalls > 0 ? Math.round((humanQualified / humanCalls) * 100) : 0}%</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">单次成本</div>
              <div className="text-xl font-bold text-amber-600">¥12.5</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">通话记录</TabsTrigger>
          <TabsTrigger value="agents">坐席管理</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <AdminTable columns={callColumns} data={CALLS} rowKey={(r) => r.id} actions={[{ label: "查看详情", onClick: () => toast.info("通话详情（规划中）") }]} />
        </TabsContent>
        <TabsContent value="agents">
          <AdminTable columns={agentColumns} data={AGENTS} rowKey={(r) => r.id} actions={[{ label: "配置", onClick: () => toast.info("坐席配置（规划中）") }]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
