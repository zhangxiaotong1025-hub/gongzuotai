import { useState } from "react";
import { X } from "lucide-react";
import { appData, type AppItem } from "@/data/entitlement";

export function AppDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: AppItem | null }) {
  const [form, setForm] = useState({ name: initial?.name || "", code: initial?.code || "", description: initial?.description || "" });
  const isEdit = Boolean(initial);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑应用" : "新建应用"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义平台的应用产品，用于隔离不同产品线的商业模型</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">应用名称 <span className="text-destructive">*</span></label>
            <input className="filter-input w-full" placeholder="如：居然设计家" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">应用编码 <span className="text-destructive">*</span></label>
            <input className="filter-input w-full font-mono" placeholder="如：JURAN_DESIGN" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            {isEdit && <p className="text-[11px] text-muted-foreground/70">编码创建后不可修改</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">应用描述</label>
            <textarea className="filter-input w-full min-h-[60px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim()} onClick={() => onSave(form)}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}
