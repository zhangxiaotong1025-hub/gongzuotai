import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, Search, Package, Layers, Building2, User, Sparkles, CalendarIcon, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { appData, skuData, bundleData, productData, EXCHANGE_TYPES, ORDER_TYPES, BILLING_CYCLES, CUSTOMER_TYPES, bEnterpriseData, cUserData, type EntitlementOrder, type OrderItem, type Sku, type Bundle, type Product, type CustomerType } from "@/data/entitlement";

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: Partial<EntitlementOrder>) => void;
  initial?: EntitlementOrder | null;
}

export function OrderDialog({ open, onClose, onSave, initial }: OrderDialogProps) {
  const [customerType, setCustomerType] = useState<CustomerType>("B");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [orderType, setOrderType] = useState<string>("internal_grant");
  const [paymentStatusVal, setPaymentStatusVal] = useState<string>("no_payment");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [remark, setRemark] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomerType(initial?.customerType || "B");
      setCustomerId(initial?.customerId || "");
      setCustomerName(initial?.customerName || "");
      setCustomerSearch("");
      setOrderType(initial?.orderType || "internal_grant");
      setPaymentStatusVal(initial?.paymentStatus || "no_payment");
      setPaidAmount(initial?.totalAmount ? String(initial.totalAmount) : "");
      setRemark(initial?.remark || "");
      setItems(initial?.items || []);
      setCustomerDropdownOpen(false);
    }
  }, [open, initial]);

  // Filtered customer list based on type and search
  const filteredCustomers = useMemo(() => {
    if (customerType === "B") {
      return bEnterpriseData.filter((e) =>
        !customerSearch || e.name.includes(customerSearch) || e.type.includes(customerSearch) || (e.parentName && e.parentName.includes(customerSearch))
      );
    } else {
      return cUserData.filter((u) =>
        !customerSearch || u.name.includes(customerSearch) || u.phone.includes(customerSearch)
      );
    }
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
  const updateItem = (idx: number, field: keyof OrderItem, value: unknown) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  // Selected B-enterprise + its expire date (constrains entitlement usage time)
  const selectedEnterprise = useMemo(() => {
    if (customerType !== "B" || !customerId) return null;
    return bEnterpriseData.find((e) => e.id === customerId) || null;
  }, [customerType, customerId]);
  const enterpriseExpireDate = selectedEnterprise?.expireDate;
  const isBOrder = customerType === "B" && !!selectedEnterprise;

  // Derive apps from selected items
  const selectedAppIds = new Set<string>();
  items.forEach((item) => {
    if (item.type === "sku") {
      const sku = skuData.find((s) => s.id === item.itemId);
      if (sku) selectedAppIds.add(sku.appId);
    } else if (item.type === "product") {
      const product = productData.find((p) => p.id === item.itemId);
      if (product) selectedAppIds.add(product.appId);
    } else {
      const bundle = bundleData.find((b) => b.id === item.itemId);
      if (bundle) selectedAppIds.add(bundle.appId);
    }
  });
  const selectedApps = appData.filter((a) => selectedAppIds.has(a.id));

  // app-level dateRange derived from items (first item per app)
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

  const updateAppDateRange = (_appId: string, range: string, indices: number[]) => {
    setItems((prev) => prev.map((it, i) => (indices.includes(i) ? { ...it, dateRange: range } : it)));
  };

  // Auto-init dateRange for all orders; clip when enterprise expire date applies
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
    if (!customerId) return;
    const finalPaymentStatus = paymentStatusVal as any;
    const finalAmount = paymentStatusVal === "paid" && paidAmount ? parseFloat(paidAmount) : totalAmount;
    onSave({
      customerType, customerId, customerName, orderType: orderType as any, remark, items,
      totalAmount: finalAmount, paymentStatus: finalPaymentStatus,
      ...(paymentStatusVal === "paid" ? { paidAt: new Date().toLocaleString("zh-CN") } : {}),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-[860px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initial ? "编辑订单" : "创建内部订单"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 账户类型 + 选择账户 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">账户类型 *</Label>
                <div className="flex gap-1 bg-muted rounded-lg p-0.5">
                  {CUSTOMER_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => handleChangeCustomerType(t.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium rounded-md transition-colors ${
                        customerType === t.value
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.value === "B" ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">订单类型</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* 选择账户 */}
            <div className="space-y-1.5">
              <Label className="text-[13px]">{customerType === "B" ? "选择企业" : "选择用户"} *</Label>
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
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
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
            </div>

            {/* 支付状态 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">支付状态 *</Label>
                <Select value={paymentStatusVal} onValueChange={setPaymentStatusVal}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_payment">无需支付（赠送/内部发放）</SelectItem>
                    <SelectItem value="pending">待支付（线下收款待确认）</SelectItem>
                    <SelectItem value="paid">已支付（已收款录入）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentStatusVal === "paid" && (
                <div className="space-y-1.5">
                  <Label className="text-[13px]">实收金额</Label>
                  <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder={`默认 ¥${totalAmount.toFixed(2)}`} />
                </div>
              )}
              {paymentStatusVal === "pending" && (
                <div className="space-y-1.5">
                  <Label className="text-[13px]">应收金额</Label>
                  <div className="flex items-center h-9 px-3 border rounded-md bg-muted/30 text-[13px] text-foreground">
                    ¥{totalAmount.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px]">备注</Label>
              <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="可选" />
            </div>

            {/* 订单商品 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[13px]">订单商品 ({items.length})</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[12px]" onClick={() => setPickerOpen(true)}>
                  选择权益产品/商品/套餐
                </Button>
              </div>

              {/* 企业有效期提示（B端 + 已选企业） */}
              {isBOrder && enterpriseExpireDate && (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-[12px] text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 mt-[2px] shrink-0" />
                  <div className="leading-relaxed">
                    企业「<span className="font-medium">{selectedEnterprise!.name}</span>」整体有效期至 <span className="font-medium font-mono">{enterpriseExpireDate}</span>，订单内各项权益的授权时间不可超出该日期，超出部分将自动截断。
                  </div>
                </div>
              )}

              {/* 涉及应用 */}
              {selectedApps.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <span>涉及应用：</span>
                  {selectedApps.map((app) => (
                    <span key={app.id} className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px]">{app.name}</span>
                  ))}
                </div>
              )}

              {items.length === 0 ? (
                <div className="border rounded-lg p-6 text-center text-[13px] text-muted-foreground border-dashed">
                  点击上方按钮选择商品或套餐（支持跨应用）
                </div>
              ) : (
                /* 统一样式：按应用分组，应用级授权时间；B端含应用方式/人数，C端仅含数量 */
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
                  <div className="px-3 py-2 text-[13px] font-medium text-right bg-muted/30 border rounded-lg">
                    合计: <span className="text-foreground">¥{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={handleSubmit} disabled={!customerId || items.length === 0}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ItemPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        existingItems={items}
        onConfirm={(selected) => { setItems(selected); setPickerOpen(false); }}
      />
    </>
  );
}

/* ── 二级弹窗：跨应用商品/套餐选择器（基于共享 BenefitPickerDialog） ── */
export function ItemPickerDialog({ open, onClose, existingItems, onConfirm }: {
  open: boolean;
  onClose: () => void;
  existingItems: OrderItem[];
  onConfirm: (items: OrderItem[]) => void;
}) {
  // 构造统一 catalog：跨 product/sku/bundle，按 app 分组
  const catalog = useMemo(() => {
    const items: import("@/components/entitlement/BenefitPickerDialog").CatalogItem[] = [];
    const toneOf = (seed: string): "blue" | "teal" | "violet" | "amber" | "rose" => {
      const arr = ["blue", "teal", "violet", "amber", "rose"] as const;
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
      return arr[Math.abs(h) % arr.length];
    };
    productData.filter((p) => p.status === "active").forEach((p) => {
      const app = appData.find((a) => a.id === p.appId);
      const ex = EXCHANGE_TYPES.find((e) => e.value === p.exchangeType);
      items.push({
        id: `product:${p.id}`,
        name: p.name,
        desc: `${p.code} · ${p.ruleIds.length} 条规则`,
        tone: toneOf(p.id),
        kind: "product",
        group: app?.name || "—",
        meta: (
          <div className="flex items-center gap-1.5">
            {ex && <span className={`${ex.className} shrink-0`}>{ex.label}</span>}
            {p.exchangeType === "credit" && p.creditPrice ? (
              <span className="text-[11px] text-muted-foreground">{p.creditPrice}积分</span>
            ) : null}
          </div>
        ),
      });
    });
    skuData.filter((s) => s.salesStatus === "on_sale").forEach((s) => {
      const app = appData.find((a) => a.id === s.appId);
      const cyc = BILLING_CYCLES.find((b) => b.value === s.billingCycle)?.label;
      items.push({
        id: `sku:${s.id}`,
        name: s.name,
        desc: s.code,
        tone: toneOf(s.id),
        kind: "sku",
        group: app?.name || "—",
        meta: (
          <div className="text-right">
            <div className="text-[12px] font-medium">{s.price > 0 ? `¥${s.price}` : "免费"}</div>
            {cyc && <div className="text-[10px] text-muted-foreground">{cyc}</div>}
          </div>
        ),
      });
    });
    bundleData.filter((b) => b.status === "on_sale").forEach((b) => {
      const app = appData.find((a) => a.id === b.appId);
      items.push({
        id: `bundle:${b.id}`,
        name: b.name,
        desc: `${b.items.length} 个商品 · ${b.code}`,
        tone: toneOf(b.id),
        kind: "bundle",
        group: app?.name || "—",
        meta: (
          <div className="text-right">
            <div className="text-[12px] font-medium">{b.price > 0 ? `¥${b.price}` : "免费"}</div>
            {b.originalPrice && <div className="text-[10px] text-muted-foreground line-through">¥{b.originalPrice}</div>}
          </div>
        ),
      });
    });
    return items;
  }, []);

  // 现有项目转 id 集合（保留已选时由 confirm 合并）
  const existingIds = existingItems.map((it) => `${it.type}:${it.itemId}`);

  return (
    <BenefitPickerDialogLazy
      open={open}
      onClose={onClose}
      title="选择权益产品 / 商品 / 套餐（支持跨应用）"
      description="支持跨应用筛选、按类型切换、关键字搜索"
      items={catalog}
      existingIds={existingIds}
      showKindTabs
      groupFilter={{ label: "全部应用", options: appData.map((a) => ({ label: a.name, value: a.name })) }}
      onConfirm={(selected) => {
        const additions: OrderItem[] = selected.map((s) => {
          const [type, rawId] = s.id.split(":");
          if (type === "product") {
            const p = productData.find((x) => x.id === rawId)!;
            return { type: "product", itemId: p.id, itemName: p.name, quantity: 1, unitPrice: 0 };
          }
          if (type === "sku") {
            const sk = skuData.find((x) => x.id === rawId)!;
            return { type: "sku", itemId: sk.id, itemName: sk.name, quantity: 1, unitPrice: sk.price };
          }
          const bd = bundleData.find((x) => x.id === rawId)!;
          return { type: "bundle", itemId: bd.id, itemName: bd.name, quantity: 1, unitPrice: bd.price };
        });
        onConfirm([...existingItems, ...additions]);
      }}
    />
  );
}

/* ── 受企业有效期约束的日期区间选择器（maxDate 可选） ── */
const BENEFIT_TONE_VARS = ["--benefit-blue", "--benefit-teal", "--benefit-violet", "--benefit-amber", "--benefit-rose"];
export function getBenefitTone(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return BENEFIT_TONE_VARS[Math.abs(h) % BENEFIT_TONE_VARS.length];
}

export function ConstrainedDateRangePicker({ value, maxDate, onChange }: { value: string; maxDate?: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const max = maxDate ? new Date(maxDate) : undefined;
  const [startStr, endStr] = (value || "").split("~").map((s) => s.trim());
  const start = startStr ? new Date(startStr) : undefined;
  const end = endStr ? new Date(endStr) : undefined;
  const display = start && end ? `${format(start, "yyyy-MM-dd")} ~ ${format(end, "yyyy-MM-dd")}` : "";

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) return;
    let to = range.to || range.from;
    if (max && to > max) to = max;
    onChange(`${format(range.from, "yyyy-MM-dd")} ~ ${format(to, "yyyy-MM-dd")}`);
    if (range.to) setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-8 w-full justify-start rounded-md border-input bg-card px-2 text-left text-[12px] font-normal shadow-none hover:bg-muted/40", !display && "text-muted-foreground")}>
          <CalendarIcon className="mr-1.5 h-3 w-3 opacity-50 shrink-0" />
          {display || <span>选择时间段</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl p-0" align="start">
        {maxDate && (
          <div className="px-3 pt-3 text-[11px] text-muted-foreground">不可超出企业有效期 <span className="font-mono text-foreground">{maxDate}</span></div>
        )}
        <Calendar
          mode="range"
          selected={start && end ? { from: start, to: end } : start ? { from: start, to: undefined } : undefined}
          onSelect={handleSelect as never}
          disabled={max ? (d: Date) => d > max : undefined}
          numberOfMonths={2}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
