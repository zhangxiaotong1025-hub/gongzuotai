import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Download, UserCircle, Building2, Send, Gift } from "lucide-react";
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

type TabKey = "designer" | "end_customer";

const DESIGNERS = generateDesigners(40);
const END_CUSTOMERS = generateEndCustomers(35);

/* ── Filters ── */
const designerFilters: FilterField[] = [
  { key: "keyword", label: "搜索", type: "input", placeholder: "姓名 / 手机号" },
  { key: "lifecycle", label: "生命周期", type: "select", options: [{ label: "全部", value: "" }, ...Object.entries(DESIGNER_LIFECYCLE_MAP).map(([k, v]) => ({ label: v.label, value: k }))] },
  { key: "package", label: "当前套餐", type: "select", options: [{ label: "全部", value: "" }, ...PACKAGES.map(p => ({ label: p, value: p }))] },
  { key: "source", label: "来源", type: "select", options: [{ label: "全部", value: "" }, ...SOURCE_CHANNELS.map(s => ({ label: s, value: s }))] },
];

const ecFilters: FilterField[] = [
  { key: "keyword", label: "搜索", type: "input", placeholder: "姓名 / 手机号" },
  { key: "enterprise", label: "所属企业", type: "select", options: [{ label: "全部", value: "" }, ...ENTERPRISES.map(e => ({ label: e, value: e }))] },
  { key: "lifecycle", label: "生命周期", type: "select", options: [{ label: "全部", value: "" }, ...Object.entries(END_CUSTOMER_LIFECYCLE_MAP).map(([k, v]) => ({ label: v.label, value: k }))] },
  { key: "followStatus", label: "跟进状态", type: "select", options: [{ label: "全部", value: "" }, ...Object.entries(FOLLOW_STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))] },
];

/* ── Columns ── */
function UsageBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? "bg-emerald-500" : rate >= 30 ? "bg-primary" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{rate}%</span>
    </div>
  );
}

