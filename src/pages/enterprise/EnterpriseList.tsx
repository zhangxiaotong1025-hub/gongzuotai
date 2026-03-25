import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Search,
} from "lucide-react";

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
  level?: number;
}

const mockData: Enterprise[] = [
  {
    id: "ENT001",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "active",
    products: ["国内3D", "国际3D"],
    subsidiaries: 20,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "王王",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [
      {
        id: "ENT001-1",
        name: "上海自然博物馆有限公司",
        type: "品牌商",
        status: "inactive",
        products: ["国内3D"],
        subsidiaries: 6,
        staff: 30,
        createdAt: "2020-1-25 10:10",
        creator: "王王",
        updatedAt: "2026-1-25 10:10",
        note: "稳定续费客户，主要销售硬装瓷砖",
      },
      {
        id: "ENT001-2",
        name: "上海自然博物馆有限公司",
        type: "品牌商",
        status: "active",
        products: ["国内3D"],
        subsidiaries: 20,
        staff: 30,
        createdAt: "2020-1-25 10:10",
        creator: "王王",
        updatedAt: "2026-1-25 10:10",
        note: "稳定续费客户，主要销售硬装瓷砖",
      },
      {
        id: "ENT001-3",
        name: "上海自然博物馆有限公司",
        type: "品牌商",
        status: "inactive",
        products: ["国际3D"],
        subsidiaries: 20,
        staff: 30,
        createdAt: "2020-1-25 10:10",
        creator: "",
        updatedAt: "2026-1-25 10:10",
        note: "稳定续费客户，主要销售硬装瓷砖",
      },
      {
        id: "ENT001-4",
        name: "上海自然博物馆有限公司",
        type: "品牌商",
        status: "active",
        products: ["国际3D"],
        subsidiaries: 20,
        staff: 30,
        createdAt: "2020-1-25 10:10",
        creator: "",
        updatedAt: "2026-1-25 10:10",
        note: "稳定续费客户，主要销售硬装瓷砖",
      },
    ],
  },
  {
    id: "ENT002",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "inactive",
    products: ["国内3D"],
    subsidiaries: 14,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "王王",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [],
  },
  {
    id: "ENT003",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "active",
    products: ["国内3D", "国际3D"],
    subsidiaries: 20,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "王王",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [],
  },
  {
    id: "ENT004",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "active",
    products: ["国内3D", "国际3D"],
    subsidiaries: 20,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "王王",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [],
  },
  {
    id: "ENT005",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "active",
    products: ["国内3D", "国际3D"],
    subsidiaries: 20,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "王王",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [],
  },
  {
    id: "ENT006",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "active",
    products: ["国内3D", "国际3D"],
    subsidiaries: 20,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [],
  },
  {
    id: "ENT007",
    name: "上海自然博物馆有限公司",
    type: "品牌商",
    status: "active",
    products: ["国内3D", "国际3D"],
    subsidiaries: 20,
    staff: 30,
    createdAt: "2020-1-25 10:10",
    creator: "王王",
    updatedAt: "2026-1-25 10:10",
    note: "稳定续费客户，主要销售硬装瓷砖",
    children: [],
  },
];

