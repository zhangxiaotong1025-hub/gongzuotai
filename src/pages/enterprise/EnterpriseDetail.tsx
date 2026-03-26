import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Info, Building2, Package, Tag, CheckCircle2, XCircle, Clock, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ── Types ── */
type AuditStatus = "pending" | "approved" | "rejected";

/* ── Mock Detail Data ── */
const MOCK_DETAIL = {
  id: "202020",
  name: "欧派家居集团股份有限公司",
  orgStructure: "总部",
  orgName: "欧派家居集团股份有限公司",
  type: "brand",
  typeName: "品牌商",
  industry: "家居建材",
  region: "华东",
  businessLicense: "",
  licenseNo: "91440000MA5XXXXXX",
  legalRep: "王小二",
  legalPhone: "18686886788",
  address: "上海市浦东新区陆家嘴金融中心8号楼XXX室",
  activationCode: "ACT-2025-0088",
  status: "active" as const,
  auditStatus: "approved" as AuditStatus,
  admin: "张伟",
  enabledProducts: ["国内3D工具", "国际3D工具", "精准客资"],
  supplyChain: "加入",
  renderRight: "未开启",
  benefitPackages: [
    { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "primary" as const },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "info" as const },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "danger" as const },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "primary" as const },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "danger" as const },
  ],
  serviceType: "豪华版",
  accountCount: { used: 10, total: 10 },
  funcRights: "施工图 / 预算报价 / AI工具包",
  renderQuota: { used: 7, total: 10 },
  renderLimit: "每天20次8k / 每周30次36k",
  materialLib: "开启",
  environments: ["通用环境", "硬装环境"],
  subEnterpriseLimit: { used: 20, total: 30 },
  subEnterpriseRight: "开启",
  subEnterpriseExpiry: "2027-12-31",
  ownedBrands: ["欧派", "索菲亚", "尚品宅配", "金牌厨柜"],
  agentBrands: ["志邦", "我乐", "好莱客", "皮阿诺", "顶固", "百得胜", "诗尼曼"],
};

/* ── Audit Status Config ── */
const AUDIT_CFG: Record<AuditStatus, { label: string; icon: typeof Clock; statusVar: string }> = {
  pending: { label: "待审核", icon: Clock, statusVar: "warning" },
  approved: { label: "审核通过", icon: CheckCircle2, statusVar: "success" },
  rejected: { label: "审核驳回", icon: XCircle, statusVar: "destructive" },
};

/* ── Section Header (unified with create page style) ── */
function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof Building2 }) {
  return (
    <div className="flex items-center gap-2.5 px-6 py-3 border-b" style={{ background: "hsl(var(--muted) / 0.5)" }}>
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
  );
}

/* ── Sub-section Title (matches create page SectionTitle) ── */
function SubTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4 rounded-full bg-primary" />
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    </div>
  );
}

