import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search, Package, Building2, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  appData, skuData, bundleData, productData, ORDER_TYPES, CUSTOMER_TYPES,
  bEnterpriseData, cUserData, orderData,
  type OrderItem, type CustomerType,
} from "@/data/entitlement";
import { ItemPickerDialog, ConstrainedDateRangePicker, getBenefitTone } from "./dialogs/OrderDialog";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-start gap-4">
      <label className="text-[13px] text-muted-foreground pt-[7px] text-right shrink-0 w-[var(--form-label-width)]">
        {required && <span className="text-destructive mr-0.5">*</span>}
        {label}
      </label>
      <div className="flex-1 min-w-0">
        {children}
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

export default function OrderCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const prefillCustomerId = searchParams.get("customerId");
  const prefillCustomerName = searchParams.get("customerName");
  const prefillCustomerType = searchParams.get("customerType") as CustomerType | null;
  const initial = useMemo(() => editId ? orderData.find((o) => o.id === editId) : null, [editId]);
  const isEdit = Boolean(initial);

  const [customerType, setCustomerType] = useState<CustomerType>(initial?.customerType || prefillCustomerType || "B");
  const [customerId, setCustomerId] = useState(initial?.customerId || prefillCustomerId || "");
  const [customerName, setCustomerName] = useState(initial?.customerName || prefillCustomerName || "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [orderType, setOrderType] = useState<string>(initial?.orderType || "internal_grant");
  const [paymentStatusVal, setPaymentStatusVal] = useState<string>(initial?.paymentStatus || "no_payment");
  const [paidAmount, setPaidAmount] = useState<string>(initial?.totalAmount ? String(initial.totalAmount) : "");
  const [remark, setRemark] = useState(initial?.remark || "");
  const [items, setItems] = useState<OrderItem[]>(initial?.items || []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (customerType === "B") {
      return bEnterpriseData.filter((e) =>
        !customerSearch || e.name.includes(customerSearch) || e.type.includes(customerSearch) || (e.parentName && e.parentName.includes(customerSearch))
      );
    }
    return cUserData.filter((u) => !customerSearch || u.name.includes(customerSearch) || u.phone.includes(customerSearch));
  }, [customerType, customerSearch]);

  const handleSelectCustomer = (id: string, name: string) => {
    setCustomerId(id);
    setCustomerName(name);
    setCustomerDropdownOpen(false);
    setCustomerSearch("");
  };

  const handleChangeCustomerType = (type: CustomerType) => {
    setCustomerType(type);
    setCustomerId("");
    setCustomerName("");
    setCustomerSearch("");
  };

  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof OrderItem, value: unknown) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));

  const selectedEnterprise = useMemo(() => {
    if (customerType !== "B" || !customerId) return null;
    return bEnterpriseData.find((e) => e.id === customerId) || null;
  }, [customerType, customerId]);
  const enterpriseExpireDate = selectedEnterprise?.expireDate;
  const isBOrder = customerType === "B" && !!selectedEnterprise;

  const selectedAppIds = new Set<string>();
  items.forEach((item) => {
    const aId = item.type === "sku" ? skuData.find((s) => s.id === item.itemId)?.appId
      : item.type === "product" ? productData.find((p) => p.id === item.itemId)?.appId
      : bundleData.find((b) => b.id === item.itemId)?.appId;
    if (aId) selectedAppIds.add(aId);
  });
  const selectedApps = appData.filter((a) => selectedAppIds.has(a.id));

  const appDateRange = useMemo(() => {
    const map: Record<string, string> = {};
    items.forEach((it) => {
      const aId = it.type === "sku" ? skuData.find((s) => s.id === it.itemId)?.appId
        : it.type === "product" ? productData.find((p) => p.id === it.itemId)?.appId
        : bundleData.find((b) => b.id === it.itemId)?.appId;
      if (aId && !map[aId] && it.dateRange) map[aId] = it.dateRange;
    });
    return map;
  }, [items]);

  const updateAppDateRange = (_appId: string, range: string, indices: number[]) =>
    setItems((prev) => prev.map((it, i) => (indices.includes(i) ? { ...it, dateRange: range } : it)));

  useEffect(() => {
    setItems((prev) => prev.map((it) => {
      const fallbackEnd = enterpriseExpireDate || "2028-12-31";
      const dr = it.dateRange || `2026-01-01 ~ ${fallbackEnd}`;
      const [s, e] = dr.split("~").map((x) => x.trim());
      const clampedEnd = isBOrder && enterpriseExpireDate && e && e > enterpriseExpireDate
        ? enterpriseExpireDate
        : (e || fallbackEnd);
      return {
        ...it,
        ...(isBOrder ? { applyMode: it.applyMode || "指定人员", applyCount: it.applyCount ?? 10 } : {}),
        dateRange: `${s} ~ ${clampedEnd}`,
      };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, isBOrder, enterpriseExpireDate, items.length]);

  const handleSubmit = () => {
    if (!customerId) { toast.error("请选择" + (customerType === "B" ? "企业" : "用户")); return; }
    if (items.length === 0) { toast.error("请至少选择一项权益商品/套餐"); return; }
    toast.success(isEdit ? "订单已更新" : "订单已创建");
    navigate("/entitlement/order");
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Breadcrumb */}
      <div className="flex items-baseline gap-2">
        <span className="text-[13px] text-muted-foreground cursor-pointer hover:text-primary transition-colors" onClick={() => navigate("/entitlement/order")}>
          订单管理
        </span>
        <span className="text-muted-foreground/30 text-xs">/</span>
        <h1 className="text-[14px] text-foreground font-semibold tracking-tight">
          {isEdit ? "编辑订单" : "创建内部订单"}
        </h1>
      </div>

      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
        <div className="p-6">
          <div className="max-w-[860px] mx-auto space-y-5">
            <FormRow label="账户类型" required>
              <div className="flex gap-1 bg-muted rounded-lg p-0.5 max-w-[420px]">
                {CUSTOMER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleChangeCustomerType(t.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-md transition-colors ${
                      customerType === t.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.value === "B" ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </FormRow>

            <FormRow label="订单类型">
              <div className="max-w-[420px]">
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </FormRow>

            <FormRow label={customerType === "B" ? "选择企业" : "选择用户"} required>
              <div className="relative">
                {customerId ? (
                  <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-muted/30">
                    <div className="flex items-center gap-2 text-[13px] min-w-0">
                      {customerType === "B" ? <Building2 className="h-3.5 w-3.5 text-primary shrink-0" /> : <User className="h-3.5 w-3.5 text-primary shrink-0" />}
                      <span className="font-medium truncate">{customerName}</span>
                      {customerType === "B" && (() => {
                        const ent = bEnterpriseData.find((e) => e.id === customerId);
                        if (!ent) return null;
                        return (
                          <>
                            <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{ent.type}</span>
                            {ent.parentName && <span className="text-[10px] text-muted-foreground shrink-0">← {ent.parentName}</span>}
                          </>
                        );
                      })()}
                      {customerType === "C" && (() => {
                        const user = cUserData.find((u) => u.id === customerId);
                        return user ? <span className="text-[11px] text-muted-foreground">{user.phone}</span> : null;
                      })()}
                    </div>
                    <button onClick={() => { setCustomerId(""); setCustomerName(""); }} className="text-muted-foreground hover:text-destructive shrink-0">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={customerSearch}
                        onChange={(e) => { setCustomerSearch(e.target.value); setCustomerDropdownOpen(true); }}
                        onFocus={() => setCustomerDropdownOpen(true)}
                        placeholder={customerType === "B" ? "搜索企业名称..." : "搜索用户名/手机号..."}
                        className="pl-8 text-[13px]"
                      />
                    </div>
                    {customerDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-[260px] overflow-y-auto">
                        {filteredCustomers.length > 0 ? (
                          customerType === "B" ? (
                            (filteredCustomers as typeof bEnterpriseData).map((ent) => (
                              <button
                                key={ent.id}
                                onClick={() => handleSelectCustomer(ent.id, ent.name)}
                                className="w-full flex items-center gap-2 py-2 text-[13px] hover:bg-muted/60 transition-colors text-left"
                                style={{ paddingLeft: `${12 + ent.level * 16}px`, paddingRight: 12 }}
                              >
                                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate flex-1">{ent.name}</span>
                                <span className="text-[11px] text-muted-foreground shrink-0">{ent.type}</span>
                                {ent.parentName && <span className="text-[10px] text-muted-foreground/60 shrink-0 max-w-[120px] truncate">← {ent.parentName}</span>}
                              </button>
                            ))
                          ) : (
                            (filteredCustomers as typeof cUserData).map((user) => (
                              <button
                                key={user.id}
                                onClick={() => handleSelectCustomer(user.id, user.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-muted/60 transition-colors text-left"
                              >
                                <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="font-medium">{user.name}</span>
                                <span className="text-[11px] text-muted-foreground">{user.phone}</span>
                                {user.email && <span className="text-[11px] text-muted-foreground">{user.email}</span>}
                              </button>
                            ))
                          )
                        ) : (
                          <div className="px-3 py-4 text-center text-[12px] text-muted-foreground">
                            未找到匹配的{customerType === "B" ? "企业" : "用户"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FormRow>

            <FormRow label="支付状态" required>
              <div className="grid grid-cols-2 gap-3 max-w-[640px]">
                <Select value={paymentStatusVal} onValueChange={setPaymentStatusVal}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_payment">无需支付（赠送/内部发放）</SelectItem>
                    <SelectItem value="pending">待支付（线下收款待确认）</SelectItem>
                    <SelectItem value="paid">已支付（已收款录入）</SelectItem>
                  </SelectContent>
                </Select>
                {paymentStatusVal === "paid" && (
                  <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder={`实收金额 默认 ¥${totalAmount.toFixed(2)}`} />
                )}
                {paymentStatusVal === "pending" && (
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted/30 text-[13px] text-foreground">
                    应收 ¥{totalAmount.toFixed(2)}
                  </div>
                )}
              </div>
            </FormRow>

            <FormRow label="备注">
              <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="可选" />
            </FormRow>

            <FormRow label={`订单商品 (${items.length})`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {selectedApps.length > 0 ? (
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground flex-wrap">
                      <span>涉及应用：</span>
                      {selectedApps.map((app) => (
                        <span key={app.id} className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px]">{app.name}</span>
                      ))}
                    </div>
                  ) : <span />}
                  <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setPickerOpen(true)}>
                    选择权益产品/商品/套餐
                  </Button>
                </div>

                {isBOrder && enterpriseExpireDate && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-[12px] text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 mt-[2px] shrink-0" />
                    <div className="leading-relaxed">
                      企业「<span className="font-medium">{selectedEnterprise!.name}</span>」整体有效期至 <span className="font-medium font-mono">{enterpriseExpireDate}</span>，订单内各项权益的授权时间不可超出该日期，超出部分将自动截断。
                    </div>
                  </div>
                )}

                {items.length === 0 ? (
                  <div className="border rounded-lg p-8 text-center text-[13px] text-muted-foreground border-dashed">
                    点击右上方按钮选择商品或套餐（支持跨应用）
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedApps.map((app) => {
                      const groupItems = items
                        .map((it, idx) => ({ it, idx }))
                        .filter(({ it }) => {
                          const aId = it.type === "sku" ? skuData.find((s) => s.id === it.itemId)?.appId
                            : it.type === "product" ? productData.find((p) => p.id === it.itemId)?.appId
                            : bundleData.find((b) => b.id === it.itemId)?.appId;
                          return aId === app.id;
                        });
                      if (groupItems.length === 0) return null;
                      const gridCols = isBOrder
                        ? "grid-cols-[minmax(260px,1fr)_140px_100px_100px_36px]"
                        : "grid-cols-[minmax(260px,1fr)_100px_100px_36px]";
                      return (
                        <div key={app.id} className="rounded-xl border border-border/70 overflow-hidden bg-card">
                          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2.5 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-foreground">{app.name}</span>
                              <span className="text-[11px] text-muted-foreground">{groupItems.length} 项权益</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-muted-foreground">{isBOrder ? "授权时间" : "使用周期"}</span>
                              <div className="w-[260px]">
                                <ConstrainedDateRangePicker
                                  value={appDateRange[app.id] || `2026-01-01 ~ ${enterpriseExpireDate || "2028-12-31"}`}
                                  maxDate={enterpriseExpireDate}
                                  onChange={(v) => updateAppDateRange(app.id, v, groupItems.map((g) => g.idx))}
                                />
                              </div>
                            </div>
                          </div>
                          <div className={`grid ${gridCols} bg-muted/20 border-b border-border/50 text-[11px] font-medium text-muted-foreground`}>
                            <div className="px-3 py-2">名称</div>
                            {isBOrder && <div className="px-2 py-2">应用方式</div>}
                            <div className="px-2 py-2 text-center">{isBOrder ? "人数" : "数量"}</div>
                            <div className="px-2 py-2 text-right">单价</div>
                            <div />
                          </div>
                          {groupItems.map(({ it, idx }) => {
                            const toneVar = getBenefitTone(it.itemId);
                            const typeLabel = it.type === "bundle" ? "套餐" : it.type === "product" ? "权益产品" : "商品";
                            return (
                              <div key={idx} className={`grid ${gridCols} items-center border-b border-border/40 last:border-b-0 hover:bg-muted/15 transition-colors group`}>
                                <div className="px-3 py-2.5 flex items-center gap-2 min-w-0">
                                  <span
                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium whitespace-nowrap"
                                    style={{ background: `hsl(var(${toneVar}) / 0.08)`, color: `hsl(var(${toneVar}))` }}
                                  >
                                    <Package className="h-3 w-3 shrink-0" />
                                    {it.itemName}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{typeLabel}</span>
                                </div>
                                {isBOrder && (
                                  <div className="px-2 py-2">
                                    <select
                                      className="filter-select h-9 w-full px-2 text-[12px]"
                                      value={it.applyMode || "指定人员"}
                                      onChange={(e) => updateItem(idx, "applyMode", e.target.value as OrderItem["applyMode"])}
                                    >
                                      <option value="指定人员">指定人员</option>
                                      <option value="全部人员">全部人员</option>
                                    </select>
                                  </div>
                                )}
                                <div className="px-2 py-2">
                                  {isBOrder && it.applyMode === "全部人员" ? (
                                    <span className="block text-center text-[12px] text-muted-foreground">全员</span>
                                  ) : (
                                    <input
                                      type="number"
                                      min={1}
                                      className="filter-input h-9 w-full px-1 text-center text-[12px]"
                                      value={isBOrder ? (it.applyCount ?? 10) : it.quantity}
                                      onChange={(e) => updateItem(idx, isBOrder ? "applyCount" : "quantity", Math.max(1, Number(e.target.value)))}
                                    />
                                  )}
                                </div>
                                <div className="px-2 py-2 text-right text-[12px] font-medium">{it.unitPrice > 0 ? `¥${it.unitPrice}` : "¥0"}</div>
                                <div className="px-1 py-2 flex justify-center">
                                  <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    <div className="px-4 py-2.5 text-[13px] font-medium text-right bg-muted/30 border border-border/60 rounded-lg">
                      合计: <span className="text-foreground">¥{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </FormRow>
          </div>
        </div>

        <div className="flex justify-center gap-3 px-6 py-5 border-t border-border/70 bg-muted/20">
          <button className="btn-secondary" onClick={() => navigate("/entitlement/order")}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>

      <ItemPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        existingItems={items}
        onConfirm={(selected) => { setItems(selected); setPickerOpen(false); }}
      />
    </div>
  );
}
