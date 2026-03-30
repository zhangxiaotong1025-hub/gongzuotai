import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, ChevronRight, Star, Box } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { FilterBar, FilterField } from "@/components/admin/FilterBar";
import { AdminTable, TableColumn, ActionItem } from "@/components/admin/AdminTable";
import { Pagination } from "@/components/admin/Pagination";
import { modelSpuData, type ModelSpu, type ModelSku, type ShelfStatus, type LibraryType, type AuditStatus } from "@/data/model";

type ListRow = ModelSpu & { _children?: ModelSku[] };

const libraryLabel: Record<LibraryType, string> = { PUBLIC: "公有库", BRAND: "品牌库", PRIVATE: "私有库" };
const libraryBadge: Record<LibraryType, string> = { PUBLIC: "badge-info", BRAND: "badge-warning", PRIVATE: "badge-muted" };
const shelfLabel: Record<ShelfStatus, string> = { PENDING: "待上架", ON_SHELF: "已上架", OFF_SHELF: "已下架" };
const shelfBadge: Record<ShelfStatus, string> = { PENDING: "badge-warning", ON_SHELF: "badge-active", OFF_SHELF: "badge-inactive" };
const auditLabel: Record<AuditStatus, string> = { PENDING: "待审核", APPROVED: "已通过", REJECTED: "已拒绝", NONE: "—" };
const auditBadge: Record<AuditStatus, string> = { PENDING: "badge-warning", APPROVED: "badge-active", REJECTED: "badge-danger", NONE: "badge-muted" };

const filterFields: FilterField[] = [
  { key: "keyword", label: "关键词", type: "input", placeholder: "模型名称/编码" },
  { key: "libraryType", label: "库类型", type: "select", options: [{ label: "公有库", value: "PUBLIC" }, { label: "品牌库", value: "BRAND" }, { label: "私有库", value: "PRIVATE" }] },
  { key: "status", label: "上架状态", type: "select", options: [{ label: "已上架", value: "ON_SHELF" }, { label: "已下架", value: "OFF_SHELF" }, { label: "待上架", value: "PENDING" }] },
  { key: "auditStatus", label: "审核状态", type: "select", options: [{ label: "待审核", value: "PENDING" }, { label: "已通过", value: "APPROVED" }, { label: "已拒绝", value: "REJECTED" }] },
  { key: "format", label: "文件格式", type: "select", options: [{ label: ".max", value: ".max" }, { label: ".fbx", value: ".fbx" }, { label: ".gltf", value: ".gltf" }] },
  { key: "brand", label: "品牌", type: "input", placeholder: "品牌名称" },
];

