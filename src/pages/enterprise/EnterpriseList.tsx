import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { CreateEnterpriseDialog } from "./CreateEnterpriseDialog";
import { SetAdminDialog } from "./SetAdminDialog";
import { AuditDialog, type AuditRecord } from "./AuditDialog";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";

// ===== Data Model =====
type AuditStatus = "pending" | "approved" | "rejected";

interface Enterprise {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  auditStatus: AuditStatus;
  products: string[];
  subsidiaries: number;
  staff: number;
  createdAt: string;
  creator: string;
  updatedAt: string;
  note: string;
  admin?: string;
  children?: Enterprise[];
  _level?: number;
  frozen?: boolean; // cascading freeze from parent
  auditRecords?: AuditRecord[];
}

// ===== Mock Data =====
const ENTERPRISE_NAMES = [
  "欧派家居集团股份有限公司", "索菲亚家居股份有限公司", "尚品宅配家居股份有限公司",
  "金牌厨柜家居科技股份有限公司", "志邦家居股份有限公司", "我乐家居股份有限公司",
  "好莱客创意家居股份有限公司", "皮阿诺家居股份有限公司", "顶固集创家居股份有限公司",
];
const TYPES = ["品牌商", "经销商", "装修公司", "卖场", "门店", "工作室", "供应商"];
const PRODUCTS = ["国内3D", "国际3D", "智能导购", "VR全景"];
const CREATORS = ["张伟", "李娜", "王强", "赵敏", "刘洋", "陈静", "杨帆"];

const TYPE_KEY_MAP: Record<string, string> = {
  "品牌商": "brand", "经销商": "dealer", "装修公司": "decoration",
  "卖场": "mall", "门店": "store", "工作室": "studio", "供应商": "supplier",
};

const SUB_TYPE_MAP: Record<string, string[]> = {
  "品牌商": ["品牌商", "经销商", "装修公司", "门店", "工作室"],
  "经销商": ["经销商", "装修公司", "门店", "工作室"],
  "装修公司": ["装修公司", "门店", "工作室"],
  "门店": ["门店", "工作室"],
  "工作室": ["工作室"],
  "供应商": ["供应商"],
  "卖场": ["品牌商", "经销商", "装修公司", "门店", "工作室"],
};

function randomPick<T>(arr: T[], count?: number): T[] {
  const c = count || Math.ceil(Math.random() * arr.length);
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(c, arr.length));
}