/* ── Detail Row - uses same label width as FormRow in create page ── */
function DetailItem({ label, value, highlight, className }: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${className || ""}`}>
      <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right">{label}：</span>
      <span className={`text-[13px] min-w-0 ${highlight ? "text-primary font-medium" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

/* ── Benefit Package Card ── */
const VARIANT_COLORS: Record<string, { border: string; bg: string; text: string; bar: string }> = {
  primary: {
    border: "hsl(var(--primary) / 0.2)",
    bg: "hsl(var(--primary) / 0.03)",
    text: "hsl(var(--primary))",
    bar: "hsl(var(--primary))",
  },
  info: {
    border: "hsl(var(--info) / 0.2)",
    bg: "hsl(var(--info) / 0.03)",
    text: "hsl(var(--info))",
    bar: "hsl(var(--info))",
  },
  danger: {
    border: "hsl(var(--destructive) / 0.2)",
    bg: "hsl(var(--destructive) / 0.03)",
    text: "hsl(var(--destructive))",
    bar: "hsl(var(--destructive))",
  },
};

function BenefitCard({ pkg }: { pkg: typeof MOCK_DETAIL.benefitPackages[0] }) {
  const ratio = pkg.total > 0 ? pkg.used / pkg.total : 0;
  const c = VARIANT_COLORS[pkg.variant] || VARIANT_COLORS.primary;

  return (
    <div
      className="rounded-xl p-3.5 w-[185px] relative overflow-hidden transition-shadow hover:shadow-md"
      style={{ border: `1px solid ${c.border}`, background: c.bg }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: c.bar }} />
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: c.text }}>{pkg.name}</span>
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 cursor-pointer opacity-40 hover:opacity-80 transition-opacity" style={{ color: c.text }} />
      </div>
      <div className="text-[11px] mb-3 opacity-70" style={{ color: c.text }}>{pkg.date}</div>
      <div className="h-1.5 rounded-full mb-2" style={{ background: `${c.bar}15` }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${ratio * 100}%`, background: c.bar }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className="text-sm font-bold" style={{ color: c.text }}>{pkg.used}<span className="opacity-50">/{pkg.total}</span></span>
      </div>
    </div>
  );
}

/* ── Brand Card ── */
function BrandCard({ name }: { name: string }) {
  return (
    <div className="w-[72px] h-[72px] rounded-xl border border-border bg-muted/40 flex items-center justify-center transition-all hover:shadow-sm hover:border-primary/20 cursor-default">
      <span className="text-[11px] text-muted-foreground text-center leading-tight font-medium">{name}</span>
    </div>
  );
}

export default function EnterpriseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [d, setD] = useState(MOCK_DETAIL);
  const [confirmDialog, setConfirmDialog] = useState<{ type: "approve" | "reject" } | null>(null);

  const auditCfg = AUDIT_CFG[d.auditStatus];
  const AuditIcon = auditCfg.icon;

  const handleAudit = (action: "approve" | "reject") => {
    setD((prev) => ({
      ...prev,
      auditStatus: action === "approve" ? "approved" : "rejected",
    }));
    setConfirmDialog(null);
  };

  const hasBrands = d.type === "brand" || d.type === "mall";

  return (
    <div className="space-y-4">
      {/* Breadcrumb + Actions — same height and spacing as PageHeader */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate("/enterprise")}
          >
            企业管理
          </span>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <h1 className="text-lg font-semibold text-foreground">企业详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 h-9 text-[13px] px-3">
            <ChevronLeft className="h-3.5 w-3.5" /> 上一个
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-9 text-[13px] px-3">
            下一个 <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 text-[13px] px-4" onClick={() => navigate("/enterprise")}>
            返回列表
          </Button>
          {d.auditStatus === "pending" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-[13px] px-4"
                style={{ borderColor: "hsl(var(--destructive) / 0.3)", color: "hsl(var(--destructive))" }}
                onClick={() => setConfirmDialog({ type: "reject" })}
              >
                驳回
              </Button>
              <Button
                size="sm"
                className="h-9 text-[13px] px-4 gap-1.5"
                style={{ background: "hsl(var(--success))" }}
                onClick={() => setConfirmDialog({ type: "approve" })}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> 审核通过
              </Button>
            </>
          )}
          <Button
            size="sm"
            className="h-9 text-[13px] px-4 gap-1.5"
            onClick={() => navigate(`/enterprise/create?type=${d.type}&mode=edit&id=${id}`)}
          >
            <Edit3 className="h-3.5 w-3.5" /> 编辑
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Top: Name + Status Banner */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.08)" }}>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{d.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground">{d.typeName}</span>
                <span className="text-xs text-muted-foreground">ID: {d.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: `hsl(var(--${auditCfg.statusVar}) / 0.08)`,
                color: `hsl(var(--${auditCfg.statusVar}))`,
              }}
            >
              <AuditIcon className="h-3.5 w-3.5" />
              {auditCfg.label}
            </div>
            {d.auditStatus === "approved" && (
              <span className={d.status === "active" ? "badge-active" : "badge-inactive"}>
                {d.status === "active" ? "已启用" : "已停用"}
              </span>
            )}
          </div>
        </div>

        {/* ── 基础信息 ── */}
        <SectionHeader title="基础信息" icon={Building2} />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <DetailItem label="企业名称" value={d.name} />
            <DetailItem label="企业ID" value={d.id} />
            <DetailItem label="组织结构" value={
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
                  style={{ background: "hsl(var(--primary) / 0.08)", color: "hsl(var(--primary))" }}
                >
                  {d.orgStructure}
                </span>
                <span className="text-foreground">{d.orgName}</span>
              </span>
            } />
            <DetailItem label="行业" value={d.industry} />
            <DetailItem label="覆盖区域" value={d.region} />
            <DetailItem label="营业执照" value={
              <span className="w-14 h-14 rounded-lg border border-border bg-muted/50 inline-flex items-center justify-center text-[10px] text-muted-foreground">暂无</span>
            } />
            <DetailItem label="执照编号" value={d.licenseNo} />
            <DetailItem label="法人代表" value={d.legalRep} />
            <DetailItem label="法人手机号" value={d.legalPhone} />
            <DetailItem label="详细地址" value={d.address} className="col-span-2" />
            <DetailItem label="激活券码" value={d.activationCode} />
          </div>
        </div>

        {/* ── 权益配置 ── */}
        <SectionHeader title="权益配置" icon={Package} />
        <div className="px-6 py-5 space-y-7">
          {/* 基础权益 */}
          <div>
            <SubTitle title="基础权益" />
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <DetailItem label="开启产品" value={
                <div className="flex gap-1.5 flex-wrap">
                  {d.enabledProducts.map((p) => <span key={p} className="badge-product">{p}</span>)}
                </div>
              } />
              <DetailItem label="加入供应链" value={d.supplyChain} />
              <DetailItem label="通用渲染权益" value={d.renderRight} />
            </div>
          </div>

          {/* 3D工具权益 */}
          <div>
            <SubTitle title="3D工具权益" />
            <div className="mb-5">
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-1">权益包：</span>
                <div className="flex gap-3 flex-wrap">
                  {d.benefitPackages.map((pkg, i) => (
                    <BenefitCard key={i} pkg={pkg} />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <DetailItem label="服务类型" value={d.serviceType} />
              <DetailItem label="账号数量" value={<>{d.accountCount.used} / {d.accountCount.total}个</>} highlight />
              <DetailItem label="功能权益" value={d.funcRights} />
              <DetailItem label="渲染名额" value={<>{d.renderQuota.used} / {d.renderQuota.total}人</>} highlight />
              <DetailItem label="渲染配额" value={d.renderLimit} />
              <DetailItem label="企业素材库" value={d.materialLib} />
              <DetailItem label="开启环境" value={
                <div className="flex gap-1.5">
                  {d.environments.map((e) => <span key={e} className="badge-product">{e}</span>)}
                </div>
              } />
            </div>
          </div>

          {/* 企业权益 */}
          <div>
            <SubTitle title="企业权益" />
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <DetailItem label="子企业上限" value={<>{d.subEnterpriseLimit.used} / {d.subEnterpriseLimit.total}个</>} highlight />
              <DetailItem label="子企业权益" value={d.subEnterpriseRight} />
              <DetailItem label="到期时间" value={d.subEnterpriseExpiry} />
            </div>
          </div>
        </div>

        {/* ── 品牌设置 ── */}
        {hasBrands && (
          <>
            <SectionHeader title="品牌设置" icon={Tag} />
            <div className="px-6 py-5 space-y-5">
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-5">拥有品牌：</span>
                <div className="flex gap-3 flex-wrap">
                  {d.ownedBrands.map((b) => <BrandCard key={b} name={b} />)}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-5">代理品牌：</span>
                <div className="flex gap-3 flex-wrap">
                  {d.agentBrands.map((b) => <BrandCard key={b} name={b} />)}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Audit Confirmation Dialog ── */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent
          className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          <div className="border-b px-5 py-4" style={{ background: "hsl(var(--muted) / 0.4)" }}>
            <AlertDialogTitle className="text-[15px] font-semibold text-foreground">
              {confirmDialog?.type === "approve" ? "确认审核通过？" : "确认驳回该企业？"}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-1 text-[13px] leading-6 text-muted-foreground">
              {confirmDialog?.type === "approve"
                ? "审核通过后该企业可以被启用，并正常使用已配置的产品和权益。"
                : "驳回后企业信息需要重新编辑并提交审核，当前配置将保留。"}
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="gap-2 px-5 py-4">
            <AlertDialogCancel className="mt-0 h-9 rounded-lg px-4 text-[13px]">取消</AlertDialogCancel>
            <AlertDialogAction
              className={`h-9 rounded-lg px-4 text-[13px] ${confirmDialog?.type === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}`}
              style={confirmDialog?.type === "approve" ? { background: "hsl(var(--success))", color: "hsl(var(--success-foreground))" } : undefined}
              onClick={() => confirmDialog && handleAudit(confirmDialog.type)}
            >
              {confirmDialog?.type === "approve" ? "确认通过" : "确认驳回"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
