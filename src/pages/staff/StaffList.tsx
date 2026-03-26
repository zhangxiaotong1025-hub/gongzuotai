import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, ChevronRight, ChevronDown, Users, MoreHorizontal } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";

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
const ORG_TREE: OrgNode[] = [
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
function OrgTree({ nodes, selectedId, onSelect, depth = 0 }: {
  nodes: OrgNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["all", "supply", "south"]));

  return (
    <div className={depth > 0 ? "ml-3" : ""}>
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expanded.has(node.id);
        const isSelected = selectedId === node.id;
        return (
          <div key={node.id}>
            <div
              className={`flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all text-[13px] group ${
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
              <button className="p-0.5 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            {hasChildren && isExpanded && (
              <OrgTree nodes={node.children!} selectedId={selectedId} onSelect={onSelect} depth={depth + 1} />
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

export default function StaffList() {
  const navigate = useNavigate();
  const [data] = useState<StaffMember[]>(generateStaff);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [selectedOrg, setSelectedOrg] = useState("all");
  const [activeTab, setActiveTab] = useState("全部");
  const totalItems = 38;

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
              onClick={() => navigate("/enterprise/staff/create")}
            >
              <Plus className="h-3.5 w-3.5" /> 新建
            </button>
          </div>
          <div className="p-2 max-h-[500px] overflow-y-auto">
            <OrgTree nodes={ORG_TREE} selectedId={selectedOrg} onSelect={setSelectedOrg} />
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
    </div>
  );
}