export default function ModelList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const data = useMemo(() => {
    return modelSpuData.map<ListRow>((spu) => ({
      ...spu,
      _children: spu.skus,
    }));
  }, []);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    return `${(bytes / 1048576).toFixed(0)} MB`;
  };

  // Build flat rows for two-level display
  const flatRows = useMemo(() => {
    const rows: Array<{ type: "spu"; data: ModelSpu } | { type: "sku"; data: ModelSku; parentSpu: ModelSpu }> = [];
    for (const spu of data) {
      rows.push({ type: "spu", data: spu });
      if (expandedKeys.has(spu.id)) {
        for (const sku of spu.skus) {
          rows.push({ type: "sku", data: sku, parentSpu: spu });
        }
      }
    }
    return rows;
  }, [data, expandedKeys]);

  const columns: TableColumn<(typeof flatRows)[0]>[] = [
    {
      key: "name", title: "模型信息", minWidth: 280,
      render: (_v, row) => {
        if (row.type === "spu") {
          const spu = row.data as ModelSpu;
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
                <Box className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{spu.spuName}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{spu.spuCode}</div>
              </div>
            </div>
          );
        }
        const sku = row.data as ModelSku;
        return (
          <div className="flex items-center gap-3 pl-[52px]">
            <div className="w-8 h-8 rounded bg-muted/40 flex items-center justify-center shrink-0">
              <Box className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <div className="min-w-0">
              <div className="text-foreground truncate flex items-center gap-1.5">
                {sku.skuName}
                {sku.isDefault && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0 rounded-full" style={{ background: "hsl(var(--warning) / 0.1)", color: "hsl(var(--warning))" }}>
                    <Star className="h-2.5 w-2.5" />默认
                  </span>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">{sku.skuCode}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "params", title: "参数标签", minWidth: 200,
      render: (_v, row) => {
        if (row.type === "spu") return <span className="text-muted-foreground text-[12px]">{(row.data as ModelSpu).skuCount} 个SKU</span>;
        const sku = row.data as ModelSku;
        return (
          <div className="flex flex-wrap gap-1">
            {Object.entries(sku.paramSnapshot).map(([k, v]) => (
              <span key={k} className="badge-product">{v}</span>
            ))}
          </div>
        );
      },
    },
    {
      key: "libraryType", title: "库类型", minWidth: 90,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        const spu = row.data as ModelSpu;
        return <span className={libraryBadge[spu.usageScope]}>{libraryLabel[spu.usageScope]}</span>;
      },
    },
    {
      key: "format", title: "格式", minWidth: 70,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        const spu = row.data as ModelSpu;
        return <span className="text-muted-foreground font-mono text-[12px]">{spu.sourceFileFormat}</span>;
      },
    },
    {
      key: "category", title: "分类", minWidth: 80,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        return <span>{(row.data as ModelSpu).backendCategoryName}</span>;
      },
    },
    {
      key: "brand", title: "品牌", minWidth: 90,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        return <span>{(row.data as ModelSpu).brandName}</span>;
      },
    },
    {
      key: "auditStatus", title: "审核状态", minWidth: 90,
      render: (_v, row) => {
        if (row.type === "sku") return null;
        const spu = row.data as ModelSpu;
        if (spu.publicStatus === "NONE") return <span className="text-muted-foreground/50">—</span>;
        return <span className={auditBadge[spu.publicStatus]}>{auditLabel[spu.publicStatus]}</span>;
      },
    },
    {
      key: "status", title: "上架状态", minWidth: 90,
      render: (_v, row) => {
        const status = row.type === "spu" ? (row.data as ModelSpu).status : (row.data as ModelSku).status;
        return <span className={shelfBadge[status]}>{shelfLabel[status]}</span>;
      },
    },
    {
      key: "createdAt", title: "创建时间", minWidth: 110,
      render: (_v, row) => <span className="text-muted-foreground">{row.data.createdAt}</span>,
    },
  ];

  const actions: ActionItem<(typeof flatRows)[0]>[] = [
    {
      label: "查看",
      onClick: (row) => {
        if (row.type === "spu") navigate(`/model/detail/${row.data.id}`);
        else navigate(`/model/detail/${(row as any).parentSpu.id}?tab=sku`);
      },
    },
    {
      label: (row) => {
        const status = row.type === "spu" ? (row.data as ModelSpu).status : (row.data as ModelSku).status;
        return status === "ON_SHELF" ? "下架" : "上架";
      },
      onClick: () => {},
      visible: (row) => {
        if (row.type === "spu") return (row.data as ModelSpu).publicStatus !== "PENDING";
        return true;
      },
      confirm: { title: "确认操作？", description: "该操作将影响客户端的模型可见性" },
    },
    {
      label: "审核",
      onClick: () => {},
      visible: (row) => row.type === "spu" && (row.data as ModelSpu).publicStatus === "PENDING",
    },
    {
      label: "删除",
      onClick: () => {},
      danger: true,
      confirm: { title: "确认删除？", description: "删除后数据不可恢复，有商品引用的模型不可删除。" },
    },
  ];

  return (
    <div>
      <PageHeader
        title="模型管理"
        subtitle={`共 ${modelSpuData.length} 个模型`}
        actions={
          <button className="btn-primary" onClick={() => navigate("/model/create")}>
            <Upload className="h-3.5 w-3.5" />上传模型
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
      <Pagination current={page} total={modelSpuData.length} pageSize={10} onChange={setPage} />
    </div>
  );
}
