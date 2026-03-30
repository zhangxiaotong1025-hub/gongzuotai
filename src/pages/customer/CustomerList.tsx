import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  type Designer, type EndCustomer,
  DESIGNER_LIFECYCLE_MAP, END_CUSTOMER_LIFECYCLE_MAP, FOLLOW_STATUS_MAP,
  TAGS_POOL, SOURCE_CHANNELS, PACKAGES, ENTERPRISES,
  generateDesigners, generateEndCustomers,
} from "@/data/customer";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  customerType: "designer" | "end_customer";
  lifecycle: string;
  lifecycleLabel: string;
  lifecycleColor: string;
  tags: string[];
  createdAt: string;
  // designer fields
  currentPackage?: string;
  packageExpiry?: string;
  usageRate?: number;
  totalSpent?: number;
  lastLoginAt?: string;
  source?: string;
  cvsScore?: number;
  // end_customer fields
  sourceEnterprise?: string;
  assignedStaff?: string;
  followStatus?: string;
  followStatusLabel?: string;
  followStatusColor?: string;
  intentLevel?: string;
  lastFollowAt?: string;
};

const DESIGNERS = generateDesigners(40);
const END_CUSTOMERS = generateEndCustomers(35);

function toRows(): CustomerRow[] {
  const rows: CustomerRow[] = [];
  DESIGNERS.forEach(d => {
    const lc = DESIGNER_LIFECYCLE_MAP[d.lifecycle];
    rows.push({
      id: d.id, name: d.name, phone: d.phone,
      customerType: "designer",
      lifecycle: d.lifecycle, lifecycleLabel: lc.label, lifecycleColor: lc.color,
      tags: d.tags, createdAt: d.registeredAt,
      currentPackage: d.currentPackage, packageExpiry: d.packageExpiry,
      usageRate: d.usageRate, totalSpent: d.totalSpent,
      lastLoginAt: d.lastLoginAt, source: d.source, cvsScore: d.cvsScore,
    });
  });
  END_CUSTOMERS.forEach(c => {
    const lc = END_CUSTOMER_LIFECYCLE_MAP[c.lifecycle];
    const fs = FOLLOW_STATUS_MAP[c.followStatus];
    rows.push({
      id: c.id, name: c.name, phone: c.phone,
      customerType: "end_customer",
      lifecycle: c.lifecycle, lifecycleLabel: lc.label, lifecycleColor: lc.color,
      tags: c.tags, createdAt: c.createdAt,
      sourceEnterprise: c.sourceEnterprise, assignedStaff: c.assignedStaff,
      followStatus: c.followStatus, followStatusLabel: fs.label, followStatusColor: fs.color,
      intentLevel: c.intentLevel, lastFollowAt: c.lastFollowAt,
    });
  });
  return rows;
}

const ALL_ROWS = toRows();

const LIFECYCLE_OPTIONS = [
  { label: "全部", value: "" },
  ...Object.entries(DESIGNER_LIFECYCLE_MAP).map(([k, v]) => ({ label: `[设计师] ${v.label}`, value: `d_${k}` })),
  ...Object.entries(END_CUSTOMER_LIFECYCLE_MAP).map(([k, v]) => ({ label: `[企业客户] ${v.label}`, value: `e_${k}` })),
];

const filters: FilterField[] = [
  { key: "keyword", label: "搜索", type: "input", placeholder: "姓名 / 手机号" },
  { key: "customerType", label: "客户类型", type: "select", options: [
    { label: "全部", value: "" },
    { label: "个人设计师", value: "designer" },
    { label: "企业客户", value: "end_customer" },
  ]},
  { key: "lifecycle", label: "生命周期", type: "select", options: LIFECYCLE_OPTIONS },
  { key: "enterprise", label: "所属企业", type: "select", options: [{ label: "全部", value: "" }, ...ENTERPRISES.map(e => ({ label: e, value: e }))] },
];

function UsageBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? "bg-emerald-500" : rate >= 30 ? "bg-primary" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{rate}%</span>
    </div>
  );
}

