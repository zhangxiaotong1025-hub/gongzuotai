import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit3, User, Package, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditDialog, AuditTimeline, type AuditRecord } from "../enterprise/AuditDialog";

/* ── Benefit Card Palette ── */
const VARIANT_VARS: Record<string, string> = {
  blue: "--benefit-blue", teal: "--benefit-teal", violet: "--benefit-violet",
  amber: "--benefit-amber", rose: "--benefit-rose",
};

/* ── Mock Data ── */
const MOCK = {
  id: "202020",
  name: "王小二",
  phone: "185****8987",
  enterprise: "上海XXXX股份有限公司/XXXX",
  enterpriseLevel: "二级",
  orgPath: "供应链 / 华南供应链",
  remark: "上海XXXX股份有限公司详细地址上海市陆家嘴中心8LXXX号",
  enabledProducts: ["国内3D工具", "国际3D工具", "精准客资"],
  benefits: [
    { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "blue" },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "teal" },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "rose" },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "violet" },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "amber" },
  ],
  auditStatus: "approved" as "pending" | "approved" | "rejected",
  auditRecords: [
    { id: "ar-1", action: "submit" as const, operator: "李娜", time: "2026-01-15 09:30", remark: "新人员创建，提交审核" },
    { id: "ar-2", action: "approve" as const, operator: "王强", time: "2026-01-16 14:20", remark: "信息核实无误" },
  ] as AuditRecord[],
};

/* ── Section Header ── */
function SectionHeader({ title, icon: Icon, action }: { title: string; icon: typeof User; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b" style={{ background: "hsl(var(--muted) / 0.35)" }}>
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[13px] font-semibold text-foreground tracking-wide">{title}</span>
      </div>
      {action}
    </div>
  );
}

/* ── Detail Row ── */
function DetailItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${className || ""}`}>
      <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[80px] text-right">{label}：</span>
      <span className="text-[13px] text-foreground min-w-0">{value}</span>
    </div>
  );
}

/* ── Benefit Card ── */
function BenefitCard({ pkg }: { pkg: typeof MOCK.benefits[0] }) {
  const cssVar = VARIANT_VARS[pkg.variant] || "--benefit-blue";
  const ratio = pkg.total > 0 ? pkg.used / pkg.total : 0;
  return (
    <div
      className="rounded-xl p-4 w-[190px] relative overflow-hidden transition-all hover:shadow-sm"
      style={{
        border: `1px solid hsl(${cssVar.replace('--', 'var(--')}) / 0.15)`,
        background: `hsl(${cssVar.replace('--', 'var(--')}) / 0.03)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-[12px] font-semibold leading-tight" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</span>
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-30 hover:opacity-70 cursor-pointer" style={{ color: `hsl(var(${cssVar}))` }} />
      </div>
      <div className="text-[11px] mb-3 text-muted-foreground">{pkg.date}</div>
      <div className="h-1 rounded-full mb-2" style={{ background: `hsl(var(${cssVar}) / 0.1)` }}>
        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: ratio > 0.8 ? `hsl(var(--warning))` : `hsl(var(${cssVar}))`, opacity: 0.7 }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>
          {pkg.used}<span className="opacity-40 font-normal">/{pkg.total}</span>
        </span>
      </div>
    </div>
  );
}

export default function StaffDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [d, setD] = useState(MOCK);
  const [showAuditDialog, setShowAuditDialog] = useState(false);

  const handleAuditConfirm = (result: { action: "approve" | "reject"; remark: string }) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setD((prev) => ({
      ...prev,
      auditStatus: (result.action === "approve" ? "approved" : "rejected") as typeof d.auditStatus,
      auditRecords: [...prev.auditRecords, { id: `ar-${Date.now()}`, action: result.action, operator: "当前用户", time: timeStr, remark: result.remark }],
    }));
    setShowAuditDialog(false);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/enterprise/staff")}>
            企业管理
          </span>
          <span className="text-muted-foreground/30 text-xs">/</span>
          <h1 className="text-base font-semibold text-foreground tracking-tight">人员详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 h-8 text-[13px] px-3 rounded-lg">
            <ChevronLeft className="h-3.5 w-3.5" /> 上一个
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-8 text-[13px] px-3 rounded-lg">
            下一个 <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[13px] px-4 rounded-lg" onClick={() => navigate("/enterprise/staff")}>
            返回列表
          </Button>
          {d.auditStatus === "pending" && (
            <Button size="sm" className="h-8 text-[13px] px-4 gap-1.5 rounded-lg" onClick={() => setShowAuditDialog(true)}>
              <FileText className="h-3.5 w-3.5" /> 审核
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
            onClick={() => navigate(`/enterprise/staff/create?mode=edit&id=${id}`)}
          >
            <Edit3 className="h-3.5 w-3.5" /> 编辑
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border/80 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Name Banner */}
        <div className="px-6 py-5 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.08)" }}>
              <User className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[15px] font-semibold text-foreground tracking-tight">{d.name}</span>
          </div>
        </div>

        {/* 基础信息 */}
        <SectionHeader title="基础信息" icon={User} action={
          <button className="text-[12px] text-primary/80 hover:text-primary transition-colors font-medium"
            onClick={() => navigate(`/enterprise/staff/create?mode=edit&id=${id}`)}>
            编辑信息
          </button>
        } />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailItem label="姓名" value={d.name} />
            <DetailItem label="人员ID" value={d.id} />
            <DetailItem label="手机号" value={d.phone} />
            <DetailItem label="归属企业" value={
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium" style={{ background: "hsl(var(--primary) / 0.06)", color: "hsl(var(--primary))" }}>
                  {d.enterpriseLevel}
                </span>
                {d.enterprise}
              </span>
            } />
            <DetailItem label="组织架构" value={d.orgPath} />
            <DetailItem label="备注" value={d.remark} className="col-span-1" />
          </div>
        </div>

        {/* 权益配置 */}
        <SectionHeader title="权益配置" icon={Package} action={
          <button className="text-[12px] text-primary/80 hover:text-primary transition-colors font-medium"
            onClick={() => navigate(`/enterprise/staff/create?mode=edit&id=${id}&step=benefit`)}>
            编辑权益
          </button>
        } />
        <div className="px-6 py-5 space-y-4">
          <DetailItem label="开启产品" value={
            <div className="flex gap-1.5 flex-wrap">
              {d.enabledProducts.map((p) => <span key={p} className="badge-product">{p}</span>)}
            </div>
          } />
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[80px] text-right pt-1">权益包：</span>
            <div className="flex gap-3 flex-wrap">
              {d.benefits.map((pkg, i) => <BenefitCard key={i} pkg={pkg} />)}
            </div>
          </div>
        </div>

        {/* 审核记录 */}
        <SectionHeader title="审核记录" icon={FileText} />
        <div className="px-6 py-5">
          {d.auditRecords.length > 0
            ? <AuditTimeline records={[...d.auditRecords].reverse()} />
            : <div className="text-[13px] text-muted-foreground py-4 text-center">暂无审核记录</div>
          }
        </div>
      </div>

      <AuditDialog
        open={showAuditDialog}
        onClose={() => setShowAuditDialog(false)}
        enterpriseName={d.name}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
}
