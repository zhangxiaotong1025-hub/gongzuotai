import { useState } from "react";
import { X } from "lucide-react";

interface SetAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { adminName: string; adminPhone: string; status: "active" | "inactive" }) => void;
  enterpriseName?: string;
}

export function SetAdminDialog({ open, onClose, onConfirm, enterpriseName }: SetAdminDialogProps) {
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm({ adminName, adminPhone, status });
    setAdminName("");
    setAdminPhone("");
    setStatus("inactive");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Dialog */}
      <div
        className="relative w-full max-w-[520px] rounded-xl border bg-card overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h3 className="text-base font-semibold text-foreground">设置管理员</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {enterpriseName && (
            <div className="flex items-center gap-3">
              <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">所属企业：</label>
              <span className="text-[13px] text-foreground font-medium">{enterpriseName}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">
              <span className="text-destructive mr-0.5">*</span>
              企业管理员：
            </label>
            <input
              className="filter-input flex-1"
              placeholder="请输入"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">
              <span className="text-destructive mr-0.5">*</span>
              管理员手机号：
            </label>
            <input
              className="filter-input flex-1"
              placeholder="请输入"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              maxLength={11}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">企业状态：</label>
            <div className="flex items-center gap-4">
              <label
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => setStatus("inactive")}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    status === "inactive" ? "border-[5px] border-foreground" : "border-border"
                  }`}
                />
                <span className="text-[13px] text-foreground">停用</span>
              </label>
              <label
                className="flex items-center gap-1.5 cursor-pointer"
                onClick={() => setStatus("active")}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    status === "active" ? "border-[5px] border-foreground" : "border-border"
                  }`}
                />
                <span className="text-[13px] text-foreground">启用</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 px-6 py-5 border-t">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={handleConfirm}
            disabled={!adminName.trim() || !adminPhone.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
