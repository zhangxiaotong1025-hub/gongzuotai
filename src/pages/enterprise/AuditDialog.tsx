import { useState } from "react";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export interface AuditRecord {
  id: string;
  action: "submit" | "approve" | "reject" | "resubmit";
  operator: string;
  time: string;
  remark: string;
}

interface AuditDialogProps {
  open: boolean;
  onClose: () => void;
  enterpriseName?: string;
  onConfirm: (result: { action: "approve" | "reject"; remark: string }) => void;
}

const ACTION_LABELS: Record<AuditRecord["action"], { label: string; className: string }> = {
  submit: { label: "提交审核", className: "badge-warning" },
  approve: { label: "审核通过", className: "badge-active" },
  reject: { label: "审核驳回", className: "badge-danger" },
  resubmit: { label: "重新提交", className: "badge-warning" },
};

export function getActionLabel(action: AuditRecord["action"]) {
  return ACTION_LABELS[action];
}

export function AuditDialog({ open, onClose, enterpriseName, onConfirm }: AuditDialogProps) {
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [remark, setRemark] = useState("");

  const handleConfirm = () => {
    onConfirm({ action, remark });
    setAction("approve");
    setRemark("");
  };

  const handleClose = () => {
    onClose();
    setAction("approve");
    setRemark("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-[480px] overflow-hidden rounded-xl border bg-card p-0" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b px-5 py-4" style={{ background: "hsl(var(--muted) / 0.4)" }}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              企业审核
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              请对「{enterpriseName}」进行审核操作，审核结果将影响企业及其所有子企业的可用状态。
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Action Selection */}
          <div className="space-y-2.5">
            <label className="text-[13px] font-medium text-foreground">审核结果</label>
            <div className="flex gap-3">
              <label
                className="flex-1 flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all"
                style={{
                  borderColor: action === "approve" ? "hsl(var(--success))" : "hsl(var(--border))",
                  background: action === "approve" ? "hsl(var(--success) / 0.04)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="auditAction"
                  className="sr-only"
                  checked={action === "approve"}
                  onChange={() => setAction("approve")}
                />
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: action === "approve" ? "hsl(var(--success))" : "hsl(var(--border))",
                  }}
                >
                  {action === "approve" && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--success))" }} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" style={{ color: "hsl(var(--success))" }} />
                  <span className="text-[13px] font-medium text-foreground">审核通过</span>
                </div>
              </label>
              <label
                className="flex-1 flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 cursor-pointer transition-all"
                style={{
                  borderColor: action === "reject" ? "hsl(var(--destructive))" : "hsl(var(--border))",
                  background: action === "reject" ? "hsl(var(--destructive) / 0.04)" : "transparent",
                }}
              >
                <input
                  type="radio"
                  name="auditAction"
                  className="sr-only"
                  checked={action === "reject"}
                  onChange={() => setAction("reject")}
                />
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: action === "reject" ? "hsl(var(--destructive))" : "hsl(var(--border))",
                  }}
                >
                  {action === "reject" && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--destructive))" }} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" style={{ color: "hsl(var(--destructive))" }} />
                  <span className="text-[13px] font-medium text-foreground">审核驳回</span>
                </div>
              </label>
            </div>
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-foreground">
              审核备注
              {action === "reject" && <span style={{ color: "hsl(var(--destructive))" }}> *</span>}
            </label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={action === "reject" ? "请填写驳回原因（必填）" : "请输入审核备注（选填）"}
              className="resize-none text-[13px] min-h-[90px]"
            />
          </div>

          {/* Cascade Warning */}
          <div
            className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-[12px] leading-relaxed"
            style={{
              background: action === "reject" ? "hsl(var(--destructive) / 0.05)" : "hsl(var(--warning) / 0.05)",
              color: action === "reject" ? "hsl(var(--destructive))" : "hsl(var(--warning))",
            }}
          >
            <span className="shrink-0 mt-0.5">⚠</span>
            <span>
              {action === "reject"
                ? "驳回后该企业及其所有子企业将被冻结，需重新编辑提交审核。"
                : "通过后该企业可被启用，子企业状态不受影响。"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="btn-secondary" onClick={handleClose}>取消</button>
          <button
            className="btn-primary"
            disabled={action === "reject" && !remark.trim()}
            style={
              action === "reject"
                ? { background: "hsl(var(--destructive))", opacity: !remark.trim() ? 0.5 : 1 }
                : { background: "hsl(var(--success))" }
            }
            onClick={handleConfirm}
          >
            {action === "approve" ? "确认通过" : "确认驳回"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Audit Timeline Component ── */
export function AuditTimeline({ records }: { records: AuditRecord[] }) {
  if (!records.length) return null;

  return (
    <div className="space-y-0">
      {records.map((r, i) => {
        const cfg = ACTION_LABELS[r.action];
        const isLast = i === records.length - 1;
        return (
          <div key={r.id} className="flex gap-3">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center w-5 shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full border-2 mt-1 shrink-0"
                style={{
                  borderColor: i === 0 ? "hsl(var(--primary))" : "hsl(var(--border))",
                  background: i === 0 ? "hsl(var(--primary) / 0.15)" : "hsl(var(--card))",
                }}
              />
              {!isLast && (
                <div className="w-px flex-1 min-h-[32px]" style={{ background: "hsl(var(--border))" }} />
              )}
            </div>
            {/* Content */}
            <div className={`pb-5 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={cfg.className}>{cfg.label}</span>
                <span className="text-[12px] text-muted-foreground">{r.time}</span>
              </div>
              <div className="text-[13px] text-foreground">
                操作人：<span className="font-medium">{r.operator}</span>
              </div>
              {r.remark && (
                <div className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                  备注：{r.remark}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
