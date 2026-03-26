import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, ChevronRight, ChevronDown, Users, MoreHorizontal, Edit2, Trash2, FolderPlus } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ── Types ── */
interface OrgNode {
  id: string;
  name: string;
  count: number;
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
  orgPath: string;
  createdAt: string;
  _level?: number;
}

/* ── Mock Org Tree ── */
const initialOrgTree: OrgNode[] = [
  {
    id: "all", name: "全部", count: 38, children: [
      { id: "unset", name: "未设置组织架构", count: 24 },
      {
        id: "hq", name: "总部", count: 2, children: [
          { id: "model", name: "模型部", count: 8 },
          { id: "design", name: "设计部", count: 5 },
        ]
      },
      {
        id: "supply", name: "供应链", count: 10, children: [
          {
            id: "south", name: "华南供应链", count: 2, children: [
              { id: "sd-supply", name: "山东供应链", count: 2 },
              { id: "hb-supply", name: "河北供应链", count: 3 },
              { id: "tj-supply", name: "天津供应链", count: 3 },
            ]
          },
          { id: "north", name: "华北供应链", count: 8 },
        ]
      },
    ]
  },
];

/* ── Mock Benefit Cards ── */
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

/* ── Mock Staff Data ── */
const NAMES = ["王小二", "李博然", "刘晓宇", "贾西贝", "员工2号", "员工3号", "员工4号", "员工1号", "员工4号", "员工6号"];
const ENTERPRISES = [
  "广州珊珊光纤有限公司",
  "广州光纤有限公司/佛山店",
  "广州珊珊光纤有限公司/.../佛山店",
];
const PRODUCTS_LIST = ["国内3D", "国际3D", "智能导购"];
const ROLES = ["企业管理员", "设计师", "店长", "导购", "模型管理员", "精准客资"];
const BENEFITS_LIST = ["工具极速渲染", "导购AI生图", "工具极速渲染 / 导购AI生图"];

function generateStaff(): StaffMember[] {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `S${String(i + 1).padStart(3, "0")}`,
    name: NAMES[i % NAMES.length],
    enterprise: ENTERPRISES[i % ENTERPRISES.length],
    phone: `185****${String(Math.floor(Math.random() * 9000) + 1000)}`,
    status: Math.random() > 0.3 ? "active" as const : "inactive" as const,
    products: [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)], ...(Math.random() > 0.5 ? [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)]] : [])].filter((v, i, a) => a.indexOf(v) === i),
    role: ROLES[Math.floor(Math.random() * ROLES.length)],
    benefits: Math.random() > 0.4 ? [BENEFITS_LIST[Math.floor(Math.random() * BENEFITS_LIST.length)]] : [],
    orgPath: ["总部", "供应链/华南供应链", "模型部", "设计部", "供应链/华北供应链"][Math.floor(Math.random() * 5)],
    createdAt: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  }));
}

/* ── Benefit Card Vars ── */
const VARIANT_VARS: Record<string, string> = {
  blue: "--benefit-blue",
  teal: "--benefit-teal",
  violet: "--benefit-violet",
  amber: "--benefit-amber",
  rose: "--benefit-rose",
};

