import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Building2, FileText, Edit3, ExternalLink, X as XIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateEnterpriseDialog } from "@/pages/enterprise/CreateEnterpriseDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ── Types ── */
type ApplicationStatus = "pending" | "created" | "closed";

/* ── Mock Data ── */
interface OpLog {
  time: string;
  operator: string;
  action: string;
  detail?: string;
}

const MOCK = {
  id: "APP0001",
  name: "上海自然博物馆有限公司",
  type: "品牌商",
  status: "pending" as ApplicationStatus,
  products: ["国内3D", "国际3D"],
  industry: "硬装",
  region: "湖北/武汉",
  applyTime: "2020-1-25 10:10",
  legalRep: "王王",
  legalPhone: "18686886788",
  licenseNo: "91440000MA5XXXXXX",
  address: "湖北省武汉市洪山区光谷大道XXX号",
  businessLicense: true,
  note: "稳定续费客户，主要销售硬装瓷砖",
  source: "官网",
  contactName: "李经理",
  contactPhone: "13800138000",
  contactEmail: "li@example.com",
  companySize: "50-200人",
  expectedBudget: "10-50万",
  enterpriseId: undefined as string | undefined,
  enterpriseName: undefined as string | undefined,
  closeReason: undefined as string | undefined,
  closeTime: undefined as string | undefined,
};

const INITIAL_LOGS: OpLog[] = [
  { time: "2020-1-25 10:10", operator: "系统", action: "提交申请", detail: "企业通过官网提交入驻申请" },
];

const STATUS_MAP: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: "待处理", className: "badge-warning" },
  created: { label: "已创建企业", className: "badge-active" },
  closed: { label: "已关闭", className: "badge-inactive" },
};

const TYPE_KEY_MAP: Record<string, string> = {
  "品牌商": "brand", "经销商": "dealer", "装修公司": "decoration",
  "卖场": "mall", "门店": "store", "工作室": "studio",
};

