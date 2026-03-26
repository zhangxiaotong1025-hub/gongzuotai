import { useState } from "react";
import { Plus, X, Check, Search, ChevronRight, Trash2 } from "lucide-react";
import { appData, capabilityData, BILLING_CYCLES, type Sku, type BillingCycle, type EntitlementRule, getCapability, getRulesByApp, getRule } from "@/data/entitlement";

/* ── 二级弹窗：规则选择器 ── */
function RulePickerDialog({ open, onClose, onConfirm, appId, selectedIds }: {
  open: boolean; onClose: () => void; onConfirm: (ids: string[]) => void;
  appId: string; selectedIds: string[];
}) {
  const [localIds, setLocalIds] = useState<string[]>(selectedIds);
  const [search, setSearch] = useState("");
  const [activeCapFilter, setActiveCapFilter] = useState<string>("all");

  useState(() => { setLocalIds(selectedIds); });

  if (!open) return null;

  const allRules = getRulesByApp(appId).filter((r) => r.status === "active");

  const capGroups = allRules.reduce((acc, rule) => {
    const cap = getCapability(rule.capabilityId);
    const key = cap?.id || "unknown";
    if (!acc[key]) acc[key] = { cap, rules: [] };
    acc[key].rules.push(rule);
    return acc;
  }, {} as Record<string, { cap: typeof capabilityData[0] | undefined; rules: EntitlementRule[] }>);

  const capList = Object.entries(capGroups);

  const filteredGroups = capList
    .filter(([capId]) => activeCapFilter === "all" || capId === activeCapFilter)
    .map(([capId, group]) => ({
      capId,
      ...group,
      rules: group.rules.filter((r) =>
        !search.trim() || r.name.toLowerCase().includes(search.toLowerCase()) || r.code.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.rules.length > 0);

  const toggleRule = (id: string) => {
    setLocalIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleCapGroup = (rules: EntitlementRule[]) => {
    const ids = rules.map((r) => r.id);
    const allSelected = ids.every((id) => localIds.includes(id));
    if (allSelected) {
      setLocalIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setLocalIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[780px] h-[75vh] rounded-xl border bg-card flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">选择权益规则</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              已选 <span className="text-primary font-medium">{localIds.length}</span> 条规则，共 {allRules.length} 条可选
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-5 py-3 border-b flex items-center gap-3 shrink-0">
          <div className="relative flex-1 max-w-[280px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input className="filter-input w-full pl-8" placeholder="搜索规则名称或编码…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <button onClick={() => setActiveCapFilter("all")} className={`px-2.5 py-1 rounded-md text-[12px] transition-colors ${activeCapFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>全部</button>
            {capList.map(([capId, { cap }]) => (
              <button key={capId} onClick={() => setActiveCapFilter(capId)} className={`px-2.5 py-1 rounded-md text-[12px] transition-colors ${activeCapFilter === capId ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                {cap?.name || "未知"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {filteredGroups.map(({ capId, cap, rules }) => (
            <div key={capId}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-foreground">{cap?.name || "未知能力"}</span>
                  <span className="text-[11px] text-muted-foreground">{cap?.unit}</span>
                </div>
                <button className="text-[11px] text-primary hover:underline" onClick={() => toggleCapGroup(rules)}>
                  {rules.every((r) => localIds.includes(r.id)) ? "取消全选" : "全选"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {rules.map((r) => {
                  const selected = localIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => toggleRule(r.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] cursor-pointer transition-all ${selected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted/60"}`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selected ? "bg-primary border-primary" : "border-border"}`}>
                        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`block truncate ${selected ? "text-primary font-medium" : "text-foreground"}`}>{r.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {r.quota}{cap?.unit}{r.periodType !== "PERMANENT" ? `/${r.periodType === "DAY" ? "日" : r.periodType === "MONTH" ? "月" : "年"}` : "/永久"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredGroups.length === 0 && (
            <div className="text-center py-10 text-[13px] text-muted-foreground">
              {search ? "没有匹配的规则" : "该应用下暂无启用的权益规则"}
            </div>
          )}
        </div>

        <div className="border-t px-5 py-3 flex items-center justify-between shrink-0">
          <div className="text-[13px] text-muted-foreground">
            {localIds.length > 0 && (
              <button className="text-destructive hover:underline" onClick={() => setLocalIds([])}>清空选择</button>
            )}
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={onClose}>取消</button>
            <button className="btn-primary" onClick={() => onConfirm(localIds)}>确认选择 ({localIds.length})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 主弹窗：SKU 创建/编辑 ── */
export function SkuDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Sku | null }) {
  const initApp = initial ? initial.appId : appData[0]?.id;
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initApp,
    ruleIds: initial?.ruleIds || [] as string[],
    price: initial?.price ?? 0, billingCycle: (initial?.billingCycle || "once") as BillingCycle,
    sortOrder: initial?.sortOrder ?? 1, description: initial?.description || "",
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const isEdit = Boolean(initial);
  if (!open) return null;

  const selectedRules = form.ruleIds.map((rid) => getRule(rid)).filter(Boolean) as EntitlementRule[];

  const selectedByCapability = selectedRules.reduce((acc, r) => {
    const cap = getCapability(r.capabilityId);
    const key = cap?.name || "未知";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {} as Record<string, EntitlementRule[]>);

  const removeRule = (ruleId: string) => {
    setForm((prev) => ({ ...prev, ruleIds: prev.ruleIds.filter((id) => id !== ruleId) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[580px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑商品" : "新建商品"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">商品SKU是可售卖的最小单元，可关联多条权益规则</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">商品名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">商品编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value, ruleIds: [] })}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] text-muted-foreground">关联权益规则 <span className="text-destructive">*</span></label>
              <button className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors" onClick={() => setPickerOpen(true)}>
                <Plus className="h-3 w-3" />
                {form.ruleIds.length > 0 ? "修改选择" : "选择规则"}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {form.ruleIds.length === 0 ? (
              <div className="border border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all" onClick={() => setPickerOpen(true)}>
                <p className="text-[13px] text-muted-foreground">点击选择权益规则</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1">支持按能力分组筛选、搜索、批量勾选</p>
              </div>
            ) : (
              <div className="border rounded-lg p-3 space-y-2 max-h-[180px] overflow-y-auto">
                {Object.entries(selectedByCapability).map(([capName, rules]) => (
                  <div key={capName}>
                    <div className="text-[11px] text-muted-foreground mb-1">{capName}</div>
                    <div className="flex flex-wrap gap-1">
                      {rules.map((r) => (
                        <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] bg-primary/10 text-primary">
                          {r.name}
                          <button onClick={() => removeRule(r.id)} className="hover:text-destructive transition-colors"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-[11px] text-muted-foreground pt-1 border-t">共 {form.ruleIds.length} 条规则</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">价格（元）</label>
              <input type="number" className="filter-input w-full" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计费周期</label>
              <select className="filter-input w-full" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value as BillingCycle })}>
                {BILLING_CYCLES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">排序</label>
              <input type="number" className="filter-input w-full" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim() || form.ruleIds.length === 0} onClick={() => onSave(form)}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>

      <RulePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => { setForm((prev) => ({ ...prev, ruleIds: ids })); setPickerOpen(false); }}
        appId={form.appId}
        selectedIds={form.ruleIds}
      />
    </div>
  );
}
