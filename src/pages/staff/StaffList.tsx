import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus, Download, ChevronRight, ChevronDown, ChevronUp, Users,
  MoreHorizontal, Edit2, Trash2, FolderPlus, FolderTree, X, CalendarIcon, Check, Info,
} from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { toast } from "sonner";

/* ── Types ── */
interface OrgNode { id: string; name: string; children?: OrgNode[]; isDraft?: boolean; }
interface StaffMember {
  id: string; name: string; enterprise: string; phone: string;
  status: "active" | "inactive"; products: string[]; role: string;
  benefits: string[]; orgIds: string[]; createdAt: string;
}

/* ── Org Tree Data ── */
const initialOrgTree: OrgNode[] = [
  {
    id: "all", name: "全部", children: [
      { id: "unset", name: "未设置组织架构" },
      { id: "hq", name: "总部", children: [
        { id: "model", name: "模型部" }, { id: "design", name: "设计部" },
      ]},
      { id: "supply", name: "供应链", children: [
        { id: "south", name: "华南供应链", children: [
          { id: "sd-supply", name: "山东供应链" }, { id: "hb-supply", name: "河北供应链" }, { id: "tj-supply", name: "天津供应链" },
        ]},
        { id: "north", name: "华北供应链" },
      ]},
    ],
  },
];

/* ── Product Tabs & Benefit Data ── */
const PRODUCT_TABS = ["全部", "国内3D工具", "国际3D工具", "智能导购", "精准客资"];
const PRODUCT_KEY_MAP: Record<string, string[]> = {
  "国内3D工具": ["3D工具渲染权益包", "3D工具设计权益包"],
  "国际3D工具": ["国际版渲染权益包"],
  "智能导购": ["智能导购权益包"],
  "精准客资": ["精准客资权益包"],
};

interface BenefitSummary { name: string; date: string; used: number; total: number; variant: string; product: string; }
const BENEFIT_SUMMARIES: BenefitSummary[] = [
  { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "blue", product: "国内3D工具" },
  { name: "3D工具设计权益包", date: "2025.2.23—2028.2.23", used: 12, total: 30, variant: "teal", product: "国内3D工具" },
  { name: "国际版渲染权益包", date: "2025.2.23—2028.2.23", used: 5, total: 20, variant: "violet", product: "国际3D工具" },
  { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "rose", product: "智能导购" },
  { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 18, total: 30, variant: "amber", product: "精准客资" },
];

const VARIANT_VARS: Record<string, string> = {
  blue: "--benefit-blue", teal: "--benefit-teal", violet: "--benefit-violet",
  amber: "--benefit-amber", rose: "--benefit-rose",
};

