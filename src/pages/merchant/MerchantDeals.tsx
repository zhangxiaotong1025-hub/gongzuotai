import { useState } from "react";
import { Briefcase, TrendingUp, DollarSign, Clock, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { generateDeals, DEAL_STAGE_MAP } from "@/data/merchant";
import type { Deal } from "@/data/merchant";

const DEALS = generateDeals(15);

const stageOrder: Deal["stage"][] = ["opportunity", "quoted", "signed", "started"];
const funnelData = stageOrder.map((s) => ({
  stage: DEAL_STAGE_MAP[s].label,
  count: DEALS.filter((d) => d.stage === s).length,
  amount: DEALS.filter((d) => d.stage === s).reduce((sum, d) => sum + d.amount, 0),
}));

const columns: Column<Deal>[] = [
  { key: "customerName", title: "客户", width: 100 },
  { key: "category", title: "品类", width: 100 },
  { key: "amount", title: "金额", width: 100, render: (v: number) => `¥${(v / 10000).toFixed(1)}万` },
  { key: "designer", title: "设计师", width: 80 },
  {
    key: "stage", title: "阶段", width: 80,
    render: (v: Deal["stage"]) => {
      const s = DEAL_STAGE_MAP[v];
      return <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>;
    },
  },
  { key: "source", title: "来源", width: 80 },
  { key: "createdAt", title: "创建时间", width: 100 },
];

const actions: ActionItem<Deal>[] = [
  { label: "查看", onClick: () => {} },
  { label: "推进阶段", onClick: () => {} },
];

const filters: FilterField[] = [
  { key: "stage", label: "阶段", type: "select", options: stageOrder.map((s) => ({ label: DEAL_STAGE_MAP[s].label, value: s })) },
  { key: "category", label: "品类", type: "select", options: ["全屋定制", "厨房改造", "卫浴翻新"].map((c) => ({ label: c, value: c })) },
];

export default function MerchantDeals() {
  const [page, setPage] = useState(1);

  const totalAmount = DEALS.reduce((s, d) => s + d.amount, 0);
  const signedAmount = DEALS.filter((d) => d.stage === "signed" || d.stage === "started").reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      <PageHeader title="签单管理" subtitle="从商机到签约的全流程管控" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">商机总额</div>
          <div className="text-xl font-bold mt-1">¥{(totalAmount / 10000).toFixed(1)}万</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">已签约金额</div>
          <div className="text-xl font-bold mt-1 text-emerald-500">¥{(signedAmount / 10000).toFixed(1)}万</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">平均客单价</div>
          <div className="text-xl font-bold mt-1">¥{(totalAmount / DEALS.length / 10000).toFixed(1)}万</div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] text-muted-foreground">签约率</div>
          <div className="text-xl font-bold mt-1">{Math.round(DEALS.filter((d) => d.stage === "signed" || d.stage === "started").length / DEALS.length * 100)}%</div>
        </div>
      </div>

      {/* Stage funnel */}
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-3">
          {funnelData.map((f, i) => (
            <div key={f.stage} className="flex items-center gap-3 flex-1">
              <div className="flex-1 rounded-lg border border-border/40 p-3 text-center">
                <div className="text-lg font-bold">{f.count}</div>
                <div className="text-[10px] text-muted-foreground">{f.stage}</div>
                <div className="text-[10px] text-primary mt-0.5">¥{(f.amount / 10000).toFixed(1)}万</div>
              </div>
              {i < funnelData.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <FilterBar fields={filters} onFilter={() => {}} />
      <AdminTable columns={columns} data={DEALS} rowKey={(r) => r.id} actions={actions} />
      <Pagination current={page} total={DEALS.length} pageSize={20} onChange={setPage} />
    </div>
  );
}