const designerCols: TableColumn<Designer>[] = [
  { key: "name", title: "设计师", width: 150, render: (_v, r) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{r.name[0]}</div>
      <div>
        <div className="text-sm font-medium">{r.name}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{r.phone.slice(0,3)}****{r.phone.slice(-4)}</div>
      </div>
    </div>
  )},
  { key: "registeredAt", title: "注册时间", width: 100 },
  { key: "lifecycle", title: "生命周期", width: 90, render: (v: string) => {
    const m = DESIGNER_LIFECYCLE_MAP[v as keyof typeof DESIGNER_LIFECYCLE_MAP];
    return m ? <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${m.color}`}>{m.label}</span> : v;
  }},
  { key: "currentPackage", title: "当前套餐", width: 100, render: (v: string, r: Designer) => (
    <div><div className="text-sm">{v}</div><div className="text-[11px] text-muted-foreground">到期 {r.packageExpiry}</div></div>
  )},
  { key: "usageRate", title: "权益使用率", width: 120, render: (v: number) => <UsageBar rate={v} /> },
  { key: "totalSpent", title: "累计消费", width: 90, render: (v: number) => <span className="text-sm">¥{v.toLocaleString()}</span> },
  { key: "lastLoginAt", title: "最近登录", width: 100 },
  { key: "tags", title: "标签", width: 140, render: (v: string[]) => (
    <div className="flex flex-wrap gap-1">{v.slice(0, 2).map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-primary/10 text-primary">{t}</span>)}{v.length > 2 && <span className="text-[11px] text-muted-foreground">+{v.length-2}</span>}</div>
  )},
];

const ecCols: TableColumn<EndCustomer>[] = [
  { key: "name", title: "客户", width: 150, render: (_v, r) => (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{r.name[0]}</div>
      <div>
        <div className="text-sm font-medium">{r.name}</div>
        <div className="text-[11px] text-muted-foreground font-mono">{r.phone.slice(0,3)}****{r.phone.slice(-4)}</div>
      </div>
    </div>
  )},
  { key: "sourceEnterprise", title: "所属企业", width: 140 },
  { key: "lifecycle", title: "生命周期", width: 90, render: (v: string) => {
    const m = END_CUSTOMER_LIFECYCLE_MAP[v as keyof typeof END_CUSTOMER_LIFECYCLE_MAP];
    return m ? <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${m.color}`}>{m.label}</span> : v;
  }},
  { key: "followStatus", title: "跟进状态", width: 80, render: (v: string) => {
    const m = FOLLOW_STATUS_MAP[v as keyof typeof FOLLOW_STATUS_MAP];
    return m ? <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${m.color}`}>{m.label}</span> : v;
  }},
  { key: "assignedStaff", title: "负责人", width: 90 },
  { key: "intentLevel", title: "意向", width: 70, render: (v: string) => {
    const map = { high: { l: "高", c: "text-emerald-600" }, medium: { l: "中", c: "text-amber-600" }, low: { l: "低", c: "text-muted-foreground" } };
    const m = map[v as keyof typeof map] || { l: v, c: "" };
    return <span className={`text-sm font-medium ${m.c}`}>{m.l}</span>;
  }},
  { key: "lastFollowAt", title: "最近跟进", width: 100 },
  { key: "createdAt", title: "录入时间", width: 100 },
  { key: "tags", title: "标签", width: 140, render: (v: string[]) => (
    <div className="flex flex-wrap gap-1">{v.slice(0, 2).map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-primary/10 text-primary">{t}</span>)}{v.length > 2 && <span className="text-[11px] text-muted-foreground">+{v.length-2}</span>}</div>
  )},
];

const TABS = [
  { key: "designer" as const, label: "个人设计师", icon: UserCircle },
  { key: "end_customer" as const, label: "企业下游客户", icon: Building2 },
];

export default function CustomerList() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initTab = params.get("tab") === "enterprise" ? "end_customer" : "designer";
  const [tab, setTab] = useState<TabKey>(initTab);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    if (tab === "designer") {
      return DESIGNERS.filter(d => {
        const kw = filters.keyword?.toLowerCase();
        if (kw && !d.name.toLowerCase().includes(kw) && !d.phone.includes(kw)) return false;
        if (filters.lifecycle && d.lifecycle !== filters.lifecycle) return false;
        if (filters.package && d.currentPackage !== filters.package) return false;
        if (filters.source && d.source !== filters.source) return false;
        return true;
      });
    }
    return END_CUSTOMERS.filter(c => {
      const kw = filters.keyword?.toLowerCase();
      if (kw && !c.name.toLowerCase().includes(kw) && !c.phone.includes(kw)) return false;
      if (filters.enterprise && c.sourceEnterprise !== filters.enterprise) return false;
      if (filters.lifecycle && c.lifecycle !== filters.lifecycle) return false;
      if (filters.followStatus && c.followStatus !== filters.followStatus) return false;
      return true;
    });
  }, [tab, filters]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleFilter = useCallback((key: string, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  }, []);

  const designerActions: ActionItem<Designer>[] = [
    { label: "查看", onClick: (r) => navigate(`/customer/designer/detail/${r.id}`) },
    { label: "赠送权益", onClick: (r) => toast.success(`已为 ${r.name} 创建权益赠送单`) },
    { label: "发送消息", onClick: (r) => toast.success(`已向 ${r.name} 发送消息`) },
    { label: "添加标签", onClick: (r) => toast.success(`标签已更新`) },
  ];

  const ecActions: ActionItem<EndCustomer>[] = [
    { label: "查看", onClick: (r) => navigate(`/customer/end-customer/detail/${r.id}`) },
    { label: "新增跟进", onClick: (r) => toast.success(`已为 ${r.name} 新增跟进记录`) },
    { label: "编辑", onClick: (r) => navigate(`/customer/create?mode=edit&id=${r.id}&type=end_customer`) },
  ];

  return (
    <div>
      <PageHeader
        title={tab === "designer" ? "个人设计师" : "企业下游客户"}
        subtitle={`共 ${filtered.length} 条记录`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("导出成功")}>
              <Download className="h-4 w-4 mr-1" />导出
            </Button>
            {tab === "end_customer" && (
              <Button size="sm" onClick={() => navigate("/customer/create?type=end_customer")}>
                <Plus className="h-4 w-4 mr-1" />录入客户
              </Button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border/60">
        {TABS.map(t => {
          const count = t.key === "designer" ? DESIGNERS.length : END_CUSTOMERS.length;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFilters({}); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <FilterBar
        fields={tab === "designer" ? designerFilters : ecFilters}
        values={filters}
        onChange={handleFilter}
        onSearch={() => setPage(1)}
        onReset={() => { setFilters({}); setPage(1); }}
      />

      <AdminTable
        columns={tab === "designer" ? designerCols as TableColumn<any>[] : ecCols as TableColumn<any>[]}
        data={paged}
        actions={tab === "designer" ? designerActions as ActionItem<any>[] : ecActions as ActionItem<any>[]}
        rowKey={(r: any) => r.id}
      />

      <Pagination current={page} total={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
}
