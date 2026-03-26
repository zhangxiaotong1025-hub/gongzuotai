import { useState } from "react";
import { X, Check } from "lucide-react";
import { appData, skuData, getSkusByApp, BILLING_CYCLES, type Bundle, type BillingCycle } from "@/data/entitlement";

export function BundleDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Bundle | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id, appName: initial?.appName || appData[0]?.name,
    price: initial?.price ?? 0, originalPrice: initial?.originalPrice || undefined as number | undefined,
    billingCycle: (initial?.billingCycle || "monthly") as BillingCycle,
    sortOrder: initial?.sortOrder ?? 1, description: initial?.description || "",
    selectedSkuIds: initial?.items.map((i) => i.skuId) || [] as string[],
    quantities: Object.fromEntries(initial?.items.map((i) => [i.skuId, i.quantity]) || []) as Record<string, number>,
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const availableSkus = getSkusByApp(form.appId).filter((s) => s.salesStatus === "on_sale");

  const toggleSku = (skuId: string) => {
    setForm((prev) => {
      const ids = prev.selectedSkuIds.includes(skuId) ? prev.selectedSkuIds.filter((id) => id !== skuId) : [...prev.selectedSkuIds, skuId];
      const q = { ...prev.quantities };
      if (!q[skuId]) q[skuId] = 1;
      return { ...prev, selectedSkuIds: ids, quantities: q };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑套餐" : "新建套餐"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">组合多个商品SKU形成会员套餐</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">套餐名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">套餐编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => {
              const app = appData.find((a) => a.id === e.target.value);
              setForm({ ...form, appId: e.target.value, appName: app?.name || "", selectedSkuIds: [], quantities: {} });
            }}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">套餐价格（元）</label>
              <input type="number" className="filter-input w-full" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">原价</label>
              <input type="number" className="filter-input w-full" value={form.originalPrice ?? ""} onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计费周期</label>
              <select className="filter-input w-full" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                {BILLING_CYCLES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">包含商品 <span className="text-destructive">*</span> <span className="text-[11px]">（已选{form.selectedSkuIds.length}个）</span></label>
            <div className="border rounded-lg p-2 max-h-[220px] overflow-y-auto space-y-0.5">
              {availableSkus.map((s) => (
                <div key={s.id} className={`flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all ${form.selectedSkuIds.includes(s.id) ? "bg-primary/10" : "hover:bg-muted/60"}`}>
                  <button onClick={() => toggleSku(s.id)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${form.selectedSkuIds.includes(s.id) ? "bg-primary border-primary" : "border-border"}`}>
                    {form.selectedSkuIds.includes(s.id) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </button>
                  <span className={`flex-1 ${form.selectedSkuIds.includes(s.id) ? "text-primary font-medium" : "text-foreground"}`}>{s.name}</span>
                  <span className="text-[11px] text-muted-foreground">{(s.ruleIds || []).length}条规则</span>
                  {form.selectedSkuIds.includes(s.id) && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-muted-foreground">×</span>
                      <input type="number" min={1} className="filter-input w-12 text-center text-[12px] py-0.5" value={form.quantities[s.id] || 1} onChange={(e) => setForm({ ...form, quantities: { ...form.quantities, [s.id]: Math.max(1, Number(e.target.value)) } })} />
                    </div>
                  )}
                </div>
              ))}
              {availableSkus.length === 0 && <p className="text-[13px] text-muted-foreground text-center py-4">该应用下暂无上架商品</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim() || form.selectedSkuIds.length === 0} onClick={() => {
            const items = form.selectedSkuIds.map((skuId) => {
              const s = skuData.find((s) => s.id === skuId);
              return { skuId, skuName: s?.name || "", quantity: form.quantities[skuId] || 1 };
            });
            onSave({ ...form, items });
          }}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}
