import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Search, Package, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type CatalogTone = "blue" | "teal" | "violet" | "amber" | "rose";

const TONE_VARS: Record<CatalogTone, string> = {
  blue: "--benefit-blue",
  teal: "--benefit-teal",
  violet: "--benefit-violet",
  amber: "--benefit-amber",
  rose: "--benefit-rose",
};

export type CatalogItem = {
  id: string;
  name: string;
  desc?: string;
  tone: CatalogTone;
  kind?: "sku" | "bundle" | "product";
  group?: string;
  /** 列表右侧业务信息（价格、周期、规则数等） */
  meta?: ReactNode;
  /** 已被加入，禁用 */
  disabled?: boolean;
};

interface BenefitPickerDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  items: CatalogItem[];
  existingIds?: string[];
  /** 启用 kind 标签筛选 */
  showKindTabs?: boolean;
  /** 启用分组筛选（按 item.group） */
  groupFilter?: { label?: string; options: { label: string; value: string }[] };
  /** 多选返回数组；单选返回单项立即关闭 */
  multiple?: boolean;
  onConfirm: (selected: CatalogItem[]) => void;
}

const KIND_META = {
  product: { label: "权益产品", icon: Sparkles },
  sku: { label: "商品", icon: Package },
  bundle: { label: "套餐", icon: Layers },
} as const;

export function BenefitPickerDialog({
  open,
  onClose,
  title = "选择权益",
  description,
  items,
  existingIds = [],
  showKindTabs,
  groupFilter,
  multiple = true,
  onConfirm,
}: BenefitPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [groupVal, setGroupVal] = useState("all");
  const [kindVal, setKindVal] = useState<"all" | "product" | "sku" | "bundle">("all");
  const [selected, setSelected] = useState<Record<string, CatalogItem>>({});

  useEffect(() => {
    if (open) { setSearch(""); setGroupVal("all"); setKindVal("all"); setSelected({}); }
  }, [open]);

  const kinds = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.kind && s.add(i.kind));
    return Array.from(s) as Array<"product" | "sku" | "bundle">;
  }, [items]);

  const groupOptions = useMemo(() => {
    if (groupFilter?.options?.length) return groupFilter.options;
    const seen = new Set<string>();
    return items.reduce<{ label: string; value: string }[]>((acc, item) => {
      if (!item.group || seen.has(item.group)) return acc;
      seen.add(item.group);
      acc.push({ label: item.group, value: item.group });
      return acc;
    }, []);
  }, [groupFilter, items]);

  useEffect(() => {
    if (groupVal === "all") return;
    if (!groupOptions.some((option) => option.value === groupVal)) setGroupVal("all");
  }, [groupOptions, groupVal]);

  const filtered = useMemo(() => items.filter((it) => {
    if (kindVal !== "all" && it.kind && it.kind !== kindVal) return false;
    if (groupVal !== "all" && it.group !== groupVal) return false;
    if (search && !it.name.includes(search) && !(it.desc || "").includes(search)) return false;
    return true;
  }), [items, search, groupVal, kindVal]);

  const grouped = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    filtered.forEach((it) => {
      const k = it.group || "默认";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const isExisting = (id: string) => existingIds.includes(id);
  const isSelected = (id: string) => !!selected[id];
  const toggle = (item: CatalogItem) => {
    if (isExisting(item.id) || item.disabled) return;
    if (!multiple) { onConfirm([item]); onClose(); return; }
    setSelected((prev) => {
      const next = { ...prev };
      if (next[item.id]) delete next[item.id]; else next[item.id] = item;
      return next;
    });
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[720px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-[12px] text-muted-foreground">{description}</p>}
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-3 pb-3 border-b">
          {groupOptions.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground shrink-0 mr-1">{groupFilter?.label || "应用"}</span>
              <button
                type="button"
                onClick={() => setGroupVal("all")}
                className={cn(
                  "px-3 py-1.5 text-[12px] rounded-full border transition-colors",
                  groupVal === "all"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >全部</button>
              {groupOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGroupVal(option.value)}
                  className={cn(
                    "px-3 py-1.5 text-[12px] rounded-full border transition-colors",
                    groupVal === option.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {showKindTabs && kinds.length > 1 && (
              <div className="flex gap-1 bg-muted rounded-lg p-0.5 shrink-0">
                <button
                  onClick={() => setKindVal("all")}
                  className={cn("px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors",
                    kindVal === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                >全部</button>
                {kinds.map((k) => {
                  const Icon = KIND_META[k].icon;
                  return (
                    <button key={k} onClick={() => setKindVal(k)}
                      className={cn("px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors inline-flex items-center gap-1",
                        kindVal === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      <Icon className="h-3.5 w-3.5" />{KIND_META[k].label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索名称 / 描述" className="pl-8 h-8 text-[13px]" />
            </div>
            {multiple && (
              <span className="text-[12px] text-muted-foreground whitespace-nowrap">已选 {selectedCount} 项</span>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-[280px] py-2 pr-1">
          {grouped.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-muted-foreground">暂无匹配项</div>
          ) : (
            <div className="space-y-3">
              {grouped.map(([groupName, list]) => (
                <div key={groupName}>
                  {grouped.length > 1 && (
                    <div className="flex items-center gap-2 mb-1.5 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-primary/10 text-primary font-medium">{groupName}</span>
                      <span className="text-[11px] text-muted-foreground">{list.length} 项</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {list.map((item) => {
                      const exist = isExisting(item.id);
                      const sel = isSelected(item.id);
                      const cssVar = TONE_VARS[item.tone];
                      const KindIcon = item.kind ? KIND_META[item.kind].icon : Package;
                      return (
                        <label
                          key={item.id}
                          onClick={(e) => { if (exist) e.preventDefault(); }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors",
                            exist ? "opacity-50 cursor-not-allowed bg-muted/20 border-transparent"
                              : sel ? "bg-primary/5 border-primary/30 cursor-pointer"
                              : "hover:bg-muted/40 border-transparent cursor-pointer",
                          )}
                        >
                          {multiple && (
                            <Checkbox
                              checked={exist || sel}
                              disabled={exist}
                              onCheckedChange={() => toggle(item)}
                            />
                          )}
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `hsl(var(${cssVar}) / 0.1)` }}
                          >
                            <KindIcon className="h-4 w-4" style={{ color: `hsl(var(${cssVar}))` }} />
                          </div>
                          <div className="flex-1 min-w-0" onClick={() => !multiple && toggle(item)}>
                            <div className="flex items-center gap-1.5">
                              <div className="text-[13px] font-medium text-foreground truncate">{item.name}</div>
                              {item.kind && (
                                <span className="inline-flex items-center px-1.5 py-[1px] rounded text-[10px] font-medium bg-muted text-muted-foreground shrink-0">
                                  {KIND_META[item.kind].label.replace("权益", "")}
                                </span>
                              )}
                            </div>
                            {item.desc && <div className="text-[11px] text-muted-foreground truncate mt-0.5">{item.desc}</div>}
                          </div>
                          {item.meta && <div className="shrink-0 text-right">{item.meta}</div>}
                          {exist && <span className="text-[11px] text-muted-foreground shrink-0">已添加</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {multiple && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button disabled={selectedCount === 0} onClick={() => { onConfirm(Object.values(selected)); onClose(); }}>
              确认选择 ({selectedCount})
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
