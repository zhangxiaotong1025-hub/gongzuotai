import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Edit3, User, Package, Info, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  enterprise: "广州珊珊光纤有限公司 / 佛山分公司 / 南海店",
  orgPath: "供应链 / 华南供应链",
  orgTags: ["总部", "模型部", "设计部"],
  role: "设计师",
  status: "active" as "active" | "inactive",
  remark: "上海XXXX股份有限公司详细地址上海市陆家嘴中心8LXXX号",
  enabledProducts: ["国内3D工具", "国际3D工具", "精准客资"],
  benefits: [
    { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "blue" },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "teal" },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "rose" },
    { name: "VR漫游权益包", date: "2025.2.23—2028.2.23", used: 8, total: 30, variant: "violet" },
    { name: "AI生图权益包", date: "2025.2.23—2028.2.23", used: 25, total: 30, variant: "amber" },
  ],
};

/* ── Section Header ── */
function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof User }) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b" style={{ background: "hsl(var(--muted) / 0.35)" }}>
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[13px] font-semibold text-foreground tracking-wide">{title}</span>
      </div>
    </div>
  );
}

/* ── Detail Row ── */
function DetailItem({ label, value, highlight, className }: { label: string; value: React.ReactNode; highlight?: boolean; className?: string }) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${className || ""}`}>
      <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right">{label}：</span>
      <span className={`text-[13px] min-w-0 ${highlight ? "text-primary font-medium" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

/* ── Benefit Card ── */
function BenefitCard({ pkg }: { pkg: typeof MOCK.benefits[0] }) {
  const cssVar = VARIANT_VARS[pkg.variant] || "--benefit-blue";
  const ratio = pkg.total > 0 ? pkg.used / pkg.total : 0;
  return (
    <div
      className="rounded-xl p-4 w-[190px] relative overflow-hidden transition-all hover:shadow-sm group"
      style={{
        border: `1px solid hsl(${cssVar.replace('--', 'var(--')}) / 0.15)`,
        background: `hsl(${cssVar.replace('--', 'var(--')}) / 0.03)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="text-[12px] font-semibold leading-tight line-clamp-2" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</span>
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-30 hover:opacity-70 cursor-pointer transition-opacity" style={{ color: `hsl(var(${cssVar}))` }} />
      </div>
      <div className="text-[11px] mb-3 text-muted-foreground">{pkg.date}</div>
      <div className="h-1 rounded-full mb-2" style={{ background: `hsl(var(${cssVar}) / 0.1)` }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${ratio * 100}%`, background: ratio > 0.8 ? `hsl(var(--warning))` : `hsl(var(${cssVar}))`, opacity: 0.7 }} />
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
  const [showStatusConfirm, setShowStatusConfirm] = useState<"enable" | "disable" | null>(null);

  const handleStatusConfirm = () => {
    if (showStatusConfirm === "enable") {
      setD((prev) => ({ ...prev, status: "active" }));
      toast.success("人员已启用");
    } else {
      setD((prev) => ({ ...prev, status: "inactive" }));
      toast.success("人员已停用");
    }
    setShowStatusConfirm(null);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb + Global Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/enterprise/staff")}>
            人员管理
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
          <div className="w-px h-4 bg-border mx-1" />
          {d.status === "active" && (
            <Button
              variant="outline" size="sm"
              className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
              style={{ borderColor: "hsl(var(--destructive) / 0.25)", color: "hsl(var(--destructive))" }}
              onClick={() => setShowStatusConfirm("disable")}
            >
              <PowerOff className="h-3.5 w-3.5" /> 停用
            </Button>
          )}
          {d.status === "inactive" && (
            <Button
              size="sm"
              className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
              style={{ background: "hsl(var(--success))" }}
              onClick={() => setShowStatusConfirm("enable")}
            >
              <Power className="h-3.5 w-3.5" /> 启用
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
            onClick={() => navigate(`/enterprise/staff/create?mode=edit&id=${id}`)}>
            <Edit3 className="h-3.5 w-3.5" /> 编辑
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-[13px] px-4 rounded-lg" onClick={() => navigate("/enterprise/staff")}>
            返回列表
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border/80 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Name Banner */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.06)" }}>
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-foreground tracking-tight">{d.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground font-medium">{d.role}</span>
                <span className="text-[11px] text-muted-foreground/70">ID: {d.id}</span>
              </div>
            </div>
          </div>
          <span className={d.status === "active" ? "badge-active" : "badge-inactive"}>
            {d.status === "active" ? "正常" : "已停用"}
          </span>
        </div>

        {/* 基础信息 */}
        <SectionHeader title="基础信息" icon={User} />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailItem label="姓名" value={d.name} />
            <DetailItem label="人员ID" value={d.id} />
            <DetailItem label="手机号" value={d.phone} />
            <DetailItem label="归属企业" value={d.enterprise} />
            <DetailItem label="组织架构" value={
              <div className="flex gap-1.5 flex-wrap">
                {d.orgTags.map((t) => <span key={t} className="badge-product">{t}</span>)}
              </div>
            } />
            <DetailItem label="角色" value={d.role} />
            <DetailItem label="备注" value={d.remark} className="col-span-2" />
          </div>
        </div>

        {/* 权益配置 */}
        <SectionHeader title="权益配置" icon={Package} />
        <div className="px-6 py-5 space-y-4">
          <DetailItem label="开启产品" value={
            <div className="flex gap-1.5 flex-wrap">
              {d.enabledProducts.map((p) => <span key={p} className="badge-product">{p}</span>)}
            </div>
          } />
          <div className="flex items-start gap-3">
            <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-1">权益包：</span>
            <div className="flex gap-3 flex-wrap">
              {d.benefits.map((pkg, i) => <BenefitCard key={i} pkg={pkg} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Toggle Confirm */}
      <AlertDialog open={!!showStatusConfirm} onOpenChange={() => setShowStatusConfirm(null)}>
        <AlertDialogContent className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="border-b px-5 py-4" style={{ background: "hsl(var(--muted) / 0.3)" }}>
            <AlertDialogHeader className="space-y-1">
              <AlertDialogTitle className="text-[15px] font-semibold text-foreground">
                {showStatusConfirm === "disable" ? "确认停用该人员？" : "确认启用该人员？"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px] leading-6 text-muted-foreground">
                {showStatusConfirm === "disable"
                  ? "停用后该人员将无法使用系统功能，后续可重新启用。"
                  : "启用后该人员将恢复正常使用权限。"}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="gap-2 px-5 py-4">
            <AlertDialogCancel className="mt-0 h-8 rounded-lg px-4 text-[13px]">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusConfirm}
              className={`h-8 rounded-lg px-4 text-[13px] ${showStatusConfirm === "disable" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}
              style={showStatusConfirm === "enable" ? { background: "hsl(var(--success))", color: "hsl(var(--success-foreground))" } : undefined}
            >
              {showStatusConfirm === "disable" ? "确认停用" : "确认启用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
