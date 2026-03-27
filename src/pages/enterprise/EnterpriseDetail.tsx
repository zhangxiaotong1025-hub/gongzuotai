import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Building2, Package, Tag, CheckCircle2, XCircle, Clock, Info, History, UserCog, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailActionBar } from "@/components/admin/DetailActionBar";
import { AuditDialog, AuditTimeline, type AuditRecord } from "./AuditDialog";
import { SetAdminDialog } from "./SetAdminDialog";
import { OrderDialog } from "@/pages/entitlement/dialogs/OrderDialog";
import { orderData, type EntitlementOrder } from "@/data/entitlement";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
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
  status: "active" as "active" | "inactive",
  auditStatus: "pending" as AuditStatus,
  admin: "",
  enabledProducts: ["国内3D工具", "国际3D工具", "精准客资"],
  supplyChain: "加入",
  renderRight: "未开启",
  benefitPackages: [
    { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "blue" as const },
    { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "teal" as const },
    { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "rose" as const },
    { name: "VR漫游权益包", date: "2025.2.23—2028.2.23", used: 8, total: 30, variant: "violet" as const },
    { name: "AI生图权益包", date: "2025.2.23—2028.2.23", used: 25, total: 30, variant: "amber" as const },
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
  auditRecords: [
    { id: "ar-1", action: "submit" as const, operator: "李娜", time: "2026-01-15 09:30", remark: "新企业创建，提交审核" },
    { id: "ar-2", action: "reject" as const, operator: "王强", time: "2026-01-16 14:20", remark: "营业执照信息不完整，请补充后重新提交" },
    { id: "ar-3", action: "resubmit" as const, operator: "李娜", time: "2026-01-17 10:00", remark: "已补充营业执照信息，重新提交审核" },
  ] as AuditRecord[],
};

/* ── Audit Status Config ── */
const AUDIT_CFG: Record<AuditStatus, { label: string; icon: typeof Clock; statusVar: string }> = {
  pending: { label: "待审核", icon: Clock, statusVar: "warning" },
  approved: { label: "审核通过", icon: CheckCircle2, statusVar: "success" },
  rejected: { label: "审核驳回", icon: XCircle, statusVar: "destructive" },
};

/* ── Benefit Card Palette — CSS variable based ── */
const BENEFIT_VARIANTS: Record<string, string> = {
  blue: "--benefit-blue",
  teal: "--benefit-teal",
  violet: "--benefit-violet",
  amber: "--benefit-amber",
  rose: "--benefit-rose",
};

/* ── Section Header ── */
function SectionHeader({ title, icon: Icon, action }: { title: string; icon: typeof Building2; action?: React.ReactNode }) {
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

/* ── Sub-section Title ── */
function SubTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-0.5 h-4 rounded-full bg-primary/60" />
      <h4 className="text-[13px] font-semibold text-foreground">{title}</h4>
    </div>
  );
}

