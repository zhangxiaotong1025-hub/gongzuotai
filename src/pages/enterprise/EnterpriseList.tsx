import { useState, useCallback } from "react";
import { Plus, Download } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";

// ===== 数据模型 =====
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
  children?: Enterprise[];
  _level?: number;
}

// ===== 真实感模拟数据 =====
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
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(c, arr.length));
}

function generateEnterprise(id: string, depth = 0): Enterprise {
  const name = ENTERPRISE_NAMES[Math.floor(Math.random() * ENTERPRISE_NAMES.length)];
  const hasChildren = depth === 0 && Math.random() > 0.4;
  const childCount = hasChildren ? Math.floor(Math.random() * 4) + 1 : 0;
  return {
    id,
    name,
    type: TYPES[Math.floor(Math.random() * TYPES.length)],
    status: Math.random() > 0.25 ? "active" : "inactive",
    products: randomPick(PRODUCTS, Math.floor(Math.random() * 3) + 1),
    subsidiaries: Math.floor(Math.random() * 50) + 1,
    staff: Math.floor(Math.random() * 200) + 5,
    createdAt: `202${Math.floor(Math.random() * 6)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    creator: CREATORS[Math.floor(Math.random() * CREATORS.length)],
    updatedAt: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")} ${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    note: ["核心战略客户", "稳定续费客户，主要销售硬装瓷砖", "新签约客户，试用期", "重点关注客户", "年度合作伙伴"][Math.floor(Math.random() * 5)],
    children: hasChildren
      ? Array.from({ length: childCount }, (_, i) =>
          generateEnterprise(`${id}-${i + 1}`, depth + 1)
        )
      : [],
  };
}

const mockData: Enterprise[] = Array.from({ length: 10 }, (_, i) =>
  generateEnterprise(`ENT${String(i + 1).padStart(3, "0")}`)
);

// ===== 筛选字段定义 =====
const filterFields: FilterField[] = [
  { key: "name", label: "企业名称", type: "input", placeholder: "请输入企业名称", width: 180 },
  { key: "id", label: "企业ID", type: "input", placeholder: "请输入企业ID", width: 140 },
  {
    key: "type",
    label: "企业类型",
    type: "select",
    options: TYPES.map((t) => ({ label: t, value: t })),
    width: 130,
  },
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "启用", value: "active" },
      { label: "停用", value: "inactive" },
    ],
    width: 110,
  },
  {
    key: "product",
    label: "启用产品",
    type: "select",
    options: PRODUCTS.map((p) => ({ label: p, value: p })),
    width: 130,
  },
  { key: "createdFrom", label: "创建时间", type: "date", width: 160 },
];

// ===== 表格列定义 =====
const columns: TableColumn<Enterprise>[] = [
  { key: "name", title: "企业名称", minWidth: 260, render: (v) => <span className="text-foreground">{v}</span> },
  {
    key: "type",
    title: "企业类型",
    minWidth: 90,
    render: (v) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground">
        {v}
      </span>
    ),
  },
  {
    key: "status",
    title: "状态",
    minWidth: 80,
    render: (v) => (
      <span className={v === "active" ? "badge-active" : "badge-inactive"}>
        {v === "active" ? "启用" : "停用"}
      </span>
    ),
  },
  {
    key: "products",
    title: "启用产品",
    minWidth: 160,
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
    minWidth: 70,
    align: "center",
    render: (v) => <span className="text-primary cursor-pointer hover:underline">{v}</span>,
  },
  {
    key: "staff",
    title: "人员",
    minWidth: 70,
    align: "center",
    render: (v) => <span className="text-primary cursor-pointer hover:underline">{v}</span>,
  },
  { key: "createdAt", title: "创建时间", minWidth: 140, render: (v) => <span className="text-muted-foreground text-xs">{v}</span> },
  { key: "creator", title: "创建人", minWidth: 70 },
  { key: "updatedAt", title: "更新时间", minWidth: 140, render: (v) => <span className="text-muted-foreground text-xs">{v}</span> },
  {
    key: "note",
    title: "备注",
    minWidth: 180,
    render: (v) => (
      <span className="text-muted-foreground text-xs block max-w-[200px] truncate" title={v}>
        {v}
      </span>
    ),
  },
];

// ===== 操作按钮定义 =====
const actions: ActionItem<Enterprise>[] = [
  { label: "查看", onClick: (r) => console.log("查看", r.id) },
  { label: "编辑", onClick: (r) => console.log("编辑", r.id), visible: (r) => !r._level },
  { label: "启用/停用", onClick: (r) => console.log("toggle", r.id) },
  { label: "设置管理员", onClick: (r) => console.log("admin", r.id) },
  { label: "新建子企业", onClick: (r) => console.log("sub", r.id), visible: (r) => !r._level },
  { label: "权益配置", onClick: (r) => console.log("entitlement", r.id) },
];

export default function EnterpriseList() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["ENT001"]));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const totalItems = 1200;

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="企业管理"
        subtitle={`共${totalItems}个企业`}
        actions={
          <>
            <button className="h-8 px-4 text-sm border rounded-md hover:bg-muted transition-colors text-foreground flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" />
              导出
            </button>
            <button className="h-8 px-4 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
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
        actions={actions}
        maxVisibleActions={2}
        expandable={{
          childrenKey: "children",
          expandedKeys: expanded,
          onToggle: toggleExpand,
        }}
        getLevel={(r) => r._level || 0}
      />

      <div className="bg-card rounded-b-lg border border-t-0">
        <Pagination
          current={currentPage}
          total={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>
    </div>
  );
}
