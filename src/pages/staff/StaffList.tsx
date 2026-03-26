import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, ChevronRight, ChevronDown, Users, MoreHorizontal, Edit2, Trash2, FolderPlus, FolderTree } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

/* ── Types ── */
interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
}

interface StaffMember {
  id: string;
  name: string;
  enterprise: string;
  phone: string;
  status: "active" | "inactive";
  products: string[];
  role: string;
  benefits: string[];
  orgIds: string[]; // supports multi-org membership
  createdAt: string;
}

/* ── Mock Org Tree ── */
const initialOrgTree: OrgNode[] = [
  {
    id: "all", name: "全部", children: [
      { id: "unset", name: "未设置组织架构" },
      {
        id: "hq", name: "总部", children: [
          { id: "model", name: "模型部" },
          { id: "design", name: "设计部" },
        ]
      },
      {
        id: "supply", name: "供应链", children: [
          {
            id: "south", name: "华南供应链", children: [
              { id: "sd-supply", name: "山东供应链" },
              { id: "hb-supply", name: "河北供应链" },
              { id: "tj-supply", name: "天津供应链" },
            ]
          },
          { id: "north", name: "华北供应链" },
        ]
      },
    ]
  },
];

/* ── Benefit Cards ── */
const BENEFIT_TABS = ["全部", "国际3D工具", "国内3D工具", "智能导购", "精准客资"];

interface BenefitSummary {
  name: string;
  date: string;
  used: number;
  total: number;
  variant: string;
}