const columns: TableColumn<CustomerRow>[] = [
  { key: "name", title: "客户", width: 160, render: (_v, r) => (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
        r.customerType === "designer" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"
      }`}>{r.name[0]}</div>
      <div>
        <div className="text-sm font-medium">{r.name}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{r.phone.slice(0,3)}****{r.phone.slice(-4)}</div>
      </div>
    </div>
  )},
  { key: "customerType", title: "类型", width: 90, render: (v: string) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
      v === "designer" ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700"
    }`}>{v === "designer" ? "设计师" : "企业客户"}</span>
  )},
  { key: "lifecycleLabel", title: "生命周期", width: 85, render: (_v, r) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${r.lifecycleColor}`}>{r.lifecycleLabel}</span>
  )},
  { key: "sourceEnterprise", title: "所属企业", width: 120, render: (_v, r) => (
    r.customerType === "end_customer" ? <span className="text-sm">{r.sourceEnterprise}</span> : <span className="text-xs text-muted-foreground">—</span>
  )},
  { key: "currentPackage", title: "套餐/跟进", width: 110, render: (_v, r) => (
    r.customerType === "designer"
      ? <div><div className="text-sm">{r.currentPackage}</div><div className="text-[11px] text-muted-foreground">到期 {r.packageExpiry}</div></div>
      : <div className="flex items-center gap-1.5">
          {r.followStatusLabel && <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${r.followStatusColor}`}>{r.followStatusLabel}</span>}
          {r.assignedStaff && <span className="text-xs text-muted-foreground">{r.assignedStaff}</span>}
        </div>
  )},
  { key: "usageRate", title: "使用率/意向", width: 100, render: (_v, r) => (
    r.customerType === "designer" && r.usageRate != null
      ? <UsageBar rate={r.usageRate} />
      : r.intentLevel
        ? <span className={`text-sm font-medium ${r.intentLevel === "high" ? "text-emerald-600" : r.intentLevel === "medium" ? "text-amber-600" : "text-muted-foreground"}`}>
            {r.intentLevel === "high" ? "高意向" : r.intentLevel === "medium" ? "中意向" : "低意向"}
          </span>
        : <span className="text-xs text-muted-foreground">—</span>
  )},
  { key: "createdAt", title: "注册/录入", width: 100 },
  { key: "tags", title: "标签", width: 130, render: (v: string[]) => (
    <div className="flex flex-wrap gap-1">{v.slice(0, 2).map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-primary/10 text-primary">{t}</span>)}{v.length > 2 && <span className="text-[11px] text-muted-foreground">+{v.length-2}</span>}</div>
  )},
];

export default function CustomerList() {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    return ALL_ROWS.filter(r => {
      const kw = filterValues.keyword?.toLowerCase();
      if (kw && !r.name.toLowerCase().includes(kw) && !r.phone.includes(kw)) return false;
      if (filterValues.customerType && r.customerType !== filterValues.customerType) return false;
      if (filterValues.lifecycle) {
        const [prefix, val] = filterValues.lifecycle.split("_");
        if (prefix === "d" && r.customerType === "designer" && r.lifecycle !== val) return false;
        if (prefix === "e" && r.customerType === "end_customer" && r.lifecycle !== val) return false;
        if (prefix === "d" && r.customerType !== "designer") return false;
        if (prefix === "e" && r.customerType !== "end_customer") return false;
      }
      if (filterValues.enterprise && r.customerType === "end_customer" && r.sourceEnterprise !== filterValues.enterprise) return false;
      if (filterValues.enterprise && r.customerType === "designer") return false;
      return true;
    });
  }, [filterValues]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleFilter = useCallback((key: string, val: string) => {
    setFilterValues(prev => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const actions: ActionItem<CustomerRow>[] = [
    { label: "查看", onClick: (r) => navigate(`/customer/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => navigate(`/customer/create?mode=edit&id=${r.id}&type=${r.customerType}`) },
    { label: (r) => r.customerType === "designer" ? "赠送权益" : "新增跟进",
      onClick: (r) => toast.success(r.customerType === "designer" ? `已为 ${r.name} 创建权益赠送单` : `已为 ${r.name} 新增跟进记录`) },
  ];

  const designerCount = ALL_ROWS.filter(r => r.customerType === "designer").length;
  const ecCount = ALL_ROWS.filter(r => r.customerType === "end_customer").length;

  return (
    <div>
      <PageHeader
        title="客户列表"
        subtitle={`设计师 ${designerCount} · 企业客户 ${ecCount} · 共 ${filtered.length} 条`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("导出成功")}>
              <Download className="h-4 w-4 mr-1" />导出
            </Button>
            <Button size="sm" onClick={() => navigate("/customer/create")}>
              <Plus className="h-4 w-4 mr-1" />录入客户
            </Button>
          </div>
        }
      />

      <FilterBar
        fields={filters}
        values={filterValues}
        onChange={handleFilter}
        onSearch={() => setPage(1)}
        onReset={() => { setFilterValues({}); setPage(1); }}
      />

      <AdminTable
        columns={columns}
        data={paged}
        actions={actions}
        rowKey={(r) => r.id}
      />

      <Pagination current={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
}