function generateEnterprise(id: string, depth = 0, parentType?: string): Enterprise {
  const maxDepth = 2;
  const hasChildren = depth < maxDepth && Math.random() > (depth === 0 ? 0.3 : 0.5);
  const childCount = hasChildren ? Math.floor(Math.random() * 3) + 1 : 0;
  const allowedTypes = depth === 0 ? TYPES : (parentType ? (SUB_TYPE_MAP[parentType] || TYPES) : TYPES);
  const type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
  const auditRand = Math.random();
  const auditStatus: AuditStatus = auditRand > 0.7 ? "pending" : auditRand > 0.15 ? "approved" : "rejected";
  return {
    id,
    name: ENTERPRISE_NAMES[Math.floor(Math.random() * ENTERPRISE_NAMES.length)],
    type,
    status: auditStatus === "approved" ? (Math.random() > 0.25 ? "active" : "inactive") : "inactive",
    auditStatus,
    admin: Math.random() > 0.4 ? CREATORS[Math.floor(Math.random() * CREATORS.length)] : undefined,
    products: randomPick(PRODUCTS, Math.floor(Math.random() * 3) + 1),
    subsidiaries: Math.floor(Math.random() * 50) + 1,
    staff: Math.floor(Math.random() * 200) + 5,
    createdAt: `202${Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    creator: CREATORS[Math.floor(Math.random() * CREATORS.length)],
    updatedAt: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    note: ["核心战略客户", "稳定续费客户，主要销售硬装瓷砖", "新签约客户，试用期", "重点关注客户", "年度合作伙伴"][Math.floor(Math.random() * 5)],
    auditRecords: [
      {
        id: `${id}-ar-1`,
        action: "submit",
        operator: CREATORS[Math.floor(Math.random() * CREATORS.length)],
        time: `2026-01-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} 14:30`,
        remark: "新企业创建，提交审核",
      },
    ],
    children: hasChildren ? Array.from({ length: childCount }, (_, i) => generateEnterprise(`${id}-${i + 1}`, depth + 1, type)) : [],
  };
}

const initialData: Enterprise[] = Array.from({ length: 10 }, (_, i) =>
  generateEnterprise(`ENT${String(i + 1).padStart(3, "0")}`)
);

// ===== Audit Status Labels =====
const AUDIT_STATUS_MAP: Record<AuditStatus, { label: string; className: string }> = {
  pending: { label: "待审核", className: "badge-warning" },
  approved: { label: "已通过", className: "badge-active" },
  rejected: { label: "已驳回", className: "badge-danger" },
};

// ===== Filter Fields =====
const filterFields: FilterField[] = [
  { key: "name", label: "企业名称", type: "input", placeholder: "请输入企业名称", width: 200 },
  { key: "id", label: "企业ID", type: "input", placeholder: "请输入企业ID", width: 150 },
  { key: "type", label: "企业类型", type: "select", options: TYPES.map((t) => ({ label: t, value: t })), width: 140 },
  { key: "status", label: "业务状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
  { key: "auditStatus", label: "审核状态", type: "select", options: [{ label: "待审核", value: "pending" }, { label: "已通过", value: "approved" }, { label: "已驳回", value: "rejected" }], width: 120 },
  { key: "createdFrom", label: "创建时间", type: "date", width: 160 },
];

// ===== Columns =====
const columns: TableColumn<Enterprise>[] = [
  {
    key: "name",
    title: "企业名称",
    minWidth: 260,
    render: (v, row) => (
      <span className="text-foreground font-medium">
        {v}
        {(row as Enterprise).frozen && (
          <span className="ml-1.5 badge-danger text-[10px] py-0">已冻结</span>
        )}
      </span>
    ),
  },
  {
    key: "type",
    title: "企业类型",
    minWidth: 90,
    render: (v) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
        {v}
      </span>
    ),
  },
  {
    key: "auditStatus",
    title: "审核状态",
    minWidth: 90,
    render: (v: AuditStatus) => {
      const cfg = AUDIT_STATUS_MAP[v];
      return <span className={cfg.className}>{cfg.label}</span>;
    },
  },
  {
    key: "status",
    title: "业务状态",
    minWidth: 90,
    render: (v, row) => {
      const ent = row as Enterprise;
      if (ent.frozen) {
        return <span className="badge-danger">已冻结</span>;
      }
      if (ent.auditStatus !== "approved") {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <span className={v === "active" ? "badge-active" : "badge-inactive"}>
          {v === "active" ? "启用" : "停用"}
        </span>
      );
    },
  },
  {
    key: "products",
    title: "启用产品",
    minWidth: 180,
    render: (v: string[]) => (
      <div className="flex gap-1 flex-wrap">
        {v.map((p) => (
          <span key={p} className="badge-product">{p}</span>
        ))}
      </div>
    ),
  },
  {
    key: "subsidiaries",
    title: "子公司",
    minWidth: 80,
    align: "center",
    render: (v) => <span className="text-primary cursor-pointer hover:underline">{v}</span>,
  },
  {
    key: "staff",
    title: "人员",
    minWidth: 80,
    align: "center",
    render: (v) => <span className="text-primary cursor-pointer hover:underline">{v}</span>,
  },
  {
    key: "createdAt",
    title: "创建时间",
    minWidth: 150,
    render: (v) => <span className="text-muted-foreground">{v}</span>,
  },
  { key: "creator", title: "创建人", minWidth: 80 },
  {
    key: "updatedAt",
    title: "更新时间",
    minWidth: 150,
    render: (v) => <span className="text-muted-foreground">{v}</span>,
  },
  {
    key: "note",
    title: "备注",
    minWidth: 200,
    render: (v) => (
      <span className="text-muted-foreground block max-w-[200px] truncate" title={v}>
        {v}
      </span>
    ),
  },
];

// ===== Cascade freeze/unfreeze helpers =====
function freezeChildren(children?: Enterprise[]): Enterprise[] | undefined {
  if (!children) return children;
  return children.map((c) => ({
    ...c,
    frozen: true,
    status: "inactive" as const,
    children: freezeChildren(c.children),
  }));
}

function unfreezeChildren(children?: Enterprise[]): Enterprise[] | undefined {
  if (!children) return children;
  return children.map((c) => ({
    ...c,
    frozen: false,
    children: unfreezeChildren(c.children),
  }));
}

export default function EnterpriseList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Enterprise[]>(initialData);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["ENT001"]));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [adminTarget, setAdminTarget] = useState<Enterprise | null>(null);
  const [subParent, setSubParent] = useState<Enterprise | null>(null);
  const [auditTarget, setAuditTarget] = useState<Enterprise | null>(null);
  const totalItems = 1200;

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const updateEnterprise = useCallback((id: string, patch: Partial<Enterprise>) => {
    const updateTree = (items: Enterprise[]): Enterprise[] =>
      items.map((e) => ({
        ...e,
        ...(e.id === id ? patch : {}),
        children: e.children ? updateTree(e.children) : e.children,
      }));
    setData((prev) => updateTree(prev));
  }, []);

  // Cascade-aware update: when rejecting/disabling parent, freeze all children
  const updateWithCascade = useCallback((id: string, patch: Partial<Enterprise>, cascade: "freeze" | "unfreeze" | "none") => {
    const updateTree = (items: Enterprise[]): Enterprise[] =>
      items.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...patch };
          if (cascade === "freeze") {
            updated.children = freezeChildren(e.children);
          } else if (cascade === "unfreeze") {
            updated.children = unfreezeChildren(e.children);
          }
          return updated;
        }
        return { ...e, children: e.children ? updateTree(e.children) : e.children };
      });
    setData((prev) => updateTree(prev));
  }, []);

  const handleToggleStatus = useCallback((record: Enterprise) => {
    const newStatus = record.status === "active" ? "inactive" : "active";
    // Disabling parent → freeze children; enabling → unfreeze children
    const cascade = newStatus === "inactive" ? "freeze" : "unfreeze";
    updateWithCascade(record.id, { status: newStatus }, cascade);
  }, [updateWithCascade]);

  const handleEnableClick = useCallback((record: Enterprise) => {
    if (!record.admin) {
      setAdminTarget(record);
      return;
    }
    handleToggleStatus(record);
  }, [handleToggleStatus]);

  const handleAuditConfirm = useCallback((result: { action: "approve" | "reject"; remark: string }) => {
    if (!auditTarget) return;
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newRecord: AuditRecord = {
      id: `ar-${Date.now()}`,
      action: result.action,
      operator: "当前用户",
      time: timeStr,
      remark: result.remark,
    };
    const newAuditStatus = result.action === "approve" ? "approved" : "rejected";
    const cascade = result.action === "reject" ? "freeze" : "none";
    updateWithCascade(auditTarget.id, {
      auditStatus: newAuditStatus as AuditStatus,
      auditRecords: [...(auditTarget.auditRecords || []), newRecord],
    }, cascade as "freeze" | "unfreeze" | "none");
    setAuditTarget(null);
  }, [auditTarget, updateWithCascade]);

  const listActions: ActionItem<Enterprise>[] = [
    { label: "查看", onClick: (r) => navigate(`/enterprise/detail/${r.id}`) },
    {
      label: "审核",
      onClick: (r) => setAuditTarget(r),
      visible: (r) => r.auditStatus === "pending",
    },
    {
      label: "停用",
      onClick: handleToggleStatus,
      visible: (r) => r.auditStatus === "approved" && r.status === "active" && !r.frozen,
      danger: true,
      confirm: {
        title: "确认停用该企业？",
        description: "停用后该企业及其所有子企业将被冻结，暂时无法使用，后续可重新启用。",
        confirmLabel: "确认停用",
      },
    },
    {
      label: "启用",
      onClick: handleEnableClick,
      visible: (r) => r.auditStatus === "approved" && r.status === "inactive" && !r.frozen,
    },
    { label: "设置管理员", onClick: (r) => setAdminTarget(r) },
    {
      label: "新建子企业",
      onClick: (r) => setSubParent(r),
      visible: (r) => (r._level || 0) < 2 && !r.frozen,
    },
    { label: "权益配置", onClick: (r) => navigate(`/enterprise/detail/${r.id}`) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="企业管理"
        subtitle={`共 ${totalItems} 个企业`}
        actions={
          <>
            <button className="btn-secondary">
              <Download className="h-4 w-4" />
              导出
            </button>
            <button className="btn-primary" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4" />
              新建企业
            </button>
          </>
        }
      />

      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onSearch={() => console.log("search", filters)}
        onReset={() => setFilters({})}
        maxVisible={4}
      />

      <AdminTable
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        actions={listActions}
        maxVisibleActions={2}
        expandable={{
          childrenKey: "children",
          expandedKeys: expanded,
          onToggle: toggleExpand,
        }}
        getLevel={(r) => r._level || 0}
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

      <CreateEnterpriseDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSelect={(type) => {
          setShowCreateDialog(false);
          navigate(`/enterprise/create?type=${type}`);
        }}
      />

      {subParent && (() => {
        const parentTypeKey = TYPE_KEY_MAP[subParent.type] || "brand";
        const allowed = (SUB_TYPE_MAP[subParent.type] || []).map((t) => TYPE_KEY_MAP[t]).filter(Boolean);
        const level = (subParent._level || 0) + 1;
        return (
          <CreateEnterpriseDialog
            open
            title="新建子企业"
            subtitle={`请选择「${subParent.name}」的子企业类型`}
            allowedTypes={allowed}
            onClose={() => setSubParent(null)}
            onSelect={(type) => {
              setSubParent(null);
              navigate(`/enterprise/create?type=${type}&parentId=${subParent.id}&parentType=${parentTypeKey}&parentName=${encodeURIComponent(subParent.name)}&level=${level}`);
            }}
          />
        );
      })()}

      <SetAdminDialog
        open={Boolean(adminTarget)}
        onClose={() => setAdminTarget(null)}
        enterpriseName={adminTarget?.name}
        onConfirm={(result) => {
          if (adminTarget) {
            updateEnterprise(adminTarget.id, {
              admin: result.adminName,
              status: result.status,
            });
          }
          setAdminTarget(null);
        }}
      />

      <AuditDialog
        open={Boolean(auditTarget)}
        onClose={() => setAuditTarget(null)}
        enterpriseName={auditTarget?.name}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
}
