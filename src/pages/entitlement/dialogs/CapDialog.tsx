import { useState } from "react";
import { X } from "lucide-react";
import { appData, DATA_TYPES, type Capability, type DataType } from "@/data/entitlement";

export function CapDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Capability | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id,
    dataType: (initial?.dataType || "COUNTER") as DataType,
    unit: initial?.unit || "次",
    apiPath: initial?.apiPath || "",
    consumePerUse: initial?.consumePerUse ?? 1,
    description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const handleDataTypeChange = (dt: DataType) => {
    const unitMap: Record<DataType, string> = { COUNTER: "次", BOOLEAN: "布尔", STORAGE: "MB", DURATION: "秒" };
    setForm({ ...form, dataType: dt, unit: unitMap[dt] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑能力" : "新建能力"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义最底层技术能力，只定义"做什么"</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">能力名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">能力编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" placeholder="如：AI_DESIGN" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value })}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">数据类型 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.dataType} onChange={(e) => handleDataTypeChange(e.target.value as DataType)}>
                {DATA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计量单位 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">默认消耗</label>
              <input type="number" min={1} className="filter-input w-full" value={form.consumePerUse} onChange={(e) => setForm({ ...form, consumePerUse: Math.max(1, Number(e.target.value)) })} />
              <p className="text-[11px] text-muted-foreground/70">每次调用消耗量</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">调用接口</label>
            <input className="filter-input w-full font-mono text-[12px]" placeholder="/api/ai/design" value={form.apiPath} onChange={(e) => setForm({ ...form, apiPath: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">能力描述</label>
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
