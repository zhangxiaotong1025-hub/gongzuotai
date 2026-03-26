import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Package, Layers } from "lucide-react";
import { appData, skuData, bundleData, ORDER_SOURCES, BILLING_CYCLES, type EntitlementOrder, type OrderItem, type Sku, type Bundle } from "@/data/entitlement";

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: Partial<EntitlementOrder>) => void;
  initial?: EntitlementOrder | null;
}

export function OrderDialog({ open, onClose, onSave, initial }: OrderDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [appId, setAppId] = useState("");
  const [source, setSource] = useState<string>("purchase");
  const [remark, setRemark] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setCustomerName(initial?.customerName || "");
      setAppId(initial?.appId || appData[0]?.id || "");
      setSource(initial?.source || "purchase");
      setRemark(initial?.remark || "");
      setItems(initial?.items || []);
    }
  }, [open, initial]);

  const totalAmount = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!customerName.trim()) return;
    onSave({
      customerName, appId, source: source as any, remark, items,
      totalAmount, status: "pending",
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{initial ? "编辑订单" : "新建权益订单"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">客户名称 *</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="请输入客户名称" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">所属应用</Label>
                <Select value={appId} onValueChange={setAppId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{appData.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[13px]">订单来源</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ORDER_SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">备注</Label>
                <Input value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="可选" />
              </div>
            </div>

            {/* 订单商品 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-[13px]">订单商品 ({items.length})</Label>
                <Button type="button" variant="outline" size="sm" className="h-7 text-[12px]" onClick={() => setPickerOpen(true)}>
                  选择商品/套餐
                </Button>
              </div>
              {items.length > 0 ? (
                <div className="border rounded-lg divide-y">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 text-[13px]">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.type === "bundle" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                          {item.type === "bundle" ? "套餐" : "SKU"}
                        </span>
                        <span className="font-medium">{item.itemName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">×{item.quantity}</span>
                        <span className="font-medium">{item.unitPrice > 0 ? `¥${item.unitPrice}` : "¥0"}</span>
                        <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  ))}
                  <div className="px-3 py-2 text-[13px] font-medium text-right bg-muted/30">
                    合计: <span className="text-foreground">¥{totalAmount}</span>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-6 text-center text-[13px] text-muted-foreground border-dashed">
                  点击上方按钮选择商品或套餐
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={handleSubmit} disabled={!customerName.trim() || items.length === 0}>确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item Picker Dialog */}
      <ItemPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        appId={appId}
        existingItems={items}
        onConfirm={(selected) => { setItems(selected); setPickerOpen(false); }}
      />
    </>
  );
}

/* ── 二级弹窗：商品/套餐选择器 ── */
function ItemPickerDialog({ open, onClose, appId, existingItems, onConfirm }: {
  open: boolean;
  onClose: () => void;
  appId: string;
  existingItems: OrderItem[];
  onConfirm: (items: OrderItem[]) => void;
}) {
  const [tab, setTab] = useState<"sku" | "bundle">("sku");
  const [search, setSearch] = useState("");
  const [localItems, setLocalItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (open) {
      setLocalItems([...existingItems]);
      setSearch("");
    }
  }, [open, existingItems]);

  const filteredSkus = skuData.filter((s) => s.appId === appId && s.salesStatus === "on_sale" && (!search || s.name.includes(search) || s.code.includes(search)));
  const filteredBundles = bundleData.filter((b) => b.appId === appId && b.status === "on_sale" && (!search || b.name.includes(search) || b.code.includes(search)));

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
      <DialogContent className="max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>选择商品/套餐</DialogTitle>
        </DialogHeader>

        {/* Tabs & Search */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="flex gap-1 bg-muted rounded-lg p-0.5">
            <button onClick={() => setTab("sku")} className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${tab === "sku" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Package className="h-3.5 w-3.5 inline mr-1" />商品SKU
            </button>
            <button onClick={() => setTab("bundle")} className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${tab === "bundle" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Layers className="h-3.5 w-3.5 inline mr-1" />套餐
            </button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索名称或编码" className="pl-8 h-8 text-[13px]" />
          </div>
          <span className="text-[12px] text-muted-foreground whitespace-nowrap">已选 {localItems.length} 项</span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-[300px] py-2">
          {tab === "sku" ? (
            <div className="space-y-1">
              {filteredSkus.map((sku) => (
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
              {filteredSkus.length === 0 && <div className="text-center text-[13px] text-muted-foreground py-8">暂无符合条件的商品</div>}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredBundles.map((bundle) => (
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
              {filteredBundles.length === 0 && <div className="text-center text-[13px] text-muted-foreground py-8">暂无符合条件的套餐</div>}
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
