import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, UserCircle, Building2 } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";

/* ── Types ── */
type CustomerType = "designer" | "enterprise_customer";

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: CustomerType;
  source: string; // 来源企业 or "平台注册"
  sourceEnterprise?: string;
  status: "active" | "inactive";
  tags: string[];
  serviceCount: number;
  lastActiveAt: string;
  createdAt: string;
  remark?: string;
}

/* ── Mock Data ── */
const DESIGNER_NAMES = ["张明", "李雪", "王浩然", "陈思", "刘畅", "赵婷", "周文", "吴建国", "郑丽华", "孙鹏飞"];
const CUSTOMER_NAMES = ["张先生", "李女士", "王总", "赵太太", "刘先生", "陈女士", "杨先生", "马女士", "黄总", "林女士"];
const ENTERPRISES = ["欧派家居集团", "索菲亚家居", "尚品宅配", "好莱客创意家居", "金牌厨柜", "志邦家居"];
const TAGS_POOL = ["高意向", "已签约", "待跟进", "VIP", "新客户", "老客户", "装修中", "已交付"];

function mockPhone() {
  return `1${["38", "39", "50", "58", "86", "87"][Math.floor(Math.random() * 6)]}${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`;
}

function generateMockData(): Customer[] {
  const list: Customer[] = [];
  // Platform designers
  for (let i = 0; i < 15; i++) {
    const name = DESIGNER_NAMES[i % DESIGNER_NAMES.length];
    list.push({
      id: `des-${i + 1}`,
      name: `${name}${i >= DESIGNER_NAMES.length ? (i + 1) : ""}`,
      phone: mockPhone(),
      type: "designer",
      source: "平台注册",
      status: Math.random() > 0.2 ? "active" : "inactive",
      tags: [TAGS_POOL[Math.floor(Math.random() * 3)]],
      serviceCount: Math.floor(Math.random() * 50),
      lastActiveAt: `2025-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      createdAt: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
    });
  }
  // Enterprise customers
  for (let i = 0; i < 25; i++) {
    const name = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
    const ent = ENTERPRISES[Math.floor(Math.random() * ENTERPRISES.length)];
    list.push({
      id: `cust-${i + 1}`,
      name: `${name}${i >= CUSTOMER_NAMES.length ? (i + 1) : ""}`,
      phone: mockPhone(),
      type: "enterprise_customer",
      source: ent,
      sourceEnterprise: ent,
      status: Math.random() > 0.15 ? "active" : "inactive",
      tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => TAGS_POOL[Math.floor(Math.random() * TAGS_POOL.length)]),
      serviceCount: Math.floor(Math.random() * 20),
      lastActiveAt: `2025-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      createdAt: `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
      remark: Math.random() > 0.5 ? "客户有明确的装修需求" : undefined,
    });
  }
  return list;
}

const ALL_DATA = generateMockData();

/* ── Filters ── */
const designerFilters: FilterField[] = [
  { key: "keyword", label: "搜索", type: "search", placeholder: "姓名 / 手机号" },
  { key: "status", label: "状态", type: "select", options: [{ label: "全部", value: "" }, { label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
  { key: "tag", label: "标签", type: "select", options: [{ label: "全部", value: "" }, ...TAGS_POOL.slice(0, 4).map(t => ({ label: t, value: t }))] },
];

const customerFilters: FilterField[] = [
  { key: "keyword", label: "搜索", type: "search", placeholder: "姓名 / 手机号" },
  { key: "enterprise", label: "所属企业", type: "select", options: [{ label: "全部", value: "" }, ...ENTERPRISES.map(e => ({ label: e, value: e }))] },
  { key: "status", label: "状态", type: "select", options: [{ label: "全部", value: "" }, { label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
  { key: "tag", label: "标签", type: "select", options: [{ label: "全部", value: "" }, ...TAGS_POOL.map(t => ({ label: t, value: t }))] },
];

/* ── Columns ── */
const designerColumns: TableColumn[] = [
  { key: "name", title: "姓名", width: 120 },
  { key: "phone", title: "手机号", width: 140, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
  { key: "status", title: "状态", width: 80, render: (v: string) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${v === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {v === "active" ? "启用" : "停用"}
    </span>
  )},
  { key: "tags", title: "标签", width: 160, render: (v: string[]) => (
    <div className="flex flex-wrap gap-1">
      {v.map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-primary/8 text-primary">{t}</span>)}
    </div>
  )},
  { key: "serviceCount", title: "设计方案数", width: 100, render: (v: number) => <span className="text-muted-foreground">{v}</span> },
  { key: "lastActiveAt", title: "最后活跃", width: 110 },
  { key: "createdAt", title: "注册时间", width: 110 },
];

const customerColumns: TableColumn[] = [
  { key: "name", title: "客户姓名", width: 120 },
  { key: "phone", title: "手机号", width: 140, render: (v: string) => <span className="font-mono text-xs">{v}</span> },
  { key: "sourceEnterprise", title: "所属企业", width: 160 },
  { key: "status", title: "状态", width: 80, render: (v: string) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${v === "active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {v === "active" ? "启用" : "停用"}
    </span>
  )},
  { key: "tags", title: "标签", width: 200, render: (v: string[]) => (
    <div className="flex flex-wrap gap-1">
      {v.map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-primary/8 text-primary">{t}</span>)}
    </div>
  )},
  { key: "serviceCount", title: "服务次数", width: 100, render: (v: number) => <span className="text-muted-foreground">{v}</span> },
  { key: "lastActiveAt", title: "最后服务", width: 110 },
  { key: "createdAt", title: "录入时间", width: 110 },
];

/* ── Tabs ── */
const TABS = [
  { key: "designer" as const, label: "个人设计师", icon: UserCircle },
  { key: "enterprise_customer" as const, label: "企业客户", icon: Building2 },
];

export default function CustomerList() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<CustomerType>("designer");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = ALL_DATA.filter((c) => {
    if (c.type !== tab) return false;
    const kw = filters.keyword?.toLowerCase();
    if (kw && !c.name.toLowerCase().includes(kw) && !c.phone.includes(kw)) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.tag && !c.tags.includes(filters.tag)) return false;
    if (filters.enterprise && c.sourceEnterprise !== filters.enterprise) return false;
    return true;
  });

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleFilter = useCallback((key: string, val: string) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const actions: ActionItem[] = [
    { label: "查看", onClick: (row: Customer) => navigate(`/customer/detail/${row.id}`) },
    { label: "编辑", onClick: (row: Customer) => navigate(`/customer/create?mode=edit&id=${row.id}&type=${tab}`) },
    { label: row => row.status === "active" ? "停用" : "启用", onClick: (row: Customer) => toast.success(`已${row.status === "active" ? "停用" : "启用"}客户：${row.name}`) },
  ];

  return (
    <div>
      <PageHeader
        title="客户管理"
        actions={[
          { label: "导出", icon: Download, variant: "outline" as const, onClick: () => toast.success("导出成功") },
          { label: "新建客户", icon: Plus, onClick: () => navigate(`/customer/create?type=${tab}`) },
        ]}
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border/60">
        {TABS.map((t) => {
          const count = ALL_DATA.filter((c) => c.type === t.key).length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFilters({}); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <FilterBar
        fields={tab === "designer" ? designerFilters : customerFilters}
        values={filters}
        onChange={handleFilter}
      />

      {/* Table */}
      <AdminTable
        columns={tab === "designer" ? designerColumns : customerColumns}
        data={paged}
        actions={actions}
        rowKey="id"
      />

      <Pagination current={page} total={filtered.length} pageSize={pageSize} onChange={setPage} />
    </div>
  );
}