/* ── Filter Fields ── */
const filterFields: FilterField[] = [
  { key: "name", label: "企业名称", type: "input", placeholder: "请输入", width: 160 },
  { key: "id", label: "企业ID", type: "input", placeholder: "请输入", width: 140 },
  { key: "type", label: "企业类型", type: "select", options: [{ label: "品牌商", value: "brand" }, { label: "经销商", value: "dealer" }], width: 130 },
  { key: "staffType", label: "企业类型", type: "select", options: [{ label: "正式", value: "formal" }, { label: "试用", value: "trial" }], width: 130 },
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

/* ── Org Tree Component ── */
function OrgTree({ nodes, selectedId, onSelect, onAddChild, onRename, onDelete, depth = 0 }: {
  nodes: OrgNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["all", "supply", "south", "hq"]));
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  return (
    <div className={depth > 0 ? "ml-3" : ""}>
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expanded.has(node.id);
        const isSelected = selectedId === node.id;
        const isMenuOpen = menuOpen === node.id;
        return (
          <div key={node.id}>
            <div
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all text-[13px] group relative ${
                isSelected ? "bg-primary/5 text-primary font-medium" : "text-foreground hover:bg-muted/60"
              }`}
              onClick={() => onSelect(node.id)}
            >
              {hasChildren ? (
                <button
                  className="p-0.5 rounded hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      next.has(node.id) ? next.delete(node.id) : next.add(node.id);
                      return next;
                    });
                  }}
                >
                  {isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>
              ) : (
                <span className="w-[22px]" />
              )}
              <span className="flex-1 truncate">{node.name}</span>
              <span className="text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                ({node.count}人)
              </span>
              {node.id !== "all" && (
                <button
                  className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(isMenuOpen ? null : node.id);
                  }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {/* Context menu */}
              {isMenuOpen && node.id !== "all" && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 w-[140px] rounded-lg border bg-popover py-1"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors"
                    onClick={() => { onAddChild(node.id); setMenuOpen(null); }}
                  >
                    <FolderPlus className="h-3.5 w-3.5" /> 添加子部门
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted transition-colors"
                    onClick={() => { onRename(node.id, node.name); setMenuOpen(null); }}
                  >
                    <Edit2 className="h-3.5 w-3.5" /> 重命名
                  </button>
                  {node.id !== "unset" && (
                    <button
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-muted transition-colors"
                      style={{ color: "hsl(var(--destructive))" }}
                      onClick={() => { onDelete(node.id); setMenuOpen(null); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> 删除
                    </button>
                  )}
                </div>
              )}
            </div>
            {hasChildren && isExpanded && (
              <OrgTree nodes={node.children!} selectedId={selectedId} onSelect={onSelect} onAddChild={onAddChild} onRename={onRename} onDelete={onDelete} depth={depth + 1} />
            )}
          </div>
        );
      })}
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
        border: `1px solid hsl(${cssVar.replace('--', 'var(--')}) / 0.15)`,
        background: `hsl(${cssVar.replace('--', 'var(--')}) / 0.03)`,
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px] overflow-hidden rounded-xl border bg-card p-0" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b px-5 py-4" style={{ background: "hsl(var(--muted) / 0.3)" }}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-[15px] font-semibold text-foreground">
              {mode === "add" ? "添加子部门" : "重命名部门"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-muted-foreground">
              {mode === "add" ? "请输入新部门名称" : "请输入新的部门名称"}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground shrink-0 w-[70px] text-right">部门名称</label>
            <input
              className="filter-input flex-1"
              placeholder="请输入部门名称"
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

export default function StaffList() {
  const navigate = useNavigate();
  const [data] = useState<StaffMember[]>(generateStaff);
  const [orgTree, setOrgTree] = useState<OrgNode[]>(initialOrgTree);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [activeTab, setActiveTab] = useState("全部");
  const totalItems = 38;

  // Org edit state
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [orgDialogMode, setOrgDialogMode] = useState<"add" | "rename">("add");
  const [orgDialogTarget, setOrgDialogTarget] = useState("");
  const [orgDialogInitName, setOrgDialogInitName] = useState("");

  const handleOrgAddChild = useCallback((parentId: string) => {
    setOrgDialogMode("add");
    setOrgDialogTarget(parentId);
    setOrgDialogInitName("");
    setOrgDialogOpen(true);
  }, []);

  const handleOrgRename = useCallback((id: string, name: string) => {
    setOrgDialogMode("rename");
    setOrgDialogTarget(id);
    setOrgDialogInitName(name);
    setOrgDialogOpen(true);
  }, []);

  const handleOrgDelete = useCallback((id: string) => {
    const deleteNode = (nodes: OrgNode[]): OrgNode[] =>
      nodes.filter((n) => n.id !== id).map((n) => ({ ...n, children: n.children ? deleteNode(n.children) : undefined }));
    setOrgTree((prev) => deleteNode(prev));
    toast.success("部门已删除");
  }, []);

  const handleOrgConfirm = useCallback((name: string) => {
    if (orgDialogMode === "add") {
      const addChild = (nodes: OrgNode[]): OrgNode[] =>
        nodes.map((n) => {
          if (n.id === orgDialogTarget) {
            const newChild: OrgNode = { id: `org-${Date.now()}`, name, count: 0 };
            return { ...n, children: [...(n.children || []), newChild] };
          }
          return { ...n, children: n.children ? addChild(n.children) : undefined };
        });
      setOrgTree((prev) => addChild(prev));
      toast.success(`已添加部门「${name}」`);
    } else {
      const rename = (nodes: OrgNode[]): OrgNode[] =>
        nodes.map((n) => {
          if (n.id === orgDialogTarget) return { ...n, name };
          return { ...n, children: n.children ? rename(n.children) : undefined };
        });
      setOrgTree((prev) => rename(prev));
      toast.success(`部门已重命名为「${name}」`);
    }
    setOrgDialogOpen(false);
  }, [orgDialogMode, orgDialogTarget]);

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
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
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
              onClick={() => handleOrgAddChild("all")}
            >
              <Plus className="h-3.5 w-3.5" /> 新建
            </button>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            <OrgTree
              nodes={orgTree}
              selectedId={selectedOrg}
              onSelect={setSelectedOrg}
              onAddChild={handleOrgAddChild}
              onRename={handleOrgRename}
              onDelete={handleOrgDelete}
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 min-w-0 space-y-4">
          <AdminTable
            columns={columns}
            data={data}
            rowKey={(r) => r.id}
            actions={actions}
            maxVisibleActions={2}
          />
          <div className="bg-card rounded-xl border" style={{ boxShadow: 'var(--shadow-xs)' }}>
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
        onClose={() => setOrgDialogOpen(false)}
        mode={orgDialogMode}
        initialName={orgDialogInitName}
        onConfirm={handleOrgConfirm}
      />
    </div>
  );
}
