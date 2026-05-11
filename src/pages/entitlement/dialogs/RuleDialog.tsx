import { useMemo, useState } from "react";
import { X, Sparkles, AlertCircle, Building2, User } from "lucide-react";
import { toast } from "sonner";
import { appData, capabilityData, DATA_TYPES, PERIOD_TYPES, QUOTA_SCOPES, type EntitlementRule, type PeriodType, type QuotaScope, getCapability, getCapabilitiesByApp, deriveRulePolicy, getRuleScope } from "@/data/entitlement";

export function RuleDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: EntitlementRule | null }) {
  const initCap = initial ? getCapability(initial.capabilityId) : null;
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initCap?.appId || appData[0]?.id,
    capabilityId: initial?.capabilityId || "",
    quota: initial?.quota ?? 100,
    periodType: (initial?.periodType || "DAY") as PeriodType,
    periodValue: initial?.periodValue ?? 1,
    quotaScope: (initial?.quotaScope || (initial ? getRuleScope(initial) : "user")) as QuotaScope,
    perUserCap: initial?.perUserCap ?? 0,
    description: initial?.description || "",
  });
  const [touched, setTouched] = useState(false);
  const isEdit = Boolean(initial);
  if (!open) return null;

  const availableCaps = getCapabilitiesByApp(form.appId).filter((c) => c.status === "active");
  const selectedCap = capabilityData.find((c) => c.id === form.capabilityId);
  const policy = deriveRulePolicy(form.periodType);
  /** 由能力 dataType 给出的建议归属（仅作引导，不强制） */
  const suggestedScope: QuotaScope | null = selectedCap
    ? (selectedCap.dataType === "BOOLEAN" || selectedCap.dataType === "STORAGE" ? "enterprise" : "user")
    : null;

  // Auto-suggest code based on capability + quota + period
  const suggestedCode = useMemo(() => {
    if (!selectedCap || isEdit) return "";
    const periodSuffix = form.periodType === "DAY" ? "DAY" : form.periodType === "MONTH" ? "MONTH" : form.periodType === "YEAR" ? "YEAR" : "PERM";
    return `RULE_${selectedCap.code}_${form.quota}_${periodSuffix}`;
  }, [selectedCap, form.quota, form.periodType, isEdit]);

  const errors: string[] = [];
  if (!form.name.trim()) errors.push("规则名称");
  if (!form.code.trim()) errors.push("规则编码");
  if (!form.capabilityId) errors.push("关联能力");
  if (form.quota <= 0) errors.push("额度数量需大于 0");
  if (!form.quotaScope) errors.push("额度归属维度");

  const handleSubmit = () => {
    setTouched(true);
    if (errors.length > 0) { toast.error(`请完善：${errors.join("、")}`); return; }
    const perUserCap = form.quotaScope === "enterprise" ? form.perUserCap : 0;
    onSave({ ...form, perUserCap, ...policy, isCumulative: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[600px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑权益规则" : "新建权益规则"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">仅需填写【能力 + 额度 + 周期】，发放与回收策略由系统统一处理</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Section 1: 基础信息 */}
          <div className="space-y-3">
            <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">基础信息</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">规则名称 <span className="text-destructive">*</span></label>
                <input className={`filter-input w-full ${touched && !form.name.trim() ? "ring-1 ring-destructive/50" : ""}`} placeholder="如：AI设计100次/日" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] text-muted-foreground">规则编码 <span className="text-destructive">*</span></label>
                  {suggestedCode && form.code !== suggestedCode && (
                    <button type="button" onClick={() => setForm({ ...form, code: suggestedCode })} className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline">
                      <Sparkles className="h-3 w-3" />使用建议
                    </button>
                  )}
                </div>
                <input className={`filter-input w-full font-mono ${touched && !form.code.trim() ? "ring-1 ring-destructive/50" : ""}`} placeholder={suggestedCode || "RULE_开头"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
              </div>
            </div>
          </div>

          {/* Section 2: 关联能力 */}
          <div className="space-y-3 pt-2 border-t">
            <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">关联能力</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
                <select className="filter-input w-full" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value, capabilityId: "" })}>
                  {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">关联能力 <span className="text-destructive">*</span></label>
                <select className={`filter-input w-full ${touched && !form.capabilityId ? "ring-1 ring-destructive/50" : ""}`} value={form.capabilityId} onChange={(e) => setForm({ ...form, capabilityId: e.target.value })}>
                  <option value="">请选择能力</option>
                  {availableCaps.map((c) => <option key={c.id} value={c.id}>{c.name}（{c.code}·{c.unit}）</option>)}
                </select>
                {availableCaps.length === 0 && <p className="text-[11px] text-destructive">该应用下暂无能力</p>}
              </div>
            </div>
            {selectedCap && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 text-[12px]">
                <span className="text-muted-foreground">能力详情：</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{DATA_TYPES.find((t) => t.value === selectedCap.dataType)?.label.split("（")[0]}</span>
                <span>单位: {selectedCap.unit}</span>
                <span>默认消耗: {selectedCap.consumePerUse}</span>
              </div>
            )}
          </div>

          {/* Section 3: 性质定义 · 额度归属维度 */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">性质定义 · 额度归属</div>
              {suggestedScope && suggestedScope !== form.quotaScope && (
                <button type="button" onClick={() => setForm({ ...form, quotaScope: suggestedScope })} className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline">
                  <Sparkles className="h-3 w-3" />按能力建议：{QUOTA_SCOPES.find(s => s.value === suggestedScope)?.label}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUOTA_SCOPES.map((s) => {
                const active = form.quotaScope === s.value;
                const Icon = s.value === "enterprise" ? Building2 : User;
                return (
                  <button type="button" key={s.value} onClick={() => setForm({ ...form, quotaScope: s.value })}
                    className={`text-left px-3 py-2.5 rounded-lg border transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-[13px] font-medium ${active ? "text-primary" : "text-foreground"}`}>{s.label}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.desc}</div>
                  </button>
                );
              })}
            </div>
            {form.quotaScope === "enterprise" && (
              <div className="grid grid-cols-2 gap-4 px-3 py-3 rounded-lg bg-muted/40">
                <div className="space-y-1.5">
                  <label className="text-[13px] text-muted-foreground">单人单周期上限（0=不限）</label>
                  <input type="number" min={0} className="filter-input w-full" value={form.perUserCap} onChange={(e) => setForm({ ...form, perUserCap: Number(e.target.value) })} />
                  <p className="text-[11px] text-muted-foreground/70">企业池可选的"反挤兑"上限，超过则该员工本周期内不可再消耗</p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: 额度与周期 */}
          <div className="space-y-3 pt-2 border-t">
            <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide">额度与周期</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">额度数量 <span className="text-destructive">*</span></label>
                <input type="number" min={1} className={`filter-input w-full ${touched && form.quota <= 0 ? "ring-1 ring-destructive/50" : ""}`} value={form.quota} onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })} />
                {selectedCap && <p className="text-[11px] text-muted-foreground/70">单位：{selectedCap.unit}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">周期类型 <span className="text-destructive">*</span></label>
                <select className="filter-input w-full" value={form.periodType} onChange={(e) => {
                  const pt = e.target.value as PeriodType;
                  setForm({ ...form, periodType: pt, periodValue: pt === "PERMANENT" ? 0 : 1 });
                }}>
                  {PERIOD_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">周期值</label>
                <input type="number" className="filter-input w-full" value={form.periodValue} onChange={(e) => setForm({ ...form, periodValue: Number(e.target.value) })} disabled={form.periodType === "PERMANENT"} />
                <p className="text-[11px] text-muted-foreground/70">永久自动为 0</p>
              </div>
            </div>
            {/* 自动派生策略提示 */}
            <div className="px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[12px] flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">系统行为：</span>
                <span className="ml-1">{policy.label}</span>
                <span className="block mt-0.5 text-[11px] text-muted-foreground/80">所有规则统一不跨周期累积；用户取消后剩余额度自动回收，已消耗不退还</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" placeholder="可填写运营备注，便于团队识别" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        {touched && errors.length > 0 && (
          <div className="px-5 py-2 bg-destructive/5 border-t border-destructive/20 flex items-center gap-2 text-[12px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> 请完善：{errors.join("、")}
          </div>
        )}
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" onClick={handleSubmit}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}
