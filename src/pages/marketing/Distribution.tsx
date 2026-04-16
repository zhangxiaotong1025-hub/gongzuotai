import { useState } from "react";
import {
  Target, Sliders, ArrowRight, Building2, Zap,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  generateDistributionRules, generateDistributionRecords,
  type DistributionRule, type DistributionRecord,
} from "@/data/marketing";
import {
  generateEnterpriseDistributions,
  type EnterpriseDistribution,
} from "@/data/agent-leads-pipeline";

const RULES = generateDistributionRules();
const RECORDS = generateDistributionRecords();
const ENTERPRISES = generateEnterpriseDistributions();

const recordColumns: TableColumn<DistributionRecord>[] = [
  { key: "leadName", title: "线索", width: 80, render: (v: string) => <span className="text-sm font-medium">{v}</span> },
  { key: "enterpriseName", title: "匹配企业", width: 120, render: (v: string) => <span className="text-sm text-primary">{v}</span> },
  { key: "matchScore", title: "匹配度", width: 70, render: (v: number) => (
    <span className={`text-sm font-bold ${v >= 90 ? "text-emerald-600" : v >= 75 ? "text-amber-600" : "text-red-500"}`}>{v}分</span>
  )},
  { key: "price", title: "单价", width: 60, render: (v: number) => <span className="text-[11px]">¥{v}</span> },
  { key: "status", title: "状态", width: 70, render: (v: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: "待接收", color: "text-amber-600" },
      accepted: { label: "已接收", color: "text-emerald-600" },
      rejected: { label: "已拒绝", color: "text-red-500" },
      expired: { label: "已过期", color: "text-muted-foreground" },
    };
    const s = map[v];
    return <span className={`text-[11px] font-medium ${s.color}`}>{s.label}</span>;
  }},
  { key: "matchReasons", title: "匹配依据", width: 220, render: (v: string[]) => (
    <div className="flex flex-wrap gap-1">
      {v.map((r, i) => (
        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r}</span>
      ))}
    </div>
  )},
  { key: "distributedAt", title: "派发时间", width: 120, render: (v: string) => <span className="text-[10px] text-muted-foreground">{v}</span> },
];

const enterpriseColumns: TableColumn<EnterpriseDistribution>[] = [
  { key: "name", title: "企业", width: 130, render: (v: string, r) => (
    <div>
      <div className="text-sm font-medium">{v}</div>
      <div className="text-[10px] text-muted-foreground">{r.type} · {r.region}</div>
    </div>
  )},
  { key: "totalReceived", title: "接收", width: 55, render: (v: number) => <span className="text-sm font-bold">{v}</span> },
  { key: "contactRate", title: "联系率", width: 70, render: (v: number) => (
    <span className={`text-sm font-medium ${v >= 85 ? "text-emerald-600" : v >= 70 ? "text-amber-600" : "text-red-500"}`}>{v}%</span>
  )},
  { key: "conversionRate", title: "转化率", width: 70, render: (v: number) => (
    <span className={`text-sm font-medium ${v >= 25 ? "text-emerald-600" : v >= 15 ? "text-amber-600" : "text-red-500"}`}>{v}%</span>
  )},
  { key: "feedbackRate", title: "反馈率", width: 70, render: (v: number) => (
    <span className={`text-sm font-medium ${v >= 60 ? "text-emerald-600" : v >= 40 ? "text-amber-600" : "text-red-500"}`}>{v}%</span>
  )},
  { key: "avgResponseTime", title: "响应时效", width: 80, render: (v: string) => <span className="text-[11px]">{v}</span> },
  { key: "satisfaction", title: "满意度", width: 70, render: (v: number) => (
    <span className={`text-sm font-medium ${v >= 4 ? "text-emerald-600" : v >= 3 ? "text-amber-600" : "text-red-500"}`}>{v}/5</span>
  )},
  { key: "riskLevel", title: "风险", width: 55, render: (v: string) => (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${v === "low" ? "bg-emerald-500/10 text-emerald-600" : v === "medium" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-500"}`}>
      {v === "low" ? "低" : v === "medium" ? "中" : "高"}
    </span>
  )},
];

export default function Distribution() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="智能派发"
        description="多维匹配引擎 · 企业画像 · 派发记录"
        actions={
          <Button size="sm" onClick={() => toast.info("执行智能派发（规划中）")}>
            <Zap className="h-3.5 w-3.5 mr-1" /> 执行派发
          </Button>
        }
      />

      {/* Rules preview */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" /> 匹配权重配置
          </h3>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.info("编辑规则（规划中）")}>编辑规则</Button>
        </div>
        <div className="flex items-center gap-2">
          {RULES.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2">
              <div className="rounded-lg border border-border/40 px-3 py-2 text-center min-w-[100px]">
                <div className="text-[10px] text-muted-foreground">{r.name}</div>
                <div className="text-lg font-bold text-primary">{r.weight}%</div>
              </div>
              {i < RULES.length - 1 && <span className="text-muted-foreground text-xs">+</span>}
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">派发记录</TabsTrigger>
          <TabsTrigger value="enterprises">企业画像</TabsTrigger>
        </TabsList>
        <TabsContent value="records">
          <AdminTable columns={recordColumns} data={RECORDS} rowKey="id" actions={[{ label: "详情", onClick: () => toast.info("派发详情（规划中）") }]} />
        </TabsContent>
        <TabsContent value="enterprises">
          <AdminTable columns={enterpriseColumns} data={ENTERPRISES} rowKey="id" actions={[{ label: "查看", onClick: () => toast.info("企业详情（规划中）") }]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