/* ── Detail Row ── */
function DetailItem({ label, value, highlight, className }: {
  label: string; value: React.ReactNode; highlight?: boolean; className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${className || ""}`}>
      <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right">{label}：</span>
      <span className={`text-[13px] min-w-0 ${highlight ? "text-primary font-medium" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

/* ── Benefit Package Card — elegant, desaturated ── */
function BenefitCard({ pkg }: { pkg: typeof MOCK_DETAIL.benefitPackages[0] }) {
  const ratio = pkg.total > 0 ? pkg.used / pkg.total : 0;
  const cssVar = BENEFIT_VARIANTS[pkg.variant] || "--benefit-blue";

  return (
    <div
      className="rounded-xl p-4 w-[190px] relative overflow-hidden transition-all hover:shadow-sm group"
      style={{
        border: `1px solid hsl(${cssVar.replace('--', 'var(--')}) / 0.15)`,
        background: `hsl(${cssVar.replace('--', 'var(--')}) / 0.03)`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: `hsl(var(${cssVar}))` }}
      />
      <div className="flex items-start justify-between gap-1 mb-2">
        <span
          className="text-[12px] font-semibold leading-tight line-clamp-2"
          style={{ color: `hsl(var(${cssVar}))` }}
        >
          {pkg.name}
        </span>
        <Info
          className="h-3.5 w-3.5 shrink-0 mt-0.5 cursor-pointer opacity-30 hover:opacity-70 transition-opacity"
          style={{ color: `hsl(var(${cssVar}))` }}
        />
      </div>
      <div className="text-[11px] mb-3 text-muted-foreground">{pkg.date}</div>
      <div className="h-1 rounded-full mb-2" style={{ background: `hsl(var(${cssVar}) / 0.1)` }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${ratio * 100}%`,
            background: ratio > 0.8
              ? `hsl(var(--warning))`
              : `hsl(var(${cssVar}))`,
            opacity: 0.7,
          }}
        />
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

/* ── Brand Card ── */
function BrandCard({ name }: { name: string }) {
  return (
    <div className="w-[72px] h-[72px] rounded-xl border border-border/80 bg-muted/30 flex items-center justify-center transition-all hover:shadow-sm hover:border-primary/15 cursor-default">
      <span className="text-[11px] text-muted-foreground text-center leading-tight font-medium">{name}</span>
    </div>
  );
}

export default function EnterpriseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [d, setD] = useState(MOCK_DETAIL);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<"enable" | "disable" | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState<EntitlementOrder | null>(null);

  // Find linked enterprise_grant orders
  const linkedOrders = orderData.filter((o) => o.orderType === "enterprise_grant" && o.linkedEnterpriseId === id);

  const auditCfg = AUDIT_CFG[d.auditStatus];
  const AuditIcon = auditCfg.icon;
  const hasBrands = d.type === "brand" || d.type === "mall";
  const canToggleStatus = d.auditStatus === "approved";

  const handleAuditConfirm = (result: { action: "approve" | "reject"; remark: string }) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newRecord: AuditRecord = {
      id: `ar-${Date.now()}`,
      action: result.action,
      operator: "当前用户",
      time: timeStr,
      remark: result.remark,
    };
    setD((prev) => ({
      ...prev,
      auditStatus: (result.action === "approve" ? "approved" : "rejected") as AuditStatus,
      auditRecords: [...prev.auditRecords, newRecord],
    }));
    setShowAuditDialog(false);
  };

  const handleEnableClick = () => {
    if (!d.admin) {
      setShowAdminDialog(true);
      return;
    }
    setShowStatusConfirm("enable");
  };

  const handleStatusConfirm = () => {
    if (showStatusConfirm === "enable") {
      setD((prev) => ({ ...prev, status: "active" }));
    } else {
      setD((prev) => ({ ...prev, status: "inactive" }));
    }
    setShowStatusConfirm(null);
  };

  return (
    <div className="space-y-5">
      <DetailActionBar
        backLabel="企业管理"
        backPath="/enterprise"
        currentName={d.name}
        prevPath={null}
        nextPath={null}
        onEdit={() => navigate(`/enterprise/create?type=${d.type}&mode=edit&id=${id}`)}
        statusToggle={canToggleStatus ? {
          currentActive: d.status === "active",
          onToggle: () => d.status === "active" ? setShowStatusConfirm("disable") : handleEnableClick(),
        } : undefined}
        extraActions={
          <>
            {d.auditStatus === "pending" && (
              <Button size="sm" className="h-8 text-[13px] px-4 gap-1.5 rounded-lg" onClick={() => setShowAuditDialog(true)}>
                审核
              </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
              onClick={() => setShowAdminDialog(true)}>
              <UserCog className="h-3.5 w-3.5" /> 设置管理员
            </Button>
          </>
        }
      />

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border/80 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Top: Name + Status Banner */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.06)" }}>
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-foreground tracking-tight">{d.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground font-medium">{d.typeName}</span>
                <span className="text-[11px] text-muted-foreground/70">ID: {d.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium"
              style={{
                background: `hsl(var(--${auditCfg.statusVar}) / 0.07)`,
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
        <SectionHeader title="基础信息" icon={Building2} action={
          <button className="text-[12px] text-primary/80 hover:text-primary transition-colors font-medium"
            onClick={() => navigate(`/enterprise/create?type=${d.type}&mode=edit&id=${id}`)}>
            编辑信息
          </button>
        } />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailItem label="企业名称" value={d.name} />
            <DetailItem label="企业ID" value={d.id} />
            <DetailItem label="组织结构" value={
              <span className="flex items-center gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium" style={{ background: "hsl(var(--primary) / 0.06)", color: "hsl(var(--primary))" }}>
                  {d.orgStructure}
                </span>
                <span className="text-foreground">{d.orgName}</span>
              </span>
            } />
            <DetailItem label="行业" value={d.industry} />
            <DetailItem label="覆盖区域" value={d.region} />
            <DetailItem label="营业执照" value={
              <span className="w-14 h-14 rounded-lg border border-border/60 bg-muted/30 inline-flex items-center justify-center text-[10px] text-muted-foreground">暂无</span>
            } />
            <DetailItem label="执照编号" value={d.licenseNo} />
            <DetailItem label="法人代表" value={d.legalRep} />
            <DetailItem label="法人手机号" value={d.legalPhone} />
            <DetailItem label="详细地址" value={d.address} className="col-span-2" />
            <DetailItem label="激活券码" value={d.activationCode} />
            <DetailItem label="管理员" value={
              d.admin ? (
                <span className="text-foreground font-medium">{d.admin}</span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground">未设置</span>
                  <button className="text-[12px] text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setShowAdminDialog(true)}>
                    立即设置
                  </button>
                </span>
              )
            } />
          </div>
        </div>

        {/* ── 权益配置 ── */}
        <SectionHeader title="权益配置" icon={Package} action={
          <button className="text-[12px] text-primary/80 hover:text-primary transition-colors font-medium"
            onClick={() => navigate(`/enterprise/create?type=${d.type}&mode=edit&id=${id}&step=product`)}>
            编辑权益
          </button>
        } />
        <div className="px-6 py-5 space-y-7">
          <div>
            <SubTitle title="基础权益" />
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
              <DetailItem label="开启产品" value={
                <div className="flex gap-1.5 flex-wrap">
                  {d.enabledProducts.map((p) => <span key={p} className="badge-product">{p}</span>)}
                </div>
              } />
              <DetailItem label="加入供应链" value={d.supplyChain} />
              <DetailItem label="通用渲染权益" value={d.renderRight} />
            </div>
          </div>

          <div>
            <SubTitle title="3D工具权益" />
            <div className="mb-5">
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-1">权益包：</span>
                <div className="flex gap-3 flex-wrap">
                  {d.benefitPackages.map((pkg, i) => <BenefitCard key={i} pkg={pkg} />)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
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

          <div>
            <SubTitle title="企业权益" />
            <div className="grid grid-cols-3 gap-x-8 gap-y-3">
              <DetailItem label="子企业上限" value={<>{d.subEnterpriseLimit.used} / {d.subEnterpriseLimit.total}个</>} highlight />
              <DetailItem label="子企业权益" value={d.subEnterpriseRight} />
              <DetailItem label="到期时间" value={d.subEnterpriseExpiry} />
            </div>
          </div>
        </div>

        {/* ── 品牌设置 ── */}
        {hasBrands && (
          <>
            <SectionHeader title="品牌设置" icon={Tag} action={
              <button className="text-[12px] text-primary/80 hover:text-primary transition-colors font-medium"
                onClick={() => navigate(`/enterprise/create?type=${d.type}&mode=edit&id=${id}&step=config`)}>
                编辑品牌
              </button>
            } />
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

        {/* ── 审核记录 ── */}
        <SectionHeader title="审核记录" icon={History} />
        <div className="px-6 py-5">
          {d.auditRecords.length > 0 ? (
            <AuditTimeline records={[...d.auditRecords].reverse()} />
          ) : (
            <div className="text-[13px] text-muted-foreground py-4 text-center">暂无审核记录</div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <AuditDialog open={showAuditDialog} onClose={() => setShowAuditDialog(false)} enterpriseName={d.name} onConfirm={handleAuditConfirm} />

      <SetAdminDialog open={showAdminDialog} onClose={() => setShowAdminDialog(false)} enterpriseName={d.name}
        onConfirm={(result) => {
          setD((prev) => ({ ...prev, admin: result.adminName, status: result.status }));
          setShowAdminDialog(false);
        }}
      />

      {/* Status Toggle Confirm */}
      <AlertDialog open={!!showStatusConfirm} onOpenChange={() => setShowStatusConfirm(null)}>
        <AlertDialogContent className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="border-b px-5 py-4" style={{ background: "hsl(var(--muted) / 0.3)" }}>
            <AlertDialogHeader className="space-y-1">
              <AlertDialogTitle className="text-[15px] font-semibold text-foreground">
                {showStatusConfirm === "disable" ? "确认停用该企业？" : "确认启用该企业？"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[13px] leading-6 text-muted-foreground">
                {showStatusConfirm === "disable"
                  ? "停用后该企业及其所有子企业将被冻结，暂时无法使用，后续可重新启用。"
                  : "启用后该企业将恢复正常使用，已配置的产品和权益将立即生效。"}
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
