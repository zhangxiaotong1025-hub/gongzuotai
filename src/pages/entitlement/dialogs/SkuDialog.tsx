import { useMemo, useState, useEffect } from "react";
import { Plus, X, Check, ChevronRight, AlertCircle, Sparkles, Package, Tag, Coins, Inbox } from "lucide-react";
import { toast } from "sonner";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import {
  appData, capabilityData, BILLING_CYCLES,
  productData, skuData, getProductsByApp, getCapability, getRule, getApp,
  type Sku, type BillingCycle, type Product, type EntitlementRule,
} from "@/data/entitlement";

/* ── 二级弹窗：权益产品选择器（仅显示「付费售卖」类型） ── */
function ProductPickerDialog({ open, onClose, onConfirm, appId, selectedIds }: {
  open: boolean; onClose: () => void; onConfirm: (ids: string[]) => void;
  appId: string; selectedIds: string[];
}) {
  const [localIds, setLocalIds] = useState<string[]>(selectedIds);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [view, setView] = useState<"all" | "selected">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (open) { setLocalIds(selectedIds); setFilters({}); setView("all"); setPage(1); }
  }, [open, selectedIds]);

  const allProducts = useMemo(
    () => getProductsByApp(appId).filter((p) => p.exchangeType === "paid" && p.status === "active"),
    [appId]
  );

  const productMeta = useMemo(() => {
    const map = new Map<string, { capIds: string[]; skuCount: number }>();
    for (const p of allProducts) {
      const caps = new Set<string>();
      for (const rid of p.ruleIds) { const r = getRule(rid); if (r) caps.add(r.capabilityId); }
      const skuCount = skuData.filter((s) => (s.productIds || []).includes(p.id)).length;
      map.set(p.id, { capIds: [...caps], skuCount });
    }
    return map;
  }, [allProducts]);

  const involvedCaps = useMemo(
    () => capabilityData.filter((c) => allProducts.some((p) => productMeta.get(p.id)?.capIds.includes(c.id))),
    [allProducts, productMeta]
  );

  const filterFields: FilterField[] = [
    { key: "keyword", label: "产品名称/编码", type: "input", placeholder: "请输入关键字", width: 220 },
    { key: "capId",   label: "所属能力",     type: "select", options: involvedCaps.map((c) => ({ label: c.name, value: c.id })), width: 180 },
    { key: "usage",   label: "关联状态",     type: "select", options: [
      { label: "已被其它商品引用", value: "used" },
      { label: "尚未被引用",       value: "unused" },
    ], width: 180 },
  ];

  const filtered = useMemo(() => {
    const base = view === "selected" ? allProducts.filter((p) => localIds.includes(p.id)) : allProducts;
    return base.filter((p) => {
      const meta = productMeta.get(p.id);
      if (filters.keyword?.trim()) {
        const q = filters.keyword.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
      }
      if (filters.capId && !meta?.capIds.includes(filters.capId)) return false;
      if (filters.usage === "used" && (meta?.skuCount ?? 0) === 0) return false;
      if (filters.usage === "unused" && (meta?.skuCount ?? 0) > 0) return false;
      return true;
    });
  }, [allProducts, view, localIds, filters, productMeta]);

  const pagedList = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allSelectedOnPage = pagedList.length > 0 && pagedList.every((p) => localIds.includes(p.id));

  const togglePage = () => {
    const ids = pagedList.map((p) => p.id);
    setLocalIds((prev) => allSelectedOnPage ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };
  const toggle = (id: string) => setLocalIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-[960px] h-[82vh] rounded-xl border bg-card flex flex-col animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="border-b bg-muted/40 px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <h3 className="text-[15px] font-semibold text-foreground">选择权益产品</h3>
              <span className="badge-active">付费售卖</span>
            </div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              当前应用「付费售卖」启用产品共 {allProducts.length} 个 · 已选 <span className="text-primary font-medium">{localIds.length}</span> 个
              <span className="ml-2 text-muted-foreground/70">（积分兑换、免费发放产品不会出现在此处）</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 pt-2 border-b bg-card shrink-0 space-y-3 pb-3">
          <div className="flex items-center gap-1 border-b -mx-6 px-6">
            {[{ k: "all", l: `全部 (${allProducts.length})` }, { k: "selected", l: `已选 (${localIds.length})` }].map((t) => (
              <button key={t.k} onClick={() => { setView(t.k as typeof view); setPage(1); }}
                className={`px-3 py-2 text-[13px] -mb-px border-b-2 transition-colors ${view === t.k ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t.l}
              </button>
            ))}
          </div>
          <FilterBar
            fields={filterFields}
            values={filters}
            onChange={(k, v) => { setFilters((p) => ({ ...p, [k]: v })); setPage(1); }}
            onSearch={() => {}}
            onReset={() => { setFilters({}); setPage(1); }}
            maxVisible={3}
          />
        </div>

        <div className="flex-1 overflow-auto bg-muted/10">
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur border-b">
              <tr className="text-left text-muted-foreground">
                <th className="py-2.5 pl-6 pr-2 w-10">
                  <button onClick={togglePage} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${allSelectedOnPage ? "bg-primary border-primary" : "border-border hover:border-primary/60"}`}>
                    {allSelectedOnPage && <Check className="h-3 w-3 text-primary-foreground" />}
                  </button>
                </th>
                <th className="py-2.5 px-2 font-medium">产品名称 / 编码</th>
                <th className="py-2.5 px-2 font-medium w-[180px]">能力</th>
                <th className="py-2.5 px-2 font-medium w-[80px] text-right">规则数</th>
                <th className="py-2.5 px-2 font-medium w-[110px] text-right">已被引用</th>
                <th className="py-2.5 px-2 pr-6 font-medium">描述</th>
              </tr>
            </thead>
            <tbody>
              {pagedList.length === 0 && (
                <tr><td colSpan={6} className="py-20 text-center">
                  <Inbox className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">
                    {allProducts.length === 0 ? "当前应用下暂无「付费售卖」启用产品，请先创建" : view === "selected" ? "尚未选择任何产品" : "没有匹配的产品"}
                  </p>
                </td></tr>
              )}
              {pagedList.map((p) => {
                const selected = localIds.includes(p.id);
                const meta = productMeta.get(p.id);
                const capNames = (meta?.capIds || []).map((cid) => getCapability(cid)?.name).filter(Boolean) as string[];
                return (
                  <tr key={p.id} onClick={() => toggle(p.id)}
                    className={`border-b cursor-pointer transition-colors ${selected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"}`}>
                    <td className="py-2.5 pl-6 pr-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected ? "bg-primary border-primary" : "border-border"}`}>
                        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 min-w-[220px]">
                      <div className={`font-medium truncate ${selected ? "text-primary" : "text-foreground"}`}>{p.name}</div>
                      <code className="text-[11px] text-muted-foreground font-mono">{p.code}</code>
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex flex-wrap gap-1">
                        {capNames.slice(0, 2).map((n) => <span key={n} className="badge-info">{n}</span>)}
                        {capNames.length > 2 && <span className="text-[11px] text-muted-foreground" title={capNames.join("、")}>+{capNames.length - 2}</span>}
                        {capNames.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-foreground font-medium">{p.ruleIds.length}</td>
                    <td className="py-2.5 px-2 text-right">
                      {(meta?.skuCount ?? 0) > 0
                        ? <span className="text-foreground">{meta!.skuCount} 个 SKU</span>
                        : <span className="text-muted-foreground">未引用</span>}
                    </td>
                    <td className="py-2.5 px-2 pr-6 text-muted-foreground max-w-[260px]">
                      <div className="truncate" title={p.description}>{p.description || "—"}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="border-t shrink-0 bg-card">
            <Pagination current={page} total={filtered.length} pageSize={pageSize}
              onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </div>
        )}

        <div className="border-t px-6 py-3 flex items-center justify-between shrink-0 bg-card">
          <div className="text-[12px] text-muted-foreground">
            {localIds.length > 0
              ? <button className="text-destructive hover:underline" onClick={() => setLocalIds([])}>清空已选</button>
              : <span>勾选多个权益产品打包到当前商品中，规则将自动按能力维度去重合并</span>}
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

/* ── 主弹窗：商品 SKU 创建/编辑 ── */
export function SkuDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: Record<string, unknown>) => void; initial?: Sku | null }) {
  const initApp = initial?.appId ?? appData[0]?.id ?? "";
  const [form, setForm] = useState({
    name: initial?.name || "",
    code: initial?.code || "",
    appId: initApp,
    productIds: initial?.productIds || [],
    price: initial?.price ?? 0,
    billingCycle: (initial?.billingCycle || "once") as BillingCycle,
    sortOrder: initial?.sortOrder ?? 1,
    description: initial?.description || "",
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const isEdit = Boolean(initial);
  const app = getApp(form.appId);

  const suggestedCode = useMemo(() => {
    if (!app || isEdit || !form.name.trim()) return "";
    return `SKU_${app.code}_${Date.now().toString().slice(-4)}`;
  }, [app, form.name, isEdit]);

  // 选中的产品 + 推导的规则集（去重）
  const selectedProducts = useMemo(
    () => form.productIds.map((pid) => productData.find((p) => p.id === pid)).filter(Boolean) as Product[],
    [form.productIds]
  );
  const derivedRuleIds = useMemo(() => {
    const set = new Set<string>();
    for (const p of selectedProducts) p.ruleIds.forEach((rid) => set.add(rid));
    return [...set];
  }, [selectedProducts]);
  const derivedRulesByCap = useMemo(() => {
    const map = new Map<string, { capName: string; rules: EntitlementRule[] }>();
    for (const rid of derivedRuleIds) {
      const r = getRule(rid); if (!r) continue;
      const cap = getCapability(r.capabilityId);
      const key = cap?.id || "unknown";
      if (!map.has(key)) map.set(key, { capName: cap?.name || "未知能力", rules: [] });
      map.get(key)!.rules.push(r);
    }
    return [...map.values()];
  }, [derivedRuleIds]);

  const errors: string[] = [];
  if (!form.name.trim()) errors.push("商品名称");
  if (!form.code.trim()) errors.push("商品编码");
  if (form.productIds.length === 0) errors.push("关联权益产品");
  if (form.price < 0) errors.push("价格不能为负");

  const handleSubmit = () => {
    setTouched(true);
    if (errors.length > 0) { toast.error(`请完善：${errors.join("、")}`); return; }
    onSave({ ...form, ruleIds: derivedRuleIds });
  };

  if (!open) return null;

  const removeProduct = (pid: string) => setForm((prev) => ({ ...prev, productIds: prev.productIds.filter((id) => id !== pid) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[760px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[88vh]" style={{ boxShadow: "var(--shadow-lg)" }}>
        {/* Header */}
        <div className="border-b bg-muted/40 px-6 py-4 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5"><Tag className="h-4 w-4 text-primary" /></div>
            <div>
              <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑商品" : "新建商品 SKU"}</h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">商品 SKU 是面向用户的可售卖单元，通过组合 1 个或多个「付费售卖」类权益产品形成销售方案</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Section 1: 基本信息 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-sm bg-primary" />
              <h4 className="text-[13px] font-semibold text-foreground">基本信息</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground">商品名称 <span className="text-destructive">*</span></label>
                <input className={`filter-input w-full ${touched && !form.name.trim() ? "ring-1 ring-destructive/50" : ""}`} placeholder="如：旗舰会员年卡" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] text-muted-foreground">商品编码 <span className="text-destructive">*</span></label>
                  {suggestedCode && form.code !== suggestedCode && !isEdit && (
                    <button type="button" onClick={() => setForm({ ...form, code: suggestedCode })} className="inline-flex items-center gap-0.5 text-[11px] text-primary hover:underline">
                      <Sparkles className="h-3 w-3" />使用建议
                    </button>
                  )}
                </div>
                <input className={`filter-input w-full font-mono ${touched && !form.code.trim() ? "ring-1 ring-destructive/50" : ""}`} placeholder={suggestedCode || "SKU_开头"} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value, productIds: [] })} disabled={isEdit}>
                {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {!isEdit && <p className="text-[11px] text-muted-foreground/80">切换应用将清空已选权益产品</p>}
            </div>
          </section>

          {/* Section 2: 关联权益产品 */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-sm bg-primary" />
                <h4 className="text-[13px] font-semibold text-foreground">关联权益产品 <span className="text-destructive">*</span></h4>
                <span className="text-[11px] text-muted-foreground">仅可选择「付费售卖」类型</span>
              </div>
              <button type="button" className="inline-flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors" onClick={() => setPickerOpen(true)}>
                <Plus className="h-3 w-3" />
                {form.productIds.length > 0 ? "修改选择" : "选择权益产品"}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            {form.productIds.length === 0 ? (
              <div className={`border border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all ${touched && form.productIds.length === 0 ? "border-destructive/50 bg-destructive/5" : ""}`} onClick={() => setPickerOpen(true)}>
                <Package className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[13px] text-foreground">点击选择权益产品</p>
                <p className="text-[11px] text-muted-foreground mt-1">支持按「能力 / 限领 / 关键字」多维筛选，仅展示当前应用「付费售卖」启用产品</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedProducts.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border bg-primary/5 border-primary/20">
                    <Package className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-foreground truncate">{p.name}</span>
                        <code className="text-[11px] text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-muted">{p.code}</code>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.ruleIds.length} 条规则{(p.limitPerUser ?? 0) > 0 ? ` · 限领${p.limitPerUser}` : ""}</p>
                    </div>
                    <button onClick={() => removeProduct(p.id)} className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}

                {/* 推导规则预览 */}
                {derivedRulesByCap.length > 0 && (
                  <div className="rounded-lg border bg-muted/30 px-3.5 py-2.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                      <span className="text-[12px] font-medium text-foreground">自动汇总权益规则</span>
                      <span className="text-[11px] text-muted-foreground">共 {derivedRuleIds.length} 条 · 系统按能力维度去重合并</span>
                    </div>
                    <div className="space-y-1">
                      {derivedRulesByCap.map((g) => (
                        <div key={g.capName} className="flex items-start gap-2 text-[11px]">
                          <span className="text-muted-foreground shrink-0 min-w-[64px]">{g.capName}</span>
                          <span className="text-foreground/80">{g.rules.map((r) => r.name).join("、")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section 3: 售卖配置 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-sm bg-primary" />
              <h4 className="text-[13px] font-semibold text-foreground">售卖配置</h4>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] text-muted-foreground inline-flex items-center gap-1"><Coins className="h-3 w-3" />价格（元）</label>
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
              <label className="text-[13px] text-muted-foreground">商品描述</label>
              <textarea className="filter-input w-full min-h-[60px] resize-y" placeholder="对外展示的商品卖点说明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </section>
        </div>

        {touched && errors.length > 0 && (
          <div className="px-6 py-2 bg-destructive/5 border-t border-destructive/20 flex items-center gap-2 text-[12px] text-destructive shrink-0">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" /> 请完善：{errors.join("、")}
          </div>
        )}
        <div className="flex gap-3 px-6 py-3.5 border-t shrink-0 bg-card">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" onClick={handleSubmit}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={(ids) => { setForm((prev) => ({ ...prev, productIds: ids })); setPickerOpen(false); }}
        appId={form.appId}
        selectedIds={form.productIds}
      />
    </div>
  );
}
