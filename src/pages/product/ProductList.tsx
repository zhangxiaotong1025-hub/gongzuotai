import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, ShoppingBag, Tag, Link2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, FilterField } from "@/components/admin/FilterBar";
import { AdminTable, TableColumn, ActionItem } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { productSpuData, type ProductSpu, type ProductSku, type ProductShelfStatus, type ProductAuditStatus, type DataType as PDataType } from "@/data/product";

const shelfLabel: Record<ProductShelfStatus, string> = { ON_SHELF: "已上架", OFF_SHELF: "已下架" };
const shelfBadge: Record<ProductShelfStatus, string> = { ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };
const auditLabel: Record<ProductAuditStatus, string> = { PENDING: "待审核", APPROVED: "已通过", REJECTED: "已拒绝", NONE: "—" };
const auditBadge: Record<ProductAuditStatus, string> = { PENDING: "badge-warning", APPROVED: "badge-active", REJECTED: "badge-danger", NONE: "badge-muted" };
const dataTypeLabel: Record<PDataType, string> = { MASTER: "主数据", SUB: "子数据" };
const dataTypeBadge: Record<PDataType, string> = { MASTER: "badge-info", SUB: "badge-muted" };

const filterFields: FilterField[] = [
  { key: "keyword", label: "关键词", type: "input", placeholder: "商品名称/编码" },
  { key: "libraryType", label: "库类型", type: "select", options: [{ label: "私有库", value: "PRIVATE" }, { label: "公有库", value: "PUBLIC" }] },
  { key: "dataType", label: "数据类型", type: "select", options: [{ label: "主数据", value: "MASTER" }, { label: "子数据", value: "SUB" }] },
  { key: "status", label: "上下架", type: "select", options: [{ label: "已上架", value: "ON_SHELF" }, { label: "已下架", value: "OFF_SHELF" }] },
  { key: "auditStatus", label: "审核状态", type: "select", options: [{ label: "待审核", value: "PENDING" }, { label: "已通过", value: "APPROVED" }, { label: "已拒绝", value: "REJECTED" }] },
  { key: "brand", label: "品牌", type: "input", placeholder: "品牌名称" },
];

type FlatRow = { type: "spu"; data: ProductSpu } | { type: "sku"; data: ProductSku; parentSpu: ProductSpu };

