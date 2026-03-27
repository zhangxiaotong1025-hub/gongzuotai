import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Package, Layers, Building2, User } from "lucide-react";
import { appData, skuData, bundleData, ORDER_TYPES, BILLING_CYCLES, CUSTOMER_TYPES, bEnterpriseData, cUserData, type EntitlementOrder, type OrderItem, type Sku, type Bundle, type CustomerType } from "@/data/entitlement";

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

  // Derive apps from selected items
  const selectedAppIds = new Set<string>();
  items.forEach((item) => {
    if (item.type === "sku") {
      const sku = skuData.find((s) => s.id === item.itemId);
      if (sku) selectedAppIds.add(sku.appId);
    } else {
      const bundle = bundleData.find((b) => b.id === item.itemId);
      if (bundle) selectedAppIds.add(bundle.appId);
    }
  });
  const selectedApps = appData.filter((a) => selectedAppIds.has(a.id));

  const handleSubmit = () => {
    if (!customerId) return;
    const paymentStatus = orderType === "internal_grant" || orderType === "system_grant" ? "no_payment" as const : "pending" as const;
    onSave({
      customerType, customerId, customerName, orderType: orderType as any, remark, items,
      totalAmount, paymentStatus,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto">
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

            <div className="space-y-1.5">
              <Label className="text-[13px]">备注</Label>
              <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="可选" />
            </div>

            {/* 订单商品 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[13px]">订单商品 ({items.length})</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[12px]" onClick={() => setPickerOpen(true)}>
                  选择商品/套餐
                </Button>
              </div>

              {/* 涉及应用 */}
              {selectedApps.length > 0 && (
                <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <span>涉及应用：</span>
                  {selectedApps.map((app) => (
                    <span key={app.id} className="inline-flex items-center px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px]">{app.name}</span>
                  ))}
                </div>
              )}

              {items.length > 0 ? (
                <div className="border rounded-lg divide-y">
                  {items.map((item, idx) => {
                    const itemApp = item.type === "sku"
                      ? appData.find((a) => a.id === skuData.find((s) => s.id === item.itemId)?.appId)
                      : appData.find((a) => a.id === bundleData.find((b) => b.id === item.itemId)?.appId);
                    return (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 text-[13px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${item.type === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                            {item.type === "bundle" ? "套餐" : "SKU"}
                          </span>
                          <span className="font-medium truncate">{item.itemName}</span>
                          {itemApp && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">{itemApp.name}</span>}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-muted-foreground">×{item.quantity}</span>
                          <span className="font-medium">{item.unitPrice > 0 ? `¥${item.unitPrice}` : "¥0"}</span>
                          <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-3 py-2 text-[13px] font-medium text-right bg-muted/30">
                    合计: <span className="text-foreground">¥{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6 text-center text-[13px] text-muted-foreground border-dashed">
                  点击上方按钮选择商品或套餐（支持跨应用）
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

/* ── 二级弹窗：跨应用商品/套餐选择器 ── */
function ItemPickerDialog({ open, onClose, existingItems, onConfirm }: {
  open: boolean;
  onClose: () => void;
  existingItems: OrderItem[];
  onConfirm: (items: OrderItem[]) => void;
}) {
  const [tab, setTab] = useState<"sku" | "bundle">("sku");
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState<string>("all");
  const [localItems, setLocalItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (open) {
      setLocalItems([...existingItems]);
      setSearch("");
      setAppFilter("all");
    }
  }, [open, existingItems]);

  const filteredSkus = skuData.filter((s) =>
    s.salesStatus === "on_sale" &&
    (appFilter === "all" || s.appId === appFilter) &&
    (!search || s.name.includes(search) || s.code.includes(search))
  );
  const filteredBundles = bundleData.filter((b) =>
    b.status === "on_sale" &&
    (appFilter === "all" || b.appId === appFilter) &&
    (!search || b.name.includes(search) || b.code.includes(search))
  );

  const skusByApp = appData.filter((a) => appFilter === "all" || a.id === appFilter).map((app) => ({
    app,
    skus: filteredSkus.filter((s) => s.appId === app.id),
  })).filter((g) => g.skus.length > 0);

  const bundlesByApp = appData.filter((a) => appFilter === "all" || a.id === appFilter).map((app) => ({
    app,
    bundles: filteredBundles.filter((b) => b.appId === app.id),
  })).filter((g) => g.bundles.length > 0);

  const isSelected = (type: "sku" | "bundle", id: string) => localItems.some((i) => i.type === type && i.itemId === id);

  const toggleItem = (type: "sku" | "bundle", item: Sku | Bundle) => {
    const id = item.id;
    if (isSelected(type, id)) {
      setLocalItems((prev) => prev.filter((i) => !(i.type === type && i.itemId === id)));
    } else {
      setLocalItems((prev) => [...prev, { type, itemId: id, itemName: item.name, quantity: 1, unitPrice: item.price }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[750px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>选择商品/套餐（支持跨应用）</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="flex gap-1 bg-muted rounded-lg p-0.5 shrink-0">
            <button onClick={() => setTab("sku")} className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${tab === "sku" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Package className="h-3.5 w-3.5 inline mr-1" />商品SKU
            </button>
            <button onClick={() => setTab("bundle")} className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${tab === "bundle" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Layers className="h-3.5 w-3.5 inline mr-1" />套餐
            </button>
          </div>
          <Select value={appFilter} onValueChange={setAppFilter}>
            <SelectTrigger className="h-8 w-[130px] text-[12px]"><SelectValue placeholder="全部应用" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部应用</SelectItem>
              {appData.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索名称或编码" className="pl-8 h-8 text-[13px]" />
          </div>
          <span className="text-[12px] text-muted-foreground whitespace-nowrap">已选 {localItems.length} 项</span>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[300px] py-2">
          {tab === "sku" ? (
            <div className="space-y-3">
              {skusByApp.map(({ app, skus }) => (
                <div key={app.id}>
                  <div className="flex items-center gap-2 mb-1.5 px-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-medium">{app.name}</span>
                    <span className="text-[11px] text-muted-foreground">{skus.length}个商品</span>
                  </div>
                  <div className="space-y-0.5">
                    {skus.map((sku) => (
                      <label key={sku.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected("sku", sku.id) ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/60 border border-transparent"}`}>
                        <Checkbox checked={isSelected("sku", sku.id)} onCheckedChange={() => toggleItem("sku", sku)} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-foreground">{sku.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{sku.code}</div>
                        </div>
                        <span className="text-[13px] font-medium shrink-0">{sku.price > 0 ? `¥${sku.price}` : "免费"}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0">{BILLING_CYCLES.find((b) => b.value === sku.billingCycle)?.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {skusByApp.length === 0 && <div className="text-center text-[13px] text-muted-foreground py-8">暂无符合条件的商品</div>}
            </div>
          ) : (
            <div className="space-y-3">
              {bundlesByApp.map(({ app, bundles }) => (
                <div key={app.id}>
                  <div className="flex items-center gap-2 mb-1.5 px-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-medium">{app.name}</span>
                    <span className="text-[11px] text-muted-foreground">{bundles.length}个套餐</span>
                  </div>
                  <div className="space-y-0.5">
                    {bundles.map((bundle) => (
                      <label key={bundle.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isSelected("bundle", bundle.id) ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/60 border border-transparent"}`}>
                        <Checkbox checked={isSelected("bundle", bundle.id)} onCheckedChange={() => toggleItem("bundle", bundle)} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-foreground">{bundle.name}</div>
                          <div className="text-[11px] text-muted-foreground">{bundle.items.length}个商品 · {bundle.code}</div>
                        </div>
                        <span className="text-[13px] font-medium shrink-0">{bundle.price > 0 ? `¥${bundle.price}` : "免费"}</span>
                        {bundle.originalPrice && <span className="text-[11px] text-muted-foreground line-through shrink-0">¥{bundle.originalPrice}</span>}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {bundlesByApp.length === 0 && <div className="text-center text-[13px] text-muted-foreground py-8">暂无符合条件的套餐</div>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={() => onConfirm(localItems)}>确认选择 ({localItems.length})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