const BENEFIT_SUMMARIES: BenefitSummary[] = [
  { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "blue" },
  { name: "3D工具渲染权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "teal" },
  { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "rose" },
  { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "violet" },
  { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "amber" },
  { name: "智能导购权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "blue" },
  { name: "精准客资权益包", date: "2025.2.23—2028.2.23", used: 20, total: 30, variant: "rose" },
];

const VARIANT_VARS: Record<string, string> = {
  blue: "--benefit-blue",
  teal: "--benefit-teal",
  violet: "--benefit-violet",
  amber: "--benefit-amber",
  rose: "--benefit-rose",
};

/* ── Mock Staff Data ── */
const NAMES = ["王小二", "李博然", "刘晓宇", "贾西贝", "员工2号", "员工3号", "员工4号", "员工1号", "员工5号", "员工6号"];
const ENTERPRISES = ["广州珊珊光纤有限公司", "广州光纤有限公司/佛山店", "广州珊珊光纤有限公司/.../佛山店"];
const PRODUCTS_LIST = ["国内3D", "国际3D", "智能导购"];
const ROLES = ["企业管理员", "设计师", "店长", "导购", "模型管理员", "精准客资"];
const BENEFITS_LIST = ["工具极速渲染", "导购AI生图", "工具极速渲染 / 导购AI生图"];
const ORG_IDS = ["hq", "model", "design", "supply", "south", "north", "sd-supply", "hb-supply", "tj-supply"];

function generateStaff(): StaffMember[] {
  return Array.from({ length: 20 }, (_, i) => {
    // Each staff belongs to 1-3 orgs randomly
    const numOrgs = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...ORG_IDS].sort(() => Math.random() - 0.5);
    const orgIds = shuffled.slice(0, numOrgs);
    if (Math.random() < 0.2) orgIds.length = 0; // some unassigned

    return {
      id: `S${String(i + 1).padStart(3, "0")}`,
      name: NAMES[i % NAMES.length],
      enterprise: ENTERPRISES[i % ENTERPRISES.length],
      phone: `185****${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: Math.random() > 0.3 ? "active" as const : "inactive" as const,
      products: [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)], ...(Math.random() > 0.5 ? [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)]] : [])].filter((v, idx, a) => a.indexOf(v) === idx),
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      benefits: Math.random() > 0.4 ? [BENEFITS_LIST[Math.floor(Math.random() * BENEFITS_LIST.length)]] : [],
      orgIds,
      createdAt: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    };
  });
}

/* ── Helpers ── */
/** Collect all descendant IDs of a node (inclusive) */
function collectOrgIds(nodes: OrgNode[], targetId: string): string[] {
  const result: string[] = [];
  function walk(list: OrgNode[], collecting: boolean) {
    for (const n of list) {
      const match = collecting || n.id === targetId;
      if (match) result.push(n.id);
      if (n.children) walk(n.children, match);
    }
  }
  walk(nodes, false);
  return result;
}

/** Count staff in a given org node (including descendants), with dedup */
function countStaffInOrg(staff: StaffMember[], orgTree: OrgNode[], orgId: string): number {
  if (orgId === "all") return staff.length;
  if (orgId === "unset") return staff.filter(s => s.orgIds.length === 0).length;
  const ids = new Set(collectOrgIds(orgTree, orgId));
  return staff.filter(s => s.orgIds.some(oid => ids.has(oid))).length;
}

/* ── Filter Fields ── */
const filterFields: FilterField[] = [
  { key: "name", label: "姓名", type: "input", placeholder: "请输入", width: 140 },
  { key: "phone", label: "手机号", type: "input", placeholder: "请输入", width: 140 },
  { key: "status", label: "人员状态", type: "select", options: [{ label: "正常", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
  { key: "role", label: "角色", type: "select", options: ROLES.map(r => ({ label: r, value: r })), width: 130 },
];

/* ── Columns ── */
const columns: TableColumn<StaffMember>[] = [
  { key: "name", title: "人员", minWidth: 80, render: (v) => <span className="font-medium text-foreground">{v}</span> },
  { key: "enterprise", title: "归属企业", minWidth: 200, render: (v) => <span className="text-foreground">{v}</span> },
  { key: "phone", title: "手机号", minWidth: 120 },
  {
    key: "status", title: "人员状态", minWidth: 90,
    render: (v) => <span className={v === "active" ? "badge-active" : "badge-inactive"}>{v === "active" ? "正常" : "停用"}</span>,
  },
  {
    key: "products", title: "启用产品", minWidth: 160,
    render: (v: string[]) => <div className="flex gap-1 flex-wrap">{v.map((p) => <span key={p} className="badge-product">{p}</span>)}</div>,
  },
  { key: "role", title: "角色", minWidth: 100 },
  {
    key: "benefits", title: "权益", minWidth: 200,
    render: (v: string[]) => v.length ? <span className="text-primary text-[12px]">{v.join(" / ")}</span> : <span className="text-muted-foreground">-</span>,
  },
];

/* ══════════════════════════════════════════════
   OrgTree Component — full CRUD via hover menu
   ══════════════════════════════════════════════ */
function OrgTreeNode({ node, selectedId, onSelect, onAction, depth, staffData, orgTree }: {
  node: OrgNode;
  selectedId: string;
  onSelect: (id: string) => void;
  onAction: (action: "add-sibling" | "add-child" | "rename" | "delete", node: OrgNode) => void;
  depth: number;
  staffData: StaffMember[];
  orgTree: OrgNode[];
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;
  const isRoot = node.id === "all";
  const isUnset = node.id === "unset";
  const count = countStaffInOrg(staffData, orgTree, node.id);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className={depth > 0 ? "ml-3" : ""}>
      <div
        className={`flex items-center gap-1 py-[5px] px-2 rounded-lg cursor-pointer transition-all text-[13px] group relative ${
          isSelected ? "bg-primary/5 text-primary font-medium" : "text-foreground hover:bg-muted/60"
        }`}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            className="p-0.5 rounded hover:bg-muted transition-colors shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded
              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        ) : (
          <span className="w-[22px] shrink-0" />
        )}

        <span className="flex-1 truncate">{node.name}</span>

        {/* Count — always visible for selected, hover for others */}
        <span className={`text-[11px] text-muted-foreground transition-opacity shrink-0 ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}>
          {count}
        </span>

        {/* Action button — hover to show */}
        {!isRoot && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            >
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full z-50 mt-1 w-[150px] rounded-lg border border-border/80 bg-popover py-1"
                style={{ boxShadow: "var(--shadow-lg)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {!isUnset && (
                  <>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors"
                      onClick={() => { onAction("add-sibling", node); setMenuOpen(false); }}
                    >
                      <FolderTree className="h-3.5 w-3.5 text-muted-foreground" /> 新建同级组织
                    </button>
                    <button
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors"
                      onClick={() => { onAction("add-child", node); setMenuOpen(false); }}
                    >
                      <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" /> 新建子组织
                    </button>
                  </>
                )}
                <button
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors"
                  onClick={() => { onAction("rename", node); setMenuOpen(false); }}
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" /> 重命名
                </button>
                {!isUnset && (
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-muted transition-colors"
                    onClick={() => { onAction("delete", node); setMenuOpen(false); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> 删除
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && node.children!.map((child) => (
        <OrgTreeNode
          key={child.id}
          node={child}
          selectedId={selectedId}
          onSelect={onSelect}
          onAction={onAction}
          depth={depth + 1}
          staffData={staffData}
          orgTree={orgTree}
        />
      ))}
    </div>
  );
}

/* ── Mini Benefit Card ── */
function MiniBenefitCard({ pkg }: { pkg: BenefitSummary }) {
  const cssVar = VARIANT_VARS[pkg.variant] || "--benefit-blue";
  return (
    <div
      className="rounded-xl px-4 py-3 min-w-[200px] relative overflow-hidden transition-all hover:shadow-sm shrink-0"
      style={{
        border: `1px solid hsl(var(${cssVar}) / 0.15)`,
        background: `hsl(var(${cssVar}) / 0.03)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-50" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="text-[12px] font-semibold mb-1" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</div>
      <div className="text-[11px] text-muted-foreground mb-2">{pkg.date}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>
          {pkg.used}<span className="opacity-40 font-normal">/{pkg.total}</span>
        </span>
      </div>
    </div>
  );
}

/* ── Org Edit Dialog ── */
function OrgEditDialog({ open, onClose, mode, initialName, onConfirm }: {
  open: boolean;
  onClose: () => void;
  mode: "add" | "rename";
  initialName: string;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  useEffect(() => { setName(initialName); }, [initialName]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b px-5 py-4" style={{ background: "hsl(var(--muted) / 0.3)" }}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-[15px] font-semibold text-foreground">
              {mode === "add" ? "新建组织" : "重命名组织"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              {mode === "add" ? "请输入新组织名称" : "请输入新的组织名称"}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground shrink-0 w-[70px] text-right">组织名称</label>
            <input
              className="filter-input flex-1"
              placeholder="请输入组织名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-4">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            disabled={!name.trim()}
            onClick={() => { onConfirm(name.trim()); setName(""); }}
          >
            确认
          </button>
        </div>
      </DialogContent>
    </Dialog>
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

  // Org edit state
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgDialogMode, setOrgDialogMode] = useState<"add" | "rename">("add");
  const [orgDialogTarget, setOrgDialogTarget] = useState(""); // parentId for add, nodeId for rename
  const [orgDialogInitName, setOrgDialogInitName] = useState("");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<OrgNode | null>(null);

  /* ── Org tree mutations ── */
  const addNodeUnder = useCallback((parentId: string, name: string) => {
    const newNode: OrgNode = { id: `org-${Date.now()}`, name };
    const insert = (nodes: OrgNode[]): OrgNode[] =>
      nodes.map(n => {
        if (n.id === parentId) return { ...n, children: [...(n.children || []), newNode] };
        return { ...n, children: n.children ? insert(n.children) : undefined };
      });
    setOrgTree(prev => insert(prev));
    toast.success(`已创建组织「${name}」`);
  }, []);

  const addSiblingOf = useCallback((nodeId: string, name: string) => {
    const newNode: OrgNode = { id: `org-${Date.now()}`, name };
    const insertSibling = (nodes: OrgNode[]): OrgNode[] => {
      // Check if nodeId is a direct child here
      const idx = nodes.findIndex(n => n.id === nodeId);
      if (idx !== -1) {
        const copy = [...nodes];
        copy.splice(idx + 1, 0, newNode); // insert after current
        return copy;
      }
      return nodes.map(n => ({ ...n, children: n.children ? insertSibling(n.children) : undefined }));
    };
    setOrgTree(prev => insertSibling(prev));
    toast.success(`已创建组织「${name}」`);
  }, []);

  const renameNode = useCallback((nodeId: string, name: string) => {
    const rename = (nodes: OrgNode[]): OrgNode[] =>
      nodes.map(n => {
        if (n.id === nodeId) return { ...n, name };
        return { ...n, children: n.children ? rename(n.children) : undefined };
      });
    setOrgTree(prev => rename(prev));
    toast.success(`已重命名为「${name}」`);
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    const remove = (nodes: OrgNode[]): OrgNode[] =>
      nodes.filter(n => n.id !== nodeId).map(n => ({ ...n, children: n.children ? remove(n.children) : undefined }));
    setOrgTree(prev => remove(prev));
    if (selectedOrg === nodeId) setSelectedOrg("all");
    toast.success("组织已删除");
  }, [selectedOrg]);

  // Unified action handler from tree nodes
  const [pendingAction, setPendingAction] = useState<{ type: "add-sibling" | "add-child"; nodeId: string } | null>(null);

  const handleTreeAction = useCallback((action: "add-sibling" | "add-child" | "rename" | "delete", node: OrgNode) => {
    switch (action) {
      case "add-child":
        setPendingAction({ type: "add-child", nodeId: node.id });
        setOrgDialogMode("add");
        setOrgDialogTarget(node.id);
        setOrgDialogInitName("");
        setOrgDialogOpen(true);
        break;
      case "add-sibling":
        setPendingAction({ type: "add-sibling", nodeId: node.id });
        setOrgDialogMode("add");
        setOrgDialogTarget(node.id);
        setOrgDialogInitName("");
        setOrgDialogOpen(true);
        break;
      case "rename":
        setPendingAction(null);
        setOrgDialogMode("rename");
        setOrgDialogTarget(node.id);
        setOrgDialogInitName(node.name);
        setOrgDialogOpen(true);
        break;
      case "delete":
        setDeleteTarget(node);
        break;
    }
  }, []);

  const handleOrgConfirm = useCallback((name: string) => {
    if (orgDialogMode === "rename") {
      renameNode(orgDialogTarget, name);
    } else if (pendingAction?.type === "add-child") {
      addNodeUnder(pendingAction.nodeId, name);
    } else if (pendingAction?.type === "add-sibling") {
      addSiblingOf(pendingAction.nodeId, name);
    }
    setOrgDialogOpen(false);
    setPendingAction(null);
  }, [orgDialogMode, orgDialogTarget, pendingAction, renameNode, addNodeUnder, addSiblingOf]);

  // Global "新建" = add level-1 org (direct child of "all")
  const handleGlobalAdd = useCallback(() => {
    setPendingAction({ type: "add-child", nodeId: "all" });
    setOrgDialogMode("add");
    setOrgDialogTarget("all");
    setOrgDialogInitName("");
    setOrgDialogOpen(true);
  }, []);

  /* ── Filtered staff data ── */
  const filteredData = useMemo(() => {
    let list = data;

    // Filter by selected org
    if (selectedOrg === "unset") {
      list = list.filter(s => s.orgIds.length === 0);
    } else if (selectedOrg !== "all") {
      const validIds = new Set(collectOrgIds(orgTree, selectedOrg));
      list = list.filter(s => s.orgIds.some(oid => validIds.has(oid)));
    }

    // Dedup by id
    const seen = new Set<string>();
    list = list.filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

    // Apply text filters
    if (filters.name) list = list.filter(s => s.name.includes(filters.name));
    if (filters.phone) list = list.filter(s => s.phone.includes(filters.phone));
    if (filters.status) list = list.filter(s => s.status === filters.status);
    if (filters.role) list = list.filter(s => s.role === filters.role);

    return list;
  }, [data, selectedOrg, orgTree, filters]);

  const totalItems = filteredData.length;

  const actions: ActionItem<StaffMember>[] = [
    { label: "查看", onClick: (r) => navigate(`/enterprise/staff/detail/${r.id}`) },
    { label: "权益设置", onClick: (r) => navigate(`/enterprise/staff/detail/${r.id}`) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="人员管理"
        subtitle={`共 ${totalItems} 位人员`}
        actions={
          <>
            <button className="btn-secondary"><Download className="h-4 w-4" />权益购买</button>
            <button className="btn-secondary">授权记录</button>
            <button className="btn-primary" onClick={() => navigate("/enterprise/staff/create")}>
              <Plus className="h-4 w-4" />新建人员
            </button>
          </>
        }
      />

      {/* Benefit Tabs + Cards */}
      <div className="bg-card rounded-xl border border-border/80 overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center gap-1 px-5 pt-4 pb-2">
          {BENEFIT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[13px] rounded-lg transition-all ${
                activeTab === tab
                  ? "text-primary font-medium bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="px-5 pb-4 overflow-x-auto">
          <div className="flex gap-3">
            {BENEFIT_SUMMARIES.map((pkg, i) => <MiniBenefitCard key={i} pkg={pkg} />)}
          </div>
        </div>
      </div>

      {/* Filter */}
      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={4}
      />

      {/* Main: Org Tree + Table */}
      <div className="flex gap-4">
        {/* Org Tree Sidebar */}
        <div className="w-[240px] shrink-0 bg-card rounded-xl border border-border/80 overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">组织架构</span>
            </div>
            <button
              className="text-[12px] text-primary hover:text-primary/80 transition-colors font-medium flex items-center gap-1"
              onClick={handleGlobalAdd}
            >
              <Plus className="h-3.5 w-3.5" /> 新建
            </button>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            {orgTree.map(node => (
              <OrgTreeNode
                key={node.id}
                node={node}
                selectedId={selectedOrg}
                onSelect={setSelectedOrg}
                onAction={handleTreeAction}
                depth={0}
                staffData={data}
                orgTree={orgTree}
              />
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-w-0 space-y-4">
          <AdminTable
            columns={columns}
            data={filteredData}
            rowKey={(r) => r.id}
            actions={actions}
            maxVisibleActions={2}
          />
          <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
            <Pagination
              current={currentPage}
              total={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Org Edit Dialog */}
      <OrgEditDialog
        open={orgDialogOpen}
        onClose={() => { setOrgDialogOpen(false); setPendingAction(null); }}
        mode={orgDialogMode}
        initialName={orgDialogInitName}
        onConfirm={handleOrgConfirm}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除组织</AlertDialogTitle>
            <AlertDialogDescription>
              删除「{deleteTarget?.name}」后，该组织及其所有子组织将被移除，归属人员将变为未分配状态。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteNode(deleteTarget.id); setDeleteTarget(null); }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