/* ── Benefit Catalog for Dialog ── */
type BenefitTone = "blue" | "teal" | "violet" | "amber" | "rose";
interface BenefitPkg { id: string; name: string; desc: string; tone: BenefitTone; dateRange: string; }
const BENEFIT_CATALOG: Record<string, { name: string; desc: string; tone: BenefitTone }[]> = {
  domestic3d: [
    { name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", tone: "blue" },
    { name: "3D工具设计权益包", desc: "含户型绘制、方案设计、模型库", tone: "teal" },
  ],
  international3d: [{ name: "国际版渲染权益包", desc: "含8K渲染、HDR输出", tone: "violet" }],
  smartGuide: [{ name: "智能导购权益包", desc: "含AI推荐、商品匹配", tone: "rose" }],
  customerData: [{ name: "精准客资权益包", desc: "含线索分配、客户管理", tone: "amber" }],
};
const ALL_PRODUCT_KEYS = ["domestic3d", "international3d", "smartGuide", "customerData"];

/* ── Staff Mock Data ── */
const NAMES = ["王小二", "李博然", "刘晓宇", "贾西贝", "员工2号", "员工3号", "员工4号", "员工1号", "员工5号", "员工6号"];
const ENTERPRISES = ["广州珊珊光纤有限公司", "广州光纤有限公司/佛山店", "广州珊珊光纤有限公司/.../佛山店"];
const PRODUCTS_LIST = ["国内3D", "国际3D", "智能导购"];
const ROLES = ["企业管理员", "设计师", "店长", "导购", "模型管理员", "精准客资"];
const BENEFITS_LIST = ["工具极速渲染", "导购AI生图", "工具极速渲染 / 导购AI生图"];
const ORG_IDS = ["hq", "model", "design", "supply", "south", "north", "sd-supply", "hb-supply", "tj-supply"];

function generateStaff(): StaffMember[] {
  return Array.from({ length: 20 }, (_, i) => {
    const numOrgs = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...ORG_IDS].sort(() => Math.random() - 0.5);
    const orgIds = shuffled.slice(0, numOrgs);
    if (Math.random() < 0.2) orgIds.length = 0;
    return {
      id: `S${String(i + 1).padStart(3, "0")}`,
      name: NAMES[i % NAMES.length],
      enterprise: ENTERPRISES[i % ENTERPRISES.length],
      phone: `185****${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: Math.random() > 0.3 ? "active" : "inactive",
      products: [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)],
        ...(Math.random() > 0.5 ? [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)]] : []),
      ].filter((v, idx, arr) => arr.indexOf(v) === idx),
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      benefits: Math.random() > 0.4 ? [BENEFITS_LIST[Math.floor(Math.random() * BENEFITS_LIST.length)]] : [],
      orgIds,
      createdAt: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    };
  });
}

/* ── Tree Helpers ── */
function collectOrgIds(nodes: OrgNode[], targetId: string): string[] {
  const result: string[] = [];
  function walk(list: OrgNode[], collecting: boolean) {
    for (const node of list) {
      const match = collecting || node.id === targetId;
      if (match) result.push(node.id);
      if (node.children) walk(node.children, match);
    }
  }
  walk(nodes, false);
  return result;
}
function countStaffInOrg(staff: StaffMember[], orgTree: OrgNode[], orgId: string): number {
  if (orgId === "all") return staff.length;
  if (orgId === "unset") return staff.filter((s) => s.orgIds.length === 0).length;
  const ids = new Set(collectOrgIds(orgTree, orgId));
  return staff.filter((s) => s.orgIds.some((oid) => ids.has(oid))).length;
}
function insertChildNode(nodes: OrgNode[], parentId: string, newNode: OrgNode): OrgNode[] {
  return nodes.map((n) => n.id === parentId ? { ...n, children: [...(n.children || []), newNode] } : { ...n, children: n.children ? insertChildNode(n.children, parentId, newNode) : undefined });
}
function insertSiblingNode(nodes: OrgNode[], targetId: string, newNode: OrgNode): OrgNode[] {
  const idx = nodes.findIndex((n) => n.id === targetId);
  if (idx !== -1) { const next = [...nodes]; next.splice(idx + 1, 0, newNode); return next; }
  return nodes.map((n) => ({ ...n, children: n.children ? insertSiblingNode(n.children, targetId, newNode) : undefined }));
}
function renameNodeById(nodes: OrgNode[], id: string, name: string, clearDraft = false): OrgNode[] {
  return nodes.map((n) => n.id === id ? { ...n, name, isDraft: clearDraft ? false : n.isDraft } : { ...n, children: n.children ? renameNodeById(n.children, id, name, clearDraft) : undefined });
}
function removeNodeById(nodes: OrgNode[], id: string): OrgNode[] {
  return nodes.filter((n) => n.id !== id).map((n) => ({ ...n, children: n.children ? removeNodeById(n.children, id) : undefined }));
}
function findNode(nodes: OrgNode[], id: string): OrgNode | null {
  for (const n of nodes) { if (n.id === id) return n; if (n.children) { const f = findNode(n.children, id); if (f) return f; } }
  return null;
}

/* ── Filter Fields ── */
const filterFields: FilterField[] = [
  { key: "name", label: "姓名", type: "input", placeholder: "请输入", width: 140 },
  { key: "phone", label: "手机号", type: "input", placeholder: "请输入", width: 140 },
  { key: "status", label: "人员状态", type: "select", options: [{ label: "正常", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
  { key: "role", label: "角色", type: "select", options: ROLES.map((r) => ({ label: r, value: r })), width: 130 },
];

/* ── Columns ── */
const columns: TableColumn<StaffMember>[] = [
  { key: "name", title: (<span className="inline-flex items-center gap-1">人员<TooltipProvider><Tooltip><TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent side="top"><p className="text-xs">当前列表仅展示该组织下可见人员，重复归属自动去重</p></TooltipContent></Tooltip></TooltipProvider></span>) as unknown as string, minWidth: 80, render: (v) => <span className="font-medium text-foreground">{v}</span> },
  { key: "enterprise", title: "归属企业", minWidth: 200, render: (v) => <span className="text-foreground">{v}</span> },
  { key: "phone", title: "手机号", minWidth: 120 },
  { key: "status", title: "人员状态", minWidth: 90, render: (v) => <span className={v === "active" ? "badge-active" : "badge-inactive"}>{v === "active" ? "正常" : "停用"}</span> },
  { key: "products", title: "启用产品", minWidth: 160, render: (v: string[]) => <div className="flex flex-wrap gap-1">{v.map((p) => <span key={p} className="badge-product">{p}</span>)}</div> },
  { key: "role", title: "角色", minWidth: 100 },
  { key: "benefits", title: "权益", minWidth: 200, render: (v: string[]) => v.length ? <span className="text-[12px] text-primary">{v.join(" / ")}</span> : <span className="text-muted-foreground">-</span> },
];

/* ── Mini Benefit Card ── */
function MiniBenefitCard({ pkg }: { pkg: BenefitSummary }) {
  const cssVar = VARIANT_VARS[pkg.variant] || "--benefit-blue";
  const ratio = pkg.total > 0 ? pkg.used / pkg.total : 0;
  return (
    <div className="relative min-w-[200px] shrink-0 overflow-hidden rounded-xl px-4 py-3 transition-all hover:shadow-sm"
      style={{ border: `1px solid hsl(var(${cssVar}) / 0.15)`, background: `hsl(var(${cssVar}) / 0.03)` }}>
      <div className="absolute left-0 right-0 top-0 h-[2px] opacity-50" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="mb-1 text-[12px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</div>
      <div className="mb-2 text-[11px] text-muted-foreground">{pkg.date}</div>
      <div className="h-1 rounded-full mb-1.5" style={{ background: `hsl(var(${cssVar}) / 0.1)` }}>
        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: ratio > 0.8 ? `hsl(var(--warning))` : `hsl(var(${cssVar}))`, opacity: 0.7 }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>
          {pkg.used}<span className="font-normal opacity-40">/{pkg.total}</span>
        </span>
      </div>
    </div>
  );
}

/* ── Date Range Picker ── */
function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = (value || "").split(" ~ ");
  const startDate = parts[0] ? new Date(parts[0]) : undefined;
  const endDate = parts[1] ? new Date(parts[1]) : undefined;
  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) { onChange(""); return; }
    const from = range.from ? format(range.from, "yyyy-MM-dd") : "";
    const to = range.to ? format(range.to, "yyyy-MM-dd") : "";
    onChange(to ? `${from} ~ ${to}` : from);
  };
  const displayText = startDate && endDate
    ? `${format(startDate, "yyyy/MM/dd")} ~ ${format(endDate, "yyyy/MM/dd")}`
    : startDate ? `${format(startDate, "yyyy/MM/dd")} ~ 结束日期` : "";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("h-9 w-full justify-start rounded-lg border-input bg-card px-3 text-left text-[13px] font-normal shadow-none hover:bg-muted/40", !value && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50 shrink-0" />
          {displayText || <span>选择时间段</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-xl p-0" align="start">
        <Calendar mode="range" selected={startDate && endDate ? { from: startDate, to: endDate } : startDate ? { from: startDate, to: undefined } : undefined} onSelect={handleSelect as never} numberOfMonths={2} className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );
}

/* ── Benefit Config Dialog ── */
function BenefitConfigDialog({ open, onClose, staffName }: { open: boolean; onClose: () => void; staffName: string }) {
  const [benefits, setBenefits] = useState<BenefitPkg[]>([
    { id: "b1", name: "3D工具渲染权益包", desc: "含高清渲染、全景图、施工图", tone: "blue", dateRange: "2025-02-23 ~ 2028-02-23" },
  ]);
  

  const allCatalog = useMemo(() => {
    const items: { name: string; desc: string; tone: BenefitTone; productKey: string }[] = [];
    ALL_PRODUCT_KEYS.forEach((pk) => (BENEFIT_CATALOG[pk] || []).forEach((b) => items.push({ ...b, productKey: pk })));
    return items;
  }, []);

  const addBenefit = (item: typeof allCatalog[0]) => {
    if (benefits.find((b) => b.name === item.name)) return;
    setBenefits([...benefits, { id: `b-${Date.now()}`, name: item.name, desc: item.desc, tone: item.tone, dateRange: "2026-01-01 ~ 2028-12-31" }]);
  };

  const removeBenefit = (id: string) => setBenefits(benefits.filter((b) => b.id !== id));
  const updateBenefit = (id: string, field: string, value: unknown) => setBenefits(benefits.map((b) => b.id === id ? { ...b, [field]: value } : b));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[720px] max-h-[85vh] flex flex-col rounded-xl p-0">
        <div className="border-b px-5 py-4 shrink-0" style={{ background: "hsl(var(--muted) / 0.3)" }}>
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">权益设置 — {staffName}</DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">点击权益包卡片添加，下方配置使用周期</DialogDescription>
          </DialogHeader>
        </div>

        {/* Available — horizontal card row like staff list */}
        <div className="px-5 pt-4 pb-2 shrink-0">
          <div className="text-[12px] font-medium text-muted-foreground mb-2">可选权益包</div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allCatalog.map((item, i) => {
              const already = benefits.find((b) => b.name === item.name);
              const cssVar = VARIANT_VARS[item.tone];
              return (
                <div key={i}
                  className={cn(
                    "relative min-w-[170px] shrink-0 overflow-hidden rounded-xl px-3.5 py-3 transition-all",
                    already ? "opacity-35 cursor-not-allowed" : "hover:shadow-sm cursor-pointer"
                  )}
                  style={{ border: `1px solid hsl(var(${cssVar}) / 0.15)`, background: `hsl(var(${cssVar}) / 0.03)` }}
                  onClick={() => !already && addBenefit(item)}
                >
                  <div className="absolute left-0 right-0 top-0 h-[2px] opacity-50" style={{ background: `hsl(var(${cssVar}))` }} />
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[12px] font-semibold leading-tight" style={{ color: `hsl(var(${cssVar}))` }}>{item.name}</span>
                    {!already && <Plus className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary opacity-60" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                  {already && <div className="text-[10px] text-muted-foreground mt-1 font-medium">已添加</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Configured benefits — scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3">
          {benefits.length > 0 ? (
            <div>
              <div className="text-[12px] font-medium text-muted-foreground mb-2">已配置权益（{benefits.length}）</div>
              <div className="space-y-3">
                {benefits.map((pkg) => {
                  const cssVar = VARIANT_VARS[pkg.tone];
                  return (
                    <div key={pkg.id} className="rounded-xl border overflow-hidden" style={{ borderColor: `hsl(var(${cssVar}) / 0.15)` }}>
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `hsl(var(${cssVar}) / 0.03)` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-4 rounded-full" style={{ background: `hsl(var(${cssVar}))` }} />
                          <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</span>
                        </div>
                        <button className="p-1 rounded hover:bg-muted/60 transition-colors" onClick={() => removeBenefit(pkg.id)}>
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="px-4 py-3 border-t space-y-1.5" style={{ borderColor: `hsl(var(${cssVar}) / 0.1)` }}>
                        <label className="text-[12px] text-muted-foreground font-medium">使用周期</label>
                        <DateRangePicker value={pkg.dateRange} onChange={(v) => updateBenefit(pkg.id, "dateRange", v)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-[13px] text-muted-foreground text-center py-8">点击上方权益包卡片添加</div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t shrink-0">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={() => { toast.success("权益配置已更新"); onClose(); }}>保存</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Org Tree Node ── */
function OrgTreeNode({
  node, depth, selectedId, expandedIds, onToggleExpand, onSelect, onAction,
  editingId, editingName, onEditingNameChange, onSubmitEdit, onCancelEdit, staffData, orgTree,
}: {
  node: OrgNode; depth: number; selectedId: string; expandedIds: Set<string>;
  onToggleExpand: (id: string) => void; onSelect: (id: string) => void;
  onAction: (action: "add-sibling" | "add-child" | "rename" | "delete", node: OrgNode) => void;
  editingId: string | null; editingName: string; onEditingNameChange: (v: string) => void;
  onSubmitEdit: () => void; onCancelEdit: () => void; staffData: StaffMember[]; orgTree: OrgNode[];
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isRoot = node.id === "all";
  const isUnset = node.id === "unset";
  const isEditing = editingId === node.id;
  const count = countStaffInOrg(staffData, orgTree, node.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => { if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [isEditing]);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: rect.right });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const close = () => setMenuOpen(false);
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("mousedown", handlePointerDown); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [menuOpen, updateMenuPosition]);

  return (
    <div className={depth > 0 ? "ml-3" : ""}>
      <div className={`group flex items-center gap-1 rounded-lg px-2 py-[5px] text-[13px] transition-all ${isSelected ? "bg-primary/5 font-medium text-primary" : "text-foreground hover:bg-muted/60"}`}
        onClick={() => !isEditing && onSelect(node.id)}>
        {hasChildren ? (
          <button type="button" className="shrink-0 rounded p-0.5 transition-colors hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}>
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        ) : <span className="w-[22px] shrink-0" />}

        {isEditing ? (
          <input ref={inputRef} value={editingName}
            className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none ring-0 transition-colors focus:border-primary"
            onChange={(e) => onEditingNameChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={onSubmitEdit}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmitEdit(); } if (e.key === "Escape") { e.preventDefault(); onCancelEdit(); } }}
          />
        ) : <span className="flex-1 truncate">{node.name}</span>}

        <span className={`shrink-0 text-[11px] text-muted-foreground transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{count}</span>

        {!isRoot && !isEditing && (
          <button ref={triggerRef} type="button" className="shrink-0 rounded p-0.5 opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); if (menuOpen) { setMenuOpen(false); return; } updateMenuPosition(); setMenuOpen(true); }}>
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {menuOpen && createPortal(
        <div ref={menuRef} className="admin-action-menu" data-state="open" style={{ top: menuPos.top, left: menuPos.left, transform: "translateX(calc(-100% + 2px))" }}>
          {!isUnset && (
            <>
              <button type="button" className="admin-action-menu-item" onClick={() => { onAction("add-sibling", node); setMenuOpen(false); }}><FolderTree className="h-3.5 w-3.5" />新建同级组织</button>
              <button type="button" className="admin-action-menu-item" onClick={() => { onAction("add-child", node); setMenuOpen(false); }}><FolderPlus className="h-3.5 w-3.5" />新建子组织</button>
            </>
          )}
          <button type="button" className="admin-action-menu-item" onClick={() => { onAction("rename", node); setMenuOpen(false); }}><Edit2 className="h-3.5 w-3.5" />重命名</button>
          {!isUnset && (
            <button type="button" className="admin-action-menu-item admin-action-menu-item-danger" onClick={() => { onAction("delete", node); setMenuOpen(false); }}><Trash2 className="h-3.5 w-3.5" />删除</button>
          )}
        </div>, document.body)}

      {hasChildren && isExpanded && node.children!.map((child) => (
        <OrgTreeNode key={child.id} node={child} depth={depth + 1} selectedId={selectedId} expandedIds={expandedIds}
          onToggleExpand={onToggleExpand} onSelect={onSelect} onAction={onAction}
          editingId={editingId} editingName={editingName} onEditingNameChange={onEditingNameChange}
          onSubmitEdit={onSubmitEdit} onCancelEdit={onCancelEdit} staffData={staffData} orgTree={orgTree} />
      ))}
    </div>
  );
}

/* ══════════════════════════
   Main Component
   ══════════════════════════ */
export default function StaffList() {
  const navigate = useNavigate();
  const [data] = useState<StaffMember[]>(generateStaff);
  const [orgTree, setOrgTree] = useState<OrgNode[]>(initialOrgTree);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [activeTab, setActiveTab] = useState("全部");
  const [benefitCollapsed, setBenefitCollapsed] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["all", "hq", "supply", "south"]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingMode, setEditingMode] = useState<"create" | "rename" | null>(null);
  const [editingOriginName, setEditingOriginName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OrgNode | null>(null);
  const [benefitDialogStaff, setBenefitDialogStaff] = useState<StaffMember | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const startInlineEdit = useCallback((nodeId: string, name: string, mode: "create" | "rename") => {
    setEditingId(nodeId); setEditingName(name); setEditingMode(mode); setEditingOriginName(name);
  }, []);

  const handleCreateRoot = useCallback(() => {
    const newId = `org-${Date.now()}`;
    const draft: OrgNode = { id: newId, name: "未命名组织", isDraft: true };
    setOrgTree((prev) => insertChildNode(prev, "all", draft));
    setExpandedIds((prev) => new Set(prev).add("all"));
    setSelectedOrg(newId);
    startInlineEdit(newId, draft.name, "create");
  }, [startInlineEdit]);

  const handleNodeAction = useCallback((action: "add-sibling" | "add-child" | "rename" | "delete", node: OrgNode) => {
    if (action === "rename") { startInlineEdit(node.id, node.name, "rename"); return; }
    if (action === "delete") { setDeleteTarget(node); return; }
    const newId = `org-${Date.now()}`;
    const draft: OrgNode = { id: newId, name: "未命名组织", isDraft: true };
    if (action === "add-child") { setOrgTree((prev) => insertChildNode(prev, node.id, draft)); setExpandedIds((prev) => new Set(prev).add(node.id)); }
    if (action === "add-sibling") { setOrgTree((prev) => insertSiblingNode(prev, node.id, draft)); }
    setSelectedOrg(newId);
    startInlineEdit(newId, draft.name, "create");
  }, [startInlineEdit]);

  const handleSubmitEdit = useCallback(() => {
    if (!editingId || !editingMode) return;
    const trimmed = editingName.trim();
    if (!trimmed) {
      if (editingMode === "create") { setOrgTree((prev) => removeNodeById(prev, editingId)); if (selectedOrg === editingId) setSelectedOrg("all"); }
      else { setOrgTree((prev) => renameNodeById(prev, editingId, editingOriginName)); toast.error("组织名称不能为空"); }
    } else {
      setOrgTree((prev) => renameNodeById(prev, editingId, trimmed, true));
      toast.success(editingMode === "create" ? `已创建组织「${trimmed}」` : `已重命名为「${trimmed}」`);
    }
    setEditingId(null); setEditingName(""); setEditingMode(null); setEditingOriginName("");
  }, [editingId, editingMode, editingName, editingOriginName, selectedOrg]);

  const handleCancelEdit = useCallback(() => {
    if (!editingId || !editingMode) return;
    if (editingMode === "create") { setOrgTree((prev) => removeNodeById(prev, editingId)); if (selectedOrg === editingId) setSelectedOrg("all"); }
    else { setOrgTree((prev) => renameNodeById(prev, editingId, editingOriginName)); }
    setEditingId(null); setEditingName(""); setEditingMode(null); setEditingOriginName("");
  }, [editingId, editingMode, editingOriginName, selectedOrg]);

  const handleDelete = useCallback((nodeId: string) => {
    setOrgTree((prev) => removeNodeById(prev, nodeId));
    if (selectedOrg === nodeId) setSelectedOrg("all");
    toast.success("组织已删除");
  }, [selectedOrg]);

  /* Filter benefits by active product tab */
  const visibleBenefits = useMemo(() => {
    if (activeTab === "全部") return BENEFIT_SUMMARIES;
    return BENEFIT_SUMMARIES.filter((b) => b.product === activeTab);
  }, [activeTab]);

  const filteredData = useMemo(() => {
    let list = data;
    if (selectedOrg === "unset") list = list.filter((s) => s.orgIds.length === 0);
    else if (selectedOrg !== "all") { const ids = new Set(collectOrgIds(orgTree, selectedOrg)); list = list.filter((s) => s.orgIds.some((oid) => ids.has(oid))); }
    const seen = new Set<string>();
    list = list.filter((s) => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
    if (filters.name) list = list.filter((s) => s.name.includes(filters.name));
    if (filters.phone) list = list.filter((s) => s.phone.includes(filters.phone));
    if (filters.status) list = list.filter((s) => s.status === filters.status);
    if (filters.role) list = list.filter((s) => s.role === filters.role);
    return list;
  }, [data, selectedOrg, orgTree, filters]);

  const totalItems = filteredData.length;
  const selectedOrgNode = findNode(orgTree, selectedOrg);

  const actions: ActionItem<StaffMember>[] = [
    { label: "查看", onClick: (r) => navigate(`/enterprise/staff/detail/${r.id}`) },
    { label: "权益设置", onClick: (r) => setBenefitDialogStaff(r) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="人员管理" subtitle={`共 ${totalItems} 位人员`} actions={
        <>
          <button className="btn-secondary"><Download className="h-4 w-4" />权益购买</button>
          <button className="btn-secondary">授权记录</button>
          <button className="btn-primary" onClick={() => navigate("/enterprise/staff/create")}><Plus className="h-4 w-4" />新建人员</button>
        </>
      } />

      {/* Benefit Summary with product tabs + collapsible */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center justify-between px-5 pt-3.5 pb-1">
          <div className="flex items-center gap-1">
            {PRODUCT_TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-[13px] transition-all ${activeTab === tab ? "bg-primary/5 font-medium text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setBenefitCollapsed(!benefitCollapsed)}>
            {benefitCollapsed ? "展开" : "收起"}
            {benefitCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
        {!benefitCollapsed && (
          <div className="overflow-x-auto px-5 pb-4 pt-2">
            <div className="flex gap-3">
              {visibleBenefits.length > 0 ? visibleBenefits.map((pkg, i) => <MiniBenefitCard key={i} pkg={pkg} />) : (
                <div className="text-[13px] text-muted-foreground py-3">该产品下暂无权益包</div>
              )}
            </div>
          </div>
        )}
      </div>

      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />

      <div className="grid grid-cols-[260px_minmax(0,1fr)] gap-4 items-start">
        <section className="sticky top-4 flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card h-[calc(100vh-100px)]" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">组织架构</span>
            </div>
            <button className="flex items-center gap-1 text-[12px] font-medium text-primary transition-colors hover:text-primary/80" onClick={handleCreateRoot}>
              <Plus className="h-3.5 w-3.5" /> 新建
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {orgTree.map((node) => (
              <OrgTreeNode key={node.id} node={node} depth={0} selectedId={selectedOrg} expandedIds={expandedIds}
                onToggleExpand={toggleExpand} onSelect={setSelectedOrg} onAction={handleNodeAction}
                editingId={editingId} editingName={editingName} onEditingNameChange={setEditingName}
                onSubmitEdit={handleSubmitEdit} onCancelEdit={handleCancelEdit} staffData={data} orgTree={orgTree} />
            ))}
          </div>
        </section>

        <section>
          <AdminTable columns={columns} data={filteredData} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
          <div className="rounded-xl border bg-card mt-4" style={{ boxShadow: "var(--shadow-xs)" }}>
            <Pagination current={currentPage} total={totalItems} pageSize={pageSize} onPageChange={setCurrentPage}
              onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
          </div>
        </section>
      </div>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除组织</AlertDialogTitle>
            <AlertDialogDescription>删除「{deleteTarget?.name}」后，该组织及其子组织将被移除，归属人员会回到未设置组织架构。此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) handleDelete(deleteTarget.id); setDeleteTarget(null); }}>确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Benefit Config Dialog */}
      <BenefitConfigDialog open={!!benefitDialogStaff} onClose={() => setBenefitDialogStaff(null)} staffName={benefitDialogStaff?.name || ""} />
    </div>
  );
}
