import { useState, useEffect, useMemo } from "react";
import { X, AlertCircle } from "lucide-react";

interface SetAdminDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { adminName: string; adminPhone: string; status: "active" | "inactive" }) => void;
  enterpriseName?: string;
  /** 编辑模式：带入已有管理员姓名 */
  defaultAdminName?: string;
  /** 编辑模式：带入已有管理员手机号 */
  defaultAdminPhone?: string;
  /** 编辑模式：带入企业当前状态 */
  defaultStatus?: "active" | "inactive";
  /** 已被其它企业绑定的管理员手机号集合（不含本企业当前手机号）；用于唯一性校验 */
  existingAdminPhones?: string[];
}

export function SetAdminDialog({
  open,
  onClose,
  onConfirm,
  enterpriseName,
  defaultAdminName = "",
  defaultAdminPhone = "",
  defaultStatus = "inactive",
  existingAdminPhones = [],
}: SetAdminDialogProps) {
  const [adminName, setAdminName] = useState(defaultAdminName);
  const [adminPhone, setAdminPhone] = useState(defaultAdminPhone);
  const [status, setStatus] = useState<"active" | "inactive">(defaultStatus);

  useEffect(() => {
    if (open) {
      setAdminName(defaultAdminName);
      setAdminPhone(defaultAdminPhone);
      setStatus(defaultStatus);
    }
  }, [open, defaultAdminName, defaultAdminPhone, defaultStatus]);

  const phoneTrim = adminPhone.trim();
  const isDuplicate = useMemo(
    () => phoneTrim.length > 0 && existingAdminPhones.includes(phoneTrim),
    [phoneTrim, existingAdminPhones]
  );

  if (!open) return null;

  const canSubmit = adminName.trim() && phoneTrim && !isDuplicate;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({ adminName: adminName.trim(), adminPhone: phoneTrim, status });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full max-w-[520px] rounded-xl border bg-card overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ background: "hsl(var(--muted) / 0.4)" }}>
          <h3 className="text-[15px] font-semibold text-foreground">设置管理员</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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

          <div className="flex items-start gap-3">
            <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right pt-2">
              <span className="text-destructive mr-0.5">*</span>
              管理员手机：
            </label>
            <div className="flex-1">
              <input
                className={`filter-input w-full ${isDuplicate ? "border-destructive focus:ring-destructive/30" : ""}`}
                placeholder="请输入"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                maxLength={11}
              />
              {isDuplicate && (
                <div className="mt-1.5 flex items-center gap-1 text-[12px] text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  该手机号已绑定为其它企业的管理员，不可重复绑定
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground w-[100px] shrink-0 text-right">企业状态：</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setStatus("inactive")}>
                <div className={`w-4 h-4 rounded-full border-2 transition-colors ${status === "inactive" ? "border-[5px] border-foreground" : "border-border"}`} />
                <span className="text-[13px] text-foreground">停用</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer" onClick={() => setStatus("active")}>
                <div className={`w-4 h-4 rounded-full border-2 transition-colors ${status === "active" ? "border-[5px] border-foreground" : "border-border"}`} />
                <span className="text-[13px] text-foreground">启用</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 px-5 py-4 border-t">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
