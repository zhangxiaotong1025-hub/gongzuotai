import {
  DollarSign, FileText, AlertCircle, CheckCircle2,
  Clock, TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdminTable, type TableColumn } from "@/components/admin/AdminTable";
import { toast } from "sonner";
import { generateSettlementRecords, type SettlementRecord } from "@/data/marketing";

const RECORDS = generateSettlementRecords();

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "待确认", color: "text-amber-600", icon: Clock },
  confirmed: { label: "已确认", color: "text-blue-500", icon: FileText },
  paid: { label: "已结算", color: "text-emerald-600", icon: CheckCircle2 },
  disputed: { label: "争议中", color: "text-red-500", icon: AlertCircle },
};

const columns: TableColumn<SettlementRecord>[] = [
  { key: "enterpriseName", title: "企业", width: 140, render: (v: string) => <span className="text-sm font-medium">{v}</span> },
  { key: "period", title: "账期", width: 100, render: (v: string) => <span className="text-[11px]">{v}</span> },
  { key: "model", title: "计费", width: 70, render: (v: string) => (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${v === "CPA" ? "bg-blue-500/10 text-blue-500" : v === "CPS" ? "bg-emerald-500/10 text-emerald-600" : "bg-violet-500/10 text-violet-500"}`}>
      {v}
    </span>
  )},
  { key: "leadsCount", title: "线索", width: 55, render: (v: number) => <span className="text-sm">{v}</span> },
  { key: "conversions", title: "转化", width: 55, render: (v: number) => <span className="text-sm font-medium text-emerald-600">{v}</span> },
  { key: "totalAmount", title: "总额", width: 90, render: (v: number) => <span className="text-sm font-bold">¥{v.toLocaleString()}</span> },
  { key: "deposit", title: "保障金", width: 80, render: (v: number) => <span className="text-[11px] text-amber-600">¥{v.toLocaleString()}</span> },
  { key: "deductions", title: "扣减", width: 70, render: (v: number) => (
    <span className={`text-[11px] ${v > 0 ? "text-red-500" : "text-muted-foreground"}`}>
      {v > 0 ? `-¥${v.toLocaleString()}` : "—"}
    </span>
  )},
  { key: "finalAmount", title: "结算额", width: 90, render: (v: number) => <span className="text-sm font-bold text-primary">¥{v.toLocaleString()}</span> },
  { key: "status", title: "状态", width: 80, render: (v: string) => {
    const s = STATUS_MAP[v];
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${s.color}`}>
        <Icon className="h-3 w-3" /> {s.label}
      </span>
    );
  }},
];

export default function Settlement() {
  const totalRevenue = RECORDS.filter((r) => r.status === "paid").reduce((s, r) => s + r.finalAmount, 0);
  const pendingAmount = RECORDS.filter((r) => r.status === "pending" || r.status === "confirmed").reduce((s, r) => s + r.finalAmount, 0);
  const disputedAmount = RECORDS.filter((r) => r.status === "disputed").reduce((s, r) => s + r.finalAmount, 0);
  const totalDeposit = RECORDS.reduce((s, r) => s + r.deposit, 0);

  return (
    <div className="space-y-5">
      <PageHeader title="结算中心" description="CPA/CPS计费 · 对账结算 · 保障金管理" />

      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: CheckCircle2, label: "已结算", value: `¥${totalRevenue.toLocaleString()}`, color: "text-emerald-600" },
          { icon: Clock, label: "待结算", value: `¥${pendingAmount.toLocaleString()}`, color: "text-amber-600" },
          { icon: AlertCircle, label: "争议金额", value: `¥${disputedAmount.toLocaleString()}`, color: "text-red-500" },
          { icon: DollarSign, label: "保障金池", value: `¥${totalDeposit.toLocaleString()}`, color: "text-primary" },
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
        data={RECORDS}
        rowKey="id"
        actions={[
          { label: "查看对账单", onClick: () => toast.info("对账单详情（规划中）") },
          { label: "确认结算", onClick: (r) => r.status === "pending" ? toast.info("确认结算（规划中）") : toast.info("当前状态不可操作") },
        ]}
      />
    </div>
  );
}
