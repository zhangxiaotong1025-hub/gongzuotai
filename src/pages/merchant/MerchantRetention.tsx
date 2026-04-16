import { Heart, Gift, RefreshCw, Users, Phone, TrendingUp, Zap } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { generateRetentionCustomers } from "@/data/merchant";
import type { RetentionCustomer } from "@/data/merchant";

const CUSTOMERS = generateRetentionCustomers(15);

const totalReferrals = CUSTOMERS.reduce((s, c) => s + c.referrals, 0);
const totalOpportunityValue = CUSTOMERS.reduce((s, c) => s + c.opportunities.reduce((os, o) => os + o.estimatedValue, 0), 0);
const avgSatisfaction = +(CUSTOMERS.reduce((s, c) => s + c.satisfaction, 0) / CUSTOMERS.length).toFixed(1);

const OPP_LABELS: Record<string, { label: string; color: string }> = {
  soft_furnishing: { label: "软装配饰", color: "bg-purple-500/10 text-purple-500" },
  maintenance: { label: "维修保养", color: "bg-blue-500/10 text-blue-500" },
  renovation: { label: "局部翻新", color: "bg-amber-500/10 text-amber-600" },
  referral: { label: "转介绍", color: "bg-emerald-500/10 text-emerald-600" },
};

const columns: TableColumn<RetentionCustomer>[] = [
  { key: "name", title: "客户", width: 80 },
  { key: "projectType", title: "项目类型", width: 100 },
  { key: "totalSpent", title: "历史消费", width: 100, render: (v: number) => `¥${(v / 10000).toFixed(1)}万` },
  { key: "satisfaction", title: "满意度", width: 60, render: (v: number) => `${v}/5` },
  { key: "completedAt", title: "完工时间", width: 100 },
  { key: "referrals", title: "转介绍", width: 60, render: (v: number) => v > 0 ? <span className="text-emerald-500 font-medium">{v}次</span> : <span className="text-muted-foreground">-</span> },
  {
    key: "opportunities", title: "复购机会", width: 180,
    render: (v: RetentionCustomer["opportunities"]) => (
      <div className="flex gap-1 flex-wrap">
        {v.map((o, i) => {
          const opp = OPP_LABELS[o.type];
          return <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded-full ${opp.color}`}>{opp.label} {o.probability}%</span>;
        })}
      </div>
    ),
  },
];

const actions: ActionItem<RetentionCustomer>[] = [
  { label: "联系", onClick: () => {} },
  { label: "发送优惠", onClick: () => {} },
];

export default function MerchantRetention() {
  return (
    <div className="space-y-5">
      <PageHeader title="老客运营" subtitle="已完工客户的复购与转介绍管理" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">老客池</div>
          <div className="text-xl font-bold mt-1">{CUSTOMERS.length}</div>
          <div className="text-[10px] text-muted-foreground">已完工客户</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">转介绍</div>
          <div className="text-xl font-bold mt-1 text-emerald-500">{totalReferrals}次</div>
          <div className="text-[10px] text-muted-foreground">零成本获客</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">复购潜力</div>
          <div className="text-xl font-bold mt-1 text-primary">¥{(totalOpportunityValue / 10000).toFixed(1)}万</div>
          <div className="text-[10px] text-muted-foreground">预估可挖掘价值</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">平均满意度</div>
          <div className="text-xl font-bold mt-1">{avgSatisfaction}/5</div>
          <div className="text-[10px] text-muted-foreground">驱动口碑增长</div>
        </div>
      </div>

      {/* Referral incentive */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Gift className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <div className="text-[12px] font-semibold">转介绍激励计划</div>
            <div className="text-[10px] text-muted-foreground">老客推荐新客签单，双方各享优惠 · 当前转介绍获客成本 ¥0 vs 平台获客 ¥185</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-emerald-500">¥0</div>
            <div className="text-[9px] text-muted-foreground">转介绍CAC</div>
          </div>
          <div className="text-muted-foreground/30">vs</div>
          <div className="text-right">
            <div className="text-lg font-bold text-red-400">¥185</div>
            <div className="text-[9px] text-muted-foreground">平台获客CAC</div>
          </div>
        </div>
      </div>

      {/* Customer table */}
      <AdminTable columns={columns} data={CUSTOMERS} rowKey={(r) => r.id} actions={actions} />
    </div>
  );
}