export default function ProductList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const flatRows = useMemo<FlatRow[]>(() => {
    const rows: FlatRow[] = [];
    for (const spu of productSpuData) {
      rows.push({ type: "spu", data: spu });
      if (expandedKeys.has(spu.id)) {
        for (const sku of spu.skus) {
          rows.push({ type: "sku", data: sku, parentSpu: spu });
        }
      }
    }
    return rows;
  }, [expandedKeys]);

  const formatPrice = (n: number) => `¥${n.toLocaleString()}`;

  const columns: TableColumn<FlatRow>[] = [
    {
      key: "name", title: "商品信息", minWidth: 300,
      render: (_v, row) => {
        if (row.type === "spu") {
          const spu = row.data as ProductSpu;
          const isExpanded = expandedKeys.has(spu.id);
          return (
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(spu.id); }}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground transition-colors shrink-0"
              >
                <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-150 ${isExpanded ? "rotate-90" : ""}`} />
              </button>
              <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate flex items-center gap-1.5">
                  {spu.productSpuName}
                  <span className={dataTypeBadge[spu.dataType]}>{dataTypeLabel[spu.dataType]}</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">{spu.productSpuCode}</div>
              </div>
            </div>
          );
        }
        const sku = row.data as ProductSku;
        return (
          <div className="flex items-center gap-3 pl-[52px]">
            <div className="w-8 h-8 rounded bg-muted/40 flex items-center justify-center shrink-0">
              <Tag className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate">{sku.modelSkuName}</div>
              <div className="text-[11px] text-muted-foreground font-mono">{sku.productSkuCode}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "model", title: "关联模型", minWidth: 130,
      render: (_v, row) => {
        if (row.type === "spu") {
          const spu = row.data as ProductSpu;
          return (
            <span className="inline-flex items-center gap-1 text-[12px] text-primary cursor-pointer hover:underline">
              <Link2 className="h-3 w-3" />关联 {spu.relatedModelCount} 个模型
            </span>
          );
        }
        const sku = row.data as ProductSku;
        return <span className="text-[12px] text-muted-foreground">{sku.modelSpuName}</span>;
      },
    },
    {
      key: "params", title: "参数/价格", minWidth: 200,
      render: (_v, row) => {
        if (row.type === "spu") {
          const spu = row.data as ProductSpu;
          return (
            <div>
              <span className="text-foreground font-medium">{formatPrice(spu.priceMin)}</span>
              {spu.priceMin !== spu.priceMax && <span className="text-muted-foreground"> ~ {formatPrice(spu.priceMax)}</span>}
            </div>
          );
        }
        const sku = row.data as ProductSku;
        return (
          <div className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">{formatPrice(sku.price)}</span>
            {sku.originalPrice && <span className="text-muted-foreground/50 line-through text-[11px]">{formatPrice(sku.originalPrice)}</span>}
          </div>
        );
      },
    },
    {
      key: "brand", title: "品牌", minWidth: 90,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        return <span>{(row.data as ProductSpu).brandName}</span>;
      },
    },
    {
      key: "stock", title: "库存", minWidth: 70,
      render: (_v, row) => {
        if (row.type === "spu") return <span className="text-muted-foreground text-[12px]">{(row.data as ProductSpu).skuCount} SKU</span>;
        const sku = row.data as ProductSku;
        return (
          <span className={sku.stockQuantity <= 10 ? "text-destructive font-medium" : "text-foreground"}>
            {sku.stockQuantity}
          </span>
        );
      },
    },
    {
      key: "auditStatus", title: "审核", minWidth: 80,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        const spu = row.data as ProductSpu;
        if (spu.publicStatus === "NONE") return <span className="text-muted-foreground/50">—</span>;
        return <span className={auditBadge[spu.publicStatus]}>{auditLabel[spu.publicStatus]}</span>;
      },
    },
    {
      key: "status", title: "上下架", minWidth: 80,
      render: (_v, row) => {
        const status = row.type === "spu" ? (row.data as ProductSpu).status : (row.data as ProductSku).status;
        return <span className={shelfBadge[status]}>{shelfLabel[status]}</span>;
      },
    },
    {
      key: "createdAt", title: "创建时间", minWidth: 110,
      render: (_v, row) => <span className="text-muted-foreground">{row.data.createdAt}</span>,
    },
  ];

  const actions: ActionItem<FlatRow>[] = [
    {
      label: "查看",
      onClick: (row) => {
        if (row.type === "spu") navigate(`/product/detail/${row.data.id}`);
        else navigate(`/product/detail/${(row as any).parentSpu.id}?tab=sku`);
      },
    },
    {
      label: (row) => {
        const status = row.type === "spu" ? (row.data as ProductSpu).status : (row.data as ProductSku).status;
        return status === "ON_SHELF" ? "下架" : "上架";
      },
      onClick: () => {},
      confirm: { title: "确认操作？", description: "该操作将影响商品在前台的可见性" },
    },
    {
      label: "编辑",
      onClick: (row) => {
        if (row.type === "spu") navigate(`/product/create?edit=${row.data.id}`);
      },
      visible: (row) => row.type === "spu" && (row.data as ProductSpu).dataType === "MASTER",
    },
    {
      label: "删除",
      onClick: () => {},
      danger: true,
      visible: (row) => row.type === "spu",
      confirm: { title: "确认删除？", description: "有子数据引用的商品不可删除" },
    },
  ];

  return (
    <div>
      <PageHeader
        title="商品管理"
        subtitle={`共 ${productSpuData.length} 个商品`}
        actions={
          <button className="btn-primary" onClick={() => navigate("/product/create")}>
            <Plus className="h-3.5 w-3.5" />创建商品
          </button>
        }
      />
      <FilterBar
        fields={filterFields}
        values={filters}
        onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
        onSearch={() => setPage(1)}
        onReset={() => { setFilters({}); setPage(1); }}
      />
      <AdminTable
        columns={columns}
        data={flatRows}
        rowKey={(row) => row.data.id}
        actions={actions}
        maxVisibleActions={2}
        actionColumnWidth={200}
      />
      <Pagination current={page} total={productSpuData.length} pageSize={10} onPageChange={setPage} onPageSizeChange={() => {}} />
    </div>
  );
}
