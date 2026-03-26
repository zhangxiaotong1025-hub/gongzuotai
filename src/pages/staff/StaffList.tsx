import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  ChevronRight,
  ChevronDown,
  Users,
  MoreHorizontal,
  Edit2,
  Trash2,
  FolderPlus,
  FolderTree,
} from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
  isDraft?: boolean;
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
  orgIds: string[];
  createdAt: string;
}

const initialOrgTree: OrgNode[] = [
  {
    id: "all",
    name: "全部",
    children: [
      { id: "unset", name: "未设置组织架构" },
      {
        id: "hq",
        name: "总部",
        children: [
          { id: "model", name: "模型部" },
          { id: "design", name: "设计部" },
        ],
      },
      {
        id: "supply",
        name: "供应链",
        children: [
          {
            id: "south",
            name: "华南供应链",
            children: [
              { id: "sd-supply", name: "山东供应链" },
              { id: "hb-supply", name: "河北供应链" },
              { id: "tj-supply", name: "天津供应链" },
            ],
          },
          { id: "north", name: "华北供应链" },
        ],
      },
    ],
  },
];

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
      products: [
        PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)],
        ...(Math.random() > 0.5 ? [PRODUCTS_LIST[Math.floor(Math.random() * PRODUCTS_LIST.length)]] : []),
      ].filter((v, idx, arr) => arr.indexOf(v) === idx),
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      benefits: Math.random() > 0.4 ? [BENEFITS_LIST[Math.floor(Math.random() * BENEFITS_LIST.length)]] : [],
      orgIds,
      createdAt: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    };
  });
}

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
  if (orgId === "unset") return staff.filter((item) => item.orgIds.length === 0).length;
  const ids = new Set(collectOrgIds(orgTree, orgId));
  return staff.filter((item) => item.orgIds.some((oid) => ids.has(oid))).length;
}

function insertChildNode(nodes: OrgNode[], parentId: string, newNode: OrgNode): OrgNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newNode] };
    }
    return { ...node, children: node.children ? insertChildNode(node.children, parentId, newNode) : undefined };
  });
}

function insertSiblingNode(nodes: OrgNode[], targetId: string, newNode: OrgNode): OrgNode[] {
  const index = nodes.findIndex((node) => node.id === targetId);
  if (index !== -1) {
    const next = [...nodes];
    next.splice(index + 1, 0, newNode);
    return next;
  }
  return nodes.map((node) => ({
    ...node,
    children: node.children ? insertSiblingNode(node.children, targetId, newNode) : undefined,
  }));
}

function renameNodeById(nodes: OrgNode[], targetId: string, name: string, clearDraft = false): OrgNode[] {
  return nodes.map((node) => {
    if (node.id === targetId) {
      return { ...node, name, isDraft: clearDraft ? false : node.isDraft };
    }
    return {
      ...node,
      children: node.children ? renameNodeById(node.children, targetId, name, clearDraft) : undefined,
    };
  });
}

function removeNodeById(nodes: OrgNode[], targetId: string): OrgNode[] {
  return nodes
    .filter((node) => node.id !== targetId)
    .map((node) => ({
      ...node,
      children: node.children ? removeNodeById(node.children, targetId) : undefined,
    }));
}

