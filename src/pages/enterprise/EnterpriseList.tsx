import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { CreateEnterpriseDialog } from "./CreateEnterpriseDialog";
import { SetAdminDialog } from "./SetAdminDialog";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";

// ===== Data Model =====
interface Enterprise {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive";
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
}

// ===== Mock Data =====
const ENTERPRISE_NAMES = [
  "欧派家居集团股份有限公司", "索菲亚家居股份有限公司", "尚品宅配家居股份有限公司",
  "金牌厨柜家居科技股份有限公司", "志邦家居股份有限公司", "我乐家居股份有限公司",
  "好莱客创意家居股份有限公司", "皮阿诺家居股份有限公司", "顶固集创家居股份有限公司",
];
const TYPES = ["品牌商", "经销商", "装企", "卖场", "门店"];
const PRODUCTS = ["国内3D", "国际3D", "智能导购", "VR全景"];
const CREATORS = ["张伟", "李娜", "王强", "赵敏", "刘洋", "陈静", "杨帆"];

function randomPick<T>(arr: T[], count?: number): T[] {
  const c = count || Math.ceil(Math.random() * arr.length);
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(c, arr.length));
}

function generateEnterprise(id: string, depth = 0): Enterprise {
  const hasChildren = depth === 0 && Math.random() > 0.4;
  const childCount = hasChildren ? Math.floor(Math.random() * 4) + 1 : 0;
  return {
    id,
    name: ENTERPRISE_NAMES[Math.floor(Math.random() * ENTERPRISE_NAMES.length)],
    type: TYPES[Math.floor(Math.random() * TYPES.length)],
    status: Math.random() > 0.25 ? "active" : "inactive",
    products: randomPick(PRODUCTS, Math.floor(Math.random() * 3) + 1),
    subsidiaries: Math.floor(Math.random() * 50) + 1,
    staff: Math.floor(Math.random() * 200) + 5,
    createdAt: `202${Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    creator: CREATORS[Math.floor(Math.random() * CREATORS.length)],
    updatedAt: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    note: ["核心战略客户", "稳定续费客户，主要销售硬装瓷砖", "新签约客户，试用期", "重点关注客户", "年度合作伙伴"][Math.floor(Math.random() * 5)],
    children: hasChildren ? Array.from({ length: childCount }, (_, i) => generateEnterprise(`${id}-${i + 1}`, depth + 1)) : [],
  };
}

const mockData: Enterprise[] = Array.from({ length: 10 }, (_, i) =>
  generateEnterprise(`ENT${String(i + 1).padStart(3, "0")}`)
);

// ===== Filter Fields =====
const filterFields: FilterField[] = [
  { key: "name", label: "企业名称", type: "input", placeholder: "请输入企业名称", width: 200 },
  { key: "id", label: "企业ID", type: "input", placeholder: "请输入企业ID", width: 150 },
  { key: "type", label: "企业类型", type: "select", options: TYPES.map((t) => ({ label: t, value: t })), width: 140 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
  { key: "product", label: "启用产品", type: "select", options: PRODUCTS.map((p) => ({ label: p, value: p })), width: 140 },
  { key: "createdFrom", label: "创建时间", type: "date", width: 160 },
];

// ===== Columns =====
const columns: TableColumn<Enterprise>[] = [
  {
    key: "name",
    title: "企业名称",
    minWidth: 260,
    render: (v) => <span className="text-foreground font-medium">{v}</span>,
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
    key: "status",
    title: "状态",
    minWidth: 90,
    render: (v) => (
      <span className={v === "active" ? "badge-active" : "badge-inactive"}>
        {v === "active" ? "启用" : "停用"}
      </span>
    ),
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

export default function EnterpriseList() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["ENT001"]));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [adminTarget, setAdminTarget] = useState<Enterprise | null>(null);
  const totalItems = 1200;

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const listActions: ActionItem<Enterprise>[] = [
    { label: "查看", onClick: (r) => console.log("查看", r.id) },
    {
      label: "停用",
      onClick: (r) => console.log("停用", r.id),
      visible: (r) => r.status === "active",
      danger: true,
      confirm: {
        title: "确认停用该企业？",
        description: "停用后该企业将暂时无法继续使用当前能力，后续可在列表中重新启用。",
        confirmLabel: "确认停用",
      },
    },
    {
      label: "启用",
      onClick: (r) => console.log("启用", r.id),
      visible: (r) => r.status === "inactive",
      confirm: {
        title: "确认启用该企业？",
        description: "启用前请确认该企业已完成管理员配置，启用后企业即可正常使用相关能力。",
        confirmLabel: "确认启用",
      },
    },
    { label: "设置管理员", onClick: (r) => setAdminTarget(r) },
    { label: "新建子企业", onClick: (r) => console.log("sub", r.id), visible: (r) => !r._level },
    { label: "权益配置", onClick: (r) => console.log("entitlement", r.id) },
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
        data={mockData}
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

      <SetAdminDialog
        open={Boolean(adminTarget)}
        onClose={() => setAdminTarget(null)}
        enterpriseName={adminTarget?.name}
        onConfirm={(data) => {
          console.log("设置管理员", adminTarget?.id, data);
          setAdminTarget(null);
        }}
      />
    </div>
  );
}
