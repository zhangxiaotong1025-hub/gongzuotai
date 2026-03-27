import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Download, Tag } from "lucide-react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  logo: string;
  country: string;
  ownerType: "own" | "agent";
  ownerEnterprise: string;
  categories: string[];
  seriesCount: number;
  productCount: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

const COUNTRIES = ["中国", "美国", "日本", "韩国", "德国", "意大利", "法国", "英国"];
const CATEGORIES = ["瓷砖", "卫浴", "地板", "涂料", "灯具", "家具", "橱柜", "门窗", "五金", "墙纸"];
const BRAND_NAMES = [
  "马可波罗", "东鹏瓷砖", "诺贝尔瓷砖", "蒙娜丽莎", "冠珠陶瓷", "新中源陶瓷",
  "箭牌卫浴", "九牧卫浴", "恒洁卫浴", "TOTO", "科勒", "圣象地板",
  "大自然地板", "德尔地板", "欧派家居", "索菲亚", "顾家家居", "全友家居",
];
const ENTERPRISES = [
  "居然设计家总部", "居然之家北四环店", "居然之家丽泽店",
  "欧派家居集团", "索菲亚家居", "尚品宅配",
];

function randomPick<T>(arr: T[], count?: number): T[] {
  const c = count || Math.ceil(Math.random() * arr.length);
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(c, arr.length));
}

const MOCK_BRANDS: Brand[] = BRAND_NAMES.map((name, i) => ({
  id: `BRD${String(i + 1).padStart(3, "0")}`,
  name,
  logo: "🏷️",
  country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
  ownerType: Math.random() > 0.4 ? "own" : "agent",
  ownerEnterprise: ENTERPRISES[Math.floor(Math.random() * ENTERPRISES.length)],
  categories: randomPick(CATEGORIES, Math.floor(Math.random() * 3) + 1),
  seriesCount: Math.floor(Math.random() * 12) + 1,
  productCount: Math.floor(Math.random() * 500) + 10,
  status: Math.random() > 0.2 ? "active" : "inactive",
  createdAt: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  updatedAt: "2026-03-20",
}));

const FILTER_FIELDS: FilterField[] = [
  { key: "name", label: "品牌名称", type: "input", placeholder: "搜索品牌名称" },
  { key: "country", label: "国家", type: "select", options: COUNTRIES.map((c) => ({ label: c, value: c })) },
  { key: "ownerType", label: "品牌关系", type: "select", options: [{ label: "拥有", value: "own" }, { label: "代理", value: "agent" }] },
  { key: "category", label: "经营品类", type: "select", options: CATEGORIES.map((c) => ({ label: c, value: c })) },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }] },
];

export default function BrandList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filtered = MOCK_BRANDS.filter((b) => {
    if (filters.name && !b.name.includes(filters.name)) return false;
    if (filters.country && b.country !== filters.country) return false;
    if (filters.ownerType && b.ownerType !== filters.ownerType) return false;
    if (filters.category && !b.categories.includes(filters.category)) return false;
    if (filters.status && b.status !== filters.status) return false;
    return true;
  });

  const total = filtered.length;
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const columns: TableColumn<Brand>[] = [
    { key: "id", title: "品牌ID", width: 100 },
    {
      key: "name", title: "品牌名称", minWidth: 180,
      render: (_, r) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/8 text-lg shrink-0">{r.logo}</div>
          <span className="text-foreground font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "country", title: "国家", width: 80 },
    {
      key: "ownerType", title: "品牌关系", width: 90,
      render: (_, r) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${r.ownerType === "own" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
          {r.ownerType === "own" ? "拥有" : "代理"}
        </span>
      ),
    },
    { key: "ownerEnterprise", title: "所属企业", minWidth: 160 },
    {
      key: "categories", title: "经营品类", minWidth: 180,
      render: (_, r) => (
        <div className="flex flex-wrap gap-1">
          {r.categories.map((c) => (
            <span key={c} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] bg-muted text-muted-foreground">{c}</span>
          ))}
        </div>
      ),
    },
    { key: "seriesCount", title: "系列数", width: 80, align: "center" },
    { key: "productCount", title: "商品数", width: 80, align: "center" },
    {
      key: "status", title: "状态", width: 80,
      render: (_, r) => (
        <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${r.status === "active" ? "text-emerald-600" : "text-muted-foreground"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${r.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
          {r.status === "active" ? "启用" : "停用"}
        </span>
      ),
    },
    { key: "createdAt", title: "创建时间", width: 110 },
  ];

  const actions: ActionItem<Brand>[] = [
    { label: "查看", onClick: (r) => navigate(`/brand/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => navigate(`/brand/create?mode=edit&id=${r.id}`) },
    {
      label: (r) => r.status === "active" ? "停用" : "启用",
      onClick: (r) => toast.success(`品牌「${r.name}」已${r.status === "active" ? "停用" : "启用"}`),
      confirm: { title: "确认操作", description: "确定要更改该品牌的状态吗？" },
    },
    {
      label: "删除", danger: true,
      onClick: (r) => toast.success(`品牌「${r.name}」已删除`),
      confirm: { title: "确认删除", description: "删除后无法恢复，确定要删除该品牌吗？" },
    },
  ];

  const handleChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-0">
      <PageHeader
        title="品牌管理"
        subtitle={`共 ${total} 个品牌`}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn-ghost"><Download className="h-3.5 w-3.5" />导出</button>
            <button className="btn-primary" onClick={() => navigate("/brand/create")}>
              <Plus className="h-3.5 w-3.5" />新建品牌
            </button>
          </div>
        }
      />

      <FilterBar
        fields={FILTER_FIELDS}
        values={filters}
        onChange={handleChange}
        onSearch={() => setPage(1)}
        onReset={() => { setFilters({}); setPage(1); }}
      />

      <AdminTable columns={columns} data={pageData} rowKey={(r) => r.id} actions={actions} />

      <Pagination current={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={() => {}} />
    </div>
  );
}