/* ── Detail Row ── */
function DetailItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start gap-3 min-w-0 ${className || ""}`}>
      <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right">{label}：</span>
      <span className="text-[13px] text-foreground min-w-0">{value}</span>
    </div>
  );
}

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

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const [d, setD] = useState(MOCK);
  const [editing, setEditing] = useState(isEditMode);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closeReasonInput, setCloseReasonInput] = useState("");
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [opLogs, setOpLogs] = useState<OpLog[]>(INITIAL_LOGS);

  // Editable fields state
  const [editForm, setEditForm] = useState({
    note: d.note,
    contactName: d.contactName,
    contactPhone: d.contactPhone,
    contactEmail: d.contactEmail,
  });

  const statusCfg = STATUS_MAP[d.status];

  const handleSave = () => {
    setD((prev) => ({ ...prev, ...editForm }));
    setEditing(false);
    toast.success("保存成功");
  };

  const handleClose = () => {
    const now = new Date().toLocaleString("zh-CN");
    setD((prev) => ({
      ...prev,
      status: "closed" as ApplicationStatus,
      closeReason: closeReasonInput.trim() || undefined,
      closeTime: now,
    }));
    setOpLogs((prev) => [...prev, {
      time: now, operator: "当前用户", action: "关闭申请",
      detail: closeReasonInput.trim() || undefined,
    }]);
    setShowCloseConfirm(false);
    setCloseReasonInput("");
    toast.success("申请已关闭");
  };

  const handleTypeSelected = (type: string) => {
    const now = new Date().toLocaleString("zh-CN");
    setOpLogs((prev) => [...prev, {
      time: now, operator: "当前用户", action: "创建企业",
      detail: `选择企业类型进入创建流程`,
    }]);
    setShowTypeDialog(false);
    navigate(`/enterprise/create?type=${type}&fromApplication=${d.id}`);
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate("/enterprise/apply")}
          >
            企业入驻申请
          </span>
          <span className="text-muted-foreground/30 text-xs">/</span>
          <h1 className="text-base font-semibold text-foreground tracking-tight">申请详情</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 h-8 text-[13px] px-3 rounded-lg">
            <ChevronLeft className="h-3.5 w-3.5" /> 上一个
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-8 text-[13px] px-3 rounded-lg">
            下一个 <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          {d.status !== "created" && (
            <Button
              size="sm"
              className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
              onClick={() => setShowTypeDialog(true)}
            >
              创建企业
            </Button>
          )}
          {d.status === "pending" && (
            <>
              <Button
                variant="outline" size="sm"
                className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
                style={{ borderColor: "hsl(var(--destructive) / 0.25)", color: "hsl(var(--destructive))" }}
                onClick={() => { setCloseReasonInput(""); setShowCloseConfirm(true); }}
              >
                <XIcon className="h-3.5 w-3.5" /> 关闭申请
              </Button>
            </>
          )}
          {!editing && d.status === "pending" && (
            <Button variant="outline" size="sm" className="h-8 text-[13px] px-4 gap-1.5 rounded-lg"
              onClick={() => setEditing(true)}>
              <Edit3 className="h-3.5 w-3.5" /> 编辑
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-[13px] px-4 rounded-lg"
            onClick={() => navigate("/enterprise/apply")}>
            返回列表
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-card rounded-xl border border-border/80 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        {/* Top Banner */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-border/60">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.06)" }}>
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-foreground tracking-tight">{d.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground font-medium">{d.type}</span>
                <span className="text-[11px] text-muted-foreground/70">申请ID: {d.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={statusCfg.className}>{statusCfg.label}</span>
            {d.status === "created" && d.enterpriseId && (
              <button
                className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors font-medium"
                onClick={() => navigate(`/enterprise/detail/${d.enterpriseId}`)}
              >
                查看企业 <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── 申请信息 ── */}
        <SectionHeader title="申请信息" icon={FileText} />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailItem label="企业名称" value={d.name} />
            <DetailItem label="申请ID" value={d.id} />
            <DetailItem label="企业类型" value={
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{d.type}</span>
            } />
            <DetailItem label="申请产品" value={
              <div className="flex gap-1.5 flex-wrap">
                {d.products.map((p) => <span key={p} className="badge-product">{p}</span>)}
              </div>
            } />
            <DetailItem label="行业" value={d.industry} />
            <DetailItem label="覆盖区域" value={d.region} />
            <DetailItem label="申请时间" value={<span className="text-muted-foreground">{d.applyTime}</span>} />
            <DetailItem label="来源渠道" value={d.source} />
            <DetailItem label="公司规模" value={d.companySize} />
            <DetailItem label="预期预算" value={d.expectedBudget} />
          </div>
        </div>

        {/* ── 法人信息 ── */}
        <SectionHeader title="法人信息" icon={Building2} />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 gap-x-8 gap-y-4">
            <DetailItem label="法人姓名" value={d.legalRep} />
            <DetailItem label="法人手机号" value={d.legalPhone} />
            <DetailItem label="执照编号" value={d.licenseNo} />
            <DetailItem label="营业执照" value={
              d.businessLicense
                ? <span className="text-foreground">已上传</span>
                : <span className="text-muted-foreground">未上传</span>
            } />
            <DetailItem label="详细地址" value={d.address} className="col-span-2" />
          </div>
        </div>

        {/* ── 联系人信息 ── */}
        <SectionHeader title="联系人信息" icon={Building2} />
        <div className="px-6 py-5">
          {editing ? (
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-2">联系人：</span>
                <input
                  className="filter-input flex-1"
                  value={editForm.contactName}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, contactName: e.target.value }))}
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-2">联系电话：</span>
                <input
                  className="filter-input flex-1"
                  value={editForm.contactPhone}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-2">联系邮箱：</span>
                <input
                  className="filter-input flex-1"
                  value={editForm.contactEmail}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-8 gap-y-4">
              <DetailItem label="联系人" value={d.contactName} />
              <DetailItem label="联系电话" value={d.contactPhone} />
              <DetailItem label="联系邮箱" value={d.contactEmail} />
            </div>
          )}
        </div>

        {/* ── 备注 ── */}
        <SectionHeader title="备注信息" icon={FileText} />
        <div className="px-6 py-5">
          {editing ? (
            <div className="flex items-start gap-3">
              <span className="text-[13px] text-muted-foreground whitespace-nowrap shrink-0 w-[100px] text-right pt-2">备注：</span>
              <textarea
                className="filter-input flex-1 min-h-[80px] resize-y"
                value={editForm.note}
                onChange={(e) => setEditForm((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
          ) : (
            <DetailItem label="备注" value={d.note || "—"} />
          )}
        </div>

        {/* ── 关联企业 (if created) ── */}
        {d.status === "created" && d.enterpriseId && (
          <>
            <SectionHeader title="关联企业" icon={Building2} />
            <div className="px-6 py-5">
              <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                <DetailItem label="企业名称" value={
                  <button
                    className="text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1"
                    onClick={() => navigate(`/enterprise/detail/${d.enterpriseId}`)}
                  >
                    {d.enterpriseName || d.name} <ExternalLink className="h-3 w-3" />
                  </button>
                } />
                <DetailItem label="企业ID" value={d.enterpriseId} />
              </div>
            </div>
          </>
        )}

        {/* ── 关闭信息 (if closed) ── */}
        {d.status === "closed" && d.closeReason && (
          <>
            <SectionHeader title="关闭信息" icon={FileText} />
            <div className="px-6 py-5">
              <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                <DetailItem label="关闭原因" value={d.closeReason} className="col-span-2" />
                {d.closeTime && <DetailItem label="关闭时间" value={<span className="text-muted-foreground">{d.closeTime}</span>} />}
              </div>
            </div>
          </>
        )}

        {/* Edit Actions */}
        {editing && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <button className="btn-secondary" onClick={() => setEditing(false)}>取消</button>
            <button className="btn-primary" onClick={handleSave}>保存</button>
          </div>
        )}
      </div>

      {/* Close Reason Dialog */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCloseConfirm(false)} />
          <div
            className="relative w-full max-w-[480px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            <div className="border-b bg-muted/40 px-5 py-4">
              <h3 className="text-[15px] font-semibold text-foreground">关闭申请</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                关闭后该申请将标记为无效，后续不可恢复。
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="text-muted-foreground w-[70px] text-right shrink-0">企业名称：</span>
                <span className="text-foreground font-medium">{d.name}</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">
                  关闭原因 <span className="text-destructive">*</span>
                </label>
                <textarea
                  className="filter-input w-full min-h-[80px] resize-y"
                  placeholder="请填写关闭原因..."
                  value={closeReasonInput}
                  onChange={(e) => setCloseReasonInput(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4 border-t">
              <button className="btn-secondary flex-1" onClick={() => setShowCloseConfirm(false)}>取消</button>
              <button
                className="btn-primary flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={!closeReasonInput.trim()}
                onClick={handleClose}
              >
                确认关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Enterprise Type Dialog */}
      <CreateEnterpriseDialog
        open={showTypeDialog}
        onClose={() => setShowTypeDialog(false)}
        onSelect={handleTypeSelected}
        defaultType={TYPE_KEY_MAP[d.type] || "brand"}
        title="创建企业"
        subtitle={`基于「${d.name}」的申请创建企业，请确认或修改企业类型`}
      />
    </div>
  );
}