function EnterpriseRow({
  item,
  level = 0,
  expanded,
  onToggle,
}: {
  item: Enterprise;
  level?: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expanded.has(item.id);
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors">
        {/* Name with tree indent */}
        <td className="px-3 py-3 border-b">
          <div className="flex items-center" style={{ paddingLeft: level * 24 }}>
            {hasChildren ? (
              <button
                onClick={() => onToggle(item.id)}
                className="mr-1.5 p-0.5 rounded hover:bg-muted text-muted-foreground"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
            ) : (
              <span className="w-5 mr-1.5" />
            )}
            <span className="text-sm text-foreground">{item.name}</span>
          </div>
        </td>
        {/* Type */}
        <td className="px-3 py-3 border-b">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-foreground">
            {item.type}
          </span>
        </td>
        {/* Status */}
        <td className="px-3 py-3 border-b">
          <span className={item.status === "active" ? "badge-active" : "badge-inactive"}>
            {item.status === "active" ? "启用" : "停用"}
          </span>
        </td>
        {/* Products */}
        <td className="px-3 py-3 border-b">
          <div className="flex gap-1.5">
            {item.products.map((p) => (
              <span key={p} className="badge-product">{p}</span>
            ))}
          </div>
        </td>
        {/* Subsidiaries */}
        <td className="px-3 py-3 border-b text-center">
          <span className="text-primary cursor-pointer hover:underline">{item.subsidiaries}</span>
        </td>
        {/* Staff */}
        <td className="px-3 py-3 border-b text-center">
          <span className="text-primary cursor-pointer hover:underline">{item.staff}</span>
        </td>
        {/* Created */}
        <td className="px-3 py-3 border-b text-muted-foreground text-xs">{item.createdAt}</td>
        {/* Creator */}
        <td className="px-3 py-3 border-b text-sm">{item.creator}</td>
        {/* Updated */}
        <td className="px-3 py-3 border-b text-muted-foreground text-xs">{item.updatedAt}</td>
        {/* Note */}
        <td className="px-3 py-3 border-b text-muted-foreground text-xs max-w-[200px] truncate">
          {item.note}
        </td>
        {/* Actions */}
        <td className="px-3 py-3 border-b">
          <div className="flex items-center gap-2 relative">
            <button className="text-primary text-sm hover:underline">查看</button>
            {level === 0 && (
              <button className="text-primary text-sm hover:underline">编辑</button>
            )}
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <div className="absolute right-0 top-full mt-1 bg-card border rounded-md shadow-lg py-1 z-20 min-w-[120px]">
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                    启用/停用
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                    设置管理员
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                    新建子企业
                  </button>
                  <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors">
                    权益配置
                  </button>
                </div>
              </>
            )}
          </div>
        </td>
      </tr>
      {/* Children */}
      {isExpanded &&
        item.children?.map((child) => (
          <EnterpriseRow
            key={child.id}
            item={child}
            level={level + 1}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </>
  );
}

export default function EnterpriseList() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["ENT001"]));
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 68;
  const totalItems = 1200;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const paginationPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3, "...", totalPages - 1, totalPages);
    }
    return pages;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-bold text-foreground">企业管理</h1>
          <span className="text-sm text-muted-foreground">共{totalItems}个企业</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 text-sm border rounded-md hover:bg-muted transition-colors text-foreground">
            次级按钮
          </button>
          <button className="h-8 px-4 text-sm border rounded-md hover:bg-muted transition-colors text-foreground">
            次级按钮
          </button>
          <button className="h-8 px-4 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            新建企业
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">企业名称</label>
            <input type="text" placeholder="请输入" className="filter-input w-36" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">企业ID</label>
            <input type="text" placeholder="请输入" className="filter-input w-28" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">企业类型</label>
            <select className="filter-select w-28">
              <option value="">请选择</option>
              <option value="brand">品牌商</option>
              <option value="dealer">经销商</option>
              <option value="decoration">装企</option>
              <option value="mall">卖场</option>
              <option value="store">门店</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">企业类型</label>
            <select className="filter-select w-28">
              <option value="">请选择</option>
            </select>
          </div>
          <button className="text-sm text-primary hover:underline">更多</button>
          <button className="h-8 px-5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            查询
          </button>
          <button className="h-8 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            重置
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="min-w-[240px]">企业名称</th>
              <th>企业类型</th>
              <th>状态</th>
              <th>启用产品</th>
              <th className="text-center">子公司</th>
              <th className="text-center">人员</th>
              <th>创建时间</th>
              <th>创建人</th>
              <th>更新时间</th>
              <th>备注</th>
              <th className="min-w-[140px]">操作</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item) => (
              <EnterpriseRow
                key={item.id}
                item={item}
                expanded={expanded}
                onToggle={toggleExpand}
              />
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t">
          <select className="filter-select text-xs h-7 w-24">
            <option>100条/页</option>
            <option>50条/页</option>
            <option>20条/页</option>
          </select>
          <button
            className="w-7 h-7 flex items-center justify-center rounded border text-muted-foreground hover:bg-muted disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            ‹
          </button>
          {paginationPages().map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="text-muted-foreground text-xs px-1">…</span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors ${
                  currentPage === p
                    ? "bg-primary text-primary-foreground"
                    : "border text-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            className="w-7 h-7 flex items-center justify-center rounded border text-muted-foreground hover:bg-muted disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          >
            ›
          </button>
          <span className="text-xs text-muted-foreground ml-1">前往</span>
          <input
            type="text"
            className="filter-input w-12 h-7 text-xs text-center"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= totalPages) setCurrentPage(val);
              }
            }}
          />
          <span className="text-xs text-muted-foreground">页</span>
        </div>
      </div>
    </div>
  );
}
