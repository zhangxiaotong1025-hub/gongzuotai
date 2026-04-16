import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateCampaigns, type Campaign } from "@/data/marketing";

const CAMPAIGNS = generateCampaigns();

const TYPE_MAP: Record<string, string> = {
  online_ad: "线上投放",
  exhibition: "线下展会",
  referral: "裂变转介绍",
  cross_industry: "异业合作",
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-muted-foreground" },
  active: { label: "进行中", color: "bg-emerald-500" },
  completed: { label: "已结束", color: "bg-blue-500" },
  paused: { label: "已暂停", color: "bg-amber-500" },
};

const columns: TableColumn<Campaign>[] = [
  { key: "name", title: "活动名称", width: 200, render: (v: string, r) => (
    <div>
      <div className="text-sm font-medium">{v}</div>
      <div className="text-[10px] text-muted-foreground">{TYPE_MAP[r.type]} · {r.channelName}</div>
    </div>
  )},
  { key: "status", title: "状态", width: 80, render: (v: string) => {
    const s = STATUS_MAP[v];
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px]">
        <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
        {s.label}
      </span>
    );
  }},
  { key: "startDate", title: "周期", width: 150, render: (_: string, r) => (
    <span className="text-[11px] text-muted-foreground">{r.startDate} ~ {r.endDate}</span>
  )},
  { key: "budget", title: "预算/已花费", width: 120, render: (v: number, r) => (
    <div>
      <div className="text-[11px]">¥{v.toLocaleString()}</div>
      <div className="w-full h-1 rounded-full bg-muted mt-1 overflow-hidden">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${(r.spent / v) * 100}%` }} />
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">已花费 ¥{r.spent.toLocaleString()}</div>
    </div>
  )},
  { key: "actualLeads", title: "线索量", width: 90, render: (v: number, r) => (
    <div>
      <span className="text-sm font-bold">{v}</span>
      <span className="text-[10px] text-muted-foreground"> / {r.targetLeads}</span>
    </div>
  )},
  { key: "qualified", title: "合格", width: 55, render: (v: number) => <span className="text-sm">{v}</span> },
  { key: "conversions", title: "转化", width: 55, render: (v: number) => <span className="text-sm font-medium text-emerald-600">{v}</span> },
  { key: "roi", title: "ROI", width: 60, render: (v: number) => (
    <span className={`text-sm font-bold ${v > 100 ? "text-emerald-600" : v > 50 ? "text-amber-600" : v > 0 ? "text-red-500" : "text-muted-foreground"}`}>
      {v > 0 ? `${v}%` : "—"}
    </span>
  )},
];

const actions: ActionItem<Campaign>[] = [
  { label: "查看详情", onClick: () => toast.info("活动详情（规划中）") },
  { label: "编辑", onClick: () => toast.info("编辑活动（规划中）") },
];

export default function CampaignList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="活动管理"
        description="营销活动全生命周期管理与效果归因"
        actions={<Button size="sm" onClick={() => toast.info("创建活动（规划中）")}>新建活动</Button>}
      />
      <AdminTable columns={columns} data={CAMPAIGNS} actions={actions} rowKey="id" />
    </div>
  );
}