function findNode(nodes: OrgNode[], targetId: string): OrgNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.children) {
      const found = findNode(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

const filterFields: FilterField[] = [
  { key: "name", label: "姓名", type: "input", placeholder: "请输入", width: 140 },
  { key: "phone", label: "手机号", type: "input", placeholder: "请输入", width: 140 },
  {
    key: "status",
    label: "人员状态",
    type: "select",
    options: [
      { label: "正常", value: "active" },
      { label: "停用", value: "inactive" },
    ],
    width: 120,
  },
  {
    key: "role",
    label: "角色",
    type: "select",
    options: ROLES.map((role) => ({ label: role, value: role })),
    width: 130,
  },
];

const columns: TableColumn<StaffMember>[] = [
  { key: "name", title: "人员", minWidth: 80, render: (value) => <span className="font-medium text-foreground">{value}</span> },
  { key: "enterprise", title: "归属企业", minWidth: 200, render: (value) => <span className="text-foreground">{value}</span> },
  { key: "phone", title: "手机号", minWidth: 120 },
  {
    key: "status",
    title: "人员状态",
    minWidth: 90,
    render: (value) => <span className={value === "active" ? "badge-active" : "badge-inactive"}>{value === "active" ? "正常" : "停用"}</span>,
  },
  {
    key: "products",
    title: "启用产品",
    minWidth: 160,
    render: (value: string[]) => <div className="flex flex-wrap gap-1">{value.map((item) => <span key={item} className="badge-product">{item}</span>)}</div>,
  },
  { key: "role", title: "角色", minWidth: 100 },
  {
    key: "benefits",
    title: "权益",
    minWidth: 200,
    render: (value: string[]) => value.length ? <span className="text-[12px] text-primary">{value.join(" / ")}</span> : <span className="text-muted-foreground">-</span>,
  },
];

function MiniBenefitCard({ pkg }: { pkg: BenefitSummary }) {
  const cssVar = VARIANT_VARS[pkg.variant] || "--benefit-blue";
  return (
    <div
      className="relative min-w-[200px] shrink-0 overflow-hidden rounded-xl px-4 py-3 transition-all hover:shadow-sm"
      style={{
        border: `1px solid hsl(var(${cssVar}) / 0.15)`,
        background: `hsl(var(${cssVar}) / 0.03)`,
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-[2px] opacity-50" style={{ background: `hsl(var(${cssVar}))` }} />
      <div className="mb-1 text-[12px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>{pkg.name}</div>
      <div className="mb-2 text-[11px] text-muted-foreground">{pkg.date}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">已授权/已购买</span>
        <span className="text-[13px] font-semibold" style={{ color: `hsl(var(${cssVar}))` }}>
          {pkg.used}<span className="font-normal opacity-40">/{pkg.total}</span>
        </span>
      </div>
    </div>
  );
}

function OrgTreeNode({
  node,
  depth,
  selectedId,
  expandedIds,
  onToggleExpand,
  onSelect,
  onAction,
  editingId,
  editingName,
  onEditingNameChange,
  onSubmitEdit,
  onCancelEdit,
  staffData,
  orgTree,
}: {
  node: OrgNode;
  depth: number;
  selectedId: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onAction: (action: "add-sibling" | "add-child" | "rename" | "delete", node: OrgNode) => void;
  editingId: string | null;
  editingName: string;
  onEditingNameChange: (value: string) => void;
  onSubmitEdit: () => void;
  onCancelEdit: () => void;
  staffData: StaffMember[];
  orgTree: OrgNode[];
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

  useEffect(() => {
    if (!isEditing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
    inputRef.current?.scrollIntoView({ block: "nearest" });
  }, [isEditing]);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 6, left: rect.right });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const closeMenu = () => setMenuOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [menuOpen, updateMenuPosition]);

  return (
    <div className={depth > 0 ? "ml-3" : ""}>
      <div
        className={`group flex items-center gap-1 rounded-lg px-2 py-[5px] text-[13px] transition-all ${
          isSelected ? "bg-primary/5 font-medium text-primary" : "text-foreground hover:bg-muted/60"
        }`}
        onClick={() => !isEditing && onSelect(node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="shrink-0 rounded p-0.5 transition-colors hover:bg-muted"
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand(node.id);
            }}
          >
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          </button>
        ) : (
          <span className="w-[22px] shrink-0" />
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            value={editingName}
            className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none ring-0 transition-colors focus:border-primary"
            onChange={(event) => onEditingNameChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onBlur={onSubmitEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onSubmitEdit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onCancelEdit();
              }
            }}
          />
        ) : (
          <span className="flex-1 truncate">{node.name}</span>
        )}

        <span className={`shrink-0 text-[11px] text-muted-foreground transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {count}
        </span>

        {!isRoot && !isEditing && (
          <button
            ref={triggerRef}
            type="button"
            className="shrink-0 rounded p-0.5 opacity-0 transition-all hover:bg-muted group-hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              if (menuOpen) {
                setMenuOpen(false);
                return;
              }
              updateMenuPosition();
              setMenuOpen(true);
            }}
          >
            <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="admin-action-menu"
            data-state="open"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              transform: "translateX(calc(-100% + 2px))",
            }}
          >
            {!isUnset && (
              <>
                <button type="button" className="admin-action-menu-item" onClick={() => { onAction("add-sibling", node); setMenuOpen(false); }}>
                  <FolderTree className="h-3.5 w-3.5" />
                  新建同级组织
                </button>
                <button type="button" className="admin-action-menu-item" onClick={() => { onAction("add-child", node); setMenuOpen(false); }}>
                  <FolderPlus className="h-3.5 w-3.5" />
                  新建子组织
                </button>
              </>
            )}
            <button type="button" className="admin-action-menu-item" onClick={() => { onAction("rename", node); setMenuOpen(false); }}>
              <Edit2 className="h-3.5 w-3.5" />
              重命名
            </button>
            {!isUnset && (
              <button type="button" className="admin-action-menu-item admin-action-menu-item-danger" onClick={() => { onAction("delete", node); setMenuOpen(false); }}>
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            )}
          </div>,
          document.body,
        )}

      {hasChildren && isExpanded && node.children!.map((child) => (
        <OrgTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
          onAction={onAction}
          editingId={editingId}
          editingName={editingName}
          onEditingNameChange={onEditingNameChange}
          onSubmitEdit={onSubmitEdit}
          onCancelEdit={onCancelEdit}
          staffData={staffData}
          orgTree={orgTree}
        />
      ))}
    </div>
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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["all", "hq", "supply", "south"]));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingMode, setEditingMode] = useState<"create" | "rename" | null>(null);
  const [editingOriginName, setEditingOriginName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OrgNode | null>(null);
  const [panelHeight, setPanelHeight] = useState(560);
  const panelRowRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (!panelRowRef.current) return;
      const top = panelRowRef.current.getBoundingClientRect().top;
      setPanelHeight(Math.max(window.innerHeight - top - 24, 360));
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (pageRef.current) observer.observe(pageRef.current);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const startInlineEdit = useCallback((nodeId: string, name: string, mode: "create" | "rename") => {
    setEditingId(nodeId);
    setEditingName(name);
    setEditingMode(mode);
    setEditingOriginName(name);
  }, []);

  const handleCreateRoot = useCallback(() => {
    const newId = `org-${Date.now()}`;
    const draftNode: OrgNode = { id: newId, name: "未命名组织", isDraft: true };
    setOrgTree((prev) => insertChildNode(prev, "all", draftNode));
    setExpandedIds((prev) => new Set(prev).add("all"));
    setSelectedOrg(newId);
    startInlineEdit(newId, draftNode.name, "create");
  }, [startInlineEdit]);

  const handleNodeAction = useCallback((action: "add-sibling" | "add-child" | "rename" | "delete", node: OrgNode) => {
    if (action === "rename") {
      startInlineEdit(node.id, node.name, "rename");
      return;
    }

    if (action === "delete") {
      setDeleteTarget(node);
      return;
    }

    const newId = `org-${Date.now()}`;
    const draftNode: OrgNode = { id: newId, name: "未命名组织", isDraft: true };

    if (action === "add-child") {
      setOrgTree((prev) => insertChildNode(prev, node.id, draftNode));
      setExpandedIds((prev) => new Set(prev).add(node.id));
    }

    if (action === "add-sibling") {
      setOrgTree((prev) => insertSiblingNode(prev, node.id, draftNode));
    }

    setSelectedOrg(newId);
    startInlineEdit(newId, draftNode.name, "create");
  }, [startInlineEdit]);

  const handleSubmitEdit = useCallback(() => {
    if (!editingId || !editingMode) return;
    const trimmed = editingName.trim();

    if (!trimmed) {
      if (editingMode === "create") {
        setOrgTree((prev) => removeNodeById(prev, editingId));
        if (selectedOrg === editingId) setSelectedOrg("all");
      } else {
        setOrgTree((prev) => renameNodeById(prev, editingId, editingOriginName));
        toast.error("组织名称不能为空");
      }
      setEditingId(null);
      setEditingName("");
      setEditingMode(null);
      setEditingOriginName("");
      return;
    }

    setOrgTree((prev) => renameNodeById(prev, editingId, trimmed, true));
    toast.success(editingMode === "create" ? `已创建组织「${trimmed}」` : `已重命名为「${trimmed}」`);
    setEditingId(null);
    setEditingName("");
    setEditingMode(null);
    setEditingOriginName("");
  }, [editingId, editingMode, editingName, editingOriginName, selectedOrg]);

  const handleCancelEdit = useCallback(() => {
    if (!editingId || !editingMode) return;
    if (editingMode === "create") {
      setOrgTree((prev) => removeNodeById(prev, editingId));
      if (selectedOrg === editingId) setSelectedOrg("all");
    } else {
      setOrgTree((prev) => renameNodeById(prev, editingId, editingOriginName));
    }
    setEditingId(null);
    setEditingName("");
    setEditingMode(null);
    setEditingOriginName("");
  }, [editingId, editingMode, editingOriginName, selectedOrg]);

  const handleDelete = useCallback((nodeId: string) => {
    setOrgTree((prev) => removeNodeById(prev, nodeId));
    if (selectedOrg === nodeId) setSelectedOrg("all");
    toast.success("组织已删除");
  }, [selectedOrg]);

  const filteredData = useMemo(() => {
    let list = data;

    if (selectedOrg === "unset") {
      list = list.filter((staff) => staff.orgIds.length === 0);
    } else if (selectedOrg !== "all") {
      const validIds = new Set(collectOrgIds(orgTree, selectedOrg));
      list = list.filter((staff) => staff.orgIds.some((orgId) => validIds.has(orgId)));
    }

    const seen = new Set<string>();
    list = list.filter((staff) => {
      if (seen.has(staff.id)) return false;
      seen.add(staff.id);
      return true;
    });

    if (filters.name) list = list.filter((staff) => staff.name.includes(filters.name));
    if (filters.phone) list = list.filter((staff) => staff.phone.includes(filters.phone));
    if (filters.status) list = list.filter((staff) => staff.status === filters.status);
    if (filters.role) list = list.filter((staff) => staff.role === filters.role);

    return list;
  }, [data, selectedOrg, orgTree, filters]);

  const totalItems = filteredData.length;
  const selectedOrgNode = findNode(orgTree, selectedOrg);

  const actions: ActionItem<StaffMember>[] = [
    { label: "查看", onClick: (record) => navigate(`/enterprise/staff/detail/${record.id}`) },
    { label: "权益设置", onClick: (record) => navigate(`/enterprise/staff/detail/${record.id}`) },
  ];

  return (
    <div ref={pageRef} className="space-y-4">
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

      <div className="overflow-hidden rounded-xl border border-border/80 bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
        <div className="flex items-center gap-1 px-5 pb-2 pt-4">
          {BENEFIT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-[13px] transition-all ${
                activeTab === tab ? "bg-primary/5 font-medium text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto px-5 pb-4">
          <div className="flex gap-3">
            {BENEFIT_SUMMARIES.map((pkg, index) => <MiniBenefitCard key={index} pkg={pkg} />)}
          </div>
        </div>
      </div>

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onSearch={() => {}}
        onReset={() => setFilters({})}
        maxVisible={4}
      />

      <div
        ref={panelRowRef}
        className="grid min-h-0 grid-cols-[260px_minmax(0,1fr)] gap-4"
        style={{ height: panelHeight }}
      >
        <section className="flex min-h-0 h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-[13px] font-semibold text-foreground">组织架构</span>
            </div>
            <button
              className="flex items-center gap-1 text-[12px] font-medium text-primary transition-colors hover:text-primary/80"
              onClick={handleCreateRoot}
            >
              <Plus className="h-3.5 w-3.5" /> 新建
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {orgTree.map((node) => (
              <OrgTreeNode
                key={node.id}
                node={node}
                depth={0}
                selectedId={selectedOrg}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onSelect={setSelectedOrg}
                onAction={handleNodeAction}
                editingId={editingId}
                editingName={editingName}
                onEditingNameChange={setEditingName}
                onSubmitEdit={handleSubmitEdit}
                onCancelEdit={handleCancelEdit}
                staffData={data}
                orgTree={orgTree}
              />
            ))}
          </div>
        </section>

        <section className="flex min-h-0 h-full flex-col overflow-hidden">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3" style={{ boxShadow: "var(--shadow-xs)" }}>
            <div>
              <div className="text-[14px] font-semibold text-foreground">{selectedOrgNode?.name || "全部人员"}</div>
              <div className="mt-1 text-[12px] text-muted-foreground">当前列表仅展示该组织下可见人员，重复归属自动去重</div>
            </div>
            <div className="text-[12px] text-muted-foreground">共 {totalItems} 人</div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="space-y-4">
              <AdminTable
                columns={columns}
                data={filteredData}
                rowKey={(record) => record.id}
                actions={actions}
                maxVisibleActions={2}
              />
              <div className="rounded-xl border bg-card" style={{ boxShadow: "var(--shadow-xs)" }}>
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(nextOpen) => !nextOpen && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除组织</AlertDialogTitle>
            <AlertDialogDescription>
              删除「{deleteTarget?.name}」后，该组织及其子组织将被移除，归属人员会回到未设置组织架构。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) handleDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
